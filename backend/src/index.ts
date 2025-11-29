import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import flightsRoute from './routes/flights';

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



const profileRouter = require('./routes/profile');
app.use('/api/profile', profileRouter);   
app.use('/api/profile/', profileRouter);   

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
