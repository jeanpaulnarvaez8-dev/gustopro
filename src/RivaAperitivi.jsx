import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Sunset, Star, Clock, MapPin, CheckCircle2, ChevronRight, Info } from 'lucide-react'

// Mock Data for sunset packages
const APERITIVO_PACKAGES = [
  { 
    id: 'gold', 
    name: 'Golden Hour Experience', 
    desc: 'Calice di Franciacorta o cocktail a scelta, accompagnato da un plateau royale di crudi di mare e finger food gourmet.', 
    price: 35.00, 
    popular: true,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600&h=400' 
  },
  { 
    id: 'classic', 
    name: 'Riva Sunset Classic', 
    desc: 'Due drink a scelta dalla nostra drink list e tagliere selezione di salumi e formaggi del territorio con focaccia calda.', 
    price: 25.00, 
    popular: false,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=600&h=400' 
  },
  { 
    id: 'sushi', 
    name: 'Sushi & Bubbles', 
    desc: 'Bottiglia di Prosecco Valdobbiadene DOCG e barca di sushi misto (24 pezzi) preparato dal nostro Master Sushi Chef.', 
    price: 60.00, 
    popular: false,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=600&h=400' 
  }
]

const TIME_SLOTS = ['18:00 - 19:30', '19:00 - 20:30', '19:30 - 21:00']
const ZONES = [
  { id: 'front', name: 'Prima Fila Mare', desc: 'Sulla sabbia, in prima fila', price: 10 },
  { id: 'terrace', name: 'Lounge Terrazza', desc: 'Area rialzata con divanetti', price: 0 }
]

