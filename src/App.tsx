import React, { useState, useEffect, useRef } from 'react';
import { Header, ActiveTab } from './components/Header.tsx';
import { FraudMonitoringQueue } from './components/FraudMonitoringQueue.tsx';
import { TransactionInspectorModal } from './components/TransactionInspectorModal.tsx';
import { RegulatoryCopilot } from './components/RegulatoryCopilot.tsx';
import { SarDraftingDrawer } from './components/SarDraftingDrawer.tsx';
import { RiskSandbox } from './components/RiskSandbox.tsx';
import { RegulatoryLibrary } from './components/RegulatoryLibrary.tsx';
import { AuditGovernanceLog } from './components/AuditGovernanceLog.tsx';
import { CustomerAlertsHub } from './components/CustomerAlertsHub.tsx';
import { DocumentAiReviewer } from './components/DocumentAiReviewer.tsx';
import { CloudLakehousePipeline } from './components/CloudLakehousePipeline.tsx';
import { CommandPaletteModal } from './components/CommandPaletteModal.tsx';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal.tsx';
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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [customerAlertsPendingCount, setCustomerAlertsPendingCount] = useState<number>(1);
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

  // Fetch customer alerts count
  const fetchCustomerAlertsCount = async () => {
    try {
      const res = await fetch('/api/customer-alerts');
      if (res.ok) {
        const data = await res.json();
        if (typeof data.pendingCount === 'number') {
          setCustomerAlertsPendingCount(data.pendingCount);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchTransactions();
    fetchCustomerAlertsCount();
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

  // Global Keyboard Shortcuts Hook
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select';

      // Cmd+K or Ctrl+K: Open Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Esc: Close any open modal
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (selectedTx) {
          setSelectedTx(null);
          return;
        }
        if (sarTx) {
          setSarTx(null);
          return;
        }
      }

      // ? key: Open Keyboard Shortcuts Sheet (when not typing in input)
      if (e.key === '?' && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsShortcutsModalOpen(true);
        return;
      }

      // Cmd+1 to Cmd+8 tab shortcuts
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('monitoring');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveTab('alerts');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveTab('documents');
        } else if (e.key === '4') {
          e.preventDefault();
          setActiveTab('lakehouse');
        } else if (e.key === '5') {
          e.preventDefault();
          setActiveTab('copilot');
        } else if (e.key === '6') {
          e.preventDefault();
          setActiveTab('sandbox');
        } else if (e.key === '7') {
          e.preventDefault();
          setActiveTab('regulations');
        } else if (e.key === '8') {
          e.preventDefault();
          setActiveTab('audit');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isCommandPaletteOpen, isShortcutsModalOpen, selectedTx, sarTx]);

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
          analyst: 'Sarah Jenkins (Senior Compliance VP)',
          falsePositive: isFalsePositive,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTransactions((prev) =>
          prev.map((t) => (t.id === txId ? data.transaction : t))
        );
        setSelectedTx(null);
        showToast(`Case ${txId} adjudicated: ${action.replace(/_/g, ' ')}`);
        fetchCustomerAlertsCount();
      }
    } catch (e) {
      showToast(`Adjudication failure for ${txId}`);
    }
  };

  // Bulk Human-in-the-loop adjudication handler
  const handleBulkAdjudicate = async (
    txIds: string[],
    action: DecisionStatus,
    reason: string
  ) => {
    try {
      const res = await fetch('/api/decisions/bulk-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionIds: txIds,
          action,
          reason,
          analyst: 'Sarah Jenkins (Senior Compliance VP)',
          falsePositive: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedMap = new Map<string, TransactionRecord>(
          (data.transactions || []).map((t: TransactionRecord) => [t.id, t])
        );

        setTransactions((prev) =>
          prev.map((t) => (updatedMap.has(t.id) ? updatedMap.get(t.id)! : t))
        );

        showToast(`Bulk Adjudication: ${txIds.length} transactions set to ${action}`);
        fetchCustomerAlertsCount();
      }
    } catch (e) {
      showToast(`Bulk adjudication failure`);
    }
  };

  // Mark SAR filed handler
  const handleMarkFiled = async (txId: string, narrative: string) => {
    await handleAdjudicate(
      txId,
      'SAR_FILED',
      `FinCEN Form 111 Part V Narrative officially filed. Retained 5 years under BSA.\n${narrative.slice(0, 150)}...`,
      false
    );
    setSarTx(null);
  };

  const pendingCount = transactions.filter((t) => t.status === 'PENDING_REVIEW').length;
  const criticalCount = transactions.filter((t) => t.riskBand === 'CRITICAL').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        criticalCount={criticalCount}
        customerAlertsPendingCount={customerAlertsPendingCount}
        isLiveStreaming={isLiveStreaming}
        setIsLiveStreaming={setIsLiveStreaming}
        alertConfig={alertConfig}
        setAlertConfig={setAlertConfig}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      {/* Floating Critical Alert Toast Bar */}
      {toastMessage && (
        <div
          onClick={() => {
            if (toastMessage.tx) {
              setSelectedTx(toastMessage.tx);
              setToastMessage(null);
            }
          }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-md cursor-pointer transition-all transform animate-in slide-in-from-bottom-5 duration-300 max-w-md ${
            toastMessage.isCritical
              ? 'border-rose-500/50 bg-rose-950/90 text-rose-100 shadow-rose-950/50'
              : 'border-slate-800 bg-slate-900/90 text-slate-200'
          }`}
        >
          {toastMessage.isCritical ? (
            <div className="relative">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </div>
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
      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-6">
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

        {activeTab === 'alerts' && (
          <CustomerAlertsHub
            transactions={transactions}
            onInspectTransaction={(tx) => setSelectedTx(tx)}
            onRefreshTransactions={() => {
              fetchTransactions();
              fetchCustomerAlertsCount();
            }}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentAiReviewer
            transactions={transactions}
            onDraftSarWithExhibit={(tx, exhibit) => {
              setSelectedTx(null);
              setSarTx(tx);
              setSarNotes(`[Document AI Forensic Exhibit Attached]\n${exhibit}`);
            }}
          />
        )}

        {activeTab === 'lakehouse' && <CloudLakehousePipeline />}

        {activeTab === 'copilot' && <RegulatoryCopilot />}

        {activeTab === 'sandbox' && <RiskSandbox />}

        {activeTab === 'regulations' && <RegulatoryLibrary />}

        {activeTab === 'audit' && <AuditGovernanceLog transactions={transactions} />}
      </main>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        transactions={transactions}
        onSelectTransaction={(tx) => setSelectedTx(tx)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onTriggerTick={handleTriggerTick}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onDraftSar={(tx) => {
          setSarTx(tx);
          setSarNotes('Triggered from global command palette.');
        }}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal (?) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

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
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
            <span>Grounding: FinCEN 31 CFR · FATF 40 · PMLA 2002 · GDPR Art. 22</span>
            <button
              onClick={() => setIsShortcutsModalOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              Shortcuts (?)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
