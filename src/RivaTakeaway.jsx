import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ShoppingBag, Plus, Minus, CheckCircle2, ChevronRight, Clock, MapPin, Bike } from 'lucide-react'

// Take-away Mock Data
const TAKEAWAY_MENU = [
  { id: 't1', category: 'Panini', name: 'Puccia Salentina Salumi', desc: 'Puccia artigianale con capocollo di Martina Franca, caciocavallo e pomodori secchi.', price: 9.00, image: 'https://images.unsplash.com/photo-1628198622811-04285ad1cc2e?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 't2', category: 'Panini', name: 'Puccia Vegetariana', desc: 'Puccia artigianale con melanzane grigliate, stracciatella e pesto di basilico.', price: 8.50, image: 'https://images.unsplash.com/photo-1550508139-b967012ebe16?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 't3', category: 'Insalate', name: 'Insalata Jonica', desc: 'Insalata mista, tonno fresco scottato, olive taggiasche, pomodorini e crostini.', price: 12.00, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 't4', category: 'Frutta', name: 'Cocco in Ghiaccio', desc: 'Fettine di cocco fresco servite su letto di ghiaccio triturato.', price: 5.00, image: 'https://images.unsplash.com/photo-1481390442085-3bc4236a2cd0?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 't5', category: 'Bibite', name: 'Caffé in Ghiaccio con Latte di Mandorla', desc: 'Il classico caffè salentino rinfrescante.', price: 3.50, image: 'https://images.unsplash.com/photo-1461023058943-07cb1ce9116a?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 't6', category: 'Bibite', name: 'Acqua Naturale (500ml)', desc: 'Bottiglietta d\'acqua fresca.', price: 2.00, image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=400&h=400' },
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
      <div className="min-h-screen bg-emerald-500 flex flex-col items-center justify-center p-6 text-center animate-fade-in text-white max-w-md mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-10"></div>
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white text-neutral-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <p className="mt-8 font-bold text-neutral-400 text-sm uppercase tracking-widest">Codice Ritiro</p>
          <h2 className="text-6xl font-black text-emerald-600 my-2">#{orderNumber}</h2>
          <p className="text-neutral-600 font-medium mb-6 leading-relaxed">Mostra questo numero alla cassa "Ritiro Veloce" del chiosco principale.</p>
          
          <div className="bg-neutral-50 rounded-xl p-4 text-left border border-neutral-100 text-sm mb-6">
             <p className="flex justify-between font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-2"><span>Totale Pagato</span> <span>€{totalPrice.toFixed(2)}</span></p>
             <p className="flex justify-between text-neutral-500"><span>Ritiro:</span> <span>{pickupTime}</span></p>
          </div>

          <p className="text-xs text-neutral-400 font-bold">Stiamo preparando il tuo ordine!</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-50 min-h-screen font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden selection:bg-emerald-200">
      
      {/* HEADER HERO */}
      <div className="bg-emerald-600 text-white p-6 pb-20 rounded-b-[2rem] relative z-20 shadow-lg overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-400/40 rounded-full blur-[80px]"></div>
        
        <button onClick={onBack} className="relative z-10 mb-6 flex items-center gap-1 text-sm font-medium text-emerald-100 hover:text-white transition-colors">
          <ChevronLeft size={18} /> Home
        </button>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-black mb-1 flex items-center gap-2 tracking-tight">
              Prendi & Vai
            </h2>
            <p className="text-emerald-100 text-sm md:text-base font-medium flex items-center gap-1">
               <Bike size={16} /> Salta la fila. Ritira e gusta.
            </p>
          </div>
        </div>
      </div>

      {/* CATEGORIES PILLS */}
      <div className="px-4 -mt-8 relative z-20">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-neutral-100 p-2 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map(cat => (
            <button
              key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat ? 'bg-emerald-600 text-white shadow-md' : 'bg-transparent text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MENU LIST */}
      <div className="px-4 py-6 space-y-4 pb-40">
        <AnimatePresence mode="popLayout">
          {filteredMenu.map(item => {
            const qty = getItemQuantity(item.id)
            return (
              <motion.div layout initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={item.id} className="bg-white p-3 rounded-3xl shadow-sm border border-neutral-100 flex gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-neutral-100 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <span className="absolute bottom-1 right-2 font-bold text-white text-sm">€{item.price.toFixed(2)}</span>
                </div>
                
                <div className="flex-1 flex flex-col pt-1">
                  <h3 className="font-bold text-neutral-900 text-sm leading-tight mb-1 pr-2">{item.name}</h3>
                  <p className="text-[10px] text-neutral-500 leading-relaxed line-clamp-2 pr-2">{item.desc}</p>
                  
                  <div className="mt-auto flex justify-end">
                    {qty === 0 ? (
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center transition-transform active:scale-95 border border-emerald-200">
                        <Plus size={16} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 bg-neutral-50 rounded-full p-1 border border-neutral-200">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-neutral-900 rounded-full bg-white shadow-sm"><Minus size={14} /></button>
                        <span className="font-bold w-4 text-center text-sm">{qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-emerald-500 text-white rounded-full shadow-sm"><Plus size={14} /></button>
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
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-neutral-100 p-4 pb-safe z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-emerald-600 text-white rounded-[1.5rem] p-4 flex justify-between items-center shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-[0.98] transition">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag size={24} />
                  <span className="absolute -top-2 -right-2 bg-white text-emerald-600 w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center shadow-sm">{totalItems}</span>
                </div>
                <div className="text-left font-medium leading-tight">
                  <p className="text-emerald-100 text-xs uppercase tracking-wider">Checkout</p>
                  <p className="font-bold text-lg">€{totalPrice.toFixed(2)}</p>
                </div>
              </div>
              <ChevronRight size={24} className="opacity-80"/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM SHEET CHECKOUT */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCheckoutOpen(false)} className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 max-w-md mx-auto" />
            
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-t-[2.5rem] z-50 pt-2 pb-safe shadow-2xl">
              <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto my-3"></div>
              
              <div className="px-6 py-4 max-h-[85vh] overflow-y-auto no-scrollbar">
                <h3 className="text-2xl font-black text-neutral-900 mb-6">Completa l'Ordine</h3>

                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl mb-6 text-sm font-medium flex gap-3 border border-emerald-100">
                  <Clock size={20} className="shrink-0 text-emerald-600" />
                  <p>Prepariamo il tuo ordine velocemente. Appena pronto, recati alla postazione "Ritiro Veloce" The Beach.</p>
                </div>

                <div className="space-y-4 mb-6">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = TAKEAWAY_MENU.find(i => i.id === id); if (!item) return null
                    return (
                      <div key={id} className="flex justify-between items-center text-sm font-medium border-b border-neutral-100 pb-3">
                        <div className="flex gap-3 items-center">
                          <span className="bg-neutral-100 text-neutral-600 w-6 h-6 rounded flex items-center justify-center text-xs">{qty}x</span>
                          <span className="text-neutral-800">{item.name}</span>
                        </div>
                        <span className="text-neutral-900 font-bold">€{(item.price * qty).toFixed(2)}</span>
                      </div>
                    )
                  })}
                  
                  <div className="flex justify-between items-center text-xl font-black pt-2">
                    <span>Totale</span>
                    <span className="text-emerald-600">€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={confirmOrder} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-neutral-900 mb-2">Seleziona orario di ritiro</label>
                    <select 
                      value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-emerald-500 font-medium font-sans"
                    >
                      {PICKUP_TIMES.map(time => <option key={time} value={time}>{time}</option>)}
                    </select>
                  </div>

                  <button type="submit" className="w-full bg-neutral-900 text-white rounded-[1.5rem] py-4 font-bold text-lg hover:bg-black transition-colors shadow-xl shadow-neutral-900/20">
                    Paga con Apple Pay / Carta
                  </button>
                  <button type="button" onClick={() => setIsCheckoutOpen(false)} className="w-full py-4 font-bold text-neutral-500 hover:text-neutral-900 transition-colors">
                    Continua ad Aggiungere
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
