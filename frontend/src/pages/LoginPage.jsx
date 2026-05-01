import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import toast from 'react-hot-toast'
import { Sun, Moon, Scale, Mail, Lock, ArrowRight, Shield, Globe, Award, Zap } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const loadToast = toast.loading('Verifying Credentials...')
    try {
      await login(form.username, form.password)
      toast.success('Welcome back, Counselor', { id: loadToast })
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Authentication Failed', { id: loadToast })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 bg-[#f8fafc] dark:bg-[#050810]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] -right-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="container max-w-6xl mx-auto px-4 z-10">
        <div className="flex flex-col lg:flex-row items-stretch bg-white dark:bg-navy-light/50 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Left Panel: High-Impact Branding */}
          <div className="lg:w-1/2 p-12 lg:p-20 bg-primary relative flex flex-col justify-between overflow-hidden text-white">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 blur-[80px] -mr-32 -mt-32" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-12 animate-fade-up">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/20">
                  <Scale size={28} className="text-primary font-bold" />
                </div>
                <span className="font-serif text-3xl font-bold tracking-tight">Legal<span className="text-secondary">Draft</span>AI</span>
              </div>

              <h2 className="text-5xl lg:text-6xl font-serif font-bold leading-[1.1] mb-8 animate-fade-up stagger-1">
                Precision Drafting <br/> 
                <span className="text-secondary italic">Simplified.</span>
              </h2>

              <div className="space-y-6 animate-fade-up stagger-2">
                {[
                  { icon: Shield, text: "Enterprise-grade security for sensitive records" },
                  { icon: Zap, text: "AI-accelerated generation in seconds" },
                  { icon: Award, text: "Optimized for Indian High Court standards" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-white/80 group">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-primary transition-all duration-300">
                      <item.icon size={18} />
                    </div>
                    <span className="text-lg font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-12 flex items-center gap-4 border-t border-white/10 animate-fade-up stagger-3">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-slate-200" />
                ))}
              </div>
              <p className="text-sm text-white/60 font-medium italic">
                Trusted by 500+ legal professionals across India
              </p>
            </div>
          </div>

          {/* Right Panel: Clean Login Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-20 relative flex flex-col justify-center">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="absolute top-10 right-10 p-3 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-secondary hover:scale-110 transition-all active:scale-95 shadow-inner"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="max-w-md mx-auto w-full">
              <div className="mb-12">
                <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Sign In</h3>
                <p className="text-slate-500 dark:text-cream-dim/50 text-lg">Enter your secure credentials to proceed.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 group">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-secondary/60 group-focus-within:text-primary dark:group-focus-within:text-secondary transition-colors">Identification</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-secondary transition-colors" size={20} />
                    <input 
                      type="text" 
                      value={form.username}
                      onChange={e => setForm(f => ({...f, username: e.target.value}))}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-secondary/5 focus:border-primary dark:focus:border-secondary transition-all"
                      placeholder="Username"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-secondary/60 group-focus-within:text-primary dark:group-focus-within:text-secondary transition-colors">Access Key</label>
                    <a href="#" className="text-xs text-primary dark:text-secondary font-bold hover:underline">Recovery?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-secondary transition-colors" size={20} />
                    <input 
                      type="password" 
                      value={form.password}
                      onChange={e => setForm(f => ({...f, password: e.target.value}))}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-secondary/5 focus:border-primary dark:focus:border-secondary transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-primary focus:ring-primary" />
                  <label htmlFor="remember" className="text-sm text-slate-500 dark:text-white/40 cursor-pointer select-none">Remember this device</label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary dark:bg-secondary text-white dark:text-navy py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-primary/20 dark:shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-wait overflow-hidden relative group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10">{loading ? 'Verifying...' : 'Initialize Access'}</span>
                  {!loading && <ArrowRight size={22} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <div className="mt-12 text-center">
                <p className="text-slate-500 dark:text-white/30 font-medium">
                  Don't have a secure ID? {' '}
                  <Link to="/register" className="text-primary dark:text-secondary font-bold hover:underline decoration-2 underline-offset-4 italic">
                    Request Account
                  </Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
