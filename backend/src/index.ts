// File principale dell'applicazione backend
// Gestisce la configurazione del server, la connessione al database e la definizione delle rotte
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import flightsRoute from './routes/flights';
import ticketsRoute from './routes/tickets';
import airportsRoute from './routes/airports';
import planesRoute from './routes/planes';
import profileRouter from './routes/profile';
import sessionRouter from './routes/session';
import airlinesRouter from './routes/airlines'; // Nuova importazione
import { seedAirports } from './seed/airports';
import { seedAll } from './seed/seed';

const app = express();
app.use(cors());
app.use(express.json());

// Configurazione MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/airdb';

/* metto tutto in una funzione async per poter usare await
mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB connesso');
}).catch(err => {
  console.error('Errore connessione Mongo:', err);
  process.exit(1);
});*/
const startServer = async () => {
  try {
    // A. Connessione al database
    await mongoose.connect(MONGO_URI);
    // B. Esecuzione del seed (solo dopo connessione DB)

    await seedAll();
    // C. Avvio del server (solo dopo preparazione dati)
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

  } catch (err) {
    console.error('Errore critico durante l\'avvio:', err);
    process.exit(1);
  }
};

// 3. Esecuzione funzione avvio
startServer();
// Definizione rotte
app.use('/api/flights', flightsRoute);
app.use('/api/tickets', ticketsRoute);
app.use('/api/airports', airportsRoute);
app.use('/api/planes', planesRoute); // Registrato

// Controllo stato
app.get('/api/health', (_, res) => res.json({ ok: true }));


app.use('/api/session', sessionRouter);
app.use('/api/session/', sessionRouter);
app.use('/api/profile', profileRouter);
app.use('/api/profile/', profileRouter);
app.use('/api/airlines', airlinesRouter); // Nuova rotta

const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
