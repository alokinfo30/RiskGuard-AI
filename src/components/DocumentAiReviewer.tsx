import React, { useState } from 'react';
import { 
  FileSearch, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Building2, 
  DollarSign, 
  Calendar, 
  FileSpreadsheet, 
  Hash, 
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  Download,
  Copy,
  Check,
  Languages,
  Globe2,
  RefreshCw,
  Scale,
  Split,
  BookOpen
} from 'lucide-react';
import { TransactionRecord, DocumentAiAnalysis, DocumentTranslationResult } from '../types/index.ts';

interface DocumentAiReviewerProps {
  transactions: TransactionRecord[];
  onDraftSarWithExhibit?: (tx: TransactionRecord, exhibitNarrative: string) => void;
}

const DOCUMENT_PRESETS = [
  {
    id: 'preset-spanish-invoice',
    name: '🇪🇸 Factura de Flete Marítimo FAC-2026-0941 (Spanish)',
    langLabel: 'Spanish (es)',
    flag: '🇪🇸',
    type: 'INVOICE' as const,
    description: 'Commercial invoice in Spanish billing €9,800. Structured just under €10,000 threshold with cross-border maritime carriage to Colombia.',
    sampleText: `FACTURA COMERCIAL DE FLETE MARÍTIMO
Número de Factura: FAC-2026-0941
Fecha de Emisión: 08 de Octubre de 2026
Emisor / Proveedor: Trans-Atlantic Naviera Marítima S.L.
Número de Identificación Fiscal (NIF / CIF): ES-B84992104
Domicilio Social: Calle Alcalá 124, 28009 Madrid, España
Cuenta Bancaria IBAN: ES91 2100 0418 4502 0005 1234
Código BIC / SWIFT: CAIXESBB

DATOS DEL RECEPTOR / CLIENTE:
Razón Social: Andina Importaciones & Distribución S.A.
NIT / Identificación Tributaria: 900.812.341-2
Dirección: Carrera 7 #72-13, Bogotá D.C., Colombia

DESCRIPCIÓN DE SERVICIOS Y FLETES:
1. Transporte marítimo en contenedor refrigerado 40' (Contenedor #TCNU-8921) de Valencia a Cartagena.
   Cantidad: 1 | Tarifa Unitaria: EUR €7.800,00 | Importe: EUR €7.800,00
2. Despacho aduanero portuario, aranceles y tasa de seguridad portuaria.
   Cantidad: 1 | Tarifa Unitaria: EUR €2.000,00 | Importe: EUR €2.000,00

BASE IMPONIBLE: EUR €9.800,00
IVA Aplicable (0% Exención por exportación Art. 21 LIVA): EUR €0,00
TOTAL A PAGAR: EUR €9.800,00 (Aprox. USD $10.650,00)

Condiciones de Pago: Transferencia bancaria directa en un plazo improrrogable de 15 días naturales.
Firma Autorizada: Carlos Mendoza Vega (Director de Operaciones Logísticas)`,
  },
  {
    id: 'preset-german-equipment',
    name: '🇩🇪 Proforma-Rechnung Industrieanlagen PRO-DE-88319 (German)',
    langLabel: 'German (de)',
    flag: '🇩🇪',
    type: 'INVOICE' as const,
    description: 'German pro-forma invoice for high-spec CNC machinery exported to a UAE free-zone entity, triggering dual-use export control checks.',
    sampleText: `PROFORMA-RECHNUNG FÜR INDUSTRIEANLAGEN
Rechnungsnummer: PRO-DE-88319
Ausstellungsdatum: 04. Oktober 2026
Lieferant / Hersteller: Norddeutsche Präzision Maschinenbau GmbH
Handelsregister: HRB 109283 Amtsgericht Hamburg
Umsatzsteuer-Identifikationsnummer (USt-IdNr.): DE 814920199
Anschrift: Industriestraße 45, 20457 Hamburg, Deutschland
Bankverbindung: Deutsche Bank AG Hamburg
IBAN: DE89 2007 0000 0192 8374 00 | BIC: DEUTDEDBHAM

EMPFÄNGER / BESTELLER:
Firma: Gulf Apex Heavy Industrial Equipment FZE
Adresse: Jebel Ali Free Zone, P.O. Box 18204, Dubai, VAE
Steuernummer / TRN: 100293810200003

WARENBESCHREIBUNG & SPEZIFIKATION:
1. CNC-5-Achsen Präzisions-Fräsmodul NX-500 (Industrielle Serienausführung)
   Menge: 1 Stück | Einzelpreis: EUR €45.000,00 | Gesamt: EUR €45.000,00
2. Hochdruck-Hydraulikventilsystem und technische Dokumentation
   Menge: 1 Satz | Einzelpreis: EUR €9.500,00 | Gesamt: EUR €9.500,00

GESAMTBETRAG REIN NETTO: EUR €54.500,00 (Aprox. USD $59.200,00)
Umsatzsteuer: Steuerfreie Ausfuhrlieferung gemäß § 4 Nr. 1a UStG
Zahlungsbedingung: 100% Vorkasse per SWIFT-Überweisung vor Verladung im Hamburger Hafen.
Zeichnungsberechtigter: Dr. Klaus Jürgen Weber (Geschäftsführer)`,
  },
  {
    id: 'preset-chinese-bol',
    name: '🇨🇳 国际海运提单及商业发票 SH-OC-2026-9901 (Chinese)',
    langLabel: 'Mandarin Chinese (zh-CN)',
    flag: '🇨🇳',
    type: 'CUSTOMS_REMITTANCE' as const,
    description: 'Maritime Bill of Lading & export invoice in Mandarin Chinese from Shanghai to Panama. Under-invoicing flags trade-based money laundering.',
    sampleText: `国际海运提单及商业出口发票 (BILL OF LADING & COMMERCIAL INVOICE)
单证编号 / 发票号: SH-OC-2026-9901
签发日期: 2026年10月02日
发货人 / 出口方 (SHIPPER):
上海东海航运物流有限公司 (Shanghai Eastern Maritime Logistics Co., Ltd.)
统一社会信用代码 (税号): 9131000078923412X8
注册地址: 中国上海市浦东新区张江高科技园区世纪大道888号
开户银行: 交通银行上海浦东分行 | 银行账号: 3100 6620 9012 3456

收货人 / 境外提单受让人 (CONSIGNEE):
太平洋海外贸易集团 (Pacific Rim Overseas Trading Corp)
地址: 99 Balboa Avenue, Panama City, Republic of Panama

装货港口: 中国上海港 (Port of Shanghai)
卸货港口: 巴拿马巴尔博亚港 (Port of Balboa, Panama)

货物明细与申报价值:
1. 高性能微处理器机柜及配套工业网络路由器 (40尺高柜集装箱 #COSCO-99218)
   申报数量: 1 批 (共计 450 件)
   海关申报单价: USD $32.88
   申报总金额: USD $14,800.00 (实际市场预估公允价值: USD $95,000.00)

特别结算条款:
本笔海运及货物结算款项已指定通过欧洲离岸中转托管账户 (Bucharest / Escrow Hub) 结算。
提单签发代理人: 张伟 (海运业务总监)`,
  },
  {
    id: 'preset-french-consulting',
    name: '🇫🇷 Facture de Prestation de Conseil FAC-FR-4410 (French)',
    langLabel: 'French (fr)',
    flag: '🇫🇷',
    type: 'INVOICE' as const,
    description: 'Consulting invoice in French billing €46,000 for vague restructuring advisory services to a Swiss holding company.',
    sampleText: `FACTURE DE PRESTATION DE CONSEIL STRATÉGIQUE
Facture N°: FAC-FR-2026-4410
Date d'Émission: 06 Octobre 2026
Prestataire / Émetteur: Étoile Conseil Stratégique SAS
Capital Social: 10 000 EUR | RCS Paris B 892 341 092
Numéro de TVA Intracommunautaire: FR 42 892341092
Adresse: 18 Avenue Montaigne, 75008 Paris, France
Coordonnées Bancaires (IBAN): FR76 3000 4001 2300 0123 4567 890 | Code BIC: BNPAFRPP

CLIENT FACTURÉ:
Société: Helvetic Asset Holdings SA
Numéro Fédéral UID: CHE-402.198.812
Adresse: Rue du Rhône 42, 1204 Genève, Suisse

DÉTAIL DES PRESTATIONS INTELLECTUELLES:
1. Analyse stratégique d'optimisation de flux transfrontaliers et restructuration d'actifs passifs.
   Montant Hors Taxes: EUR €32.000,00
2. Due diligence et mise en conformité fiduciaire pour entités disregarded offshore.
   Montant Hors Taxes: EUR €14.000,00

MONTANT TOTAL H.T.: EUR €46.000,00
TVA (Autoliquidation - Art. 259 B du CGI): EUR €0,00
TOTAL NET À PAYER: EUR €46.000,00 (Aprox. USD $50.100,00)

Modalités de Règlement: Virement bancaire SWIFT sous 10 jours ouvrés.
Représentant Légal: Jean-Marc Delacroix (Associé Gérant)`,
  },
  {
    id: 'preset-japanese-escrow',
    name: '🇯🇵 国際エスクロー送金確認書 ESC-JP-7782 (Japanese)',
    langLabel: 'Japanese (ja)',
    flag: '🇯🇵',
    type: 'BANK_STATEMENT' as const,
    description: 'Japanese digital asset wire remittance agreement for ¥8.5M passing immediately to a Singapore crypto liquidation provider.',
    sampleText: `国際エスクロー送金確認書 (INTERNATIONAL ESCROW REMITTANCE CONFIRMATION)
契約照会番号: ESC-JP-2026-7782
約定執行日時: 2026年10月09日 14:30 JST
送金依頼人 (REMITTER):
サクラ・デジタル・キャピタル株式会社 (Sakura Digital Capital KK)
法人番号: 1010001928374
本社所在地: 東京都千代田区丸の内一丁目1番1号
仕向金融機関: 三菱UFJ銀行 丸の内支店 | Swift Code: BOTKJPJT

受取人口座名義 (BENEFICIARY):
SingaPay Global Escrow Pte Ltd
口座番号: 881-9021-4412 | 金融機関: DBS Bank Singapore

送金目的及び充当内訳:
1. デジタル資産流動性供給および担保保証エスクロー預託金
   送金金額: JPY ¥8,500,000 (約 USD $56,600.00)

送金決済条件及び重要事項:
SWIFT着金確認後、直ちに分散型マルチシグネチャ暗号資産ウォレットへの即時資金化を実行する。
承認代表取締役: 高橋 健二 (Kenji Takahashi)`,
  },
  {
    id: 'preset-invoice-discrepancy',
    name: '🇺🇸 Commercial Freight Invoice INV-2026-0891 (English)',
    langLabel: 'English (en)',
    flag: '🇺🇸',
    type: 'INVOICE' as const,
    description: 'Billed $12,500 for freight forwarding, but wire transfer was executed for $48,000 to Crypto Escrow Hub.',
    sampleText: `COMMERCIAL INVOICE
Invoice Number: INV-2026-0891
Date: October 01, 2026
Vendor: Acme Industrial Logistics AG
Tax Registration / UID: CHE-102.348.912
Address: Gotthardstrasse 26, 6300 Zug, Switzerland
IBAN: CH93 0070 0110 0021 9812 0 | BIC: UBSWCHZH

BILL TO:
Global Minerals Trading Corp
Bucharest, Romania

ITEMIZED SERVICES:
1. Maritime Freight Forwarding Container #TX-8819 - Qty: 1 - Rate: $8,500.00 - Amount: $8,500.00
2. Customs Clearance & Tariffs (Constanța Port) - Qty: 1 - Rate: $4,000.00 - Amount: $4,000.00

TOTAL DUE: USD $12,500.00
Payment Terms: Net 30 days via direct SWIFT wire transfer.
Authorized Signatory: Hans Ulrich Meier (CFO)`,
  },
  {
    id: 'preset-w8ben-shell',
    name: '🇺🇸 Form W-8BEN Beneficial Ownership (English)',
    langLabel: 'English (en)',
    flag: '🇺🇸',
    type: 'CORPORATE_REGISTRY' as const,
    description: 'Beneficial ownership filing declaring nominee directors in high-secrecy Caribbean jurisdiction with no audited financials.',
    sampleText: `FORM W-8BEN (Certificate of Foreign Status of Beneficial Owner)
Internal Revenue Service - OMB No. 1545-1621

Part I: Identification of Beneficial Owner
1. Name of Organization: Horizon Capital Holding Entity Ltd
2. Country of Incorporation: British Virgin Islands (Tortola)
3. Name of Disregarded Entity: N/A
4. Chapter 3 Status: Corporation / Passive NFFE
5. Permanent Residence Address: P.O. Box 146, Road Town, Tortola, BVI
6. Mailing Address: Same as permanent
7. U.S. Taxpayer Identification Number: NONE
8. Foreign Tax Identifying Number: BVI-CORP-988102
9. Reference Number: TX-4421-PS

Part II: Certification
I certify that the entity identified on line 1 is an entity that is not a financial institution, is not a publicly traded corporation, and has passive income exceeding 75% of total gross revenue.
Beneficial Owner: Nominee Director Services Trust Corp`,
  },
];

