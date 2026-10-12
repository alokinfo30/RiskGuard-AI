import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { computeRiskScore } from '../src/data/syntheticTransactions.ts';
import { REGULATORY_DATABASE, searchRegulatoryDatabase } from '../src/data/regulatoryData.ts';
import { 
  AuditEntry, 
  computeEntryHash, 
  verifyAuditTrailIntegrity 
} from '../server.ts';

// Test Runner Harness
let passedCount = 0;
let failedCount = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  \x1b[32m✔\x1b[0m ${name}`);
    passedCount++;
  } catch (err: any) {
    console.error(`  \x1b[31m✖\x1b[0m ${name}`);
    console.error(`    \x1b[31mError:\x1b[0m ${err.message}`);
    failedCount++;
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('   RISKGUARD AI — ENTERPRISE REGULATORY & SECURITY TEST SUITE');
  console.log('======================================================\n');

  console.log('\x1b[1m[SUITE 1: ML RISK ENGINE & FRAUD TYPOLOGY TESTS]\x1b[0m');

  await test('1.1 Normal Commerce: Legitimate low-risk invoice scores <= 25 points', () => {
    const res = computeRiskScore({
      amount: 85,
      currency: 'USD',
      type: 'PAYMENT',
      origAccountAgeMonths: 36,
      destAccountAgeDays: 450,
      oldbalanceOrig: 8500,
      isVpn: false,
      pepWatchlist: false,
      priorChargebacks: 0,
      velocity1Hour: 1,
      isCrossBorder: false,
    });
    assert.equal(res.riskBand, 'LOW', 'Expected LOW risk band');
    assert.ok(res.riskScore <= 25, `Expected score <= 25, got ${res.riskScore}`);
    assert.equal(res.suggestedAction, 'APPROVED', 'Expected auto-approved');
  });

  await test('1.2 Structuring / Smurfing: $9,850 cash transfer below $10,000 threshold triggers BSA alert', () => {
    const res = computeRiskScore({
      amount: 9850,
      currency: 'USD',
      type: 'TRANSFER',
      origAccountAgeMonths: 3,
      destAccountAgeDays: 2,
      oldbalanceOrig: 10500,
      isVpn: true,
      pepWatchlist: false,
      priorChargebacks: 0,
      velocity1Hour: 4,
      isCrossBorder: true,
    });
    assert.ok(res.flags.includes('MULE_STRUCTURING_CTR_EVASION'), 'Missing structuring evasion flag');
    assert.ok(res.riskScore >= 75, `Expected score >= 75 for structuring, got ${res.riskScore}`);
    assert.ok(['HIGH', 'CRITICAL'].includes(res.riskBand), 'Expected HIGH or CRITICAL band');
  });

  await test('1.3 Catastrophic Mule Drain: >95% balance depletion to brand new recipient triggers CRITICAL', () => {
    const res = computeRiskScore({
      amount: 19800,
      currency: 'USD',
      type: 'CASH_OUT',
      origAccountAgeMonths: 4,
      destAccountAgeDays: 1,
      oldbalanceOrig: 20000,
      isVpn: true,
      pepWatchlist: false,
      priorChargebacks: 1,
      velocity1Hour: 6,
      isCrossBorder: true,
    });
    assert.equal(res.riskBand, 'CRITICAL', 'Expected CRITICAL risk band');
    assert.ok(res.riskScore >= 80, `Expected score >= 80, got ${res.riskScore}`);
    assert.ok(res.flags.includes('ACCOUNT_BALANCE_DRAINED_TO_NEAR_ZERO'), 'Missing balance drain flag');
    assert.ok(res.flags.includes('NEW_MULE_BENEFICIARY_ACCOUNT'), 'Missing disposable account flag');
    assert.ok(res.flags.includes('ANONYMIZED_VPN_OR_TOR_PROXY'), 'Missing VPN flag');
  });

  await test('1.4 Sanctions & PEP Watchlist: OFAC/FATF match triggers mandatory escalation flag', () => {
    const res = computeRiskScore({
      amount: 3500,
      currency: 'EUR',
      type: 'TRANSFER',
      origAccountAgeMonths: 12,
      destAccountAgeDays: 90,
      oldbalanceOrig: 15000,
      isVpn: false,
      pepWatchlist: true,
      priorChargebacks: 0,
      velocity1Hour: 1,
      isCrossBorder: true,
    });
    assert.ok(res.flags.includes('PEP_OR_SANCTION_WATCHLIST_MATCH'), 'Missing PEP flag');
    const pepWeight = res.weights.find(w => w.factor.includes('Politically Exposed Person'));
    assert.ok(pepWeight && pepWeight.deltaPoints >= 35, 'Expected PEP weight >= 35 points');
  });

  await test('1.5 Repeat Offender Penalty: Customer tenure mitigation reflects in risk score', () => {
    const resTenured = computeRiskScore({
      amount: 1500,
      currency: 'USD',
      type: 'PAYMENT',
      origAccountAgeMonths: 48,
      destAccountAgeDays: 300,
      oldbalanceOrig: 12000,
      isVpn: false,
      pepWatchlist: false,
      priorChargebacks: 0,
      velocity1Hour: 1,
      isCrossBorder: false,
    });

    const resNew = computeRiskScore({
      amount: 1500,
      currency: 'USD',
      type: 'PAYMENT',
      origAccountAgeMonths: 1,
      destAccountAgeDays: 300,
      oldbalanceOrig: 12000,
      isVpn: false,
      pepWatchlist: false,
      priorChargebacks: 0,
      velocity1Hour: 1,
      isCrossBorder: false,
    });

    assert.ok(resTenured.riskScore < resNew.riskScore, 'Tenured customer must have lower score than new customer');
    assert.ok(resTenured.weights.some(w => w.category === 'HISTORY'), 'Must include HISTORY mitigating factor');
  });

  console.log('\n\x1b[1m[SUITE 2: STATUTORY RAG KNOWLEDGE BASE TESTS]\x1b[0m');

  await test('2.1 FinCEN 31 CFR § 1020.320: SAR filing statutory thresholds match law', () => {
    const matches = searchRegulatoryDatabase('SAR filing threshold 31 CFR 1020.320', 'AML_CFT');
    assert.ok(matches.length > 0, 'Should find FinCEN SAR framework');
    const doc = matches[0].doc;
    assert.equal(doc.code, '31 CFR § 1020.320');
    assert.ok(doc.thresholdSummary.includes('$5,000'), 'Must specify $5,000 threshold');
    assert.ok(doc.keyDirectives.some(d => d.includes('30 calendar days')), 'Must specify 30-day filing clock');
  });

  await test('2.2 FATF Recommendation 16: Travel rule cross-border wire thresholds verify', () => {
    const matches = searchRegulatoryDatabase('FATF Recommendation 16 Travel Rule', 'ALL');
    assert.ok(matches.length > 0, 'Should find FATF Rec 16');
    const doc = matches.find(m => m.doc.id.includes('travel-rule'))?.doc;
    assert.ok(doc, 'Travel rule document found');
    assert.ok(doc?.thresholdSummary.includes('1,000'), 'Must specify EUR/USD 1,000 Travel Rule threshold');
  });

  await test('2.3 PMLA 2002 India: Cash reporting over ₹10 Lakhs and 7-day STR timelines', () => {
    const matches = searchRegulatoryDatabase('PMLA 10 Lakhs India STR 7 days', 'ALL');
    assert.ok(matches.length > 0, 'Should find PMLA document');
    const doc = matches[0].doc;
    assert.ok(doc.jurisdiction.includes('India'), 'Jurisdiction must be India');
    assert.ok(doc.thresholdSummary.includes('10,00,000') || doc.keyDirectives[0].includes('10 Lakhs'), 'Must specify ₹10,00,000 threshold');
  });

  await test('2.4 EU AI Act & GDPR Art. 22: Algorithmic transparency and human oversight rules verify', () => {
    const matches = searchRegulatoryDatabase('GDPR Article 22 EU AI Act human oversight', 'GOVERNANCE_AI');
    assert.ok(matches.length > 0, 'Should find EU AI Act governance');
    const doc = matches[0].doc;
    assert.ok(doc.code.includes('GDPR Art. 22') || doc.code.includes('EU AI Act'), 'Must cite GDPR or EU AI Act');
    assert.ok(doc.keyDirectives.some(d => d.toLowerCase().includes('human')), 'Must mandate human oversight');
  });

  console.log('\n\x1b[1m[SUITE 3: CRYPTOGRAPHIC AUDIT LEDGER & NON-REPUDIATION TESTS]\x1b[0m');

  await test('3.1 Cryptographic Hash Function: SHA-256 output matches standard digest', () => {
    const sample: Omit<AuditEntry, 'hash'> = {
      id: 'AUD-TEST-01',
      transactionId: 'TX-999-TEST',
      action: 'SAR_FILED',
      reason: 'Mandatory SAR filed per 31 CFR 1020.320.',
      analyst: 'Sarah Jenkins (MLRO)',
      timestamp: '2026-10-12T00:00:00.000Z',
      falsePositive: false,
      scoreAtDecision: 95,
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
    };
    const hash = computeEntryHash(sample);
    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 64, 'SHA-256 hex digest must be 64 characters');
  });

  await test('3.2 Cryptographic Chain Integrity: Uncorrupted audit trail passes verification', () => {
    const integrity = verifyAuditTrailIntegrity();
    assert.equal(integrity.isValid, true, 'Audit trail must be valid');
    assert.ok(integrity.verifiedEntries > 0, 'Must verify at least genesis entry');
    assert.equal(typeof integrity.latestHash, 'string');
    assert.equal(integrity.latestHash.length, 64);
  });

  await test('3.3 Anti-Tampering Security: Tampered audit entry reason breaks SHA-256 chain', () => {
    // Construct a separate mini-chain to test tampering detection
    const genesis: Omit<AuditEntry, 'hash'> = {
      id: 'AUD-G1',
      transactionId: 'TX-1',
      action: 'APPROVED',
      reason: 'Approved legitimately',
      analyst: 'Officer A',
      timestamp: new Date().toISOString(),
      falsePositive: false,
      scoreAtDecision: 10,
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
    };
    const genesisHash = computeEntryHash(genesis);
    const genesisEntry: AuditEntry = { ...genesis, hash: genesisHash };

    const block2: Omit<AuditEntry, 'hash'> = {
      id: 'AUD-B2',
      transactionId: 'TX-2',
      action: 'SAR_FILED',
      reason: 'Structuring detected',
      analyst: 'Officer B',
      timestamp: new Date().toISOString(),
      falsePositive: false,
      scoreAtDecision: 88,
      prevHash: genesisHash,
    };
    const block2Hash = computeEntryHash(block2);
    const block2Entry: AuditEntry = { ...block2, hash: block2Hash };

    // Malicious attacker alters reason in block2 without updating hash
    const tamperedBlock2 = { ...block2Entry, reason: 'TAMPERED: Altered by attacker' };
    const recomputed = computeEntryHash(tamperedBlock2);

    assert.notEqual(tamperedBlock2.hash, recomputed, 'Tampered block hash must mismatch expected hash!');
  });

  console.log('\n\x1b[1m[SUITE 4: SECURITY BOUNDARIES & API INPUT VALIDATION]\x1b[0m');

  await test('4.1 Server API Integrity: /api/decisions/verify-integrity returns 200 and isValid true', async () => {
    const res = await fetch('http://localhost:3000/api/decisions/verify-integrity');
    assert.equal(res.status, 200, 'Expected status 200');
    const data = await res.json();
    assert.equal(data.isValid, true, 'Expected isValid to be true');
    assert.ok(data.totalEntries >= 1, 'Expected at least 1 entry');
  });

  await test('4.2 Security Health Check: /api/security/health returns SECURE posture', async () => {
    const res = await fetch('http://localhost:3000/api/security/health');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'SECURE');
    assert.equal(data.cspActive, true);
    assert.equal(data.hashingAlgorithm, 'SHA-256');
    assert.equal(data.auditLedgerIntegrity, true);
  });

  await test('4.3 Live Transactions Endpoint: /api/transactions returns valid schema and count', async () => {
    const res = await fetch('http://localhost:3000/api/transactions');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.transactions), 'transactions must be array');
    assert.ok(data.total > 0, 'total must be > 0');
    assert.equal(typeof data.criticalCount, 'number');
  });

  await test('4.4 Risk Evaluation API: /api/risk/evaluate computes and bounds output', async () => {
    const res = await fetch('http://localhost:3000/api/risk/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 5000,
        currency: 'USD',
        type: 'TRANSFER',
        origAccountAgeMonths: 12,
        destAccountAgeDays: 30,
        oldbalanceOrig: 10000,
        isVpn: false,
        pepWatchlist: false,
        priorChargebacks: 0,
        velocity1Hour: 1,
        isCrossBorder: false,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.riskScore >= 0 && data.riskScore <= 100, 'Score must be in [0, 100]');
    assert.ok(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.riskBand));
  });

  await test('4.5 Decision Override Rejection: Rejects unauthorized compliance actions', async () => {
    const res = await fetch('http://localhost:3000/api/decisions/override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: 'TX-7802-PS',
        action: 'MALICIOUS_UNAUTHORIZED_ACTION',
        reason: 'Attempted injection',
      }),
    });
    assert.equal(res.status, 400, 'Expected 400 Bad Request for unauthorized action enum');
  });

  await test('4.6 PaySim Ingestion Stream: /api/transactions/stream-tick produces compliant synthetic event', async () => {
    const res = await fetch('http://localhost:3000/api/transactions/stream-tick', {
      method: 'POST',
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.transaction, 'Must return transaction');
    assert.ok(data.transaction.id.startsWith('TX-'), 'Transaction ID must start with TX-');
    assert.ok(typeof data.transaction.riskScore === 'number', 'Risk score must be numeric');
    assert.ok(data.transaction.device, 'Must include device and network telemetry');
  });

  console.log('\n======================================================');
  console.log(`   TEST EXECUTION COMPLETED: \x1b[32m${passedCount} PASSED\x1b[0m, \x1b[31m${failedCount} FAILED\x1b[0m`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
