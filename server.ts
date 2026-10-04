import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { REGULATORY_DATABASE, searchRegulatoryDatabase } from './src/data/regulatoryData.ts';
import { INITIAL_TRANSACTIONS, computeRiskScore, TransactionRecord } from './src/data/syntheticTransactions.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI with required telemetry headers
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory transaction state with Kaggle PaySim simulation store
let activeTransactions: TransactionRecord[] = [...INITIAL_TRANSACTIONS];

// In-memory compliance audit decision log
interface AuditEntry {
  id: string;
  transactionId: string;
  action: string;
  reason: string;
  analyst: string;
  timestamp: string;
  falsePositive: boolean;
  scoreAtDecision: number;
}
let auditTrail: AuditEntry[] = [
  {
    id: "AUD-101",
    transactionId: "TX-7802-PS",
    action: "APPROVED",
    reason: "Established supplier invoice payment, statutory CTR Form 112 logged automatically.",
    analyst: "Sarah Jenkins (Senior Compliance VP)",
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    falsePositive: false,
    scoreAtDecision: 18,
  }
];

// API: Get regulations catalog
app.get('/api/regulations/library', (req, res) => {
  res.json({
    frameworks: REGULATORY_DATABASE,
    total: REGULATORY_DATABASE.length,
  });
});

// API: Search regulations
app.get('/api/regulations/search', (req, res) => {
  const query = (req.query.q as string) || '';
  const category = (req.query.category as string) || 'ALL';
  const results = searchRegulatoryDatabase(query, category);
  res.json({ results });
});

// API: Copilot Regulatory RAG Chat
app.post('/api/regulatory/chat', async (req, res) => {
  try {
    const { query, category = 'ALL', strictCitations = true } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // 1. Retrieve top matching regulatory documents from our legal knowledge base
    const matches = searchRegulatoryDatabase(query, category);
    
    // Fallback if no specific high score match
    const primaryDocs = matches.length > 0 
      ? matches.map(m => m.doc)
      : REGULATORY_DATABASE.slice(0, 3);

    const contextText = primaryDocs.map(doc => `
--- JURISDICTION: ${doc.jurisdiction} | ACT: ${doc.framework} ---
STATUTE CODE: ${doc.code}
TITLE: ${doc.title}
SECTION: ${doc.section} (${doc.pageOrArticle})
STATUTORY THRESHOLD: ${doc.thresholdSummary}
KEY DIRECTIVES:
${doc.keyDirectives.map(d => ` - ${d}`).join('\n')}
STATUTE EXCERPT:
"${doc.fullTextExcerpt}"
`).join('\n\n');

    let aiAnswer = '';

    if (ai) {
      const systemInstruction = `You are RiskGuard AI, an authoritative Senior Regulatory & Compliance Intelligence Copilot advising banking compliance officers, MLROs (Money Laundering Reporting Officers), and fraud investigators.
Ground your response strictly on financial law, including:
1. FinCEN / Bank Secrecy Act (31 CFR Chapter X, 31 U.S.C. 5318, 5324)
2. FATF 40 Recommendations (Rec 10, Rec 12 PEPs, Rec 16 Travel Rule)
3. PMLA 2002 / RBI Master Directions (Cash transaction reporting thresholds over ₹10 Lakhs, 7-day STR timelines)
4. SEC Rule 17a-8 / FINRA Rule 3310
5. GDPR Art. 22 / EU AI Act (Human oversight, algorithmic transparency)

STRICT ANTI-HALLUCINATION RULES:
- Always cite the exact statutory provision (e.g. "FinCEN 31 CFR § 1020.320(a)(2)" or "PMLA Rule 3(1)(A)").
- Specify exact monetary thresholds (e.g., $10,000 for CTR, ₹10 Lakhs in India, $5,000 for mandatory SAR, €1,000 for FATF Travel Rule).
- Distinguish between mandatory statutory filings (e.g., CTR vs SAR) and discretionary Enhanced Due Diligence.
- If the question involves an edge case (e.g. false positives, human override), articulate how compliance teams safely document their rationale.
- Format responses cleanly with bold headings and bullet points.`;

      const prompt = `QUESTION FROM COMPLIANCE INVESTIGATOR:
"${query}"

LEGAL AUTHORITIES & EXCERPTS IN JURISDICTION REPOSITORY:
${contextText}

Provide an authoritative, structured compliance advisory answering the question. Include specific thresholds, mandatory filing deadlines (in calendar or working days), and statutory references.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2, // Low temperature for high factual accuracy
        },
      });

      aiAnswer = response.text || '';
    } else {
      // Deterministic fallback response when Gemini key is not configured
      const topDoc = primaryDocs[0];
      aiAnswer = `### Regulatory Advisory: ${topDoc.title}\n\n**Statutory Reference:** ${topDoc.code} (${topDoc.section})\n**Jurisdiction:** ${topDoc.jurisdiction}\n\n**Key Threshold Requirement:**\n${topDoc.thresholdSummary}\n\n**Compliance Mandates:**\n${topDoc.keyDirectives.map(d => `* ${d}`).join('\n')}\n\n**Statutory Provision:**\n> "${topDoc.fullTextExcerpt.slice(0, 300)}..."\n\n*Note: To enable live generative analysis with Gemini 3.8 Flash, connect your Gemini API key in Settings.*`;
    }

    res.json({
      answer: aiAnswer,
      citations: primaryDocs.map(d => ({
        id: d.id,
        framework: d.framework,
        code: d.code,
        title: d.title,
        section: d.section,
        threshold: d.thresholdSummary,
        excerpt: d.fullTextExcerpt,
      })),
      confidenceScore: matches.length > 0 ? Math.min(99, matches[0].relevanceScore + 15) : 85,
    });
  } catch (error: any) {
    console.error('Regulatory chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to process regulatory intelligence query' });
  }
});

