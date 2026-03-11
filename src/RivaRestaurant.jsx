import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, CalendarDays, Users, Clock, Info, CheckCircle2, ChevronRight, CreditCard } from 'lucide-react'

const TIME_SLOTS = ['12:30', '13:00', '13:30', '14:00', '14:30', '19:30', '20:00', '20:30', '21:00', '21:30']
const ZONES = [
  { id: 'terrazza', name: 'Terrazza Panoramica', desc: 'Vista mare frontale, brezza marina', price: 10, image: 'https://images.unsplash.com/photo-1537047902294-62aa40a45ab6?auto=format&fit=crop&q=80&w=400&h=300' },
  { id: 'sala', name: 'Sala Interna Elegant', desc: 'Aria condizionata, atmosfera intima', price: 0, image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=400&h=300' }
]

export default function RivaRestaurant({ onBack }) {
  const [step, setStep] = useState(1) // 1: Dettagli, 2: Zona, 3: Checkout, 4: Successo
  const [guests, setGuests] = useState(2)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [zone, setZone] = useState(null)
  
  const caparraPerPersona = 10
  const totalCaparra = guests * caparraPerPersona + (zone?.price || 0)

  const handleNext = () => {
    if (step === 1 && (!date || !time)) return
    if (step === 2 && !zone) return
    setStep(s => s + 1)
  }

  // --- RENDERING STEPS ---

  const renderStep1 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100">
        <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 mb-4">
          <Users size={18} className="text-blue-500" /> Numero di Persone
        </label>
        <div className="flex items-center justify-between bg-neutral-50 p-2 rounded-2xl">
          <button 
            onClick={() => setGuests(Math.max(1, guests - 1))}
            className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-neutral-100 transition-colors text-xl font-medium"
          >-</button>
          <span className="text-2xl font-black">{guests}</span>
          <button 
            onClick={() => setGuests(Math.min(20, guests + 1))}
            className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-neutral-100 transition-colors text-xl font-medium"
          >+</button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100">
        <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 mb-4">
          <CalendarDays size={18} className="text-blue-500" /> Data
        </label>
        <input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full bg-neutral-50 px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
        />
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100">
        <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 mb-4">
          <Clock size={18} className="text-blue-500" /> Orario
        </label>
        <div className="grid grid-cols-4 gap-2">
          {TIME_SLOTS.map(t => (
            <button
              key={t}
              onClick={() => setTime(t)}
              className={`py-2 rounded-xl text-sm font-medium transition-all ${
                time === t 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
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
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {ZONES.map(z => (
        <label 
          key={z.id}
          className={`block relative overflow-hidden rounded-3xl transition-all cursor-pointer border-2 ${
            zone?.id === z.id ? 'border-blue-500 shadow-lg scale-[1.02]' : 'border-transparent shadow-sm'
          }`}
        >
          <input 
            type="radio" 
            name="zone" 
            className="hidden" 
            onChange={() => setZone(z)} 
          />
          <div className="h-40 relative">
            <img src={z.image} alt={z.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            {z.price > 0 && (
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-neutral-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                +€{z.price} suppl.
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-bold text-lg mb-1">{z.name}</h3>
              <p className="text-white/80 text-xs">{z.desc}</p>
            </div>
            {zone?.id === z.id && (
              <div className="absolute top-4 left-4 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
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
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
        <h3 className="font-black text-xl mb-6 border-b border-neutral-100 pb-4">Riepilogo Prenotazione</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500">Data e Ora</span>
            <span className="font-bold text-neutral-900">{date} alle {time}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500">Persone</span>
            <span className="font-bold text-neutral-900">{guests} Ospiti</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500">Area Scelta</span>
            <span className="font-bold text-neutral-900">{zone.name}</span>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl mb-2">
          <div className="flex justify-between items-center text-sm font-medium mb-2">
            <span className="text-blue-900">Caparra confirmatoria ({guests}x10€)</span>
            <span className="text-blue-900">€{guests * 10}</span>
          </div>
          {zone.price > 0 && (
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-blue-900">Supplemento Area</span>
              <span className="text-blue-900">€{zone.price}</span>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-blue-200 flex justify-between items-center font-black text-lg">
            <span className="text-blue-900">Totale da pagare ora</span>
            <span className="text-blue-600">€{totalCaparra}</span>
          </div>
        </div>
        <p className="text-[10px] text-neutral-400 text-center flex items-center justify-center gap-1 mt-3">
          <Info size={12} /> La caparra verrà detratta dal conto finale.
        </p>
      </div>
    </motion.div>
  )

  const renderStep4 = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-xl text-center border border-neutral-100 flex flex-col items-center justify-center min-h-[60vh] mt-8"
    >
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 size={48} className="text-blue-600" />
      </div>
      <h2 className="text-3xl font-black text-neutral-900 mb-2">Confermata!</h2>
      <p className="text-neutral-500 mb-8 max-w-[250px] mx-auto">
        Ti aspettiamo il {date} alle {time} nella {zone.name}.
      </p>
      
      {/* Fake QR Code */}
      <div className="bg-neutral-50 p-4 rounded-2xl mb-8">
        <p className="text-xs font-bold text-neutral-400 mb-3 uppercase tracking-wider">Mostra per il Check-in</p>
        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=RIVA-RES-${Date.now()}&bgcolor=f8fafc`} alt="QR Code" className="w-32 h-32 mx-auto rounded-lg mix-blend-multiply" />
      </div>

      <button 
        onClick={onBack}
        className="text-blue-600 font-bold hover:underline"
      >
        Torna alla Home
      </button>
    </motion.div>
  )


  return (
    <div className="bg-neutral-50 min-h-screen font-sans">
      {/* HEADER HERO */}
      <div className="bg-blue-900 text-white p-6 pb-24 rounded-b-[2rem] relative overflow-hidden shadow-lg">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px]"></div>
        <div className="absolute top-1/2 left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[60px]"></div>
        
        {step < 4 && (
          <button 
            onClick={step === 1 ? onBack : () => setStep(s => s - 1)}
            className="relative z-10 mb-6 flex items-center gap-1 text-sm font-medium text-blue-200 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} /> {step === 1 ? 'Home' : 'Indietro'}
          </button>
        )}
        
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Restaurant</h2>
          <p className="text-blue-200 text-sm md:text-base font-medium">
            Esperienza culinaria vista mare
          </p>
        </div>

        {/* PROGRESS BAR */}
        {step < 4 && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${step >= 1 ? 'text-white' : 'text-blue-400/50'}`}>Dettagli</span>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${step >= 2 ? 'text-white' : 'text-blue-400/50'}`}>Area</span>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${step >= 3 ? 'text-white' : 'text-blue-400/50'}`}>Pagamento</span>
            </div>
            <div className="h-1.5 bg-blue-950 rounded-full overflow-hidden flex">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: '33%' }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="px-4 -mt-8 relative z-20 pb-32">
        <AnimatePresence mode="wait">
          {step === 1 && <motion.div key="step1">{renderStep1()}</motion.div>}
          {step === 2 && <motion.div key="step2">{renderStep2()}</motion.div>}
          {step === 3 && <motion.div key="step3">{renderStep3()}</motion.div>}
          {step === 4 && <motion.div key="step4" className="-mt-16">{renderStep4()}</motion.div>}
        </AnimatePresence>
      </div>

      {/* BOTTOM ACTION BAR */}
      {step < 4 && (
        <motion.div 
          initial={{ y: 100 }} animate={{ y: 0 }}
          className="fixed bottom-0 left-0 w-full bg-white border-t border-neutral-100 p-4 pb-safe z-40"
        >
          <div className="max-w-md mx-auto">
            {step === 3 ? (
              <button 
                onClick={handleNext}
                className="w-full bg-blue-600 text-white rounded-2xl p-4 font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
              >
                <CreditCard size={20} /> Paga Caparra (€{totalCaparra})
              </button>
            ) : (
              <button 
                onClick={handleNext}
                disabled={(step === 1 && (!date || !time)) || (step === 2 && !zone)}
                className="w-full bg-neutral-900 disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded-2xl p-4 font-bold text-lg flex items-center justify-center gap-2 transition"
              >
                Continua <ChevronRight size={20} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
