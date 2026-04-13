import { Router } from "express";
import { ServiceType, BookingStatus } from "@prisma/client";
import { prisma } from "../db";
import { sendBookingConfirmation } from "../email";

export const bookingsRouter = Router();

// Helper: find or create customer
async function getOrCreateCustomer(data: {
  name: string;
  email: string;
  phone?: string;
}) {
  const existing = await prisma.customer.findUnique({
    where: { email: data.email },
  });
  if (existing) return existing;
  return prisma.customer.create({ data });
}

// POST /api/bookings/restaurant
bookingsRouter.post("/restaurant", async (req, res) => {
  try {
    const { name, email, phone, date, timeSlot, guests, zoneId } = req.body;

    if (!name || !email || !date || !timeSlot || !guests) {
      res.status(400).json({ error: "name, email, date, timeSlot, guests are required" });
      return;
    }

    const customer = await getOrCreateCustomer({ name, email, phone });

    const zone = zoneId
      ? await prisma.zone.findUnique({ where: { id: zoneId } })
      : null;

    const depositAmount = guests * 10 + Number(zone?.supplement ?? 0);

    const booking = await prisma.booking.create({
      data: {
        serviceType: ServiceType.RESTAURANT,
        status: BookingStatus.CONFIRMED,
        customerId: customer.id,
        date: new Date(date),
        timeSlot,
        guests,
        zoneId: zoneId ?? null,
        depositAmount,
        confirmedAt: new Date(),
      },
      include: { zone: true, customer: true },
    });

    sendBookingConfirmation(booking.id).catch(() => {});
    res.status(201).json(booking);
  } catch (err) {
    console.error("POST /bookings/restaurant error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/bookings/aperitivo
bookingsRouter.post("/aperitivo", async (req, res) => {
  try {
    const { name, email, phone, date, timeSlot, guests, zoneId, packageId } =
      req.body;

    if (!name || !email || !date || !timeSlot || !guests || !packageId) {
      res.status(400).json({
        error: "name, email, date, timeSlot, guests, packageId are required",
      });
      return;
    }

    const customer = await getOrCreateCustomer({ name, email, phone });

    const pkg = await prisma.aperitivoPackage.findUnique({
      where: { id: packageId },
    });
    if (!pkg) {
      res.status(404).json({ error: "Package not found" });
      return;
    }

    const zone = zoneId
      ? await prisma.zone.findUnique({ where: { id: zoneId } })
      : null;

    const totalAmount =
      Number(pkg.price) * guests + Number(zone?.supplement ?? 0);

    const booking = await prisma.booking.create({
      data: {
        serviceType: ServiceType.APERITIVO,
        status: BookingStatus.CONFIRMED,
        customerId: customer.id,
        date: new Date(date),
        timeSlot,
        guests,
        zoneId: zoneId ?? null,
        aperitivoPackageId: packageId,
        totalAmount,
        confirmedAt: new Date(),
      },
      include: { zone: true, aperitivoPackage: true, customer: true },
    });

    sendBookingConfirmation(booking.id).catch(() => {});
    res.status(201).json(booking);
  } catch (err) {
    console.error("POST /bookings/aperitivo error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/bookings/vip
bookingsRouter.post("/vip", async (req, res) => {
  try {
    const { name, email, phone, date, guests, packageId } = req.body;

    if (!name || !email || !date || !guests || !packageId) {
      res.status(400).json({
        error: "name, email, date, guests, packageId are required",
      });
      return;
    }

    const customer = await getOrCreateCustomer({ name, email, phone });

    const pkg = await prisma.vipPackage.findUnique({
      where: { id: packageId },
    });
    if (!pkg) {
      res.status(404).json({ error: "VIP package not found" });
      return;
    }

    const serviceType =
      pkg.type === "CABANA" ? ServiceType.VIP_CABANA : ServiceType.VIP_BOTTLE;

    const booking = await prisma.booking.create({
      data: {
        serviceType,
        status: BookingStatus.CONFIRMED,
        customerId: customer.id,
        date: new Date(date),
        guests,
        vipPackageId: packageId,
        totalAmount: pkg.price,
        confirmedAt: new Date(),
      },
      include: { vipPackage: true, customer: true },
    });

    sendBookingConfirmation(booking.id).catch(() => {});
    res.status(201).json(booking);
  } catch (err) {
    console.error("POST /bookings/vip error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/bookings/beach-bar
bookingsRouter.post("/beach-bar", async (req, res) => {
  try {
    const { name, email, phone, locationCode, items } = req.body;

    if (!name || !email || !locationCode || !items?.length) {
      res.status(400).json({
        error: "name, email, locationCode, items[] are required",
      });
      return;
    }

    const customer = await getOrCreateCustomer({ name, email, phone });

    // Fetch menu items to get current prices
    const menuItemIds = items.map((i: { menuItemId: string }) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    let totalAmount = 0;
    const orderItemsData = items.map(
      (i: { menuItemId: string; quantity: number }) => {
        const menuItem = menuMap.get(i.menuItemId);
        if (!menuItem) throw new Error(`Menu item ${i.menuItemId} not found`);
        const unitPrice = Number(menuItem.price);
        totalAmount += unitPrice * i.quantity;
        return {
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          unitPrice,
        };
      }
    );

    const booking = await prisma.booking.create({
      data: {
        serviceType: ServiceType.BEACH_BAR,
        status: BookingStatus.CONFIRMED,
        customerId: customer.id,
        date: new Date(),
        locationCode,
        totalAmount,
        confirmedAt: new Date(),
        orderItems: { create: orderItemsData },
      },
      include: {
        orderItems: { include: { menuItem: true } },
        customer: true,
      },
    });

    sendBookingConfirmation(booking.id).catch(() => {});
    res.status(201).json(booking);
  } catch (err) {
    console.error("POST /bookings/beach-bar error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/bookings/takeaway
bookingsRouter.post("/takeaway", async (req, res) => {
  try {
    const { name, email, phone, pickupTime, items } = req.body;

    if (!name || !email || !pickupTime || !items?.length) {
      res.status(400).json({
        error: "name, email, pickupTime, items[] are required",
      });
      return;
    }

    const customer = await getOrCreateCustomer({ name, email, phone });

    const menuItemIds = items.map((i: { menuItemId: string }) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    let totalAmount = 0;
    const orderItemsData = items.map(
      (i: { menuItemId: string; quantity: number }) => {
        const menuItem = menuMap.get(i.menuItemId);
        if (!menuItem) throw new Error(`Menu item ${i.menuItemId} not found`);
        const unitPrice = Number(menuItem.price);
        totalAmount += unitPrice * i.quantity;
        return {
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          unitPrice,
        };
      }
    );

    const orderNumber = `RVB-${Math.floor(100 + Math.random() * 900)}`;

    const booking = await prisma.booking.create({
      data: {
        serviceType: ServiceType.TAKEAWAY,
        status: BookingStatus.CONFIRMED,
        customerId: customer.id,
        date: new Date(),
        pickupTime,
        orderNumber,
        totalAmount,
        confirmedAt: new Date(),
        orderItems: { create: orderItemsData },
      },
      include: {
        orderItems: { include: { menuItem: true } },
        customer: true,
      },
    });

    sendBookingConfirmation(booking.id).catch(() => {});
    res.status(201).json(booking);
  } catch (err) {
    console.error("POST /bookings/takeaway error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/bookings/events
bookingsRouter.post("/events", async (req, res) => {
  try {
    const { name, email, phone, date, eventType, eventGuests, specialRequests } =
      req.body;

    if (!name || !email || !date || !eventType || !eventGuests) {
      res.status(400).json({
        error: "name, email, date, eventType, eventGuests are required",
      });
      return;
    }

    const customer = await getOrCreateCustomer({ name, email, phone });

    const booking = await prisma.booking.create({
      data: {
        serviceType: ServiceType.EVENTS,
        status: BookingStatus.PENDING,
        customerId: customer.id,
        date: new Date(date),
        eventType,
        eventGuests,
        specialRequests,
      },
      include: { customer: true },
    });

    sendBookingConfirmation(booking.id).catch(() => {});
    res.status(201).json(booking);
  } catch (err) {
    console.error("POST /bookings/events error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
