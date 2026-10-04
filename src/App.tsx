import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header.tsx';
import { FraudMonitoringQueue } from './components/FraudMonitoringQueue.tsx';
import { TransactionInspectorModal } from './components/TransactionInspectorModal.tsx';
import { RegulatoryCopilot } from './components/RegulatoryCopilot.tsx';
import { SarDraftingDrawer } from './components/SarDraftingDrawer.tsx';
import { RiskSandbox } from './components/RiskSandbox.tsx';
import { RegulatoryLibrary } from './components/RegulatoryLibrary.tsx';
import { AuditGovernanceLog } from './components/AuditGovernanceLog.tsx';
import { TransactionRecord, DecisionStatus } from './types/index.ts';
import { INITIAL_TRANSACTIONS } from './data/syntheticTransactions.ts';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('monitoring');
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [sarTx, setSarTx] = useState<TransactionRecord | null>(null);
  const [sarNotes, setSarNotes] = useState<string>('');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch live transactions from server
  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
      }
    } catch (e) {
      // In dev fallback or offline, initial transactions are already loaded
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Live streaming simulator ticker (ticks every 12 seconds when active)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/transactions/stream-tick', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.transaction) {
            setTransactions((prev) => [data.transaction, ...prev.slice(0, 49)]);
          }
        }
      } catch (err) {
        // Fallback quiet tick
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Handle manual synthetic injection
  const handleTriggerTick = async () => {
    try {
      const res = await fetch('/api/transactions/stream-tick', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
          showToast(`Simulated influx: Ingested ${data.transaction.id} (${data.transaction.riskBand} Risk)`);
        }
      }
    } catch (e) {
      showToast('Error triggering synthetic transaction');
    }
  };

  // Human-in-the-loop adjudication handler
  const handleAdjudicate = async (
    txId: string,
    action: DecisionStatus,
    reason: string,
    isFalsePositive: boolean
  ) => {
    try {
      const res = await fetch('/api/decisions/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: txId,
          action,
          reason,
          analyst: 'Sarah Jenkins (Compliance Lead · MLRO)',
          falsePositive: isFalsePositive,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTransactions((prev) =>
          prev.map((t) => (t.id === txId ? data.transaction : t))
        );
        setSelectedTx(null);
        showToast(
          isFalsePositive
            ? `Decision logged: ${txId} marked as False Positive. Sent to retraining.`
            : `Compliance Adjudication logged for ${txId}: ${action}`
        );
      }
    } catch (e) {
      showToast('Failed to save compliance decision');
    }
  };

  // Bulk Human-in-the-loop adjudication handler
  const handleBulkAdjudicate = async (
    transactionIds: string[],
    action: DecisionStatus,
    reason: string,
    isFalsePositive: boolean
  ) => {
    try {
      const res = await fetch('/api/decisions/bulk-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionIds,
          action,
          reason,
          analyst: 'Sarah Jenkins (Compliance Lead · MLRO)',
          falsePositive: isFalsePositive,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedIds = new Set(transactionIds);
        setTransactions((prev) =>
          prev.map((t) => {
            if (updatedIds.has(t.id)) {
              return {
                ...t,
                status: action,
                analystDecision: {
                  action,
                  note: reason,
                  timestamp: new Date().toISOString(),
                  analyst: 'Sarah Jenkins (Compliance Lead · MLRO)',
                  falsePositiveMarked: isFalsePositive,
                },
              };
            }
            return t;
          })
        );
        showToast(
          `Bulk adjudication executed: ${transactionIds.length} transactions updated to ${action}.`
        );
      }
    } catch (e) {
      showToast('Failed to execute bulk adjudication');
    }
  };

  // SAR Filing sign-off handler
  const handleMarkFiled = async (txId: string, narrative: string) => {
    await handleAdjudicate(
      txId,
      'SAR_FILED',
      'FinCEN Form 111 Part V Narrative drafted, verified, and officially submitted to Financial Crimes Enforcement Network.',
      false
    );
    showToast(`FinCEN SAR officially filed for case ${txId}`);
  };

  const pendingCount = transactions.filter((t) => t.status === 'PENDING_REVIEW').length;
  const criticalCount = transactions.filter((t) => t.riskBand === 'CRITICAL').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar Contract (Wordmark, Nav Links, Profile/Actions) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        criticalCount={criticalCount}
        isLiveStreaming={isLiveStreaming}
        setIsLiveStreaming={setIsLiveStreaming}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-indigo-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'monitoring' && (
          <FraudMonitoringQueue
            transactions={transactions}
            onSelectTransaction={(tx) => setSelectedTx(tx)}
            onDraftSar={(tx) => {
              setSarTx(tx);
              setSarNotes('Triggered by high-risk anomaly detection rules.');
            }}
            onTriggerTick={handleTriggerTick}
            onBulkAdjudicate={handleBulkAdjudicate}
          />
        )}

        {activeTab === 'copilot' && <RegulatoryCopilot />}

        {activeTab === 'sandbox' && <RiskSandbox />}

        {activeTab === 'regulations' && <RegulatoryLibrary />}

        {activeTab === 'audit' && <AuditGovernanceLog />}
      </main>

      {/* Transaction Details & Human Adjudication Modal */}
      {selectedTx && (
        <TransactionInspectorModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onAdjudicate={handleAdjudicate}
          onDraftSar={(tx, notes) => {
            setSelectedTx(null);
            setSarTx(tx);
            setSarNotes(notes);
          }}
        />
      )}

      {/* SAR Drafting Drawer */}
      {sarTx && (
        <SarDraftingDrawer
          transaction={sarTx}
          investigatorNotes={sarNotes}
          onClose={() => setSarTx(null)}
          onMarkFiled={handleMarkFiled}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">RiskGuard AI</span>
            <span>·</span>
            <span>Autonomous Risk Scoring, Real-time Fraud Detection &amp; Regulatory Copilot</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Grounding: FinCEN 31 CFR · FATF 40 · PMLA 2002 · GDPR Art. 22
          </div>
        </div>
      </footer>
    </div>
  );
}
