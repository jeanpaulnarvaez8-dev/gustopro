import { useState } from 'react'

const barMenu = [
  { id: '1', category: 'Cocktails', name: 'Riva Spritz', desc: 'Aperol, Prosecco, Soda, Arancia', price: 12.00, image: '🍹' },
  { id: '2', category: 'Cocktails', name: 'Mojito Beach', desc: 'Rum, Lime, Menta, Zucchero di Canna, Soda', price: 14.00, image: '🌿' },
  { id: '3', category: 'Snacks', name: 'Tagliere di Mare', desc: 'Salmone affumicato, ostriche, gamberi', price: 28.00, image: '🍤' },
  { id: '4', category: 'Snacks', name: 'Club Sandwich', desc: 'Pollo, bacon, uovo, pomodoro, lattuga, patatine', price: 18.00, image: '🥪' },
  { id: '5', category: 'Analcolici', name: 'Virgin Colada', desc: 'Ananas, Cocco, Latte', price: 10.00, image: '🥥' },
]

export default function RivaBeachBar({ onBack }) {
  const [activeCategory, setActiveCategory] = useState('Tutti')
  const [cart, setCart] = useState([])

  const categories = ['Tutti', ...new Set(barMenu.map(item => item.category))]

  const filteredMenu = activeCategory === 'Tutti' 
    ? barMenu 
    : barMenu.filter(item => item.category === activeCategory)

  const addToCart = (item) => {
    setCart([...cart, item])
  }

  const getTotal = () => cart.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="animate-fade-in bg-neutral-50 min-h-screen">
      <div className="bg-orange-500 text-white p-6 pb-8 rounded-b-3xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <button 
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition"
        >
          ← Home
        </button>
        <h2 className="text-3xl font-bold mb-1">Riva Beach Bar</h2>
        <p className="text-orange-100">Ordina direttamente al tuo ombrellone</p>
      </div>

      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-2 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? 'bg-orange-500 text-white shadow-sm' 
                  : 'bg-transparent text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 space-y-4 pb-32">
        {filteredMenu.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex gap-4">
            <div className="w-20 h-20 rounded-xl bg-orange-50 flex items-center justify-center text-4xl shrink-0">
              {item.image}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-neutral-900">{item.name}</h3>
                <span className="font-bold text-orange-600">€{item.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
                {item.desc}
              </p>
              <button 
                onClick={() => addToCart(item)}
                className="w-full py-2 bg-neutral-100 hover:bg-orange-50 text-orange-600 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>+</span> Aggiungi 
              </button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-20 left-0 w-full px-4 animate-slide-up">
          <div className="bg-neutral-900 text-white rounded-2xl p-4 flex justify-between items-center shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </div>
              <div>
                <p className="text-xs text-neutral-400">Totale ordine</p>
                <p className="font-bold text-lg">€{getTotal().toFixed(2)}</p>
              </div>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors">
              Paga ora
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
