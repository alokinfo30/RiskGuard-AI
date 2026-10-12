# RiskGuard AI — Autonomous Risk Scoring, Fraud Surveillance & Regulatory Intelligence Copilot

RiskGuard AI is a production-grade banking, financial services, and insurance (**BFSI**) intelligence platform engineered to detect sophisticated financial crime, mitigate transactional fraud, automate regulatory compliance, and empower cardholders with real-time personalized protection.

Powered by **Gemini on Vertex AI**, **Google Cloud Document AI**, streaming anomaly heuristics, and cryptographic audit ledgers, RiskGuard AI unifies autonomous risk scoring, human-in-the-loop decision triage, automated FinCEN Suspicious Activity Report (SAR Form 111) drafting, and power-user keyboard accessibility under **FinCEN 31 CFR § 1020.320**, **FATF 40 Recommendations**, **PMLA 2002**, **GDPR Art. 22**, and the **EU AI Act**.

---

## 🏛️ System Architecture

RiskGuard AI coordinates seven synchronized, event-driven modules across a resilient full-stack architecture:

```
                          ┌─────────────────────────────────────────────────────────┐
                          │            Live Event-Driven Financial Stream           │
                          │           (Kaggle PaySim Multi-Rail Stream Hub)         │
                          └────────────────────────────┬────────────────────────────┘
                                                       │
         ┌───────────────────────────────┬─────────────┴─────────────────┬───────────────────────────────┐
         ▼                               ▼                               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌─────────────────────────────┐
│ 1. Real-Time Fraud Stream   │ │ 2. Customer Alerts Hub      │ │ 3. Document AI Forensics    │ │ 4. Regulatory Copilot (RAG) │
├─────────────────────────────┤ ├─────────────────────────────┤ ├─────────────────────────────┤ ├─────────────────────────────┤
│ • 0–100 Multi-Factor Score  │ │ • Multi-Channel (SMS/Push)  │ │ • Optical Entity Extraction │ │ • Grounded Legal RAG Engine │
│ • Recharts 1h Inflow Line   │ │ • 2-Way Smartphone Sandbox  │ │ • TBML Trade Discrepancies  │ │ • Gemini 3.8 / 2.5 Flash    │
│ • 24h Velocity & Heatmap    │ │ • 1-Click "Verify / Freeze" │ │ • Document Trust Score Meter│ │ • FinCEN SAR Part V Drafter │
│ • Web Audio Chimes & Toasts │ │ • Real-Time Ledger Updates  │ │ • Auto SAR Exhibit D Exhibit│ │ • Strict Anti-Hallucination │
└──────────────┬──────────────┘ └──────────────┬──────────────┘ └──────────────┬──────────────┘ └──────────────┬──────────────┘
               │                               │                               │                               │
               └───────────────────────────────┴──────────────┬────────────────┴───────────────────────────────┘
                                                              │
                                                              ▼
               ┌───────────────────────────────────────────────────────────────────────────────────────────────┐
               │                          Compliance Power-User Command & Control                              │
               │   • Global Command Palette (⌘K)  • Quick SAR Filing (⌘↵)  • Compliance Officer Sheet (?)     │
               └──────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                              │
         ┌────────────────────────────────────────────────────┴────────────────────────────────────┐
         ▼                                                                                         ▼
┌─────────────────────────────────────────────────────────────┐ ┌─────────────────────────────────────────────────────────────┐
│ 5. Risk Simulator & SHAP Sandbox / 6. Statutory Library     │ │ 7. Cryptographic Audit Ledger & SAR Donut Summary Panel     │
├─────────────────────────────────────────────────────────────┤ ├─────────────────────────────────────────────────────────────┤
│ • Interactive Sliders for Account Age, Velocity & VPN       │ │ • Recharts Donut Chart of SAR Statuses (Drafted/Filed/Pend) │
│ • Waterfall Attribution for Explainable ML Decisions        │ │ • Backward SHA-256 Hash Chaining linked to Genesis Root     │
│ • Full Jurisdictional Repository (FinCEN, FATF, PMLA, GDPR) │ │ • Automated Integrity Verification & RFC 4180 CSV Export    │
└─────────────────────────────────────────────────────────────┘ └─────────────────────────────────────────────────────────────┘
```

---

## ☁️ Google Cloud Technologies Utilized

