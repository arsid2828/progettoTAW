import mongoose from 'mongoose';
export type TicketDoc = {
  flight: mongoose.Types.ObjectId;   // ref Flight
  profile: mongoose.Types.ObjectId;// ref Profile
  seat_class: mongoose.Types.ObjectId; // ref SeatClass
  price_paid: number;
  p_nome?: String;
  p_cognome?: String;
  p_indirizzo?: String;
  p_sesso?: number;
  p_code?: String;
};
const schema = new mongoose.Schema<TicketDoc>({
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  seat_class: { type: mongoose.Schema.Types.ObjectId, ref: 'SeatType', required: true },
  price_paid: { type: Number, required: true },
  p_nome: String,
  p_cognome: String,
  p_indirizzo: String,
  p_sesso: { type: Number, enum: [0,1] },
  p_code: String,
}, { timestamps:true });
schema.index({ passenger:1, flight:1 });
export const Ticket = mongoose.model<TicketDoc>('Ticket', schema);