export const DocumentAiReviewer: React.FC<DocumentAiReviewerProps> = ({
  transactions,
  onDraftSarWithExhibit,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DOCUMENT_PRESETS[0].id);
  const [documentName, setDocumentName] = useState<string>(DOCUMENT_PRESETS[0].name);
  const [documentType, setDocumentType] = useState<any>(DOCUMENT_PRESETS[0].type);
  const [documentText, setDocumentText] = useState<string>(DOCUMENT_PRESETS[0].sampleText);
  const [linkedTransactionId, setLinkedTransactionId] = useState<string>(
    transactions.find((t) => t.riskBand === 'CRITICAL' || t.riskBand === 'HIGH')?.id || transactions[0]?.id || ''
  );

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isTranslatingOnly, setIsTranslatingOnly] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAiAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'TRANSLATION' | 'SOURCE' | 'SPLIT'>('SPLIT');
  const [copiedExhibit, setCopiedExhibit] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = DOCUMENT_PRESETS.find((preset) => preset.id === presetId);
    if (p) {
      setDocumentName(p.name);
      setDocumentType(p.type);
      setDocumentText(p.sampleText);
      setAnalysisResult(null);
      setErrorMsg(null);
    }
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName,
          documentType,
          documentText,
          transactionId: linkedTransactionId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server responded with ${res.status}`);
      }

      const data: DocumentAiAnalysis = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Document analysis error:', err);
      setErrorMsg(err.message || 'Failed to process document with Document AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTranslateOnly = async () => {
    setIsTranslatingOnly(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/documents/detect-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName,
          documentText,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to run language detection and translation');
      }

      const data = await res.json();
      if (data.success && data.translation) {
        // If we already have analysisResult, update its translation, otherwise build partial
        if (analysisResult) {
          setAnalysisResult({ ...analysisResult, translation: data.translation });
        } else {
          setAnalysisResult({
            id: `DOC-TR-${Date.now().toString().slice(-5)}`,
            documentName,
            documentType,
            extractedEntities: {
              vendorName: data.translation.bilingualFieldMappings[0]?.extractedValue,
              invoiceNumber: 'Extracted via Translation',
            },
            crossReferenceFindings: {
              amountMismatch: false,
              beneficiaryMismatch: false,
              alteredDocumentIndicators: false,
              sanctionedOrHighRiskJurisdiction: false,
            },
            documentTrustScore: 82,
            riskCategory: 'LOW_RISK',
            summaryFindings: data.translation.summaryTranslationNotes || 'Translation generated.',
            sarExhibitNarrative: `EXHIBIT (Translation Review): Non-English financial document detected in ${data.translation.detectedLanguage}. Verified English translation generated by Document AI for FinCEN BSA compliance file.`,
            analyzedAt: new Date().toISOString(),
            translation: data.translation,
          });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Translation failed');
    } finally {
      setIsTranslatingOnly(false);
    }
  };

  const handleCopyExhibit = () => {
    if (!analysisResult?.sarExhibitNarrative) return;
    navigator.clipboard.writeText(analysisResult.sarExhibitNarrative);
    setCopiedExhibit(true);
    setTimeout(() => setCopiedExhibit(false), 2000);
  };

  const linkedTx = transactions.find((t) => t.id === linkedTransactionId);
  const translationData = analysisResult?.translation;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
                <Globe2 className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Document AI Multilingual Forensics &amp; Reviewer
              </h2>
              <span className="rounded-md border border-indigo-400/30 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
                Auto-Translation + OCR + SAR Exhibits
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Automatically detect and translate non-English global financial documents (Spanish, German, Mandarin, French, Japanese) into standardized American English compliance narratives for FinCEN BSA Form 111 Part V exhibits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTranslateOnly}
              disabled={isTranslatingOnly || isAnalyzing}
              className="flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-950/60 hover:bg-indigo-900/60 px-3.5 py-2 text-xs font-semibold text-indigo-200 transition-colors disabled:opacity-50"
            >
              <Languages className={`h-4 w-4 text-indigo-400 ${isTranslatingOnly ? 'animate-spin' : ''}`} />
              <span>{isTranslatingOnly ? 'Translating...' : 'Detect & Translate'}</span>
            </button>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || isTranslatingOnly}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Forensics...' : 'Run Document AI Analysis'}</span>
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Preset Picker & Document Editor / Dual Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Presets & Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Financial Document Presets
              </label>
              <span className="text-[10px] text-slate-500 font-mono">6 International Scenarios</span>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {DOCUMENT_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/50 text-white shadow-sm'
                        : 'border-slate-800/80 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="truncate pr-1">{preset.name}</span>
                      <span className="text-[10px] rounded px-1.5 py-0.5 font-mono uppercase bg-slate-800 text-slate-300">
                        {preset.langLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Configuration Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Document Metadata &amp; On-Ledger Link
            </h3>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Document Display Title</label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="INVOICE">Commercial Invoice</option>
                  <option value="CUSTOMS_REMITTANCE">Customs Bill of Lading</option>
                  <option value="BANK_STATEMENT">Bank Wire Escrow</option>
                  <option value="CORPORATE_REGISTRY">Corporate Registry / W-8BEN</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Cross-Check Transaction</label>
                <select
                  value={linkedTransactionId}
                  onChange={(e) => setLinkedTransactionId(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">No Transaction Link</option>
                  {transactions.map((tx) => (
                    <option key={tx.id} value={tx.id}>
                      {tx.id} (${tx.amount.toLocaleString()} - {tx.riskBand})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {linkedTx && (
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Linked Tx:</span>
                  <span className="font-mono text-indigo-300 font-bold">{linkedTx.id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ledger Amount:</span>
                  <span className="font-mono text-emerald-400 font-bold">${linkedTx.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Beneficiary:</span>
                  <span className="truncate max-w-[150px] text-slate-300">{linkedTx.nameDest}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Dual-Pane Translation & Document Review (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* View Mode Switcher & Language Detection Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">View Mode:</span>
              <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                <button
                  onClick={() => setActiveTab('SPLIT')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'SPLIT' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Split className="h-3 w-3" />
                  <span>Side-by-Side</span>
                </button>
                <button
                  onClick={() => setActiveTab('TRANSLATION')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'TRANSLATION' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Languages className="h-3 w-3" />
                  <span>English Translation</span>
                </button>
                <button
                  onClick={() => setActiveTab('SOURCE')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'SOURCE' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  <span>Original Source</span>
                </button>
              </div>
            </div>

            {/* Language Detection Pill */}
            {translationData ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span>Detected: {translationData.detectedLanguage} ({(translationData.confidence * 100).toFixed(1)}%)</span>
                </span>
                {translationData.isTranslated && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-300">
                    Certified English Translation
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-mono">
                Click &ldquo;Detect &amp; Translate&rdquo; or &ldquo;Run Analysis&rdquo; to process
              </span>
            )}
          </div>

          {/* Document Content Panes */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            {activeTab === 'SPLIT' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left pane: Original */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1 border-b border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-amber-400" />
                      Original Financial Document
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Source Text</span>
                  </div>
                  <textarea
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    rows={12}
                    placeholder="Paste foreign financial document text here..."
                    className="w-full rounded-lg bg-slate-950 border border-slate-800/80 p-3 text-[11px] font-mono text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Right pane: English Translation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1 border-b border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Languages className="h-3.5 w-3.5 text-indigo-400" />
                      Verified English Translation
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400">FinCEN Standard</span>
                  </div>
                  <div className="w-full h-[252px] overflow-y-auto rounded-lg bg-slate-950 border border-slate-800/80 p-3 text-[11px] font-mono text-indigo-200/90 leading-relaxed whitespace-pre-wrap">
                    {translationData?.translatedEnglishText || (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 space-y-2">
                        <Languages className="h-8 w-8 text-slate-700" />
                        <p className="text-xs">No translation generated yet.</p>
                        <p className="text-[11px] text-slate-600">
                          Click &ldquo;Detect &amp; Translate&rdquo; above to generate certified English text.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeTab === 'TRANSLATION' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Languages className="h-4 w-4 text-indigo-400" />
                    Verified English Compliance Translation
                  </span>
                  <span className="text-xs text-indigo-300 font-mono">
                    {translationData ? `Source: ${translationData.detectedLanguage}` : 'Pending Translation'}
                  </span>
                </div>
                <div className="w-full min-h-[220px] max-h-96 overflow-y-auto rounded-lg bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {translationData?.translatedEnglishText || documentText}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-amber-400" />
                    Source Foreign Document Text
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Editable</span>
                </div>
                <textarea
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  rows={10}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Bilingual Field Terminology Card (if available) */}
          {translationData && translationData.bilingualFieldMappings && translationData.bilingualFieldMappings.length > 0 && (
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-indigo-400" />
                  Bilingual Terminology &amp; Entity Alignment
                </h4>
                <span className="text-[10px] text-indigo-300 font-mono">
                  {translationData.bilingualFieldMappings.length} Terms Reconciled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {translationData.bilingualFieldMappings.map((mapping, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-950/80 border border-indigo-900/40 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-amber-400/90 font-mono truncate">{mapping.foreignTerm}</span>
                      <span className="text-indigo-400 font-semibold">➔ {mapping.englishTerm}</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-200 truncate font-semibold">
                      {mapping.extractedValue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forensic Analysis Findings & SAR Exhibit Box */}
          {analysisResult && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-5">
              {/* Trust Score & Risk Category */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold font-mono text-base ${
                    analysisResult.documentTrustScore >= 75
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : analysisResult.documentTrustScore >= 50
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}>
                    {analysisResult.documentTrustScore}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Document Authenticity Trust Score</div>
                    <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      {analysisResult.riskCategory === 'LOW_RISK' ? (
                        <>
                          <ShieldCheck className="h-4 w-4 text-emerald-400" />
                          <span className="text-emerald-400">Low Forgery &amp; Discrepancy Risk</span>
                        </>
                      ) : analysisResult.riskCategory === 'MODERATE_DISCREPANCY' ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                          <span className="text-amber-400">Moderate Discrepancy Detected</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-4 w-4 text-rose-400" />
                          <span className="text-rose-400">High Risk / Forgery Indicators</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-mono">Analysis Timestamp</span>
                  <span className="text-xs text-slate-300 font-mono">
                    {new Date(analysisResult.analyzedAt).toLocaleTimeString()} UTC
                  </span>
                </div>
              </div>

              {/* Extracted Entities */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Extracted Regulatory Entities
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Vendor / Issuer</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {analysisResult.extractedEntities.vendorName || 'Not Stated'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Beneficiary / Buyer</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {analysisResult.extractedEntities.beneficiaryName || 'Not Stated'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Stated Invoice Amount</span>
                    <span className="font-semibold font-mono text-emerald-400 block">
                      {analysisResult.extractedEntities.currency || 'USD'} {analysisResult.extractedEntities.invoiceAmount?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Tax ID / UID / CIF</span>
                    <span className="font-semibold font-mono text-slate-300 truncate block">
                      {analysisResult.extractedEntities.taxIdOrEin || 'None Listed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cross-Reference Checks */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Cross-Reference Discrepancy Checks
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className={`flex items-center justify-between p-2 rounded-lg border ${
                    analysisResult.crossReferenceFindings.amountMismatch
                      ? 'border-rose-500/30 bg-rose-950/20 text-rose-300'
                      : 'border-slate-800 bg-slate-950 text-slate-300'
                  }`}>
                    <span>Stated Document Amount vs On-Ledger Execution</span>
                    <span className="font-mono font-bold">
                      {analysisResult.crossReferenceFindings.amountMismatch ? '⚠️ MISMATCH DETECTED' : '✓ RECONCILED'}
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-2 rounded-lg border ${
                    analysisResult.crossReferenceFindings.beneficiaryMismatch
                      ? 'border-rose-500/30 bg-rose-950/20 text-rose-300'
                      : 'border-slate-800 bg-slate-950 text-slate-300'
                  }`}>
                    <span>Beneficiary Account Alignment</span>
                    <span className="font-mono font-bold">
                      {analysisResult.crossReferenceFindings.beneficiaryMismatch ? '⚠️ UNVERIFIED PARTY' : '✓ VERIFIED MATCH'}
                    </span>
                  </div>
                </div>
              </div>

              {/* FinCEN SAR Exhibit D Auto-Draft */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-indigo-400" />
                    Auto-Generated FinCEN SAR Exhibit Narrative
                  </h4>
                  <button
                    onClick={handleCopyExhibit}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    {copiedExhibit ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedExhibit ? 'Copied to Clipboard' : 'Copy Narrative'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {analysisResult.sarExhibitNarrative}
                </div>

                {onDraftSarWithExhibit && linkedTx && (
                  <button
                    onClick={() => onDraftSarWithExhibit(linkedTx, analysisResult.sarExhibitNarrative)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 p-2.5 text-xs font-semibold text-white shadow-md transition-colors"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    <span>Append Translated Exhibit to SAR Part V Drafting Drawer for {linkedTx.id}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
