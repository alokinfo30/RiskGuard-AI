# RiskGuard AI — Risk, Fraud & Regulatory Intelligence Copilot

RiskGuard AI is an enterprise-grade financial intelligence copilot that combines generative AI with deep multi-factor data analytics. Designed for financial institutions, fintech payment processors, and anti-money laundering (AML) compliance teams, it detects bad actors, predicts transaction risks, automates statutory reporting, and enforces regulatory governance across global jurisdictions.

---

## 🏛️ System Architecture

RiskGuard AI operates two synchronized pipelines:

```
                      ┌───────────────────────────────────────────────┐
                      │          Synthetic Transaction Influx         │
                      │       (Kaggle PaySim & Credit Card Data)      │
                      └──────────────────────┬────────────────────────┘
                                             │
                       ┌─────────────────────┴────────────────────┐
                       ▼                                          ▼
     ┌───────────────────────────────────┐      ┌──────────────────────────────────┐
     │        Analytics Pipeline         │      │          RAG Pipeline            │
     ├───────────────────────────────────┤      ├──────────────────────────────────┤
     │ • Multi-Factor Anomaly Scoring    │      │ • FinCEN, FATF, PMLA, GDPR Store │
     │ • Balance Drain Detection         │      │ • Strict Statutory Citations     │
     │ • SHAP Factor Weight Impact       │      │ • Gemini 3.8 Flash Copilot       │
     │ • Recharts 24h Trend & Heatmap    │      │ • Automated SAR Part V Drafter   │
     └─────────────────┬─────────────────┘      └─────────────────┬────────────────┘
                       │                                          │
                       └─────────────────────┬────────────────────┘
                                             ▼
                      ┌───────────────────────────────────────────────┐
                      │    Human-in-the-Loop Adjudication & Ledger    │
                      │  (Multi-Select Bulk Actions & CSV Export)     │
                      └───────────────────────────────────────────────┘
```

1. **The Analytics Pipeline**: Streaming transactions flow in $\rightarrow$ Machine learning heuristics evaluate origin/beneficiary balance deltas, velocity spikes, and network telemetry $\rightarrow$ Flags anomalies and computes an explainable 0–100 Risk Score.
2. **The RAG Pipeline (Retrieval-Augmented Generation)**: Natural language queries $\rightarrow$ Vector & keyword retrieval across financial regulatory statutes $\rightarrow$ Exact section citations with anti-hallucination grounding $\rightarrow$ Professional compliance summaries and FinCEN SAR drafts.

---

## 🚀 Key Capabilities & Modules

### 1. Real-Time Fraud Monitoring & Anomaly Surveillance
- **Live PaySim Ingestion Stream**: Continuously processes synthetic transactions featuring balance depletion, destination account age, and channel typology (Transfer, Cash Out, Payment, Debit).
- **24-Hour Critical Risk Line Chart (Recharts)**:
  - Visualizes hourly frequency of transactions scoring $\ge 80$ risk points.
  - Dual-series display: **Critical Risk** (solid crimson curve) and **High Risk** (dashed orange curve).
  - Dynamic statutory surge threshold reference line ($8\text{ alerts/hour}$) to catch off-hours money laundering bursts.
  - KPI summary strip: Aggregated 24h volume, peak anomaly hour, baseline alert limits, and current threat state.
- **Risk Heatmap (Spatio-Temporal Density Radar)**:
  - Visualizes transaction density and anomaly concentration across key financial corridors (US, Germany, India, Cyprus, Netherlands, UAE, Romania, UK) and 6 diurnal time blocks across the day.
  - Dynamic color scale indicating risk density from zero to critical surge levels.
  - Interactive cell inspection displaying volume in USD, critical risk counts, and top detected flags.
- **Real-Time Alert Dispatcher & Synthesizer Chimes**:
  - Accessible via the header bell icon with persistent configuration in `localStorage`.
  - Web Audio API dual-tone synthesized alert chime on incoming Critical transactions (zero external audio dependencies).
  - Direct push notification toast banners allowing instant one-click jump into the case inspection drawer.
  - Configurable sensitivity threshold (Critical only vs High & Critical) and chime volume.
