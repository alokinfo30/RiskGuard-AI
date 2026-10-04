export type TransactionType = 'TRANSFER' | 'CASH_OUT' | 'PAYMENT' | 'DEBIT' | 'CASH_IN';
export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DecisionStatus = 'PENDING_REVIEW' | 'APPROVED' | 'STEP_UP_KYC' | 'ACCOUNT_FROZEN' | 'SAR_FILED';

export interface FeatureWeight {
  factor: string;
  deltaPoints: number;
  description: string;
  category: 'VELOCITY' | 'BALANCE' | 'GEO_DEVICE' | 'SANCTIONS' | 'STRUCTURING' | 'HISTORY';
}

export interface TransactionRecord {
  id: string;
  timestamp: string;
  type: TransactionType;
  amount: number;
  currency: string;
  nameOrig: string;
  origAccountType: 'INDIVIDUAL' | 'BUSINESS' | 'MERCHANT';
  origCustomerTenureMonths: number;
  oldbalanceOrg: number;
  newbalanceOrig: number;
  nameDest: string;
  destAccountType: 'INDIVIDUAL' | 'BUSINESS' | 'MERCHANT' | 'CRYPTO_EXCHANGE' | 'OFFSHORE_CORRESPONDENT';
  destAccountAgeDays: number;
  oldbalanceDest: number;
  newbalanceDest: number;
  riskScore: number;
  riskBand: RiskBand;
  fraudFlags: string[];
  featureWeights: FeatureWeight[];
  device: {
    ip: string;
    geoCountry: string;
    city: string;
    isVpnOrTor: boolean;
    deviceFingerprintTrust: number; // 0 to 100
  };
  regulatoryWatchlist: {
    pepMatch: boolean;
    sanctionListHit: boolean;
    ctrThresholdExceeded: boolean;
    structuringSuspicion: boolean;
  };
  status: DecisionStatus;
  analystDecision?: {
    action: string;
    note: string;
    timestamp: string;
    analyst: string;
    falsePositiveMarked: boolean;
  };
}

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "TX-7801-PS",
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    type: "TRANSFER",
    amount: 9850,
    currency: "USD",
    nameOrig: "C839201948 (Victor Sterling)",
    origAccountType: "INDIVIDUAL",
    origCustomerTenureMonths: 3,
    oldbalanceOrg: 10200,
    newbalanceOrig: 350,
    nameDest: "C902938120 (NeoPay Escrow LLC)",
    destAccountType: "CRYPTO_EXCHANGE",
    destAccountAgeDays: 4,
    oldbalanceDest: 0,
    newbalanceDest: 9850,
    riskScore: 89,
    riskBand: "CRITICAL",
    fraudFlags: [
      "MULE_STRUCTURING_CTR_EVASION",
      "NEW_DESTINATION_ACCOUNT",
      "ACCOUNT_BALANCE_DRAINED_TO_NEAR_ZERO",
      "CRYPTO_VASP_TRANSFER"
    ],
    featureWeights: [
      { factor: "Amount $9,850 engineered just below $10,000 CTR statutory limit", deltaPoints: 34, description: "Matches 31 CFR § 1010.311 structuring pattern", category: "STRUCTURING" },
      { factor: "Destination account created 4 days ago with zero prior activity", deltaPoints: 26, description: "Classic money mule conduit profile", category: "BALANCE" },
      { factor: "Drain ratio 96.5% of total liquid checking balance in single call", deltaPoints: 18, description: "Paysim anomaly signature (balance drain)", category: "BALANCE" },
      { factor: "Tor Exit Node / Datacenter VPN proxy detected", deltaPoints: 11, description: "IP masking originating from Amsterdam relay", category: "GEO_DEVICE" }
    ],
    device: {
      ip: "185.220.101.42",
      geoCountry: "Netherlands",
      city: "Amsterdam",
      isVpnOrTor: true,
      deviceFingerprintTrust: 14
    },
    regulatoryWatchlist: {
      pepMatch: false,
      sanctionListHit: false,
      ctrThresholdExceeded: false,
      structuringSuspicion: true
    },
    status: "PENDING_REVIEW"
  },
  {
    id: "TX-7802-PS",
    timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    type: "CASH_OUT",
    amount: 145000,
    currency: "USD",
    nameOrig: "C219482910 (AeroTech Ventures)",
    origAccountType: "BUSINESS",
    origCustomerTenureMonths: 48,
    oldbalanceOrg: 890000,
    newbalanceOrig: 745000,
    nameDest: "M492019482 (First Apex Merchant)",
    destAccountType: "MERCHANT",
    destAccountAgeDays: 780,
    oldbalanceDest: 320000,
    newbalanceDest: 465000,
    riskScore: 18,
    riskBand: "LOW",
    fraudFlags: ["HIGH_VALUE_CTR_TRIGGER"],
    featureWeights: [
      { factor: "Longstanding business relationship (48 months clean history)", deltaPoints: -28, description: "Established B2B treasury flow", category: "HISTORY" },
      { factor: "Consistent corporate device & IP subnet match", deltaPoints: -16, description: "Known corporate office hardware identifier", category: "GEO_DEVICE" },
      { factor: "Exceeds $10,000 threshold requiring routine FinCEN Form 112 CTR", deltaPoints: 8, description: "Non-suspicious statutory threshold filing", category: "STRUCTURING" }
    ],
    device: {
      ip: "199.168.10.4",
      geoCountry: "United States",
      city: "San Francisco",
      isVpnOrTor: false,
      deviceFingerprintTrust: 96
    },
    regulatoryWatchlist: {
      pepMatch: false,
      sanctionListHit: false,
      ctrThresholdExceeded: true,
      structuringSuspicion: false
    },
    status: "APPROVED",
    analystDecision: {
      action: "APPROVED",
      note: "Routine quarterly supplier invoice payout. Statutory CTR logged automatically.",
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      analyst: "Sarah Jenkins (Senior Compliance VP)",
      falsePositiveMarked: false
    }
  },
  {
    id: "TX-7803-PS",
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    type: "TRANSFER",
    amount: 1250000,
    currency: "INR",
    nameOrig: "C401928371 (Rajiv Malhotra)",
    origAccountType: "INDIVIDUAL",
    origCustomerTenureMonths: 14,
    oldbalanceOrg: 1300000,
    newbalanceOrig: 50000,
    nameDest: "C774920194 (Al-Barakah Trading Co)",
    destAccountType: "OFFSHORE_CORRESPONDENT",
    destAccountAgeDays: 12,
    oldbalanceDest: 120000,
    newbalanceDest: 1370000,
    riskScore: 94,
    riskBand: "CRITICAL",
    fraudFlags: [
      "PMLA_10_LAKH_THRESHOLD_EXCEEDED",
      "OFFSHORE_HIGH_RISK_JURISDICTION",
      "VELOCITY_BURST_AFTER_PASSWORD_RESET",
      "MANDATORY_STR_CANDIDATE"
    ],
    featureWeights: [
      { factor: "Exceeds PMLA ₹10 Lakhs ($15k USD equiv) cash/transfer threshold", deltaPoints: 36, description: "RBI Master Direction Rule 3(1)(A) trigger", category: "STRUCTURING" },
      { factor: "Account takeover signal: Password reset 14 mins prior to wire", deltaPoints: 30, description: "Critical session velocity spike", category: "VELOCITY" },
      { factor: "Beneficiary located in FATF Grey-List transshipment port", deltaPoints: 20, description: "High-risk cross-border jurisdiction", category: "GEO_DEVICE" },
      { factor: "New unrecognized mobile device identifier", deltaPoints: 8, description: "Unpaired Android emulator fingerprint", category: "GEO_DEVICE" }
    ],
    device: {
      ip: "91.240.118.15",
      geoCountry: "Cyprus",
      city: "Limassol",
      isVpnOrTor: true,
      deviceFingerprintTrust: 8
    },
    regulatoryWatchlist: {
      pepMatch: false,
      sanctionListHit: true,
      ctrThresholdExceeded: true,
      structuringSuspicion: true
    },
    status: "PENDING_REVIEW"
  },
  {
    id: "TX-7804-PS",
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    type: "PAYMENT",
    amount: 4200,
    currency: "USD",
    nameOrig: "C559201948 (Elena Rostova)",
    origAccountType: "INDIVIDUAL",
    origCustomerTenureMonths: 8,
    oldbalanceOrg: 6500,
    newbalanceOrig: 2300,
    nameDest: "M102938192 (Aura Luxury Jewelers)",
    destAccountType: "MERCHANT",
    destAccountAgeDays: 1400,
    oldbalanceDest: 45000,
    newbalanceDest: 49200,
    riskScore: 68,
    riskBand: "HIGH",
    fraudFlags: [
      "PEP_CLOSE_ASSOCIATE_MATCH",
      "LUXURY_GOODS_HIGH_RISK_MCC",
      "GEOLOCATION_IMPOSSIBILITY"
    ],
    featureWeights: [
      { factor: "OFAC / PEP match on immediate family relative of sanctioned official", deltaPoints: 40, description: "FATF Recommendation 12 EDD requirement", category: "SANCTIONS" },
      { factor: "High-value luxury jewelry MCC 5944 (high money-laundering convertibility)", deltaPoints: 18, description: "Portable asset conversion risk", category: "HISTORY" },
      { factor: "Geographic jump: Card swiped in Dubai 45 mins after New York online login", deltaPoints: 22, description: "Impossible flight travel velocity", category: "GEO_DEVICE" },
      { factor: "Verified multi-factor hardware token confirmation", deltaPoints: -12, description: "FIDO2 security key authentication", category: "GEO_DEVICE" }
    ],
    device: {
      ip: "86.96.224.12",
      geoCountry: "United Arab Emirates",
      city: "Dubai",
      isVpnOrTor: false,
      deviceFingerprintTrust: 45
    },
    regulatoryWatchlist: {
      pepMatch: true,
      sanctionListHit: false,
      ctrThresholdExceeded: false,
      structuringSuspicion: false
    },
    status: "PENDING_REVIEW"
  },
  {
    id: "TX-7805-PS",
    timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    type: "TRANSFER",
    amount: 1540,
    currency: "EUR",
    nameOrig: "C682019483 (Marcus Thorne)",
    origAccountType: "INDIVIDUAL",
    origCustomerTenureMonths: 22,
    oldbalanceOrg: 4300,
    newbalanceOrig: 2760,
    nameDest: "C392019481 (Sophie Klein)",
    destAccountType: "INDIVIDUAL",
    destAccountAgeDays: 320,
    oldbalanceDest: 890,
    newbalanceDest: 2430,
    riskScore: 24,
    riskBand: "LOW",
    fraudFlags: ["TRAVEL_RULE_EUR_1000_THRESHOLD"],
    featureWeights: [
      { factor: "Established domestic P2P peer payment pattern", deltaPoints: -18, description: "Bi-monthly recurring personal transfer", category: "HISTORY" },
      { factor: "Exceeds EUR 1,000 Travel Rule threshold (complete KYC metadata attached)", deltaPoints: 4, description: "FATF Rec 16 compliance verified", category: "STRUCTURING" }
    ],
    device: {
      ip: "82.165.197.1",
      geoCountry: "Germany",
      city: "Frankfurt",
      isVpnOrTor: false,
      deviceFingerprintTrust: 88
    },
    regulatoryWatchlist: {
      pepMatch: false,
      sanctionListHit: false,
      ctrThresholdExceeded: false,
      structuringSuspicion: false
    },
    status: "APPROVED"
  }
];

