import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, PartyPopper, Calendar, Users, Send, CheckCircle2, ChevronRight, MessageSquare, GlassWater, Utensils, Loader2 } from 'lucide-react'
import { bookings } from './lib/api'

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
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleNext = async () => {
    if (step === 1 && !selectedType) return
    if (step === 2) {
      if (!customerName || !customerEmail || !eventDate) return
      setSubmitting(true)
      try {
        await bookings.events({
          name: customerName,
          email: customerEmail,
          date: eventDate,
          eventType: selectedType.name,
          eventGuests,
          specialRequests: comment
        })
        setStep(3)
        setTimeout(() => { onBack() }, 5000)
      } catch (err) {
        console.error('Event booking failed:', err)
        alert('Errore nell\'invio della richiesta. Riprova.')
      } finally {
        setSubmitting(false)
      }
      return
    }
    setStep(s => s + 1)
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-8 text-center animate-fade-in text-brand-slate max-w-md mx-auto relative overflow-hidden">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white text-brand-slate rounded-[3rem] p-12 shadow-2xl relative border border-brand-gold/10"
        >
          <div className="w-24 h-24 bg-brand-burgundy rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl">
            <Send size={48} className="text-white" />
          </div>
          <h2 className="text-4xl font-serif font-black mb-6 text-brand-burgundy italic">Richiesta Inviata</h2>
          <p className="text-brand-slate/60 text-[10px] uppercase font-black tracking-widest leading-relaxed mb-12">
            Il nostro Event Manager analizzerà i vostri dettagli e vi ricontatterà entro 24 ore.
          </p>
          <div className="h-[2px] w-full bg-brand-gold/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 5 }}
              className="h-full bg-brand-burgundy"
            />
          </div>
          <p className="mt-6 text-[8px] text-brand-gold font-black uppercase tracking-[0.4em]">Redirecting to Home...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="bg-brand-cream min-h-screen font-sans max-w-md md:max-w-3xl lg:max-w-4xl mx-auto relative shadow-2xl md:shadow-none overflow-hidden border-x border-brand-gold/10 md:border-x-0 text-brand-slate">
      
      {/* HEADER HERO */}
      <div className="relative h-72 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=1000" 
          alt="Events" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-cream via-brand-slate/10 to-black/30"></div>
        
        <button 
          onClick={step === 1 ? onBack : () => setStep(1)}
          className="absolute top-6 left-6 z-10 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="absolute bottom-12 left-8 right-8 text-left">
          <div className="h-[1px] w-12 bg-brand-gold mb-4"></div>
          <h2 className="text-5xl font-serif font-black text-white px-0 tracking-tight leading-none italic">Riva Eventi</h2>
          <p className="text-white/80 text-[10px] uppercase font-black tracking-[0.5em] mt-3">Exquisite Celebrations</p>
        </div>

        {/* PROGRESS */}
        <div className="absolute bottom-6 left-8 flex gap-3">
          {[1, 2].map(i => (
            <div key={i} className={`h-[2px] rounded-full transition-all duration-700 ${step >= i ? 'w-12 bg-white' : 'w-6 bg-white/20'}`}></div>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="px-8 md:px-10 -mt-8 relative z-20 pb-40 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] px-2 mb-2 text-center">Un'atmosfera su misura per ogni occasione</p>
              {EVENT_TYPES.map(type => {
                const Icon = type.icon
                return (
                  <label key={type.id} className={`block bg-white rounded-[3rem] overflow-hidden border-2 transition-all duration-700 cursor-pointer ${selectedType?.id === type.id ? 'border-brand-gold shadow-2xl scale-[1.02]' : 'border-transparent shadow-sm'}`}>
                    <input type="radio" name="event" className="hidden" onChange={() => setSelectedType(type)} />
                    <div className="h-44 relative group">
                      <img src={type.image} alt={type.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-burgundy/90 via-black/20 to-black/30"></div>
                      <div className="absolute bottom-8 left-8 right-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                           <Icon size={24} className="text-brand-gold mb-1" />
                           <h3 className="text-white font-serif font-black text-2xl italic tracking-tight">{type.name}</h3>
                        </div>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-2">{type.desc}</p>
                      </div>
                    </div>
                  </label>
                )
              })}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-brand-gold/10">
                <h4 className="text-2xl font-serif font-black text-brand-burgundy mb-10 italic border-b border-brand-gold/10 pb-4 text-center">Your Vision</h4>
                
                <div className="space-y-10">
                  <div className="text-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-6 block">Il Tuo Nome</label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nome e Cognome" className="w-full bg-brand-cream/50 border border-brand-gold/10 rounded-2xl px-6 py-4 font-serif font-bold text-brand-burgundy outline-none focus:ring-2 focus:ring-brand-gold/20 placeholder:text-brand-burgundy/20" />
                  </div>
                  <div className="text-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-6 block">La Tua Email</label>
                    <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="email@esempio.it" className="w-full bg-brand-cream/50 border border-brand-gold/10 rounded-2xl px-6 py-4 font-serif font-bold text-brand-burgundy outline-none focus:ring-2 focus:ring-brand-gold/20 placeholder:text-brand-burgundy/20" />
                  </div>
                  <div className="text-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-6 block">Data Desiderata</label>
                    <div className="relative">
                       <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gold" />
                       <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full bg-brand-cream/50 border border-brand-gold/10 rounded-2xl px-6 py-4 pl-14 font-serif font-bold text-brand-burgundy outline-none focus:ring-2 focus:ring-brand-gold/20" />
                    </div>
                  </div>
                  <div className="text-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-6 block">Numero di Invitati</label>
                    <div className="flex items-center justify-between bg-brand-cream/50 px-2 py-2 rounded-2xl border border-brand-gold/10 max-w-[200px] mx-auto border border-brand-gold/10">
                      <button onClick={() => setEventGuests(Math.max(10, eventGuests - 5))} className="text-brand-burgundy w-10 h-10 flex items-center justify-center font-black">-</button>
                      <span className="font-serif font-black text-2xl text-brand-burgundy">{eventGuests}</span>
                      <button onClick={() => setEventGuests(eventGuests + 5)} className="text-brand-burgundy w-10 h-10 flex items-center justify-center font-black">+</button>
                    </div>
                  </div>
                  <div className="text-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-6 block">Note per l'Evento</label>
                    <textarea 
                      placeholder="Musica, menu speciale, decorazioni..." 
                      value={comment} onChange={e => setComment(e.target.value)}
                      className="w-full bg-brand-cream/30 border border-brand-gold/10 rounded-2xl px-6 py-5 font-serif font-bold text-brand-burgundy outline-none focus:ring-2 focus:ring-brand-gold/20 h-32 resize-none placeholder:text-brand-burgundy/20 italic"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2rem] flex flex-col items-center gap-3 border border-brand-gold/10 shadow-sm text-center">
                  <Utensils size={24} className="text-brand-gold" />
                  <span className="text-[9px] font-black text-brand-slate/40 uppercase tracking-widest leading-tight">Catering<br/><span className="text-brand-burgundy">Incluso</span></span>
                </div>
                <div className="bg-white p-6 rounded-[2rem] flex flex-col items-center gap-3 border border-brand-gold/10 shadow-sm text-center">
                  <GlassWater size={24} className="text-brand-gold" />
                  <span className="text-[9px] font-black text-brand-slate/40 uppercase tracking-widest leading-tight">Privé Bar<br/><span className="text-brand-burgundy">Custom</span></span>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* BOTTOM ACTION BAR */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg bg-white/95 backdrop-blur-md border-t border-brand-gold/10 p-6 pb-safe z-40 shadow-2xl">
        <button 
          onClick={handleNext}
          disabled={step === 1 ? !selectedType : (!eventDate || !customerName || !customerEmail || submitting)}
          className="w-full bg-brand-burgundy disabled:opacity-20 text-white rounded-[2rem] py-6 font-serif font-black text-2xl italic flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl shadow-brand-burgundy/20"
        >
          {submitting ? <><Loader2 size={22} className="animate-spin" /> Invio in corso...</> : <>{step === 1 ? 'Configure Event' : 'Send Inquiry'} <ChevronRight size={22} className="text-brand-gold" /></>}
        </button>
      </motion.div>

    </div>
  )
}
