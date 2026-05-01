import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { casesAPI } from '../services/api'
import toast from 'react-hot-toast'
import { ChevronRight, ChevronLeft, Save, Scale, User, CreditCard, FileText, CheckCircle2 } from 'lucide-react'

function StepIndicator({ currentStep, totalSteps }) {
  const steps = [
    { icon: Scale, label: 'Jurisdiction' },
    { icon: User, label: 'Parties' },
    { icon: CreditCard, label: 'Transaction' },
    { icon: FileText, label: 'Review' },
  ]

  return (
    <div className="flex items-center justify-between mb-12 max-w-3xl mx-auto px-4">
      {steps.map((step, idx) => {
        const Icon = step.icon
        const isActive = currentStep === idx + 1
        const isCompleted = currentStep > idx + 1
        return (
          <div key={idx} className="flex flex-col items-center relative flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
              isActive ? 'bg-primary dark:bg-gold border-primary dark:border-gold text-white dark:text-navy shadow-[0_0_15px_rgba(30,64,175,0.4)] dark:shadow-[0_0_15px_rgba(201,168,76,0.4)]' : 
              isCompleted ? 'bg-primary/20 dark:bg-gold/20 border-primary dark:border-gold text-primary dark:text-gold' : 
              'bg-slate-100 dark:bg-navy-accent border-slate-200 dark:border-border text-slate-500/40 dark:text-cream-dim/40'
            }`}>
              {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
            </div>
            <span className={`absolute -bottom-7 text-[10px] uppercase tracking-widest font-medium whitespace-nowrap transition-colors duration-300 ${
              isActive ? 'text-primary dark:text-gold' : 'text-slate-500/40 dark:text-cream-dim/40'
            }`}>
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <div className={`absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] h-[2px] top-5 -translate-y-1/2 transition-colors duration-500 ${
                isCompleted ? 'bg-primary dark:bg-gold' : 'bg-slate-200 dark:bg-border'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, hint, required, children, className = "" }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-[10px] font-mono tracking-widest uppercase text-primary dark:text-gold">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {hint && <span className="text-[10px] text-slate-500/40 dark:text-cream-dim/40 italic">— {hint}</span>}
      </div>
      {children}
    </div>
  )
}

const inputClass = "w-full bg-slate-100/50 dark:bg-navy-accent/50 border border-slate-200 dark:border-border rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-cream placeholder:text-slate-400 dark:placeholder:text-cream-dim/20 focus:outline-none focus:border-primary/50 dark:focus:border-gold/50 transition-colors"

export default function NewCasePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    court_name: '', court_location: '', police_station: '', sections_alleged: '',
    complainant_name: '', complainant_ar_name: '', complainant_address: '', complainant_phone: '', complainant_email: '',
    accused_name: '', accused_proprietor: '', accused_address: '', accused_phone: '', accused_email: '',
    cheque_number: '', cheque_date: '', cheque_amount: '', cheque_amount_words: '',
    drawee_bank: '', drawee_branch: '', deposit_bank: '', deposit_branch: '',
    dishonour_date: '', dishonour_reason: '', notice_date: '', notice_sent_by: '',
    notice_delivery_date: '', case_description: '', relief_sought: '',
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const validateStep = () => {
    if (step === 1) {
      if (!form.court_name || !form.court_location) {
        toast.error("Please fill required court details")
        return false
      }
    }
    if (step === 2) {
      if (!form.complainant_name || !form.accused_name) {
        toast.error("Please provide names for both parties")
        return false
      }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, 4))
  }

  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.case_description.length < 50) {
      toast.error('Please provide a case description (min 50 chars)')
      return
    }
    setLoading(true)

    try {
      await casesAPI.submit({
        title: `${form.complainant_name} vs ${form.accused_name}`,
        jurisdiction: form.court_location,
        petitioner_name: form.complainant_name,
        respondent_name: form.accused_name,
        incident_date: form.cheque_date,
        relief_sought: form.relief_sought,
        case_description: form.case_description,
        sections_alleged: form.sections_alleged,
      })
      toast.success('Case draft created successfully!')
      navigate('/cases')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create case')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-cream mb-2">Initialize New Draft</h1>
          <p className="text-slate-500/60 dark:text-cream-dim/60 text-sm">Fill in the details below to generate an AI-powered legal draft.</p>
        </header>

        <StepIndicator currentStep={step} totalSteps={4} />

        <div className="bg-white/40 dark:bg-navy-light/40 border border-slate-200 dark:border-border p-8 md:p-10 rounded-2xl backdrop-blur-sm shadow-xl min-h-[500px] flex flex-col">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            
            {step === 1 && (
              <div className="space-y-6 animate-fade-up">
                <div className="border-l-2 border-primary dark:border-gold pl-4 mb-8">
                  <h2 className="text-xl font-serif text-primary dark:text-gold font-medium">Court & Jurisdiction</h2>
                  <p className="text-xs text-slate-500/40 dark:text-cream-dim/40">Specify where the case will be filed</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Name of the Court" hint="e.g. District Court" required>
                    <input className={inputClass} value={form.court_name} onChange={set('court_name')} placeholder="Enter court name..." />
                  </Field>
                  <Field label="Location/Place" hint="e.g. Saket, Delhi" required>
                    <input className={inputClass} value={form.court_location} onChange={set('court_location')} placeholder="Enter location..." />
                  </Field>
                  <Field label="Police Station">
                    <input className={inputClass} value={form.police_station} onChange={set('police_station')} placeholder="PS name..." />
                  </Field>
                  <Field label="Statutes/Sections" hint="Comma separated">
                    <input className={inputClass} value={form.sections_alleged} onChange={set('sections_alleged')} placeholder="e.g. Section 138 NI Act" />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-up">
                <div className="border-l-2 border-primary dark:border-gold pl-4">
                  <h2 className="text-xl font-serif text-primary dark:text-gold font-medium">Parties Involved</h2>
                  <p className="text-xs text-slate-500/40 dark:text-cream-dim/40">Details of Complainant and Accused</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <h3 className="text-[10px] font-mono tracking-widest text-slate-500/30 dark:text-cream-dim/30 border-b border-slate-200 dark:border-border pb-2 uppercase">Complainant</h3>
                    <Field label="Legal Name" required>
                      <input className={inputClass} value={form.complainant_name} onChange={set('complainant_name')} />
                    </Field>
                    <Field label="Authorised Rep (AR)">
                      <input className={inputClass} value={form.complainant_ar_name} onChange={set('complainant_ar_name')} />
                    </Field>
                    <Field label="Address">
                      <textarea rows="3" className={`${inputClass} resize-none`} value={form.complainant_address} onChange={set('complainant_address')} />
                    </Field>
                  </div>
                  
                  <div className="space-y-5">
                    <h3 className="text-[10px] font-mono tracking-widest text-slate-500/30 dark:text-cream-dim/30 border-b border-slate-200 dark:border-border pb-2 uppercase">Accused</h3>
                    <Field label="Full Name" required>
                      <input className={inputClass} value={form.accused_name} onChange={set('accused_name')} />
                    </Field>
                    <Field label="Proprietor/Director">
                      <input className={inputClass} value={form.accused_proprietor} onChange={set('accused_proprietor')} />
                    </Field>
                    <Field label="Address">
                      <textarea rows="3" className={`${inputClass} resize-none`} value={form.accused_address} onChange={set('accused_address')} />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-up">
                <div className="border-l-2 border-primary dark:border-gold pl-4 mb-8">
                  <h2 className="text-xl font-serif text-primary dark:text-gold font-medium">Transaction Details</h2>
                  <p className="text-xs text-slate-500/40 dark:text-cream-dim/40">Cheque and banking information</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Field label="Cheque No.">
                    <input className={inputClass} value={form.cheque_number} onChange={set('cheque_number')} />
                  </Field>
                  <Field label="Cheque Date">
                    <input type="date" className={inputClass} value={form.cheque_date} onChange={set('cheque_date')} />
                  </Field>
                  <Field label="Amount (₹)">
                    <input type="number" className={inputClass} value={form.cheque_amount} onChange={set('cheque_amount')} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Drawee Bank">
                    <input className={inputClass} value={form.drawee_bank} onChange={set('drawee_bank')} placeholder="Accused's Bank" />
                  </Field>
                  <Field label="Dishonour Reason">
                    <select className={inputClass} value={form.dishonour_reason} onChange={set('dishonour_reason')}>
                      <option value="">Select Reason</option>
                      <option value="funds_insufficient">Funds Insufficient</option>
                      <option value="stop_payment">Stop Payment</option>
                      <option value="account_closed">Account Closed</option>
                      <option value="signature_mismatch">Signature Mismatch</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fade-up">
                <div className="border-l-2 border-primary dark:border-gold pl-4 mb-8">
                  <h2 className="text-xl font-serif text-primary dark:text-gold font-medium">Drafting Context</h2>
                  <p className="text-xs text-slate-500/40 dark:text-cream-dim/40">Final narrative for the AI engine</p>
                </div>
                <Field label="Case Narrative" hint="Detailed facts of the transaction" required>
                  <textarea 
                    rows="8" 
                    className={`${inputClass} resize-none leading-relaxed`} 
                    value={form.case_description} 
                    onChange={set('case_description')}
                    placeholder="Describe the business relationship, how the debt arose, and the sequence of events leading to the cheque bounce..."
                  />
                  <div className="mt-2 text-[10px] text-slate-500/40 dark:text-cream-dim/40 flex justify-between">
                    <span>Minimum 50 characters required for better AI results.</span>
                    <span className={form.case_description.length >= 50 ? "text-green-500" : "text-primary dark:text-gold"}>
                      Count: {form.case_description.length}
                    </span>
                  </div>
                </Field>
                <Field label="Relief Sought">
                  <input className={inputClass} value={form.relief_sought} onChange={set('relief_sought')} placeholder="e.g. Recovery of ₹5,00,000 with 18% p.a. interest" />
                </Field>
              </div>
            )}

            <div className="mt-auto pt-10 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg border border-slate-200 dark:border-border text-sm font-medium transition-all ${
                  step === 1 ? 'opacity-0 cursor-default' : 'hover:border-primary dark:hover:border-gold hover:text-primary dark:hover:text-gold text-slate-500 dark:text-cream-dim'
                }`}
              >
                <ChevronLeft size={18} /> Previous
              </button>
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-primary dark:bg-gold text-white dark:text-navy font-semibold text-sm hover:bg-primary-light dark:hover:bg-gold-light hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-primary/10 dark:shadow-gold/10"
                >
                  Next Step <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-primary dark:bg-gold text-white dark:text-navy font-bold text-sm hover:bg-primary-light dark:hover:bg-gold-light hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-primary/20 dark:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white dark:border-navy border-t-transparent rounded-full animate-spin" />
                      Generating Draft...
                    </>
                  ) : (
                    <>
                      Generate Final Draft <Save size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
