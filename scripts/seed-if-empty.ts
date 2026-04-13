import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.menuItem.count();
  if (count > 0) {
    console.log("📦 Database already has data — skipping seed.");
    process.exit(0);
  }
  console.log("🌱 Empty database — seeding required. Run: npx prisma db seed");
  process.exit(1); // Signal to the startup script to run seed
}

main().catch(() => process.exit(1)).finally(() => prisma.$disconnect());
