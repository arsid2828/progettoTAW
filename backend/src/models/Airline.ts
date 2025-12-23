// Modello per le compagnie aeree
// Gestisce credenziali e dati delle compagnie
import mongoose from 'mongoose';
export type AirlineDoc = {
  name: string;
  email: string;
  password: string; // hashata
  role?: string;
  mustChangePassword?: boolean;
};
const schema = new mongoose.Schema<AirlineDoc>({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'airline' },
  mustChangePassword: { type: Boolean, default: false }
}, { timestamps: true });
export const Airline = mongoose.model<AirlineDoc>('Airline', schema);
