import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { Flight } from "./models/Flight";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/flights", async (req, res) => {
  try {
    const { from, to, date } = req.query as { from?: string; to?: string; date?: string };
    const q: any = {};
    if (from) q.from = new RegExp(from, "i");
    if (to)   q.to   = new RegExp(to, "i");
    if (date) q.date = date;
    const flights = await Flight.find(q).sort({ date: 1, depart: 1 }).lean();
    res.json(flights);
  } catch (err:any) {
    console.error("GET /api/flights error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

async function seedIfEmpty() {
  const count = await Flight.estimatedDocumentCount();
  if (count > 0) return;

  await Flight.insertMany([
    { airline: "Volotea", from: "ROM", to: "MIL", date: "2025-11-10", depart: "08:30", arrive: "09:40", price: 49.9 },
    { airline: "ITA",     from: "MIL", to: "ROM", date: "2025-11-10", depart: "11:00", arrive: "12:10", price: 55.0 },
    { airline: "easyJet", from: "ROM", to: "NAP", date: "2025-11-11", depart: "15:30", arrive: "16:20", price: 35.0 },
    { airline: "Ryanair", from: "NAP", to: "ROM", date: "2025-11-12", depart: "07:10", arrive: "08:05", price: 29.9 },
    { airline: "ITA",     from: "ROM", to: "CTA", date: "2025-11-12", depart: "18:45", arrive: "20:00", price: 62.0 }
  ]);
  console.log("Seed: inseriti voli demo.");
}

async function start() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/airdb";
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connesso:", uri);
    await seedIfEmpty();
    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => console.log(`API in ascolto su :${port}`));
  } catch (err:any) {
    console.error("Errore connessione MongoDB:", err);
    process.exit(1);
  }
}

start();
