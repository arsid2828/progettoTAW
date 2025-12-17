import { Router } from 'express';
import { auth } from '../middleware/auth';
import { Airport } from '../models/Airport';
import { Flight } from '../models/Flight';
import { SeatType } from '../models/SeatType';

const router = Router();

// Helper per validare le date
const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());
//<TODO> eliminare auth dalla riga sotto setve solo per verificare se i token funzionano
router.get('/search', async (req, res) => {
  try {
    // 1. Estrazione Query Params
    // Esempio URL: /search?from=Roma&to=New York&date=2026-04-01
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ message: "Parametri 'from', 'to' e 'date' obbligatori." });
    }

    const searchDate = new Date(date as string);
    if (!isValidDate(searchDate)) {
      return res.status(400).json({ message: "Formato data non valido (usa YYYY-MM-DD)." });
    }

    // 2. Risoluzione Aeroporti (Da Nome/Città a ID)
    // Usiamo una Regex per cercare parzialmente (es. "milano" trova "Milano Malpensa")
    const originAirport = await Airport.findOne({
      $or: [{ name: new RegExp(from as string, 'i') }, { city: new RegExp(from as string, 'i') }]
    });

    const destAirport = await Airport.findOne({
      $or: [{ name: new RegExp(to as string, 'i') }, { city: new RegExp(to as string, 'i') }]
    });

    if (!originAirport || !destAirport) {
      return res.status(404).json({ message: "Aeroporto di partenza o destinazione non trovato." });
    }

    // Definiamo l'intervallo di tempo per la ricerca (Tutto il giorno specificato)
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    // console.log(`🔎 Ricerca voli da ${originAirport.name} a ${destAirport.name} il ${startOfDay.toISOString().split('T')[0]}`);

    // --- STRATEGIA A: VOLI DIRETTI ---
    const directFlights = await Flight.find({
      from_airport: originAirport._id,
      to_airport: destAirport._id,
      date_departure: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('airline')
      .populate('from_airport')
      .populate('to_airport')
      .populate('plane'); // Opzionale

    // Formattiamo i risultati diretti
    // Formattiamo i risultati diretti
    const results = await Promise.all(directFlights.map(async (f) => {
      const seats = await SeatType.find({ flight: f._id });

      const totalSeats = seats.reduce((acc, s) => acc + s.number_available, 0);

      // Cerca classe Economy (case-insensitive) o usa il minimo
      const economySeat = seats.find(s => s.seat_class && s.seat_class.toLowerCase() === 'economy');
      const minPrice = economySeat ? economySeat.price : seats.reduce((min, s) => (s.price < min ? s.price : min), Infinity);

      return {
        type: 'DIRECT',
        total_price: minPrice === Infinity ? 0 : minPrice,
        available_seats: totalSeats,
        duration_hours: (f.date_arrival.getTime() - f.date_departure.getTime()) / 36e5,
        legs: [f]
      };
    }));
    /*
        // --- STRATEGIA B: VOLI CON 1 SCALO (Algoritmo Semplificato) ---
        // 1. Trova tutti i voli che partono dall'origine in quel giorno verso OVUNQUE
        const firstLegs = await Flight.find({
          from_airport: originAirport._id,
          date_departure: { $gte: startOfDay, $lte: endOfDay },
          to_airport: { $ne: destAirport._id } // Escludiamo quelli che vanno già a destinazione (già presi sopra)
        });
    
        // 2. Per ogni primo volo, cerca se esiste un secondo volo verso la destinazione finale
        for (const leg1 of firstLegs) {
          // Il secondo volo deve partire DOPO l'arrivo del primo (minimo 1 ora di scalo, max 24 ore)
          const minDeparture = new Date(leg1.date_arrival);
          minDeparture.setHours(minDeparture.getHours() + 1); // +1 ora scalo
    
          const maxDeparture = new Date(leg1.date_arrival);
          maxDeparture.setHours(maxDeparture.getHours() + 24); // max 24h attesa
    
          // Cerca volo: Da (Hub intermedio) -> A (Destinazione Finale)
          const connectingFlights = await Flight.find({
            from_airport: leg1.to_airport, // Parte dove è arrivato il primo
            to_airport: destAirport._id,
            date_departure: { $gte: minDeparture, $lte: maxDeparture }
          })
            .populate('airline')
            .populate('from_airport')
            .populate('to_airport');
    
          // Se troviamo coincidenze, aggiungiamole ai risultati
          for (const leg2 of connectingFlights) {
            // Calcolo durata totale (Partenza volo 1 -> Arrivo volo 2)
            const totalDuration = (leg2.date_arrival.getTime() - leg1.date_departure.getTime()) / 36e5;
    
            // Dobbiamo popolare anche il primo volo per averlo completo nel JSON
            await leg1.populate(['airline', 'from_airport', 'to_airport']);
    
            results.push({
              type: '1_STOP',
              total_price: 180, // Prezzo fittizio somma
              duration_hours: totalDuration,
              legs: [leg1, leg2] // Array di due voli
            });
          }
        }
    */
    // Ordiniamo per data partenza
    results.sort((a, b) => a.legs[0].date_departure.getTime() - b.legs[0].date_departure.getTime());

    res.status(200).json(results);

  } catch (error) {
    console.error("Errore nella ricerca voli:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
});

export default router;
