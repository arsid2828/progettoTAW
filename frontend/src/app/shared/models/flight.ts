import { Airline } from './airline';
import { Airport } from './airport';

export interface Flight {
  id: string;
  from_airport_rel: Airport;
  to_airport_rel: Airport;
  airline: Airline;
  date_departure: string;   // ISO date (YYYY-MM-DD)
  departure: string;        // HH:mm
  // campi aggiuntivi se servono
}
