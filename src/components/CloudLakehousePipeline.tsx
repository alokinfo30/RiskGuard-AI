import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Radio, 
  Layers, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Cloud, 
  Cpu, 
  Key, 
  ShieldCheck, 
  Server, 
  FileCode, 
  RefreshCw,
  Terminal,
  Download,
  Share2
} from 'lucide-react';
import { StreamingPipelineStatus, FinCENFilingValidation } from '../types/index.ts';

const SAMPLE_SQL_QUERIES = [
  {
    name: 'Risk Band Aggregation & Volume',
    sql: `SELECT 
  risk_band, 
  COUNT(1) as total_tx_count, 
  ROUND(AVG(risk_score), 1) as avg_risk_score,
  FORMAT("%'d", CAST(SUM(amount) AS INT64)) as volume_usd
FROM \`bfsi_lakehouse.raw_transactions_partitioned\`
WHERE _PARTITIONDATE = CURRENT_DATE()
GROUP BY 1
ORDER BY avg_risk_score DESC;`,
  },
  {
    name: 'Top Structuring Candidates (<$10k CTR Evasion)',
    sql: `SELECT 
  transaction_id,
  originator_name,
  amount,
  risk_score,
  device_ip
FROM \`bfsi_lakehouse.raw_transactions_partitioned\`
WHERE amount BETWEEN 9000 AND 9999
  AND is_vpn_tor = TRUE
ORDER BY risk_score DESC
LIMIT 10;`,
  },
  {
    name: 'Hourly Stream Ingestion Velocity',
    sql: `SELECT 
  TIMESTAMP_TRUNC(event_timestamp, HOUR) as event_hour,
  COUNT(*) as transactions_per_hour,
  COUNTIF(risk_band = 'CRITICAL') as critical_anomalies
FROM \`bfsi_lakehouse.raw_transactions_partitioned\`
GROUP BY 1
ORDER BY 1 DESC;`,
  },
];

