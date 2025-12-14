import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import flightsRoute from './routes/flights';
import profileRouter from './routes/profile';
import sessionRouter from './routes/session';
import { seedAirports } from './seed/airports';
import { seedAll } from './seed/seed';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
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
    // A. Connessione al DB
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connesso');

    // B. Esegui il Seed (SOLO dopo che il DB è connesso)

    await seedAll(); 
    // C. Avvia il server (SOLO dopo che i dati sono pronti)
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

  } catch (err) {
    console.error('Errore critico durante l\'avvio:', err);
    process.exit(1);
  }
};

// <--- 3. Lancia la funzione
startServer();
// rotte
app.use('/api/flights', flightsRoute);

// health
app.get('/api/health', (_,res)=>res.json({ ok:true }));


app.use('/api/session', sessionRouter);
app.use('/api/session/', sessionRouter);
app.use('/api/profile', profileRouter);   
app.use('/api/profile/', profileRouter);   

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
