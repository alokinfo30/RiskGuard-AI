import { TransactionRecord, RiskBand, DecisionStatus, FeatureWeight } from '../data/syntheticTransactions.ts';
import { RegulatoryDocument } from '../data/regulatoryData.ts';

export type { TransactionRecord, RiskBand, DecisionStatus, FeatureWeight, RegulatoryDocument };

export interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  citations?: {
    id: string;
    framework: string;
    code: string;
    title: string;
    section: string;
    threshold: string;
    excerpt: string;
  }[];
  confidenceScore?: number;
  isStreaming?: boolean;
}

export interface AuditRecord {
  id: string;
  transactionId: string;
  action: string;
  reason: string;
  analyst: string;
  timestamp: string;
  falsePositive: boolean;
  scoreAtDecision: number;
  prevHash?: string;
  hash?: string;
}

export interface CustomerAlert {
  id: string;
  transactionId: string;
  customerName: string;
  contactChannel: 'SMS' | 'PUSH_NOTIFICATION' | 'EMAIL';
  contactAddress: string;
  messageContent: string;
  anomalySummary: string;
  status: 'PENDING_RESPONSE' | 'CUSTOMER_VERIFIED' | 'CUSTOMER_FLAGGED_FRAUD';
  timestamp: string;
  responseTimestamp?: string;
  actionRequired: 'BIOMETRIC_STEP_UP' | 'CONFIRM_OR_FREEZE' | 'CTR_IDENTITY_VERIFICATION';
}

export interface BilingualFieldMapping {
  foreignTerm: string;
  englishTerm: string;
  extractedValue: string;
}

export interface DocumentTranslationResult {
  detectedLanguage: string;
  detectedLanguageCode: string;
  confidence: number;
  isTranslated: boolean;
  translatedEnglishText: string;
  sourceTextExcerpt: string;
  bilingualFieldMappings: BilingualFieldMapping[];
  summaryTranslationNotes?: string;
}

export interface DocumentAiAnalysis {
  id: string;
  documentName: string;
  documentType: 'INVOICE' | 'BANK_STATEMENT' | 'CORPORATE_REGISTRY' | 'CUSTOMS_REMITTANCE';
  extractedEntities: {
    vendorName?: string;
    beneficiaryName?: string;
    invoiceAmount?: number;
    currency?: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    taxIdOrEin?: string;
    ibanOrAccount?: string;
  };
  crossReferenceFindings: {
    amountMismatch: boolean;
    amountDelta?: number;
    beneficiaryMismatch: boolean;
    alteredDocumentIndicators: boolean;
    sanctionedOrHighRiskJurisdiction: boolean;
  };
  documentTrustScore: number;
  riskCategory: 'LOW_RISK' | 'MODERATE_DISCREPANCY' | 'HIGH_FORGERY_RISK';
  summaryFindings: string;
  sarExhibitNarrative: string;
  analyzedAt: string;
  translation?: DocumentTranslationResult;
}

export interface FinCENFilingValidation {
  isValid: boolean;
  readinessScore: number;
  validationErrors: string[];
  passedChecks: string[];
  mandatoryFieldsComplete: boolean;
  statutoryReference: string;
  bsnBatchId: string;
  filingDeadline: string;
}

export interface StreamingPipelineStatus {
  pubsub: {
    topic: string;
    subscription: string;
    publishedEventsCount: number;
    messagesPerSecond: number;
    subscriberLag: number;
    deadLetterQueueCount: number;
    status: 'ACTIVE' | 'DEGRADED';
  };
  bigquery: {
    dataset: string;
    table: string;
    totalRowsIngested: number;
    streamingBufferBytes: number;
    lastPartitionDate: string;
    activeQueriesCount: number;
  };
}

export interface CitationVerificationResult {
  isGrounded: boolean;
  groundingScore: number;
  verifiedCitations: {
    code: string;
    title: string;
    matchedClause: string;
    statutoryRequirement: string;
  }[];
  unverifiedClaims: string[];
  hallucinationRisk: 'ZERO' | 'LOW' | 'ELEVATED';
  statutoryDirectives: string[];
}
