import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import flightsRoute from './routes/flights';
import profileRouter from './routes/profile';
import sessionRouter from './routes/session';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/airdb';
mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB connesso');
}).catch(err => {
  console.error('Errore connessione Mongo:', err);
  process.exit(1);
});

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
