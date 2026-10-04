import React, { useState, useEffect } from 'react';
import { TransactionRecord } from '../types/index.ts';
import { 
  X, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Printer
} from 'lucide-react';

interface SarDraftingDrawerProps {
  transaction: TransactionRecord | null;
  investigatorNotes: string;
  onClose: () => void;
  onMarkFiled: (txId: string, narrative: string) => void;
}

export const SarDraftingDrawer: React.FC<SarDraftingDrawerProps> = ({
  transaction,
  investigatorNotes,
  onClose,
  onMarkFiled,
}) => {
  if (!transaction) return null;

  const [narrative, setNarrative] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [metadata, setMetadata] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchDraft = async () => {
      setIsGenerating(true);
      setErrorMsg('');
      try {
        const res = await fetch('/api/regulatory/draft-sar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction,
            investigatorNotes,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to generate SAR narrative from regulatory engine');
        }

        const data = await res.json();
        if (isMounted) {
          setNarrative(data.sarNarrative || '');
          setMetadata(data.filingMetadata || null);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Error formulating report narrative');
        }
      } finally {
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    };

    fetchDraft();
    return () => {
      isMounted = false;
    };
  }, [transaction, investigatorNotes]);

  const handleCopy = () => {
    navigator.clipboard.writeText(narrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([narrative], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `SAR_PartV_${transaction.id}_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">
                  FinCEN Suspicious Activity Report (SAR) — Part V Drafter
                </h2>
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                  31 CFR § 1020.320
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Case File: <span className="font-mono text-slate-300">{transaction.id}</span> · Amount: <span className="font-mono text-slate-200">{transaction.currency} {transaction.amount.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={isGenerating || !narrative}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating || !narrative}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Statutory Filing Advice Callout */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
            <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-amber-300">
                Statutory Filing Deadline: 30 Calendar Days from Detection
              </span>
              <p className="text-slate-400 leading-relaxed">
                Pursuant to 31 U.S.C. 5318(g)(2), all financial institution employees are strictly prohibited from disclosing to the subject or any third party that a SAR has been prepared or submitted.
              </p>
            </div>
          </div>

          {/* Narrative Editor / Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Official Part V Narrative Text (Review &amp; Edit Before Filing)</span>
              {isGenerating && (
                <span className="flex items-center gap-1.5 text-indigo-400 text-xs">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  Generating narrative with Gemini 3.8 Flash...
                </span>
              )}
            </div>

            {isGenerating ? (
              <div className="h-96 rounded-xl border border-slate-800 bg-slate-950 p-6 flex flex-col items-center justify-center space-y-3">
                <Sparkles className="h-8 w-8 text-indigo-400 animate-pulse" />
                <p className="text-xs text-slate-300 font-medium">Formulating FinCEN Part V Compliance Narrative...</p>
                <p className="text-[11px] text-slate-500 max-w-sm text-center">
                  Grounded on 31 CFR § 1020.320, transaction chronologies, PaySim balance drain metrics, and IP routing exhibits.
                </p>
              </div>
            ) : errorMsg ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                {errorMsg}
              </div>
            ) : (
              <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                rows={16}
                className="w-full rounded-xl bg-slate-950 p-4 text-xs leading-relaxed font-mono text-slate-200 border border-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="text-[11px] text-slate-500">
            Form Part V · Audit Log Entry will be appended with cryptographic timestamp.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onMarkFiled(transaction.id, narrative);
                onClose();
              }}
              disabled={isGenerating || !narrative}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Sign Off &amp; Mark SAR As Filed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
