import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import CaseTypeBadge from '../components/CaseTypeBadge'
import { useCaseList } from '../hooks/useCase'
import { casesAPI } from '../services/api'
import { Plus, Trash2, Search, FileText, Filter, MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CaseListPage() {
  const { cases, loading, refetch } = useCaseList()
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const handleDelete = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this case and its draft? This cannot be undone.')) return
    setDeleting(id)
    try {
      await casesAPI.delete(id)
      toast.success('Case deleted')
      refetch()
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.case_type?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-fade-up">
        <div>
          <h1 className="font-serif text-4xl font-bold text-slate-900 dark:text-cream">My Legal Archives</h1>
          <p className="text-slate-500/60 dark:text-cream-dim/60 text-sm mt-2 flex items-center gap-2">
            <span className="font-mono text-primary dark:text-gold">{cases.length}</span> Total drafts indexed
          </p>
        </div>
        <Link
          to="/cases/new"
          className="flex items-center justify-center gap-2 bg-primary dark:bg-gold text-white dark:text-navy px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary-light dark:hover:bg-gold-light hover:-translate-y-1 transition-all shadow-lg shadow-primary/10 dark:shadow-gold/10"
        >
          <Plus size={18} /> New Case Draft
        </Link>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-up stagger-1">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500/30 dark:text-cream-dim/30" size={18} />
          <input 
            type="text" 
            placeholder="Search by title or case type..." 
            className="w-full bg-white/50 dark:bg-navy-light/50 border border-slate-200 dark:border-border rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 dark:text-cream focus:outline-none focus:border-primary/50 dark:focus:border-gold/50 transition-colors"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/50 dark:bg-navy-light/50 border border-slate-200 dark:border-border rounded-xl text-sm font-medium text-slate-500 dark:text-cream-dim hover:text-primary dark:hover:text-gold hover:border-primary/50 dark:hover:border-gold/50 transition-all">
          <Filter size={18} /> Filter
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-navy-light/30 border border-border rounded-xl p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-navy-accent rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-navy-accent rounded w-1/3" />
                  <div className="h-3 bg-navy-accent rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-24 bg-navy-light/10 border border-dashed border-border rounded-3xl animate-fade-up">
          <div className="w-20 h-20 bg-navy-accent/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={32} className="text-cream-dim/20" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-cream mb-2">No records found</h2>
          <p className="text-cream-dim/40 text-sm mb-8 max-w-xs mx-auto">
            {search ? `We couldn't find any results for "${search}"` : "You haven't initiated any legal drafts yet."}
          </p>
          <Link to="/cases/new" className="inline-flex items-center gap-2 text-gold font-medium hover:text-gold-light hover:underline transition-all">
            <Plus size={16} /> Create your first case
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 animate-fade-up stagger-2">
          {filteredCases.map((c, idx) => (
            <div
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              className="group flex items-center gap-5 bg-navy-light/40 border border-border px-6 py-4 rounded-xl hover:border-gold/40 hover:bg-navy-accent/40 transition-all duration-300 cursor-pointer animate-fade-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="w-12 h-12 bg-navy-accent rounded-xl flex items-center justify-center shrink-0 border border-border group-hover:border-gold/20 group-hover:bg-gold/5 transition-all">
                <FileText size={20} className="text-cream-dim/40 group-hover:text-gold transition-colors" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-cream truncate mb-1 group-hover:text-gold transition-colors">
                  {c.title}
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-cream-dim/40">
                  <span>ID: {c.id.slice(0, 8)}</span>
                  <span className="w-1 h-1 bg-border rounded-full" />
                  <span>{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 shrink-0">
                {c.case_type && <CaseTypeBadge type={c.case_type} />}
                <StatusBadge status={c.status} />
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-4">
                <button
                  onClick={(e) => handleDelete(c.id, e)}
                  disabled={deleting === c.id}
                  className="p-2.5 text-cream-dim/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-50"
                  title="Delete case"
                >
                  <Trash2 size={16} />
                </button>
                <div className="p-2.5 text-cream-dim/20 hover:text-gold transition-colors">
                  <MoreVertical size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
