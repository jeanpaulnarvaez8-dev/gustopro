import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "./db"; // loads dotenv + initializes prisma first
import { catalogRouter } from "./routes/catalog";
import { bookingsRouter } from "./routes/bookings";
import { dashboardRouter } from "./routes/dashboard";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT ?? process.env.API_PORT ?? 3001;
const isProd = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: isProd
      ? ["https://gustopro.it", "https://www.gustopro.it"]
      : ["http://localhost:5173", "http://localhost:3000"],
  })
);
app.use(express.json());

// ─── API routes ─────────────────────────────────────────────────────────────

app.use("/api/catalog", catalogRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/dashboard", dashboardRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), env: isProd ? "production" : "development" });
});

// ─── Serve frontend in production ───────────────────────────────────────────

if (isProd) {
  const distPath = path.resolve(__dirname, "../../dist");
  app.use(express.static(distPath, { maxAge: "1y", immutable: true }));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 GustoPro ${isProd ? "PROD" : "DEV"} running on http://localhost:${PORT}`);
});
