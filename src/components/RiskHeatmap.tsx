import React, { useState, useMemo } from 'react';
import { TransactionRecord } from '../types/index.ts';
import { 
  Globe2, 
  Clock, 
  Flame, 
  Info, 
  MapPin, 
  AlertCircle,
  TrendingUp,
  Filter
} from 'lucide-react';

interface RiskHeatmapProps {
  transactions: TransactionRecord[];
  onFilterLocation?: (country: string) => void;
}

interface CellData {
  country: string;
  hourBlock: string;
  hourIndex: number;
  totalCount: number;
  criticalCount: number;
  totalVolume: number;
  topFlags: string[];
}

const COUNTRIES = [
  { name: 'United States', code: 'US', baselineBias: [3, 4, 9, 12, 11, 6] },
  { name: 'Germany', code: 'DE', baselineBias: [1, 2, 7, 8, 5, 2] },
  { name: 'India', code: 'IN', baselineBias: [2, 5, 8, 10, 6, 3] },
  { name: 'Cyprus', code: 'CY', baselineBias: [9, 8, 4, 3, 2, 7] }, // High off-hours anomaly hub
  { name: 'Netherlands', code: 'NL', baselineBias: [8, 7, 3, 4, 3, 6] }, // VPN/Tor relay concentration
  { name: 'United Arab Emirates', code: 'AE', baselineBias: [4, 6, 8, 9, 7, 5] },
  { name: 'Romania', code: 'RO', baselineBias: [7, 6, 2, 3, 2, 5] },
  { name: 'United Kingdom', code: 'GB', baselineBias: [2, 3, 8, 9, 6, 3] },
];

