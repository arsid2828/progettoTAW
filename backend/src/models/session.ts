// Modello per le sessioni utente
// Gestisce i token di accesso e refresh
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel', // Riferimento dinamico
    index: true
  },
  userModel: {
    type: String,
    required: true,
    enum: ['Profile', 'Airline'],
    default: 'Profile' // Opzionale, per retrocompatibilità
  },
  accessToken: {
    type: String,
    required: true,
    unique: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 1 }       // auto-rimuove alla scadenza
  },
  ipAddress: String,
  userAgent: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export const Session = mongoose.model('Session', sessionSchema);