import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ShoppingBag, Plus, Minus, CreditCard, MapPin, X, CheckCircle2, Loader2 } from 'lucide-react'
import { catalog, bookings } from './lib/api'

export default function RivaBeachBar({ onBack }) {
  const [barMenu, setBarMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Tutti')
  const [cart, setCart] = useState({}) // { id: quantity }
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [locationCode, setLocationCode] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [orderComplete, setOrderComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    catalog.menu('BEACH_BAR').then(items => {
      setBarMenu(items.map(i => ({ id: i.id, category: i.category, name: i.name, desc: i.description || '', price: Number(i.price), image: i.imageUrl || '' })))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const categories = ['Tutti', ...new Set(barMenu.map(item => item.category))]

  const filteredMenu = activeCategory === 'Tutti' 
    ? barMenu 
    : barMenu.filter(item => item.category === activeCategory)

  // Cart Operations
  const updateQuantity = (id, delta) => {
    setCart(prev => {
      const newQty = (prev[id] || 0) + delta
      if (newQty <= 0) {
        const newCart = { ...prev }
        delete newCart[id]
        return newCart
      }
      return { ...prev, [id]: newQty }
    })
  }

  const getItemQuantity = (id) => cart[id] || 0
  
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)
  
  const totalPrice = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = barMenu.find(i => i.id === id)
      return sum + (item ? item.price * qty : 0)
    }, 0)
  }, [cart])

  const handleCheckout = () => {
    setIsCheckoutOpen(true)
  }

  const confirmOrder = async (e) => {
    e.preventDefault()
    if (!locationCode || !customerName || !customerEmail) return
    setSubmitting(true)
    try {
      const items = Object.entries(cart).map(([menuItemId, quantity]) => ({ menuItemId, quantity }))
      await bookings.beachBar({ name: customerName, email: customerEmail, locationCode, items })
      setIsCheckoutOpen(false)
      setOrderComplete(true)
      setTimeout(() => { setOrderComplete(false); setCart({}); onBack() }, 3000)
    } catch (err) {
      console.error('Order failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // --- RENDERING ---

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-6 text-center animate-fade-in text-brand-slate">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-brand-burgundy rounded-full flex items-center justify-center mb-6 shadow-xl shadow-brand-burgundy/20"
        >
          <CheckCircle2 size={48} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-serif font-bold mb-2 text-brand-burgundy">Ordine Inviato</h2>
        <p className="text-brand-slate/60 mb-8 max-w-xs font-medium">
          Stiamo preparando il tuo drink. Arriverà presto alla postazione <strong className="text-brand-burgundy">{locationCode}</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-brand-cream min-h-screen font-sans max-w-md md:max-w-3xl lg:max-w-5xl mx-auto relative shadow-2xl md:shadow-none overflow-hidden border-x border-brand-gold/10 md:border-x-0">
      
      {/* HEADER HERO */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=1000" 
          alt="Bar" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-cream via-brand-slate/20 to-black/30"></div>
        
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 z-10 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="absolute bottom-10 left-8 right-8 text-left">
          <div className="h-[1px] w-8 bg-brand-gold mb-3"></div>
          <h2 className="text-4xl font-serif font-black text-white leading-tight tracking-tight drop-shadow-md">Riva Beach Bar</h2>
          <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em] mt-1">L'arte del Mixology</p>
        </div>
      </div>

      {/* CATEGORIES PILLS */}
      <div className="px-6 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-brand-slate/5 p-2 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth border border-brand-gold/10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                activeCategory === cat 
                  ? 'bg-brand-burgundy text-white shadow-lg shadow-brand-burgundy/20 px-8' 
                  : 'bg-transparent text-brand-slate/40 hover:text-brand-burgundy'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MENU LIST */}
      <div className="px-6 md:px-10 py-10 pb-40 grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredMenu.map(item => {
            const qty = getItemQuantity(item.id)
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                key={item.id} 
                className="group relative"
              >
                <div className="flex gap-5 items-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-md border border-brand-gold/10">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  
                  <div className="flex-1 flex flex-col py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-serif text-xl font-bold text-brand-burgundy leading-tight">{item.name}</h3>
                      <span className="text-brand-gold font-bold text-sm">€{item.price.toFixed(0)}</span>
                    </div>
                    <p className="text-[10px] text-brand-slate/50 font-medium leading-relaxed line-clamp-2 pr-4 italic">
                      {item.desc}
                    </p>
                    
                    <div className="mt-4 flex justify-end">
                      {qty === 0 ? (
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-4 py-1.5 border border-brand-burgundy text-brand-burgundy rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-brand-burgundy hover:text-white transition-all active:scale-95"
                        >
                          Aggiungi
                        </button>
                      ) : (
                        <div className="flex items-center gap-4 bg-white rounded-full px-2 py-1 shadow-sm border border-brand-gold/10">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-brand-burgundy hover:bg-brand-cream rounded-full transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-black text-xs w-4 text-center text-brand-burgundy">{qty}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center bg-brand-burgundy text-white rounded-full shadow-md transition-all active:scale-90"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 left-0 right-0 h-[1px] bg-brand-gold/5"></div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* FLOATING CART BUTTON */}
      <AnimatePresence>
        {totalItems > 0 && !isCheckoutOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg px-6 z-40"
          >
            <button 
              onClick={handleCheckout}
              className="w-full bg-brand-burgundy text-white rounded-2xl p-5 flex justify-between items-center shadow-2xl shadow-brand-burgundy/30 active:scale-95 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ShoppingBag size={22} className="text-brand-gold" />
                  <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-burgundy w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shadow-md">
                    {totalItems}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Totale Ordine</p>
                  <p className="font-serif text-2xl font-bold leading-none mt-0.5">€{totalPrice.toFixed(2)}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-brand-gold opacity-50" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM SHEET CHECKOUT */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-brand-slate/60 backdrop-blur-md z-50"
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg bg-brand-cream rounded-t-[3rem] z-50 pt-2 pb-safe shadow-2xl border-t border-brand-gold/20"
            >
              <div className="w-12 h-1 bg-brand-gold/30 rounded-full mx-auto my-4"></div>
              
              <div className="px-8 py-4 max-h-[85vh] overflow-y-auto no-scrollbar pb-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-serif font-black text-brand-burgundy tracking-tight">Il tuo ordine</h3>
                  <button onClick={() => setIsCheckoutOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-brand-slate/40 border border-brand-gold/10">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-5 mb-10">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = barMenu.find(i => i.id === id)
                    if (!item) return null
                    return (
                      <div key={id} className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <span className="text-brand-gold font-serif italic text-lg">{qty}x</span>
                          <span className="text-brand-slate font-bold text-sm tracking-tight">{item.name}</span>
                        </div>
                        <span className="text-brand-burgundy font-bold text-sm">€{(item.price * qty).toFixed(2)}</span>
                      </div>
                    )
                  })}
                  
                  <div className="pt-6 border-t border-brand-gold/10 mt-6 flex justify-between items-center">
                    <span className="text-brand-slate/40 font-bold uppercase tracking-widest text-xs">Totale Finale</span>
                    <span className="text-3xl font-serif font-black text-brand-burgundy">€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={confirmOrder} className="space-y-8 text-left">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold flex items-center gap-2">
                       Dove ti trovi?
                    </label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" />
                      <input 
                        type="text" 
                        required
                        placeholder="Es. Ombrellone 42" 
                        value={locationCode}
                        onChange={(e) => setLocationCode(e.target.value)}
                        className="w-full bg-white border border-brand-gold/10 rounded-2xl pl-12 pr-4 py-5 text-base focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-serif font-bold placeholder:font-sans placeholder:font-medium placeholder:text-brand-slate/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold flex items-center gap-2">
                       Il tuo nome
                    </label>
                    <input
                      type="text" required placeholder="Nome e Cognome" value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-brand-gold/10 rounded-2xl px-4 py-5 text-base focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-serif font-bold placeholder:font-sans placeholder:font-medium placeholder:text-brand-slate/30"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold flex items-center gap-2">
                       La tua email
                    </label>
                    <input
                      type="email" required placeholder="email@esempio.com" value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-white border border-brand-gold/10 rounded-2xl px-4 py-5 text-base focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-serif font-bold placeholder:font-sans placeholder:font-medium placeholder:text-brand-slate/30"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">
                       Metodo di pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative border-2 border-brand-burgundy bg-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-brand-burgundy/5">
                        <CheckCircle2 size={16} className="absolute top-2 right-2 text-brand-burgundy" />
                        <CreditCard size={20} className="text-brand-burgundy" />
                        <span className="font-bold text-[10px] uppercase tracking-wider text-brand-burgundy">Carta Online</span>
                      </div>
                      <div className="relative border border-brand-gold/10 bg-brand-slate/[0.02] p-4 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-60">
                         <span className="text-lg opacity-30">💶</span>
                        <span className="font-bold text-[10px] uppercase tracking-wider text-brand-slate/40 text-center">In Cassa</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-burgundy text-white rounded-2xl py-5 font-serif font-black text-xl hover:bg-black transition-all shadow-xl shadow-brand-burgundy/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Effettua Ordine'}
                  </button>
                  <p className="text-center text-[9px] text-brand-slate/30 font-bold uppercase tracking-widest">Servizio garantito Riva Beach Salento</p>
                </form>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
