import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import DraftViewer from '../components/DraftViewer'
import EntityPanel from '../components/EntityPanel'
import StatusBadge from '../components/StatusBadge'
import CaseTypeBadge from '../components/CaseTypeBadge'
import { useCaseDetail } from '../hooks/useCase'
import { Download, RefreshCw, ArrowLeft, Clock, AlertCircle, Info, FileText } from 'lucide-react'

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-slate-200/50 dark:border-border/50 last:border-0">
      <span className="text-[10px] font-mono uppercase tracking-widest text-primary/50 dark:text-gold/50">{label}</span>
      <span className="text-sm text-slate-500 dark:text-cream-dim leading-relaxed">{value}</span>
    </div>
  )
}

export default function CaseDetailPage() {
  const { id } = useParams()
  const { caseData, loading, polling, regenerate, exportPdf } = useCaseDetail(id)

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-48 gap-4 animate-fade-up">
          <div className="w-12 h-12 border-2 border-primary/20 dark:border-gold/20 border-t-primary dark:border-t-gold rounded-full animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-primary dark:text-gold animate-pulse">Retrieving case files...</p>
        </div>
      </Layout>
    )
  }

  if (!caseData) {
    return (
      <Layout>
        <div className="text-center py-32 bg-white/10 dark:bg-navy-light/10 border border-dashed border-slate-200 dark:border-border rounded-3xl animate-fade-up">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400/40" />
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-cream mb-2">Case not found</h2>
          <p className="text-slate-500/40 dark:text-cream-dim/40 text-sm mb-8">The requested draft could not be located in the archives.</p>
          <Link to="/cases" className="text-primary dark:text-gold font-medium hover:text-primary-light dark:hover:text-gold-light hover:underline transition-all flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Back to cases
          </Link>
        </div>
      </Layout>
    )
  }

  const isProcessing = ['processing', 'pending'].includes(caseData.status)

  return (
    <Layout>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500/30 dark:text-cream-dim/30 mb-8 animate-fade-up">
        <Link to="/cases" className="hover:text-primary dark:hover:text-gold transition-colors flex items-center gap-1">
          Archives
        </Link>
        <span>/</span>
        <span className="text-slate-500/60 dark:text-cream-dim/60 truncate max-w-[200px]">{caseData.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 animate-fade-up stagger-1">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <StatusBadge status={caseData.status} />
            {caseData.case_type && (
              <CaseTypeBadge type={caseData.case_type} confidence={caseData.case_type_confidence} />
            )}
          </div>
          <h1 className="font-serif text-4xl font-bold text-slate-900 dark:text-cream tracking-tight mb-2">
            {caseData.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500/40 dark:text-cream-dim/40">
            <Clock size={14} />
            <span>Indexed on {new Date(caseData.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {caseData.draft && (
            <>
              <button
                onClick={() => regenerate('all', '')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-border text-xs font-bold text-slate-500 dark:text-cream-dim hover:text-primary dark:hover:text-gold hover:border-primary/50 dark:hover:border-gold/50 transition-all bg-slate-100/20 dark:bg-navy-accent/20"
              >
                <RefreshCw size={14} /> Regenerate Draft
              </button>
              <button
                onClick={exportPdf}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary dark:bg-gold text-white dark:text-navy text-xs font-bold hover:bg-primary-light dark:hover:bg-gold-light hover:-translate-y-1 transition-all shadow-lg shadow-primary/10 dark:shadow-gold/10"
              >
                <Download size={14} /> Export PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="bg-primary/5 dark:bg-gold/5 border border-primary/20 dark:border-gold/20 rounded-2xl p-6 mb-10 flex items-center gap-5 animate-pulse shadow-[0_0_20px_rgba(30,64,175,0.05)] dark:shadow-[0_0_20px_rgba(201,168,76,0.05)]">
          <div className="w-10 h-10 border-2 border-primary/20 dark:border-gold/20 border-t-primary dark:border-t-gold rounded-full animate-spin shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-primary dark:text-gold uppercase tracking-widest font-mono mb-1">AI Engine Active</p>
            <p className="text-xs text-slate-500/60 dark:text-cream-dim/60 leading-relaxed">
              Generating legal draft using RAG-enhanced Llama model. Analyzing precedents and structuring content...
            </p>
          </div>
        </div>
      )}

      {caseData.status === 'failed' && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 mb-10 flex items-center gap-4 animate-fade-up text-red-400">
          <AlertCircle size={24} className="shrink-0" />
          <div>
            <p className="text-sm font-bold uppercase tracking-widest font-mono mb-1">Processing Error</p>
            <p className="text-xs opacity-70">The AI pipeline encountered an issue. Please attempt to regenerate or check input facts.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Case Info */}
        <div className="lg:col-span-4 space-y-6 animate-fade-up stagger-2">
          {/* Case metadata card */}
          <div className="bg-white/40 dark:bg-navy-light/40 border border-slate-200 dark:border-border rounded-2xl p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 text-primary/5 dark:text-gold/5 pointer-events-none">
              <Info size={120} strokeWidth={1} />
            </div>
            <h2 className="text-[10px] font-mono tracking-widest uppercase text-primary dark:text-gold mb-6 flex items-center gap-2">
              <FileText size={12} /> Case Specifications
            </h2>
            <div className="relative z-10">
              <InfoRow label="Petitioner"    value={caseData.petitioner_name} />
              <InfoRow label="Respondent"    value={caseData.respondent_name} />
              <InfoRow label="Jurisdiction"  value={caseData.jurisdiction} />
              <InfoRow label="Statutes"      value={caseData.sections_alleged} />
            </div>
          </div>

          {/* Description card */}
          <div className="bg-white/40 dark:bg-navy-light/40 border border-slate-200 dark:border-border rounded-2xl p-6 relative group overflow-hidden">
             <h2 className="text-[10px] font-mono tracking-widest uppercase text-primary dark:text-gold mb-4 group-hover:text-primary-light dark:group-hover:text-gold-light transition-colors">Incident Summary</h2>
             <p className="text-sm text-slate-500/70 dark:text-cream-dim/70 leading-relaxed italic line-clamp-6 group-hover:line-clamp-none transition-all duration-500">
              "{caseData.case_description}"
            </p>
          </div>

          {/* Entities panel */}
          {caseData.extracted_entities && (
            <div className="bg-white/40 dark:bg-navy-light/40 border border-slate-200 dark:border-border rounded-2xl p-6">
              <h2 className="text-[10px] font-mono tracking-widest uppercase text-primary dark:text-gold mb-6">Identified Entities</h2>
              <EntityPanel entities={caseData.extracted_entities} />
            </div>
          )}

          {/* Metadata Footer */}
          {caseData.draft && (
            <div className="p-4 bg-slate-100/20 dark:bg-navy-accent/20 border border-slate-200 dark:border-border rounded-xl font-mono text-[9px] text-slate-500/30 dark:text-cream-dim/30 space-y-2 uppercase tracking-widest">
              <div className="flex justify-between">
                <span>Model Profile</span>
                <span className="text-primary dark:text-gold">{caseData.draft.model_used || 'Indian-Legal-Llama-GGUF'}</span>
              </div>
              <div className="flex justify-between">
                <span>Ref Version</span>
                <span className="text-primary dark:text-gold">v{caseData.draft.version}.0</span>
              </div>
              {caseData.draft.generation_time_seconds && (
                <div className="flex justify-between">
                  <span>Engine Time</span>
                  <span className="text-primary dark:text-gold">{caseData.draft.generation_time_seconds}s</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Draft Content */}
        <div className="lg:col-span-8 animate-fade-up stagger-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-cream">AI Draft Output</h2>
            {caseData.draft && (
              <div className="text-[10px] font-mono tracking-widest text-primary/40 dark:text-gold/40 border border-primary/10 dark:border-gold/10 px-3 py-1 rounded-full bg-primary/5 dark:bg-gold/5">
                RAG ENHANCED
              </div>
            )}
          </div>

          {isProcessing ? (
            <div className="bg-white/20 dark:bg-navy-light/20 border border-slate-200 dark:border-border border-dashed rounded-3xl p-24 text-center">
              <div className="w-16 h-16 border-2 border-primary/10 dark:border-gold/10 border-t-primary dark:border-t-gold rounded-full animate-spin mx-auto mb-6" />
              <h3 className="font-serif text-xl text-slate-500/60 dark:text-cream-dim/60">Assembling Legal Sections...</h3>
              <p className="text-xs text-slate-500/30 dark:text-cream-dim/30 mt-2 italic">Consulting Indian Penal Code & NI Act precedents</p>
            </div>
          ) : (
            <div className="bg-white/30 dark:bg-navy-light/30 border border-slate-200 dark:border-border rounded-3xl p-1 shadow-2xl">
              <DraftViewer
                draft={caseData.draft}
                onRegenerate={regenerate}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
