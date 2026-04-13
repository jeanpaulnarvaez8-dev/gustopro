import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Crown, MessageCircle, GlassWater, Sparkles, Plus, Minus, CheckCircle2, ChevronRight, Calendar, Users, MapPin, Loader2 } from 'lucide-react'
import { catalog, bookings } from './lib/api'

export default function RivaVip({ onBack }) {
  const [VIP_LOCATIONS, setLocations] = useState([])
  const [BOTTLE_SERVICE, setBottles] = useState([])
  const [activeTab, setActiveTab] = useState('booking')

  // Booking State
  const [selectedLoc, setSelectedLoc] = useState(null)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingGuests, setBookingGuests] = useState(2)
  const [checkoutStep, setCheckoutStep] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Bottles State
  const [bottlesCart, setBottlesCart] = useState({})

  useEffect(() => {
    catalog.vipPackages('CABANA').then(pkgs => {
      setLocations(pkgs.map(p => ({ id: p.id, name: p.name, desc: p.description || '', price: Number(p.price), image: p.imageUrl || '' })))
    })
    catalog.vipPackages('BOTTLE').then(pkgs => {
      setBottles(pkgs.map(p => ({ id: p.id, name: p.name, desc: p.description || '', price: Number(p.price), image: p.imageUrl || '' })))
    })
  }, [])

  // --- BOTTLE CART FUNCS ---
  const updateBottleQty = (id, delta) => {
    setBottlesCart(prev => {
      const newQty = (prev[id] || 0) + delta
      if (newQty <= 0) {
        const newCart = { ...prev }; delete newCart[id]; return newCart
      }
      return { ...prev, [id]: newQty }
    })
  }
  const totalBottles = Object.values(bottlesCart).reduce((a, b) => a + b, 0)
  const totalBottlePrice = Object.entries(bottlesCart).reduce((sum, [id, qty]) => {
    const b = BOTTLE_SERVICE.find(x => x.id === id); return sum + (b ? b.price * qty : 0)
  }, 0)

  // --- ACTIONS ---
  const handleBookingConfirm = async (e) => {
    e.preventDefault()
    if (!customerName || !customerEmail || !bookingDate) return
    setSubmitting(true)
    try {
      await bookings.vip({ name: customerName, email: customerEmail, date: bookingDate, guests: bookingGuests, packageId: selectedLoc.id })
      setOrderComplete(true)
      setTimeout(() => { setOrderComplete(false); onBack() }, 3000)
    } catch (err) {
      console.error('VIP booking failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // --- RENDER BOTTLES TAB ---
  const renderBottles = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-32">
      <div className="bg-amber-100/50 p-4 rounded-2xl flex items-start gap-3 border border-amber-200">
        <Sparkles className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-amber-900 font-medium leading-relaxed">
          Tutte le bottiglie includono il servizio VIP dedicato, secchiello per il ghiaccio premium e Sparkler Show per le bottiglie Magnum.
        </p>
      </div>

      <div className="space-y-4">
        {BOTTLE_SERVICE.map(b => (
          <div key={b.id} className="bg-white p-3 rounded-3xl shadow-sm border border-neutral-100 flex gap-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-neutral-900">
              <img src={b.image} alt={b.name} className="w-full h-full object-cover opacity-90" />
            </div>
            <div className="flex-1 flex flex-col pt-1">
              <div className="flex justify-between items-start mb-1 gap-2">
                <h3 className="font-bold text-neutral-900 leading-tight">{b.name}</h3>
                <span className="font-black text-amber-600">€{b.price}</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{b.desc}</p>
              
              <div className="mt-auto pt-2 flex justify-end">
                {bottlesCart[b.id] ? (
                  <div className="flex items-center gap-3 bg-neutral-50 rounded-full p-1 border border-neutral-200">
                    <button onClick={() => updateBottleQty(b.id, -1)} className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 rounded-full"><Minus size={14} /></button>
                    <span className="font-bold w-4 text-center text-sm">{bottlesCart[b.id]}</span>
                    <button onClick={() => updateBottleQty(b.id, 1)} className="w-7 h-7 flex items-center justify-center bg-amber-500 text-white rounded-full"><Plus size={14} /></button>
                  </div>
                ) : (
                  <button onClick={() => updateBottleQty(b.id, 1)} className="bg-neutral-900 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-black transition-colors">
                    Aggiungi
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {totalBottles > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-neutral-100 p-4 pb-safe z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <button className="w-full bg-amber-500 text-white rounded-2xl p-4 font-bold text-lg flex justify-between items-center transition shadow-lg shadow-amber-500/30 active:scale-[0.98]">
              <span className="flex items-center gap-2"><GlassWater size={20}/> Ordina ({totalBottles})</span>
              <span>€{totalBottlePrice}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  // --- RENDER CONCIERGE TAB ---
  const renderConcierge = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-[60vh] bg-white rounded-[2.5rem] shadow-sm border border-neutral-100 overflow-hidden">
      <div className="bg-neutral-900 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white"><Crown size={20} /></div>
        <div>
          <h3 className="text-white font-bold text-sm">VIP Concierge</h3>
          <p className="text-green-400 text-xs flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 blink"></span> Online ora</p>
        </div>
      </div>
      <div className="flex-1 p-4 bg-neutral-50 space-y-4 overflow-y-auto">
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 shrink-0 flex items-center justify-center text-white text-xs"><Crown size={14} /></div>
          <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-neutral-100 text-sm text-neutral-700 max-w-[85%]">
            Benvenuto nel servizio Concierge dedicato. Sono Alessandro, il tuo Host VIP. Come posso rendere la tua giornata speciale? Desideri fiori freschi in Cabana o un menù personalizzato?
          </div>
        </div>
      </div>
      <div className="p-3 bg-white border-t border-neutral-100">
        <div className="flex items-center gap-2 bg-neutral-100 rounded-full p-1 pl-4">
          <input type="text" placeholder="Scrivi un messaggio..." className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2" />
          <button className="w-9 h-9 bg-amber-500 text-white rounded-full flex items-center justify-center"><ChevronRight size={18} /></button>
        </div>
      </div>
    </motion.div>
  )

  // --- SUCCESS SCREEN ---
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-8 text-center animate-fade-in text-brand-slate max-w-md mx-auto">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-brand-burgundy rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-brand-burgundy/30">
          <Crown size={48} className="text-white" />
        </motion.div>
        <h2 className="text-4xl font-serif font-black mb-4 text-brand-burgundy italic">Riva VIP</h2>
        <p className="text-brand-slate/60 text-xs font-bold uppercase tracking-[0.3em] mb-12 max-w-[280px] leading-relaxed">
          La vostra esperienza esclusiva è confermata. Il Concierge vi contatterà a breve.
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
      <div className="bg-brand-burgundy/5 text-brand-slate p-6 pb-8 rounded-b-[2rem] relative z-20 shadow-sm border-b border-brand-gold/10">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-gold/10 rounded-full blur-[60px]"></div>
        
        <button onClick={checkoutStep ? () => setCheckoutStep(false) : onBack} className="relative z-10 mb-6 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-gold hover:text-brand-burgundy transition-colors">
          <ChevronLeft size={16} /> {checkoutStep ? 'Indietro' : 'Home'}
        </button>
        
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h2 className="text-4xl font-serif font-black mb-1 tracking-tight text-brand-burgundy italic">Riva VIP</h2>
            <p className="text-brand-slate/40 text-[10px] font-black uppercase tracking-[0.3em]">The Crystal Experience</p>
          </div>
          <Crown size={32} className="text-brand-gold opacity-40" />
        </div>

        {/* TAB NAVIGATION */}
        {!checkoutStep && (
          <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-2xl mt-8 relative z-10 border border-brand-gold/10">
            {[
              { id: 'booking', label: 'Cabana', icon: MapPin },
              { id: 'bottles', label: 'Vini e Bolle', icon: GlassWater },
              { id: 'concierge', label: 'Concierge', icon: MessageCircle }
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    isActive ? 'bg-brand-burgundy text-white shadow-lg' : 'text-brand-slate/40 hover:text-brand-burgundy'
                  }`}
                >
                  <Icon size={12} /> {tab.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="px-6 md:px-10 py-8 relative z-10 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          
          {activeTab === 'bottles' && !checkoutStep && <motion.div key="bottles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-32">
            <div className="bg-white p-6 rounded-[2rem] flex items-start gap-4 border border-brand-gold/10 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles size={60} /></div>
              <p className="text-[10px] text-brand-slate/60 font-bold uppercase tracking-wider leading-relaxed">
                Il nostro Sommelier ha selezionato le migliori etichette per accompagnare il vostro soggiorno. Servizio VIP incluso.
              </p>
            </div>

            <div className="space-y-6">
              {BOTTLE_SERVICE.map(b => (
                <div key={b.id} className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-brand-gold/5 flex gap-5 hover:shadow-md transition-all">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-brand-cream border border-brand-gold/10">
                    <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex flex-col mb-2">
                      <h3 className="font-serif font-black text-brand-burgundy text-lg leading-tight mb-1 italic">{b.name}</h3>
                      <span className="font-serif font-bold text-brand-gold">€{b.price}</span>
                    </div>
                    <p className="text-[9px] font-bold text-brand-slate/40 uppercase tracking-wider leading-relaxed mb-4 line-clamp-2">{b.desc}</p>
                    
                    <div className="flex justify-end">
                      {bottlesCart[b.id] ? (
                        <div className="flex items-center gap-4 bg-brand-cream/50 rounded-full py-1.5 px-3 border border-brand-gold/10">
                          <button onClick={() => updateBottleQty(b.id, -1)} className="w-6 h-6 flex items-center justify-center text-brand-burgundy"><Minus size={14} /></button>
                          <span className="font-serif font-black text-brand-burgundy">{bottlesCart[b.id]}</span>
                          <button onClick={() => updateBottleQty(b.id, 1)} className="w-6 h-6 flex items-center justify-center bg-brand-burgundy text-white rounded-full"><Plus size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => updateBottleQty(b.id, 1)} className="bg-brand-burgundy text-white text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full shadow-lg shadow-brand-burgundy/10 active:scale-95 transition-all">
                          Seleziona
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {totalBottles > 0 && (
                <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg bg-white/95 backdrop-blur-md border-t border-brand-gold/10 p-6 pb-safe z-[45] shadow-2xl">
                  <button className="w-full bg-brand-burgundy text-white rounded-2xl py-5 font-serif font-black text-xl flex justify-between items-center px-8 transition shadow-2xl shadow-brand-burgundy/20 active:scale-95">
                    <span className="flex items-center gap-3 italic"><GlassWater size={20} className="text-brand-gold"/> Ordina ({totalBottles})</span>
                    <span className="text-brand-gold font-black">€{totalBottlePrice}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>}
          
          {activeTab === 'concierge' && !checkoutStep && <motion.div key="concierge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-[65vh] bg-white rounded-[3rem] shadow-xl border border-brand-gold/10 overflow-hidden">
            <div className="bg-brand-burgundy p-6 flex items-center gap-4 border-b border-brand-gold/20">
              <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-brand-burgundy shadow-lg"><Crown size={24} /></div>
              <div>
                <h3 className="text-white font-serif font-black text-lg italic tracking-tight">VIP Concierge</h3>
                <p className="text-brand-gold text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Dedicated Support</p>
              </div>
            </div>
            <div className="flex-1 p-8 bg-brand-cream/50 space-y-6 overflow-y-auto">
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-brand-burgundy shadow-sm text-xs font-black">R</div>
                </div>
                <div className="bg-white p-5 rounded-[2rem] rounded-tl-sm shadow-sm border border-brand-gold/5 text-xs font-bold text-brand-slate uppercase tracking-wider leading-relaxed max-w-[85%]">
                  Benvenuto nell'esclusività Riva. <br/><br/>Sono Alessandro, il vostro Concierge dedicato. Desiderate prenotare un servizio privato o personalizzare la vostra Cabana? Sono qui per ogni vostra richiesta.
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-brand-gold/10">
              <div className="flex items-center gap-3 bg-brand-cream/50 rounded-full p-1.5 pl-6 border border-brand-gold/5 focus-within:border-brand-gold/30 transition-all">
                <input type="text" placeholder="Scrivici la tua richiesta..." className="flex-1 bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest text-brand-slate placeholder:text-brand-slate/20 py-3" />
                <button className="w-10 h-10 bg-brand-burgundy text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"><ChevronRight size={20} className="text-brand-gold" /></button>
              </div>
            </div>
          </motion.div>}

          {activeTab === 'booking' && !checkoutStep && (
            <motion.div key="booking1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8 pb-32">
              <div className="space-y-6">
                {VIP_LOCATIONS.map(loc => (
                  <label key={loc.id} className={`block relative overflow-hidden rounded-[3rem] transition-all duration-700 cursor-pointer border-2 bg-white ${selectedLoc?.id === loc.id ? 'border-brand-gold shadow-2xl scale-[1.02]' : 'border-transparent shadow-sm'}`}>
                    <input type="radio" name="vip-loc" className="hidden" onChange={() => setSelectedLoc(loc)} />
                    <div className="h-60 relative">
                      <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-burgundy/95 via-transparent to-black/20"></div>
                      <div className="absolute top-6 right-6 bg-brand-gold text-brand-burgundy text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg border-2 border-white/20 flex items-center gap-2">
                        <Crown size={12} /> Excellence
                      </div>
                      <div className="absolute bottom-8 left-8 right-8">
                        <div className="flex justify-between items-end mb-2">
                          <h3 className="text-white font-serif font-black text-3xl italic tracking-tight">{loc.name}</h3>
                          <span className="text-brand-gold font-serif font-black text-2xl italic">€{loc.price}</span>
                        </div>
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed line-clamp-1">{loc.desc}</p>
                      </div>
                      {selectedLoc?.id === loc.id && (
                        <div className="absolute top-6 left-6 bg-brand-gold text-brand-burgundy w-10 h-10 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20 animate-scale-in">
                           <CheckCircle2 size={24} />
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {selectedLoc && (
                <button onClick={() => setCheckoutStep(true)} className="w-full bg-brand-burgundy text-white rounded-2xl py-5 font-serif font-black text-xl hover:bg-black transition-all flex justify-between items-center px-8 shadow-2xl shadow-brand-burgundy/20 group">
                  Personalizza <ChevronRight size={20} className="text-brand-gold group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </motion.div>
          )}

          {activeTab === 'booking' && checkoutStep && (
            <motion.div key="booking2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-32">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-brand-gold/10">
                <div className="flex items-center gap-6 border-b border-brand-gold/10 pb-8 mb-8">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-brand-gold/20">
                    <img src={selectedLoc.image} alt={selectedLoc.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-brand-burgundy text-xl italic">{selectedLoc.name}</h3>
                    <p className="text-brand-gold font-serif font-bold text-lg">€{selectedLoc.price} <span className="text-[10px] uppercase font-black text-brand-slate/30 tracking-widest">/day</span></p>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="text-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-6 block">Seleziona Data</label>
                    <div className="relative">
                       <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gold" />
                       <input type="date" min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-brand-cream/50 border border-brand-gold/10 rounded-2xl px-6 py-4 pl-14 font-serif font-bold text-brand-burgundy outline-none focus:ring-2 focus:ring-brand-gold/20" />
                    </div>
                  </div>
                  <div className="text-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-6 block">Numero di Ospiti</label>
                    <div className="flex items-center justify-between bg-brand-cream/50 px-2 py-2 rounded-2xl border border-brand-gold/10 max-w-[200px] mx-auto">
                      <button onClick={() => setBookingGuests(Math.max(1, bookingGuests - 1))} className="text-brand-burgundy w-10 h-10 flex items-center justify-center font-black">-</button>
                      <span className="font-serif font-black text-2xl text-brand-burgundy">{bookingGuests}</span>
                      <button onClick={() => setBookingGuests(Math.min(6, bookingGuests + 1))} className="text-brand-burgundy w-10 h-10 flex items-center justify-center font-black">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBookingConfirm} className="bg-brand-burgundy p-10 rounded-[3rem] shadow-2xl shadow-brand-burgundy/30">
                <h3 className="text-white font-serif font-black text-2xl mb-8 italic border-b border-white/10 pb-4">Checkout VIP</h3>
                <div className="space-y-4 mb-8">
                  <input type="text" required placeholder="Nome e Cognome" value={customerName} onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 font-serif font-bold text-white outline-none focus:ring-2 focus:ring-brand-gold/30 placeholder:text-white/30 text-center" />
                  <input type="email" required placeholder="email@esempio.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 font-serif font-bold text-white outline-none focus:ring-2 focus:ring-brand-gold/30 placeholder:text-white/30 text-center" />
                </div>
                <div className="flex justify-between items-center text-white/50 text-[10px] uppercase font-black tracking-widest mb-6">
                  <span>Quota confirmatoria (100%)</span>
                  <span className="text-white">€{selectedLoc.price}</span>
                </div>
                <div className="flex justify-between items-center text-brand-gold font-serif font-black text-4xl italic mt-6 pt-6 border-t border-white/10">
                  <span className="text-white/30 text-lg not-italic font-sans uppercase font-black tracking-widest">Totale</span>
                  <span>€{selectedLoc.price}</span>
                </div>
                <button type="submit" disabled={!bookingDate || !customerName || !customerEmail || submitting} className="w-full bg-white disabled:opacity-20 text-brand-burgundy font-serif font-black text-xl py-6 rounded-2xl mt-12 hover:bg-brand-cream transition-all shadow-xl active:scale-95">
                  {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Conferma Prenotazione'}
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
