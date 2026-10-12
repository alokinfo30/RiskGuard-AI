import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  BookOpen, 
  SlidersHorizontal, 
  History, 
  Radio, 
  Bell, 
  FileSearch,
  Menu,
  X,
  Search,
  Command,
  HelpCircle,
  Cloud
} from 'lucide-react';
import { AlertSettingsPanel, AlertConfig } from './AlertSettingsPanel.tsx';
import avatarImg from '../assets/images/avatar_compliance_lead_1791140102843.jpg';

export type ActiveTab = 'monitoring' | 'alerts' | 'documents' | 'lakehouse' | 'copilot' | 'sandbox' | 'regulations' | 'audit';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingCount: number;
  criticalCount: number;
  customerAlertsPendingCount?: number;
  isLiveStreaming: boolean;
  setIsLiveStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  alertConfig: AlertConfig;
  setAlertConfig: React.Dispatch<React.SetStateAction<AlertConfig>>;
  onOpenCommandPalette?: () => void;
  onOpenShortcuts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  criticalCount,
  customerAlertsPendingCount = 0,
  isLiveStreaming,
  setIsLiveStreaming,
  alertConfig,
  setAlertConfig,
  onOpenCommandPalette,
  onOpenShortcuts,
}) => {
  const [isAlertSettingsOpen, setIsAlertSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Zone 1: Logo Wordmark & Quick Search Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <button 
            onClick={() => setActiveTab('monitoring')}
            className="text-left font-bold tracking-tight text-base sm:text-lg text-slate-100 hover:text-indigo-300 transition-colors"
          >
            RiskGuard AI
          </button>

          {/* Global Search / Command Palette shortcut trigger button */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="hidden lg:flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors ml-1"
              title="Global Command Palette (Cmd+K)"
            >
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px]">Quick search...</span>
              <kbd className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300 border border-slate-700">
                ⌘K
              </kbd>
            </button>
          )}
        </div>

        {/* Zone 2: Navigation segmented tabs (Hidden on smaller screens, scrollable on desktop) */}
        <nav className="hidden xl:flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800/80">
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'monitoring'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Fraud Stream</span>
            {pendingCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'monitoring' ? 'bg-indigo-700 text-indigo-100' : 'bg-rose-500/20 text-rose-300'}`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'alerts'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Customer Alerts</span>
            {customerAlertsPendingCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-amber-500/20 text-amber-300">
                {customerAlertsPendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'documents'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileSearch className="h-3.5 w-3.5" />
            <span>Document AI</span>
          </button>

          <button
            onClick={() => setActiveTab('lakehouse')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'lakehouse'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cloud className="h-3.5 w-3.5" />
            <span>Cloud Lakehouse</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'copilot'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'sandbox'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('regulations')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'regulations'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Statutes</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Audit</span>
          </button>
        </nav>

        {/* Medium screens compact nav */}
        <nav className="hidden md:flex xl:hidden items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800/80">
          {[
            { id: 'monitoring', label: 'Monitoring', icon: <ShieldAlert className="h-3.5 w-3.5" /> },
            { id: 'alerts', label: 'Alerts', icon: <Bell className="h-3.5 w-3.5" /> },
            { id: 'documents', label: 'Docs', icon: <FileSearch className="h-3.5 w-3.5" /> },
            { id: 'lakehouse', label: 'Lakehouse', icon: <Cloud className="h-3.5 w-3.5" /> },
            { id: 'copilot', label: 'Copilot', icon: <BookOpen className="h-3.5 w-3.5" /> },
            { id: 'audit', label: 'Audit', icon: <History className="h-3.5 w-3.5" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions, Alert Settings, Shortcuts & Profile */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
              title="Search (Cmd+K)"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* Keyboard Shortcuts Trigger */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="hidden sm:flex items-center justify-center h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
              title="Keyboard Shortcuts Cheat Sheet (?)"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          )}

          {/* Stream control toggle */}
          <button
            onClick={() => setIsLiveStreaming((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium transition-all ${
              isLiveStreaming
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
            title={isLiveStreaming ? "Pause PaySim synthetic stream" : "Resume PaySim synthetic stream"}
          >
            <Radio className={`h-3 w-3 ${isLiveStreaming ? 'animate-pulse text-emerald-400' : 'text-slate-500'}`} />
            <span className="hidden sm:inline font-mono text-[10px]">
              {isLiveStreaming ? 'LIVE' : 'PAUSED'}
            </span>
          </button>

          {/* Audio Chime Notification Toggle Flyout */}
          <div className="relative">
            <button
              onClick={() => setIsAlertSettingsOpen((prev) => !prev)}
              className={`relative flex items-center justify-center h-8 w-8 rounded-lg border transition-colors ${
                isAlertSettingsOpen
                  ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                  : alertConfig.soundEnabled
                  ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                  : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300'
              }`}
              title="Alert Chime & Notification Audio Settings"
            >
              <Bell className="h-4 w-4" />
              {alertConfig.soundEnabled && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              )}
            </button>

            <AlertSettingsPanel
              isOpen={isAlertSettingsOpen}
              onClose={() => setIsAlertSettingsOpen(false)}
              config={alertConfig}
              onChangeConfig={setAlertConfig}
            />
          </div>

          {/* Officer Avatar */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <img
              src={avatarImg}
              alt="Compliance Officer"
              className="h-8 w-8 rounded-full border border-slate-700 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="hidden 2xl:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">Sarah Jenkins</p>
              <p className="text-[10px] text-slate-400 leading-tight">Compliance Lead · MLRO</p>
            </div>
          </div>

          {/* Mobile Navigation Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Slide-Down Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/90 bg-slate-950/98 px-4 py-3 space-y-1.5 shadow-2xl animate-in slide-in-from-top-2">
          <button
            onClick={() => {
              setActiveTab('monitoring');
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'monitoring'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Fraud Stream</span>
            </div>
            {pendingCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                {pendingCount} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('alerts');
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'alerts'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Customer Personalized Alerts</span>
            </div>
            {customerAlertsPendingCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                {customerAlertsPendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('documents');
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'documents'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <FileSearch className="h-4 w-4" />
            <span>Document AI Multilingual Forensics</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('lakehouse');
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'lakehouse'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <Cloud className="h-4 w-4" />
            <span>Google Cloud Lakehouse &amp; Pub/Sub</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('copilot');
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'copilot'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Regulatory Copilot (FinCEN / FATF)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('sandbox');
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'sandbox'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Risk Simulator &amp; SHAP Waterfall</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('regulations');
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'regulations'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Statute Library &amp; Guidelines</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('audit');
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Audit Ledger &amp; SAR Pipeline</span>
          </button>
        </div>
      )}
    </header>
  );
};
