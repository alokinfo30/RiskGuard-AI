import React, { useState } from 'react';
import { REGULATORY_DATABASE, RegulatoryDocument } from '../data/regulatoryData.ts';
import { BookOpen, Search, Scale, FileText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const RegulatoryLibrary: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedDocId, setExpandedDocId] = useState<string | null>(REGULATORY_DATABASE[0].id);

  const filteredDocs = REGULATORY_DATABASE.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.code.toLowerCase().includes(search.toLowerCase()) ||
      doc.framework.toLowerCase().includes(search.toLowerCase()) ||
      doc.thresholdSummary.toLowerCase().includes(search.toLowerCase()) ||
      doc.jurisdiction.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === 'ALL') return true;
    return doc.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <span>Statutory Knowledge Base &amp; Regulatory Guidelines</span>
          </h2>
          <p className="text-xs text-slate-400">
            Authoritative financial compliance texts indexed for autonomous RAG retrieval and citation grounding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search statutes, thresholds, or jurisdiction..."
              className="rounded-lg bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Category Pills / Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Frameworks' },
          { id: 'AML_CFT', label: 'AML / CFT & SAR' },
          { id: 'REPORTING_THRESHOLDS', label: 'Statutory Thresholds (CTR / ₹10L)' },
          { id: 'SANCTIONS_PEP', label: 'Sanctions & PEP' },
          { id: 'GOVERNANCE_AI', label: 'EU AI Act & Human Oversight' },
          { id: 'FRAUD_CRIME', label: 'Securities & Market Fraud' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document Catalog Accordion */}
      <div className="space-y-4">
        {filteredDocs.map((doc) => {
          const isExpanded = expandedDocId === doc.id;
          return (
            <div
              key={doc.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all"
            >
              {/* Header Banner */}
              <div
                onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-indigo-400 font-semibold">{doc.code}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{doc.jurisdiction}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{doc.framework}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{doc.title}</h3>
                  <div className="text-xs text-amber-400/90 font-mono">
                    Threshold: {doc.thresholdSummary}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono hidden sm:inline">{doc.section}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-800 p-5 bg-slate-950/40 space-y-4 text-xs">
                  {/* Key Directives */}
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-2 uppercase text-[11px] tracking-wider">
                      Key Compliance Directives &amp; Obligations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {doc.keyDirectives.map((dir, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60 text-slate-300 leading-relaxed">
                          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{dir}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statutory Full Text Excerpt */}
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-2 uppercase text-[11px] tracking-wider">
                      Statutory Text Excerpt (RAG Grounding Truth)
                    </h4>
                    <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap border border-slate-800/80">
                      {doc.fullTextExcerpt}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