const TIME_BLOCKS = [
  { label: '00:00 - 04:00', sub: 'Late Night / Off-Hours' },
  { label: '04:00 - 08:00', sub: 'Early Morning' },
  { label: '08:00 - 12:00', sub: 'Morning Open' },
  { label: '12:00 - 16:00', sub: 'Afternoon Peak' },
  { label: '16:00 - 20:00', sub: 'Evening Close' },
  { label: '20:00 - 24:00', sub: 'Night Settlement' },
];

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ transactions, onFilterLocation }) => {
  const [metric, setMetric] = useState<'CRITICAL' | 'TOTAL' | 'VOLUME'>('CRITICAL');
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);

  // Calculate live cell data combining transactions with realistic baseline patterns
  const matrixData = useMemo(() => {
    const data: CellData[][] = [];

    COUNTRIES.forEach((c) => {
      const row: CellData[] = [];

      TIME_BLOCKS.forEach((tb, blockIndex) => {
        // Find transactions matching this country and 4-hour window
        const matches = transactions.filter((t) => {
          const isCountryMatch =
            t.device.geoCountry.toLowerCase().includes(c.name.toLowerCase()) ||
            t.nameDest.toLowerCase().includes(c.name.toLowerCase());

          const txDate = new Date(t.timestamp);
          const hour = txDate.getHours();
          const matchesHour = hour >= blockIndex * 4 && hour < (blockIndex + 1) * 4;

          return isCountryMatch && matchesHour;
        });

        const liveCritical = matches.filter((t) => t.riskBand === 'CRITICAL').length;
        const liveTotal = matches.length;
        const liveVolume = matches.reduce((sum, t) => sum + t.amount, 0);

        // Baseline synthetic distribution
        const baseCritical = c.baselineBias[blockIndex];
        const baseTotal = baseCritical + Math.round(baseCritical * 0.6) + 1;
        const baseVolume = (baseTotal * 8500) + liveVolume;

        const allFlags: string[] = [];
        matches.forEach((t) => t.fraudFlags.forEach((f) => allFlags.push(f)));
        if (c.code === 'CY') allFlags.push('OFFSHORE_HIGH_RISK_JURISDICTION', 'MULE_CONDUIT');
        if (c.code === 'NL') allFlags.push('ANONYMIZED_VPN_OR_TOR_PROXY', 'CRYPTO_VASP_TRANSFER');
        if (c.code === 'US' && blockIndex === 0) allFlags.push('MULE_STRUCTURING_CTR_EVASION');

        const uniqueFlags = Array.from(new Set(allFlags)).slice(0, 3);

        row.push({
          country: c.name,
          hourBlock: tb.label,
          hourIndex: blockIndex,
          totalCount: baseTotal + liveTotal,
          criticalCount: baseCritical + liveCritical,
          totalVolume: baseVolume,
          topFlags: uniqueFlags,
        });
      });

      data.push(row);
    });

    return data;
  }, [transactions]);

  // Determine heatmap color level based on selected metric
  const getCellIntensity = (cell: CellData) => {
    let value = cell.criticalCount;
    if (metric === 'TOTAL') value = cell.totalCount;
    if (metric === 'VOLUME') value = Math.round(cell.totalVolume / 10000);

    if (value === 0) {
      return {
        bg: 'bg-slate-950/60',
        border: 'border-slate-800/40',
        text: 'text-slate-600',
        level: 0,
      };
    } else if (value <= 2) {
      return {
        bg: 'bg-indigo-950/40',
        border: 'border-indigo-900/40',
        text: 'text-indigo-300',
        level: 1,
      };
    } else if (value <= 5) {
      return {
        bg: 'bg-amber-950/50',
        border: 'border-amber-800/50',
        text: 'text-amber-300',
        level: 2,
      };
    } else if (value <= 8) {
      return {
        bg: 'bg-rose-950/70',
        border: 'border-rose-700/60',
        text: 'text-rose-300',
        level: 3,
      };
    } else {
      return {
        bg: 'bg-rose-900/90',
        border: 'border-rose-500/90',
        text: 'text-rose-100 font-bold shadow-sm',
        level: 4,
      };
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
      {/* Header and Metric Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-500" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Risk Heatmap: Corridor &amp; Diurnal Density
            </h3>
            <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.2 rounded">
              SPATIO-TEMPORAL RADAR
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Heatmap distribution of transaction anomalies mapped across global jurisdictions and hours of the day (UTC).
          </p>
        </div>

        {/* Metric Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setMetric('CRITICAL')}
            className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md transition-colors ${
              metric === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            CRITICAL ANOMALIES
          </button>
          <button
            onClick={() => setMetric('TOTAL')}
            className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md transition-colors ${
              metric === 'TOTAL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            ALL TRANSACTIONS
          </button>
          <button
            onClick={() => setMetric('VOLUME')}
            className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md transition-colors ${
              metric === 'VOLUME'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            USD VOLUME ($)
          </button>
        </div>
      </div>

      {/* Main Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Hour Block Columns Header */}
          <div className="grid grid-cols-7 gap-2 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            <div className="text-left pl-2">Jurisdiction</div>
            {TIME_BLOCKS.map((tb, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="font-mono text-slate-200">{tb.label}</span>
                <span className="block text-[9px] text-slate-500 font-normal">{tb.sub}</span>
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          <div className="space-y-2">
            {matrixData.map((row, rIdx) => {
              const countryInfo = COUNTRIES[rIdx];
              return (
                <div key={rIdx} className="grid grid-cols-7 gap-2 items-center">
                  {/* Country Title */}
                  <div className="flex items-center gap-1.5 pl-2 text-xs font-semibold text-slate-200 truncate">
                    <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                    <span className="truncate">{countryInfo.name}</span>
                  </div>

                  {/* 6 Heatmap Hour Cells */}
                  {row.map((cell, cIdx) => {
                    const intensity = getCellIntensity(cell);
                    const isSelected =
                      selectedCell?.country === cell.country &&
                      selectedCell?.hourBlock === cell.hourBlock;

                    let displayVal: string | number = cell.criticalCount;
                    if (metric === 'TOTAL') displayVal = cell.totalCount;
                    if (metric === 'VOLUME') displayVal = `$${Math.round(cell.totalVolume / 1000)}k`;

                    return (
                      <button
                        key={cIdx}
                        onClick={() => setSelectedCell(cell)}
                        className={`h-11 rounded-lg border text-xs font-mono font-semibold transition-all relative flex flex-col items-center justify-center cursor-pointer group ${
                          intensity.bg
                        } ${intensity.border} ${intensity.text} ${
                          isSelected ? 'ring-2 ring-indigo-400 scale-[1.02]' : 'hover:scale-[1.03]'
                        }`}
                        title={`${cell.country} · ${cell.hourBlock}: ${cell.criticalCount} Critical / ${cell.totalCount} Total`}
                      >
                        <span className="tabular-nums leading-none">{displayVal}</span>
                        {metric === 'CRITICAL' && cell.criticalCount >= 8 && (
                          <span className="text-[8px] uppercase tracking-tighter text-rose-300 font-bold opacity-80 pt-0.5">
                            SURGE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Heatmap Legend & Selected Cell Inspector */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
        {/* Scale Legend */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Density Scale:</span>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-slate-950 border border-slate-800 inline-block" />
              <span className="text-[10px]">0</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-indigo-950/60 border border-indigo-900 inline-block" />
              <span className="text-[10px]">1-2</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-amber-950/60 border border-amber-800 inline-block" />
              <span className="text-[10px]">3-5</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-rose-950/70 border border-rose-700 inline-block" />
              <span className="text-[10px]">6-8</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-rose-900 border border-rose-500 inline-block" />
              <span className="text-[10px] font-bold text-rose-400">9+ Surge</span>
            </span>
          </div>
        </div>

        {/* Selected Cell Detail Strip */}
        {selectedCell ? (
          <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 flex items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <span className="text-indigo-400">{selectedCell.country}</span>
                <span>·</span>
                <span className="font-mono text-slate-400">{selectedCell.hourBlock}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-3 font-mono">
                <span>Critical: <strong className="text-rose-400">{selectedCell.criticalCount}</strong></span>
                <span>Total: <strong className="text-slate-200">{selectedCell.totalCount}</strong></span>
                <span>Volume: <strong className="text-emerald-400">${selectedCell.totalVolume.toLocaleString()}</strong></span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1">
              {selectedCell.topFlags.map((flag, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                >
                  {flag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>

            <button
              onClick={() => setSelectedCell(null)}
              className="text-slate-500 hover:text-slate-300 text-xs px-1"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="h-3 w-3 text-slate-500" />
            <span>Click any heatmap cell to view corridor volume &amp; typology breakdown.</span>
          </div>
        )}
      </div>
    </div>
  );
};
