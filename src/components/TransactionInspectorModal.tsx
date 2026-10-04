import React, { useState } from 'react';
import { TransactionRecord, DecisionStatus } from '../types/index.ts';
import { 
  X, 
  ShieldAlert, 
  CheckCircle, 
  UserCheck, 
  Snowflake, 
  FileText, 
  MapPin, 
  Laptop, 
  Lock, 
  Clock, 
  TrendingUp, 
  AlertOctagon,
  Scale
} from 'lucide-react';

interface TransactionInspectorModalProps {
  transaction: TransactionRecord | null;
  onClose: () => void;
  onAdjudicate: (txId: string, action: DecisionStatus, reason: string, isFalsePositive: boolean) => void;
  onDraftSar: (tx: TransactionRecord, notes: string) => void;
}

export const TransactionInspectorModal: React.FC<TransactionInspectorModalProps> = ({
  transaction,
  onClose,
  onAdjudicate,
  onDraftSar,
}) => {
  if (!transaction) return null;

  const [selectedAction, setSelectedAction] = useState<DecisionStatus>(
    transaction.status === 'PENDING_REVIEW' ? 'APPROVED' : transaction.status
  );
  const [rationale, setRationale] = useState(transaction.analystDecision?.note || '');
  const [falsePositive, setFalsePositive] = useState(
    transaction.analystDecision?.falsePositiveMarked || false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitDecision = () => {
    setIsSubmitting(true);
    onAdjudicate(transaction.id, selectedAction, rationale, falsePositive);
    setIsSubmitting(false);
  };

  const isCritical = transaction.riskBand === 'CRITICAL';
  const isHigh = transaction.riskBand === 'HIGH';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${
              isCritical 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                : isHigh 
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' 
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
            }`}>
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono">{transaction.id}</h2>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-mono text-slate-300">{transaction.type}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-400">
                  {new Date(transaction.timestamp).toUTCString()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kaggle PaySim Anomaly Inspection &amp; Statutory Compliance Review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Top Score & Financial Flow Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk Gauge */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Risk Engine Assessment
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold font-mono tabular-nums ${
                  isCritical ? 'text-rose-400' : isHigh ? 'text-orange-400' : 'text-emerald-400'
                }`}>
                  {transaction.riskScore}
                </span>
                <span className="text-xs font-mono text-slate-400">/ 100</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  isCritical 
                    ? 'bg-rose-500/20 text-rose-300' 
                    : isHigh 
                    ? 'bg-orange-500/20 text-orange-300' 
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {transaction.riskBand} RISK
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    isCritical ? 'bg-rose-500' : isHigh ? 'bg-orange-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${transaction.riskScore}%` }}
                />
              </div>
            </div>

            {/* Originator Balance Dynamic */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Originator (Debited)
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-200 truncate">{transaction.nameOrig}</p>
              <div className="mt-3 space-y-1 text-xs font-mono tabular-nums">
                <div className="flex justify-between text-slate-400">
                  <span>Pre-Tx Balance:</span>
                  <span className="text-slate-200">{transaction.currency} {transaction.oldbalanceOrg.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Post-Tx Balance:</span>
                  <span className={transaction.newbalanceOrig === 0 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                    {transaction.currency} {transaction.newbalanceOrig.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-800/80">
                  <span>Account Tenure:</span>
                  <span>{transaction.origCustomerTenureMonths} months ({transaction.origAccountType})</span>
                </div>
              </div>
            </div>

            {/* Beneficiary Balance Dynamic */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Beneficiary (Credited)
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-200 truncate">{transaction.nameDest}</p>
              <div className="mt-3 space-y-1 text-xs font-mono tabular-nums">
                <div className="flex justify-between text-slate-400">
                  <span>Pre-Tx Balance:</span>
                  <span className="text-slate-200">{transaction.currency} {transaction.oldbalanceDest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Post-Tx Balance:</span>
                  <span className="text-emerald-400 font-bold">
                    {transaction.currency} {transaction.newbalanceDest.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-800/80">
                  <span>Account Age:</span>
                  <span className={transaction.destAccountAgeDays < 7 ? 'text-rose-400 font-bold' : ''}>
                    {transaction.destAccountAgeDays} days old ({transaction.destAccountType})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Network, Device & Regulatory Triggers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Device & Geo Telemetry */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Laptop className="h-4 w-4 text-indigo-400" />
                <span>Device &amp; Geolocation Telemetry</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Origin IP:</span>
                  <span className="font-mono text-slate-200">{transaction.device.ip}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="flex items-center gap-1 text-slate-200">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {transaction.device.city}, {transaction.device.geoCountry}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tor / Datacenter VPN:</span>
                  <span className={`font-semibold ${transaction.device.isVpnOrTor ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {transaction.device.isVpnOrTor ? 'Detected (Proxy Exit Node)' : 'Clean Direct IP'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Hardware Fingerprint Trust:</span>
                  <span className="font-mono text-slate-200">{transaction.device.deviceFingerprintTrust} / 100</span>
                </div>
              </div>
            </div>

            {/* Regulatory Watchlists & Statutory Triggers */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Scale className="h-4 w-4 text-indigo-400" />
                <span>Statutory Compliance Checks</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">CTR Cash &gt; $10k / ₹10 Lakhs:</span>
                  <span className={transaction.regulatoryWatchlist.ctrThresholdExceeded ? 'text-indigo-400 font-semibold' : 'text-slate-400'}>
                    {transaction.regulatoryWatchlist.ctrThresholdExceeded ? 'Exceeded (Form 112 / PMLA Trigger)' : 'Below Threshold'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Structuring Evasion Suspicion:</span>
                  <span className={transaction.regulatoryWatchlist.structuringSuspicion ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                    {transaction.regulatoryWatchlist.structuringSuspicion ? 'High Suspicion (31 U.S.C. § 5324)' : 'Normal Flow'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">PEP Watchlist Match:</span>
                  <span className={transaction.regulatoryWatchlist.pepMatch ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {transaction.regulatoryWatchlist.pepMatch ? 'Direct PEP / Close Associate Hit' : 'No Hits'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">OFAC / Sanction Screening:</span>
                  <span className={transaction.regulatoryWatchlist.sanctionListHit ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {transaction.regulatoryWatchlist.sanctionListHit ? 'Targeted List Match (Freeze Mandatory)' : 'Clear'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Explainability Engine: SHAP-Style Factor Waterfall */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">
                  SHAP Algorithmic Factor Weights (EU AI Act &amp; GDPR Art. 22 Compliant)
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Score Impact (pts)</span>
            </div>

            <div className="space-y-2 pt-1">
              {transaction.featureWeights.map((w, idx) => {
                const isPositive = w.deltaPoints > 0;
                return (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                    <div className="space-y-0.5 max-w-[80%]">
                      <p className="text-slate-200 font-medium">{w.factor}</p>
                      <p className="text-[10px] text-slate-500">{w.description}</p>
                    </div>
                    <div className={`font-mono font-bold tabular-nums ${isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isPositive ? `+${w.deltaPoints}` : `${w.deltaPoints}`} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Human-In-The-Loop Decision Panel (Adjudication & SAR Drafting) */}
          <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Compliance Officer Adjudication (Human-in-the-Loop)
                </h3>
                <p className="text-xs text-slate-400">
                  Provide audit justification for supervisory review and continuous model feedback loop.
                </p>
              </div>

              {/* Quick SAR Generator Button */}
              <button
                onClick={() => onDraftSar(transaction, rationale)}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-500/50 bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Draft FinCEN SAR Narrative</span>
              </button>
            </div>

            {/* Action Segmented Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedAction('APPROVED')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                  selectedAction === 'APPROVED'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle className="h-4 w-4 mb-1 text-emerald-400" />
                <span>Clear / Approve</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('STEP_UP_KYC')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                  selectedAction === 'STEP_UP_KYC'
                    ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="h-4 w-4 mb-1 text-orange-400" />
                <span>Step-Up KYC</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('ACCOUNT_FROZEN')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                  selectedAction === 'ACCOUNT_FROZEN'
                    ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Snowflake className="h-4 w-4 mb-1 text-rose-400" />
                <span>Freeze Account</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('SAR_FILED')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                  selectedAction === 'SAR_FILED'
                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="h-4 w-4 mb-1 text-indigo-400" />
                <span>File SAR (FinCEN)</span>
              </button>
            </div>

            {/* Justification Text Area */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Investigation Findings &amp; Rationale
              </label>
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Document your verification steps (e.g., reviewed customer invoice, confirmed phone callback, verified IP history, or escalating to FinCEN for structuring)..."
                rows={3}
                className="w-full rounded-lg bg-slate-950 p-2.5 text-xs text-slate-200 placeholder-slate-500 border border-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* False Positive Checkbox (Model Retraining Signal) */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="falsePositive"
                checked={falsePositive}
                onChange={(e) => setFalsePositive(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <label htmlFor="falsePositive" className="text-xs text-slate-300 cursor-pointer">
                Classify as False Positive (Send feedback vector to retrain anomaly detection model)
              </label>
            </div>

            {/* Adjudication Submit */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitDecision}
                disabled={isSubmitting}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm transition-colors"
              >
                Commit Compliance Adjudication
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
