import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  BookOpen, 
  SlidersHorizontal, 
  History, 
  Radio, 
  Bell, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { AlertSettingsPanel, AlertConfig } from './AlertSettingsPanel.tsx';
import avatarImg from '../assets/images/avatar_compliance_lead_1791140102843.jpg';

export type ActiveTab = 'monitoring' | 'copilot' | 'sandbox' | 'regulations' | 'audit';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingCount: number;
  criticalCount: number;
  isLiveStreaming: boolean;
  setIsLiveStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  alertConfig: AlertConfig;
  setAlertConfig: React.Dispatch<React.SetStateAction<AlertConfig>>;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  criticalCount,
  isLiveStreaming,
  setIsLiveStreaming,
  alertConfig,
  setAlertConfig,
}) => {
  const [isAlertSettingsOpen, setIsAlertSettingsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <button 
            onClick={() => setActiveTab('monitoring')}
            className="text-left font-bold tracking-tight text-lg text-slate-100 hover:text-indigo-300 transition-colors"
          >
            RiskGuard AI
          </button>
        </div>

        {/* Zone 2: Clean text navigation links / segmented tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800/80">
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
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
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'copilot'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Regulatory Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'sandbox'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Risk Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('regulations')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'regulations'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Statute Library</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Audit Ledger</span>
          </button>
        </nav>

        {/* Zone 3: Actions, Alert Settings & Analyst Profile */}
        <div className="flex items-center gap-2.5">
          {/* Stream control toggle */}
          <button
            onClick={() => setIsLiveStreaming((prev) => !prev)}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
              isLiveStreaming
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
            title={isLiveStreaming ? "Pause PaySim synthetic stream" : "Resume PaySim synthetic stream"}
          >
            <Radio className={`h-3 w-3 ${isLiveStreaming ? 'animate-pulse text-emerald-400' : 'text-slate-500'}`} />
            <span className="hidden sm:inline font-mono text-[11px]">
              {isLiveStreaming ? 'STREAMING' : 'PAUSED'}
            </span>
          </button>

          {/* Alert Settings Trigger Button */}
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
              title="Alert & Sound Notification Configuration"
            >
              <Bell className="h-4 w-4" />
              {alertConfig.soundEnabled && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              )}
            </button>

            {/* Alert Settings Dropdown Flyout Panel */}
            <AlertSettingsPanel
              isOpen={isAlertSettingsOpen}
              onClose={() => setIsAlertSettingsOpen(false)}
              config={alertConfig}
              onChangeConfig={setAlertConfig}
            />
          </div>

          {/* Compliance Officer Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <img
              src={avatarImg}
              alt="Compliance Officer"
              className="h-8 w-8 rounded-full border border-slate-700 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">Sarah Jenkins</p>
              <p className="text-[10px] text-slate-400 leading-tight">Compliance Lead · MLRO</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
