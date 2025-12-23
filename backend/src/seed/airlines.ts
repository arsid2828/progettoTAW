// Seed compagnie aeree
// Popola il DB con compagnie aeree iniziali
import bcrypt from 'bcrypt';
import { Airline, AirlineDoc } from '../models/Airline'; // Aggiusta il percorso se necessario

// Dati grezzi (senza password hashata per ora)
const rawAirlines = [
  {
    name: 'SkyHigh Airways',
    email: 'info@skyhigh.com',
  },
  {
    name: 'Oceanic Airlines', // Citazione classica
    email: 'contact@oceanic.com',
  },
  {
    name: 'Aurora Aviation',
    email: 'support@aurora-air.com',
  },
  {
    name: 'SwiftJet Global',
    email: 'hello@swiftjet.com',
  },
  {
    name: 'Nova Air',
    email: 'fly@novaair.com',
  }
];

export const seedAirlines = async () => {
  try {
    // 1. Controllo esistenza
    const count = await Airline.countDocuments();

    if (count === 0) {
      console.log('Avvio seeding Airlines...');

      // 2. Hash della password
      // Usiamo una password uguale per tutti per comodità di test: "password123"
      const SALT_ROUNDS = 10;
      const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);

      // 3. Preparazione dei dati completi
      const airlinesToInsert: AirlineDoc[] = rawAirlines.map(airline => ({
        name: airline.name,
        email: airline.email,
        password: hashedPassword // Assegniamo la password hashata
      }));

      // 4. Inserimento
      await Airline.insertMany(airlinesToInsert);
      console.log('5 Compagnie aeree caricate (Password per tutte: "password123")');
    } else {
      console.log('Airlines già presenti. Salto.');
    }
  } catch (error) {
    console.error(' Errore seed Airlines:', error);
  }
};