// models/Session.ts
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // è un ObjectId di MongoDB (es. 507f1f77bcf86cd799439011)
    ref: 'Profile',     // quando fai .populate('userId') ti tira fuori il documento del model "Profile"
    required: true,     // non puoi creare sessione senza utente
    index: true         // velocizza le query tipo Session.find({ userId: ... })
  },
  token: {
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