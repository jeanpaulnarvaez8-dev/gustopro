import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, CalendarDays, Users, Clock, Info, CheckCircle2, ChevronRight, CreditCard, Loader2 } from 'lucide-react'
import { catalog, bookings } from './lib/api'

const TIME_SLOTS = ['12:30', '13:00', '13:30', '14:00', '14:30', '19:30', '20:00', '20:30', '21:00', '21:30']

const ZONE_IMAGES = {
  'Terrazza Panoramica': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800&h=600',
  'Sala Cristallo': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800&h=600'
}

export default function RivaRestaurant({ onBack }) {
  const [ZONES, setZONES] = useState([])
  const [step, setStep] = useState(1)
  const [guests, setGuests] = useState(2)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [zone, setZone] = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    catalog.zones('RESTAURANT').then(zones => {
      setZONES(zones.map(z => ({ id: z.id, name: z.name, desc: z.description || '', price: Number(z.supplement), image: ZONE_IMAGES[z.name] || '' })))
    })
  }, [])

  const caparraPerPersona = 10
  const totalCaparra = guests * caparraPerPersona + (zone?.price || 0)

  const handleNext = async () => {
    if (step === 1 && (!date || !time)) return
    if (step === 2 && !zone) return
    if (step === 3) {
      if (!customerName || !customerEmail) return
      setSubmitting(true)
      try {
        await bookings.restaurant({ name: customerName, email: customerEmail, date, timeSlot: time, guests, zoneId: zone.id })
        setStep(4)
      } catch (err) {
        console.error('Booking failed:', err)
      } finally {
        setSubmitting(false)
      }
      return
    }
    setStep(s => s + 1)
  }

  // --- RENDERING STEPS ---

  const renderStep1 = () => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-5">
           Numero di Persone
        </label>
        <div className="flex items-center justify-between bg-brand-cream/50 p-2 rounded-2xl border border-brand-gold/5">
          <button 
            onClick={() => setGuests(Math.max(1, guests - 1))}
            className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-brand-cream transition-all text-brand-burgundy text-xl font-serif font-black border border-brand-gold/10"
          >-</button>
          <span className="text-3xl font-serif font-black text-brand-burgundy">{guests}</span>
          <button 
            onClick={() => setGuests(Math.min(20, guests + 1))}
            className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-brand-cream transition-all text-brand-burgundy text-xl font-serif font-black border border-brand-gold/10"
          >+</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-5">
           Data della Visita
        </label>
        <div className="relative">
          <CalendarDays size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" />
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-brand-cream/30 px-4 py-4 pl-12 rounded-2xl border border-brand-gold/5 focus:ring-2 focus:ring-brand-gold/20 font-serif font-bold text-brand-burgundy outline-none"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-5 text-center block w-full">
           Seleziona l'Orario
        </label>
        <div className="grid grid-cols-4 gap-3">
          {TIME_SLOTS.map(t => (
            <button
              key={t}
              onClick={() => setTime(t)}
              className={`py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all duration-500 ${
                time === t 
                  ? 'bg-brand-burgundy text-white shadow-lg shadow-brand-burgundy/20 scale-105' 
                  : 'bg-brand-cream text-brand-slate/40 hover:text-brand-burgundy border border-brand-gold/5'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
        <div className="text-center mb-2">
           <h3 className="font-serif text-brand-burgundy text-xl font-bold italic">Dove preferite accomodarvi?</h3>
        </div>
      {ZONES.map(z => (
        <label 
          key={z.id}
          className={`block relative overflow-hidden rounded-[2rem] transition-all duration-700 cursor-pointer border-2 shadow-sm ${
            zone?.id === z.id ? 'border-brand-gold shadow-xl shadow-brand-gold/10 scale-[1.03]' : 'border-transparent'
          }`}
        >
          <input 
            type="radio" 
            name="zone" 
            className="hidden" 
            onChange={() => setZone(z)} 
          />
          <div className="h-44 relative">
            <img src={z.image} alt={z.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-burgundy/90 via-transparent to-black/20"></div>
            
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div className="text-left">
                <h3 className="text-white font-serif font-black text-2xl tracking-tight leading-none mb-1">{z.name}</h3>
                <p className="text-white/70 text-[10px] uppercase font-black tracking-widest leading-none">{z.desc}</p>
              </div>
              {z.price > 0 && (
                <div className="bg-brand-gold/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black text-brand-burgundy uppercase tracking-widest">
                  +€{z.price}
                </div>
              )}
            </div>

            {zone?.id === z.id && (
              <div className="absolute top-6 right-6 bg-brand-gold text-brand-burgundy w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                <CheckCircle2 size={16} />
              </div>
            )}
          </div>
        </label>
      ))}
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-brand-gold/5 flex flex-col items-center">
        <div className="h-[1px] w-12 bg-brand-gold mb-6 opacity-30"></div>
        <h3 className="font-serif text-2xl font-black text-brand-burgundy mb-8">Dettagli Prenotazione</h3>
        
        <div className="w-full space-y-6 mb-10">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold">Data e Ora</span>
            <span className="font-serif text-xl font-bold text-brand-slate tracking-tight">{date} <span className="text-brand-burgundy mx-2">•</span> {time}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold">Ospiti e Area</span>
            <span className="font-serif text-xl font-bold text-brand-slate tracking-tight">{guests} Ospiti <span className="text-brand-burgundy mx-2">•</span> {zone.name}</span>
          </div>
        </div>

        <div className="w-full space-y-4 mb-6">
          <input type="text" required placeholder="Nome e Cognome" value={customerName} onChange={e => setCustomerName(e.target.value)}
            className="w-full bg-brand-cream/30 border border-brand-gold/10 rounded-2xl px-4 py-4 font-serif font-bold text-brand-burgundy outline-none focus:ring-2 focus:ring-brand-gold/20 placeholder:font-sans placeholder:font-medium placeholder:text-brand-slate/30 text-center" />
          <input type="email" required placeholder="email@esempio.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
            className="w-full bg-brand-cream/30 border border-brand-gold/10 rounded-2xl px-4 py-4 font-serif font-bold text-brand-burgundy outline-none focus:ring-2 focus:ring-brand-gold/20 placeholder:font-sans placeholder:font-medium placeholder:text-brand-slate/30 text-center" />
        </div>

        <div className="w-full bg-brand-cream/50 p-6 rounded-3xl border border-brand-gold/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-2 opacity-10"><Info size={40} /></div>
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest mb-3 text-brand-slate/40">
            <span>Quota confirmatoria</span>
            <span>€{guests * 10}</span>
          </div>
          {zone.price > 0 && (
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest mb-3 text-brand-slate/40">
              <span>Suppl. Location</span>
              <span>€{zone.price}</span>
            </div>
          )}
          <div className="mt-5 pt-5 border-t border-brand-gold/10 flex justify-between items-center">
            <span className="text-brand-burgundy font-serif font-black italic text-lg">Totale Caparra</span>
            <span className="text-3xl font-serif font-black text-brand-burgundy">€{totalCaparra}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderStep4 = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-brand-cream min-h-[70vh] flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div 
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="w-24 h-24 bg-brand-burgundy rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-brand-burgundy/20"
      >
        <CheckCircle2 size={48} className="text-white" />
      </motion.div>
      <h2 className="text-4xl font-serif font-black text-brand-burgundy mb-3 tracking-tight">Benvenuto al Riva!</h2>
      <p className="text-brand-slate/60 mb-10 max-w-[280px] font-bold text-sm uppercase tracking-wider leading-relaxed">
        La vostra tavola vi attende il <span className="text-brand-burgundy">{date}</span> alle <span className="text-brand-burgundy">{time}</span>.
      </p>
      
      {/* Premium QR Section */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-brand-gold/10 mb-10 w-full max-w-[280px]">
        <div className="h-[1px] w-8 bg-brand-gold mx-auto mb-4 opacity-30"></div>
        <p className="text-[9px] font-black text-brand-gold mb-5 uppercase tracking-[0.3em]">Codice Prenotazione</p>
        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=RIVA-RES-${Date.now()}&bgcolor=fdfcfb&color=8B1D23`} alt="QR Code" className="w-40 h-40 mx-auto rounded-xl grayscale-[0.2] transition-all hover:grayscale-0" />
      </div>

      <button 
        onClick={onBack}
        className="px-8 py-3 bg-brand-burgundy text-white rounded-full font-serif font-black text-lg shadow-lg active:scale-95 transition-all"
      >
        Torna alla Home
      </button>
    </motion.div>
  )


  return (
    <div className="bg-brand-cream min-h-screen font-sans max-w-md md:max-w-3xl lg:max-w-4xl mx-auto relative shadow-2xl md:shadow-none overflow-hidden border-x border-brand-gold/10 md:border-x-0">
      
      {/* HEADER HERO */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1000" 
          alt="Restaurant" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-cream via-brand-slate/10 to-black/30"></div>
        
        {step < 4 && (
          <button 
            onClick={step === 1 ? onBack : () => setStep(s => s - 1)}
            className="absolute top-6 left-6 z-10 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        
        <div className="absolute bottom-12 left-8 right-8 text-left">
          <div className="h-[1px] w-8 bg-brand-gold mb-3"></div>
          <h2 className="text-4xl font-serif font-black text-white px-0 tracking-tight leading-none">Restaurant</h2>
          <p className="text-white/80 text-[10px] uppercase font-black tracking-[0.3em] mt-2">Fine Dining Salentino</p>
        </div>

        {/* PROGRESS STEP INDICATOR */}
        {step < 4 && (
          <div className="absolute bottom-4 left-0 right-0 px-8">
             <div className="h-1 bg-white/10 rounded-full overflow-hidden flex gap-1">
                <div className={`h-full transition-all duration-700 ${step >= 1 ? 'bg-brand-gold w-1/3' : 'w-1/3 bg-transparent'}`}></div>
                <div className={`h-full transition-all duration-700 ${step >= 2 ? 'bg-brand-gold w-1/3' : 'w-1/3 bg-transparent'}`}></div>
                <div className={`h-full transition-all duration-700 ${step >= 3 ? 'bg-brand-gold w-1/3' : 'w-1/3 bg-transparent'}`}></div>
             </div>
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="px-6 md:px-10 py-10 relative z-20 pb-40 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && <motion.div key="step1">{renderStep1()}</motion.div>}
          {step === 2 && <motion.div key="step2">{renderStep2()}</motion.div>}
          {step === 3 && <motion.div key="step3">{renderStep3()}</motion.div>}
          {step === 4 && <motion.div key="step4" className="fixed inset-0 z-[60]">{renderStep4()}</motion.div>}
        </AnimatePresence>
      </div>

      {/* BOTTOM ACTION BAR */}
      {step < 4 && (
        <motion.div 
          initial={{ y: 100 }} animate={{ y: 0 }}
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg bg-white/95 backdrop-blur-md border-t border-brand-gold/10 p-6 pb-safe z-40 shadow-2xl"
        >
          <div className="max-w-md mx-auto">
            {step === 3 ? (
              <button 
                onClick={handleNext}
                className="w-full bg-brand-burgundy text-white rounded-2xl py-5 font-serif font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-brand-burgundy/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {submitting ? <Loader2 size={20} className="animate-spin" /> : <>Paga Caparra €{totalCaparra} <ChevronRight size={20} className="text-brand-gold" /></>}
              </button>
            ) : (
              <button 
                onClick={handleNext}
                disabled={(step === 1 && (!date || !time)) || (step === 2 && !zone)}
                className="w-full bg-brand-burgundy disabled:bg-brand-slate/10 disabled:text-brand-slate/20 text-white rounded-2xl py-5 font-serif font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-brand-burgundy/10"
              >
                Continua Esplorazione <ChevronRight size={20} className="text-brand-gold" />
              </button>
            )}
            <p className="text-center text-[8px] font-black uppercase tracking-[0.3em] text-brand-slate/30 mt-4">Transazione sicura via Riva Beach Concierge</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
