import mongoose from "mongoose";

export type FlightDoc = {
  airline: string;
  from: string;
  to: string;
  date: string;     // YYYY-MM-DD
  depart: string;   // HH:mm
  arrive: string;   // HH:mm
  price: number;
};

const flightSchema = new mongoose.Schema<FlightDoc>({
  airline: { type: String, required: true },
  from:    { type: String, required: true },
  to:      { type: String, required: true },
  date:    { type: String, required: true },
  depart:  { type: String, required: true },
  arrive:  { type: String, required: true },
  price:   { type: Number, required: true }
});

export const Flight = mongoose.model<FlightDoc>("Flight", flightSchema);
