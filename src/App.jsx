import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Search, ShoppingBag, Home, Settings } from 'lucide-react'
import RivaBeachBar from './RivaBeachBar'
import RivaRestaurant from './RivaRestaurant'
import RivaAperitivi from './RivaAperitivi'
import RivaVip from './RivaVip'
import RivaTakeaway from './RivaTakeaway'
import RivaEvents from './RivaEvents'
import AdminDashboard from './AdminDashboard'

const services = [
  { id: 'restaurant', name: 'Riva Restaurant', icon: '🍽️', desc: 'Fine dining & specialità di pesce', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: 'bar', name: 'Riva Beach Bar', icon: '🍸', desc: 'Cocktail & Food servito all\'ombrellone', image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: 'aperitive', name: 'Riva Aperitivi', icon: '🌅', desc: 'L\'emozione del tramonto salentino', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: 'vip', name: 'Riva VIP', icon: '👑', desc: 'Cabane esclusive e Bottle Service', image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: 'takeaway', name: 'Prendi e Vai', icon: '🥡', desc: 'Ordina online e ritira senza attese', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: 'events', name: 'Riva Eventi', icon: '🎉', desc: 'Matrimoni, Feste & Eventi Private', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800&h=600' },
]

function App() {
  const [activeArea, setActiveArea] = useState(null)

  // Render the selected area block
  if (activeArea === 'bar') {
    return <RivaBeachBar onBack={() => setActiveArea(null)} />
  }
  if (activeArea === 'restaurant') {
    return <RivaRestaurant onBack={() => setActiveArea(null)} />
  }
  if (activeArea === 'aperitive') {
    return <RivaAperitivi onBack={() => setActiveArea(null)} />
  }
  if (activeArea === 'vip') {
    return <RivaVip onBack={() => setActiveArea(null)} />
  }
  if (activeArea === 'takeaway') {
    return <RivaTakeaway onBack={() => setActiveArea(null)} />
  }
  if (activeArea === 'events') {
    return <RivaEvents onBack={() => setActiveArea(null)} />
  }
  if (activeArea === 'admin') {
    return <AdminDashboard onBack={() => setActiveArea(null)} />
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-slate font-sans selection:bg-brand-gold/20 max-w-md md:max-w-none mx-auto relative shadow-2xl md:shadow-none overflow-hidden border-x border-brand-gold/10 md:border-x-0">

      {/* HERO SECTION */}
      <div className="relative h-[48vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=95&w=1200&h=800"
          alt="Riva Beach Salento"
          className="w-full h-full object-cover scale-105 animate-subtle-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-cream via-transparent to-black/30"></div>

        {/* LOGO AREA */}
        <div className="absolute top-10 md:top-16 left-0 right-0 flex flex-col items-center">
          <div className="flex flex-col items-center gap-1">
             <span className="text-brand-gold text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-1">Benvenuti a</span>
             <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black text-brand-burgundy tracking-tight drop-shadow-sm flex flex-col items-center">
               Riva Beach
               <span className="text-brand-gold text-lg md:text-xl tracking-widest mt-[-8px]">SALENTO</span>
             </h1>
          </div>
        </div>

        <div className="absolute bottom-12 md:bottom-16 left-8 right-8 md:text-center">
          <p className="text-brand-burgundy font-serif italic text-xl md:text-3xl">L'eleganza del mare,</p>
          <p className="text-brand-slate font-bold text-sm md:text-base uppercase tracking-widest opacity-80">Punta Prosciutto</p>
        </div>
      </div>

      {/* QUICK STATUS */}
      <div className="px-8 -mt-6 relative z-10 flex justify-center">
        <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-brand-gold/20 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-brand-slate/60 uppercase tracking-widest">Aperto ora</span>
          </div>
          <div className="h-4 w-[1px] bg-brand-gold/30"></div>
          <span className="text-brand-gold text-xs font-bold tracking-widest uppercase">Fine Dining Beach</span>
        </div>
      </div>

      {/* SERVICE LIST */}
      <main className="px-6 md:px-12 lg:px-20 py-10 pb-32 space-y-8 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="h-[1px] w-12 bg-brand-gold mx-auto mb-3"></div>
          <h2 className="text-sm md:text-base font-bold text-brand-gold uppercase tracking-[0.4em] mb-1">Esplora il Riva</h2>
          <p className="text-brand-slate/50 text-[10px] md:text-xs uppercase font-bold tracking-wider">Esperienze d'Eccellenza</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setActiveArea(service.id)}
              className="w-full relative group outline-none"
            >
              <div className="relative h-44 md:h-56 lg:h-64 rounded-2xl overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:shadow-brand-gold/10">
                <img src={service.image} alt={service.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-brand-slate/10 group-hover:bg-brand-burgundy/20 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-slate/80 via-transparent to-transparent"></div>

                {/* BOTTOM TITLE BAR */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl drop-shadow-md">{service.icon}</span>
                      <h3 className="text-white font-serif text-2xl font-bold tracking-tight">{service.name}</h3>
                    </div>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest leading-none">{service.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </main>

      {/* BOTTOM NAV BAR (MINIMAL LUXURY) */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-none bg-white/95 backdrop-blur-md border-t border-brand-gold/10 pb-safe z-50">
        <div className="max-w-md mx-auto flex justify-around p-4 items-center">
          <button className="flex flex-col items-center gap-1 group">
            <div className="text-brand-burgundy font-bold text-lg"><Home size={20} /></div>
            <span className="text-[9px] font-bold text-brand-burgundy uppercase tracking-widest">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-brand-slate/30">
            <Search size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Menu</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-brand-slate/30">
            <ShoppingBag size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Carrello</span>
          </button>
          <button onClick={() => setActiveArea('admin')} className="flex flex-col items-center gap-1 text-brand-slate/30">
            <Settings size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Admin</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

const styleElement = document.createElement('style')
styleElement.innerHTML = `
@keyframes subtle-zoom {
  0% { transform: scale(1.05); }
  100% { transform: scale(1.15); }
}
.animate-subtle-zoom {
  animation: subtle-zoom 30s infinite alternate ease-in-out;
}
`
document.head.appendChild(styleElement)

export default App
