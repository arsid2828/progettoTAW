// Modello degli aeroporti
// Contiene informazioni su nome, città e codice IATA
import mongoose from 'mongoose';
export type AirportDoc = {
  name: string;
  city: string;
  code: string; // es.FCO
};
const schema = new mongoose.Schema<AirportDoc>({
  name: { type: String, required: true },
  city: { type: String, required: true },
  code: { type: String, required: true, unique: true }
}, { timestamps: true });
schema.index({ code: 1 });
export const Airport = mongoose.model<AirportDoc>('Airport', schema);
