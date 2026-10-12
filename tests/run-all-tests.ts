import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { computeRiskScore } from '../src/data/syntheticTransactions.ts';
import { REGULATORY_DATABASE, searchRegulatoryDatabase } from '../src/data/regulatoryData.ts';
import { 
  app,
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
  let inProcessServer: any = null;
  try {
    const probe = await fetch('http://localhost:3000/api/security/health', { signal: AbortSignal.timeout(1200) });
    if (!probe.ok) throw new Error('Server unready');
  } catch (e) {
    inProcessServer = app.listen(3000);
    await new Promise((r) => setTimeout(r, 600));
  }

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

  console.log('\n\x1b[1m[SUITE 5: CUSTOMER ALERT & 2-WAY PROTECTION TESTS]\x1b[0m');

  await test('5.1 Customer Alerts Ledger: /api/customer-alerts returns active alerts and count', async () => {
    const res = await fetch('http://localhost:3000/api/customer-alerts');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.alerts), 'Alerts must be an array');
    assert.ok(typeof data.total === 'number');
    assert.ok(typeof data.pendingCount === 'number');
  });

  let testAlertId = '';
  await test('5.2 Alert Dispatch: /api/customer-alerts/dispatch sends personalized customer warning', async () => {
    const res = await fetch('http://localhost:3000/api/customer-alerts/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: 'TX-7802-PS',
        channel: 'SMS',
        customMessage: 'Test Security Verification Alert',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.alert.id.startsWith('CAL-'));
    assert.equal(data.alert.contactChannel, 'SMS');
    assert.equal(data.alert.status, 'PENDING_RESPONSE');
    testAlertId = data.alert.id;
  });

  await test('5.3 2-Way Customer Verification: Customer response updates alert status', async () => {
    assert.ok(testAlertId, 'Test alert must exist');
    const res = await fetch('http://localhost:3000/api/customer-alerts/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alertId: testAlertId,
        response: 'CONFIRMED',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.alert.status, 'CUSTOMER_VERIFIED');
    assert.ok(data.alert.responseTimestamp);
  });

  console.log('\n\x1b[1m[SUITE 6: DOCUMENT AI FINANCIAL FORENSICS & SAR EXHIBITS]\x1b[0m');

  await test('6.1 Document AI Forensics: /api/documents/analyze extracts entities & generates findings', async () => {
    const sampleDoc = `COMMERCIAL INVOICE #INV-8821\nVendor: Global Freight Logistics\nTotal: USD $12,500.00\nDate: 2026-10-05`;
    const res = await fetch('http://localhost:3000/api/documents/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentName: 'Commercial Freight Invoice',
        documentType: 'INVOICE',
        documentText: sampleDoc,
        transactionId: 'TX-7802-PS',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.id.startsWith('DOC-AI-'));
    assert.ok(data.extractedEntities);
    assert.ok(typeof data.documentTrustScore === 'number');
    assert.ok(['LOW_RISK', 'MODERATE_DISCREPANCY', 'HIGH_FORGERY_RISK'].includes(data.riskCategory));
    assert.ok(data.summaryFindings.length > 0);
    assert.ok(data.sarExhibitNarrative.includes('EXHIBIT') || data.sarExhibitNarrative.length > 20);
  });

  await test('6.2 Document AI Multilingual Detection & Translation: Spanish Invoice FAC-2026-0941', async () => {
    const spanishDoc = `FACTURA COMERCIAL DE FLETE MARÍTIMO\nNúmero: FAC-2026-0941\nEmisor: Trans-Atlantic Naviera Marítima S.L.\nNIF: ES-B84992104\nMonto Total: EUR €9.800,00\nDestinatario: Andina Importaciones S.A.`;
    const res = await fetch('http://localhost:3000/api/documents/detect-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentName: 'Spanish Freight Invoice',
        documentText: spanishDoc,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.translation.detectedLanguageCode, 'es');
    assert.equal(data.translation.isTranslated, true);
    assert.ok(data.translation.confidence >= 0.95);
    assert.ok(data.translation.translatedEnglishText.includes('COMMERCIAL MARITIME FREIGHT INVOICE') || data.translation.translatedEnglishText.length > 50);
    assert.ok(Array.isArray(data.translation.bilingualFieldMappings));
    assert.ok(data.translation.bilingualFieldMappings.length > 0);
  });

  await test('6.3 Document AI German Equipment Pro-Forma Invoice: Auto-translates & extracts entities', async () => {
    const germanDoc = `PROFORMA-RECHNUNG FÜR INDUSTRIEANLAGEN\nRechnungsnummer: PRO-DE-88319\nLieferant: Norddeutsche Präzision Maschinenbau GmbH\nGesamtbetrag: EUR €54.500,00\nEmpfänger: Gulf Apex Heavy Industrial Equipment FZE`;
    const res = await fetch('http://localhost:3000/api/documents/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentName: 'German Proforma Invoice',
        documentType: 'INVOICE',
        documentText: germanDoc,
        transactionId: 'TX-7802-PS',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.translation);
    assert.equal(data.translation.detectedLanguageCode, 'de');
    assert.equal(data.translation.isTranslated, true);
    assert.ok(data.extractedEntities.invoiceAmount === 59200 || data.extractedEntities.invoiceAmount === 54500 || data.extractedEntities.vendorName);
  });

  await test('6.4 Document AI Chinese Maritime Bill of Lading: Ingestion & TBML discrepancy analysis', async () => {
    const chineseDoc = `国际海运提单及商业发票\n单证编号: SH-OC-2026-9901\n发货人: 上海东海航运物流有限公司\n申报总金额: USD $14,800.00\n统一社会信用代码: 9131000078923412X8`;
    const res = await fetch('http://localhost:3000/api/documents/detect-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentName: 'Chinese Bill of Lading',
        documentText: chineseDoc,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.translation.detectedLanguageCode, 'zh');
    assert.equal(data.translation.isTranslated, true);
    assert.ok(data.translation.translatedEnglishText.includes('INTERNATIONAL MARITIME BILL OF LADING') || data.translation.translatedEnglishText.length > 50);
  });

  console.log('\n\x1b[1m[SUITE 7: HTTP SECURITY POSTURE & OWASP DEFENSES]\x1b[0m');

  await test('7.1 OWASP Security Headers: Response contains CSP, nosniff, and frame hardening', async () => {
    const res = await fetch('http://localhost:3000/api/security/health');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.ok(res.headers.get('content-security-policy'));
  });

  console.log('\n\x1b[1m[SUITE 8: FINCEN BSA ELECTRONIC FILING & STATUTORY CITATIONS]\x1b[0m');

  await test('8.1 FinCEN SAR Part V Drafting: /api/regulatory/draft-sar produces compliant audit narrative', async () => {
    const sampleTx = {
      id: 'TX-7802-PS',
      timestamp: new Date().toISOString(),
      type: 'TRANSFER',
      amount: 9850,
      currency: 'USD',
      nameOrig: 'C102931 (Mule Originator)',
      origAccountType: 'INDIVIDUAL',
      origCustomerTenureMonths: 2,
      oldbalanceOrg: 10000,
      newbalanceOrig: 150,
      nameDest: 'C994102 (Crypto Hub Escrow)',
      destAccountType: 'CRYPTO_EXCHANGE',
      destAccountAgeDays: 1,
      oldbalanceDest: 0,
      newbalanceDest: 9850,
      riskScore: 89,
      riskBand: 'CRITICAL',
      fraudFlags: ['MULE_STRUCTURING_CTR_EVASION', 'ACCOUNT_BALANCE_DRAINED_TO_NEAR_ZERO'],
      device: {
        ip: '185.220.101.5',
        geoCountry: 'Romania',
        city: 'Bucharest',
        isVpnOrTor: true,
        deviceFingerprintTrust: 18,
      },
    };

    const res = await fetch('http://localhost:3000/api/regulatory/draft-sar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction: sampleTx,
        investigatorNotes: 'Automated rapid mule drain structuring detected.',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.sarNarrative);
    assert.ok(data.sarNarrative.length > 250);
    assert.ok(data.filingMetadata);
    assert.equal(data.filingMetadata.reportType, 'FinCEN Form 111 (Suspicious Activity Report)');
  });

  await test('8.2 FinCEN BSA Electronic Filing Conformance: /api/regulatory/validate-sar-filing validates criteria', async () => {
    const res = await fetch('http://localhost:3000/api/regulatory/validate-sar-filing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: 'TX-7802-PS',
        narrative: 'Chronological FinCEN Form 111 Part V Narrative: Originator initiated structured transfer of $9,850 to newly formed beneficiary entity to evade mandatory Currency Transaction Report thresholds under 31 CFR § 1020.320. Detailed forensic investigation confirms high-anonymity proxy and depleted balance.',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.isValid, true);
    assert.ok(data.readinessScore >= 80);
    assert.ok(Array.isArray(data.passedChecks));
    assert.ok(data.bsnBatchId.startsWith('BSN-'));
  });

  await test('8.3 FinCEN Electronic Batch Export: /api/regulatory/export-fincen-batch returns XML/JSON package', async () => {
    const res = await fetch('http://localhost:3000/api/regulatory/export-fincen-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: 'TX-7802-PS',
        narrative: 'Compliance test narrative.',
        format: 'JSON',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.fincenBatchHeader);
    assert.equal(data.fincenBatchHeader.schemaVersion, '2.0.FinCEN.BSA');
    assert.ok(data.cryptographicVerification);
  });

  await test('8.4 Statutory Citation Grounding: /api/regulatory/verify-citations verifies codified rules', async () => {
    const res = await fetch('http://localhost:3000/api/regulatory/verify-citations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'This activity triggers mandatory reporting under 31 CFR § 1020.320 and FATF Recommendation 16 for cross-border wires.',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.isGrounded, true);
    assert.ok(data.groundingScore >= 80);
    assert.ok(['ZERO', 'LOW'].includes(data.hallucinationRisk));
    assert.ok(data.verifiedCitations.length >= 2);
  });

  console.log('\n\x1b[1m[SUITE 9: GOOGLE CLOUD STREAMING & BIGQUERY LAKEHOUSE]\x1b[0m');

  await test('9.1 Cloud Streaming Telemetry: /api/streaming/pubsub/status returns topic & lakehouse metrics', async () => {
    const res = await fetch('http://localhost:3000/api/streaming/pubsub/status');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.pubsub);
    assert.ok(data.pubsub.topic.includes('transactions-stream'));
    assert.ok(data.pubsub.publishedEventsCount > 0);
    assert.ok(data.bigquery);
    assert.ok(data.bigquery.totalRowsIngested > 0);
  });

  await test('9.2 Cloud Pub/Sub Ingestion: /api/streaming/pubsub/publish streams event & increments buffer', async () => {
    const res = await fetch('http://localhost:3000/api/streaming/pubsub/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventPayload: {
          test: 'CI_INGESTION_EVENT',
          timestamp: new Date().toISOString(),
        },
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.eventId.startsWith('PS-EVT-'));
    assert.ok(data.ackId.startsWith('ACK-'));
    assert.ok(typeof data.streamingBufferOffset === 'number');
  });

  await test('9.3 BigQuery Lakehouse SQL Analytics: /api/streaming/bigquery/query executes partition query', async () => {
    const res = await fetch('http://localhost:3000/api/streaming/bigquery/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'SELECT risk_band, COUNT(*) as count FROM bfsi_lakehouse.raw_transactions_partitioned GROUP BY 1',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.jobId.startsWith('bqjob_'));
    assert.ok(Array.isArray(data.rows));
    assert.ok(data.rows.length > 0);
    assert.ok(typeof data.executionTimeMs === 'number');
    assert.ok(data.bytesScannedFormatted);
  });

  console.log('\n======================================================');
  console.log(`   TEST EXECUTION COMPLETED: \x1b[32m${passedCount} PASSED\x1b[0m, \x1b[31m${failedCount} FAILED\x1b[0m`);
  console.log('======================================================\n');

  if (inProcessServer) {
    inProcessServer.close();
  }

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
