// Modello per la gestione dei voli
// Definisce la struttura del documento Flight e le relazioni con altri modelli
import mongoose from "mongoose";

export type FlightDoc = {
  airline: mongoose.Types.ObjectId; // riferimento Airline
  plane?: mongoose.Types.ObjectId;  // riferimento Plane
  from_airport: mongoose.Types.ObjectId; // riferimento Airport
  to_airport: mongoose.Types.ObjectId;   // riferimento Airport

  price_of_bag?: number;
  price_of_baggage?: number;

  departure: string;      // DEPRECATO, abbiamo scelto di metterli dentro la data_departure ecc
  arrival: string;        // --------------------------------
  check_in: string;       // Stato DEPRECATO, non gestito più
  date_departure: Date;   // data partenza
  date_arrival: Date;     // data arrivo
};

const flightSchema = new mongoose.Schema<FlightDoc>({
  airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  plane: { type: mongoose.Schema.Types.ObjectId, ref: 'Plane' },
  from_airport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  to_airport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  price_of_bag: Number,
  price_of_baggage: Number,
  check_in: String,
  date_departure: { type: Date, required: true },
  date_arrival: { type: Date, required: true }
}, { timestamps: true });

flightSchema.index({ from_airport: 1, date_departure: 1 }); //come l'indice SQL

export const Flight = mongoose.model<FlightDoc>("Flight", flightSchema);
