import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Smartphone, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Mail, 
  MessageSquare, 
  Fingerprint, 
  Lock, 
  AlertTriangle, 
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Shield
} from 'lucide-react';
import { TransactionRecord, CustomerAlert } from '../types/index.ts';

interface CustomerAlertsHubProps {
  transactions: TransactionRecord[];
  onInspectTransaction?: (tx: TransactionRecord) => void;
  onRefreshTransactions?: () => void;
}

export const CustomerAlertsHub: React.FC<CustomerAlertsHubProps> = ({
  transactions,
  onInspectTransaction,
  onRefreshTransactions,
}) => {
  const [alerts, setAlerts] = useState<CustomerAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAlert, setSelectedAlert] = useState<CustomerAlert | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulatingDevice, setIsSimulatingDevice] = useState<boolean>(true);

  // Dispatch alert modal/form state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchTxId, setDispatchTxId] = useState<string>('');
  const [dispatchChannel, setDispatchChannel] = useState<'SMS' | 'PUSH_NOTIFICATION' | 'EMAIL'>('SMS');
  const [dispatchCustomMsg, setDispatchCustomMsg] = useState<string>('');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customer-alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        if (data.alerts && data.alerts.length > 0 && !selectedAlert) {
          setSelectedAlert(data.alerts[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load customer alerts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Handle customer response action (simulate 2-way verification)
  const handleCustomerResponse = async (alertId: string, response: 'CONFIRMED' | 'FLAGGED_FRAUD') => {
    try {
      const res = await fetch('/api/customer-alerts/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, response }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? data.alert : a))
        );
        if (selectedAlert && selectedAlert.id === alertId) {
          setSelectedAlert(data.alert);
        }
        setActionNotice(
          response === 'CONFIRMED'
            ? 'Customer confirmed legitimate transfer. 2FA verified & ledger updated.'
            : 'ALERT ENFORCED: Customer confirmed unauthorized fraud! Card frozen & audit trail recorded.'
        );
        setTimeout(() => setActionNotice(null), 5000);
        if (onRefreshTransactions) onRefreshTransactions();
      }
    } catch (e) {
      console.error('Failed to respond to alert', e);
    }
  };

  // Handle new alert dispatch
  const handleDispatchAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchTxId) return;

    setIsDispatching(true);
    try {
      const res = await fetch('/api/customer-alerts/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: dispatchTxId,
          channel: dispatchChannel,
          customMessage: dispatchCustomMsg,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts((prev) => [data.alert, ...prev]);
        setSelectedAlert(data.alert);
        setIsDispatchModalOpen(false);
        setDispatchCustomMsg('');
        setActionNotice(`Personalized alert dispatched via ${dispatchChannel} to customer!`);
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (e) {
      console.error('Failed to dispatch alert', e);
    } finally {
      setIsDispatching(false);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.messageContent.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    return alert.status === filterStatus;
  });

  // Analytics metrics
  const totalAlerts = alerts.length;
  const pendingCount = alerts.filter((a) => a.status === 'PENDING_RESPONSE').length;
  const verifiedCount = alerts.filter((a) => a.status === 'CUSTOMER_VERIFIED').length;
  const fraudFlaggedCount = alerts.filter((a) => a.status === 'CUSTOMER_FLAGGED_FRAUD').length;
  const verificationRate = totalAlerts > 0 ? ((verifiedCount / totalAlerts) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-emerald-200 text-sm flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)}
            className="text-xs text-emerald-400 hover:text-emerald-100 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-100">
                Customer Personalized Alert &amp; 2-Way Protection Hub
              </h2>
              <p className="text-xs text-slate-400">
                Real-time multi-channel customer notifications (SMS / Push / Email) with instant 1-click fraud confirmation &amp; false positive resolution
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              if (transactions.length > 0) {
                setDispatchTxId(transactions[0].id);
              }
              setIsDispatchModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Dispatch New Alert</span>
          </button>

          <button
            onClick={fetchAlerts}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Total Customer Alerts</div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">{totalAlerts}</div>
          <p className="mt-1 text-[11px] text-slate-500">Multi-channel security dispatches</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Awaiting Customer Response</div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">{pendingCount}</div>
          <p className="mt-1 text-[11px] text-slate-500">Active 2-way verification windows</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Customer Confirmed Legitimate</div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {verifiedCount} <span className="text-xs font-normal text-slate-400">({verificationRate}%)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">False positives defused in &lt;60s</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Customer Flagged Fraud</div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">{fraudFlaggedCount}</div>
          <p className="mt-1 text-[11px] text-slate-500">Instant card freeze &amp; SAR escalation</p>
        </div>
      </div>

      {/* Main Workbench: Left is Alert Ledger, Right is Interactive Smartphone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dispatched Alerts Ledger (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts by customer, ID or text..."
                className="w-full rounded-lg bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'PENDING_RESPONSE', 'CUSTOMER_VERIFIED', 'CUSTOMER_FLAGGED_FRAUD'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                    filterStatus === status
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {status === 'ALL'
                    ? 'All'
                    : status === 'PENDING_RESPONSE'
                    ? 'Pending'
                    : status === 'CUSTOMER_VERIFIED'
                    ? 'Verified'
                    : 'Fraud'}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">Loading customer alert ledger...</div>
            ) : filteredAlerts.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center text-slate-400 text-xs">
                No customer alerts found matching current filter.
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isSelected = selectedAlert?.id === alert.id;
                const statusBadge =
                  alert.status === 'CUSTOMER_VERIFIED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : alert.status === 'CUSTOMER_FLAGGED_FRAUD'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30';

                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`rounded-xl border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/20 shadow-md shadow-indigo-500/5'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-200">{alert.id}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-xs font-semibold text-slate-100">{alert.customerName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border bg-slate-800 text-slate-300 border-slate-700">
                            {alert.contactChannel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {alert.messageContent}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${statusBadge}`}>
                          {alert.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-indigo-400">{alert.transactionId}</span>
                        <span>·</span>
                        <span className="text-slate-400">{alert.anomalySummary}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {alert.status === 'PENDING_RESPONSE' && (
                          <span className="flex items-center gap-1 text-amber-400 font-medium">
                            <Clock className="h-3 w-3 animate-pulse" />
                            Awaiting Cardholder
                          </span>
                        )}
                        {alert.status === 'CUSTOMER_VERIFIED' && (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            Legitimate 2FA Confirmed
                          </span>
                        )}
                        {alert.status === 'CUSTOMER_FLAGGED_FRAUD' && (
                          <span className="flex items-center gap-1 text-rose-400 font-medium">
                            <Lock className="h-3 w-3" />
                            Card Frozen &amp; Safeguarded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Interactive Smartphone Device Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200">
                  Cardholder Live Experience Simulator
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                Interactive 2-Way Test
              </span>
            </div>

            {selectedAlert ? (
              <div className="space-y-4">
                {/* Simulated Smartphone Frame */}
                <div className="mx-auto max-w-sm rounded-3xl border-4 border-slate-800 bg-slate-950 p-4 shadow-inner space-y-4 relative">
                  {/* Speaker notch */}
                  <div className="mx-auto h-4 w-28 rounded-full bg-slate-900 flex items-center justify-center">
                    <div className="h-1.5 w-8 rounded-full bg-slate-800"></div>
                  </div>

                  {/* Phone Status Bar */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
                    <span>9:41 AM</span>
                    <div className="flex items-center gap-1">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Channel Notification Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400">
                          {selectedAlert.contactChannel === 'SMS' ? (
                            <MessageSquare className="h-4 w-4" />
                          ) : selectedAlert.contactChannel === 'EMAIL' ? (
                            <Mail className="h-4 w-4" />
                          ) : (
                            <Bell className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100">
                            RiskGuard Security
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {selectedAlert.contactAddress}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Now</span>
                    </div>

                    <div className="rounded-xl bg-slate-950 p-3 text-xs text-slate-200 leading-relaxed border border-slate-800/80">
                      {selectedAlert.messageContent}
                    </div>

                    {/* Linked Transaction Info */}
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Transaction:</span>
                        <span className="font-mono text-slate-200 font-semibold">{selectedAlert.transactionId}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Security Directive:</span>
                        <span className="text-amber-400 font-semibold">{selectedAlert.actionRequired.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    {/* Customer Action Buttons */}
                    {selectedAlert.status === 'PENDING_RESPONSE' ? (
                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() => handleCustomerResponse(selectedAlert.id, 'CONFIRMED')}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 p-2.5 text-xs font-bold text-white transition-colors shadow-lg shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Yes, I Authorized This (Verify 2FA)</span>
                        </button>

                        <button
                          onClick={() => handleCustomerResponse(selectedAlert.id, 'FLAGGED_FRAUD')}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 p-2.5 text-xs font-bold text-white transition-colors shadow-lg shadow-rose-600/20"
                        >
                          <Lock className="h-4 w-4" />
                          <span>No, Fraud! Freeze Account Now</span>
                        </button>
                      </div>
                    ) : (
                      <div className={`p-3 rounded-xl border text-center text-xs space-y-1 ${
                        selectedAlert.status === 'CUSTOMER_VERIFIED'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      }`}>
                        <div className="font-bold">
                          {selectedAlert.status === 'CUSTOMER_VERIFIED'
                            ? '✓ Customer Verified Transaction'
                            : '🚨 Account Frozen by Customer'}
                        </div>
                        <div className="text-[11px] opacity-80 font-mono">
                          Response logged at {new Date(selectedAlert.responseTimestamp || '').toLocaleTimeString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inspect on Ledger button */}
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => {
                      const tx = transactions.find((t) => t.id === selectedAlert.transactionId);
                      if (tx && onInspectTransaction) {
                        onInspectTransaction(tx);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    <span>Inspect Transaction in Adjudication Queue</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Select an alert from the ledger to simulate customer verification
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispatch New Alert Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative text-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">Dispatch Personalized Customer Alert</h3>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Flagged Transaction
                </label>
                <select
                  value={dispatchTxId}
                  onChange={(e) => setDispatchTxId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                >
                  {transactions.slice(0, 15).map((tx) => (
                    <option key={tx.id} value={tx.id}>
                      {tx.id} — {tx.currency} {tx.amount.toLocaleString()} ({tx.nameOrig} → {tx.nameDest}) [{tx.riskBand}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customer Contact Rail
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'SMS', label: 'SMS Gateway', icon: <MessageSquare className="h-3.5 w-3.5" /> },
                    { id: 'PUSH_NOTIFICATION', label: 'Mobile Push', icon: <Bell className="h-3.5 w-3.5" /> },
                    { id: 'EMAIL', label: 'Secure Email', icon: <Mail className="h-3.5 w-3.5" /> },
                  ].map((ch) => (
                    <button
                      type="button"
                      key={ch.id}
                      onClick={() => setDispatchChannel(ch.id as any)}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition-colors ${
                        dispatchChannel === ch.id
                          ? 'border-indigo-500 bg-indigo-600/20 text-indigo-200'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {ch.icon}
                      <span>{ch.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custom Security Advisory (Optional)
                </label>
                <textarea
                  value={dispatchCustomMsg}
                  onChange={(e) => setDispatchCustomMsg(e.target.value)}
                  placeholder="Leave empty for autonomous rule-based template..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isDispatching ? 'Transmitting...' : 'Dispatch Alert'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
