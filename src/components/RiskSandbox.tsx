import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Zap,
  TrendingUp,
  Scale,
  Sparkles
} from 'lucide-react';
import { computeRiskScore, FeatureWeight, RiskBand, TransactionType } from '../data/syntheticTransactions.ts';

export const RiskSandbox: React.FC = () => {
  // Input parameters for simulation
  const [amount, setAmount] = useState<number>(9850);
  const [currency, setCurrency] = useState<string>('USD');
  const [txType, setTxType] = useState<TransactionType>('TRANSFER');
  const [origAccountAgeMonths, setOrigAccountAgeMonths] = useState<number>(4);
  const [destAccountAgeDays, setDestAccountAgeDays] = useState<number>(3);
  const [oldbalanceOrig, setOldbalanceOrig] = useState<number>(10000);
  const [isVpn, setIsVpn] = useState<boolean>(true);
  const [pepWatchlist, setPepWatchlist] = useState<boolean>(false);
  const [priorChargebacks, setPriorChargebacks] = useState<number>(0);
  const [velocity1Hour, setVelocity1Hour] = useState<number>(3);
  const [isCrossBorder, setIsCrossBorder] = useState<boolean>(true);

  // Score output state
  const [evalResult, setEvalResult] = useState<{
    riskScore: number;
    riskBand: RiskBand;
    flags: string[];
    weights: FeatureWeight[];
    suggestedAction: string;
  }>(() => computeRiskScore({
    amount: 9850,
    currency: 'USD',
    type: 'TRANSFER',
    origAccountAgeMonths: 4,
    destAccountAgeDays: 3,
    oldbalanceOrig: 10000,
    isVpn: true,
    pepWatchlist: false,
    priorChargebacks: 0,
    velocity1Hour: 3,
    isCrossBorder: true,
  }));

  // Re-calculate dynamically when any parameter changes
  useEffect(() => {
    const res = computeRiskScore({
      amount,
      currency,
      type: txType,
      origAccountAgeMonths,
      destAccountAgeDays,
      oldbalanceOrig,
      isVpn,
      pepWatchlist,
      priorChargebacks,
      velocity1Hour,
      isCrossBorder,
    });
    setEvalResult(res);
  }, [
    amount,
    currency,
    txType,
    origAccountAgeMonths,
    destAccountAgeDays,
    oldbalanceOrig,
    isVpn,
    pepWatchlist,
    priorChargebacks,
    velocity1Hour,
    isCrossBorder,
  ]);

  const loadScenario = (name: 'smurfing' | 'ato' | 'false_positive' | 'pmla_india') => {
    if (name === 'smurfing') {
      setAmount(9850);
      setCurrency('USD');
      setTxType('TRANSFER');
      setOrigAccountAgeMonths(3);
      setDestAccountAgeDays(3);
      setOldbalanceOrig(10000);
      setIsVpn(true);
      setPepWatchlist(false);
      setPriorChargebacks(0);
      setVelocity1Hour(3);
      setIsCrossBorder(false);
    } else if (name === 'ato') {
      setAmount(42000);
      setCurrency('USD');
      setTxType('TRANSFER');
      setOrigAccountAgeMonths(12);
      setDestAccountAgeDays(2);
      setOldbalanceOrig(43000);
      setIsVpn(true);
      setPepWatchlist(false);
      setPriorChargebacks(0);
      setVelocity1Hour(5);
      setIsCrossBorder(true);
    } else if (name === 'false_positive') {
      setAmount(125000);
      setCurrency('USD');
      setTxType('CASH_OUT');
      setOrigAccountAgeMonths(48);
      setDestAccountAgeDays(800);
      setOldbalanceOrig(950000);
      setIsVpn(false);
      setPepWatchlist(false);
      setPriorChargebacks(0);
      setVelocity1Hour(1);
      setIsCrossBorder(false);
    } else if (name === 'pmla_india') {
      setAmount(1200000);
      setCurrency('INR');
      setTxType('TRANSFER');
      setOrigAccountAgeMonths(14);
      setDestAccountAgeDays(10);
      setOldbalanceOrig(1300000);
      setIsVpn(true);
      setPepWatchlist(false);
      setPriorChargebacks(0);
      setVelocity1Hour(2);
      setIsCrossBorder(true);
    }
  };

  const isCritical = evalResult.riskBand === 'CRITICAL';
  const isHigh = evalResult.riskBand === 'HIGH';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
            <span>Interactive Risk Engine &amp; Edge-Case Sandbox</span>
          </h2>
          <p className="text-xs text-slate-400">
            Tune multi-factor transactional features to test ML sensitivity, false positives, and statutory compliance triggers.
          </p>
        </div>

        {/* Pre-Loaded Scenarios */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-semibold mr-1">Scenarios:</span>
          <button
            onClick={() => loadScenario('smurfing')}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:border-indigo-500/50 transition-colors"
          >
            CTR Smurfing ($9,850)
          </button>
          <button
            onClick={() => loadScenario('ato')}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:border-indigo-500/50 transition-colors"
          >
            ATO Burst ($42k)
          </button>
          <button
            onClick={() => loadScenario('false_positive')}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:border-indigo-500/50 transition-colors"
          >
            B2B False Positive ($125k)
          </button>
          <button
            onClick={() => loadScenario('pmla_india')}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:border-indigo-500/50 transition-colors"
          >
            PMLA ₹10L Threshold
          </button>
        </div>
      </div>

      {/* Grid: Controls on Left, Live Score & Explainability on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-1 border-b border-slate-800">
            Transactional &amp; Entity Parameters
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Currency */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg bg-slate-950 px-3 py-1.5 text-xs text-slate-200 border border-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="INR">INR (₹)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Channel / Type</label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value as TransactionType)}
                className="w-full rounded-lg bg-slate-950 px-3 py-1.5 text-xs text-slate-200 border border-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="TRANSFER">TRANSFER (Wire / P2P)</option>
                <option value="CASH_OUT">CASH_OUT (ATM/Branch)</option>
                <option value="PAYMENT">PAYMENT (Merchant)</option>
                <option value="DEBIT">DEBIT</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Amount ({currency})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-mono tabular-nums text-slate-200 border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Balance Dynamics Slider */}
          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Origin Pre-Transaction Balance:</span>
              <span className="font-mono text-slate-200">{currency} {oldbalanceOrig.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="200000"
              step="1000"
              value={oldbalanceOrig}
              onChange={(e) => setOldbalanceOrig(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Drain Ratio: {((amount / Math.max(1, oldbalanceOrig)) * 100).toFixed(1)}%</span>
              <span>{amount > oldbalanceOrig ? '⚠️ Exceeds Available Balance' : 'Liquid coverage'}</span>
            </div>
          </div>

          {/* Account Age Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Customer Tenure:</span>
                <span className="font-mono text-slate-200">{origAccountAgeMonths} months</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={origAccountAgeMonths}
                onChange={(e) => setOrigAccountAgeMonths(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Beneficiary Account Age:</span>
                <span className="font-mono text-slate-200">{destAccountAgeDays} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="365"
                value={destAccountAgeDays}
                onChange={(e) => setDestAccountAgeDays(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* Velocity in 1 hour */}
          <div className="pt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Velocity (Transactions in past 60 min):</span>
              <span className="font-mono text-slate-200">{velocity1Hour} outbound calls</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={velocity1Hour}
              onChange={(e) => setVelocity1Hour(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Behavioral / Telemetry Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <input
                type="checkbox"
                checked={isVpn}
                onChange={(e) => setIsVpn(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span>Commercial VPN / Tor Exit Relay</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <input
                type="checkbox"
                checked={isCrossBorder}
                onChange={(e) => setIsCrossBorder(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span>Cross-Border Foreign Corridor</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <input
                type="checkbox"
                checked={pepWatchlist}
                onChange={(e) => setPepWatchlist(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span>PEP / Sanctions Watchlist Match</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <input
                type="checkbox"
                checked={priorChargebacks > 0}
                onChange={(e) => setPriorChargebacks(e.target.checked ? 2 : 0)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span>Prior Fraud / Chargeback History</span>
            </label>
          </div>
        </div>

        {/* Live Output & Explainability (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Score Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Risk Engine Evaluation</span>
              <span className="font-mono text-[11px] text-slate-500">Real-time Inference</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-5xl font-black font-mono tabular-nums ${
                    isCritical
                      ? 'text-rose-400'
                      : isHigh
                      ? 'text-orange-400'
                      : evalResult.riskBand === 'MEDIUM'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {evalResult.riskScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>

              <span
                className={`text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                  isCritical
                    ? 'bg-rose-500/20 text-rose-300'
                    : isHigh
                    ? 'bg-orange-500/20 text-orange-300'
                    : evalResult.riskBand === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {evalResult.riskBand} RISK
              </span>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isCritical
                    ? 'bg-rose-500'
                    : isHigh
                    ? 'bg-orange-500'
                    : evalResult.riskBand === 'MEDIUM'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${evalResult.riskScore}%` }}
              />
            </div>

            {/* Recommended Policy Action */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Autonomous Gate Decision:</span>
              <div className="font-mono font-bold text-slate-200">
                {evalResult.suggestedAction === 'ACCOUNT_FROZEN' && '🔴 Freeze Beneficiary & Disallow Outbound Transfer'}
                {evalResult.suggestedAction === 'STEP_UP_KYC' && '🟠 Challenge User with Step-Up Biometric / KYC'}
                {evalResult.suggestedAction === 'PENDING_REVIEW' && '🟡 Route to MLRO Investigative Triage Queue'}
                {evalResult.suggestedAction === 'APPROVED' && '🟢 Clear & Auto-Approve Transaction'}
              </div>
            </div>
          </div>

          {/* Explainability Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                <span>Feature Impact Waterfall</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">SHAP Weights</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {evalResult.weights.map((w, idx) => {
                const isPos = w.deltaPoints > 0;
                return (
                  <div key={idx} className="p-2 rounded bg-slate-950/50 border border-slate-800/60 text-xs space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-slate-300 truncate max-w-[75%]">{w.factor}</span>
                      <span className={`font-mono font-bold ${isPos ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isPos ? `+${w.deltaPoints}` : `${w.deltaPoints}`} pts
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">{w.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
