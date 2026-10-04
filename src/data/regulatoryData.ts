export interface RegulatoryDocument {
  id: string;
  framework: string;
  jurisdiction: string;
  code: string;
  title: string;
  section: string;
  pageOrArticle: string;
  category: 'AML_CFT' | 'FRAUD_CRIME' | 'REPORTING_THRESHOLDS' | 'GOVERNANCE_AI' | 'SANCTIONS_PEP';
  thresholdSummary: string;
  keyDirectives: string[];
  fullTextExcerpt: string;
}

export const REGULATORY_DATABASE: RegulatoryDocument[] = [
  {
    id: "fincen-sar-1020-320",
    framework: "FinCEN / Bank Secrecy Act",
    jurisdiction: "United States (Federal)",
    code: "31 CFR § 1020.320",
    title: "Reports by Banks of Suspicious Transactions (SAR Filing Requirement)",
    section: "Section 1020.320(a)(2)",
    pageOrArticle: "Part V Narrative Guidelines",
    category: "AML_CFT",
    thresholdSummary: "$5,000+ when suspect is identified; $25,000+ if suspect unknown; $2,000+ for MSBs.",
    keyDirectives: [
      "File within 30 calendar days from initial date of detection of facts that constitute a basis for filing.",
      "If no suspect is identified on date of detection, filing may be delayed up to 60 calendar days.",
      "Strict prohibition against disclosing to suspect or third parties that a SAR has been filed ('Anti-Tipping-Off' rule under 31 U.S.C. 5318(g)(2)).",
      "Retain copy of SAR and all supporting documentation for a period of 5 years from date of filing."
    ],
    fullTextExcerpt: `Every bank shall file with FinCEN, to the extent and in the manner required by this section, a report of any suspicious transaction relevant to a possible violation of law or regulation. A transaction requires filing under this section if it involves or aggregates at least $5,000 in funds or other assets, and the bank knows, suspects, or has reason to suspect that:
(i) The transaction involves funds derived from illegal activities or is conducted to disguise funds;
(ii) The transaction is designed to evade any requirements under the Bank Secrecy Act;
(iii) The transaction has no business or apparent lawful purpose or is not the sort in which the particular customer would normally be expected to engage, and the bank knows of no reasonable explanation for the transaction after examining the available facts.`
  },
  {
    id: "fincen-ctr-1010-311",
    framework: "FinCEN / Bank Secrecy Act",
    jurisdiction: "United States (Federal)",
    code: "31 CFR § 1010.311 & 31 U.S.C. § 5324",
    title: "Currency Transaction Reporting (CTR) & Anti-Structuring Prohibition",
    section: "Section 1010.311 / Section 5324(a)",
    pageOrArticle: "31 U.S.C. § 5324",
    category: "REPORTING_THRESHOLDS",
    thresholdSummary: "Cash deposits, withdrawals, or currency exchange aggregate exceeding $10,000 in a single business day.",
    keyDirectives: [
      "Mandatory CTR (Form 112) filed within 15 days of the aggregate currency transaction exceeding $10,000.",
      "Aggregation Rule: Multiple currency transactions conducted by or on behalf of the same person on the same day must be aggregated.",
      "Anti-Structuring (Smurfing): It is a federal felony under 31 U.S.C. § 5324 to structure, assist in structuring, or attempt to structure any transaction with one or more domestic financial institutions for the purpose of evading the $10,000 reporting threshold.",
      "Smurfing patterns (e.g. repeated $9,500, $9,800 deposits across branches) mandate an immediate SAR regardless of transaction execution success."
    ],
    fullTextExcerpt: `Each financial institution other than a casino shall file a report of each deposit, withdrawal, exchange of currency or other payment or transfer, by, through, or to such financial institution which involves a transaction in currency of more than $10,000. 
Anti-Structuring: No person shall, for the purpose of evading the reporting requirements of section 5313(a) or 5325: (1) cause or attempt to cause a domestic financial institution to fail to file a report; (2) cause or attempt to cause a domestic financial institution to file a report that contains a material omission or misstatement; or (3) structure or assist in structuring, or attempt to structure or assist in structuring, any transaction with one or more domestic financial institutions.`
  },
  {
    id: "fatf-rec-16-travel-rule",
    framework: "FATF 40 Recommendations",
    jurisdiction: "International (FATF / Global Standard)",
    code: "FATF Recommendation 16",
    title: "Wire Transfers & Virtual Asset Service Providers (The Travel Rule)",
    section: "Recommendation 16 & Interpretive Note",
    pageOrArticle: "INR. 16, Paras 6-18",
    category: "AML_CFT",
    thresholdSummary: "Wire transfers and Virtual Asset transfers exceeding USD/EUR 1,000 (or domestic equivalent).",
    keyDirectives: [
      "Originating financial institutions must obtain and hold verified originator information (name, account number, physical address, national identity number or customer ID).",
      "Originating institutions must transmit originator and beneficiary information immediately and securely to the beneficiary institution.",
      "Beneficiary institutions must implement risk-based procedures to detect missing required information and decide whether to execute, reject, or freeze transactions.",
      "Applies equally to Virtual Asset Service Providers (VASPs), crypto custodians, and cross-border payment processors."
    ],
    fullTextExcerpt: `Countries should ensure that financial institutions include required and accurate originator information, and required beneficiary information, on wire transfers and related messages, and that the information remains with the wire transfer or related message through the payment chain.
Countries should ensure that beneficiary financial institutions detect incoming cross-border wire transfers that lack required originator or beneficiary information, and take risk-based measures including freezing or filing a suspicious transaction report.`
  },
  {
    id: "fatf-rec-10-pep-edd",
    framework: "FATF 40 Recommendations",
    jurisdiction: "International (FATF / Global Standard)",
    code: "FATF Recommendations 10 & 12",
    title: "Customer Due Diligence (CDD) and Politically Exposed Persons (PEPs)",
    section: "Recommendations 10, 12",
    pageOrArticle: "Rec. 12 & Interpretive Note",
    category: "SANCTIONS_PEP",
    thresholdSummary: "Applies to all accounts and business relationships regardless of transaction size.",
    keyDirectives: [
      "Institutions must maintain risk management systems to determine whether a customer, beneficial owner, or close associate is a PEP.",
      "Obtain senior management approval before establishing (or continuing) business relationships with PEPs.",
      "Take reasonable measures to establish the source of wealth and source of funds involved in the transaction.",
      "Conduct enhanced ongoing monitoring of the business relationship throughout its lifecycle."
    ],
    fullTextExcerpt: `Financial institutions should be required, in relation to foreign PEPs (whether as customer or beneficial owner), in addition to performing normal customer due diligence measures, to:
(a) have appropriate risk-management systems to determine whether the customer or beneficial owner is a PEP;
(b) obtain senior management approval for establishing (or continuing, for existing customers) such business relationships;
(c) take reasonable measures to establish the source of wealth and source of funds; and
(d) conduct enhanced ongoing monitoring of the business relationship.`
  },
  {
    id: "pmla-rbi-str-ctr-10lakh",
    framework: "PMLA 2002 / RBI Master Directions (FIU-IND)",
    jurisdiction: "India",
    code: "PMLA Section 12 / RBI Master Direction Know Your Customer (KYC)",
    title: "Reporting Obligations for Cash Transactions exceeding ₹10 Lakhs & STR Filing",
    section: "Rule 3(1)(A) & Rule 8",
    pageOrArticle: "Chapter VI, Section 35",
    category: "REPORTING_THRESHOLDS",
    thresholdSummary: "Cash transactions > ₹10,00,000 ($12,000 USD equiv); Cross-border wire > ₹5,00,000; All suspicious transactions regardless of value.",
    keyDirectives: [
      "Cash Transaction Report (CTR): Monthly report submitted to FIU-IND by the 15th of the succeeding month for all cash transactions exceeding ₹10 Lakhs or series of connected cash transactions totaling over ₹10 Lakhs.",
      "Suspicious Transaction Report (STR): Must be furnished to Director, FIU-IND not later than 7 working days on being satisfied that the transaction is suspicious.",
      "Strict confidentiality: Employees and directors are prohibited from disclosing that an STR or related information is being or has been furnished to the authorities.",
      "Cross-Border Wire Transfer Report (CBWTR): Mandatory filing for all foreign in/out wire transfers > ₹5 Lakhs."
    ],
    fullTextExcerpt: `Every reporting entity shall furnish to the Director, Financial Intelligence Unit - India (FIU-IND) information of:
(A) All cash transactions of the value of more than rupees ten lakhs or its equivalent in foreign currency;
(B) All series of cash transactions integrally connected to each other which have been valued below rupees ten lakhs or its equivalent where such series of transactions have taken place within a month and the monthly aggregate exceeds rupees ten lakhs;
(C) All suspicious transactions whether or not made in cash, within seven working days of arriving at a conclusion of suspicion.`
  },
  {
    id: "sec-finra-aml-rule-17a8",
    framework: "SEC / FINRA",
    jurisdiction: "United States (Securities & Capital Markets)",
    code: "17 CFR § 240.17a-8 & FINRA Rule 3310",
    title: "Financial Recordkeeping and Reporting of Currency and Foreign Transactions (SAR-SF)",
    section: "Rule 17a-8 / FINRA 3310",
    pageOrArticle: "Securities Exchange Act of 1934",
    category: "FRAUD_CRIME",
    thresholdSummary: "Securities transactions > $5,000 indicating market manipulation, wash sales, or insider trading.",
    keyDirectives: [
      "Every registered broker or dealer shall comply with reporting, recordkeeping and record retention regulations under BSA.",
      "Requires automated surveillance algorithms to detect layering, spoofing, wash trading, and unauthorized third-party journal transfers.",
      "Independent testing of AML compliance program must be conducted annually by outside personnel.",
      "SAR-SF narratives must document equity/options ticker symbols, trade execution timestamps, order routing IDs, and beneficial ownership linkages."
    ],
    fullTextExcerpt: `Every registered broker or dealer shall comply with the requirements of 31 CFR Part 1010 through 1026. A broker-dealer must file a Form SAR-SF for any transaction conducted or attempted by, at, or through the broker-dealer involving or aggregating at least $5,000 that the broker-dealer knows, suspects, or has reason to suspect involves funds derived from illegal activity or involves market manipulation, wash sales, or securities fraud.`
  },
  {
    id: "gdpr-art-22-eu-ai-act",
    framework: "EU AI Act & GDPR",
    jurisdiction: "European Union / Global Impact",
    code: "GDPR Article 22 & EU AI Act (Regulation 2024/1689)",
    title: "Automated Decision-Making, Human Oversight, and Anti-Hallucination Guardrails",
    section: "Article 22(3) GDPR / Annex III EU AI Act",
    pageOrArticle: "High-Risk AI Systems in Financial Services",
    category: "GOVERNANCE_AI",
    thresholdSummary: "Mandatory human review for automated account freezes, credit rejections, or high-risk AML determinations.",
    keyDirectives: [
      "Right to Human Intervention: Data subjects have the right not to be subject to a decision based solely on automated processing which produces legal effects.",
      "The controller must implement suitable measures to safeguard data subject rights, including at least the right to obtain human intervention, express point of view, and contest the decision.",
      "EU AI Act High-Risk Classification: AI systems intended to be used for credit scoring or risk assessment of natural persons are classified as High-Risk.",
      "Mandatory Explainability: Any ML/algorithmic score must provide explainable factor weights (e.g. SHAP values, feature importance) rather than opaque 'black box' scores."
    ],
    fullTextExcerpt: `GDPR Article 22: The data subject shall have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning him or her or similarly significantly affects him or her. 
The data controller shall implement suitable measures to safeguard the data subject's rights and freedoms and legitimate interests, at least the right to obtain human intervention on the part of the controller, to express his or her point of view and to contest the decision.
EU AI Act: AI systems used in evaluation of creditworthiness or risk assessment must ensure human oversight capabilities, high accuracy, cybersecurity, and traceability of algorithmic outputs.`
  }
];

