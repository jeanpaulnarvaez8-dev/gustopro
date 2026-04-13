import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Sunset, Star, Clock, MapPin, CheckCircle2, ChevronRight, Info, Loader2 } from 'lucide-react'
import { catalog, bookings } from './lib/api'

const TIME_SLOTS = ['18:00 - 19:30', '19:00 - 20:30', '19:30 - 21:00']

export default function RivaAperitivi({ onBack }) {
  const [APERITIVO_PACKAGES, setPackages] = useState([])
  const [ZONES, setZones] = useState([])
  const [step, setStep] = useState(1)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [guests, setGuests] = useState(2)
  const [time, setTime] = useState('')
  const [zone, setZone] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [orderComplete, setOrderComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    catalog.aperitivoPackages().then(pkgs => {
      setPackages(pkgs.map(p => ({ id: p.id, name: p.name, desc: p.description || '', price: Number(p.price), popular: p.isPopular, image: p.imageUrl || '' })))
    })
    catalog.zones('APERITIVO').then(zones => {
      setZones(zones.map(z => ({ id: z.id, name: z.name, desc: z.description || '', price: Number(z.supplement) })))
    })
  }, [])

  const handleNext = async () => {
    if (step === 1 && !selectedPackage) return
    if (step === 2 && (!time || !zone)) return
    if (step === 3) {
      if (!customerName || !customerEmail) return
      setSubmitting(true)
      try {
        const today = new Date().toISOString().split('T')[0]
        await bookings.aperitivo({ name: customerName, email: customerEmail, date: today, timeSlot: time, guests, packageId: selectedPackage.id, zoneId: zone })
        setOrderComplete(true)
        setTimeout(() => { setOrderComplete(false); onBack() }, 3500)
      } catch (err) {
        console.error('Booking failed:', err)
      } finally {
        setSubmitting(false)
      }
      return
    }
    setStep(s => s + 1)
  }

  const pkgPrice = selectedPackage?.price || 0
  const zonePrice = ZONES.find(z => z.id === zone)?.price || 0
  const total = (pkgPrice * guests) + zonePrice

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-8 text-center animate-fade-in text-brand-slate">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-brand-burgundy rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-brand-burgundy/30"
        >
          <Sunset size={48} className="text-white" />
        </motion.div>
        <h2 className="text-4xl font-serif font-black text-brand-burgundy mb-4 tracking-tight">Sunset Reserved</h2>
        <p className="text-brand-slate/60 font-bold text-xs uppercase tracking-[0.3em] mb-12 max-w-[280px] leading-relaxed">
          Il tuo tavolo per goderti il tramonto è riservato. <br/>Ti aspettiamo al Riva.
        </p>
        <button onClick={onBack} className="px-10 py-4 bg-brand-burgundy text-white rounded-full font-serif font-black text-lg shadow-xl active:scale-95 transition-all">
          Torna alla Home
        </button>
      </div>
    )
  }

  return (
    <div className="bg-brand-cream min-h-screen font-sans max-w-md md:max-w-3xl lg:max-w-4xl mx-auto relative shadow-2xl md:shadow-none overflow-hidden border-x border-brand-gold/10 md:border-x-0 text-brand-slate">
      
      {/* HEADER HERO */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=1000" 
          alt="Aperitivo" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-cream via-brand-burgundy/10 to-black/30"></div>
        
        <button 
          onClick={step === 1 ? onBack : () => setStep(s => s - 1)}
          className="absolute top-6 left-6 z-10 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="absolute bottom-12 left-8 right-8 text-left">
          <div className="h-[1px] w-8 bg-brand-gold mb-3"></div>
          <h2 className="text-4xl font-serif font-black text-white px-0 tracking-tight leading-none italic">Aperitivi</h2>
          <p className="text-white/80 text-[10px] uppercase font-black tracking-[0.4em] mt-2">The Sunset Experience</p>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="absolute bottom-4 left-0 right-0 px-8 flex gap-1">
           <div className={`h-1 flex-1 transition-all duration-700 ${step >= 1 ? 'bg-brand-gold' : 'bg-white/10'}`}></div>
           <div className={`h-1 flex-1 transition-all duration-700 ${step >= 2 ? 'bg-brand-gold' : 'bg-white/10'}`}></div>
           <div className={`h-1 flex-1 transition-all duration-700 ${step >= 3 ? 'bg-brand-gold' : 'bg-white/10'}`}></div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="px-6 md:px-10 py-10 relative z-20 pb-40 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: SCEGLI IL PACCHETTO */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
              <div className="text-center mb-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">Seleziona Esperienza</p>
              </div>
              
              {APERITIVO_PACKAGES.map(pkg => (
                <label 
                  key={pkg.id}
                  className={`block relative overflow-hidden rounded-[2.5rem] transition-all duration-700 cursor-pointer bg-white border shadow-sm ${
                    selectedPackage?.id === pkg.id ? 'border-brand-gold shadow-2xl shadow-brand-gold/10 scale-[1.02]' : 'border-brand-gold/5'
                  }`}
                >
                  <input type="radio" name="package" className="hidden" onChange={() => setSelectedPackage(pkg)} />
                  <div className="h-40 relative">
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-burgundy/90 via-transparent to-black/20"></div>
                    {pkg.popular && (
                      <div className="absolute top-4 right-4 bg-brand-gold text-brand-burgundy text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <Star size={12} className="fill-brand-burgundy" /> Best Choice
                      </div>
                    )}
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <h3 className="text-white font-serif font-black text-2xl tracking-tight leading-none italic">{pkg.name}</h3>
                      <span className="text-brand-gold font-serif font-black text-xl italic drop-shadow-md">€{pkg.price}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-brand-slate/50 leading-relaxed font-bold uppercase tracking-wider">{pkg.desc}</p>
                    {selectedPackage?.id === pkg.id && (
                      <div className="mt-4 flex items-center gap-2 text-brand-burgundy font-black text-[10px] uppercase tracking-widest">
                        <CheckCircle2 size={14} /> Pacchetto Selezionato
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </motion.div>
          )}

          {/* STEP 2: DETTAGLI PRENOTAZIONE */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-8">
              
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-gold/5 text-center">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-6 block">Quanti Ospiti?</label>
                <div className="flex items-center justify-between bg-brand-cream/50 p-2 rounded-2xl border border-brand-gold/5 max-w-[200px] mx-auto">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-12 h-12 bg-white rounded-xl shadow-sm border border-brand-gold/10 text-xl font-serif font-black text-brand-burgundy">-</button>
                  <span className="text-3xl font-serif font-black text-brand-burgundy">{guests}</span>
                  <button onClick={() => setGuests(Math.min(15, guests + 1))} className="w-12 h-12 bg-white rounded-xl shadow-sm border border-brand-gold/10 text-xl font-serif font-black text-brand-burgundy">+</button>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-gold/5">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-6 block text-center">Scegli la Fascia Oraria</label>
                <div className="grid gap-4">
                  {TIME_SLOTS.map(t => (
                    <label key={t} className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all duration-500 cursor-pointer ${time === t ? 'border-brand-burgundy bg-brand-burgundy/5' : 'border-brand-gold/5 hover:border-brand-gold/20'}`}>
                      <span className={`font-serif font-bold text-lg ${time === t ? 'text-brand-burgundy' : 'text-brand-slate/60'}`}>{t}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${time === t ? 'border-brand-burgundy bg-brand-burgundy' : 'border-brand-gold/20'}`}>
                         {time === t && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <input type="radio" name="time" className="hidden" onChange={() => setTime(t)} checked={time === t} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-gold/5">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-6 block text-center">Preferenza Area</label>
                <div className="grid gap-4">
                  {ZONES.map(z => (
                    <label key={z.id} className={`p-5 rounded-[1.5rem] border-2 transition-all duration-500 cursor-pointer ${zone === z.id ? 'border-brand-burgundy bg-brand-burgundy/5 shadow-lg shadow-brand-burgundy/5' : 'border-brand-gold/5'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-serif font-bold text-lg ${zone === z.id ? 'text-brand-burgundy' : 'text-brand-slate'}`}>{z.name}</span>
                        <input type="radio" name="zone" className="hidden" onChange={() => setZone(z.id)} checked={zone === z.id} />
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                        <span className="text-brand-slate/40 italic">{z.desc}</span>
                        {z.price > 0 && <span className="text-brand-gold font-black">+€{z.price}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* STEP 3: RIEPILOGO & CHECKOUT */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-brand-gold/5 relative overflow-hidden flex flex-col items-center">
                <div className="h-[1px] w-12 bg-brand-gold mb-8 opacity-30"></div>
                <h3 className="font-serif text-3xl font-black text-brand-burgundy mb-10 italic">Riepilogo</h3>
                
                <div className="w-full space-y-8 mb-12">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.3em]">Esperienza</span>
                    <span className="font-serif text-2xl font-bold text-brand-burgundy italic text-center leading-tight">{selectedPackage.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-brand-gold/10 pt-6">
                    <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em]">Ospiti</span>
                    <span className="font-serif text-xl font-bold text-brand-slate">{guests} Persone</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-brand-gold/10 pt-6">
                    <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em]">Orario</span>
                    <span className="font-serif text-xl font-bold text-brand-slate">{time}</span>
                  </div>
                </div>

                <div className="w-full bg-brand-burgundy text-white p-8 rounded-[2rem] relative shadow-2xl shadow-brand-burgundy/20 mt-4">
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest mb-4 opacity-50">
                    <span>Package Total</span>
                    <span>€{(pkgPrice * guests).toFixed(2)}</span>
                  </div>
                  {zonePrice > 0 && (
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest mb-6 opacity-50">
                      <span>Area Upgrade</span>
                      <span>€{zonePrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-6 border-t border-white/10 flex justify-between items-center font-serif font-black text-3xl italic">
                    <span className="text-brand-gold">Totale</span>
                    <span className="text-white">€{total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="w-full space-y-4 mt-8">
                  <input type="text" required placeholder="Nome e Cognome" value={customerName} onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 rounded-2xl px-4 py-4 font-serif font-bold text-brand-burgundy outline-none focus:ring-2 focus:ring-brand-gold/20 placeholder:font-sans placeholder:font-medium placeholder:text-brand-slate/30 text-center" />
                  <input type="email" required placeholder="email@esempio.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 rounded-2xl px-4 py-4 font-serif font-bold text-brand-burgundy outline-none focus:ring-2 focus:ring-brand-gold/20 placeholder:font-sans placeholder:font-medium placeholder:text-brand-slate/30 text-center" />
                </div>
                <p className="text-[8px] text-brand-slate/30 font-black uppercase tracking-[0.3em] mt-4 flex justify-center items-center gap-2">
                   Pagamento in loco presso Riva Beach Salento
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* BOTTOM ACTION BAR */}
      <motion.div 
        initial={{ y: 100 }} animate={{ y: 0 }}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg bg-white/95 backdrop-blur-md border-t border-brand-gold/10 p-6 pb-safe z-[45] shadow-2xl"
      >
        <div className="max-w-md mx-auto">
          {step === 3 ? (
            <button 
              onClick={handleNext}
              className="w-full bg-brand-burgundy text-white rounded-2xl py-5 font-serif font-black text-xl hover:bg-black transition-all shadow-xl shadow-brand-burgundy/30 active:scale-95 flex items-center justify-center gap-3"
            >
              {submitting ? <Loader2 size={20} className="animate-spin" /> : <>Conferma Sunset <ChevronRight size={20} className="text-brand-gold" /></>}
            </button>
          ) : (
            <button 
              onClick={handleNext}
              disabled={(step === 1 && !selectedPackage) || (step === 2 && (!time || !zone))}
              className="w-full bg-brand-burgundy disabled:bg-brand-slate/10 disabled:text-brand-slate/20 text-white rounded-2xl py-5 font-serif font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-brand-burgundy/20"
            >
              {step === 1 ? 'Personalizza' : 'Rivedi Dettagli'} <ChevronRight size={20} className="text-brand-gold" />
            </button>
          )}
        </div>
      </motion.div>

    </div>
  )
}
