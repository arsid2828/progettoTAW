// Seed tipi di posto
// Popola il DB con i tipi di posto per i voli
import mongoose from 'mongoose';
import { Flight } from '../models/Flight';
import { SeatType, SeatTypeDoc } from '../models/SeatType';

// Helper per prezzo random
const randomPrice = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

export const seedSeatTypes = async () => {



    const count = await SeatType.countDocuments();

    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);
    console.log(` Trovati ${count} SeatType nel DB.`);

    if (count === 0) {
        console.log(" Inizio seeding SeatTypes...");

        // 1. Recuperiamo tutti i voli
        const flights = await Flight.find().select('_id'); // Ci servono solo gli ID

        if (flights.length === 0) {
            console.error("Nessun volo trovato. Esegui prima il seed dei voli!");
            return;
        }

        // 2. Ottimizzazione: Troviamo gli ID dei voli che hanno GIÀ dei posti
        // "distinct" ci restituisce un array di ID univoci presenti nella collection SeatType
        const flightsWithSeats = await SeatType.distinct('flight');
        const processedFlightIds = new Set(flightsWithSeats.map(id => id.toString()));

        const seatsToInsert: Partial<SeatTypeDoc>[] = [];
        let flightsProcessedCount = 0;

        console.log(` Analisi di ${flights.length} voli...`);

        // 3. Cicliamo i voli e generiamo i posti solo per quelli "vuoti"
        for (const flight of flights) {
            const flightIdStr = flight._id.toString();

            // Se il volo ha già i posti, saltiamo
            if (processedFlightIds.has(flightIdStr)) {
                continue;
            }

            // --- LOGICA PREZZI ---
            // Prezzo base Economy (50 - 200)
            const economyPrice = randomPrice(50, 200);
            // Business (+30)
            const businessPrice = economyPrice + 30;
            // First (+50)
            const firstPrice = economyPrice + 50;

            // --- CREAZIONE OGGETTI ---

            // 1. Economy
            seatsToInsert.push({
                flight: flight._id,
                seat_class: "ECONOMY",
                number_available: 36,
                number_total: 36,
                price: economyPrice
            });

            // 2. Business
            seatsToInsert.push({
                flight: flight._id,
                seat_class: "BUSINESS",
                number_available: 20,
                number_total: 20,
                price: businessPrice
            });

            // 3. First
            seatsToInsert.push({
                flight: flight._id,
                seat_class: "FIRST",
                number_available: 12,
                number_total: 12,
                price: firstPrice
            });

            flightsProcessedCount++;
        }

        // 4. Inserimento massivo (Molto più veloce di inserire uno alla volta)
        if (seatsToInsert.length > 0) {
            await SeatType.insertMany(seatsToInsert);
            console.log(`Seed completato! Aggiunti ${seatsToInsert.length} tipi di posto per ${flightsProcessedCount} voli.`);
        } else {
            console.log("Tutti i voli hanno già i loro SeatType. Nessuna operazione necessaria.");
        }
    }
};