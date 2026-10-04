import React, { useEffect, useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  FileText, 
  UserCheck, 
  Snowflake, 
  RotateCcw, 
  Download, 
  Search, 
  CheckSquare, 
  Square, 
  MinusSquare,
  X,
  FileSpreadsheet,
  Filter
} from 'lucide-react';
import { AuditRecord } from '../types/index.ts';

export const AuditGovernanceLog: React.FC = () => {
  const [auditLog, setAuditLog] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const fetchLog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/decisions/audit-trail');
      if (res.ok) {
        const data = await res.json();
        setAuditLog(data.auditTrail || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLog();
  }, []);

  const filteredLog = auditLog.filter((entry) => {
    const matchesSearch =
      entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.analyst.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (actionFilter === 'ALL') return true;
    if (actionFilter === 'FALSE_POSITIVE') return entry.falsePositive;
    return entry.action === actionFilter;
  });

  // Checkbox handlers
  const handleToggleRow = (id: string, e: React.MouseEvent) => {
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
    if (selectedIds.size === filteredLog.length && filteredLog.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLog.map((item) => item.id)));
    }
  };

  const isAllSelected = filteredLog.length > 0 && selectedIds.size === filteredLog.length;
  const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < filteredLog.length;

  // CSV Export utility (RFC 4180 compliant)
  const exportToCsv = (items: AuditRecord[], fileNamePrefix: string) => {
    if (items.length === 0) return;

    const headers = [
      "Audit ID",
      "Timestamp (UTC)",
      "Transaction ID",
      "Action Adjudicated",
      "Risk Score at Decision",
      "Investigator / Sign-Off",
      "Compliance Findings & Rationale",
      "Feedback Classification",
      "Statutory Authority Reference"
    ];

    const escapeCsv = (str: string | number) => {
      const text = String(str ?? '');
      if (text.includes(',') || text.includes('"') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const rows = items.map((item) => {
      let authority = "FinCEN 31 CFR § 1020.320 / BSA";
      if (item.action === 'SAR_FILED') authority = "FinCEN Form 111 (SAR Part V) / 31 U.S.C. 5318(g)";
      else if (item.falsePositive) authority = "GDPR Art. 22 / EU AI Act Model Retraining";
      else if (item.action === 'ACCOUNT_FROZEN') authority = "OFAC Sanctions & AML Asset Freeze";

      return [
        escapeCsv(item.id),
        escapeCsv(new Date(item.timestamp).toISOString()),
        escapeCsv(item.transactionId),
        escapeCsv(item.action),
        escapeCsv(item.scoreAtDecision),
        escapeCsv(item.analyst),
        escapeCsv(item.reason),
        escapeCsv(item.falsePositive ? "False Positive (Retrain)" : "Model Validated"),
        escapeCsv(authority),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${fileNamePrefix}_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(`Exported ${items.length} records to ${link.download}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportSelected = () => {
    const selectedEntries = auditLog.filter((entry) => selectedIds.has(entry.id));
    exportToCsv(selectedEntries, "RiskGuard_Selected_Audit_Log");
  };

  const handleExportAll = () => {
    exportToCsv(filteredLog, "RiskGuard_Periodic_Regulatory_Audit_Filing");
  };

  const totalDecisions = auditLog.length;
  const falsePositiveCount = auditLog.filter((a) => a.falsePositive).length;
  const sarFiledCount = auditLog.filter((a) => a.action === 'SAR_FILED').length;
  const frozenCount = auditLog.filter((a) => a.action === 'ACCOUNT_FROZEN').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Governance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Total Human Adjudications</div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">{totalDecisions}</div>
          <p className="mt-1 text-[11px] text-slate-500">Human-in-the-Loop oversight ledger</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">False Positive Override Rate</div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {totalDecisions > 0 ? ((falsePositiveCount / totalDecisions) * 100).toFixed(0) : 0}%
          </div>
          <p className="mt-1 text-[11px] text-slate-500">{falsePositiveCount} overrides sent to model retraining</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">FinCEN SAR Narratives Filed</div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-400">{sarFiledCount}</div>
          <p className="mt-1 text-[11px] text-slate-500">Part V filing exhibits archived</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Beneficiary Accounts Frozen</div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">{frozenCount}</div>
          <p className="mt-1 text-[11px] text-slate-500">Mule and sanction enforcement locks</p>
        </div>
      </div>

      {/* Export Notification Toast */}
      {exportNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/80 p-3 text-xs text-emerald-300 shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Floating or Docked Selected Items Export Bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-500/40 bg-indigo-950/90 p-3.5 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold">
              {selectedIds.size}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">
                {selectedIds.size} Audit Log Entr{selectedIds.size > 1 ? 'ies' : 'y'} Selected
              </p>
              <p className="text-[11px] text-indigo-300">
                Ready for regulatory periodic filing export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSelected}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Selected CSV ({selectedIds.size})</span>
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

      {/* Main Ledger Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-indigo-400" />
            <div>
              <h3 className="text-xs font-bold text-slate-100">
                Regulatory Audit Trail &amp; Model Governance Log (GDPR Art. 22 &amp; EU AI Act)
              </h3>
              <p className="text-[11px] text-slate-400">
                Immutable audit ledger supporting export to CSV for supervisory examinations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit ID, case, notes..."
                className="rounded-lg bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-indigo-500 w-48 sm:w-56"
              />
            </div>

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 border border-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Actions</option>
              <option value="APPROVED">Approved Only</option>
              <option value="STEP_UP_KYC">Step-Up KYC</option>
              <option value="ACCOUNT_FROZEN">Account Frozen</option>
              <option value="SAR_FILED">SAR Filed</option>
              <option value="FALSE_POSITIVE">False Positives</option>
            </select>

            {/* Export All CSV Button */}
            <button
              onClick={handleExportAll}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
              title="Export all filtered records to CSV for regulator filing"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={fetchLog}
              className="flex items-center gap-1 rounded-lg p-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Refresh ledger"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                {/* Select All Checkbox */}
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-slate-200 focus:outline-none flex items-center justify-center mx-auto"
                    title={isAllSelected ? "Deselect all" : "Select all visible"}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="h-4 w-4 text-indigo-400" />
                    ) : isPartiallySelected ? (
                      <MinusSquare className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-600" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Audit ID &amp; Time</th>
                <th className="py-3 px-3">Case Ref</th>
                <th className="py-3 px-3">Action Adjudicated</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3">Compliance Rationale &amp; Findings</th>
                <th className="py-3 px-3">Investigator Sign-off</th>
                <th className="py-3 px-3 text-center">Feedback Vector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredLog.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No compliance adjudications match current filter.
                  </td>
                </tr>
              ) : (
                filteredLog.map((entry) => {
                  const isSelected = selectedIds.has(entry.id);
                  return (
                    <tr 
                      key={entry.id} 
                      className={`transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-950/40 hover:bg-indigo-950/60' 
                          : 'hover:bg-slate-800/30'
                      }`}
                      onClick={(e) => handleToggleRow(entry.id, e)}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center" onClick={(e) => handleToggleRow(entry.id, e)}>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-200 focus:outline-none flex items-center justify-center mx-auto"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-indigo-400" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-700" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono text-slate-200 font-semibold">{entry.id}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(entry.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-indigo-300">
                        {entry.transactionId}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {entry.action === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Cleared / Approved</span>
                          </span>
                        )}
                        {entry.action === 'STEP_UP_KYC' && (
                          <span className="inline-flex items-center gap-1 text-orange-400">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Step-Up KYC</span>
                          </span>
                        )}
                        {entry.action === 'ACCOUNT_FROZEN' && (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                            <Snowflake className="h-3.5 w-3.5" />
                            <span>Account Frozen</span>
                          </span>
                        )}
                        {entry.action === 'SAR_FILED' && (
                          <span className="inline-flex items-center gap-1 text-indigo-400 font-bold">
                            <FileText className="h-3.5 w-3.5" />
                            <span>FinCEN SAR Filed</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-200 tabular-nums">
                        {entry.scoreAtDecision}
                      </td>

                      <td className="py-3 px-3 text-slate-300 max-w-md">
                        <p className="line-clamp-2">{entry.reason}</p>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {entry.analyst}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {entry.falsePositive ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                            False Positive Override
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            Model Validated
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