- **Gemini on Vertex AI (`@google/genai`)**: Powers natural-language regulatory reasoning, anti-hallucination citation verification, and automated SAR Part V narrative generation grounded strictly in statutory thresholds.
- **Document AI Financial Intelligence**: Optical structure extraction, trade-based money laundering (TBML) invoice discrepancy detection, and forensic cross-referencing between commercial documents and execution ledgers.
- **BigQuery-Style Inflow Analytics**: High-throughput time-bucket aggregation rendered via Recharts, visualizing per-minute critical transaction velocity over rolling 1-hour windows.
- **Cloud Run Full-Stack Containerization**: Production Express backend + React 19 SPA running on Node.js 22 with hardened OWASP security headers.

---

## ⌨️ Power-User Global Keyboard Shortcuts

Built for high-velocity compliance triage and rapid MLRO decisioning:

| Keyboard Shortcut | Action | Description |
|---|---|---|
| **`⌘K` / `Ctrl+K`** | **Global Command Palette** | Instant power search across transactions by ID, merchant, cardholder, flags, or execute quick commands. |
| **`⌘↵` / `Ctrl+Enter`** | **Instant SAR File / Adjudicate** | Immediately sign off and file FinCEN SAR Form 111, or commit compliance decision. |
| **`Esc`** | **Dismiss Modal / Drawer** | Safely closes active inspector modals, SAR drawers, command palettes, or shortcut sheets. |
| **`?`** | **Shortcuts Cheat Sheet** | Displays compliance officer keyboard reference modal. |
| **`⌘1` / `Ctrl+1`** | **Fraud Stream** | Jump to Real-Time Monitoring Queue & Recharts Inflow Chart. |
| **`⌘2` / `Ctrl+2`** | **Customer Alerts** | Jump to Customer Personalized Alert Hub & 2-Way Smartphone Simulator. |
| **`⌘3` / `Ctrl+3`** | **Document AI** | Jump to Financial Document Forensics & Due Diligence Reviewer. |
| **`⌘4` / `Ctrl+4`** | **Regulatory Copilot** | Jump to Legal RAG Advisory (FinCEN / BSA / FATF). |
| **`⌘5` / `Ctrl+5`** | **Risk Simulator** | Jump to ML Feature Sandbox & SHAP Waterfall Attribution. |
| **`⌘6` / `Ctrl+6`** | **Statute Library** | Jump to Legal Framework & Regulatory Excerpt Repository. |
| **`⌘7` / `Ctrl+7`** | **Audit Ledger** | Jump to Cryptographic Governance Ledger & SAR Donut Chart. |

---

## 🚀 The 7 Core Application Modules

### 1. Real-Time Fraud Surveillance Queue
- **Live Influx Engine**: Continuous ingestion of financial transactions modeled on Kaggle PaySim financial logs (Transfers, Cash Out, Payments, Debits).
- **Recharts Real-Time 1-Hour Critical Inflow Line Chart**: Displays the inflow of `CRITICAL` risk transactions over the last 60 minutes with per-minute velocity buckets, standard deviations, and dynamic anomaly alerts.
- **Multi-View Surveillance**: Toggle seamlessly between the 1-Hour Critical Inflow Chart, 24-Hour Velocity Trend, and Categorical Risk Heatmap.
- **Bulk Adjudication & Selection**: Multi-select transaction triage with batch `APPROVED`, `STEP_UP_KYC`, `ACCOUNT_FROZEN`, and `SAR_FILED` actions.
- **Audio Surveillance Chimes**: Web Audio API alerts with customizable decibel volume and severity thresholds.

### 2. Real-Time Personalized Customer Alerts Hub
- **2-Way Customer Verification**: Alerts cardholders immediately via **SMS Gateway**, **Mobile Push**, or **Secure Email** upon abnormal transaction detection.
- **Interactive Smartphone Device Simulator**: Compliance officers can simulate customer perspective on a virtual iPhone/Android screen.
- **1-Click Actions**:
  - `[✅ Yes, I Authorized This (Verify 2FA)]`: Immediately verifies customer identity, defuses false positive, approves transaction, and updates model feedback.
  - `[🚨 No, Fraud! Freeze Account Now]`: Instantly enforces emergency account freeze, logs cryptographic tamper-proof audit trail, and escalates to FinCEN SAR filing.
