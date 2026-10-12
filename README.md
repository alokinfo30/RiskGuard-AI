# RiskGuard AI — Autonomous Risk Scoring, Fraud Surveillance & Regulatory Intelligence Copilot

RiskGuard AI is an enterprise-grade banking and financial services intelligence platform that combines autonomous machine-learning fraud heuristics, real-time streaming anomaly surveillance, and generative legal reasoning powered by **Gemini 3.8 Flash**. 

Built for tier-1 retail banks, payment processors, neobanks, and anti-money laundering (AML) compliance teams, RiskGuard AI detects suspicious transaction typologies, automates FinCEN Suspicious Activity Report (SAR) narrative generation, and enforces cryptographic non-repudiation across human-in-the-loop decisions under **FinCEN 31 CFR § 1020.320**, **FATF 40 Recommendations**, **PMLA 2002**, **GDPR Art. 22**, and the **EU AI Act**.

---

## 🏛️ System Architecture

RiskGuard AI coordinates three synchronized, event-driven pipelines:

```
                          ┌───────────────────────────────────────────────────┐
                          │         Real-Time Synthetic Influx Stream         │
                          │        (Kaggle PaySim Financial Event Hub)        │
                          └─────────────────────────┬─────────────────────────┘
                                                    │
             ┌──────────────────────────────────────┼──────────────────────────────────────┐
             ▼                                      ▼                                      ▼
┌─────────────────────────────┐      ┌─────────────────────────────┐      ┌─────────────────────────────┐
│  Real-Time Analytics Engine │      │    Statutory RAG Copilot    │      │  Cryptographic Audit Ledger │
├─────────────────────────────┤      ├─────────────────────────────┤      ├─────────────────────────────┤
│ • 0–100 Multi-Factor Score  │      │ • FinCEN, FATF, PMLA, GDPR  │      │ • SHA-256 Backward Chaining │
│ • 1h Critical Inflow Line   │      │ • Anti-Hallucination Law RAG│      │ • Genesis Anchor Root       │
│ • 24h Trend & Risk Heatmap  │      │ • Gemini 3.8 Flash Engine   │      │ • Non-Repudiation Check     │
│ • Web Audio Chime Alerts    │      │ • FinCEN SAR Part V Drafter │      │ • RFC 4180 CSV Filings      │
└──────────────┬──────────────┘      └──────────────┬──────────────┘      └──────────────┬──────────────┘
               │                                    │                                    │
               └────────────────────────────────────┴────────────────────────────────────┘
                                                    │
                                                    ▼
                          ┌───────────────────────────────────────────────────┐
                          │      Human-in-the-Loop Adjudication Interface     │
                          │   (Multi-Select Bulk Triage & SAR Pipeline Donut) │
                          └───────────────────────────────────────────────────┘
```

1. **Real-Time Analytics Engine**: Streams transactions $\rightarrow$ Evaluates balance drain ratios, destination account ages, velocity bursts, proxy/Tor telemetry, and sanctions watchlists $\rightarrow$ Emits explainable 0–100 risk scores with SHAP-style factor attributions.
2. **Statutory RAG Copilot**: Accepts natural language investigator inquiries $\rightarrow$ Vector and keyword statutory retrieval $\rightarrow$ Gemini 3.8 Flash generates citations grounded strictly in legal statutes with zero hallucinations $\rightarrow$ Formulates audit-ready FinCEN Form 111 Part V narratives.
3. **Cryptographic Audit Ledger**: Records every human adjudication with backward-chained SHA-256 hashes linking each decision block to the Genesis anchor, ensuring immutable supervisory audit trails for regulatory examinations.

---

## 📱 Multi-Device Responsive Design (Mobile, Tablet, Laptop & Desktop)

RiskGuard AI is architected from the ground up for seamless operation across all device form factors:

- **Mobile Phones (320px – 480px)**:
  - Header features a touch-optimized hamburger drawer with full access to all 5 application modules.
  - Tabular feeds utilize smooth horizontal scroll containers and mobile touch action strips.
  - Interactive modals expand dynamically with touch targets exceeding 44px minimum sizing.
  - Notification alert settings feature safe-area boundary clamping preventing viewport clipping.
