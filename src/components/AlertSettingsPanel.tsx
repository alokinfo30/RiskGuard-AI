import React from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Check, 
  X, 
  Play, 
  ShieldAlert,
  Radio
} from 'lucide-react';
import { playAlertChime } from '../utils/audioAlert.ts';

export interface AlertConfig {
  soundEnabled: boolean;
  toastEnabled: boolean;
  minSeverity: 'CRITICAL' | 'HIGH_AND_CRITICAL';
  volume: number;
}

interface AlertSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: AlertConfig;
  onChangeConfig: (newConfig: AlertConfig) => void;
}

export const AlertSettingsPanel: React.FC<AlertSettingsPanelProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  const handleToggleSound = () => {
    onChangeConfig({
      ...config,
      soundEnabled: !config.soundEnabled,
    });
    if (!config.soundEnabled) {
      playAlertChime(config.volume);
    }
  };

  const handleToggleToast = () => {
    onChangeConfig({
      ...config,
      toastEnabled: !config.toastEnabled,
    });
  };

  const handleVolumeChange = (vol: number) => {
    onChangeConfig({
      ...config,
      volume: vol,
    });
  };

  const handleSeverityChange = (sev: 'CRITICAL' | 'HIGH_AND_CRITICAL') => {
    onChangeConfig({
      ...config,
      minSeverity: sev,
    });
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Real-Time Alert Dispatcher
            </h3>
            <p className="text-[10px] text-slate-400">Audio &amp; Push Triggers for Critical Anomalies</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 pt-3 text-xs">
        {/* Audio Chime Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              {config.soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span>Synthesizer Audio Chime</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Plays acoustic alert on incoming Critical risk transaction
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleSound}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              config.soundEnabled ? 'bg-indigo-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                config.soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Volume Slider & Test Button */}
        {config.soundEnabled && (
          <div className="space-y-2 px-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Chime Volume:</span>
              <span className="font-mono text-slate-200">{Math.round(config.volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={config.volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="flex-1 accent-indigo-500"
              />
              <button
                type="button"
                onClick={() => playAlertChime(config.volume)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold transition-colors"
                title="Play test audio chime"
              >
                <Play className="h-3 w-3 text-indigo-400" />
                <span>Test</span>
              </button>
            </div>
          </div>
        )}

        {/* Push Notification Banner Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Radio className="h-3.5 w-3.5 text-indigo-400" />
              <span>In-App Urgent Banner</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Shows prominent top toast alert with direct case inspection link
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleToast}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              config.toastEnabled ? 'bg-indigo-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                config.toastEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Sensitivity Severity Level */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-300">
            Surveillance Trigger Sensitivity
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSeverityChange('CRITICAL')}
              className={`p-2 rounded-lg border text-left text-[11px] font-medium transition-all ${
                config.minSeverity === 'CRITICAL'
                  ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold">CRITICAL Only</div>
              <div className="text-[9px] text-slate-500 font-mono">Score &gt;= 80 (Mules &amp; Drains)</div>
            </button>

            <button
              type="button"
              onClick={() => handleSeverityChange('HIGH_AND_CRITICAL')}
              className={`p-2 rounded-lg border text-left text-[11px] font-medium transition-all ${
                config.minSeverity === 'HIGH_AND_CRITICAL'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold">HIGH &amp; CRITICAL</div>
              <div className="text-[9px] text-slate-500 font-mono">Score &gt;= 60 (All Anomalies)</div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
        <span>Settings active in real-time</span>
        <button
          onClick={() => {
            onChangeConfig({
              soundEnabled: true,
              toastEnabled: true,
              minSeverity: 'CRITICAL',
              volume: 0.6,
            });
          }}
          className="text-indigo-400 hover:text-indigo-300"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};
