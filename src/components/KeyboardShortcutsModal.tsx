import React from 'react';
import { X, Command, CornerDownLeft, Search, ShieldAlert, BookOpen, SlidersHorizontal, History, Bell, FileSearch, Cloud } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Power Search & Adjudication',
      items: [
        {
          keys: ['⌘', 'K'],
          altKeys: ['Ctrl', 'K'],
          description: 'Open Global Command Palette & Transaction Search',
          icon: <Search className="h-4 w-4 text-indigo-400" />,
        },
        {
          keys: ['⌘', '↵'],
          altKeys: ['Ctrl', 'Enter'],
          description: 'Instant File SAR / Adjudicate Selected Transaction',
          icon: <CornerDownLeft className="h-4 w-4 text-emerald-400" />,
        },
        {
          keys: ['Esc'],
          description: 'Close Active Modal, Drawer or Command Palette',
          icon: <X className="h-4 w-4 text-slate-400" />,
        },
        {
          keys: ['?'],
          description: 'Display this Keyboard Shortcuts Reference',
          icon: <Command className="h-4 w-4 text-amber-400" />,
        },
      ],
    },
    {
      category: 'Direct Tab Navigation',
      items: [
        {
          keys: ['⌘', '1'],
          altKeys: ['Ctrl', '1'],
          description: 'Switch to Fraud Monitoring Stream',
          icon: <ShieldAlert className="h-4 w-4 text-rose-400" />,
        },
        {
          keys: ['⌘', '2'],
          altKeys: ['Ctrl', '2'],
          description: 'Switch to Customer Personalized Alerts Hub',
          icon: <Bell className="h-4 w-4 text-amber-400" />,
        },
        {
          keys: ['⌘', '3'],
          altKeys: ['Ctrl', '3'],
          description: 'Switch to Document AI Multilingual Reviewer',
          icon: <FileSearch className="h-4 w-4 text-blue-400" />,
        },
        {
          keys: ['⌘', '4'],
          altKeys: ['Ctrl', '4'],
          description: 'Switch to Google Cloud Lakehouse & Pub/Sub Telemetry',
          icon: <Cloud className="h-4 w-4 text-cyan-400" />,
        },
        {
          keys: ['⌘', '5'],
          altKeys: ['Ctrl', '5'],
          description: 'Switch to Regulatory Copilot (FinCEN / BSA / FATF)',
          icon: <BookOpen className="h-4 w-4 text-indigo-400" />,
        },
        {
          keys: ['⌘', '6'],
          altKeys: ['Ctrl', '6'],
          description: 'Switch to ML Risk Simulator Sandbox',
          icon: <SlidersHorizontal className="h-4 w-4 text-purple-400" />,
        },
        {
          keys: ['⌘', '7'],
          altKeys: ['Ctrl', '7'],
          description: 'Switch to Statutory Framework Library',
          icon: <BookOpen className="h-4 w-4 text-teal-400" />,
        },
        {
          keys: ['⌘', '8'],
          altKeys: ['Ctrl', '8'],
          description: 'Switch to Audit Governance & Cryptographic Ledger',
          icon: <History className="h-4 w-4 text-emerald-400" />,
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Command className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Compliance Officer Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-400">Power-user accelerators for high-velocity AML triage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shortcuts Groups */}
        <div className="mt-5 space-y-6">
          {shortcuts.map((group) => (
            <div key={group.category} className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                {group.category}
              </h3>
              <div className="grid gap-2">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      {item.icon}
                      <span>{item.description}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      {item.keys.map((k, ki) => (
                        <kbd
                          key={ki}
                          className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-semibold shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Esc</kbd> anytime to close</span>
          <span className="font-mono text-indigo-400">FinCEN &amp; BSA Speed Optimization</span>
        </div>
      </div>
    </div>
  );
};