- **Tablets & Laptops (768px – 1366px)**:
  - Dual-column layouts for the Risk Sandbox and SHAP waterfall chart.
  - Surveillance visualizer switcher enables quick toggling between the 1-Hour Inflow Chart, 24-Hour Trend, and Risk Heatmap.
- **Ultra-Wide Desktops (1440px – 4K)**:
  - Full-fidelity multi-view surveillance dashboards with side-by-side transaction inspection and SAR Part V drafting drawers.
  - Tabular financial data rendered using `JetBrains Mono` with tabular numbers (`tabular-nums`) for micro-alignment.

---

## 🛡️ Enterprise Security Architecture

RiskGuard AI enforces defense-in-depth security standards tailored for regulated financial environments:

### 1. HTTP Security Hardening Headers
Configured via custom Express middleware on every incoming request:
- `Content-Security-Policy (CSP)`: Strict origin sandboxing restricting script, font, image, and style sources.
- `Strict-Transport-Security (HSTS)`: `max-age=31536000; includeSubDomains` enforcing HTTPS transport.
- `X-Frame-Options`: `SAMEORIGIN` clickjacking mitigation.
- `X-Content-Type-Options`: `nosniff` prevents MIME confusion attacks.
- `Referrer-Policy`: `strict-origin-when-cross-origin` protects sensitive URL paths.
- `Permissions-Policy`: Restricts camera, microphone, and geolocation hardware access.

### 2. In-Memory Sliding Window Rate Limiting
Granular rate-limiting buckets protect against DDoS, credential stuffing, and LLM exhaustion:
- **LLM Reasoning Endpoints (`/api/regulatory/*`)**: Capped at 30 requests/minute per client IP.
- **Compliance Decision Overrides (`/api/decisions/*`)**: Capped at 60 requests/minute to prevent script tampering.
- **General Stream Endpoints**: Capped at 120 requests/minute.
- Exceeded thresholds return `HTTP 429 Too Many Requests` with a compliant `Retry-After` header.

### 3. Strict Input Sanitization & Payload Bounds
- Body parser payload size restricted to `250kb` (`express.json({ limit: '250kb' })`) to prevent heap allocation exhaustion.
- Strips HTML tags, script injection tokens, null bytes, and control characters from investigator notes and queries.
- Strict enum validation on adjudication actions: only permits `APPROVED`, `STEP_UP_KYC`, `ACCOUNT_FROZEN`, and `SAR_FILED`.

### 4. Immutable Cryptographic Hash Chaining (Blockchain-Grade Ledger)
- Under Basel III, SOC2 Type II, and EU AI Act Art. 14, every human override must be tamper-proof and non-repudiable.
- Each `AuditEntry` contains `prevHash` and its own `hash`, calculated using SHA-256 over:
  $$\text{hash} = \text{SHA-256}(id \parallel prevHash \parallel timestamp \parallel transactionId \parallel action \parallel reason \parallel analyst \parallel score \parallel falsePositive)$$
- The oldest record links to a hardcoded Genesis root (`00000000...`).
- Verification endpoint `/api/decisions/verify-integrity` validates the entire hash chain from head to Genesis block. Any manual database tampering or altered record invalidates downstream hashes and triggers an immediate security alert.

---

## 🚀 Key Modules & Capabilities

### 1. Real-Time Fraud Monitoring Queue
- **Live PaySim Ingestion Stream**: Continuously streams transactions featuring origin account drain ratios, destination account ages, and payment rail typologies (Transfer, Cash Out, Payment, Debit, Cash In).
- **Real-Time 1-Hour Critical Risk Inflow Line Chart (Recharts)**:
  - Granular 3-minute or 5-minute observation windows tracking incoming transactions scoring $\ge 80$ risk points.
  - Real-time stream synchronization updating dynamically upon new transaction arrival.
  - Metric mode switcher: **Inflow Rate** (instantaneous arrival) vs **Cumulative Inflow (60m)**.
  - Statutory Surge Alert threshold reference line ($\ge 3\text{ transactions/window}$) triggering fraud strike team alerts.
  - Summary KPI cards: Aggregated 60m Critical Inflow, Peak Inflow Window, Capital at Risk ($), and Alert State.
