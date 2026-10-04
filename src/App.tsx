import React, { useState, useEffect, useRef } from 'react';
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
import { AlertConfig } from './components/AlertSettingsPanel.tsx';
import { playAlertChime } from './utils/audioAlert.ts';
import { ShieldCheck, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('monitoring');
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [sarTx, setSarTx] = useState<TransactionRecord | null>(null);
  const [sarNotes, setSarNotes] = useState<string>('');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    isCritical?: boolean;
    tx?: TransactionRecord;
  } | null>(null);

  // Alert settings state
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(() => {
    try {
      const saved = localStorage.getItem('riskguard_alert_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      soundEnabled: true,
      toastEnabled: true,
      minSeverity: 'CRITICAL',
      volume: 0.6,
    };
  });

  // Save alert config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('riskguard_alert_config', JSON.stringify(alertConfig));
    } catch (e) {}
  }, [alertConfig]);

  const showToast = (text: string, isCritical?: boolean, tx?: TransactionRecord) => {
    setToastMessage({ text, isCritical, tx });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
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

  // Alert handler on new transaction arrival
  const handleNewTransactionAlert = (newTx: TransactionRecord) => {
    const isCritical = newTx.riskBand === 'CRITICAL' || newTx.riskScore >= 80;
    const isHigh = newTx.riskBand === 'HIGH' || newTx.riskScore >= 60;

    const meetsThreshold =
      alertConfig.minSeverity === 'CRITICAL'
        ? isCritical
        : isCritical || isHigh;

    if (meetsThreshold) {
      if (alertConfig.soundEnabled) {
        playAlertChime(alertConfig.volume);
      }
      if (alertConfig.toastEnabled) {
        showToast(
          `Critical Alert: ${newTx.id} (${newTx.currency} ${newTx.amount.toLocaleString()}) — ${newTx.fraudFlags[0] ? newTx.fraudFlags[0].replace(/_/g, ' ') : 'High Risk Anomaly'}`,
          true,
          newTx
        );
      }
    }
  };

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
            handleNewTransactionAlert(data.transaction);
          }
        }
      } catch (err) {
        // Fallback quiet tick
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, alertConfig]);

  // Handle manual synthetic injection
  const handleTriggerTick = async () => {
    try {
      const res = await fetch('/api/transactions/stream-tick', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
          handleNewTransactionAlert(data.transaction);
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
      {/* Top Bar Contract (Wordmark, Nav Links, Profile/Actions & Alert Settings) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        criticalCount={criticalCount}
        isLiveStreaming={isLiveStreaming}
        setIsLiveStreaming={setIsLiveStreaming}
        alertConfig={alertConfig}
        setAlertConfig={setAlertConfig}
      />

      {/* Toast / Push Notification Banner */}
      {toastMessage && (
        <div
          onClick={() => {
            if (toastMessage.tx) {
              setSelectedTx(toastMessage.tx);
              setToastMessage(null);
            }
          }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 cursor-pointer max-w-md ${
            toastMessage.isCritical
              ? 'border-rose-500/60 bg-rose-950/90 text-rose-100 ring-1 ring-rose-500/30'
              : 'border-indigo-500/40 bg-slate-900/95 text-indigo-200'
          }`}
        >
          {toastMessage.isCritical ? (
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 animate-bounce" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          )}
          <div className="flex-1 text-xs">
            <div className="font-semibold leading-snug">{toastMessage.text}</div>
            {toastMessage.tx && (
              <div className="text-[10px] text-rose-300 font-mono pt-0.5 flex items-center gap-1">
                <span>Click to inspect case immediately</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            )}
          </div>
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