export function computeRiskScore(params: {
  amount: number;
  currency: string;
  type: TransactionType;
  origAccountAgeMonths: number;
  destAccountAgeDays: number;
  oldbalanceOrig: number;
  isVpn: boolean;
  pepWatchlist: boolean;
  priorChargebacks: number;
  velocity1Hour: number;
  isCrossBorder: boolean;
}): {
  riskScore: number;
  riskBand: RiskBand;
  flags: string[];
  weights: FeatureWeight[];
  suggestedAction: DecisionStatus;
} {
  let score = 15; // baseline
  const weights: FeatureWeight[] = [];
  const flags: string[] = [];

  // 1. Structuring / Smurfing Analysis (FinCEN 31 CFR 1010.311)
  if (params.amount >= 9000 && params.amount < 10000 && params.currency === 'USD') {
    score += 35;
    flags.push("MULE_STRUCTURING_CTR_EVASION");
    weights.push({
      factor: `Transaction amount $${params.amount.toLocaleString()} is intentionally structured under $10,000 threshold`,
      deltaPoints: 35,
      description: "Severe penalty for suspected 31 U.S.C. § 5324 CTR evasion",
      category: "STRUCTURING"
    });
  } else if (params.amount >= 1000000 && params.currency === 'INR') {
    score += 30;
    flags.push("PMLA_10_LAKH_STATUTORY_TRIGGER");
    weights.push({
      factor: `INR ${params.amount.toLocaleString()} exceeds statutory ₹10 Lakhs threshold`,
      deltaPoints: 30,
      description: "Mandatory reporting under PMLA 2002 Rule 3(1)(A)",
      category: "STRUCTURING"
    });
  }

  // 2. Balance Drain Anomaly (PaySim Classic Pattern)
  if (params.oldbalanceOrig > 0) {
    const drainRatio = params.amount / params.oldbalanceOrig;
    if (drainRatio > 0.90 && params.amount > 5000) {
      score += 25;
      flags.push("ACCOUNT_BALANCE_DRAINED_TO_NEAR_ZERO");
      weights.push({
        factor: `Account balance drained by ${(drainRatio * 100).toFixed(1)}% in a single transaction`,
        deltaPoints: 25,
        description: "Classic PaySim anomaly: victim account emptied to mule destination",
        category: "BALANCE"
      });
    }
  }

  // 3. Destination Account Age
  if (params.destAccountAgeDays < 7) {
    score += 20;
    flags.push("NEW_MULE_BENEFICIARY_ACCOUNT");
    weights.push({
      factor: `Beneficiary account created only ${params.destAccountAgeDays} days ago`,
      deltaPoints: 20,
      description: "High incidence of disposable temporary mule accounts",
      category: "BALANCE"
    });
  }

  // 4. Geolocation & Proxy Check
  if (params.isVpn) {
    score += 15;
    flags.push("ANONYMIZED_VPN_OR_TOR_PROXY");
    weights.push({
      factor: "Origin IP identified as commercial VPN / Tor anonymizing exit relay",
      deltaPoints: 15,
      description: "Obfuscation of physical location during transaction origination",
      category: "GEO_DEVICE"
    });
  }

  if (params.isCrossBorder) {
    score += 12;
    flags.push("CROSS_BORDER_HIGH_RISK_CORRIDOR");
    weights.push({
      factor: "Cross-border jurisdictional routing across payment rail",
      deltaPoints: 12,
      description: "Requires Travel Rule FATF Recommendation 16 verification",
      category: "GEO_DEVICE"
    });
  }

  // 5. Watchlist & PEP Screening
  if (params.pepWatchlist) {
    score += 35;
    flags.push("PEP_OR_SANCTION_WATCHLIST_MATCH");
    weights.push({
      factor: "Beneficiary or Originator matches Politically Exposed Person (PEP) list",
      deltaPoints: 35,
      description: "Mandates Enhanced Due Diligence (EDD) under FATF Rec 12",
      category: "SANCTIONS"
    });
  }

  // 6. Velocity Spike
  if (params.velocity1Hour >= 4) {
    score += 22;
    flags.push("HIGH_FREQUENCY_VELOCITY_SPIKE");
    weights.push({
      factor: `${params.velocity1Hour} rapid outbound transactions within the past 60 minutes`,
      deltaPoints: 22,
      description: "Potential automated script or credential stuffing attack",
      category: "VELOCITY"
    });
  }

  // 7. Mitigating factors (History & Tenure)
  if (params.origAccountAgeMonths >= 36 && params.priorChargebacks === 0) {
    score -= 20;
    weights.push({
      factor: `Established customer relationship (${params.origAccountAgeMonths} months with zero chargebacks)`,
      deltaPoints: -20,
      description: "Substantial tenure mitigates anomaly risk",
      category: "HISTORY"
    });
  }

  // Bound score between 0 and 99
  const finalScore = Math.max(2, Math.min(99, score));
  let band: RiskBand = 'LOW';
  let suggestedAction: DecisionStatus = 'APPROVED';

  if (finalScore >= 80) {
    band = 'CRITICAL';
    suggestedAction = 'ACCOUNT_FROZEN';
  } else if (finalScore >= 60) {
    band = 'HIGH';
    suggestedAction = 'STEP_UP_KYC';
  } else if (finalScore >= 35) {
    band = 'MEDIUM';
    suggestedAction = 'PENDING_REVIEW';
  }

  return {
    riskScore: finalScore,
    riskBand: band,
    flags,
    weights,
    suggestedAction
  };
}
