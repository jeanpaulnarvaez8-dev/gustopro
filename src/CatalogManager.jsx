import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check, Eye, EyeOff, Loader2, UtensilsCrossed, MapPin, GlassWater, Crown } from 'lucide-react'
import { dashboard } from './lib/api'

const CATALOG_SECTIONS = [
  { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed },
  { id: 'zones', label: 'Zone', icon: MapPin },
  { id: 'aperitivo', label: 'Aperitivo', icon: GlassWater },
  { id: 'vip', label: 'VIP', icon: Crown },
]

const SERVICE_OPTIONS = [
  { value: 'BEACH_BAR', label: 'Beach Bar' },
  { value: 'TAKEAWAY', label: 'Takeaway' },
]

const ZONE_SERVICE_OPTIONS = [
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'APERITIVO', label: 'Aperitivo' },
]

export default function CatalogManager() {
  const [section, setSection] = useState('menu')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | 'new' | item id
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      let data
      if (section === 'menu') data = await dashboard.menuItems()
      else if (section === 'zones') data = await dashboard.zones()
      else if (section === 'aperitivo') data = await dashboard.aperitivoPackages()
      else data = await dashboard.vipPackages()
      setItems(data)
    } catch (err) {
      console.error('Catalog load failed:', err)
    } finally {
      setLoading(false)
    }
  }, [section])

  useEffect(() => { loadItems() }, [loadItems])

  const handleNew = () => {
    setEditing('new')
    if (section === 'menu') setForm({ serviceType: 'BEACH_BAR', category: '', name: '', description: '', price: '', isAvailable: true, sortOrder: 0 })
    else if (section === 'zones') setForm({ serviceType: 'RESTAURANT', name: '', description: '', supplement: '0', maxCapacity: '', isActive: true, sortOrder: 0 })
    else if (section === 'aperitivo') setForm({ name: '', description: '', price: '', includes: '', isPopular: false, isAvailable: true, sortOrder: 0 })
    else setForm({ type: 'CABANA', name: '', description: '', price: '', maxGuests: '', isAvailable: true, sortOrder: 0 })
  }

  const handleEdit = (item) => {
    setEditing(item.id)
    if (section === 'menu') {
      setForm({ serviceType: item.serviceType, category: item.category, name: item.name, description: item.description || '', price: item.price, isAvailable: item.isAvailable, sortOrder: item.sortOrder })
    } else if (section === 'zones') {
      setForm({ serviceType: item.serviceType, name: item.name, description: item.description || '', supplement: item.supplement, maxCapacity: item.maxCapacity || '', isActive: item.isActive, sortOrder: item.sortOrder })
    } else if (section === 'aperitivo') {
      setForm({ name: item.name, description: item.description || '', price: item.price, includes: (item.includes || []).join(', '), isPopular: item.isPopular, isAvailable: item.isAvailable, sortOrder: item.sortOrder })
    } else {
      setForm({ type: item.type, name: item.name, description: item.description || '', price: item.price, maxGuests: item.maxGuests || '', isAvailable: item.isAvailable, sortOrder: item.sortOrder })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = { ...form }

      // Parse numeric fields
      if (data.price !== undefined) data.price = Number(data.price)
      if (data.supplement !== undefined) data.supplement = Number(data.supplement)
      if (data.maxCapacity !== undefined) data.maxCapacity = data.maxCapacity ? Number(data.maxCapacity) : null
      if (data.maxGuests !== undefined) data.maxGuests = data.maxGuests ? Number(data.maxGuests) : null
      if (data.sortOrder !== undefined) data.sortOrder = Number(data.sortOrder)

      // Parse includes for aperitivo
      if (section === 'aperitivo' && typeof data.includes === 'string') {
        data.includes = data.includes.split(',').map(s => s.trim()).filter(Boolean)
      }

      if (editing === 'new') {
        if (section === 'menu') await dashboard.createMenuItem(data)
        else if (section === 'zones') await dashboard.createZone(data)
        else if (section === 'aperitivo') await dashboard.createAperitivoPackage(data)
        else await dashboard.createVipPackage(data)
      } else {
        if (section === 'menu') await dashboard.updateMenuItem(editing, data)
        else if (section === 'zones') await dashboard.updateZone(editing, data)
        else if (section === 'aperitivo') await dashboard.updateAperitivoPackage(editing, data)
        else await dashboard.updateVipPackage(editing, data)
      }
      setEditing(null)
      await loadItems()
    } catch (err) {
      console.error('Save failed:', err)
      alert('Errore nel salvataggio. Riprova.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questo elemento?')) return
    try {
      if (section === 'menu') await dashboard.deleteMenuItem(id)
      else if (section === 'zones') await dashboard.deleteZone(id)
      else if (section === 'aperitivo') await dashboard.deleteAperitivoPackage(id)
      else await dashboard.deleteVipPackage(id)
      await loadItems()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleToggle = async (item) => {
    try {
      const field = section === 'zones' ? 'isActive' : 'isAvailable'
      const val = !item[field]
      if (section === 'menu') await dashboard.updateMenuItem(item.id, { [field]: val })
      else if (section === 'zones') await dashboard.updateZone(item.id, { [field]: val })
      else if (section === 'aperitivo') await dashboard.updateAperitivoPackage(item.id, { [field]: val })
      else await dashboard.updateVipPackage(item.id, { [field]: val })
      await loadItems()
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  const isActive = (item) => section === 'zones' ? item.isActive : item.isAvailable

  return (
    <div className="space-y-6">
      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {CATALOG_SECTIONS.map(s => {
          const Icon = s.icon
          return (
            <button key={s.id} onClick={() => { setSection(s.id); setEditing(null) }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${section === s.id ? 'bg-brand-burgundy text-white shadow-lg' : 'bg-white text-brand-slate/50 border border-brand-gold/10 hover:border-brand-gold/30'}`}>
              <Icon size={14} />
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Add button */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-brand-slate/40 uppercase tracking-wider">{items.length} elementi</span>
        <button onClick={handleNew}
          className="flex items-center gap-2 bg-brand-burgundy text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-all shadow-lg">
          <Plus size={16} /> Aggiungi
        </button>
      </div>

      {/* Edit/New form */}
      <AnimatePresence>
        {editing !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-brand-gold/10 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-serif font-black text-brand-burgundy italic text-lg">
                  {editing === 'new' ? 'Nuovo Elemento' : 'Modifica'}
                </h4>
                <button onClick={() => setEditing(null)} className="text-brand-slate/30 hover:text-brand-burgundy transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Service type for menu items */}
                {section === 'menu' && (
                  <FormSelect label="Servizio" value={form.serviceType} options={SERVICE_OPTIONS}
                    onChange={v => setForm(f => ({ ...f, serviceType: v }))} />
                )}
                {section === 'zones' && (
                  <FormSelect label="Servizio" value={form.serviceType} options={ZONE_SERVICE_OPTIONS}
                    onChange={v => setForm(f => ({ ...f, serviceType: v }))} />
                )}
                {section === 'vip' && (
                  <FormSelect label="Tipo" value={form.type} options={[{ value: 'CABANA', label: 'Cabana' }, { value: 'BOTTLE', label: 'Bottle Service' }]}
                    onChange={v => setForm(f => ({ ...f, type: v }))} />
                )}

                {/* Common: Name */}
                <FormInput label="Nome" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />

                {/* Menu: Category */}
                {section === 'menu' && (
                  <FormInput label="Categoria" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} placeholder="es. Panini, Cocktails" />
                )}

                {/* Price / Supplement */}
                {section !== 'zones' && (
                  <FormInput label="Prezzo (€)" value={form.price} type="number" step="0.01" onChange={v => setForm(f => ({ ...f, price: v }))} />
                )}
                {section === 'zones' && (
                  <FormInput label="Supplemento (€)" value={form.supplement} type="number" step="0.01" onChange={v => setForm(f => ({ ...f, supplement: v }))} />
                )}

                {/* Capacity / Guests */}
                {section === 'zones' && (
                  <FormInput label="Capienza Max" value={form.maxCapacity} type="number" onChange={v => setForm(f => ({ ...f, maxCapacity: v }))} />
                )}
                {section === 'vip' && (
                  <FormInput label="Max Ospiti" value={form.maxGuests} type="number" onChange={v => setForm(f => ({ ...f, maxGuests: v }))} />
                )}

                {/* Aperitivo: includes */}
                {section === 'aperitivo' && (
                  <FormInput label="Include (separati da virgola)" value={form.includes} onChange={v => setForm(f => ({ ...f, includes: v }))} placeholder="Drink, Tagliere, DJ Set" />
                )}

                {/* Sort order */}
                <FormInput label="Ordine" value={form.sortOrder} type="number" onChange={v => setForm(f => ({ ...f, sortOrder: v }))} />

                {/* Description (full width) */}
                <div className="md:col-span-2 lg:col-span-3">
                  <FormInput label="Descrizione" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-brand-gold/10">
                <button onClick={() => setEditing(null)} className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-brand-slate/50 hover:text-brand-burgundy transition-colors">
                  Annulla
                </button>
                <button onClick={handleSave} disabled={saving || !form.name}
                  className="flex items-center gap-2 bg-brand-burgundy text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-all disabled:opacity-50">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {editing === 'new' ? 'Crea' : 'Salva'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-brand-burgundy" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-gold/10 overflow-hidden">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[1fr_120px_100px_80px_100px] gap-4 px-6 py-3 bg-brand-cream/50 border-b border-brand-gold/10 text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate/40">
            <span>Nome / Dettagli</span>
            <span>{section === 'zones' ? 'Supplemento' : 'Prezzo'}</span>
            <span>{section === 'menu' ? 'Servizio' : section === 'zones' ? 'Servizio' : section === 'vip' ? 'Tipo' : 'Popolare'}</span>
            <span>Stato</span>
            <span>Azioni</span>
          </div>

          {items.length === 0 ? (
            <div className="p-12 text-center text-brand-slate/30 font-bold text-sm uppercase tracking-wider">
              Nessun elemento trovato
            </div>
          ) : (
            <div className="divide-y divide-brand-gold/5">
              {items.map(item => (
                <div key={item.id} className={`px-4 md:px-6 py-4 transition-colors ${isActive(item) ? 'hover:bg-brand-cream/30' : 'bg-brand-cream/20 opacity-60'}`}>
                  {/* Mobile */}
                  <div className="md:hidden">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-serif font-bold text-brand-burgundy text-lg">{item.name}</p>
                        <p className="text-xs text-brand-slate/50">
                          {section === 'menu' && `${item.category} · ${item.serviceType === 'BEACH_BAR' ? 'Beach Bar' : 'Takeaway'}`}
                          {section === 'zones' && `${item.serviceType === 'RESTAURANT' ? 'Restaurant' : 'Aperitivo'}${item.maxCapacity ? ` · Max ${item.maxCapacity}` : ''}`}
                          {section === 'aperitivo' && (item.includes || []).slice(0, 3).join(', ')}
                          {section === 'vip' && `${item.type}${item.maxGuests ? ` · Max ${item.maxGuests}` : ''}`}
                        </p>
                      </div>
                      <span className="font-serif font-bold text-brand-gold">
                        {section === 'zones' ? (Number(item.supplement) > 0 ? `+€${Number(item.supplement).toFixed(0)}` : 'Free') : `€${Number(item.price).toFixed(0)}`}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleToggle(item)} className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${isActive(item) ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {isActive(item) ? 'Attivo' : 'Inattivo'}
                      </button>
                      <button onClick={() => handleEdit(item)} className="w-7 h-7 rounded-lg bg-brand-cream flex items-center justify-center text-brand-slate/50 hover:text-brand-burgundy"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(item.id)} className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-[1fr_120px_100px_80px_100px] gap-4 items-center">
                    <div>
                      <p className="font-serif font-bold text-brand-burgundy">{item.name}</p>
                      <p className="text-[11px] text-brand-slate/40">
                        {item.description || (section === 'menu' ? item.category : '')}
                      </p>
                    </div>
                    <span className="font-serif font-bold text-brand-gold text-sm">
                      {section === 'zones' ? (Number(item.supplement) > 0 ? `+€${Number(item.supplement).toFixed(2)}` : 'Free') : `€${Number(item.price).toFixed(2)}`}
                    </span>
                    <span className="text-xs font-bold text-brand-slate/60">
                      {section === 'menu' && (item.serviceType === 'BEACH_BAR' ? 'Beach Bar' : 'Takeaway')}
                      {section === 'zones' && (item.serviceType === 'RESTAURANT' ? 'Restaurant' : 'Aperitivo')}
                      {section === 'vip' && item.type}
                      {section === 'aperitivo' && (item.isPopular ? '⭐ Popolare' : '-')}
                    </span>
                    <button onClick={() => handleToggle(item)} title={isActive(item) ? 'Disattiva' : 'Attiva'}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive(item) ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}>
                      {isActive(item) ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(item)} className="w-8 h-8 rounded-lg bg-brand-cream flex items-center justify-center text-brand-slate/50 hover:text-brand-burgundy transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FormInput({ label, value, onChange, type = 'text', placeholder, step }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-1.5 block">{label}</label>
      <input type={type} step={step} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-brand-cream/50 border border-brand-gold/10 rounded-xl px-4 py-2.5 text-sm font-bold text-brand-slate outline-none focus:ring-2 focus:ring-brand-gold/20" />
    </div>
  )
}

function FormSelect({ label, value, options, onChange }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-1.5 block">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-brand-cream/50 border border-brand-gold/10 rounded-xl px-4 py-2.5 text-sm font-bold text-brand-slate outline-none focus:ring-2 focus:ring-brand-gold/20">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
