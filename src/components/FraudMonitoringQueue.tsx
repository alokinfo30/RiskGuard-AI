import React, { useState } from 'react';
import { TransactionRecord, DecisionStatus } from '../types/index.ts';
import { CriticalRiskTrendChart } from './CriticalRiskTrendChart.tsx';
import { 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Search, 
  ChevronRight, 
  Lock, 
  TrendingUp, 
  Sparkles,
  CheckSquare,
  Square,
  MinusSquare,
  UserCheck,
  Snowflake,
  X,
  Layers,
  ShieldCheck
} from 'lucide-react';

interface FraudMonitoringQueueProps {
  transactions: TransactionRecord[];
  onSelectTransaction: (tx: TransactionRecord) => void;
  onDraftSar: (tx: TransactionRecord) => void;
  onTriggerTick: () => void;
  onBulkAdjudicate: (
    transactionIds: string[],
    action: DecisionStatus,
    reason: string,
    isFalsePositive: boolean
  ) => void;
}

export const FraudMonitoringQueue: React.FC<FraudMonitoringQueueProps> = ({
  transactions,
  onSelectTransaction,
  onDraftSar,
  onTriggerTick,
  onBulkAdjudicate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBand, setFilterBand] = useState<string>('ALL');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bulk modal state
  const [bulkActionTarget, setBulkActionTarget] = useState<DecisionStatus | null>(null);
  const [bulkRationale, setBulkRationale] = useState('');
  const [bulkFalsePositive, setBulkFalsePositive] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.nameOrig.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.nameDest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.fraudFlags.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterBand === 'ALL') return true;
    if (filterBand === 'PENDING') return tx.status === 'PENDING_REVIEW';
    if (filterBand === 'CRITICAL') return tx.riskBand === 'CRITICAL';
    if (filterBand === 'HIGH_OR_CRITICAL') return tx.riskBand === 'CRITICAL' || tx.riskBand === 'HIGH';
    if (filterBand === 'SAR_FILED') return tx.status === 'SAR_FILED';
    return true;
  });

  const criticalCount = transactions.filter((t) => t.riskBand === 'CRITICAL').length;
  const highCount = transactions.filter((t) => t.riskBand === 'HIGH').length;
  const pendingCount = transactions.filter((t) => t.status === 'PENDING_REVIEW').length;
  const ctrCount = transactions.filter((t) => t.regulatoryWatchlist.ctrThresholdExceeded).length;

  // Multi-selection helpers
  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.id)));
    }
  };

  const handleOpenBulkModal = (action: DecisionStatus) => {
    setBulkActionTarget(action);
    if (action === 'APPROVED') {
      setBulkRationale('Bulk verified: Batch cleared following compliance officer inspection.');
      setBulkFalsePositive(false);
    } else if (action === 'STEP_UP_KYC') {
      setBulkRationale('Bulk step-up: Mandatory secondary identity & biometric challenge initiated.');
      setBulkFalsePositive(false);
    } else if (action === 'ACCOUNT_FROZEN') {
      setBulkRationale('Bulk freeze: Coordinated money mule syndicate identified. Disbursements blocked.');
      setBulkFalsePositive(false);
    } else if (action === 'SAR_FILED') {
      setBulkRationale('Bulk SAR escalation: Transactions aggregate to systemic structuring pattern under 31 U.S.C. § 5324.');
      setBulkFalsePositive(false);
    }
  };

  const handleConfirmBulk = () => {
    if (!bulkActionTarget || selectedIds.size === 0) return;
    setIsBulkSubmitting(true);
    onBulkAdjudicate(
      Array.from(selectedIds),
      bulkActionTarget,
      bulkRationale,
      bulkFalsePositive
    );
    setIsBulkSubmitting(false);
    setBulkActionTarget(null);
    setSelectedIds(new Set());
  };

  const selectedCount = selectedIds.size;
  const isAllFilteredSelected = filtered.length > 0 && selectedCount === filtered.length;
  const isPartiallySelected = selectedCount > 0 && selectedCount < filtered.length;

  const selectedTransactions = transactions.filter((t) => selectedIds.has(t.id));
  const selectedTotalAmount = selectedTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* 24-Hour Critical Risk Anomaly Frequency Chart (Integrated via Recharts) */}
      <CriticalRiskTrendChart transactions={transactions} />

      {/* Top Banner & Analytical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Triage Queue</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-100">{pendingCount}</span>
            <span className="text-xs text-amber-400">Requires MLRO Adjudication</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Subject to 30-day FinCEN SAR clock</p>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Critical Anomalies</span>
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-400">{criticalCount}</span>
            <span className="text-xs text-rose-300/80">Risk Score &gt; 80</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Mule accounts, balance drain &amp; smurfing</p>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>High Risk Anomalies</span>
            <TrendingUp className="h-4 w-4 text-orange-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-orange-400">{highCount}</span>
            <span className="text-xs text-slate-400">Score 60 - 79</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">PEP matches, geo-jumps &amp; velocity bursts</p>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Statutory CTR Triggers</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-indigo-300">{ctrCount}</span>
            <span className="text-xs text-slate-400">&gt; $10k or ₹10 Lakhs</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Form 112 / PMLA Rule 3 logs</p>
        </div>
      </div>

      {/* Floating or Docked Multi-Select Bulk Action Toolbar */}
      {selectedCount > 0 && (
        <div className="sticky top-20 z-30 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-500/40 bg-indigo-950/90 p-3.5 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold">
              {selectedCount}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">
                {selectedCount} Transaction{selectedCount > 1 ? 's' : ''} Selected
              </p>
              <p className="text-[11px] text-indigo-300">
                Aggregate Value: <span className="font-mono font-semibold">${selectedTotalAmount.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenBulkModal('APPROVED')}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Bulk Approve</span>
            </button>

            <button
              onClick={() => handleOpenBulkModal('STEP_UP_KYC')}
              className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-500 transition-colors"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Bulk Request KYC</span>
            </button>

            <button
              onClick={() => handleOpenBulkModal('ACCOUNT_FROZEN')}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors"
            >
              <Snowflake className="h-3.5 w-3.5" />
              <span>Bulk Freeze</span>
            </button>

            <button
              onClick={() => handleOpenBulkModal('SAR_FILED')}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-600 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Bulk Escalate SAR</span>
            </button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="rounded-lg p-1.5 text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition-colors"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Control bar: Search + Segmented Filter Tabs + Influx Simulator */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search account, transaction ID, rule flag or IP..."
            className="w-full rounded-lg bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 border border-slate-800 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterBand('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filterBand === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            All Stream ({transactions.length})
          </button>
          <button
            onClick={() => setFilterBand('PENDING')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filterBand === 'PENDING'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            onClick={() => setFilterBand('HIGH_OR_CRITICAL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filterBand === 'HIGH_OR_CRITICAL'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            High &amp; Critical ({criticalCount + highCount})
          </button>
          <button
            onClick={() => setFilterBand('SAR_FILED')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filterBand === 'SAR_FILED'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            SAR Filed
          </button>

          <button
            onClick={onTriggerTick}
            className="ml-2 flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 whitespace-nowrap transition-colors"
            title="Inject simulated PaySim / Credit Card transaction"
          >
            <Sparkles className="h-3 w-3" />
            <span>Simulate Influx</span>
          </button>
        </div>
      </div>

      {/* High-Density Data Grid with Checkboxes (Compliant with saas_dashboard reference) */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                {/* Select All Checkbox Column */}
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-slate-200 focus:outline-none flex items-center justify-center mx-auto"
                    title={isAllFilteredSelected ? "Deselect all" : "Select all visible"}
                  >
                    {isAllFilteredSelected ? (
                      <CheckSquare className="h-4 w-4 text-indigo-400" />
                    ) : isPartiallySelected ? (
                      <MinusSquare className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-600" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Transaction ID &amp; Time</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3">Originator (Debited)</th>
                <th className="py-3 px-3">Beneficiary (Credited)</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Risk Score</th>
                <th className="py-3 px-3">Primary Anomaly Flag</th>
                <th className="py-3 px-3">Status &amp; Human Action</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isCritical = tx.riskBand === 'CRITICAL';
                  const isHigh = tx.riskBand === 'HIGH';
                  const isMedium = tx.riskBand === 'MEDIUM';
                  const isSelected = selectedIds.has(tx.id);

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className={`group cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-indigo-950/40 hover:bg-indigo-950/60' 
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td 
                        className="py-3 px-3 text-center" 
                        onClick={(e) => handleToggleSelectRow(tx.id, e)}
                      >
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-200 focus:outline-none flex items-center justify-center mx-auto"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-indigo-400" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-700 group-hover:text-slate-500" />
                          )}
                        </button>
                      </td>

                      {/* ID and Relative Time */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono font-semibold text-slate-200">{tx.id}</div>
                        <div className="text-[11px] text-slate-500">
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="mx-1 text-slate-600">·</span>
                          {tx.device.geoCountry}
                        </div>
                      </td>

                      {/* Rail / Channel */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-300">
                          {tx.type}
                        </span>
                      </td>

                      {/* Originator Account + Pre/Post Balance Drain */}
                      <td className="py-3 px-3 max-w-[180px]">
                        <div className="truncate text-slate-200">{tx.nameOrig}</div>
                        <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                          Bal: {tx.currency} {tx.oldbalanceOrg.toLocaleString()} → {tx.currency} {tx.newbalanceOrig.toLocaleString()}
                        </div>
                      </td>

                      {/* Beneficiary Account */}
                      <td className="py-3 px-3 max-w-[180px]">
                        <div className="truncate text-slate-200">{tx.nameDest}</div>
                        <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                          Age: {tx.destAccountAgeDays}d
                          <span className="mx-1 text-slate-600">·</span>
                          {tx.destAccountType}
                        </div>
                      </td>

                      {/* Tabular Numerical Amount */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-100 tabular-nums">
                          {tx.currency} {tx.amount.toLocaleString()}
                        </div>
                        {tx.amount >= 9000 && tx.amount < 10000 && tx.currency === 'USD' && (
                          <div className="text-[10px] text-rose-400 font-medium">Under $10k CTR</div>
                        )}
                        {tx.amount >= 1000000 && tx.currency === 'INR' && (
                          <div className="text-[10px] text-indigo-400 font-medium">&gt; ₹10 Lakhs</div>
                        )}
                      </td>

                      {/* Score Indicator */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-mono">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isCritical
                                ? 'bg-rose-500'
                                : isHigh
                                ? 'bg-orange-500'
                                : isMedium
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span
                            className={`font-bold tabular-nums ${
                              isCritical
                                ? 'text-rose-400'
                                : isHigh
                                ? 'text-orange-400'
                                : isMedium
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {tx.riskScore}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">{tx.riskBand}</div>
                      </td>

                      {/* Flag Explanation */}
                      <td className="py-3 px-3 max-w-[190px]">
                        <div className="truncate text-slate-300">
                          {tx.fraudFlags[0] ? tx.fraudFlags[0].replace(/_/g, ' ') : 'Nominal Baseline'}
                        </div>
                        {tx.device.isVpnOrTor && (
                          <div className="text-[10px] text-rose-400/90 flex items-center gap-1">
                            <Lock className="h-2.5 w-2.5" />
                            <span>VPN / Tor Relay</span>
                          </div>
                        )}
                      </td>

                      {/* Status & Human Action */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-xs">
                          {tx.status === 'PENDING_REVIEW' && (
                            <span className="text-amber-400 font-semibold">Triage Pending</span>
                          )}
                          {tx.status === 'APPROVED' && (
                            <span className="text-emerald-400 font-medium">Cleared / Safe</span>
                          )}
                          {tx.status === 'STEP_UP_KYC' && (
                            <span className="text-orange-400 font-medium">KYC Requested</span>
                          )}
                          {tx.status === 'ACCOUNT_FROZEN' && (
                            <span className="text-rose-400 font-bold">Frozen (Mule)</span>
                          )}
                          {tx.status === 'SAR_FILED' && (
                            <span className="text-indigo-400 font-bold">FinCEN SAR Filed</span>
                          )}
                        </div>
                        {tx.analystDecision && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                            by {tx.analystDecision.analyst.split(' ')[0]}
                          </div>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {(isCritical || isHigh) && tx.status !== 'SAR_FILED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDraftSar(tx);
                              }}
                              className="rounded px-2 py-1 text-[11px] font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center gap-1"
                              title="Draft FinCEN Part V Suspicious Activity Report"
                            >
                              <FileText className="h-3 w-3" />
                              <span className="hidden xl:inline">Draft SAR</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTransaction(tx);
                            }}
                            className="rounded px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Adjudication Modal Dialog */}
      {bulkActionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Bulk Adjudication — {bulkActionTarget}
                </h3>
              </div>
              <button
                onClick={() => setBulkActionTarget(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Selected Records:</span>
                <span className="font-mono font-bold text-slate-200">{selectedCount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Cumulative Amount:</span>
                <span className="font-mono font-bold text-slate-100">${selectedTotalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Batch Compliance Justification / Audit Finding
              </label>
              <textarea
                value={bulkRationale}
                onChange={(e) => setBulkRationale(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-slate-950 p-2.5 text-xs text-slate-200 border border-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="Enter justification for applying bulk action..."
              />
            </div>

            {bulkActionTarget === 'APPROVED' && (
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulkFalsePositive}
                  onChange={(e) => setBulkFalsePositive(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Tag as False Positives (send vector feedback to retrain anomaly detector)</span>
              </label>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setBulkActionTarget(null)}
                className="rounded-lg px-4 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulk}
                disabled={isBulkSubmitting}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm"
              >
                Execute Bulk {bulkActionTarget} ({selectedCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