- **Operational Metrics**: Real-time telemetry tracking Total Dispatched Alerts, Verification Rate %, and Prevented Fraud Volume ($).

### 3. Document AI Financial Forensics & Compliance Reviewer
- **Optical Entity Extraction**: Automatically extracts Vendor Name, Beneficiary, Stated Invoice Amount, Currency, Invoice Date, Tax ID / EIN, and IBAN/BIC.
- **Trade-Based Money Laundering (TBML) Detection**: Automatically cross-references extracted documents against on-ledger transactions to identify:
  - Amount Mismatches (e.g., Commercial invoice $12,500 vs structured wire of $48,000).
  - Unverified Beneficiaries (e.g., Mismatched shell entities or high-risk offshore escrow accounts).
  - Altered Document / Tampering Risk.
- **Document Trust Score (0–100)**: Categorizes document risk into `LOW_RISK`, `MODERATE_DISCREPANCY`, or `HIGH_FORGERY_RISK`.
- **Auto-Generated SAR Exhibit D Narrative**: 1-click export and auto-attachment to FinCEN SAR Part V filing narratives.

### 4. Regulatory Intelligence Copilot (Grounded RAG)
- **Legal Authorities Grounded**: FinCEN 31 CFR § 1020.320, FATF 40 Recommendations, PMLA 2002 India, SEC Rule 17a-8, and GDPR Art. 22 / EU AI Act.
- **Anti-Hallucination Architecture**: Strict system instructions enforce exact statutory citations, monetary threshold validation ($10,000 CTR, $5,000 SAR, €1,000 Travel Rule), and mandatory filing timelines.
- **Automated SAR Part V Drafter**: Generates formal 5-section audit-ready FinCEN narratives complete with Executive Summary, Chronology, Red Flags, Statutory Basis, and Disposition.

