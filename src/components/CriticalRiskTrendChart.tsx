import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { TransactionRecord } from '../types/index.ts';
import { Activity, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

interface CriticalRiskTrendChartProps {
  transactions: TransactionRecord[];
}

export const CriticalRiskTrendChart: React.FC<CriticalRiskTrendChartProps> = ({ transactions }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '12h' | '6h'>('24h');

  // Compute realistic 24-hour hourly trend incorporating live transactions + synthetic baseline distribution
  const chartData = useMemo(() => {
    const hoursCount = timeRange === '24h' ? 24 : timeRange === '12h' ? 12 : 6;
    const now = new Date();
    const dataPoints = [];

    // Pre-calculated hourly baseline representing synthetic Kaggle PaySim 24-hour cycle
    // (with an off-hours smurfing spike between 02:00 and 05:00 UTC, and midday business velocity)
    const baseCurve = [
      2, 3, 7, 9, 8, 4, 3, 2, 4, 6, 8, 7, 
      9, 6, 5, 8, 11, 14, 10, 8, 5, 4, 3, 5
    ];

    for (let i = hoursCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      const hourIndex = (d.getHours()) % 24;
      const baseCritical = baseCurve[hourIndex];
      const baseHigh = Math.max(1, Math.round(baseCritical * 0.75 + (hourIndex % 3)));

      // Count transactions in this current hour slot
      const liveMatches = transactions.filter(t => {
        const txTime = new Date(t.timestamp);
        const diffHours = (now.getTime() - txTime.getTime()) / (1000 * 60 * 60);
        return diffHours >= i - 0.5 && diffHours < i + 0.5;
      });

      const liveCritical = liveMatches.filter(t => t.riskBand === 'CRITICAL').length;
      const liveHigh = liveMatches.filter(t => t.riskBand === 'HIGH').length;

      dataPoints.push({
        time: hourStr,
        fullTime: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        critical: baseCritical + liveCritical,
        high: baseHigh + liveHigh,
        threshold: 8, // Statutory surveillance surge alert threshold
      });
    }

    return dataPoints;
  }, [transactions, timeRange]);

  const peakPoint = useMemo(() => {
    return chartData.reduce((max, p) => (p.critical > max.critical ? p : max), chartData[0]);
  }, [chartData]);

  const total24hCritical = useMemo(() => {
    return chartData.reduce((sum, p) => sum + p.critical, 0);
  }, [chartData]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
      {/* Chart Top Header & Time Interval Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-rose-500" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Critical Risk Velocity Trend (Last 24 Hours)
            </h3>
            <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 rounded">
              ANOMALY SURVEILLANCE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time frequency of transactions scoring $\ge 80$ risk points (mule drains, CTR evasion, &amp; ATO spikes)
          </p>
        </div>

        {/* Segmented Time Range Control */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          {(['6h', '12h', '24h'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md transition-colors ${
                timeRange === r
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-medium">Aggregated Critical Volume</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono tabular-nums text-rose-400">{total24hCritical}</span>
            <span className="text-[10px] text-slate-500">events / {timeRange}</span>
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-medium">Peak Anomaly Surge Hour</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono tabular-nums text-amber-400">{peakPoint?.time || '--:--'}</span>
            <span className="text-[10px] text-rose-400 font-mono font-semibold">({peakPoint?.critical} hits)</span>
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-medium">Surge Alert Baseline</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-300">8.0</span>
            <span className="text-[10px] text-slate-500">ev / hr threshold</span>
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-medium">Active Alert State</span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-semibold text-rose-300">Elevated Off-Hours Activity</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Line Visual */}
      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              domain={[0, 'dataMax + 4']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-slate-700 bg-slate-950/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] pb-1 border-b border-slate-800">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{data.fullTime}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          <span>Critical Risk (Score &gt; 80):</span>
                        </span>
                        <span className="font-mono font-bold text-slate-100 tabular-nums">{data.critical}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-orange-400 font-medium">
                          <span className="h-2 w-2 rounded-full bg-orange-400" />
                          <span>High Risk (Score 60-79):</span>
                        </span>
                        <span className="font-mono font-bold text-slate-100 tabular-nums">{data.high}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                        <span>Surge Alert Limit:</span>
                        <span className="font-mono text-slate-400">8 / hr</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Surge Threshold Reference Line */}
            <ReferenceLine 
              y={8} 
              stroke="#f59e0b" 
              strokeDasharray="4 4" 
              label={{ value: 'SURGE THRESHOLD (8/hr)', fill: '#f59e0b', fontSize: 9, position: 'insideTopRight' }} 
            />

            {/* Critical Line (Rose / Crimson) */}
            <Line 
              type="monotone" 
              dataKey="critical" 
              name="Critical Risk"
              stroke="#f43f5e" 
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#f43f5e', stroke: '#881337', strokeWidth: 1 }}
              activeDot={{ r: 5, fill: '#fff', stroke: '#f43f5e', strokeWidth: 2 }}
            />

            {/* High Line (Orange) */}
            <Line 
              type="monotone" 
              dataKey="high" 
              name="High Risk"
              stroke="#fb923c" 
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              activeDot={{ r: 4, fill: '#fb923c' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
