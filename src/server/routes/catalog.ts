import { Router } from "express";
import { ServiceType } from "@prisma/client";
import { prisma } from "../db";

export const catalogRouter = Router();

// GET /api/catalog/menu?service=BEACH_BAR|TAKEAWAY
catalogRouter.get("/menu", async (req, res) => {
  try {
    const service = req.query.service as string;
    const validServices: ServiceType[] = [ServiceType.BEACH_BAR, ServiceType.TAKEAWAY];

    if (!service || !validServices.includes(service as ServiceType)) {
      res.status(400).json({ error: "service must be BEACH_BAR or TAKEAWAY" });
      return;
    }

    const items = await prisma.menuItem.findMany({
      where: { serviceType: service as ServiceType, isAvailable: true },
      orderBy: { sortOrder: "asc" },
    });

    res.json(items);
  } catch (err) {
    console.error("GET /catalog/menu error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/catalog/zones?service=RESTAURANT|APERITIVO
catalogRouter.get("/zones", async (req, res) => {
  try {
    const service = req.query.service as string;
    const validServices: ServiceType[] = [ServiceType.RESTAURANT, ServiceType.APERITIVO];

    if (!service || !validServices.includes(service as ServiceType)) {
      res.status(400).json({ error: "service must be RESTAURANT or APERITIVO" });
      return;
    }

    const zones = await prisma.zone.findMany({
      where: { serviceType: service as ServiceType, isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    res.json(zones);
  } catch (err) {
    console.error("GET /catalog/zones error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/catalog/aperitivo-packages
catalogRouter.get("/aperitivo-packages", async (_req, res) => {
  try {
    const packages = await prisma.aperitivoPackage.findMany({
      where: { isAvailable: true },
      orderBy: { sortOrder: "asc" },
    });

    res.json(packages);
  } catch (err) {
    console.error("GET /catalog/aperitivo-packages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/catalog/vip-packages?type=CABANA|BOTTLE
catalogRouter.get("/vip-packages", async (req, res) => {
  try {
    const type = req.query.type as string | undefined;

    const where: Record<string, unknown> = { isAvailable: true };
    if (type === "CABANA" || type === "BOTTLE") {
      where.type = type;
    }

    const packages = await prisma.vipPackage.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    res.json(packages);
  } catch (err) {
    console.error("GET /catalog/vip-packages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/catalog/settings
catalogRouter.get("/settings", async (_req, res) => {
  try {
    const settings = await prisma.businessSettings.findUnique({
      where: { id: "default" },
    });

    res.json(settings);
  } catch (err) {
    console.error("GET /catalog/settings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
