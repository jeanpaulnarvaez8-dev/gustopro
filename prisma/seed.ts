import { PrismaClient, ServiceType, BookingStatus, StaffRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding GustoPro database...\n");

  // ─── BUSINESS SETTINGS ──────────────────────────────────────────────────────

  await prisma.businessSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Riva Beach Salento",
      description:
        "Luxury beachfront restaurant & lounge nel cuore del Salento",
      email: "info@gustopro.it",
      phone: "+39 0832 000000",
      address: "Lungomare delle Dune, 73100 Lecce (LE)",
      timezone: "Europe/Rome",
      currency: "EUR",
      openingTime: "10:00",
      closingTime: "23:00",
      maxGuestsPerSlot: 50,
      cancellationHours: 48,
    },
  });

  console.log("✓ Business settings");

  // ─── STAFF ────────────────────────────────────────────────────────────────────

  const adminPassword = await hash("admin2024!", 12);
  const staffPassword = await hash("staff2024!", 12);

  const admin = await prisma.staff.upsert({
    where: { email: "admin@gustopro.it" },
    update: {},
    create: {
      email: "admin@gustopro.it",
      name: "Marco Rizzo",
      hashedPassword: adminPassword,
      role: StaffRole.ADMIN,
    },
  });

  const manager = await prisma.staff.upsert({
    where: { email: "manager@gustopro.it" },
    update: {},
    create: {
      email: "manager@gustopro.it",
      name: "Alessandro Ferrara",
      hashedPassword: staffPassword,
      role: StaffRole.MANAGER,
    },
  });

  console.log("✓ Staff accounts (admin@gustopro.it / manager@gustopro.it)");

  // ─── BEACH BAR MENU ──────────────────────────────────────────────────────────

  const beachBarItems = [
    {
      serviceType: ServiceType.BEACH_BAR,
      category: "Cocktails",
      name: "Riva Signature Spritz",
      description:
        "Aperol, Prosecco Superiore, Soda, Fetta d'arancia bio",
      price: 14.0,
      imageUrl:
        "https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 1,
    },
    {
      serviceType: ServiceType.BEACH_BAR,
      category: "Cocktails",
      name: "Mojito Beach",
      description:
        "Rum Havana 7, Lime fresco, Menta, Zucchero di Canna, Soda",
      price: 16.0,
      imageUrl:
        "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 2,
    },
    {
      serviceType: ServiceType.BEACH_BAR,
      category: "Snacks",
      name: "Tagliere Imperiale",
      description:
        "Salmone affumicato, ostriche Fine de Claire, gamberi rossi",
      price: 35.0,
      imageUrl:
        "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 3,
    },
    {
      serviceType: ServiceType.BEACH_BAR,
      category: "Snacks",
      name: "Club Sandwich Gourmet",
      description:
        "Pollo ruspante, bacon croccante, uovo bio, pomodoro, lattuga, patatine dipper",
      price: 22.0,
      imageUrl:
        "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 4,
    },
    {
      serviceType: ServiceType.BEACH_BAR,
      category: "Smoothies",
      name: "Tropical Detox",
      description: "Ananas, Cocco, Mango, Zenzero",
      price: 12.0,
      imageUrl:
        "https://images.unsplash.com/photo-1623065123547-4180d216fe81?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 5,
    },
    {
      serviceType: ServiceType.BEACH_BAR,
      category: "Smoothies",
      name: "Berry Blast",
      description: "Mirtilli, Lamponi, Fragole, Latte di Mandorla",
      price: 12.0,
      imageUrl:
        "https://images.unsplash.com/photo-1628557044797-f21a177c37ec?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 6,
    },
  ];

  for (const item of beachBarItems) {
    await prisma.menuItem.create({ data: item });
  }

  console.log("✓ Beach Bar menu (6 items)");

  // ─── TAKEAWAY MENU ────────────────────────────────────────────────────────────

  const takeawayItems = [
    {
      serviceType: ServiceType.TAKEAWAY,
      category: "Panini",
      name: "Puccia Salentina Salumi",
      description:
        "Puccia artigianale con capocollo di Martina Franca, caciocavallo e pomodori secchi.",
      price: 9.0,
      imageUrl:
        "https://images.unsplash.com/photo-1550507992-eb63ffee0847?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 1,
    },
    {
      serviceType: ServiceType.TAKEAWAY,
      category: "Panini",
      name: "Puccia Vegetariana",
      description:
        "Puccia artigianale con melanzane grigliate, stracciatella e pesto di basilico.",
      price: 8.5,
      imageUrl:
        "https://images.unsplash.com/photo-1547526323-28876c12de4b?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 2,
    },
    {
      serviceType: ServiceType.TAKEAWAY,
      category: "Insalate",
      name: "Insalata Jonica",
      description:
        "Insalata mista, tonno fresco scottato, olive taggiasche, pomodorini e crostini.",
      price: 12.0,
      imageUrl:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 3,
    },
    {
      serviceType: ServiceType.TAKEAWAY,
      category: "Frutta",
      name: "Cocco in Ghiaccio",
      description:
        "Fettine di cocco fresco servite su letto di ghiaccio triturato.",
      price: 5.0,
      imageUrl:
        "https://images.unsplash.com/photo-1525385133335-86d8fe529683?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 4,
    },
    {
      serviceType: ServiceType.TAKEAWAY,
      category: "Bibite",
      name: "Caffé in Ghiaccio con Latte di Mandorla",
      description: "Il classico caffè salentino rinfrescante.",
      price: 3.5,
      imageUrl:
        "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 5,
    },
    {
      serviceType: ServiceType.TAKEAWAY,
      category: "Bibite",
      name: "Acqua Naturale (500ml)",
      description: "Bottiglietta d'acqua fresca.",
      price: 2.0,
      imageUrl:
        "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 6,
    },
    {
      serviceType: ServiceType.TAKEAWAY,
      category: "Bibite",
      name: "Tropical Detox",
      description: "Centrifugato di mango, ananas e menta fresca.",
      price: 6.5,
      imageUrl:
        "https://images.unsplash.com/photo-1623065422902-30a2ad4492bf?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 7,
    },
  ];

  for (const item of takeawayItems) {
    await prisma.menuItem.create({ data: item });
  }

  console.log("✓ Takeaway menu (7 items)");

  // ─── RESTAURANT ZONES ─────────────────────────────────────────────────────────

  const restaurantZones = [
    {
      serviceType: ServiceType.RESTAURANT,
      name: "Terrazza Panoramica",
      description: "Vista mare frontale, brezza marina",
      supplement: 10.0,
      maxCapacity: 30,
      sortOrder: 1,
    },
    {
      serviceType: ServiceType.RESTAURANT,
      name: "Sala Cristallo",
      description: "Aria condizionata, atmosfera intima",
      supplement: 0,
      maxCapacity: 40,
      sortOrder: 2,
    },
  ];

  for (const zone of restaurantZones) {
    await prisma.zone.create({ data: zone });
  }

  console.log("✓ Restaurant zones (2)");

  // ─── APERITIVO ZONES ──────────────────────────────────────────────────────────

  const aperitivoZones = [
    {
      serviceType: ServiceType.APERITIVO,
      name: "Prima Fila Mare",
      description: "Sulla sabbia, in prima fila",
      supplement: 10.0,
      maxCapacity: 20,
      sortOrder: 1,
    },
    {
      serviceType: ServiceType.APERITIVO,
      name: "Lounge Terrazza",
      description: "Area rialzata con divanetti",
      supplement: 0,
      maxCapacity: 30,
      sortOrder: 2,
    },
  ];

  for (const zone of aperitivoZones) {
    await prisma.zone.create({ data: zone });
  }

  console.log("✓ Aperitivo zones (2)");

  // ─── APERITIVO PACKAGES ───────────────────────────────────────────────────────

  const aperitivoPackages = [
    {
      name: "Golden Hour Experience",
      description:
        "Calice di Franciacorta o cocktail a scelta, accompagnato da un plateau royale di crudi di mare e finger food gourmet.",
      price: 35.0,
      includes: [
        "1 Calice Franciacorta o Cocktail",
        "Plateau crudi di mare",
        "Finger food gourmet",
      ],
      isPopular: true,
      imageUrl:
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600&h=400",
      sortOrder: 1,
    },
    {
      name: "Riva Sunset Classic",
      description:
        "Due drink a scelta dalla nostra drink list e tagliere selezione di salumi e formaggi del territorio con focaccia calda.",
      price: 25.0,
      includes: [
        "2 Drink a scelta",
        "Tagliere salumi e formaggi",
        "Focaccia calda",
      ],
      isPopular: false,
      imageUrl:
        "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=600&h=400",
      sortOrder: 2,
    },
    {
      name: "Sushi & Bubbles",
      description:
        "Bottiglia di Prosecco Valdobbiadene DOCG e barca di sushi misto (24 pezzi) preparato dal nostro Master Sushi Chef.",
      price: 60.0,
      includes: [
        "1 Bottiglia Prosecco DOCG",
        "Barca Sushi 24 pezzi",
        "Servizio Master Chef",
      ],
      isPopular: false,
      imageUrl:
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=600&h=400",
      sortOrder: 3,
    },
  ];

  for (const pkg of aperitivoPackages) {
    await prisma.aperitivoPackage.create({ data: pkg });
  }

  console.log("✓ Aperitivo packages (3)");

  // ─── VIP PACKAGES (Cabanas) ───────────────────────────────────────────────────

  const vipCabanas = [
    {
      type: "CABANA",
      name: "Grand Cabana",
      description:
        "Fino a 6 persone, lettoni vista mare e mare cristallino.",
      price: 250.0,
      maxGuests: 6,
      imageUrl:
        "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&q=80&w=800&h=600",
      sortOrder: 1,
    },
    {
      type: "CABANA",
      name: "Le Dune Gazebo",
      description:
        "Fino a 4 persone, letto king size sulla sabbia bianca.",
      price: 150.0,
      maxGuests: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&q=80&w=800&h=600",
      sortOrder: 2,
    },
  ];

  const vipBottles = [
    {
      type: "BOTTLE",
      name: "Dom Pérignon Vintage",
      description:
        "Bottiglia (75cl) servita con ghiaccio e sparkle show al tavolo.",
      price: 350.0,
      imageUrl:
        "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 3,
    },
    {
      type: "BOTTLE",
      name: "Ruinart Blanc de Blancs",
      description:
        "Bottiglia (75cl) servita con fragole fresche e ghiaccio.",
      price: 180.0,
      imageUrl:
        "https://images.unsplash.com/photo-1599576402092-1b1cc1b2d415?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 4,
    },
    {
      type: "BOTTLE",
      name: "Belvedere Vodka Luminous",
      description:
        "Formato Magnum (1.5L) con succhi di accompagnamento.",
      price: 300.0,
      imageUrl:
        "https://images.unsplash.com/photo-1596484552993-8b7150c9535b?auto=format&fit=crop&q=80&w=400&h=400",
      sortOrder: 5,
    },
  ];

  for (const pkg of [...vipCabanas, ...vipBottles]) {
    await prisma.vipPackage.create({ data: pkg });
  }

  console.log("✓ VIP packages (2 cabanas + 3 bottles)");

  // ─── SAMPLE CUSTOMERS ─────────────────────────────────────────────────────────

  const customers = [
    {
      email: "giulia.rossi@gmail.com",
      name: "Giulia Rossi",
      phone: "+39 333 1234567",
    },
    {
      email: "marco.bianchi@gmail.com",
      name: "Marco Bianchi",
      phone: "+39 347 7654321",
    },
    {
      email: "anna.verdi@gmail.com",
      name: "Anna Verdi",
      phone: "+39 320 9876543",
    },
    {
      email: "luca.conti@gmail.com",
      name: "Luca Conti",
      phone: "+39 389 1122334",
    },
    {
      email: "sara.marino@gmail.com",
      name: "Sara Marino",
      phone: "+39 340 5566778",
    },
  ];

  const createdCustomers = [];
  for (const c of customers) {
    const customer = await prisma.customer.create({ data: c });
    createdCustomers.push(customer);
  }

  console.log("✓ Sample customers (5)");

  // ─── SAMPLE BOOKINGS ──────────────────────────────────────────────────────────

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const allZones = await prisma.zone.findMany();
  const restaurantTerrace = allZones.find(
    (z) => z.name === "Terrazza Panoramica"
  );
  const restaurantSala = allZones.find((z) => z.name === "Sala Cristallo");
  const aperitivoFront = allZones.find((z) => z.name === "Prima Fila Mare");

  const allAperitivoPkgs = await prisma.aperitivoPackage.findMany();
  const goldenHour = allAperitivoPkgs.find((p) =>
    p.name.includes("Golden")
  );
  const sunsetClassic = allAperitivoPkgs.find((p) =>
    p.name.includes("Classic")
  );

  const allVipPkgs = await prisma.vipPackage.findMany();
  const grandCabana = allVipPkgs.find((p) => p.name === "Grand Cabana");

  const allMenuItems = await prisma.menuItem.findMany();
  const spritz = allMenuItems.find((m) => m.name.includes("Spritz"));
  const sandwich = allMenuItems.find((m) => m.name.includes("Club"));
  const puccia = allMenuItems.find((m) => m.name.includes("Salumi"));

  // Restaurant booking - confirmed
  await prisma.booking.create({
    data: {
      serviceType: ServiceType.RESTAURANT,
      status: BookingStatus.CONFIRMED,
      customerId: createdCustomers[0].id,
      date: tomorrow,
      timeSlot: "20:30",
      guests: 4,
      zoneId: restaurantTerrace?.id,
      depositAmount: 50.0,
      confirmedAt: new Date(),
    },
  });

  // Restaurant booking - pending
  await prisma.booking.create({
    data: {
      serviceType: ServiceType.RESTAURANT,
      status: BookingStatus.PENDING,
      customerId: createdCustomers[1].id,
      date: dayAfter,
      timeSlot: "13:00",
      guests: 2,
      zoneId: restaurantSala?.id,
      depositAmount: 20.0,
    },
  });

  // Aperitivo booking
  await prisma.booking.create({
    data: {
      serviceType: ServiceType.APERITIVO,
      status: BookingStatus.CONFIRMED,
      customerId: createdCustomers[2].id,
      date: tomorrow,
      timeSlot: "19:00 - 20:30",
      guests: 3,
      zoneId: aperitivoFront?.id,
      aperitivoPackageId: goldenHour?.id,
      totalAmount: 35.0 * 3 + 10.0,
      confirmedAt: new Date(),
    },
  });

  // VIP Cabana booking
  await prisma.booking.create({
    data: {
      serviceType: ServiceType.VIP_CABANA,
      status: BookingStatus.CONFIRMED,
      customerId: createdCustomers[3].id,
      date: tomorrow,
      guests: 5,
      vipPackageId: grandCabana?.id,
      totalAmount: 250.0,
      confirmedAt: new Date(),
    },
  });

  // Beach Bar order with items
  const beachBarOrder = await prisma.booking.create({
    data: {
      serviceType: ServiceType.BEACH_BAR,
      status: BookingStatus.COMPLETED,
      customerId: createdCustomers[4].id,
      date: today,
      locationCode: "Ombrellone 42",
      totalAmount: 44.0,
      completedAt: new Date(),
      confirmedAt: new Date(),
    },
  });

  if (spritz && sandwich) {
    await prisma.orderItem.createMany({
      data: [
        {
          bookingId: beachBarOrder.id,
          menuItemId: spritz.id,
          quantity: 2,
          unitPrice: spritz.price,
        },
        {
          bookingId: beachBarOrder.id,
          menuItemId: sandwich.id,
          quantity: 1,
          unitPrice: sandwich.price,
        },
      ],
    });
  }

  // Takeaway order
  const takeawayOrder = await prisma.booking.create({
    data: {
      serviceType: ServiceType.TAKEAWAY,
      status: BookingStatus.CONFIRMED,
      customerId: createdCustomers[0].id,
      date: today,
      pickupTime: "Tra 30 minuti",
      orderNumber: "RVB-247",
      totalAmount: 17.5,
      confirmedAt: new Date(),
    },
  });

  if (puccia) {
    await prisma.orderItem.create({
      data: {
        bookingId: takeawayOrder.id,
        menuItemId: puccia.id,
        quantity: 1,
        unitPrice: puccia.price,
      },
    });
  }

  // Event inquiry
  await prisma.booking.create({
    data: {
      serviceType: ServiceType.EVENTS,
      status: BookingStatus.PENDING,
      customerId: createdCustomers[1].id,
      date: new Date(today.getFullYear(), today.getMonth() + 1, 15),
      eventType: "Compleanno",
      eventGuests: 30,
      specialRequests:
        "Festa a sorpresa per i 30 anni. Vorremmo area privata con DJ e catering per 30 persone.",
    },
  });

  console.log("✓ Sample bookings (7)");
  console.log("\n✅ Seed complete!\n");
  console.log("  Dashboard login:");
  console.log("  Admin:   admin@gustopro.it   / admin2024!");
  console.log("  Manager: manager@gustopro.it / staff2024!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
