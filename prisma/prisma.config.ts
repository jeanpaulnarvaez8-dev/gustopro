import path from "node:path";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load .env in dev, use system env vars in production
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const dbUrl = process.env.DATABASE_URL!;

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "schema.prisma"),
  migrate: {
    url: dbUrl,
  },
});
