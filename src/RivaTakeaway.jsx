import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ShoppingBag, Plus, Minus, CheckCircle2, ChevronRight, Clock, MapPin, Bike } from 'lucide-react'

// Take-away Mock Data
const TAKEAWAY_MENU = [
  { id: 't1', category: 'Panini', name: 'Puccia Salentina Salumi', desc: 'Puccia artigianale con capocollo di Martina Franca, caciocavallo e pomodori secchi.', price: 9.00, image: 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 't2', category: 'Panini', name: 'Puccia Vegetariana', desc: 'Puccia artigianale con melanzane grigliate, stracciatella e pesto di basilico.', price: 8.50, image: 'https://images.unsplash.com/photo-1547526323-28876c12de4b?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 't3', category: 'Insalate', name: 'Insalata Jonica', desc: 'Insalata mista, tonno fresco scottato, olive taggiasche, pomodorini e crostini.', price: 12.00, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 't4', category: 'Frutta', name: 'Cocco in Ghiaccio', desc: 'Fettine di cocco fresco servite su letto di ghiaccio triturato.', price: 5.00, image: 'https://images.unsplash.com/photo-1525385133335-86d8fe529683?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 't5', category: 'Bibite', name: 'Caffé in Ghiaccio con Latte di Mandorla', desc: 'Il classico caffè salentino rinfrescante.', price: 3.50, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 't6', category: 'Bibite', name: 'Acqua Naturale (500ml)', desc: 'Bottiglietta d\'acqua fresca.', price: 2.00, image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 't7', category: 'Bibite', name: 'Tropical Detox', desc: 'Centrifugato di mango, ananas e menta fresca.', price: 6.50, image: 'https://images.unsplash.com/photo-1623065422902-30a2ad4492bf?auto=format&fit=crop&q=80&w=400&h=400' },
]

const PICKUP_TIMES = ['Il prima possibile (15 min)', 'Tra 30 minuti', 'Tra 1 Ora', 'Tra 2 Ore']

export default function RivaTakeaway({ onBack }) {
  const [activeCategory, setActiveCategory] = useState('Tutti')
  const [cart, setCart] = useState({})
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [pickupTime, setPickupTime] = useState(PICKUP_TIMES[0])
  const [orderComplete, setOrderComplete] = useState(false)

  const categories = ['Tutti', ...new Set(TAKEAWAY_MENU.map(item => item.category))]

  const filteredMenu = activeCategory === 'Tutti' 
    ? TAKEAWAY_MENU 
    : TAKEAWAY_MENU.filter(item => item.category === activeCategory)

  // --- CART FUNCS ---
  const updateQuantity = (id, delta) => {
    setCart(prev => {
      const newQty = (prev[id] || 0) + delta
      if (newQty <= 0) {
        const newCart = { ...prev }; delete newCart[id]; return newCart
      }
      return { ...prev, [id]: newQty }
    })
  }

  const getItemQuantity = (id) => cart[id] || 0
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)
  const totalPrice = useMemo(() => Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = TAKEAWAY_MENU.find(i => i.id === id); return sum + (item ? item.price * qty : 0)
  }, 0), [cart])

  // --- ACTIONS ---
  const confirmOrder = (e) => {
    e.preventDefault()
    setIsCheckoutOpen(false)
    setOrderComplete(true)
    setTimeout(() => { setOrderComplete(false); setCart({}); onBack() }, 3000)
  }

  // --- SUCCESS RECIEPT SCREEN ---
  if (orderComplete) {
    const orderNumber = Math.floor(100 + Math.random() * 900)
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-8 text-center animate-fade-in text-brand-slate max-w-md mx-auto relative overflow-hidden">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white text-brand-slate rounded-[3rem] p-10 w-full max-w-sm shadow-2xl relative border border-brand-gold/10">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-brand-burgundy rounded-full flex items-center justify-center shadow-xl border-4 border-white">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          <p className="mt-12 font-black text-brand-gold text-[10px] uppercase tracking-[0.3em]">Codice Ritiro</p>
          <h2 className="text-7xl font-serif font-black text-brand-burgundy my-4 italic">#{orderNumber}</h2>
          <p className="text-brand-slate/40 font-bold text-[10px] uppercase tracking-wider mb-8 leading-relaxed">Mostra questo numero alla cassa "Ritiro Veloce" presso il Chiosco Centrale.</p>
          
          <div className="bg-brand-cream/50 rounded-2xl p-6 text-left border border-brand-gold/5 text-sm mb-8">
             <div className="flex justify-between font-serif font-black text-brand-burgundy border-b border-brand-gold/10 pb-4 mb-4 text-xl italic">
               <span>Pagato</span> 
               <span className="text-brand-gold">€{totalPrice.toFixed(2)}</span>
             </div>
             <p className="flex justify-between text-[9px] font-black uppercase tracking-widest text-brand-slate/40">
               <span>Ritiro Stimato</span> 
               <span className="text-brand-burgundy">{pickupTime}</span>
             </p>
          </div>

          <button onClick={onBack} className="w-full py-4 bg-brand-burgundy text-white rounded-full font-serif font-black text-lg shadow-xl active:scale-95 transition-all">
            Torna alla Home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="bg-brand-cream min-h-screen font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-brand-gold/10 text-brand-slate">
      
      {/* HEADER HERO */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000" 
          alt="Takeaway" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-cream via-brand-slate/10 to-black/30"></div>
        
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 z-10 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="absolute bottom-12 left-8 right-8 text-left">
          <div className="h-[1px] w-8 bg-brand-gold mb-3"></div>
          <h2 className="text-4xl font-serif font-black text-white px-0 tracking-tight leading-none italic italic">Prendi & Vai</h2>
          <p className="text-white/80 text-[10px] uppercase font-black tracking-[0.4em] mt-2">The Fast Experience</p>
        </div>
      </div>

      {/* CATEGORIES PILLS */}
      <div className="px-6 -mt-8 relative z-20">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-brand-gold/10 p-2 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map(cat => (
            <button
              key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 ${
                activeCategory === cat ? 'bg-brand-burgundy text-white shadow-lg' : 'bg-transparent text-brand-slate/40 hover:text-brand-burgundy'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MENU LIST */}
      <div className="px-6 py-10 space-y-6 pb-40">
        <AnimatePresence mode="popLayout">
          {filteredMenu.map(item => {
            const qty = getItemQuantity(item.id)
            return (
              <motion.div layout initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={item.id} className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-brand-gold/5 flex gap-5 hover:shadow-md transition-all group">
                <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-brand-cream relative border border-brand-gold/5">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                   <div className="flex flex-col mb-2">
                     <h3 className="font-serif font-black text-brand-burgundy text-lg leading-tight mb-1 italic">{item.name}</h3>
                     <span className="font-serif font-bold text-brand-gold">€{item.price.toFixed(2)}</span>
                   </div>
                  <p className="text-[9px] font-bold text-brand-slate/40 uppercase tracking-wider leading-relaxed mb-4 line-clamp-2">{item.desc}</p>
                  
                  <div className="flex justify-end">
                    {qty === 0 ? (
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-10 h-10 bg-brand-cream border border-brand-gold/10 text-brand-burgundy rounded-full flex items-center justify-center shadow-sm hover:bg-brand-burgundy hover:text-white transition-all active:scale-95">
                        <Plus size={18} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-4 bg-brand-cream/50 rounded-full py-1.5 px-3 border border-brand-gold/10 animate-scale-in">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-brand-burgundy hover:text-brand-burgundy/60"><Minus size={14} /></button>
                        <span className="font-serif font-black text-brand-burgundy">{qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-brand-burgundy text-white rounded-full shadow-lg"><Plus size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* FLOATING CART BUTTON */}
      <AnimatePresence>
        {totalItems > 0 && !isCheckoutOpen && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-brand-gold/10 p-6 pb-safe z-40 shadow-2xl">
            <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-brand-burgundy text-white rounded-[1.5rem] py-5 flex justify-between items-center shadow-2xl shadow-brand-burgundy/20 hover:bg-black active:scale-[0.98] transition-all px-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ShoppingBag size={24} className="text-brand-gold" />
                  <span className="absolute -top-2 -right-2 bg-white text-brand-burgundy w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shadow-lg">{totalItems}</span>
                </div>
                <div className="text-left leading-tight">
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Riepilogo Ordine</p>
                  <p className="font-serif font-black text-2xl italic tracking-tight text-white">€{totalPrice.toFixed(2)}</p>
                </div>
              </div>
              <ChevronRight size={24} className="text-brand-gold opacity-80"/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM SHEET CHECKOUT */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCheckoutOpen(false)} className="fixed inset-0 bg-brand-slate/60 backdrop-blur-md z-50 max-w-md mx-auto" />
            
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-t-[3rem] z-50 pt-4 pb-safe shadow-2xl overflow-hidden">
              <div className="w-12 h-1 bg-brand-gold/20 rounded-full mx-auto my-4"></div>
              
              <div className="px-8 py-6 max-h-[80vh] overflow-y-auto no-scrollbar">
                <h3 className="text-3xl font-serif font-black text-brand-burgundy mb-8 italic">Review Order</h3>

                <div className="bg-brand-cream/50 p-6 rounded-3xl mb-10 text-xs font-bold text-brand-slate uppercase tracking-wider leading-relaxed flex gap-4 border border-brand-gold/10">
                  <Clock size={20} className="shrink-0 text-brand-gold" />
                  <p>Prepariamo il vostro ordine istantaneamente. Ritirate presso la postazione "Ritiro Veloce".</p>
                </div>

                <div className="space-y-6 mb-12">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = TAKEAWAY_MENU.find(i => i.id === id); if (!item) return null
                    return (
                      <div key={id} className="flex justify-between items-center font-serif font-bold text-lg text-brand-slate border-b border-brand-gold/5 pb-4">
                        <div className="flex gap-4 items-center">
                          <span className="bg-brand-burgundy/5 text-brand-burgundy w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black italic">{qty}x</span>
                          <span className="italic">{item.name}</span>
                        </div>
                        <span className="text-brand-gold font-black">€{(item.price * qty).toFixed(2)}</span>
                      </div>
                    )
                  })}
                  
                  <div className="flex justify-between items-center text-4xl font-serif font-black pt-4 italic border-t-2 border-brand-gold/10">
                    <span className="text-brand-slate/30 not-italic font-sans text-xs uppercase tracking-[0.3em] font-black">Totale</span>
                    <span className="text-brand-burgundy">€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={confirmOrder} className="space-y-8">
                  <div className="text-center">
                    <label className="block text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-4">Orario di Ritiro</label>
                    <select 
                      value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                      className="w-full bg-brand-cream/30 border border-brand-gold/10 text-brand-burgundy rounded-2xl px-6 py-5 text-lg font-serif font-bold outline-none focus:ring-2 focus:ring-brand-gold/20 appearance-none text-center"
                    >
                      {PICKUP_TIMES.map(time => <option key={time} value={time}>{time}</option>)}
                    </select>
                  </div>

                  <button type="submit" className="w-full bg-brand-burgundy text-white rounded-[2rem] py-6 font-serif font-black text-2xl italic shadow-2xl shadow-brand-burgundy/20 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-4">
                    Conferma Pagamento <ChevronRight size={20} className="text-brand-gold" />
                  </button>
                  <button type="button" onClick={() => setIsCheckoutOpen(false)} className="w-full py-2 font-black text-[10px] uppercase tracking-[0.4em] text-brand-slate/30 hover:text-brand-burgundy transition-colors mb-4">
                    Continua Esplorazione
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
