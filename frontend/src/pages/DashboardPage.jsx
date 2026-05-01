import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCaseList } from '../hooks/useCase'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import CaseTypeBadge from '../components/CaseTypeBadge'
import { Plus, ArrowRight, FolderOpen, CheckCircle, Clock, Sparkles } from 'lucide-react'

function StatCard({ label, value, sub, delay, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-navy-light border border-slate-200 dark:border-border p-6 rounded-xl animate-fade-up relative overflow-hidden group hover:border-primary/30 dark:hover:border-gold/30 transition-all duration-300" style={{ animationDelay: `${delay}s` }}>
      <div className="absolute top-0 right-0 p-4 text-primary/5 dark:text-gold/5 group-hover:text-primary/10 dark:group-hover:text-gold/10 transition-colors">
        <Icon size={80} strokeWidth={1} />
      </div>
      <div className="relative z-10">
        <div className="text-[10px] font-mono tracking-widest uppercase text-primary dark:text-gold mb-3 flex items-center gap-2">
          <Icon size={12} /> {label}
        </div>
        <div className="font-serif text-5xl font-light text-slate-900 dark:text-cream leading-none mb-2">{value}</div>
        {sub && <div className="text-xs text-slate-500/40 dark:text-cream-dim/40 font-medium">{sub}</div>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { cases, loading } = useCaseList()
  
  const total = cases.length
  const completed = cases.filter(c => c.status === 'completed').length
  const pending = cases.filter(c => ['pending', 'processing'].includes(c.status)).length

  return (
    <Layout>
      <header className="mb-10 animate-fade-up">
        <div className="flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase text-primary dark:text-gold mb-3">
          <Sparkles size={14} /> Welcome back
        </div>
        <h1 className="font-serif text-5xl font-bold text-slate-900 dark:text-cream tracking-tight mb-2">
          {user?.full_name || user?.username}
        </h1>
        <p className="text-slate-500/60 dark:text-cream-dim/60 text-sm max-w-xl leading-relaxed">
          Your intelligent workspace for Indian legal drafting. Leverage fine-tuned LLMs and RAG technology for precision drafts.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Total Drafts" value={total} sub="Cumulative cases" delay={0.1} icon={FolderOpen} />
        <StatCard label="Completed" value={completed} sub="Ready for export" delay={0.2} icon={CheckCircle} />
        <StatCard label="In Progress" value={pending} sub="Queue / Processing" delay={0.3} icon={Clock} />
      </div>

      <section className="mb-12 animate-fade-up stagger-4">
        <div className="bg-slate-100/40 dark:bg-navy-accent/40 border border-primary/20 dark:border-gold/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 dark:bg-gold/5 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-cream mb-2">Create New Legal Draft</h2>
            <p className="text-sm text-slate-500/60 dark:text-cream-dim/60 max-w-lg">
              Generate a professional legal document based on case facts. Our system extracts entities and applies relevant legal precedents automatically.
            </p>
          </div>
          <Link 
            to="/cases/new" 
            className="relative z-10 flex items-center gap-2 px-8 py-3 bg-primary dark:bg-gold text-white dark:text-navy font-bold rounded-xl hover:bg-primary-light dark:hover:bg-gold-light hover:-translate-y-1 transition-all shadow-xl shadow-primary/10 dark:shadow-gold/10"
          >
            <Plus size={20} /> New Draft
          </Link>
        </div>
      </section>

      <section className="animate-fade-up stagger-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-cream">Recent Case Activity</h2>
          <Link to="/cases" className="text-xs font-mono uppercase tracking-widest text-primary dark:text-gold hover:text-primary-light dark:hover:text-gold-light flex items-center gap-1 transition-colors">
            All cases <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-white/50 dark:bg-navy-light/50 border border-slate-200 dark:border-border rounded-xl animate-shimmer" />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-20 bg-white/20 dark:bg-navy-light/20 border border-dashed border-slate-200 dark:border-border rounded-2xl group hover:border-primary/30 dark:hover:border-gold/30 transition-colors">
            <FolderOpen size={40} className="mx-auto text-slate-500/20 dark:text-cream-dim/20 mb-4 group-hover:text-primary/20 dark:group-hover:text-gold/20 transition-colors" />
            <h3 className="font-serif text-xl text-slate-500/50 dark:text-cream-dim/50 mb-4">Your archives are empty</h3>
            <Link to="/cases/new" className="text-sm font-medium text-primary dark:text-gold hover:underline">Start your first draft today</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {cases.slice(0, 5).map((c, i) => (
              <Link key={c.id} to={`/cases/${c.id}`} className="group">
                <div className="bg-white dark:bg-navy-light border border-slate-200 dark:border-border p-5 rounded-xl flex items-center gap-6 group-hover:border-primary/50 dark:group-hover:border-gold/50 group-hover:bg-slate-100/40 dark:group-hover:bg-navy-accent/40 transition-all duration-300">
                  <div className={`w-2 h-2 rounded-full shrink-0 shadow-lg ${
                    c.status === 'completed' ? 'bg-green-500 shadow-green-500/20' : 
                    c.status === 'failed' ? 'bg-red-500 shadow-red-500/20' : 
                    'bg-primary dark:bg-gold animate-pulse shadow-primary/20 dark:shadow-gold/20'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-cream truncate mb-1 group-hover:text-primary dark:group-hover:text-gold transition-colors">{c.title}</h3>
                    <time className="text-[10px] font-mono uppercase tracking-widest text-slate-500/40 dark:text-cream-dim/40">
                      Created {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </time>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    {c.case_type && <CaseTypeBadge type={c.case_type} />}
                    <StatusBadge status={c.status} />
                  </div>
                  <ArrowRight size={16} className="text-slate-500/20 dark:text-cream-dim/20 group-hover:text-primary dark:group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}
