import mongoose from "mongoose";

export type FlightDoc = {
  airline: mongoose.Types.ObjectId; // ref Airline
  plane?: mongoose.Types.ObjectId;  // ref Plane
  from_airport: mongoose.Types.ObjectId; // ref Airport
  to_airport: mongoose.Types.ObjectId;   // ref Airport

  price_of_bag?: number;
  price_of_baggage?: number;

  departure: string;      // "HH:mm"
  arrival: string;        // "HH:mm"
  date_departure: Date;   // data partenza
  date_arrival: Date;     // data arrivo
};

const flightSchema = new mongoose.Schema<FlightDoc>({
  airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  plane:   { type: mongoose.Schema.Types.ObjectId, ref: 'Plane' },
  from_airport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  to_airport:   { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  price_of_bag: Number,
  price_of_baggage: Number,
 // departure: { type: String, required: true }, todo
 // arrival:   { type: String, required: true }, abbiamo fatto na cacata, TENIAMO L'ORARIO NELLA DATE
  date_departure: { type: Date, required: true },     
  date_arrival:   { type: Date, required: true }
}, { timestamps:true });

flightSchema.index({ from_airport:1, date_departure:1 }); // come l'indice SQL

export const Flight = mongoose.model<FlightDoc>("Flight", flightSchema);
