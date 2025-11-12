import mongoose from 'mongoose';
export type TicketDoc = {
  flight: mongoose.Types.ObjectId;   // ref Flight
  passenger: mongoose.Types.ObjectId;// ref Passenger
  seat_class: string;
  price_paid: number;
};
const schema = new mongoose.Schema<TicketDoc>({
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true },
  seat_class: { type: String, required: true },
  price_paid: { type: Number, required: true }
}, { timestamps:true });
schema.index({ passenger:1, flight:1 });
export const Ticket = mongoose.model<TicketDoc>('Ticket', schema);
