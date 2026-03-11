import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import RivaBeachBar from './RivaBeachBar'
import RivaRestaurant from './RivaRestaurant'
import RivaAperitivi from './RivaAperitivi'
import RivaVip from './RivaVip'
import RivaTakeaway from './RivaTakeaway'
import RivaEvents from './RivaEvents'

const services = [
  { id: 'bar', name: 'Riva Beach Bar', icon: '🍸', desc: 'Cocktail & Food sul lettino', image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc3b?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: 'restaurant', name: 'Riva Restaurant', icon: '🍽️', desc: 'Fine dining vista mare', image: 'https://images.unsplash.com/photo-1544124499-58912cbddada?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: 'aperitive', name: 'Riva Aperitivi', icon: '🌅', desc: 'Sunset Experience Salento', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: 'vip', name: 'Riva VIP', icon: '👑', desc: 'Cabane & Bottle Service', image: 'https://images.unsplash.com/photo-1490650404312-a2175773bbf5?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: 'takeaway', name: 'Prendi e Vai', icon: '🥡', desc: 'Salta la fila, goditi il sole', image: 'https://images.unsplash.com/photo-1560611588-b6bd5720f6c1?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: 'events', name: 'Riva Eventi', icon: '🎉', desc: 'Matrimoni & Feste Private', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800&h=600' },
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

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-800 font-sans selection:bg-blue-200 max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* HERO SECTION */}
      <div className="relative h-[45vh] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1533727937480-da3a97967e95?auto=format&fit=crop&q=100&w=1200&h=800" 
          alt="Riva Beach Punta Prosciutto" 
          className="w-full h-full object-cover scale-110 animate-subtle-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] via-black/20 to-black/40"></div>
        
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <span className="text-[10px] font-bold text-white uppercase tracking-widest">Aperto ora</span>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
            <span>👤</span>
          </button>
        </div>

        <div className="absolute bottom-10 left-6 right-6">
          <h1 className="text-4xl font-black text-white leading-tight tracking-tighter drop-shadow-lg">
            Riva Beach <br/><span className="text-blue-200">Experience</span>
          </h1>
          <p className="text-white/80 text-sm font-medium mt-2 max-w-[240px]">L'anima del Salento a Punta Prosciutto.</p>
        </div>
      </div>

      {/* SEARCH/QUICK LINKS BAR */}
      <div className="px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-4 flex justify-between items-center border border-neutral-100">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Cosa cerchi?</span>
            <span className="text-sm font-bold text-neutral-800">Scegli il tuo Riva...</span>
          </div>
          <span className="text-2xl opacity-30">🌊</span>
        </div>
      </div>

      {/* SERVICE LIST */}
      <main className="px-6 py-8 pb-32 space-y-6">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Servizi Esclusivi</h2>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">2026 EDITION</span>
        </div>

        <div className="space-y-4">
          {services.map((service, idx) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setActiveArea(service.id)}
              className="w-full relative h-32 rounded-[2rem] overflow-hidden group shadow-md hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <img src={service.image} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all"></div>
              
              <div className="absolute inset-0 p-6 flex flex-col justify-center items-start">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl scale-125 group-hover:rotate-12 transition-transform">{service.icon}</span>
                  <h3 className="text-white font-black text-xl tracking-tight">{service.name}</h3>
                </div>
                <p className="text-white/70 text-xs font-medium">{service.desc}</p>
              </div>

              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <ChevronRight size={16} className="text-white" />
              </div>
            </motion.button>
          ))}
        </div>
      </main>

      {/* BOTTOM NAV BAR (REFINED) */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-neutral-100 pb-safe z-50">
        <div className="max-w-md mx-auto flex justify-around p-4">
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">🏠</div>
            <span className="text-[10px] font-bold text-blue-600">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-neutral-400 opacity-60">
            <div className="w-10 h-10 flex items-center justify-center">🔍</div>
            <span className="text-[10px] font-bold">Esplora</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-neutral-400 opacity-60">
            <div className="w-10 h-10 flex items-center justify-center">🛒</div>
            <span className="text-[10px] font-bold">Ordini</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

const style = document.createElement('style')
style.innerHTML = `
@keyframes subtle-zoom {
  0% { transform: scale(1.1); }
  100% { transform: scale(1.2); }
}
.animate-subtle-zoom {
  animation: subtle-zoom 20s infinite alternate ease-in-out;
}
`
document.head.appendChild(style)


export default App