- **Multi-Select Bulk Adjudication**:
  - Analysts can select multiple transactions across the queue via row checkboxes or the master header toggle.
  - Docked batch toolbar with cumulative financial value calculation.
  - One-click bulk operations: **Bulk Approve**, **Bulk Request Step-Up KYC**, **Bulk Freeze Beneficiaries**, and **Bulk Escalate SAR**.
  - Modal to input unified compliance findings and tag records as False Positives for model retraining.

### 2. Multi-Factor Risk Intelligence Sandbox
- **Interactive Feature Tuning**: Sliders for transaction amounts, origin liquid balances, customer account tenure, beneficiary age, velocity within the last hour, and network flags.
- **SHAP-Style Feature Impact Waterfall**: Granular attribution of added/subtracted risk points (e.g., $+35$ pts CTR evasion, $+25$ pts balance drain, $+20$ pts disposable mule account, $-20$ pts tenure mitigation).
- **Pre-Engineered Benchmark Scenarios**:
  - *CTR Smurfing Evasion*: $9,850 engineered under $10,000 threshold to a 3-day-old beneficiary.
  - *Account Takeover (ATO) Burst*: $42,000 rapid wire following credential reset and datacenter proxy routing.
  - *B2B Commercial False Positive*: $125,000 invoice payout by a 48-month established corporate account.
  - *PMLA India ₹10 Lakhs Offshore Wire*: ₹12,50,000 cross-border transfer triggering Rule 3(1)(A).

### 3. Regulatory Guard Copilot (RAG Engine)
- **Authoritative Statutory Grounding**:
  - **FinCEN / Bank Secrecy Act**: 31 CFR § 1020.320 (SAR 30-day filing clock), 31 CFR § 1010.311 (CTR $10,000 threshold), and 31 U.S.C. § 5324 (Anti-Structuring felony rules).
  - **FATF 40 Recommendations**: Recommendation 16 (Travel Rule for wire & crypto transfers $> \$1,000$), Recommendation 10 & 12 (PEPs & Enhanced Due Diligence).
  - **PMLA 2002 / RBI Master Directions**: Mandatory Cash Transaction Reports for $> ₹10\text{ Lakhs}$, and 7-day Suspicious Transaction Report (STR) deadlines to FIU-IND.
  - **SEC Rule 17a-8 / FINRA 3310**: Securities market manipulation and SAR-SF filings.
  - **GDPR Article 22 & EU AI Act (Regulation 2024/1689)**: Mandatory human oversight for automated account freezes and high-risk AI algorithmic transparency.
- **Strict Anti-Hallucination Mode**: Side-by-side legal inspector displaying verbatim statutory excerpts and confidence ratings.
- **Automated SAR Part V Drafter**: Formulates complete FinCEN Form 111 narratives with Executive Summary, Chronology of Events, Anomaly Signals, Statutory Violations, and Law Enforcement Exhibit Retention.

### 4. Regulatory Knowledge Base
- Searchable catalog of compliance laws, monetary filing thresholds, mandatory reporting deadlines, and statutory penalty notes.

### 5. Audit Governance & Human-in-the-Loop Ledger
- **Multi-Select CSV Report Export**:
  - Select individual audit records or export the entire filtered ledger for supervisory banking examinations and periodic regulatory filings.
  - Generates RFC 4180-compliant CSV files with cryptographic audit IDs, UTC timestamps, case references, actions taken, investigator sign-offs, and legal authority citations.
- **False-Positive Feedback Loop**: Tracks override percentages and logs retraining vectors to improve machine learning models over time.

---

## 🛠️ Tech Stack

- **Backend**: Node.js & Express (`server.ts`) with `@google/genai` (Gemini 3.8 Flash), handling RAG legal search, SAR drafting, and bulk decision logging.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4.
- **Charts & Visualization**: Recharts (ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine).
- **Audio Synthesizer**: Web Audio API oscillator synthesis for low-latency acoustic alerting.
- **Icons**: Lucide React.
- **Typography**: Plus Jakarta Sans & JetBrains Mono (tabular figures for financial precision).

---

## 💻 Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Run the Development Server
Start the full-stack server (runs on port 3000):
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
npm run start
```
