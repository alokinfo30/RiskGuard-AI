import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Command, 
  ArrowRight, 
  ShieldAlert, 
  Bell, 
  FileSearch, 
  BookOpen, 
  SlidersHorizontal, 
  History, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  CornerDownLeft, 
  X,
  Lock,
  Layers,
  Cloud
} from 'lucide-react';
import { TransactionRecord } from '../types/index.ts';
import { ActiveTab } from './Header.tsx';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionRecord[];
  onSelectTransaction: (tx: TransactionRecord) => void;
  onSelectTab: (tab: ActiveTab) => void;
  onTriggerTick: () => void;
  onOpenShortcuts: () => void;
  onDraftSar: (tx: TransactionRecord) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onSelectTransaction,
  onSelectTab,
  onTriggerTick,
  onOpenShortcuts,
  onDraftSar,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Tab navigation actions
  const navActions = useMemo(() => [
    {
      id: 'nav-monitoring',
      type: 'tab' as const,
      title: 'Go to Fraud Monitoring Stream',
      tab: 'monitoring' as ActiveTab,
      shortcut: '⌘1',
      icon: <ShieldAlert className="h-4 w-4 text-rose-400" />,
    },
    {
      id: 'nav-alerts',
      type: 'tab' as const,
      title: 'Go to Customer Personalized Alerts Hub',
      tab: 'alerts' as ActiveTab,
      shortcut: '⌘2',
      icon: <Bell className="h-4 w-4 text-amber-400" />,
    },
    {
      id: 'nav-documents',
      type: 'tab' as const,
      title: 'Go to Document AI Financial Reviewer (Multilingual)',
      tab: 'documents' as ActiveTab,
      shortcut: '⌘3',
      icon: <FileSearch className="h-4 w-4 text-blue-400" />,
    },
    {
      id: 'nav-lakehouse',
      type: 'tab' as const,
      title: 'Go to Google Cloud Lakehouse & Pub/Sub Pipeline',
      tab: 'lakehouse' as ActiveTab,
      shortcut: '⌘4',
      icon: <Cloud className="h-4 w-4 text-cyan-400" />,
    },
    {
      id: 'nav-copilot',
      type: 'tab' as const,
      title: 'Go to Regulatory Copilot (BSA / FinCEN / FATF)',
      tab: 'copilot' as ActiveTab,
      shortcut: '⌘5',
      icon: <BookOpen className="h-4 w-4 text-indigo-400" />,
    },
    {
      id: 'nav-sandbox',
      type: 'tab' as const,
      title: 'Go to ML Risk Simulator Sandbox',
      tab: 'sandbox' as ActiveTab,
      shortcut: '⌘6',
      icon: <SlidersHorizontal className="h-4 w-4 text-purple-400" />,
    },
    {
      id: 'nav-regulations',
      type: 'tab' as const,
      title: 'Go to Statute Framework Library',
      tab: 'regulations' as ActiveTab,
      shortcut: '⌘7',
      icon: <BookOpen className="h-4 w-4 text-teal-400" />,
    },
    {
      id: 'nav-audit',
      type: 'tab' as const,
      title: 'Go to Audit Governance & Cryptographic Ledger',
      tab: 'audit' as ActiveTab,
      shortcut: '⌘8',
      icon: <History className="h-4 w-4 text-cyan-400" />,
    },
  ], []);

  // Quick Command actions
  const quickActions = useMemo(() => [
    {
      id: 'act-stream-tick',
      type: 'action' as const,
      title: 'Inject Live Synthetic Transaction (PaySim Stream Tick)',
      action: () => {
        onTriggerTick();
        onClose();
      },
      shortcut: 'Live Tick',
      icon: <Zap className="h-4 w-4 text-yellow-400" />,
    },
    {
      id: 'act-shortcuts',
      type: 'action' as const,
      title: 'View Compliance Officer Keyboard Shortcuts Cheat Sheet',
      action: () => {
        onClose();
        onOpenShortcuts();
      },
      shortcut: '?',
      icon: <Command className="h-4 w-4 text-slate-300" />,
    },
  ], [onTriggerTick, onClose, onOpenShortcuts]);

  // Matching transactions
  const matchedTransactions = useMemo(() => {
    if (!query.trim()) return transactions.slice(0, 5);
    const q = query.toLowerCase();
    return transactions
      .filter((tx) => 
        tx.id.toLowerCase().includes(q) ||
        tx.nameOrig.toLowerCase().includes(q) ||
        tx.nameDest.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q) ||
        tx.riskBand.toLowerCase().includes(q) ||
        tx.fraudFlags.some((f) => f.toLowerCase().includes(q)) ||
        tx.amount.toString().includes(q)
      )
      .slice(0, 8);
  }, [query, transactions]);

  // Combined active list of searchable items
  const flatItems = useMemo(() => {
    const items: Array<{
      id: string;
      category: 'Transactions' | 'Navigation' | 'Actions';
      title: string;
      subtitle?: string;
      icon: React.ReactNode;
      shortcut?: string;
      onExecute: () => void;
      badge?: { text: string; color: string };
    }> = [];

    // Transactions first if searching
    if (matchedTransactions.length > 0) {
      matchedTransactions.forEach((tx) => {
        const badgeColor = 
          tx.riskBand === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
          tx.riskBand === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
          'bg-slate-800 text-slate-300 border-slate-700';

        items.push({
          id: `tx-${tx.id}`,
          category: 'Transactions',
          title: `${tx.id} — ${tx.currency} ${tx.amount.toLocaleString()} (${tx.type})`,
          subtitle: `${tx.nameOrig} → ${tx.nameDest} · Score ${tx.riskScore}/100 · ${tx.fraudFlags[0] ? tx.fraudFlags[0].replace(/_/g, ' ') : 'Normal'}`,
          icon: <ShieldAlert className="h-4 w-4 text-indigo-400" />,
          shortcut: '↵ Inspect',
          badge: { text: tx.riskBand, color: badgeColor },
          onExecute: () => {
            onSelectTransaction(tx);
            onClose();
          },
        });
      });
    }

    // Filter Navigation
    const q = query.toLowerCase();
    const filteredNav = navActions.filter((n) => !q || n.title.toLowerCase().includes(q));
    filteredNav.forEach((nav) => {
      items.push({
        id: nav.id,
        category: 'Navigation',
        title: nav.title,
        icon: nav.icon,
        shortcut: nav.shortcut,
        onExecute: () => {
          onSelectTab(nav.tab);
          onClose();
        },
      });
    });

    // Filter Quick Actions
    const filteredActions = quickActions.filter((a) => !q || a.title.toLowerCase().includes(q));
    filteredActions.forEach((act) => {
      items.push({
        id: act.id,
        category: 'Actions',
        title: act.title,
        icon: act.icon,
        shortcut: act.shortcut,
        onExecute: act.action,
      });
    });

    return items;
  }, [matchedTransactions, query, navActions, quickActions, onSelectTransaction, onSelectTab, onClose]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, flatItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % Math.max(1, flatItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        flatItems[selectedIndex].onExecute();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/70 gap-3">
          <Search className="h-5 w-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search transactions (ID, merchant, flag, amount) or jump to commands..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded shadow-sm">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-800/40">
          {flatItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              <Search className="mx-auto h-8 w-8 text-slate-600 mb-2" />
              <p>No matching transactions or commands found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1">Try searching by transaction ID (e.g. &ldquo;TX-9901&rdquo;) or amount</p>
            </div>
          ) : (
            <div className="space-y-1">
              {flatItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => item.onExecute()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                        : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold truncate text-slate-100">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${item.badge.color}`}>
                              {item.badge.text}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.shortcut && (
                        <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <CornerDownLeft className="h-3.5 w-3.5 text-indigo-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-4">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-300">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-300">↵</kbd> Select</span>
            <span><kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-300">ESC</kbd> Close</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-indigo-400">
            <span>Power User Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};