export interface SearchMatch {
  doc: RegulatoryDocument;
  relevanceScore: number;
  matchedSnippets: string[];
}

export function searchRegulatoryDatabase(query: string, categoryFilter?: string): SearchMatch[] {
  const normalizedQuery = query.toLowerCase();
  const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 2);

  const results: SearchMatch[] = [];

  for (const doc of REGULATORY_DATABASE) {
    if (categoryFilter && categoryFilter !== 'ALL' && doc.category !== categoryFilter) {
      continue;
    }

    let score = 0;
    const matchedSnippets: string[] = [];

    // Exact matches
    if (doc.title.toLowerCase().includes(normalizedQuery)) score += 35;
    if (doc.code.toLowerCase().includes(normalizedQuery)) score += 40;
    if (doc.thresholdSummary.toLowerCase().includes(normalizedQuery)) score += 30;

    // Token matching in full text and directives
    for (const token of queryTokens) {
      if (doc.fullTextExcerpt.toLowerCase().includes(token)) score += 10;
      if (doc.title.toLowerCase().includes(token)) score += 12;
      if (doc.code.toLowerCase().includes(token)) score += 15;
      for (const dir of doc.keyDirectives) {
        if (dir.toLowerCase().includes(token)) score += 8;
      }
    }

    // Specific domain keywords
    if (normalizedQuery.includes("10 lakh") || normalizedQuery.includes("₹10") || normalizedQuery.includes("pmla") || normalizedQuery.includes("fiu")) {
      if (doc.id.includes("pmla")) score += 60;
    }
    if (normalizedQuery.includes("sar") || normalizedQuery.includes("suspicious activity report") || normalizedQuery.includes("30 day")) {
      if (doc.id.includes("sar")) score += 50;
    }
    if (normalizedQuery.includes("ctr") || normalizedQuery.includes("currency") || normalizedQuery.includes("structuring") || normalizedQuery.includes("smurfing") || normalizedQuery.includes("10,000")) {
      if (doc.id.includes("ctr") || doc.id.includes("pmla")) score += 45;
    }
    if (normalizedQuery.includes("travel rule") || normalizedQuery.includes("crypto") || normalizedQuery.includes("vasp") || normalizedQuery.includes("wire")) {
      if (doc.id.includes("travel-rule")) score += 55;
    }
    if (normalizedQuery.includes("gdpr") || normalizedQuery.includes("ai act") || normalizedQuery.includes("human") || normalizedQuery.includes("override") || normalizedQuery.includes("black box")) {
      if (doc.id.includes("gdpr")) score += 60;
    }

    if (score > 15) {
      // Find snippets
      const sentences = doc.fullTextExcerpt.split('\n');
      for (const s of sentences) {
        if (s.trim().length > 20) {
          matchedSnippets.push(s.trim());
        }
      }
      results.push({
        doc,
        relevanceScore: Math.min(score, 100),
        matchedSnippets: matchedSnippets.slice(0, 3)
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return results.slice(0, 4);
}
