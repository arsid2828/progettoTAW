// Seed aeroporti
// Popola il DB con aeroporti internazionali
import { Airport, AirportDoc } from "../models/Airport";


export const sampleAirports: AirportDoc[] = [
  // Europa
  { name: 'Leonardo da Vinci', city: 'Roma', code: 'FCO' },
  { name: 'Malpensa', city: 'Milano', code: 'MXP' },
  { name: 'Heathrow', city: 'Londra', code: 'LHR' },
  { name: 'Charles de Gaulle', city: 'Parigi', code: 'CDG' },
  { name: 'Frankfurt Airport', city: 'Francoforte', code: 'FRA' },
  { name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', code: 'MAD' },
  { name: 'Schiphol', city: 'Amsterdam', code: 'AMS' },

  // Nord America
  { name: 'John F. Kennedy', city: 'New York', code: 'JFK' },
  { name: 'Los Angeles International', city: 'Los Angeles', code: 'LAX' },
  { name: 'O\'Hare International', city: 'Chicago', code: 'ORD' },
  { name: 'Hartsfield–Jackson', city: 'Atlanta', code: 'ATL' },
  { name: 'Toronto Pearson', city: 'Toronto', code: 'YYZ' },
  { name: 'San Francisco International', city: 'San Francisco', code: 'SFO' },

  // Asia
  { name: 'Haneda', city: 'Tokyo', code: 'HND' },
  { name: 'Beijing Capital', city: 'Pechino', code: 'PEK' },
  { name: 'Dubai International', city: 'Dubai', code: 'DXB' },
  { name: 'Hong Kong International', city: 'Hong Kong', code: 'HKG' },
  { name: 'Singapore Changi', city: 'Singapore', code: 'SIN' },
  { name: 'Incheon International', city: 'Seoul', code: 'ICN' },

  // Sud America
  { name: 'Guarulhos', city: 'San Paolo', code: 'GRU' },
  { name: 'El Dorado', city: 'Bogotà', code: 'BOG' },
  { name: 'Jorge Chávez', city: 'Lima', code: 'LIM' },

  // Oceania
  { name: 'Kingsford Smith', city: 'Sydney', code: 'SYD' },
  { name: 'Melbourne Airport', city: 'Melbourne', code: 'MEL' },
  { name: 'Auckland Airport', city: 'Auckland', code: 'AKL' },

  // Africa
  { name: 'O. R. Tambo', city: 'Johannesburg', code: 'JNB' },
  { name: 'Cairo International', city: 'Il Cairo', code: 'CAI' },
  { name: 'Bole International', city: 'Addis Abeba', code: 'ADD' }
];

export const seedAirports = async () => {
  try {
    // 1. Controlla se esistono già documenti
    const count = await Airport.countDocuments();

    if (count === 0) {
      // 2. Se è vuoto, inserisci i dati
      await Airport.insertMany(sampleAirports);
      console.log('Dati iniziali degli aeroporti caricati con successo!');
    } else {
      // 3. Se ci sono già dati, non fare nulla
      console.log('Database già popolato. Skipping seed.');
    }
  } catch (error) {
    console.error('Errore durante il seeding degli aeroporti:', error);
  }
};