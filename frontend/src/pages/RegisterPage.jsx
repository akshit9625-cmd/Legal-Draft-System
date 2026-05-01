import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import toast from 'react-hot-toast'
import { Sun, Moon, Scale, Mail, Lock, User, UserPlus, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', password: '', full_name: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const loadToast = toast.loading('Creating Secure Identity...')
    try {
      await register(form)
      toast.success('Account Activated. Please Sign In.', { id: loadToast })
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed', { id: loadToast })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-secondary/5 focus:border-primary dark:focus:border-secondary transition-all"
  const labelClass = "text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-secondary/60 ml-1 mb-1 block"

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 bg-[#f8fafc] dark:bg-[#050810]">
      {/* Background blobs */}
      <div className="absolute top-[-10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      
      <div className="container max-w-6xl mx-auto px-4 z-10 py-12">
        <div className="flex flex-col lg:flex-row items-stretch bg-white dark:bg-navy-light/50 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Left Side: Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-16 relative flex flex-col justify-center order-2 lg:order-1">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="absolute top-8 right-8 p-3 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-secondary hover:scale-110 transition-all"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="max-w-md mx-auto w-full">
              <div className="mb-10">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Join the Archives</h2>
                <p className="text-slate-500 dark:text-cream-dim/60 text-lg font-medium">Create your legal professional account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className={inputClass} placeholder="Counsel Name" />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputClass} placeholder="advocate@court.in" required />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Unique Username</label>
                    <div className="relative">
                      <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className={inputClass} placeholder="counsel_24" required />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Access Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={inputClass} placeholder="••••••••" required />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary dark:bg-secondary text-white dark:text-navy py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-primary/20 dark:shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Create Account <ArrowRight size={22} /></>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-10 text-center">
                <p className="text-slate-500 dark:text-white/30 font-medium">
                  Already have access? {' '}
                  <Link to="/login" className="text-primary dark:text-secondary font-bold hover:underline italic decoration-2 underline-offset-4">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Features/Branding */}
          <div className="lg:w-1/2 p-12 lg:p-20 bg-primary relative flex flex-col justify-center overflow-hidden text-white order-1 lg:order-2">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shadow-lg mb-12">
                <Scale size={32} className="text-primary" />
              </div>
              <h1 className="font-serif text-5xl font-bold mb-8 leading-tight">
                Unlock the <span className="text-secondary italic">Standard</span> in Legal Automation.
              </h1>
              
              <div className="space-y-6">
                {[
                  "Draft high-quality complaints in seconds",
                  "Automated Indian Statute referencing",
                  "Secure, private case management",
                  "Verified RAG-enhanced accuracy"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <CheckCircle2 size={24} className="text-secondary shrink-0" />
                    <span className="text-lg font-medium text-white/90">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
