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
}
