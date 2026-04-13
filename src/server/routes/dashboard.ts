import { Router } from "express";
import { BookingStatus } from "@prisma/client";
import { prisma } from "../db";
import { sendStatusUpdateEmail } from "../email";

export const dashboardRouter = Router();

// GET /api/dashboard/stats
dashboardRouter.get("/stats", async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      todayBookings,
      totalBookings,
      pendingBookings,
      weekBookings,
    ] = await Promise.all([
      prisma.booking.count({
        where: { date: { gte: today, lt: tomorrow } },
      }),
      prisma.booking.count(),
      prisma.booking.count({
        where: { status: BookingStatus.PENDING },
      }),
      prisma.booking.findMany({
        where: { date: { gte: weekAgo }, totalAmount: { not: null } },
        select: { totalAmount: true },
      }),
    ]);

    const weekRevenue = weekBookings.reduce(
      (sum, b) => sum + Number(b.totalAmount ?? 0),
      0
    );

    res.json({
      todayBookings,
      totalBookings,
      pendingBookings,
      weekRevenue,
    });
  } catch (err) {
    console.error("GET /dashboard/stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/dashboard/bookings?service=&status=&date=&page=&limit=
dashboardRouter.get("/bookings", async (req, res) => {
  try {
    const {
      service,
      status,
      date,
      page = "1",
      limit = "20",
    } = req.query;

    const where: Record<string, unknown> = {};

    if (service && service !== "ALL") {
      where.serviceType = service;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (date) {
      const d = new Date(date as string);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.date = { gte: d, lt: next };
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          customer: true,
          zone: true,
          aperitivoPackage: true,
          vipPackage: true,
          orderItems: { include: { menuItem: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("GET /dashboard/bookings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/dashboard/bookings/:id
dashboardRouter.patch("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, cancellationReason } = req.body;

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      if (status === BookingStatus.CONFIRMED) updateData.confirmedAt = new Date();
      if (status === BookingStatus.CANCELLED) updateData.cancelledAt = new Date();
      if (status === BookingStatus.COMPLETED) updateData.completedAt = new Date();
    }
    if (notes !== undefined) updateData.notes = notes;
    if (cancellationReason) updateData.cancellationReason = cancellationReason;

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: { customer: true, zone: true, aperitivoPackage: true, vipPackage: true },
    });

    if (status && ["CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) {
      sendStatusUpdateEmail(id, status).catch(() => {});
    }

    res.json(booking);
  } catch (err) {
    console.error("PATCH /dashboard/bookings/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CATALOG MANAGEMENT (CRUD)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── MENU ITEMS ──────────────────────────────────────────────────────────────

dashboardRouter.get("/menu-items", async (_req, res) => {
  try {
    const items = await prisma.menuItem.findMany({ orderBy: [{ serviceType: "asc" }, { category: "asc" }, { sortOrder: "asc" }] });
    res.json(items);
  } catch (err) {
    console.error("GET /dashboard/menu-items error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

dashboardRouter.post("/menu-items", async (req, res) => {
  try {
    const { serviceType, category, name, description, price, imageUrl, isAvailable, sortOrder } = req.body;
    const item = await prisma.menuItem.create({
      data: { serviceType, category, name, description: description || null, price, imageUrl: imageUrl || null, isAvailable: isAvailable ?? true, sortOrder: sortOrder ?? 0 },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error("POST /dashboard/menu-items error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

dashboardRouter.patch("/menu-items/:id", async (req, res) => {
  try {
    const item = await prisma.menuItem.update({ where: { id: req.params.id }, data: req.body });
    res.json(item);
  } catch (err) {
    console.error("PATCH /dashboard/menu-items error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

dashboardRouter.delete("/menu-items/:id", async (req, res) => {
  try {
    await prisma.menuItem.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err: any) {
    if (err.code === "P2003") {
      // Foreign key constraint — item has orders, soft-delete instead
      await prisma.menuItem.update({ where: { id: req.params.id }, data: { isAvailable: false } });
      res.json({ ok: true, softDeleted: true });
      return;
    }
    console.error("DELETE /dashboard/menu-items error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── ZONES ───────────────────────────────────────────────────────────────────

dashboardRouter.get("/zones", async (_req, res) => {
  try {
    const zones = await prisma.zone.findMany({ orderBy: [{ serviceType: "asc" }, { sortOrder: "asc" }] });
    res.json(zones);
  } catch (err) {
    console.error("GET /dashboard/zones error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

dashboardRouter.post("/zones", async (req, res) => {
  try {
    const { serviceType, name, description, supplement, maxCapacity, isActive, sortOrder } = req.body;
    const zone = await prisma.zone.create({
      data: { serviceType, name, description: description || null, supplement: supplement ?? 0, maxCapacity: maxCapacity || null, isActive: isActive ?? true, sortOrder: sortOrder ?? 0 },
    });
    res.status(201).json(zone);
  } catch (err) {
    console.error("POST /dashboard/zones error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

dashboardRouter.patch("/zones/:id", async (req, res) => {
  try {
    const zone = await prisma.zone.update({ where: { id: req.params.id }, data: req.body });
    res.json(zone);
  } catch (err) {
    console.error("PATCH /dashboard/zones error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

dashboardRouter.delete("/zones/:id", async (req, res) => {
  try {
    await prisma.zone.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err: any) {
    if (err.code === "P2003") {
      await prisma.zone.update({ where: { id: req.params.id }, data: { isActive: false } });
      res.json({ ok: true, softDeleted: true });
      return;
    }
    console.error("DELETE /dashboard/zones error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── APERITIVO PACKAGES ──────────────────────────────────────────────────────

dashboardRouter.get("/aperitivo-packages", async (_req, res) => {
  try {
    const pkgs = await prisma.aperitivoPackage.findMany({ orderBy: { sortOrder: "asc" } });
    res.json(pkgs);
  } catch (err) {
    console.error("GET /dashboard/aperitivo-packages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

dashboardRouter.post("/aperitivo-packages", async (req, res) => {
  try {
    const { name, description, price, includes, isPopular, imageUrl, isAvailable, sortOrder } = req.body;
    const pkg = await prisma.aperitivoPackage.create({
      data: { name, description: description || null, price, includes: includes || [], isPopular: isPopular ?? false, imageUrl: imageUrl || null, isAvailable: isAvailable ?? true, sortOrder: sortOrder ?? 0 },
    });
    res.status(201).json(pkg);
  } catch (err) {
    console.error("POST /dashboard/aperitivo-packages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

dashboardRouter.patch("/aperitivo-packages/:id", async (req, res) => {
  try {
    const pkg = await prisma.aperitivoPackage.update({ where: { id: req.params.id }, data: req.body });
    res.json(pkg);
  } catch (err) {
    console.error("PATCH /dashboard/aperitivo-packages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

dashboardRouter.delete("/aperitivo-packages/:id", async (req, res) => {
  try {
    await prisma.aperitivoPackage.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err: any) {
    if (err.code === "P2003") {
      await prisma.aperitivoPackage.update({ where: { id: req.params.id }, data: { isAvailable: false } });
      res.json({ ok: true, softDeleted: true });
      return;
    }
    console.error("DELETE /dashboard/aperitivo-packages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── VIP PACKAGES ────────────────────────────────────────────────────────────

dashboardRouter.get("/vip-packages", async (_req, res) => {
  try {
    const pkgs = await prisma.vipPackage.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }] });
    res.json(pkgs);
  } catch (err) {
    console.error("GET /dashboard/vip-packages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

dashboardRouter.post("/vip-packages", async (req, res) => {
  try {
    const { type, name, description, price, maxGuests, imageUrl, isAvailable, sortOrder } = req.body;
    const pkg = await prisma.vipPackage.create({
      data: { type, name, description: description || null, price, maxGuests: maxGuests || null, imageUrl: imageUrl || null, isAvailable: isAvailable ?? true, sortOrder: sortOrder ?? 0 },
    });
    res.status(201).json(pkg);
  } catch (err) {
    console.error("POST /dashboard/vip-packages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

dashboardRouter.patch("/vip-packages/:id", async (req, res) => {
  try {
    const pkg = await prisma.vipPackage.update({ where: { id: req.params.id }, data: req.body });
    res.json(pkg);
  } catch (err) {
    console.error("PATCH /dashboard/vip-packages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

dashboardRouter.delete("/vip-packages/:id", async (req, res) => {
  try {
    await prisma.vipPackage.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err: any) {
    if (err.code === "P2003") {
      await prisma.vipPackage.update({ where: { id: req.params.id }, data: { isAvailable: false } });
      res.json({ ok: true, softDeleted: true });
      return;
    }
    console.error("DELETE /dashboard/vip-packages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/dashboard/customers
dashboardRouter.get("/customers", async (req, res) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        include: { bookings: { select: { id: true, serviceType: true, status: true, date: true } } },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.customer.count(),
    ]);

    res.json({
      customers,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error("GET /dashboard/customers error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

dashboardRouter.get("/notifications", async (req, res) => {
  try {
    const { page = "1", limit = "30", status: statusFilter } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

    const where: Record<string, unknown> = {};
    if (statusFilter && statusFilter !== "ALL") where.status = statusFilter;

    const [notifications, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        include: { booking: { include: { customer: { select: { name: true, email: true } } } } },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.notificationLog.count({ where }),
    ]);

    res.json({
      notifications,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error("GET /dashboard/notifications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

dashboardRouter.get("/settings", async (_req, res) => {
  try {
    let settings = await prisma.businessSettings.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = await prisma.businessSettings.create({ data: { id: "default" } });
    }
    res.json(settings);
  } catch (err) {
    console.error("GET /dashboard/settings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

dashboardRouter.patch("/settings", async (req, res) => {
  try {
    const { name, description, email, phone, address, openingTime, closingTime, maxGuestsPerSlot, cancellationHours } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (openingTime !== undefined) data.openingTime = openingTime;
    if (closingTime !== undefined) data.closingTime = closingTime;
    if (maxGuestsPerSlot !== undefined) data.maxGuestsPerSlot = Number(maxGuestsPerSlot);
    if (cancellationHours !== undefined) data.cancellationHours = Number(cancellationHours);

    const settings = await prisma.businessSettings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
    res.json(settings);
  } catch (err) {
    console.error("PATCH /dashboard/settings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