- **24-Hour Velocity Trend Chart (Recharts)**:
  - 24-hour diurnal surveillance capturing off-hours smurfing spikes and midday business velocity.
  - Dual-series display: Critical Risk (solid crimson) and High Risk (dashed amber).
- **Risk Heatmap (Spatio-Temporal Density Radar)**:
  - Matrix cross-referencing major financial corridors (US, Germany, India, Cyprus, Netherlands, UAE, Romania, UK) across 6 diurnal time slices.
  - Color-coded threat density with interactive cell inspection.
- **Acoustic Alert Synthesizer (Web Audio API)**:
  - Low-latency dual-tone alert chime synthesized locally without external audio assets.
  - Toast notifications with one-click direct jump to case inspection.
- **Multi-Select Bulk Human Adjudication**:
  - Checkbox selection across the queue with docked batch action bar.
  - One-click bulk operations: Bulk Clear, Bulk Step-Up KYC, Bulk Freeze Accounts, and Bulk Escalate SAR.

### 2. Multi-Factor Risk Intelligence Sandbox
- **Interactive Feature Tuning**: Sliders for transaction amounts, liquid balances, customer account tenure, beneficiary account age, velocity in past hour, and proxy telemetry.
- **SHAP-Style Feature Attribution Waterfall**: Explains exact risk point additions/subtractions (e.g., $+35$ structuring evasion, $+25$ balance drain, $+20$ disposable mule, $-20$ tenure mitigation).
- **Pre-Configured Benchmark Scenarios**:
  - *CTR Smurfing Evasion*: $\$9,850$ engineered transfer to a 2-day-old beneficiary.
  - *Account Takeover (ATO) Burst*: $\$42,000$ rapid wire after password reset via Tor proxy.
  - *B2B Commercial False Positive*: $\$125,000$ supplier invoice payout by a 48-month corporate client.
  - *PMLA India ₹10 Lakhs Offshore Wire*: ₹12,50,000 cross-border transfer under Rule 3(1)(A).

### 3. Regulatory Guard Copilot (Gemini 3.8 Flash RAG)
- **Authoritative Statutory Grounding**:
  - **FinCEN / Bank Secrecy Act**: 31 CFR § 1020.320 (SAR filing requirement), 31 CFR § 1010.311 (CTR $\$10,000$ limit), 31 U.S.C. § 5324 (Felony structuring prohibition).
  - **FATF 40 Recommendations**: Recommendation 16 (Travel Rule for wire transfers $> \$1,000 / \text{€}1,000$), Recommendations 10 & 12 (PEPs & Enhanced Due Diligence).
  - **PMLA 2002 / RBI Master Directions**: Mandatory Cash Transaction Reports for $> \text{₹}10\text{ Lakhs}$, and 7-day Suspicious Transaction Report (STR) deadlines to FIU-IND.
  - **SEC Rule 17a-8 / FINRA 3310**: Market manipulation, wash trading, and broker-dealer SAR-SF filings.
  - **GDPR Article 22 & EU AI Act (Regulation 2024/1689)**: Mandatory human oversight for high-risk automated decision-making.
- **Anti-Hallucination Mode**: Side-by-side legal inspector displaying verbatim statutory excerpts and confidence ratings.
- **Automated SAR Part V Drafter**: Formulates complete FinCEN Form 111 narratives with Executive Summary, Chronology of Events, Anomaly Signals, Statutory Basis, and Exhibit Retention.

