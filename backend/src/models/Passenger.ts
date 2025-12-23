// Modello dei passeggeri
// Gestisce i dati anagrafici dei passeggeri associati a un profilo
import mongoose from 'mongoose';
export type PassengerDoc = {
  profile: mongoose.Types.ObjectId; // riferimento Profile
  nome: string;
  cognome: string;
  sesso: number; // 0/1
  telefono?: string;
  nazionalita?: string;
};
const schema = new mongoose.Schema<PassengerDoc>({
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  sesso: { type: Number, required: true, enum: [0, 1] },
  telefono: String,
  nazionalita: String
}, { timestamps: true });
export const Passenger = mongoose.model<PassengerDoc>('Passenger', schema);
