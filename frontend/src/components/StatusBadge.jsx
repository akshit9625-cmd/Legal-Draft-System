const CFG = {
  pending:    { label: 'Pending',    bg: 'bg-amber-500/10',  text: 'text-amber-600 dark:text-amber-400',  dot: 'bg-amber-500', border: 'border-amber-500/20' },
  processing: { label: 'Processing', bg: 'bg-blue-500/10',   text: 'text-blue-600 dark:text-blue-400',    dot: 'bg-blue-500',  border: 'border-blue-500/20', pulse: true },
  completed:  { label: 'Completed',  bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-500/20' },
  failed:     { label: 'Failed',     bg: 'bg-red-500/10',     text: 'text-red-600 dark:text-red-400',       dot: 'bg-red-500',     border: 'border-red-500/20' },
}

export default function StatusBadge({ status }) {
  const c = CFG[status] || CFG.pending
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border} text-[10px] font-bold uppercase tracking-widest`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${c.pulse ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  )
}