export default function RivaAperitivi({ onBack }) {
  const [step, setStep] = useState(1) // 1: Pacchetto, 2: Dettagli (Ora/Zona/Pax), 3: Riepilogo
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [guests, setGuests] = useState(2)
  const [time, setTime] = useState('')
  const [zone, setZone] = useState('')
  const [orderComplete, setOrderComplete] = useState(false)

  const handleNext = () => {
    if (step === 1 && !selectedPackage) return
    if (step === 2 && (!time || !zone)) return
    if (step === 3) {
      setOrderComplete(true)
      setTimeout(() => {
        setOrderComplete(false)
        onBack()
      }, 3500)
      return
    }
    setStep(s => s + 1)
  }

  const pkgPrice = selectedPackage?.price || 0
  const zonePrice = ZONES.find(z => z.id === zone)?.price || 0
  const total = (pkgPrice * guests) + zonePrice

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-rose-600 flex flex-col items-center justify-center p-6 text-center animate-fade-in text-white">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6"
        >
          <Sunset size={48} className="text-rose-600" />
        </motion.div>
        <h2 className="text-3xl font-black mb-2">Aperitivo Confermato!</h2>
        <p className="text-rose-100 mb-8 max-w-[280px]">
          Il tuo tavolo per goderti il tramonto è riservato. Presentati in reception all'orario scelto.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-neutral-50 min-h-screen font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* HEADER HERO */}
      <div className="bg-rose-600 text-white p-6 pb-20 rounded-b-[2rem] relative overflow-hidden shadow-lg">
        {/* Abstract sunset glow background */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-orange-400/40 rounded-full blur-[80px]"></div>
        <div className="absolute top-10 -left-10 w-40 h-40 bg-pink-500/40 rounded-full blur-[60px]"></div>
        
        <button 
          onClick={step === 1 ? onBack : () => setStep(s => s - 1)}
          className="relative z-10 mb-6 flex items-center gap-1 text-sm font-medium text-rose-200 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} /> {step === 1 ? 'Home' : 'Indietro'}
        </button>
        
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Riva Aperitivi</h2>
          <p className="text-rose-100 text-sm md:text-base font-medium flex items-center gap-2">
            <Sunset size={16} /> Goditi il tramonto perfetto
          </p>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="absolute bottom-6 left-6 flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? 'w-8 bg-white' : 'w-4 bg-rose-400/50'}`}></div>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="px-4 mt-4 relative z-20 pb-32">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: SCEGLI IL PACCHETTO */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="font-bold text-neutral-500 px-2 text-sm uppercase tracking-wider mb-2">Scegli la tua esperienza</h3>
              
              {APERITIVO_PACKAGES.map(pkg => (
                <label 
                  key={pkg.id}
                  className={`block relative overflow-hidden rounded-3xl transition-all cursor-pointer bg-white border-2 ${
                    selectedPackage?.id === pkg.id ? 'border-rose-500 shadow-xl scale-[1.02]' : 'border-transparent shadow-sm hover:shadow-md'
                  }`}
                >
                  <input type="radio" name="package" className="hidden" onChange={() => setSelectedPackage(pkg)} />
                  <div className="h-32 relative">
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    {pkg.popular && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-400 to-rose-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <Star size={12} className="fill-white" /> Più richiesto
                      </div>
                    )}
                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                      <h3 className="text-white font-black text-xl leading-tight w-2/3">{pkg.name}</h3>
                      <span className="text-white font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl">€{pkg.price} <span className="text-[10px] font-normal opacity-80">/pax</span></span>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-sm text-neutral-500 leading-relaxed font-medium">{pkg.desc}</p>
                    {selectedPackage?.id === pkg.id && (
                      <div className="mt-3 flex items-center gap-2 text-rose-600 font-bold text-sm">
                        <CheckCircle2 size={16} /> Selezionato
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </motion.div>
          )}

          {/* STEP 2: DETTAGLI PRENOTAZIONE */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
                <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><Sunset size={18} className="text-rose-500"/> Quante persone?</h4>
                <div className="flex items-center justify-between bg-neutral-50 p-2 rounded-2xl">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-12 h-12 bg-white rounded-xl shadow-sm text-xl font-medium">-</button>
                  <span className="text-2xl font-black">{guests}</span>
                  <button onClick={() => setGuests(Math.min(15, guests + 1))} className="w-12 h-12 bg-white rounded-xl shadow-sm text-xl font-medium">+</button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
                <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><Clock size={18} className="text-rose-500"/> Orario di arrivo</h4>
                <div className="grid gap-3">
                  {TIME_SLOTS.map(t => (
                    <label key={t} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${time === t ? 'border-rose-500 bg-rose-50/50' : 'border-neutral-100 hover:border-rose-200'}`}>
                      <span className={`font-bold ${time === t ? 'text-rose-700' : 'text-neutral-700'}`}>{t}</span>
                      <input type="radio" name="time" className="w-5 h-5 accent-rose-500" onChange={() => setTime(t)} checked={time === t} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
                <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><MapPin size={18} className="text-rose-500"/> Scegli la location</h4>
                <div className="grid gap-3">
                  {ZONES.map(z => (
                    <label key={z.id} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${zone === z.id ? 'border-rose-500 bg-rose-50/50' : 'border-neutral-100'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-bold ${zone === z.id ? 'text-rose-700' : 'text-neutral-900'}`}>{z.name}</span>
                        <input type="radio" name="zone" className="w-5 h-5 accent-rose-500" onChange={() => setZone(z.id)} checked={zone === z.id} />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-500">{z.desc}</span>
                        {z.price > 0 && <span className="font-bold text-rose-600">+€{z.price}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* STEP 3: RIEPILOGO & CHECKOUT */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-[100px] -z-10"></div>
                
                <h3 className="font-black text-2xl mb-6 text-neutral-900">Riepilogo</h3>
                
                <div className="space-y-5 mb-8 relative z-10">
                  <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                    <div>
                      <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block mb-1">Esperienza Scelta</span>
                      <span className="font-bold text-neutral-900 text-lg">{selectedPackage.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-medium">Data e Ora</span>
                    <span className="font-bold text-neutral-900">Oggi • {time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-medium">Ospiti</span>
                    <span className="font-bold text-neutral-900">{guests} Persone</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-medium">Location</span>
                    <span className="font-bold text-neutral-900">{ZONES.find(z => z.id === zone)?.name}</span>
                  </div>
                </div>

                <div className="bg-neutral-900 text-white p-5 rounded-2xl relative z-10 shadow-xl shadow-rose-900/10">
                  <div className="flex justify-between items-center text-sm mb-3 text-neutral-300">
                    <span>{guests}x {selectedPackage.name}</span>
                    <span>€{pkgPrice * guests}</span>
                  </div>
                  {zonePrice > 0 && (
                    <div className="flex justify-between items-center text-sm mb-4 text-neutral-300">
                      <span>Supplemento Area ({ZONES.find(z => z.id === zone)?.name})</span>
                      <span>€{zonePrice}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-neutral-700 flex justify-between items-center font-black text-xl">
                    <span>Totale</span>
                    <span className="text-rose-400">€{total.toFixed(2)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-neutral-400 text-center flex justify-center items-center gap-1 mt-4">
                  <Info size={14} /> Nessun addebito anticipato. Paga al locale.
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* BOTTOM ACTION BAR */}
      <motion.div 
        initial={{ y: 100 }} animate={{ y: 0 }}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-neutral-100/50 p-4 pb-safe z-40"
      >
        <div className="max-w-md mx-auto">
          {step === 3 ? (
            <button 
              onClick={handleNext}
              className="w-full bg-rose-600 text-white rounded-2xl p-4 font-bold text-lg hover:bg-rose-700 transition shadow-lg shadow-rose-600/30 active:scale-[0.98]"
            >
              Prenota il tuo Aperitivo
            </button>
          ) : (
            <button 
              onClick={handleNext}
              disabled={(step === 1 && !selectedPackage) || (step === 2 && (!time || !zone))}
              className="w-full bg-neutral-900 disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded-2xl p-4 font-bold text-lg flex items-center justify-center gap-2 transition hover:bg-black"
            >
              {step === 1 ? 'Configura Prenotazione' : 'Vai al Riepilogo'} <ChevronRight size={20} />
            </button>
          )}
        </div>
      </motion.div>

    </div>
  )
}
