const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ─── Catalog ────────────────────────────────────────────────────────────────

export const catalog = {
  menu(service: "BEACH_BAR" | "TAKEAWAY") {
    return request<MenuItem[]>(`/catalog/menu?service=${service}`);
  },
  zones(service: "RESTAURANT" | "APERITIVO") {
    return request<Zone[]>(`/catalog/zones?service=${service}`);
  },
  aperitivoPackages() {
    return request<AperitivoPackage[]>("/catalog/aperitivo-packages");
  },
  vipPackages(type?: "CABANA" | "BOTTLE") {
    const q = type ? `?type=${type}` : "";
    return request<VipPackage[]>(`/catalog/vip-packages${q}`);
  },
};

// ─── Bookings ───────────────────────────────────────────────────────────────

export const bookings = {
  restaurant(data: RestaurantBooking) {
    return request<BookingResponse>("/bookings/restaurant", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  aperitivo(data: AperitivoBooking) {
    return request<BookingResponse>("/bookings/aperitivo", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  vip(data: VipBooking) {
    return request<BookingResponse>("/bookings/vip", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  beachBar(data: BeachBarOrder) {
    return request<BookingResponse>("/bookings/beach-bar", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  takeaway(data: TakeawayOrder) {
    return request<BookingResponse>("/bookings/takeaway", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  events(data: EventInquiry) {
    return request<BookingResponse>("/bookings/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ─── Dashboard ─────────────────────────────────────────────────────────────

export const dashboard = {
  stats() {
    return request<DashboardStats>("/dashboard/stats");
  },
  bookings(params?: { service?: string; status?: string; date?: string; page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.service) q.set("service", params.service);
    if (params?.status) q.set("status", params.status);
    if (params?.date) q.set("date", params.date);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<DashboardBookingsResponse>(`/dashboard/bookings${qs}`);
  },
  updateBooking(id: string, data: { status?: string; notes?: string; cancellationReason?: string }) {
    return request<BookingResponse>(`/dashboard/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  customers(params?: { page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<DashboardCustomersResponse>(`/dashboard/customers${qs}`);
  },

  // ─── Catalog CRUD ──────────────────────────────────────────────────────
  menuItems() { return request<MenuItem[]>("/dashboard/menu-items"); },
  createMenuItem(data: Omit<MenuItem, "id">) { return request<MenuItem>("/dashboard/menu-items", { method: "POST", body: JSON.stringify(data) }); },
  updateMenuItem(id: string, data: Partial<MenuItem>) { return request<MenuItem>(`/dashboard/menu-items/${id}`, { method: "PATCH", body: JSON.stringify(data) }); },
  deleteMenuItem(id: string) { return request<{ ok: boolean; softDeleted?: boolean }>(`/dashboard/menu-items/${id}`, { method: "DELETE" }); },

  zones() { return request<AdminZone[]>("/dashboard/zones"); },
  createZone(data: Omit<AdminZone, "id">) { return request<AdminZone>("/dashboard/zones", { method: "POST", body: JSON.stringify(data) }); },
  updateZone(id: string, data: Partial<AdminZone>) { return request<AdminZone>(`/dashboard/zones/${id}`, { method: "PATCH", body: JSON.stringify(data) }); },
  deleteZone(id: string) { return request<{ ok: boolean; softDeleted?: boolean }>(`/dashboard/zones/${id}`, { method: "DELETE" }); },

  aperitivoPackages() { return request<AdminAperitivoPackage[]>("/dashboard/aperitivo-packages"); },
  createAperitivoPackage(data: Omit<AdminAperitivoPackage, "id">) { return request<AdminAperitivoPackage>("/dashboard/aperitivo-packages", { method: "POST", body: JSON.stringify(data) }); },
  updateAperitivoPackage(id: string, data: Partial<AdminAperitivoPackage>) { return request<AdminAperitivoPackage>(`/dashboard/aperitivo-packages/${id}`, { method: "PATCH", body: JSON.stringify(data) }); },
  deleteAperitivoPackage(id: string) { return request<{ ok: boolean; softDeleted?: boolean }>(`/dashboard/aperitivo-packages/${id}`, { method: "DELETE" }); },

  settings() { return request<BusinessSettings>("/dashboard/settings"); },
  updateSettings(data: Partial<BusinessSettings>) { return request<BusinessSettings>("/dashboard/settings", { method: "PATCH", body: JSON.stringify(data) }); },

  notifications(params?: { page?: number; limit?: number; status?: string }) {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.status) q.set("status", params.status);
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<NotificationsResponse>(`/dashboard/notifications${qs}`);
  },

  vipPackages() { return request<AdminVipPackage[]>("/dashboard/vip-packages"); },
  createVipPackage(data: Omit<AdminVipPackage, "id">) { return request<AdminVipPackage>("/dashboard/vip-packages", { method: "POST", body: JSON.stringify(data) }); },
  updateVipPackage(id: string, data: Partial<AdminVipPackage>) { return request<AdminVipPackage>(`/dashboard/vip-packages/${id}`, { method: "PATCH", body: JSON.stringify(data) }); },
  deleteVipPackage(id: string) { return request<{ ok: boolean; softDeleted?: boolean }>(`/dashboard/vip-packages/${id}`, { method: "DELETE" }); },
};

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MenuItem {
  id: string;
  serviceType: string;
  category: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
}

export interface Zone {
  id: string;
  serviceType: string;
  name: string;
  description: string | null;
  supplement: string;
  maxCapacity: number | null;
}

export interface AperitivoPackage {
  id: string;
  name: string;
  description: string | null;
  price: string;
  includes: string[];
  isPopular: boolean;
  imageUrl: string | null;
}

export interface VipPackage {
  id: string;
  type: string;
  name: string;
  description: string | null;
  price: string;
  maxGuests: number | null;
  imageUrl: string | null;
}

export interface BookingResponse {
  id: string;
  serviceType: string;
  status: string;
  orderNumber?: string;
  totalAmount?: string;
  depositAmount?: string;
  [key: string]: unknown;
}

export interface RestaurantBooking {
  name: string;
  email: string;
  phone?: string;
  date: string;
  timeSlot: string;
  guests: number;
  zoneId?: string;
}

export interface AperitivoBooking {
  name: string;
  email: string;
  phone?: string;
  date: string;
  timeSlot: string;
  guests: number;
  zoneId?: string;
  packageId: string;
}

export interface VipBooking {
  name: string;
  email: string;
  phone?: string;
  date: string;
  guests: number;
  packageId: string;
}

export interface BeachBarOrder {
  name: string;
  email: string;
  phone?: string;
  locationCode: string;
  items: { menuItemId: string; quantity: number }[];
}

export interface TakeawayOrder {
  name: string;
  email: string;
  phone?: string;
  pickupTime: string;
  items: { menuItemId: string; quantity: number }[];
}

export interface EventInquiry {
  name: string;
  email: string;
  phone?: string;
  date: string;
  eventType: string;
  eventGuests: number;
  specialRequests?: string;
}

export interface DashboardStats {
  todayBookings: number;
  totalBookings: number;
  pendingBookings: number;
  weekRevenue: number;
}

export interface DashboardBooking {
  id: string;
  serviceType: string;
  status: string;
  date: string | null;
  timeSlot: string | null;
  guests: number | null;
  eventType: string | null;
  eventGuests: number | null;
  orderNumber: string | null;
  locationCode: string | null;
  pickupTime: string | null;
  totalAmount: string | null;
  depositAmount: string | null;
  notes: string | null;
  specialRequests: string | null;
  createdAt: string;
  customer: { id: string; name: string; email: string; phone: string | null };
  zone?: { name: string } | null;
  aperitivoPackage?: { name: string } | null;
  vipPackage?: { name: string } | null;
  orderItems?: { id: string; quantity: number; unitPrice: string; menuItem: { name: string; category: string } }[];
}

export interface DashboardBookingsResponse {
  bookings: DashboardBooking[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface DashboardCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  bookings: { id: string; serviceType: string; status: string; date: string | null }[];
}

export interface DashboardCustomersResponse {
  customers: DashboardCustomer[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

// ─── Admin Catalog Types ───────────────────────────────────────────────────

export interface AdminZone {
  id: string;
  serviceType: string;
  name: string;
  description: string | null;
  supplement: string;
  maxCapacity: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminAperitivoPackage {
  id: string;
  name: string;
  description: string | null;
  price: string;
  includes: string[];
  isPopular: boolean;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
}

export interface NotificationEntry {
  id: string;
  channel: string;
  type: string;
  recipient: string;
  subject: string | null;
  status: string;
  error: string | null;
  sentAt: string | null;
  createdAt: string;
  booking: { customer: { name: string; email: string } } | null;
}

export interface NotificationsResponse {
  notifications: NotificationEntry[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface BusinessSettings {
  id: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  openingTime: string;
  closingTime: string;
  maxGuestsPerSlot: number;
  cancellationHours: number;
}

export interface AdminVipPackage {
  id: string;
  type: string;
  name: string;
  description: string | null;
  price: string;
  maxGuests: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
}