export const CloudLakehousePipeline: React.FC = () => {
  const [pipelineStats, setPipelineStats] = useState<StreamingPipelineStatus | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<string>(SAMPLE_SQL_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [isExecutingQuery, setIsExecutingQuery] = useState<boolean>(false);
  const [isPublishingEvent, setIsPublishingEvent] = useState<boolean>(false);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);
  const [fincenValidation, setFincenValidation] = useState<FinCENFilingValidation | null>(null);
  const [isValidatingFincen, setIsValidatingFincen] = useState<boolean>(false);

  const fetchPipelineStats = async () => {
    try {
      const res = await fetch('/api/streaming/pubsub/status');
      if (res.ok) {
        const data = await res.json();
        setPipelineStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch pipeline stats', e);
    }
  };

  useEffect(() => {
    fetchPipelineStats();
    const interval = setInterval(fetchPipelineStats, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRunQuery = async () => {
    setIsExecutingQuery(true);
    try {
      const res = await fetch('/api/streaming/bigquery/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: selectedQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        setQueryResult(data);
      }
    } catch (e) {
      console.error('BigQuery query error', e);
    } finally {
      setIsExecutingQuery(false);
    }
  };

  const handlePublishTestEvent = async () => {
    setIsPublishingEvent(true);
    setPublishFeedback(null);
    try {
      const res = await fetch('/api/streaming/pubsub/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventPayload: {
            source: 'CLOUD_PUBSUB_CONSOLE_SIMULATOR',
            injectedAt: new Date().toISOString(),
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPublishFeedback(`Published message ${data.eventId} acknowledged by subscriber (offset #${data.streamingBufferOffset}).`);
        fetchPipelineStats();
      }
    } catch (e) {
      console.error('Publish error', e);
    } finally {
      setIsPublishingEvent(false);
    }
  };

  const handleValidateFinCenFiling = async () => {
    setIsValidatingFincen(true);
    try {
      const res = await fetch('/api/regulatory/validate-sar-filing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: 'TX-7802-PS',
          narrative: 'Chronological review under 31 CFR § 1020.320 and 31 U.S.C. 5318(g). Originator executed structured pass-through transfer of $9,850 to Crypto Escrow beneficiary account within 48 hours of onboarding, depleting 96% of available liquid reserves. IP trace confirmed high-anonymity proxy usage in Bucharest. Customer contact alert dispatched with zero biometric confirmation.',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFincenValidation(data);
      }
    } catch (e) {
      console.error('FinCEN validation error', e);
    } finally {
      setIsValidatingFincen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-md">
                <Cloud className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Google Cloud Lakehouse &amp; Streaming Ingestion Pipeline
              </h2>
              <span className="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
                Pub/Sub + BigQuery + Vertex AI + Cloud KMS
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Real-time enterprise streaming architecture replicating Google Cloud Platform telemetry: Pub/Sub event ingestion bus, Dataflow stream processing, partitioned BigQuery analytics lakehouse, and automated FinCEN BSA compliance validation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePublishTestEvent}
              disabled={isPublishingEvent}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/60 px-3.5 py-2 text-xs font-semibold text-cyan-200 transition-colors"
            >
              <Radio className={`h-4 w-4 text-cyan-400 ${isPublishingEvent ? 'animate-pulse' : ''}`} />
              <span>{isPublishingEvent ? 'Publishing...' : 'Publish Pub/Sub Event'}</span>
            </button>

            <button
              onClick={fetchPipelineStats}
              className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white transition-colors"
              title="Refresh Pipeline Telemetry"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {publishFeedback && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{publishFeedback}</span>
        </div>
      )}

      {/* KPI Cards: Pub/Sub & BigQuery Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pub/Sub Topic Ingestion</span>
            <Radio className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {pipelineStats?.pubsub.publishedEventsCount?.toLocaleString() || '1,482'}
            </span>
            <span className="text-xs text-slate-400">events</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-mono truncate">
            {pipelineStats?.pubsub.topic || 'projects/bfsi-riskguard/topics/transactions-stream'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Streaming Ingestion Rate</span>
            <Cpu className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {pipelineStats?.pubsub.messagesPerSecond || 52.4}
            </span>
            <span className="text-xs text-slate-400">msgs / sec</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Subscriber lag: <span className="font-mono text-slate-300">{pipelineStats?.pubsub.subscriberLag || 8} msgs</span> | DLQ: 0
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>BigQuery Lakehouse Rows</span>
            <Database className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-300">
              {pipelineStats?.bigquery.totalRowsIngested?.toLocaleString() || '148,200'}
            </span>
            <span className="text-xs text-slate-400">records</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-mono truncate">
            {pipelineStats?.bigquery.table || 'bfsi_lakehouse.raw_transactions_partitioned'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Streaming Buffer Size</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-300">
              {((pipelineStats?.bigquery.streamingBufferBytes || 19240000) / (1024 * 1024)).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">MB (In-Memory Buffer)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Partition: <span className="font-mono text-slate-300">{pipelineStats?.bigquery.lastPartitionDate || 'DAY'}</span> (Clustered on Risk Band)
          </p>
        </div>
      </div>

      {/* Google Cloud Architecture Topology Diagram */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Server className="h-4 w-4 text-cyan-400" />
            End-to-End Enterprise Cloud Architecture
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Production Blueprint (SOC2 / PCI-DSS / BSA)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 space-y-1">
            <span className="text-[10px] font-mono font-bold text-cyan-400 block uppercase">1. Ingestion Bus</span>
            <div className="font-bold text-slate-100">Cloud Pub/Sub</div>
            <p className="text-[11px] text-slate-400">Event-driven streaming bus distributing transaction ticks with dead-letter queue resilience.</p>
          </div>

          <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-950/20 space-y-1">
            <span className="text-[10px] font-mono font-bold text-blue-400 block uppercase">2. Stream Analytics</span>
            <div className="font-bold text-slate-100">Cloud Dataflow</div>
            <p className="text-[11px] text-slate-400">Apache Beam pipeline computing rolling 1-hour velocity, geo-hopping, and balance drain ratios.</p>
          </div>

          <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-950/20 space-y-1">
            <span className="text-[10px] font-mono font-bold text-indigo-400 block uppercase">3. Data Lakehouse</span>
            <div className="font-bold text-slate-100">BigQuery</div>
            <p className="text-[11px] text-slate-400">Day-partitioned storage for fraud analytics, 5-year BSA retention, and model retraining.</p>
          </div>

          <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-950/20 space-y-1">
            <span className="text-[10px] font-mono font-bold text-purple-400 block uppercase">4. AI Intelligence</span>
            <div className="font-bold text-slate-100">Vertex AI &amp; Gemini</div>
            <p className="text-[11px] text-slate-400">Gemini 3.8 Flash for RAG statutory advisory, FinCEN Part V narrative drafting, and risk scoring.</p>
          </div>

          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-400 block uppercase">5. Multilingual Forensics</span>
            <div className="font-bold text-slate-100">Document AI</div>
            <p className="text-[11px] text-slate-400">OCR entity extraction and automated translation of foreign trade documents into English.</p>
          </div>

          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-950/20 space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-400 block uppercase">6. Immutable Audit</span>
            <div className="font-bold text-slate-100">Cloud KMS &amp; Ledger</div>
            <p className="text-[11px] text-slate-400">SHA-256 cryptographic chaining with KMS signing ensuring non-repudiation for regulatory examiners.</p>
          </div>
        </div>
      </div>

      {/* Interactive BigQuery SQL Query Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-indigo-400" />
                BigQuery SQL Query Console
              </label>
              <span className="text-[10px] font-mono text-slate-500">Live Partitioned Engine</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {SAMPLE_SQL_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedQuery(q.sql)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                    selectedQuery === q.sql
                      ? 'border-indigo-500 bg-indigo-950/70 text-indigo-200'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {q.name}
                </button>
              ))}
            </div>

            <textarea
              value={selectedQuery}
              onChange={(e) => setSelectedQuery(e.target.value)}
              rows={8}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs font-mono text-cyan-300 focus:border-indigo-500 focus:outline-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Estimated scan: <span className="font-mono text-slate-400">~20.0 MB</span> (Partition Pruned)
              </span>

              <button
                onClick={handleRunQuery}
                disabled={isExecutingQuery}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
              >
                <Play className={`h-3.5 w-3.5 ${isExecutingQuery ? 'animate-spin' : ''}`} />
                <span>{isExecutingQuery ? 'Running Query...' : 'Run Query'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Query Output Table */}
        <div className="lg:col-span-6 space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Query Results
              </label>
              {queryResult && (
                <span className="text-[10px] font-mono text-emerald-400">
                  {queryResult.executionTimeMs} ms | {queryResult.bytesScannedFormatted}
                </span>
              )}
            </div>

            <div className="overflow-x-auto min-h-[200px] rounded-lg border border-slate-800/80 bg-slate-950">
              {queryResult && queryResult.rows ? (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px]">
                      {Object.keys(queryResult.rows[0] || {}).map((col) => (
                        <th key={col} className="p-2.5">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {queryResult.rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-900/40">
                        {Object.values(row).map((val: any, cIdx: number) => (
                          <td key={cIdx} className="p-2.5 text-slate-200">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-center text-slate-600 space-y-2">
                  <Database className="h-7 w-7 text-slate-700" />
                  <p className="text-xs">Click &ldquo;Run Query&rdquo; to execute SQL on BigQuery lakehouse.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FinCEN BSA Electronic Filing Conformance Checker */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              FinCEN BSA Electronic Filing Specification Conformance (31 CFR § 1020.320)
            </h3>
            <p className="text-xs text-indigo-300/80 mt-0.5">
              Automated audit validation checking Form 111 XML/JSON schema compliance, subject identification, Part V narrative length, and cryptographic non-repudiation.
            </p>
          </div>

          <button
            onClick={handleValidateFinCenFiling}
            disabled={isValidatingFincen}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white whitespace-nowrap transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isValidatingFincen ? 'Validating...' : 'Validate Compliance Readiness'}</span>
          </button>
        </div>

        {fincenValidation && (
          <div className="space-y-3 pt-2 border-t border-indigo-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  fincenValidation.isValid ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {fincenValidation.readinessScore}%
                </span>
                <span className="text-xs font-bold text-slate-100">
                  {fincenValidation.isValid ? '✓ Full FinCEN Electronic Filing Readiness Achieved' : 'Pending Mandatory Regulatory Checks'}
                </span>
              </div>
              <span className="text-xs font-mono text-indigo-300">
                Batch Sequence: {fincenValidation.bsnBatchId}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {fincenValidation.passedChecks.map((check, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-emerald-900/40 text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{check}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