### 5. ML Risk Sandbox & SHAP Factor Attribution
- **Interactive Feature Sliders**: Dynamically adjust Transaction Amount, Account Drain Ratio, Recipient Age, Velocity, VPN/Tor telemetry, and Watchlists.
- **Instant Risk Scoring**: Real-time 0–100 risk score recalculation and categorization (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **SHAP Waterfall Attribution**: Explains exact positive and negative feature weight contributions to the composite score for regulatory transparency.

### 6. Statutory Framework Library
- **Jurisdiction Browser**: Searchable statutory catalog spanning FinCEN, FATF, PMLA, and GDPR.
- **Search & Filter**: Real-time keyword search across statutory titles, sections, monetary limits, and full-text excerpts.

### 7. Audit Governance Log & Cryptographic Ledger
- **SAR Regulatory Pipeline Donut Chart**: Recharts-powered donut chart visualizing the live status breakdown of Suspicious Activity Reports:
  - **Filed** (Emerald): FinCEN Form 111 Part V narratives transmitted under 31 U.S.C. 5318(g).
  - **Drafted** (Indigo): Narratives prepared by Copilot undergoing supervisory MLRO sign-off.
  - **Pending Triage** (Amber): High-risk anomalies under active 30-day statutory clocks.
  - **Cleared Overrides** (Slate): Legitimate commerce verifications and model feedback overrides.
- **Blockchain-Grade Cryptographic Hash Chaining**: Every decision entry calculates a SHA-256 digest backward-linked to the previous block down to a hardcoded Genesis root.
- **Integrity Verification**: `/api/decisions/verify-integrity` validates the entire hash chain from head to Genesis block.
- **RFC 4180 CSV Export**: One-click download of regulatory audit logs formatted for regulatory supervisory examinations.

---

## 📱 Multi-Device Responsive Design

Tested and optimized across all viewports:
- **Mobile Phones (320px – 480px)**: Slide-down touch-friendly drawer covering all 7 modules, card-based feeds with overflow containment, and tap targets exceeding 44px.
- **Tablets & Laptops (768px – 1366px)**: Responsive multi-column layout, compact navigation bar, and responsive Recharts rendering.
- **Ultra-Wide Desktops (1440px – 4K)**: Full-fidelity surveillance cockpit with simultaneous multi-panel inspection, side-by-side drawers, and command palette.

---

## 🛡️ Enterprise Security Model

1. **OWASP Hardened HTTP Headers**: Strict `Content-Security-Policy`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security (HSTS)`.
2. **Sliding-Window Rate Limiting**: Per-IP memory-safe sliding window rate limiters across LLM, decision, and streaming endpoints.
3. **Payload Sanitization**: Inbound JSON bounded to 250kb, HTML script tag stripping, and strict compliance enum validation.
4. **Cryptographic Non-Repudiation**: SHA-256 backward chained audit trail preventing retrospective ledger alteration.

---

## 🧪 Comprehensive Automated Testing Suite

RiskGuard AI includes an automated end-to-end test runner executing 23 comprehensive tests across 7 distinct test suites:

```bash
npm test
```

### Test Suite Execution Output
```
======================================================
   RISKGUARD AI — ENTERPRISE REGULATORY & SECURITY TEST SUITE
======================================================

[SUITE 1: ML RISK ENGINE & FRAUD TYPOLOGY TESTS]
  ✔ 1.1 Normal Commerce: Legitimate low-risk invoice scores <= 25 points
  ✔ 1.2 Structuring / Smurfing: $9,850 cash transfer below $10,000 threshold triggers BSA alert
  ✔ 1.3 Catastrophic Mule Drain: >95% balance depletion to brand new recipient triggers CRITICAL
  ✔ 1.4 Sanctions & PEP Watchlist: OFAC/FATF match triggers mandatory escalation flag
  ✔ 1.5 Repeat Offender Penalty: Customer tenure mitigation reflects in risk score

[SUITE 2: STATUTORY RAG KNOWLEDGE BASE TESTS]
  ✔ 2.1 FinCEN 31 CFR § 1020.320: SAR filing statutory thresholds match law
  ✔ 2.2 FATF Recommendation 16: Travel rule cross-border wire thresholds verify
  ✔ 2.3 PMLA 2002 India: Cash reporting over ₹10 Lakhs and 7-day STR timelines
  ✔ 2.4 EU AI Act & GDPR Art. 22: Algorithmic transparency and human oversight rules verify

[SUITE 3: CRYPTOGRAPHIC AUDIT LEDGER & NON-REPUDIATION TESTS]
  ✔ 3.1 Cryptographic Hash Function: SHA-256 output matches standard digest
  ✔ 3.2 Cryptographic Chain Integrity: Uncorrupted audit trail passes verification
  ✔ 3.3 Anti-Tampering Security: Tampered audit entry reason breaks SHA-256 chain

[SUITE 4: SECURITY BOUNDARIES & API INPUT VALIDATION]
  ✔ 4.1 Server API Integrity: /api/decisions/verify-integrity returns 200 and isValid true
  ✔ 4.2 Security Health Check: /api/security/health returns SECURE posture
  ✔ 4.3 Live Transactions Endpoint: /api/transactions returns valid schema and count
  ✔ 4.4 Risk Evaluation API: /api/risk/evaluate computes and bounds output
  ✔ 4.5 Decision Override Rejection: Rejects unauthorized compliance actions
  ✔ 4.6 PaySim Ingestion Stream: /api/transactions/stream-tick produces compliant synthetic event

[SUITE 5: CUSTOMER ALERT & 2-WAY PROTECTION TESTS]
  ✔ 5.1 Customer Alerts Ledger: /api/customer-alerts returns active alerts and count
  ✔ 5.2 Alert Dispatch: /api/customer-alerts/dispatch sends personalized customer warning
  ✔ 5.3 2-Way Customer Verification: Customer response updates alert status

[SUITE 6: DOCUMENT AI FINANCIAL FORENSICS & SAR EXHIBITS]
  ✔ 6.1 Document AI Forensics: /api/documents/analyze extracts entities & generates findings

[SUITE 7: HTTP SECURITY POSTURE & OWASP DEFENSES]
  ✔ 7.1 OWASP Security Headers: Response contains CSP, nosniff, and frame hardening

======================================================
   TEST EXECUTION COMPLETED: 23 PASSED, 0 FAILED
======================================================
```

---

## 🛠️ Installation & Development

```bash
# Install dependencies
npm install

# Run full-stack dev server (Express backend + Vite HMR on port 3000)
npm run dev

# Run comprehensive test suite
npm test

# Lint codebase (type check)
npm run lint

# Build for production
npm run build

# Start production server
npm start
```