### 4. Audit Governance & Regulatory Pipeline Oversight
- **SAR Regulatory Pipeline Donut Chart (Recharts)**:
  - Donut chart displaying the real-time breakdown of SAR cases across lifecycle stages: **Filed** (Emerald), **Drafted** (Indigo), **Pending Triage** (Amber), and **Cleared / Cleared Overrides** (Slate).
  - Center stat overlay showing total pipeline volume and percentage formally filed.
  - Interactive slice filtering: clicking any donut segment filters the audit log to that category.
  - Compliance clocks tracking FinCEN 30-day filing deadlines and 5-year exhibit retention rules.
- **Cryptographic Audit Ledger**:
  - Immutable ledger recording every human override with analyst sign-offs, risk scores, and reasons.
  - Displays SHA-256 hash signatures on each row with real-time chain verification modal.
  - RFC 4180-compliant CSV export for periodic supervisory bank examinations.

---

## 🧪 Comprehensive Automated Testing Suite

RiskGuard AI includes an automated test runner (`tests/run-all-tests.ts`) executing 18 tests across 4 suites:

### Suite 1: ML Risk Engine & Fraud Typologies
- **Test 1.1**: Normal commerce invoice scores $\le 25$ points with `LOW` risk band and auto-approval.
- **Test 1.2**: $\$9,850$ cash transfer triggers `MULE_STRUCTURING_CTR_EVASION` with score $\ge 75$.
- **Test 1.3**: $>90\%$ origin balance drain to new beneficiary triggers `CRITICAL` risk band.
- **Test 1.4**: OFAC/FATF PEP watchlist hit triggers mandatory $+35$ point escalation.
- **Test 1.5**: Customer account tenure mitigation correctly reduces risk score.

### Suite 2: Statutory RAG Knowledge Base
- **Test 2.1**: FinCEN 31 CFR § 1020.320 specifies $\$5,000$ threshold and 30-day timeline.
- **Test 2.2**: FATF Recommendation 16 specifies $€1,000 / \$1,000$ Travel Rule threshold.
- **Test 2.3**: PMLA 2002 (India) specifies ₹10 Lakhs CTR requirement and 7-day STR deadline.
- **Test 2.4**: EU AI Act & GDPR Art. 22 mandate human oversight for automated account restrictions.

### Suite 3: Cryptographic Ledger & Non-Repudiation
- **Test 3.1**: SHA-256 output matches standard 64-character hexadecimal digest.
- **Test 3.2**: Sequential uncorrupted audit chain verifies with 100% validity (`isValid: true`).
- **Test 3.3**: Altering an investigator's reason in an existing block breaks the hash chain and flags tamper detection.

### Suite 4: Security Boundaries & API Validation
- **Test 4.1**: `/api/decisions/verify-integrity` returns status 200 with `isValid: true`.
- **Test 4.2**: `/api/security/health` returns status 200 with `status: "SECURE"`.
- **Test 4.3**: `/api/transactions` returns valid schema with non-empty transaction feed.
- **Test 4.4**: `/api/risk/evaluate` bounds calculated score strictly within $[0, 100]$.
- **Test 4.5**: Rejects unauthorized compliance actions with `400 Bad Request`.
- **Test 4.6**: `/api/transactions/stream-tick` generates compliant PaySim synthetic transaction.

### Running Tests
Execute the full test suite from the terminal:
```bash
npm test
```

---

## 🛠️ Tech Stack

- **Backend**: Node.js 22, Express 4, `@google/genai` (Gemini 3.8 Flash), Node.js `crypto` module.
- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS 4.
- **Charts & Data Visualization**: Recharts 3.x (`LineChart`, `ComposedChart`, `PieChart`, `Area`, `ResponsiveContainer`).
- **Audio Synthesizer**: Web Audio API oscillator synthesis (zero external audio files).
- **Icons**: Lucide React.
- **Typography**: Plus Jakarta Sans & JetBrains Mono (with `tabular-nums` for numerical data).

---

## 💻 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 3. Development Server
Start the dev server (binds to `0.0.0.0:3000`):
```bash
npm run dev
```

### 4. Run Test Suite & Type Checker
```bash
npm test
npm run lint
```

### 5. Production Build & Start
```bash
npm run build
npm run start
```