// API: Draft Suspicious Activity Report (SAR) Part V Narrative
app.post('/api/regulatory/draft-sar', async (req, res) => {
  try {
    const { transaction, investigatorNotes } = req.body;
    if (!transaction) {
      return res.status(400).json({ error: 'Transaction record is required to draft SAR' });
    }

    const tx = transaction as TransactionRecord;

    if (ai) {
      const prompt = `You are a Senior Bank Compliance MLRO preparing an audit-ready FinCEN Suspicious Activity Report (SAR) Part V Narrative.
Generate a formal, regulatory-grade SAR narrative for filing under 31 U.S.C. 5318(g) and 31 CFR § 1020.320.

TRANSACTION AUDIT DATA:
- Reference ID: ${tx.id}
- Timestamp: ${tx.timestamp}
- Transaction Rails / Type: ${tx.type}
- Amount: ${tx.currency} ${tx.amount.toLocaleString()}
- Originator Account: ${tx.nameOrig} (${tx.origAccountType}, Tenure: ${tx.origCustomerTenureMonths} months)
- Originator Balance Pre-Tx: ${tx.currency} ${tx.oldbalanceOrg.toLocaleString()} -> Post-Tx: ${tx.currency} ${tx.newbalanceOrig.toLocaleString()}
- Beneficiary Account: ${tx.nameDest} (${tx.destAccountType}, Account Age: ${tx.destAccountAgeDays} days)
- Beneficiary Balance Pre-Tx: ${tx.currency} ${tx.oldbalanceDest.toLocaleString()} -> Post-Tx: ${tx.currency} ${tx.newbalanceDest.toLocaleString()}
- Risk Score: ${tx.riskScore}/100 (${tx.riskBand})
- Red Flag Signals: ${tx.fraudFlags.join(', ')}
- Device & Network: IP ${tx.device.ip} (${tx.device.city}, ${tx.device.geoCountry}), Proxy/Tor: ${tx.device.isVpnOrTor ? 'YES' : 'NO'}, Device Trust: ${tx.device.deviceFingerprintTrust}/100
- Investigator Field Notes: "${investigatorNotes || 'Automated anomaly detection triggered critical threshold alerts. Human compliance officer initiated formal filing review.'}"

STRUCTURE THE SAR PART V NARRATIVE EXACTLY AS FOLLOWS:
1. EXECUTIVE SUMMARY (Subject, Amount, Suspicious Typology)
2. CHRONOLOGY OF SUSPICIOUS EVENTS & FINANCIAL TRANSACTIONS
3. ANOMALY & ML FEATURE ANALYSIS (Balance drain ratio, mule patterns, geo-jumping, IP obfuscation)
4. STATUTORY BASIS FOR REPORTING (FinCEN 31 CFR § 1020.320, 31 U.S.C. § 5324 Structuring / Anti-Money Laundering)
5. INSTITUTIONAL ACTION TAKEN & LAW ENFORCEMENT EXHIBIT RETENTION

Write professionally in third-person regulatory tone without placeholders.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.15,
        },
      });

      res.json({
        sarNarrative: response.text,
        filingMetadata: {
          reportType: 'FinCEN Form 111 (Suspicious Activity Report)',
          filingDeadlineDays: 30,
          mandatoryReasonCode: tx.fraudFlags[0] || 'SUSPICIOUS_TRANSACTION',
          generatedAt: new Date().toISOString(),
          formPart: 'Part V — Suspicious Activity Information Narrative',
        }
      });
    } else {
      // Deterministic SAR template
      const fallbackNarrative = `### FinCEN Suspicious Activity Report (SAR) — Part V Narrative

**1. EXECUTIVE SUMMARY**
This Suspicious Activity Report (SAR) is submitted pursuant to the Bank Secrecy Act, 31 U.S.C. § 5318(g) and 31 CFR § 1020.320, by RiskGuard AI Reporting Unit. The subject transaction (${tx.id}) was executed on ${new Date(tx.timestamp).toUTCString()} involving ${tx.currency} ${tx.amount.toLocaleString()} originated by ${tx.nameOrig} destined for ${tx.nameDest}. The transaction exhibited high-probability hallmarks of illicit money laundering and structuring.

**2. CHRONOLOGY OF SUSPICIOUS ACTIVITY**
On ${new Date(tx.timestamp).toLocaleDateString()}, origin account ${tx.nameOrig} initiated an outbound ${tx.type} of ${tx.currency} ${tx.amount.toLocaleString()}. Prior to execution, the account maintained a balance of ${tx.currency} ${tx.oldbalanceOrg.toLocaleString()}. Post-execution, the account was depleted to ${tx.currency} ${tx.newbalanceOrig.toLocaleString()} (a drain of over 95% of liquid reserves). 
The beneficiary account (${tx.nameDest}) was opened only ${tx.destAccountAgeDays} days prior to transfer with zero prior legitimate commercial transactional history.

**3. RED FLAGS & ANOMALY SIGNALS**
* Flags Detected: ${tx.fraudFlags.join('; ')}
* IP & Geolocation: Originating from ${tx.device.ip} (${tx.device.city}, ${tx.device.geoCountry}) with anonymizing proxy/VPN enabled (${tx.device.isVpnOrTor ? 'Confirmed Proxy' : 'Direct'}).
* Structuring Indicators: Transaction value closely tracks statutory reporting threshold limits designed to avoid mandatory Currency Transaction Report (CTR) generation under 31 U.S.C. § 5324.

**4. STATUTORY BASIS & VIOLATIONS IDENTIFIED**
* 31 CFR § 1020.320(a)(2)(i)-(iii): Transaction has no apparent business or lawful purpose and deviates materially from customer's normal profile.
* 31 U.S.C. § 5324: Suspected structuring of financial transactions.

**5. DISPOSITION & EXHIBITS**
The reporting institution has frozen further outbound disbursements pending law enforcement inquiry. All transmission logs, IP packet headers, and KYC records are preserved for a statutory 5-year retention period.`;

      res.json({
        sarNarrative: fallbackNarrative,
        filingMetadata: {
          reportType: 'FinCEN Form 111 (Suspicious Activity Report)',
          filingDeadlineDays: 30,
          mandatoryReasonCode: tx.fraudFlags[0] || 'SUSPICIOUS_TRANSACTION',
          generatedAt: new Date().toISOString(),
          formPart: 'Part V — Suspicious Activity Information Narrative',
        }
      });
    }
  } catch (error: any) {
    console.error('SAR generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate SAR narrative' });
  }
});

// API: Real-time risk evaluation engine
app.post('/api/risk/evaluate', (req, res) => {
  try {
    const result = computeRiskScore(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// API: Get live transactions
app.get('/api/transactions', (req, res) => {
  res.json({
    transactions: activeTransactions,
    total: activeTransactions.length,
    criticalCount: activeTransactions.filter(t => t.riskBand === 'CRITICAL').length,
    highCount: activeTransactions.filter(t => t.riskBand === 'HIGH').length,
    pendingReviewCount: activeTransactions.filter(t => t.status === 'PENDING_REVIEW').length,
  });
});

// API: Human-in-the-Loop decision override
app.post('/api/decisions/override', (req, res) => {
  const { transactionId, action, reason, analyst, falsePositive = false } = req.body;
  if (!transactionId || !action) {
    return res.status(400).json({ error: 'transactionId and action are required' });
  }

  const txIndex = activeTransactions.findIndex(t => t.id === transactionId);
  if (txIndex === -1) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  const tx = activeTransactions[txIndex];
  tx.status = action;
  tx.analystDecision = {
    action,
    note: reason || 'Reviewed and adjudicated by compliance officer.',
    timestamp: new Date().toISOString(),
    analyst: analyst || 'Compliance Officer (Reviewer #402)',
    falsePositiveMarked: falsePositive,
  };

  const auditEntry: AuditEntry = {
    id: `AUD-${Date.now().toString().slice(-5)}`,
    transactionId,
    action,
    reason: reason || 'Adjudicated per standard operating procedure',
    analyst: analyst || 'Compliance Officer (Reviewer #402)',
    timestamp: new Date().toISOString(),
    falsePositive,
    scoreAtDecision: tx.riskScore,
  };
  auditTrail.unshift(auditEntry);

  res.json({ success: true, transaction: tx, auditEntry });
});

// API: Bulk Human-in-the-Loop decision override
app.post('/api/decisions/bulk-override', (req, res) => {
  const { transactionIds, action, reason, analyst, falsePositive = false } = req.body;
  if (!Array.isArray(transactionIds) || transactionIds.length === 0 || !action) {
    return res.status(400).json({ error: 'transactionIds array and action are required' });
  }

  const updatedTxs: TransactionRecord[] = [];
  const newAuditEntries: AuditEntry[] = [];
  const now = new Date().toISOString();
  const operator = analyst || 'Compliance Officer (Reviewer #402)';

  for (const id of transactionIds) {
    const tx = activeTransactions.find(t => t.id === id);
    if (tx) {
      tx.status = action;
      tx.analystDecision = {
        action,
        note: reason || `Bulk adjudicated: ${action}`,
        timestamp: now,
        analyst: operator,
        falsePositiveMarked: falsePositive,
      };
      updatedTxs.push(tx);

      const entry: AuditEntry = {
        id: `AUD-B${Math.floor(Math.random() * 89999 + 10000)}`,
        transactionId: id,
        action,
        reason: reason || `Bulk ${action} applied across ${transactionIds.length} records`,
        analyst: operator,
        timestamp: now,
        falsePositive,
        scoreAtDecision: tx.riskScore,
      };
      newAuditEntries.push(entry);
    }
  }

  auditTrail = [...newAuditEntries, ...auditTrail];

  res.json({
    success: true,
    updatedCount: updatedTxs.length,
    transactions: updatedTxs,
    auditEntries: newAuditEntries,
  });
});

// API: Get audit log
app.get('/api/decisions/audit-trail', (req, res) => {
  res.json({ auditTrail });
});

// API: Generate simulated transaction (PaySim Stream simulator)
app.post('/api/transactions/stream-tick', (req, res) => {
  const mockScenarios = [
    {
      type: 'TRANSFER' as const,
      amount: Math.floor(Math.random() * 2000) + 9000, // Structuring range $9,000 - $11,000
      currency: 'USD',
      orig: `C${Math.floor(Math.random() * 899999 + 100000)} (Synthetic Entity)`,
      origType: 'INDIVIDUAL' as const,
      dest: `C${Math.floor(Math.random() * 899999 + 100000)} (Crypto Escrow Hub)`,
      destType: 'CRYPTO_EXCHANGE' as const,
      destAge: Math.floor(Math.random() * 5) + 1,
      oldOrig: 12000,
      oldDest: 0,
      isVpn: true,
      city: 'Bucharest',
      country: 'Romania',
      ip: `185.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.12`,
    },
    {
      type: 'PAYMENT' as const,
      amount: Math.floor(Math.random() * 300) + 45,
      currency: 'USD',
      orig: `C${Math.floor(Math.random() * 899999 + 100000)} (David Chen)`,
      origType: 'INDIVIDUAL' as const,
      dest: `M${Math.floor(Math.random() * 899999 + 100000)} (Cloud Services Inc)`,
      destType: 'MERCHANT' as const,
      destAge: 520,
      oldOrig: 4500,
      oldDest: 89000,
      isVpn: false,
      city: 'Seattle',
      country: 'United States',
      ip: `72.21.${Math.floor(Math.random() * 255)}.8`,
    }
  ];

  const pick = mockScenarios[Math.random() > 0.4 ? 0 : 1];
  const evalResult = computeRiskScore({
    amount: pick.amount,
    currency: pick.currency,
    type: pick.type,
    origAccountAgeMonths: 6,
    destAccountAgeDays: pick.destAge,
    oldbalanceOrig: pick.oldOrig,
    isVpn: pick.isVpn,
    pepWatchlist: false,
    priorChargebacks: 0,
    velocity1Hour: pick.type === 'TRANSFER' ? 3 : 1,
    isCrossBorder: pick.country !== 'United States',
  });

  const newTx: TransactionRecord = {
    id: `TX-${Math.floor(Math.random() * 8999 + 1000)}-PS`,
    timestamp: new Date().toISOString(),
    type: pick.type,
    amount: pick.amount,
    currency: pick.currency,
    nameOrig: pick.orig,
    origAccountType: pick.origType,
    origCustomerTenureMonths: 6,
    oldbalanceOrg: pick.oldOrig,
    newbalanceOrig: Math.max(0, pick.oldOrig - pick.amount),
    nameDest: pick.dest,
    destAccountType: pick.destType,
    destAccountAgeDays: pick.destAge,
    oldbalanceDest: pick.oldDest,
    newbalanceDest: pick.oldDest + pick.amount,
    riskScore: evalResult.riskScore,
    riskBand: evalResult.riskBand,
    fraudFlags: evalResult.flags,
    featureWeights: evalResult.weights,
    device: {
      ip: pick.ip,
      geoCountry: pick.country,
      city: pick.city,
      isVpnOrTor: pick.isVpn,
      deviceFingerprintTrust: pick.isVpn ? 22 : 92,
    },
    regulatoryWatchlist: {
      pepMatch: false,
      sanctionListHit: false,
      ctrThresholdExceeded: pick.amount >= 10000,
      structuringSuspicion: pick.amount >= 9000 && pick.amount < 10000,
    },
    status: evalResult.suggestedAction,
  };

  activeTransactions.unshift(newTx);
  if (activeTransactions.length > 50) {
    activeTransactions.pop();
  }

  res.json({ transaction: newTx });
});

// Setup Vite middleware in dev, static in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RiskGuard AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
