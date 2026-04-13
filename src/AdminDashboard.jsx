import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, BarChart3, Calendar, Users, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, Search, RefreshCw, Loader2, Lock, ShoppingBag, UtensilsCrossed, Bell, Settings, Save } from 'lucide-react'
import { dashboard } from './lib/api'
import CatalogManager from './CatalogManager'

const ADMIN_PIN = '2024'

const SERVICE_LABELS = {
  BEACH_BAR: 'Beach Bar',
  RESTAURANT: 'Restaurant',
  APERITIVO: 'Aperitivo',
  VIP_CABANA: 'VIP Cabana',
  VIP_BOTTLE: 'VIP Bottle',
  TAKEAWAY: 'Takeaway',
  EVENTS: 'Eventi',
}

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
}

export default function AdminDashboard({ onBack }) {
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [activeTab, setActiveTab] = useState('bookings') // bookings | customers | catalog

  const [stats, setStats] = useState(null)
  const [bookingsList, setBookingsList] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filters
  const [serviceFilter, setServiceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  // Detail panel
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [noteInput, setNoteInput] = useState('')

  // Customers
  const [customersList, setCustomersList] = useState([])

  // Settings
  const [settingsData, setSettingsData] = useState(null)
  const [settingsForm, setSettingsForm] = useState({})
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  // Notifications
  const [notifList, setNotifList] = useState([])
  const [notifPage, setNotifPage] = useState(1)
  const [notifTotalPages, setNotifTotalPages] = useState(1)
  const [notifTotal, setNotifTotal] = useState(0)
  const [customersPage, setCustomersPage] = useState(1)
  const [customersTotalPages, setCustomersTotalPages] = useState(1)
  const [customersTotal, setCustomersTotal] = useState(0)

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [statsData, bookingsData] = await Promise.all([
        dashboard.stats(),
        dashboard.bookings({ service: serviceFilter || undefined, status: statusFilter || undefined, date: dateFilter || undefined, page, limit: 15 })
      ])
      setStats(statsData)
      setBookingsList(bookingsData.bookings)
      setTotal(bookingsData.pagination.total)
      setTotalPages(bookingsData.pagination.pages)
    } catch (err) {
      console.error('Dashboard load failed:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [serviceFilter, statusFilter, dateFilter, page])

  const loadCustomers = useCallback(async () => {
    try {
      const data = await dashboard.customers({ page: customersPage, limit: 20 })
      setCustomersList(data.customers)
      setCustomersTotal(data.pagination.total)
      setCustomersTotalPages(data.pagination.pages)
    } catch (err) {
      console.error('Customers load failed:', err)
    }
  }, [customersPage])

  const loadSettings = useCallback(async () => {
    try {
      const data = await dashboard.settings()
      setSettingsData(data)
      setSettingsForm({
        name: data.name || '',
        description: data.description || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        openingTime: data.openingTime || '10:00',
        closingTime: data.closingTime || '23:00',
        maxGuestsPerSlot: data.maxGuestsPerSlot || 50,
        cancellationHours: data.cancellationHours || 48,
      })
    } catch (err) {
      console.error('Settings load failed:', err)
    }
  }, [])

  const handleSaveSettings = async () => {
    setSettingsSaving(true)
    try {
      await dashboard.updateSettings(settingsForm)
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 2000)
    } catch (err) {
      console.error('Settings save failed:', err)
      alert('Errore nel salvataggio')
    } finally {
      setSettingsSaving(false)
    }
  }

  const loadNotifications = useCallback(async () => {
    try {
      const data = await dashboard.notifications({ page: notifPage, limit: 30 })
      setNotifList(data.notifications)
      setNotifTotal(data.pagination.total)
      setNotifTotalPages(data.pagination.pages)
    } catch (err) {
      console.error('Notifications load failed:', err)
    }
  }, [notifPage])

  useEffect(() => { if (authed) loadData() }, [loadData, authed])
  useEffect(() => { if (authed && activeTab === 'customers') loadCustomers() }, [loadCustomers, authed, activeTab])
  useEffect(() => { if (authed && activeTab === 'notifications') loadNotifications() }, [loadNotifications, authed, activeTab])
  useEffect(() => { if (authed && activeTab === 'settings') loadSettings() }, [loadSettings, authed, activeTab])

  const handlePin = (e) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      setAuthed(true)
      setPinError(false)
    } else {
      setPinError(true)
      setPin('')
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(true)
    try {
      await dashboard.updateBooking(id, { status: newStatus })
      await loadData(true)
      if (selectedBooking?.id === id) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      console.error('Update failed:', err)
    } finally {
      setUpdating(false)
    }
  }

  const handleAddNote = async (id) => {
    if (!noteInput.trim()) return
    setUpdating(true)
    try {
      await dashboard.updateBooking(id, { notes: noteInput })
      setNoteInput('')
      await loadData(true)
      setSelectedBooking(prev => ({ ...prev, notes: noteInput }))
    } catch (err) {
      console.error('Note update failed:', err)
    } finally {
      setUpdating(false)
    }
  }

  const resetFilters = () => {
    setServiceFilter('')
    setStatusFilter('')
    setDateFilter('')
    setPage(1)
  }

  const getBookingTitle = (b) => {
    if (b.eventType) return b.eventType
    if (b.orderNumber) return `#${b.orderNumber}`
    if (b.locationCode) return `Postazione ${b.locationCode}`
    return SERVICE_LABELS[b.serviceType] || b.serviceType
  }

  const getBookingSubtitle = (b) => {
    const parts = []
    if (b.date) parts.push(new Date(b.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }))
    if (b.timeSlot) parts.push(b.timeSlot)
    if (b.guests) parts.push(`${b.guests} ospiti`)
    if (b.eventGuests) parts.push(`${b.eventGuests} invitati`)
    if (b.pickupTime) parts.push(b.pickupTime)
    return parts.join(' \u00B7 ')
  }

  const getAmount = (b) => {
    if (b.totalAmount) return `\u20AC${Number(b.totalAmount).toFixed(0)}`
    if (b.depositAmount) return `\u20AC${Number(b.depositAmount).toFixed(0)}`
    return null
  }

  // ─── PIN GATE ──────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-brand-gold/10 w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-brand-burgundy rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock size={28} className="text-white" />
          </div>
          <h2 className="font-serif font-black text-2xl text-brand-burgundy italic mb-2">Area Riservata</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-slate/40 mb-8">Inserisci il PIN per accedere</p>
          <form onSubmit={handlePin} className="space-y-4">
            <input
              type="password" inputMode="numeric" maxLength={6} value={pin} onChange={e => { setPin(e.target.value); setPinError(false) }}
              placeholder="****"
              autoFocus
              className={`w-full text-center text-3xl font-serif font-black tracking-[0.5em] bg-brand-cream/50 border rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-brand-gold/20 ${pinError ? 'border-red-400 text-red-500' : 'border-brand-gold/10 text-brand-burgundy'}`}
            />
            {pinError && <p className="text-red-500 text-xs font-bold">PIN errato. Riprova.</p>}
            <button type="submit" className="w-full bg-brand-burgundy text-white rounded-2xl py-4 font-serif font-black text-lg hover:bg-black transition-all shadow-lg">
              Accedi
            </button>
          </form>
          <button onClick={onBack} className="mt-6 text-brand-slate/30 text-xs font-black uppercase tracking-widest hover:text-brand-burgundy transition-colors">
            Torna alla Home
          </button>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-brand-burgundy" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-slate">
      {/* HEADER */}
      <div className="bg-brand-burgundy text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="font-serif font-black text-2xl md:text-3xl italic tracking-tight">Riva Dashboard</h1>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">Gestione Prenotazioni</p>
            </div>
          </div>
          <button onClick={() => loadData(true)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* TAB NAV */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-1">
          <button onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-t-xl transition-all ${activeTab === 'bookings' ? 'bg-brand-cream text-brand-burgundy' : 'text-white/40 hover:text-white/70'}`}>
            Prenotazioni
          </button>
          <button onClick={() => setActiveTab('customers')}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-t-xl transition-all ${activeTab === 'customers' ? 'bg-brand-cream text-brand-burgundy' : 'text-white/40 hover:text-white/70'}`}>
            Clienti
          </button>
          <button onClick={() => setActiveTab('catalog')}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-t-xl transition-all flex items-center gap-2 ${activeTab === 'catalog' ? 'bg-brand-cream text-brand-burgundy' : 'text-white/40 hover:text-white/70'}`}>
            <UtensilsCrossed size={12} /> Catalogo
          </button>
          <button onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-t-xl transition-all flex items-center gap-2 ${activeTab === 'notifications' ? 'bg-brand-cream text-brand-burgundy' : 'text-white/40 hover:text-white/70'}`}>
            <Bell size={12} /> Notifiche
          </button>
          <button onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-t-xl transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-brand-cream text-brand-burgundy' : 'text-white/40 hover:text-white/70'}`}>
            <Settings size={12} /> Impostazioni
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* STATS CARDS */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Calendar} label="Oggi" value={stats.todayBookings} color="bg-brand-burgundy" />
            <StatCard icon={BarChart3} label="Totali" value={stats.totalBookings} color="bg-brand-slate" />
            <StatCard icon={AlertCircle} label="In Attesa" value={stats.pendingBookings} color="bg-amber-500" />
            <StatCard icon={CheckCircle2} label="Ricavi Sett." value={`\u20AC${stats.weekRevenue.toFixed(0)}`} color="bg-emerald-600" />
          </div>
        )}

        {/* ─── BOOKINGS TAB ─────────────────────────────────────────── */}
        {activeTab === 'bookings' && (
          <>
            {/* FILTERS */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-brand-gold/10 mb-6">
              <div className="flex flex-wrap gap-3 items-center">
                <select value={serviceFilter} onChange={e => { setServiceFilter(e.target.value); setPage(1) }}
                  className="bg-brand-cream/50 border border-brand-gold/10 rounded-xl px-4 py-2.5 text-sm font-bold text-brand-slate outline-none focus:ring-2 focus:ring-brand-gold/20">
                  <option value="">Tutti i Servizi</option>
                  {Object.entries(SERVICE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>

                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                  className="bg-brand-cream/50 border border-brand-gold/10 rounded-xl px-4 py-2.5 text-sm font-bold text-brand-slate outline-none focus:ring-2 focus:ring-brand-gold/20">
                  <option value="">Tutti gli Stati</option>
                  <option value="PENDING">In Attesa</option>
                  <option value="CONFIRMED">Confermato</option>
                  <option value="COMPLETED">Completato</option>
                  <option value="CANCELLED">Cancellato</option>
                </select>

                <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1) }}
                  className="bg-brand-cream/50 border border-brand-gold/10 rounded-xl px-4 py-2.5 text-sm font-bold text-brand-slate outline-none focus:ring-2 focus:ring-brand-gold/20" />

                {(serviceFilter || statusFilter || dateFilter) && (
                  <button onClick={resetFilters} className="text-brand-burgundy text-xs font-black uppercase tracking-widest hover:underline">
                    Reset
                  </button>
                )}

                <span className="ml-auto text-xs font-bold text-brand-slate/40 uppercase tracking-wider">
                  {total} risultati
                </span>
              </div>
            </div>

            {/* BOOKINGS LIST */}
            <div className="bg-white rounded-2xl shadow-sm border border-brand-gold/10 overflow-hidden">
              <div className="hidden md:grid grid-cols-[1fr_120px_140px_100px_80px_100px] gap-4 px-6 py-3 bg-brand-cream/50 border-b border-brand-gold/10 text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate/40">
                <span>Cliente / Dettagli</span>
                <span>Servizio</span>
                <span>Data</span>
                <span>Stato</span>
                <span>Importo</span>
                <span>Azioni</span>
              </div>

              {bookingsList.length === 0 ? (
                <div className="p-12 text-center text-brand-slate/30 font-bold text-sm uppercase tracking-wider">
                  Nessuna prenotazione trovata
                </div>
              ) : (
                <div className="divide-y divide-brand-gold/5">
                  {bookingsList.map(b => (
                    <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="px-4 md:px-6 py-4 hover:bg-brand-cream/30 transition-colors cursor-pointer"
                      onClick={() => { setSelectedBooking(b); setNoteInput(b.notes || '') }}>
                      {/* Mobile */}
                      <div className="md:hidden">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-serif font-bold text-brand-burgundy text-lg">{b.customer.name}</p>
                            <p className="text-xs text-brand-slate/50">{b.customer.email}</p>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-brand-slate/60">{SERVICE_LABELS[b.serviceType]} &middot; {getBookingSubtitle(b)}</p>
                          {getAmount(b) && <span className="font-serif font-bold text-brand-gold">{getAmount(b)}</span>}
                        </div>
                      </div>
                      {/* Desktop */}
                      <div className="hidden md:grid grid-cols-[1fr_120px_140px_100px_80px_100px] gap-4 items-center">
                        <div>
                          <p className="font-serif font-bold text-brand-burgundy">{b.customer.name}</p>
                          <p className="text-[11px] text-brand-slate/40">{b.customer.email} &middot; {getBookingTitle(b)}</p>
                        </div>
                        <span className="text-xs font-bold text-brand-slate/60">{SERVICE_LABELS[b.serviceType]}</span>
                        <span className="text-xs font-bold text-brand-slate/60">{getBookingSubtitle(b)}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-center ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                        <span className="font-serif font-bold text-brand-gold text-sm">{getAmount(b) || '-'}</span>
                        <div className="flex gap-1">
                          {b.status === 'PENDING' && (
                            <button onClick={e => { e.stopPropagation(); handleStatusUpdate(b.id, 'CONFIRMED') }}
                              className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors" title="Conferma">
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                            <button onClick={e => { e.stopPropagation(); handleStatusUpdate(b.id, 'COMPLETED') }}
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Completa">
                              <BarChart3 size={16} />
                            </button>
                          )}
                          {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                            <button onClick={e => { e.stopPropagation(); handleStatusUpdate(b.id, 'CANCELLED') }}
                              className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors" title="Cancella">
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-brand-gold/10 bg-brand-cream/30">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                    className="text-xs font-black uppercase tracking-widest text-brand-burgundy disabled:text-brand-slate/20 hover:underline">Precedente</button>
                  <span className="text-xs font-bold text-brand-slate/40">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="text-xs font-black uppercase tracking-widest text-brand-burgundy disabled:text-brand-slate/20 hover:underline">Successivo</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── NOTIFICATIONS TAB ────────────────────────────────────── */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl shadow-sm border border-brand-gold/10 overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_160px_140px_100px_160px] gap-4 px-6 py-3 bg-brand-cream/50 border-b border-brand-gold/10 text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate/40">
              <span>Destinatario / Oggetto</span>
              <span>Tipo</span>
              <span>Canale</span>
              <span>Stato</span>
              <span>Data</span>
            </div>

            {notifList.length === 0 ? (
              <div className="p-12 text-center text-brand-slate/30 font-bold text-sm uppercase tracking-wider">
                Nessuna notifica trovata
              </div>
            ) : (
              <div className="divide-y divide-brand-gold/5">
                {notifList.map(n => (
                  <div key={n.id} className="px-4 md:px-6 py-4 hover:bg-brand-cream/30 transition-colors">
                    {/* Mobile */}
                    <div className="md:hidden">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-serif font-bold text-brand-burgundy">{n.booking?.customer?.name || n.recipient}</p>
                          <p className="text-xs text-brand-slate/50 truncate max-w-[250px]">{n.subject || '-'}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${n.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' : n.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                          {n.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-brand-slate/40 font-bold">{n.type.replace(/_/g, ' ')} · {new Date(n.createdAt).toLocaleString('it-IT')}</p>
                    </div>
                    {/* Desktop */}
                    <div className="hidden md:grid grid-cols-[1fr_160px_140px_100px_160px] gap-4 items-center">
                      <div>
                        <p className="font-serif font-bold text-brand-burgundy text-sm">{n.booking?.customer?.name || 'N/A'}</p>
                        <p className="text-[11px] text-brand-slate/40 truncate">{n.subject || n.recipient}</p>
                      </div>
                      <span className="text-xs font-bold text-brand-slate/60">{n.type.replace(/_/g, ' ')}</span>
                      <span className="text-xs font-bold text-brand-slate/60 flex items-center gap-1.5">
                        <Bell size={12} className="text-brand-gold" /> {n.channel}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-center ${n.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' : n.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {n.status}
                      </span>
                      <span className="text-xs text-brand-slate/40">{new Date(n.createdAt).toLocaleString('it-IT')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {notifTotalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-brand-gold/10 bg-brand-cream/30">
                <button onClick={() => setNotifPage(p => Math.max(1, p - 1))} disabled={notifPage <= 1}
                  className="text-xs font-black uppercase tracking-widest text-brand-burgundy disabled:text-brand-slate/20 hover:underline">Precedente</button>
                <span className="text-xs font-bold text-brand-slate/40">{notifPage} / {notifTotalPages} ({notifTotal} notifiche)</span>
                <button onClick={() => setNotifPage(p => Math.min(notifTotalPages, p + 1))} disabled={notifPage >= notifTotalPages}
                  className="text-xs font-black uppercase tracking-widest text-brand-burgundy disabled:text-brand-slate/20 hover:underline">Successivo</button>
              </div>
            )}
          </div>
        )}

        {/* ─── SETTINGS TAB ─────────────────────────────────────────── */}
        {activeTab === 'settings' && settingsForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-brand-gold/10 p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-serif font-black text-brand-burgundy italic text-xl">Impostazioni Attività</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate/40 mt-1">Gestisci i dati del Riva Beach</p>
              </div>
              <button onClick={handleSaveSettings} disabled={settingsSaving}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg ${settingsSaved ? 'bg-emerald-500 text-white' : 'bg-brand-burgundy text-white hover:bg-black'} disabled:opacity-50`}>
                {settingsSaving ? <Loader2 size={14} className="animate-spin" /> : settingsSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                {settingsSaved ? 'Salvato!' : 'Salva'}
              </button>
            </div>

            <div className="space-y-8">
              {/* Business info */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-4">Informazioni</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SettingsField label="Nome Attività" value={settingsForm.name} onChange={v => setSettingsForm(f => ({ ...f, name: v }))} />
                  <SettingsField label="Email" value={settingsForm.email} type="email" onChange={v => setSettingsForm(f => ({ ...f, email: v }))} placeholder="info@gustopro.it" />
                  <SettingsField label="Telefono" value={settingsForm.phone} onChange={v => setSettingsForm(f => ({ ...f, phone: v }))} placeholder="+39 333 000 0000" />
                  <SettingsField label="Indirizzo" value={settingsForm.address} onChange={v => setSettingsForm(f => ({ ...f, address: v }))} placeholder="Punta Prosciutto, Lecce" />
                  <div className="md:col-span-2">
                    <SettingsField label="Descrizione" value={settingsForm.description} onChange={v => setSettingsForm(f => ({ ...f, description: v }))} placeholder="Una breve descrizione..." />
                  </div>
                </div>
              </div>

              {/* Operating hours */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-4">Orari di Apertura</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SettingsField label="Apertura" value={settingsForm.openingTime} type="time" onChange={v => setSettingsForm(f => ({ ...f, openingTime: v }))} />
                  <SettingsField label="Chiusura" value={settingsForm.closingTime} type="time" onChange={v => setSettingsForm(f => ({ ...f, closingTime: v }))} />
                  <SettingsField label="Max Ospiti/Slot" value={settingsForm.maxGuestsPerSlot} type="number" onChange={v => setSettingsForm(f => ({ ...f, maxGuestsPerSlot: v }))} />
                  <SettingsField label="Ore Cancellazione" value={settingsForm.cancellationHours} type="number" onChange={v => setSettingsForm(f => ({ ...f, cancellationHours: v }))} />
                </div>
              </div>

              {/* SMTP info */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-4">Email (SMTP)</p>
                <div className="bg-brand-cream/30 rounded-xl border border-brand-gold/5 p-4">
                  <p className="text-sm text-brand-slate/60">
                    Le notifiche email vengono registrate nella tab <strong>Notifiche</strong>.
                    <span className="block text-xs text-brand-slate/40 mt-1">
                      Per abilitare l'invio reale, configura le variabili SMTP_HOST, SMTP_USER, SMTP_PASS nel server.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── CATALOG TAB ──────────────────────────────────────────── */}
        {activeTab === 'catalog' && <CatalogManager />}

        {/* ─── CUSTOMERS TAB ────────────────────────────────────────── */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-2xl shadow-sm border border-brand-gold/10 overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_200px_80px_160px] gap-4 px-6 py-3 bg-brand-cream/50 border-b border-brand-gold/10 text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate/40">
              <span>Nome</span>
              <span>Email</span>
              <span>Prenotazioni</span>
              <span>Registrato il</span>
            </div>

            {customersList.length === 0 ? (
              <div className="p-12 text-center text-brand-slate/30 font-bold text-sm uppercase tracking-wider">
                Nessun cliente trovato
              </div>
            ) : (
              <div className="divide-y divide-brand-gold/5">
                {customersList.map(c => (
                  <div key={c.id} className="px-4 md:px-6 py-4 hover:bg-brand-cream/30 transition-colors">
                    {/* Mobile */}
                    <div className="md:hidden">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-serif font-bold text-brand-burgundy text-lg">{c.name}</p>
                          <p className="text-xs text-brand-slate/50">{c.email}</p>
                        </div>
                        <span className="bg-brand-cream text-brand-burgundy text-xs font-black px-3 py-1 rounded-full border border-brand-gold/10">
                          {c.bookings.length}
                        </span>
                      </div>
                      {c.bookings.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {c.bookings.slice(0, 4).map(b => (
                            <span key={b.id} className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLORS[b.status]}`}>
                              {SERVICE_LABELS[b.serviceType]?.split(' ')[0]}
                            </span>
                          ))}
                          {c.bookings.length > 4 && <span className="text-[8px] font-bold text-brand-slate/30">+{c.bookings.length - 4}</span>}
                        </div>
                      )}
                    </div>
                    {/* Desktop */}
                    <div className="hidden md:grid grid-cols-[1fr_200px_80px_160px] gap-4 items-center">
                      <p className="font-serif font-bold text-brand-burgundy">{c.name}</p>
                      <p className="text-xs text-brand-slate/50">{c.email}</p>
                      <div className="flex items-center gap-2">
                        <span className="bg-brand-cream text-brand-burgundy text-sm font-black px-3 py-1 rounded-full border border-brand-gold/10">{c.bookings.length}</span>
                      </div>
                      <p className="text-xs text-brand-slate/40">{new Date(c.createdAt).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {customersTotalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-brand-gold/10 bg-brand-cream/30">
                <button onClick={() => setCustomersPage(p => Math.max(1, p - 1))} disabled={customersPage <= 1}
                  className="text-xs font-black uppercase tracking-widest text-brand-burgundy disabled:text-brand-slate/20 hover:underline">Precedente</button>
                <span className="text-xs font-bold text-brand-slate/40">{customersPage} / {customersTotalPages} ({customersTotal} clienti)</span>
                <button onClick={() => setCustomersPage(p => Math.min(customersTotalPages, p + 1))} disabled={customersPage >= customersTotalPages}
                  className="text-xs font-black uppercase tracking-widest text-brand-burgundy disabled:text-brand-slate/20 hover:underline">Successivo</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOOKING DETAIL PANEL */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="fixed inset-0 bg-brand-slate/40 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">

              <div className="bg-brand-burgundy text-white p-6">
                <div className="flex justify-between items-start mb-4">
                  <button onClick={() => setSelectedBooking(null)} className="text-white/60 hover:text-white">
                    <XCircle size={24} />
                  </button>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full ${STATUS_COLORS[selectedBooking.status]}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <h2 className="font-serif font-black text-2xl italic">{selectedBooking.customer.name}</h2>
                <p className="text-white/60 text-sm">{selectedBooking.customer.email}</p>
                {selectedBooking.customer.phone && <p className="text-white/40 text-sm mt-1">{selectedBooking.customer.phone}</p>}
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <DetailField label="Servizio" value={SERVICE_LABELS[selectedBooking.serviceType]} />
                  {selectedBooking.date && <DetailField label="Data" value={new Date(selectedBooking.date).toLocaleDateString('it-IT')} />}
                  {selectedBooking.timeSlot && <DetailField label="Orario" value={selectedBooking.timeSlot} />}
                  {selectedBooking.guests && <DetailField label="Ospiti" value={selectedBooking.guests} />}
                  {selectedBooking.eventGuests && <DetailField label="Invitati" value={selectedBooking.eventGuests} />}
                  {selectedBooking.eventType && <DetailField label="Tipo Evento" value={selectedBooking.eventType} />}
                  {selectedBooking.orderNumber && <DetailField label="Ordine" value={`#${selectedBooking.orderNumber}`} />}
                  {selectedBooking.locationCode && <DetailField label="Postazione" value={selectedBooking.locationCode} />}
                  {selectedBooking.pickupTime && <DetailField label="Ritiro" value={selectedBooking.pickupTime} />}
                  {selectedBooking.zone && <DetailField label="Zona" value={selectedBooking.zone.name} />}
                  {selectedBooking.aperitivoPackage && <DetailField label="Pacchetto" value={selectedBooking.aperitivoPackage.name} />}
                  {selectedBooking.vipPackage && <DetailField label="VIP" value={selectedBooking.vipPackage.name} />}
                  {getAmount(selectedBooking) && <DetailField label="Importo" value={getAmount(selectedBooking)} />}
                </div>

                {/* Order Items (Beach Bar / Takeaway) */}
                {selectedBooking.orderItems?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-3 flex items-center gap-2">
                      <ShoppingBag size={14} /> Articoli Ordinati
                    </p>
                    <div className="bg-brand-cream/30 rounded-xl border border-brand-gold/5 divide-y divide-brand-gold/5">
                      {selectedBooking.orderItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center px-4 py-3">
                          <div>
                            <p className="text-sm font-bold text-brand-slate">{item.quantity}x {item.menuItem.name}</p>
                            <p className="text-[9px] text-brand-slate/40 font-bold uppercase">{item.menuItem.category}</p>
                          </div>
                          <span className="font-serif font-bold text-brand-gold">{'\u20AC'}{(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBooking.specialRequests && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-2">Richieste Speciali</p>
                    <p className="text-sm text-brand-slate/70 bg-brand-cream/50 p-4 rounded-xl border border-brand-gold/10">{selectedBooking.specialRequests}</p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-2">Note Interne</p>
                  <div className="flex gap-2">
                    <input type="text" value={noteInput} onChange={e => setNoteInput(e.target.value)}
                      placeholder="Aggiungi una nota..."
                      className="flex-1 bg-brand-cream/50 border border-brand-gold/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-gold/20" />
                    <button onClick={() => handleAddNote(selectedBooking.id)} disabled={updating}
                      className="px-4 py-3 bg-brand-burgundy text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50">
                      {updating ? <Loader2 size={16} className="animate-spin" /> : 'Salva'}
                    </button>
                  </div>
                </div>

                {/* Status actions */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-3">Cambia Stato</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.status === 'PENDING' && (
                      <ActionButton color="bg-emerald-500" label="Conferma" loading={updating}
                        onClick={() => handleStatusUpdate(selectedBooking.id, 'CONFIRMED')} />
                    )}
                    {(selectedBooking.status === 'PENDING' || selectedBooking.status === 'CONFIRMED') && (
                      <ActionButton color="bg-blue-500" label="Completato" loading={updating}
                        onClick={() => handleStatusUpdate(selectedBooking.id, 'COMPLETED')} />
                    )}
                    {selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'COMPLETED' && (
                      <ActionButton color="bg-red-500" label="Cancella" loading={updating}
                        onClick={() => handleStatusUpdate(selectedBooking.id, 'CANCELLED')} />
                    )}
                  </div>
                </div>

                <p className="text-[9px] text-brand-slate/30 font-bold uppercase tracking-wider text-center pt-4">
                  Creato il {new Date(selectedBooking.createdAt).toLocaleString('it-IT')}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-gold/10 flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-serif font-black text-brand-slate">{value}</p>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-slate/40">{label}</p>
      </div>
    </div>
  )
}

function DetailField({ label, value }) {
  return (
    <div className="bg-brand-cream/30 p-3 rounded-xl border border-brand-gold/5">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold mb-1">{label}</p>
      <p className="text-sm font-bold text-brand-slate">{value}</p>
    </div>
  )
}

function SettingsField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate/40 mb-1.5 block">{label}</label>
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-brand-cream/50 border border-brand-gold/10 rounded-xl px-4 py-3 text-sm font-bold text-brand-slate outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all" />
    </div>
  )
}

function ActionButton({ color, label, onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading}
      className={`${color} text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2`}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {label}
    </button>
  )
}
