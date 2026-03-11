import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Crown, MessageCircle, GlassWater, Sparkles, Plus, Minus, CheckCircle2, ChevronRight, Calendar, Users } from 'lucide-react'

// VIP Mock Data
const VIP_LOCATIONS = [
  { id: 'cabana', name: 'Grand Cabana', desc: 'Fino a 6 persone con jacuzzi privata e tendaggi di lino.', price: 250, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: 'gazebo', name: 'Ocean Gazebo', desc: 'Fino a 4 persone, letto king size a due passi dalla riva.', price: 150, image: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&q=80&w=800&h=600' }
]

const BOTTLE_SERVICE = [
  { id: 'b1', name: 'Dom Pérignon Vintage', desc: 'Bottiglia (75cl) servita con ghiaccio e sparkle show al tavolo.', price: 350, image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 'b2', name: 'Ruinart Blanc de Blancs', desc: 'Bottiglia (75cl) servita con fragole fresche e ghiaccio.', price: 180, image: 'https://images.unsplash.com/photo-1599576402092-1b1cc1b2d415?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 'b3', name: 'Belvedere Vodka Luminous', desc: 'Formato Magnum (1.5L) con succhi di accompagnamento.', price: 300, image: 'https://images.unsplash.com/photo-1596484552993-8b7150c9535b?auto=format&fit=crop&q=80&w=400&h=400' },
]

export default function RivaVip({ onBack }) {
  const [activeTab, setActiveTab] = useState('booking') // booking, bottles, concierge
  
  // Booking State
  const [selectedLoc, setSelectedLoc] = useState(null)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingGuests, setBookingGuests] = useState(2)
  const [checkoutStep, setCheckoutStep] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  // Bottles State
  const [bottlesCart, setBottlesCart] = useState({})

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
  const handleBookingConfirm = (e) => {
    e.preventDefault()
    setOrderComplete(true)
    setTimeout(() => { setOrderComplete(false); onBack() }, 3000)
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
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in text-white max-w-md mx-auto">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mb-6">
          <Crown size={48} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-black mb-2 text-amber-500">Prenotazione VIP Confermata</h2>
        <p className="text-neutral-400 mb-8 max-w-[280px]">
          Il tuo Host personale ti contatterà a breve tramite la chat Concierge per definire i dettagli.
        </p>
      </div>
    )
  }

  // --- MAIN RENDER ---
  return (
    <div className="bg-neutral-50 min-h-screen font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden selection:bg-amber-200">
      
      {/* HEADER HERO */}
      <div className="bg-neutral-900 text-white p-6 pb-8 rounded-b-[2rem] relative z-20 shadow-lg border-b border-amber-500/30">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/20 rounded-full blur-[60px]"></div>
        
        <button onClick={checkoutStep ? () => setCheckoutStep(false) : onBack} className="relative z-10 mb-6 flex items-center gap-1 text-sm font-medium text-amber-200/80 hover:text-amber-400 transition-colors">
          <ChevronLeft size={18} /> {checkoutStep ? 'Indietro' : 'Home'}
        </button>
        
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-black mb-1 tracking-tight bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">Riva VIP</h2>
            <p className="text-neutral-400 text-sm font-medium">L'esclusività assoluta in spiaggia</p>
          </div>
          <Crown size={32} className="text-amber-500 opacity-20" />
        </div>

        {/* TAB NAVIGATION */}
        {!checkoutStep && (
          <div className="flex bg-neutral-800 p-1 rounded-xl mt-6 relative z-10">
            {[
              { id: 'booking', label: 'Cabana', icon: MapPin },
              { id: 'bottles', label: 'Bottiglie', icon: GlassWater },
              { id: 'concierge', label: 'Concierge', icon: MessageCircle }
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive ? 'bg-amber-500 text-neutral-900 shadow-md' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Icon size={14} /> {tab.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="p-4 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* TAB: BOTTLES */}
          {activeTab === 'bottles' && !checkoutStep && <motion.div key="bottles">{renderBottles()}</motion.div>}
          
          {/* TAB: CONCIERGE */}
          {activeTab === 'concierge' && !checkoutStep && <motion.div key="concierge">{renderConcierge()}</motion.div>}

          {/* TAB: BOOKING CABANA (Step 1) */}
          {activeTab === 'booking' && !checkoutStep && (
            <motion.div key="booking1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 pb-32">
              <div className="space-y-4">
                {VIP_LOCATIONS.map(loc => (
                  <label key={loc.id} className={`block relative overflow-hidden rounded-[2rem] transition-all cursor-pointer border-2 bg-white ${selectedLoc?.id === loc.id ? 'border-amber-500 shadow-xl shadow-amber-500/10' : 'border-transparent shadow-sm'}`}>
                    <input type="radio" name="vip-loc" className="hidden" onChange={() => setSelectedLoc(loc)} />
                    <div className="h-48 relative">
                      <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-sm font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1">
                        <Crown size={14} className="text-amber-400" /> Premium
                      </div>
                      <div className="absolute bottom-4 left-5 right-5">
                        <div className="flex justify-between items-end mb-1">
                          <h3 className="text-white font-black text-2xl">{loc.name}</h3>
                          <span className="text-amber-400 font-bold text-lg">€{loc.price}</span>
                        </div>
                        <p className="text-white/70 text-sm leading-snug">{loc.desc}</p>
                      </div>
                      {selectedLoc?.id === loc.id && (
                        <div className="absolute top-4 left-4 bg-amber-500 text-neutral-900 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"><CheckCircle2 size={18} /></div>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {selectedLoc && (
                <button onClick={() => setCheckoutStep(true)} className="w-full bg-neutral-900 text-white rounded-2xl p-4 font-bold text-lg hover:bg-black transition flex justify-between items-center shadow-lg">
                  Configura Prenotazione <ChevronRight size={20} />
                </button>
              )}
            </motion.div>
          )}

          {/* TAB: BOOKING CABANA (Step 2 Checkout) */}
          {activeTab === 'booking' && checkoutStep && (
            <motion.div key="booking2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pb-32">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
                <div className="flex items-center gap-4 border-b border-neutral-100 pb-4 mb-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden">
                    <img src={selectedLoc.image} alt={selectedLoc.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">{selectedLoc.name}</h3>
                    <p className="text-amber-600 font-bold">€{selectedLoc.price} <span className="text-xs text-neutral-400 font-normal">/giorno</span></p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 mb-2"><Calendar size={16} className="text-amber-500" /> Data Arrivo</label>
                    <input type="date" min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 font-medium" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 mb-2"><Users size={16} className="text-amber-500" /> Numero Ospiti</label>
                    <div className="flex items-center justify-between bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-200">
                      <button onClick={() => setBookingGuests(Math.max(1, bookingGuests - 1))} className="text-neutral-500 w-8 h-8 flex items-center justify-center text-xl hover:text-black">-</button>
                      <span className="font-bold text-lg">{bookingGuests}</span>
                      <button onClick={() => setBookingGuests(Math.min(6, bookingGuests + 1))} className="text-neutral-500 w-8 h-8 flex items-center justify-center text-xl hover:text-black">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBookingConfirm} className="bg-neutral-900 p-6 rounded-3xl shadow-xl">
                <h3 className="text-white font-bold mb-4 border-b border-neutral-700 pb-2">Riepilogo</h3>
                <div className="flex justify-between items-center text-neutral-300 text-sm mb-2">
                  <span>Addebito prenotazione (100%)</span>
                  <span>€{selectedLoc.price}</span>
                </div>
                <div className="flex justify-between items-center text-amber-500 font-black text-xl mt-4 pt-4 border-t border-neutral-700">
                  <span>Totale Ora</span>
                  <span>€{selectedLoc.price}</span>
                </div>
                <button type="submit" disabled={!bookingDate} className="w-full bg-amber-500 disabled:opacity-50 text-neutral-900 font-black text-lg py-4 rounded-2xl mt-6 hover:bg-amber-400 transition-colors">
                  Paga in modo Sicuro
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
