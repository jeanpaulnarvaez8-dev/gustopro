import { useState } from 'react'
import RivaBeachBar from './RivaBeachBar'
import RivaRestaurant from './RivaRestaurant'
import RivaAperitivi from './RivaAperitivi'
import RivaVip from './RivaVip'

const services = [
  { id: 'bar', name: 'Riva Beach Bar', icon: '🍸', desc: 'Drink, snack & ordini ombrellone', color: 'bg-orange-500' },
  { id: 'restaurant', name: 'Riva Restaurant', icon: '🍽️', desc: 'Prenota il tuo tavolo esclusivo', color: 'bg-blue-600' },
  { id: 'aperitive', name: 'Riva Aperitivi', icon: '🌅', desc: 'Pacchetti aperitivo al tramonto', color: 'bg-rose-500' },
  { id: 'vip', name: 'Riva VIP', icon: '👑', desc: 'Cabane, bottle service e concierge', color: 'bg-amber-500' },
  { id: 'takeaway', name: 'Prendi e Vai', icon: '🥡', desc: 'Ordina e ritira senza code', color: 'bg-emerald-500' },
  { id: 'events', name: 'Riva Eventi', icon: '🎉', desc: 'Preventivi feste e matrimoni', color: 'bg-purple-600' },
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

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans selection:bg-blue-200 max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <h1 className="text-xl font-bold tracking-tight text-blue-900">Riva Beach</h1>
          </div>
          <button className="p-2 rounded-full hover:bg-neutral-100 transition">
            <span className="text-xl">👤</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-md mx-auto px-4 py-8 pb-24">
        {activeArea ? (
          <div className="animate-fade-in">
            <button 
              onClick={() => setActiveArea(null)}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition"
            >
              ← Torna alla Home
            </button>
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-neutral-100">
              <span className="text-6xl block mb-4">
                {services.find(s => s.id === activeArea).icon}
              </span>
              <h2 className="text-2xl font-bold mb-2">
                {services.find(s => s.id === activeArea).name}
              </h2>
              <p className="text-neutral-500 mb-8">
                L'interfaccia di questa sezione verrà sviluppata a breve.
              </p>
              <div className="animate-pulse flex justify-center">
                <div className="h-2 w-24 bg-neutral-200 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Benvenuto al Riva</h2>
              <p className="text-neutral-500">Seleziona il servizio che desideri utilizzare oggi.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setActiveArea(service.id)}
                  className={`${service.color} text-white p-5 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-start justify-between min-h-[140px] text-left relative overflow-hidden group`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-white/20 transition-all"></div>
                  <span className="text-3xl mb-3">{service.icon}</span>
                  <div>
                    <h3 className="font-bold leading-tight mb-1">{service.name}</h3>
                    <p className="text-xs text-white/80 leading-snug">{service.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAV BAR */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-neutral-100 pb-safe z-40">
        <div className="max-w-md mx-auto flex justify-around p-3">
          <button className="flex flex-col items-center gap-1 text-blue-600">
            <span>🏠</span>
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-900 transition">
            <span>🔍</span>
            <span className="text-[10px] font-medium">Esplora</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-900 transition">
            <span>🛒</span>
            <span className="text-[10px] font-medium">Ordini</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default App
