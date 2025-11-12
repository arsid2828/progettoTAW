import { Flight } from './flight';
import { SeatType } from './seat-type';

export interface SearchQuery {
  from_airport: string;
  to_airport?: string;
  date?: string;         // YYYY-MM-DD
  passengers?: number;
  one_way?: boolean;
  round_trip?: boolean;
}

export type FlightResultTuple = Flight | [Flight, Flight]; // diretto OPPURE con scalo
export interface SearchResult {
  flights: Array<{ flight_tuple: FlightResultTuple; best_price: number }>;
  seat_types: SeatType[];
  messages?: string[];
}
