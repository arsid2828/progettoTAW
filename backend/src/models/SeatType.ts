// Modello per i tipi di posto
// Definisce le classi di posto, disponibilità e prezzi per volo
import mongoose from 'mongoose';
export type SeatTypeDoc = {
  flight: mongoose.Types.ObjectId; // riferimento Flight
  seat_class: string; // "ECONOMY"/"BUSINESS"/"FIRST" ecc.
  number_available: number;
  number_total: number;
  price: number;
  baggage: boolean;
  type: string;
};
const schema = new mongoose.Schema<SeatTypeDoc>({
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  seat_class: { type: String, required: true },
  number_available: { type: Number, required: true },
  number_total: { type: Number, required: true },
  price: { type: Number, required: true },
  baggage: { type: Boolean, default: false },
  type: { type: String }
}, { timestamps: true });
schema.index({ flight: 1 });
export const SeatType = mongoose.model<SeatTypeDoc>('SeatType', schema);
