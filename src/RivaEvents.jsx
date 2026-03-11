import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, PartyPopper, Calendar, Users, Send, CheckCircle2, ChevronRight, MessageSquare, GlassWater, Utensils } from 'lucide-react'

const EVENT_TYPES = [
  { id: 'birthday', name: 'Compleanno in Spiaggia', icon: PartyPopper, desc: 'Festeggia il tuo giorno speciale con i piedi nella sabbia.', image: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: 'wedding', name: 'Matrimonio & Cerimonie', icon: Heart, desc: 'Il tuo "Sì" guardando il mare di Punta Prosciutto.', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: 'corporate', name: 'Evento Aziendale', icon: Users, desc: 'Team building e meeting con vista mozzafiato.', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800&h=600' }
]

function Heart(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> }

export default function RivaEvents({ onBack }) {
  const [step, setStep] = useState(1) // 1: Tipo, 2: Dettagli, 3: Inviato
  const [selectedType, setSelectedType] = useState(null)
  const [eventDate, setEventDate] = useState('')
  const [eventGuests, setEventGuests] = useState(20)
  const [comment, setComment] = useState('')

  const handleNext = () => {
    if (step === 1 && !selectedType) return
    if (step === 2) {
      setStep(3)
      setTimeout(() => {
        onBack()
      }, 5000)
      return
    }
    setStep(s => s + 1)
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-purple-600 flex flex-col items-center justify-center p-6 text-center animate-fade-in text-white max-w-md mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-pink-500/30 rounded-full blur-[100px] -z-10"></div>
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white text-neutral-900 rounded-[2.5rem] p-10 shadow-2xl relative"
        >
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send size={40} className="text-purple-600" />
          </div>
          <h2 className="text-3xl font-black mb-4 tracking-tight">Richiesta Inviata!</h2>
          <p className="text-neutral-500 mb-8 font-medium">Il nostro Event Manager analizzerà i tuoi dettagli e ti ricontatterà entro 24 ore per un preventivo personalizzato.</p>
          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 5 }}
              className="h-full bg-purple-600"
            />
          </div>
          <p className="mt-4 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Verrai reindirizzato alla home...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-50 min-h-screen font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden selection:bg-purple-200">
      
      {/* HEADER HERO */}
      <div className="bg-purple-600 text-white p-6 pb-20 rounded-b-[2rem] relative z-20 shadow-lg">
        <div className="absolute right-0 top-0 w-64 h-64 bg-pink-500/20 rounded-full blur-[70px]"></div>
        
        <button onClick={step === 1 ? onBack : () => setStep(1)} className="relative z-10 mb-6 flex items-center gap-1 text-sm font-medium text-purple-100 hover:text-white transition-colors">
          <ChevronLeft size={18} /> {step === 1 ? 'Home' : 'Indietro'}
        </button>
        
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Riva Eventi</h2>
          <p className="text-purple-100 text-sm font-medium flex items-center gap-2">
            <PartyPopper size={16} /> Momenti indimenticabili
          </p>
        </div>

        {/* PROGRESS */}
        <div className="absolute bottom-6 left-6 flex gap-2">
          {[1, 2].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? 'w-10 bg-white' : 'w-5 bg-purple-400/50'}`}></div>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="px-4 -mt-8 relative z-20 pb-32">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="font-bold text-neutral-500 px-2 text-sm uppercase tracking-wider mb-2">Che tipo di evento stai pianificando?</h3>
              {EVENT_TYPES.map(type => {
                const Icon = type.icon
                return (
                  <label key={type.id} className={`block bg-white rounded-[2rem] overflow-hidden border-2 transition-all cursor-pointer ${selectedType?.id === type.id ? 'border-purple-500 shadow-xl scale-[1.02]' : 'border-transparent shadow-sm'}`}>
                    <input type="radio" name="event" className="hidden" onChange={() => setSelectedType(type)} />
                    <div className="h-40 relative">
                      <img src={type.image} alt={type.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-5 right-5">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={20} className="text-purple-400" />
                          <h3 className="text-white font-black text-xl">{type.name}</h3>
                        </div>
                        <p className="text-white/70 text-xs leading-snug">{type.desc}</p>
                      </div>
                    </div>
                  </label>
                )
              })}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-neutral-100">
                <h4 className="font-bold text-neutral-900 mb-6 border-b border-neutral-100 pb-2">Dettagli dell'evento</h4>
                
                <div className="space-y-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 mb-2"><Calendar size={16} className="text-purple-500" /> Data Indicativa</label>
                    <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 font-medium" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 mb-2"><Users size={16} className="text-purple-500" /> Invitati Stimati</label>
                    <div className="flex items-center justify-between bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-200">
                      <button onClick={() => setEventGuests(Math.max(10, eventGuests - 5))} className="text-neutral-500 w-8 h-8 flex items-center justify-center text-xl hover:text-black">-</button>
                      <span className="font-bold text-lg">{eventGuests}</span>
                      <button onClick={() => setEventGuests(eventGuests + 5)} className="text-neutral-500 w-8 h-8 flex items-center justify-center text-xl hover:text-black">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 mb-2"><MessageSquare size={16} className="text-purple-500" /> Note Extra</label>
                    <textarea 
                      placeholder="Esempio: Buffet di pesce, open bar, musica lounge..." 
                      value={comment} onChange={e => setComment(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 font-medium h-24 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-neutral-100">
                  <Utensils size={20} className="text-purple-500" />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider leading-tight">Catering<br/><span className="text-neutral-900">Incluso</span></span>
                </div>
                <div className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-neutral-100">
                  <GlassWater size={20} className="text-purple-500" />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider leading-tight">Servizio Bar<br/><span className="text-neutral-900">Premium</span></span>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* BOTTOM ACTION BAR */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-neutral-100 p-4 pb-safe z-40">
        <button 
          onClick={handleNext}
          disabled={step === 1 ? !selectedType : !eventDate}
          className="w-full bg-purple-600 disabled:bg-neutral-200 text-white rounded-2xl p-4 font-bold text-lg flex items-center justify-center gap-2 hover:bg-purple-700 transition shadow-lg shadow-purple-600/20"
        >
          {step === 1 ? 'Configura Evento' : 'Richiedi Preventivo'} <ChevronRight size={20} />
        </button>
      </motion.div>

    </div>
  )
}
