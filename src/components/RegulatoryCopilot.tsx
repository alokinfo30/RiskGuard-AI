import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Scale, 
  HelpCircle,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { ChatMessage } from '../types/index.ts';

export const RegulatoryCopilot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'copilot',
      text: `Hello, I am your **Regulatory Intelligence Copilot**. I provide compliance guidance grounded directly in statutory frameworks including FinCEN / Bank Secrecy Act (31 CFR Chapter X), FATF 40 Recommendations, PMLA 2002 (India / FIU-IND), SEC Rule 17a-8, and the EU AI Act.

How can I assist your compliance investigation today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidenceScore: 98,
      citations: [
        {
          id: 'fincen-sar-1020-320',
          framework: 'FinCEN / Bank Secrecy Act',
          code: '31 CFR § 1020.320',
          title: 'Reports by Banks of Suspicious Transactions (SAR Filing Requirement)',
          section: 'Section 1020.320(a)(2)',
          threshold: '$5,000+ known suspect; $25,000+ unknown suspect',
          excerpt: 'Every bank shall file with FinCEN a report of any suspicious transaction relevant to a possible violation of law or regulation.'
        }
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [strictAntiHallucination, setStrictAntiHallucination] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeCitationModal, setActiveCitationModal] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    "What are the reporting requirements for suspicious transactions over ₹10 Lakhs under PMLA vs $10,000 CTR?",
    "What triggers a mandatory FinCEN Suspicious Activity Report (SAR) within 30 calendar days?",
    "What constitutes structured smurfing to evade CTR thresholds under 31 U.S.C. § 5324?",
    "How does the FATF Recommendation 16 Travel Rule apply to crypto and virtual asset transfers?",
    "What are the GDPR Article 22 human-in-the-loop requirements when automated AI flags fraud?"
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/regulatory/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          category: selectedCategory,
          strictCitations: strictAntiHallucination,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to query regulatory intelligence service');
      }

      const data = await res.json();

      const copilotMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'copilot',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations,
        confidenceScore: data.confidenceScore,
      };

      setMessages((prev) => [...prev, copilotMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'copilot',
          text: `**Advisory Processing Error**: Unable to complete statutory retrieval. (${err.message}). Please ensure server is running.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8.5rem)]">
      {/* Left Chat Window */}
      <div className="flex-1 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
        {/* Top Header of Chat */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span>Regulatory Guard RAG Engine</span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  GEMINI 3.8 FLASH
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Grounding against FinCEN, FATF, PMLA, SEC &amp; EU AI Act provisions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Anti-Hallucination Toggle */}
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={strictAntiHallucination}
                onChange={(e) => setStrictAntiHallucination(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span className="text-[11px] font-medium hidden sm:inline">Strict Citation Grounding</span>
            </label>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => {
            const isCopilot = msg.sender === 'copilot';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isCopilot ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1 px-1">
                  <span>{isCopilot ? 'RiskGuard Copilot' : 'Investigator'}</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                  {msg.confidenceScore && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-400 font-mono">
                        {msg.confidenceScore}% Grounded
                      </span>
                    </>
                  )}
                </div>

                <div
                  className={`max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isCopilot
                      ? 'border border-slate-800 bg-slate-950/80 text-slate-200'
                      : 'bg-indigo-600 text-white font-medium'
                  }`}
                >
                  <div className="whitespace-pre-line space-y-2">
                    {msg.text}
                  </div>

                  {/* Grounded Citation Chips */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                        <FileCheck2 className="h-3 w-3 text-indigo-400" />
                        <span>Verified Statutory Authorities</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.citations.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveCitationModal(c)}
                            className="text-left text-[11px] rounded border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 text-indigo-300 hover:bg-indigo-500/20 transition-colors flex items-center gap-1"
                          >
                            <Scale className="h-3 w-3 text-indigo-400 shrink-0" />
                            <span className="font-semibold">{c.code}</span>
                            <span className="text-slate-400">· {c.section}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Retrieving statutory excerpts &amp; formulating compliance advisory...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="border-t border-slate-800/80 bg-slate-950/40 p-2.5 overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap text-[11px]">
            <span className="text-slate-500 font-semibold flex items-center gap-1 pl-1">
              <HelpCircle className="h-3 w-3" />
              <span>Inquiries:</span>
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:border-indigo-500/40 hover:text-white transition-colors"
              >
                {qp.length > 55 ? `${qp.slice(0, 52)}...` : qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask compliance questions (e.g., 'What are CTR thresholds for ₹10 Lakhs vs $10,000?')..."
              className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <span>Query Copilot</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Drawer: Live Legal Grounding Inspector */}
      <div className="w-full lg:w-96 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200">Legal Citation Grounding</h3>
          </div>
          <span className="text-[10px] text-slate-400">RAG Context Explorer</span>
        </div>

        {activeCitationModal ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-3 space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
                {activeCitationModal.framework}
              </span>
              <h4 className="text-xs font-bold text-slate-100">{activeCitationModal.title}</h4>
              <p className="text-[11px] font-mono text-indigo-300">
                {activeCitationModal.code} · {activeCitationModal.section}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Statutory Threshold
              </span>
              <p className="text-xs text-slate-200">{activeCitationModal.threshold}</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Direct Legal Excerpt
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono bg-slate-900/80 p-2 rounded border border-slate-800">
                "{activeCitationModal.excerpt}"
              </p>
            </div>

            <button
              onClick={() => setActiveCitationModal(null)}
              className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 pt-2"
            >
              Reset to Framework Overview
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <p className="text-slate-400">
              Select any citation chip in the response to inspect verified legal statute excerpts, filing deadlines, and mandatory reporting rules.
            </p>

            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2">
              <div className="font-semibold text-slate-200">Active RAG Grounding Vectors</div>
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>FinCEN 31 CFR § 1020.320</strong>: Mandatory SAR 30-day clock &amp; $5,000 threshold.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>31 U.S.C. § 5324</strong>: Anti-structuring felony provisions for amounts &lt; $10k.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>PMLA 2002 Rule 3(1)(A)</strong>: Cash transaction reporting for ₹10 Lakhs &amp; 7-day STR rule.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>FATF Recommendation 16</strong>: Cross-border wire &amp; crypto VASP Travel Rule ($1,000).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>GDPR Art. 22 &amp; EU AI Act</strong>: Human-in-the-loop override mandate for automated decisions.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
