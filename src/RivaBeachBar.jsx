import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ShoppingBag, Plus, Minus, CreditCard, MapPin, X, CheckCircle2 } from 'lucide-react'

// Mock Data with realistic Unsplash images
const barMenu = [
  { id: '1', category: 'Cocktails', name: 'Riva Signature Spritz', desc: 'Aperol, Prosecco Superiore, Soda, Fetta d\'arancia bio', price: 14.00, image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: '2', category: 'Cocktails', name: 'Mojito Beach', desc: 'Rum Havana 7, Lime fresco, Menta, Zucchero di Canna, Soda', price: 16.00, image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: '3', category: 'Snacks', name: 'Tagliere Imperiale', desc: 'Salmone affumicato, ostriche Fine de Claire, gamberi rossi', price: 35.00, image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: '4', category: 'Snacks', name: 'Club Sandwich Gourmet', desc: 'Pollo ruspante, bacon croccante, uovo bio, pomodoro, lattuga, patatine dipper', price: 22.00, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: '5', category: 'Smoothies', name: 'Tropical Detox', desc: 'Ananas, Cocco, Mango, Zenzero', price: 12.00, image: 'https://images.unsplash.com/photo-1623065123547-4180d216fe81?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: '6', category: 'Smoothies', name: 'Berry Blast', desc: 'Mirtilli, Lamponi, Fragole, Latte di Mandorla', price: 12.00, image: 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?auto=format&fit=crop&q=80&w=400&h=400' },
]

export default function RivaBeachBar({ onBack }) {
  const [activeCategory, setActiveCategory] = useState('Tutti')
  const [cart, setCart] = useState({}) // { id: quantity }
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [locationCode, setLocationCode] = useState('')
  const [orderComplete, setOrderComplete] = useState(false)

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

  const confirmOrder = (e) => {
    e.preventDefault()
    if (!locationCode) return
    setIsCheckoutOpen(false)
    setOrderComplete(true)
    setTimeout(() => {
      setOrderComplete(false)
      setCart({})
      onBack()
    }, 3000)
  }

  // --- RENDERING ---

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in text-white">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={48} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-2">Ordine Ricevuto!</h2>
        <p className="text-neutral-400 mb-8 max-w-xs">
          Stiamo preparando il tuo ordine. Arriverà presto alla postazione <strong className="text-white">{locationCode}</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-neutral-50 min-h-screen font-sans selection:bg-orange-200">
      
      {/* HEADER HERO */}
      <div className="bg-neutral-900 text-white p-6 pb-20 rounded-b-[2rem] relative overflow-hidden shadow-lg border-b border-orange-500/20">
        {/* Abstract blur background */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]"></div>
        <div className="absolute -left-10 top-20 w-40 h-40 bg-blue-500/20 rounded-full blur-[60px]"></div>
        
        <button 
          onClick={onBack}
          className="relative z-10 mb-6 flex items-center gap-1 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} /> Home
        </button>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Riva Beach Bar</h2>
          <p className="text-neutral-400 text-sm md:text-base font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Ordina dall'ombrellone
          </p>
        </div>
      </div>

      {/* CATEGORIES PILLS */}
      <div className="px-4 -mt-8 relative z-20">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 p-2 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-neutral-900 text-white shadow-md shadow-neutral-900/10' 
                  : 'bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MENU LIST */}
      <div className="px-4 py-8 space-y-6 pb-40">
        <AnimatePresence mode="popLayout">
          {filteredMenu.map(item => {
            const qty = getItemQuantity(item.id)
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                key={item.id} 
                className="bg-white p-3 rounded-3xl shadow-sm border border-neutral-100/50 flex gap-4 transition-all duration-300 hover:shadow-md"
              >
                <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-neutral-100 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  {/* Premium badge via CSS overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <span className="absolute bottom-2 left-2 font-bold text-white text-sm shadow-sm">
                    €{item.price.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col pt-1">
                  <h3 className="font-bold text-neutral-900 leading-tight mb-1 pr-2">{item.name}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-auto pr-2">
                    {item.desc}
                  </p>
                  
                  <div className="mt-3 flex justify-end">
                    {qty === 0 ? (
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-10 h-10 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-sm"
                        aria-label="Aggiungi al carrello"
                      >
                        <Plus size={20} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-4 bg-neutral-50 rounded-full p-1 border border-neutral-200">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-full transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold w-4 text-center text-sm">{qty}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-neutral-900 text-white rounded-full shadow-sm hover:bg-neutral-800 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
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
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 w-full px-4 z-40"
          >
            <button 
              onClick={handleCheckout}
              className="w-full bg-neutral-900 text-white rounded-[2rem] p-4 flex justify-between items-center shadow-2xl shadow-black/20 hover:scale-[1.02] transition-transform active:scale-100"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag size={24} className="text-orange-400" />
                  <span className="absolute -top-2 -right-2 bg-white text-neutral-900 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Totale ordine</p>
                  <p className="font-bold text-lg leading-none mt-0.5">€{totalPrice.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white/10 px-5 py-2.5 rounded-full font-semibold text-sm backdrop-blur-md">
                Vai al modulo
              </div>
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
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50"
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 w-full bg-white rounded-t-[2.5rem] z-50 pt-2 pb-safe"
            >
              <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto my-3"></div>
              
              <div className="px-6 py-4 max-h-[85vh] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Riepilogo</h3>
                  <button onClick={() => setIsCheckoutOpen(false)} className="p-2 bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = barMenu.find(i => i.id === id)
                    if (!item) return null
                    return (
                      <div key={id} className="flex justify-between items-center text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <span className="bg-neutral-100 text-neutral-500 w-6 h-6 rounded-md flex items-center justify-center text-xs">{qty}x</span>
                          <span className="text-neutral-800">{item.name}</span>
                        </div>
                        <span className="text-neutral-900 font-bold">€{(item.price * qty).toFixed(2)}</span>
                      </div>
                    )
                  })}
                  
                  <div className="pt-4 border-t border-neutral-100 mt-4 flex justify-between items-center text-lg font-black">
                    <span>Totale</span>
                    <span className="text-orange-600">€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={confirmOrder} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                      <MapPin size={16} className="text-orange-500" />
                      Dove ti trovi?
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Es. Ombrellone 42, Tavolo Vip 3..." 
                      value={locationCode}
                      onChange={(e) => setLocationCode(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium placeholder:font-normal"
                    />
                  </div>

                  {/* Mock Payment Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                      <CreditCard size={16} className="text-orange-500" />
                      Metodo di pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="border-2 border-orange-500 bg-orange-50/50 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all">
                        <input type="radio" name="payment" defaultChecked className="hidden" />
                        <span className="font-bold text-sm text-orange-900">Carta / Apple Pay</span>
                      </label>
                      <label className="border border-neutral-200 opacity-50 bg-neutral-50 rounded-xl p-3 flex items-center justify-center gap-2 cursor-not-allowed">
                        <input type="radio" name="payment" disabled className="hidden" />
                        <span className="font-semibold text-sm text-neutral-500">Contanti</span>
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-neutral-900 text-white rounded-[1.5rem] py-4 font-bold text-lg hover:bg-black transition-colors shadow-xl shadow-neutral-900/20 active:scale-[0.98]"
                  >
                    Conferma e Paga €{totalPrice.toFixed(2)}
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
