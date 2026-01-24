// Seed voli
// Genera voli casuali per riempire il database
import { Flight, FlightDoc } from "../models/Flight";
import { Airport } from "../models/Airport";
import { Airline } from "../models/Airline";
import { Plane } from "../models/Plane";

// --- HELPERS ---

// Aggiunge ore a una data
const addHours = (date: Date, hours: number): Date => {
    const newDate = new Date(date);
    newDate.setTime(newDate.getTime() + hours * 60 * 60 * 1000);
    return newDate;
};

// Genera un prezzo casuale
const randomPrice = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

// Calcola una durata fittizia basata su un minimo di logica (o random se non abbiamo coordinate)
const getRandomDuration = () => Math.floor(Math.random() * 8) + 1; // Voli da 1 a 9 ore

export const seedFlights = async () => {
    console.log("Inizio seeding voli (Pool Aerei Globale)...");


    // CONTROLLO PREVENTIVO
    // Se ci sono già voli, ci fermiamo subito.
    const existingFlightsCount = await Flight.countDocuments();
    if (existingFlightsCount > 0) {
        console.log(`Trovati già ${existingFlightsCount} voli nel DB. Seeding annullato per non sovrascrivere.`);
        return null;
    }

    // Recupero Dati Esistenti
    const airports = await Airport.find();
    const airlines = await Airline.find();
    const planes = await Plane.find();

    if (airports.length < 4 || airlines.length === 0 || planes.length === 0) {
        console.error("Errore: Assicurati di aver seedato Aeroporti, Airline e Aerei prima.");
        return;
    }

    // Inizializzazione Tracker Aerei
    // Mappa: ID Aereo -> Data in cui sarà libero
    // Partiamo dal 1 Aprile 2026 ore 06:00
    const initialDate = new Date("2026-04-01T06:00:00Z");

    const planeAvailability: Record<string, Date> = {};
    planes.forEach(p => {
        planeAvailability[p._id.toString()] = new Date(initialDate);
    });

    const flightsToInsert: Partial<FlightDoc>[] = [];

    // --- FUNZIONE CORE PER CREARE UN VOLO ---
    const createFlightData = async (
        fromAirport: any,
        toAirport: any,
        airline: any,
        minDepartureTime: Date
    ): Promise<Partial<FlightDoc> | null> => {

        // a. Scegliamo un aereo CASUALE dal pool globale (qualsiasi aereo va bene per qualsiasi airline)
        const plane = planes[Math.floor(Math.random() * planes.length)];
        const planeId = plane._id.toString();

        // b. Controlliamo quando questo aereo è libero
        let actualDeparture = new Date(minDepartureTime);
        const planeFreeAt = planeAvailability[planeId];

        // Se l'aereo è occupato oltre la data richiesta, posticipiamo la partenza
        if (planeFreeAt > actualDeparture) {
            actualDeparture = new Date(planeFreeAt);
        }

        // c. Calcoliamo arrivo e aggiorniamo il tracker
        const duration = getRandomDuration();
        const arrivalDate = addHours(actualDeparture, duration);

        // L'aereo sarà di nuovo libero dopo l'arrivo + 2 ore di scarto
        planeAvailability[planeId] = addHours(arrivalDate, 2);

        return {
            airline: airline._id,
            plane: plane._id,
            from_airport: fromAirport._id,
            to_airport: toAirport._id,
            price_of_bag: randomPrice(20, 60),
            price_of_baggage: randomPrice(50, 150),
            date_departure: actualDeparture,
            date_arrival: arrivalDate,
        };
    };


    // Voli con 1 Scalo
    // Esempio: Milano -> Londra -> Dublino
    console.log("   ↳ Generando rotte con 1 scalo...");
    for (let i = 0; i < 15; i++) {
        const shuffledAirports = [...airports].sort(() => 0.5 - Math.random()).slice(0, 3);
        const [origin, hub, dest] = shuffledAirports;
        const airline = airlines[Math.floor(Math.random() * airlines.length)];

        // Partenza randomica entro 10 giorni dall'inizio
        const randomDelay = Math.floor(Math.random() * 240);
        const start = addHours(initialDate, randomDelay);

        // Tratta A -> B
        const leg1 = await createFlightData(origin, hub, airline, start);
        if (leg1) flightsToInsert.push(leg1);

        // Tratta B -> C
        const leg2Start = addHours(leg1!.date_arrival!, 2.5); // 2.5 ore di scalo
        const leg2 = await createFlightData(hub, dest, airline, leg2Start);
        if (leg2) flightsToInsert.push(leg2);
    }

    // Voli Diretti (Riempimento)
    console.log("   ↳ Generando voli diretti sparsi...");
    for (let i = 0; i < 50; i++) {
        const shuffledAirports = [...airports].sort(() => 0.5 - Math.random()).slice(0, 2);
        const [origin, dest] = shuffledAirports;
        const airline = airlines[Math.floor(Math.random() * airlines.length)];

        // Distribuiti nei mesi successivi (fino a 60 giorni dopo Marzo 2026)
        const randomDelay = Math.floor(Math.random() * (24 * 60));
        const start = addHours(initialDate, randomDelay);

        const directFlight = await createFlightData(origin, dest, airline, start);
        if (directFlight) flightsToInsert.push(directFlight);
    }

    //Salvataggio
    //await Flight.deleteMany({}); // Reset
    await Flight.insertMany(flightsToInsert);

    console.log(`Seed completato! Inseriti ${flightsToInsert.length} voli dopo Marzo 2026.`);
};