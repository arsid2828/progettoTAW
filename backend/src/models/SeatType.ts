import mongoose from 'mongoose';
export type SeatTypeDoc = {
  flight: mongoose.Types.ObjectId; // ref Flight
  seat_class: string; // "ECONOMY"/"BUSINESS"/"FIRST" ecc.
  number_available: number;
  price: number;
};
const schema = new mongoose.Schema<SeatTypeDoc>({
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  seat_class: { type: String, required: true },
  number_available: { type: Number, required: true },
  price: { type: Number, required: true }
}, { timestamps:true });
schema.index({ flight:1 });
export const SeatType = mongoose.model<SeatTypeDoc>('SeatType', schema);
