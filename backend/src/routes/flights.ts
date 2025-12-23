// Gestione delle rotte per i voli (statistiche, creazione, ricerca)
// Gestisce API per voli, statistiche airline e ricerca voli multipli (diretti/scalo)
import { Router } from 'express';
import { auth } from '../middleware/auth';
import { Airport } from '../models/Airport';
import { Flight } from '../models/Flight';
import { SeatType } from '../models/SeatType';
import { Ticket } from '../models/Ticket';
import { Profile } from '../models/Profile';

const router = Router();

// Helper per validare le date
const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());

// GET /api/flights/stats - Ottiene statistiche aggregate per la compagnia aerea loggata
router.get('/stats', auth, async (req, res) => {
  try {
    const airlineId = req.user?._id;
    // Trova tutti i voli per questa compagnia aerea
    const flights = await Flight.find({ airline: airlineId }).select('_id from_airport to_airport');
    const flightIds = flights.map(f => f._id);

    // Aggrega i biglietti per questi voli
    const tickets = await Ticket.find({ flight: { $in: flightIds } });

    const totalSold = tickets.length;
    const totalRevenue = tickets.reduce((acc, t) => acc + t.price_paid, 0);

    // Calcola le rotte principali
    const routeMap: { [key: string]: { sold: number, revenue: number, from_name: string, to_name: string } } = {};

    // Helper per trovare info volo
    const getFlightInfo = (fid: string) => flights.find(f => f._id.toString() === fid.toString());

    for (const t of tickets) {
      const fid = t.flight.toString();
      if (!routeMap[fid]) {
        const f = getFlightInfo(fid) as any; // Popolato? No, ma servono i nomi. 
        // Non popolato sopra. Si raggruppa per ID.
        // Più semplice: raggruppa per ID volo prima.
        routeMap[fid] = { sold: 0, revenue: 0, from_name: '', to_name: '' };
      }
      routeMap[fid].sold++;
      routeMap[fid].revenue += t.price_paid;
    }

    // Ora popola i nomi per le rotte con vendite
    // Usiamo la logica /my-flights e qui ritorniamo totali + top 3

    // Raffiniamo la logica topRoutes:
    const salesByFlight = Object.keys(routeMap).map(fid => ({
      flightId: fid,
      sold: routeMap[fid].sold,
      revenue: routeMap[fid].revenue
    }));

    salesByFlight.sort((a, b) => b.sold - a.sold);
    const top3 = salesByFlight.slice(0, 3);

    const topRoutes = await Promise.all(top3.map(async (item) => {
      const f = await Flight.findById(item.flightId).populate('from_airport').populate('to_airport');
      return {
        from_name: (f?.from_airport as any)?.name || 'Unknown',
        to_name: (f?.to_airport as any)?.name || 'Unknown',
        sold: item.sold,
        revenue: item.revenue
      };
    }));

    res.json({
      revenue: totalRevenue,
      sold: totalSold,
      topRoutes
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/flights/my-flights - Ottiene i voli per la compagnia aerea loggata
router.get('/my-flights', auth, async (req, res) => {
  try {
    const flights = await Flight.find({ airline: req.user?._id })
      .populate('from_airport')
      .populate('to_airport')
      .populate('plane')
      .sort({ date_departure: 1 });

    const results = await Promise.all(flights.map(async (f) => {
      const seats = await SeatType.find({ flight: f._id });
      // Calcola statistiche reali dai biglietti
      const tickets = await Ticket.find({ flight: f._id });
      const sold = tickets.length;
      const revenue = tickets.reduce((sum, t) => sum + t.price_paid, 0);

      return {
        ...f.toObject(),
        seat_types: seats,
        sold,       // Aggiunto
        revenue     // Aggiunto
      };
    }));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST /api/flights - Crea nuovo volo
router.post('/', auth, async (req, res) => {
  try {
    const {
      fromAirportId, toAirportId, dateDeparture, dateArrival,
      timeDeparture, timeArrival, planeId,
      priceEconomy, seatsEconomy,
      priceBusiness, seatsBusiness,
      priceFirst, seatsFirst,
      priceBag, priceBaggage
    } = req.body;

    // Combina data e ora
    const startDateTime = new Date(`${dateDeparture}T${timeDeparture}`);
    const endDateTime = new Date(`${dateArrival}T${timeArrival}`);

    if (!isValidDate(startDateTime) || !isValidDate(endDateTime)) {
      return res.status(400).json({ message: 'Date o orari non validi' });
    }

    // Crea Volo
    const newFlight = await Flight.create({
      airline: req.user?._id, // Presume che il middleware auth popoli user (airline)
      from_airport: fromAirportId,
      to_airport: toAirportId,
      plane: planeId,
      date_departure: startDateTime,
      date_arrival: endDateTime,
      departure: timeDeparture,
      arrival: timeArrival,
      check_in: 'Open', // Default
      price_of_bag: priceBag,
      price_of_baggage: priceBaggage
    });

    // Crea SeatTypes
    const seatTypesData = [
      { type: 'Economy', price: priceEconomy, seats: seatsEconomy },
      { type: 'Business', price: priceBusiness, seats: seatsBusiness },
      { type: 'First', price: priceFirst, seats: seatsFirst }
    ];

    const seatPromises = seatTypesData.map(st => {
      if (st.price && st.seats) {
        return SeatType.create({
          flight: newFlight._id,
          seat_class: st.type,
          price: st.price,
          number_available: st.seats,
          number_total: st.seats, // Totale = disponibili inizialmente
          baggage: false, // Default
          type: st.type.toLowerCase() // 'economy', 'business', ecc.
        });
      }
      return Promise.resolve();
    });

    await Promise.all(seatPromises);

    res.status(201).json(newFlight);
  } catch (err) {
    console.error("Errore creazione volo:", err);
    res.status(500).json({ message: "Errore interno server" });
  }
});

// <TODO> eliminare auth dalla riga sotto, serve solo per test
router.get('', async (req, res) => {
  try {
    // 1. Estrazione Query Params
    // Esempio URL: /search?from=Roma&to=New York&date=2026-04-01
    const { from, to, date } = req.query;

    if (!from || !date) {
      return res.status(400).json({ message: "Parametri 'from' e 'date' obbligatori." });
    }

    const searchDate = new Date(date as string);
    if (!isValidDate(searchDate)) {
      return res.status(400).json({ message: "Formato data non valido (usa YYYY-MM-DD)." });
    }

    // 2. Risoluzione Aeroporti (Da Nome/Città a ID)
    // TROVIAMO TUTTI GLI AEROPORTI CHE MATCHANO (es. "Roma" -> [FCO, CIA])
    const originAirports = await Airport.find({
      $or: [{ name: new RegExp(from as string, 'i') }, { city: new RegExp(from as string, 'i') }]
    });

    const destAirports = to ? await Airport.find({
      $or: [{ name: new RegExp(to as string, 'i') }, { city: new RegExp(to as string, 'i') }]
    }) : [];

    if (originAirports.length === 0) {
      return res.status(404).json({ message: "Aeroporto di partenza non trovato." });
    }

    if (to && destAirports.length === 0) {
      return res.status(404).json({ message: "Aeroporto di destinazione non trovato." });
    }

    // Definiamo l'intervallo di tempo per la ricerca (Dalla data specificata in poi)
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);

    // --- STRATEGIA A: VOLI DIRETTI ---
    const query: any = {
      from_airport: { $in: originAirports.map(a => a._id) }, // Controlla QUALSIASI aeroporto corrispondente
      date_departure: { $gte: startOfDay }
    };

    if (destAirports.length > 0) {
      query.to_airport = { $in: destAirports.map(a => a._id) };
    }

    const directFlights = await Flight.find(query)
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
    // --- STRATEGIA B: VOLI CON 1 SCALO ---
    // Eseguiamo solo se non richiesto "directOnly"
    const directOnly = req.query.directOnly === 'true';

    if (!directOnly) {
      // 1. Trova potenziali prime tratte: da Origin a (Ovunque tranne Destination)
      //    Partenza >= startOfDay
      const firstLegs = await Flight.find({
        from_airport: { $in: originAirports.map(a => a._id) },
        date_departure: { $gte: startOfDay },
        to_airport: { $nin: destAirports.map(a => a._id) } // Non diretti
      }).populate('airline')
        .populate('from_airport')
        .populate('to_airport')
        .populate('plane');

      // 2. Per ogni prima tratta, cerca una seconda tratta che colleghi l'hub alla destinazione
      const MAX_LAYOVER_HOURS = 24;
      const MIN_LAYOVER_HOURS = 2; // Aggiornato a 2 ore come richiesto

      for (const leg1 of firstLegs) {
        if (!leg1.date_arrival) continue;

        const minDeparture2 = new Date(leg1.date_arrival);
        minDeparture2.setHours(minDeparture2.getHours() + MIN_LAYOVER_HOURS);

        const maxDeparture2 = new Date(leg1.date_arrival);
        maxDeparture2.setHours(maxDeparture2.getHours() + MAX_LAYOVER_HOURS);

        // Cerca seconda tratta: Hub -> Destinazione
        const connectingFlights = await Flight.find({
          from_airport: leg1.to_airport._id, // Hub
          to_airport: { $in: destAirports.map(a => a._id) },
          date_departure: { $gte: minDeparture2, $lte: maxDeparture2 }
        }).populate('airline')
          .populate('from_airport')
          .populate('to_airport')
          .populate('plane');

        for (const leg2 of connectingFlights) {
          // Calcolo prezzi (somma dei min prices found)
          // Nota: Questo è approssimativo per scopi dimostrativi
          const seats1 = await SeatType.find({ flight: leg1._id });
          const seats2 = await SeatType.find({ flight: leg2._id });

          if (seats1.length === 0 || seats2.length === 0) continue;

          const getMinPrice = (sts: any[]) => {
            const eco = sts.find(s => s.seat_class?.toLowerCase() === 'economy');
            return eco ? eco.price : Math.min(...sts.map(s => s.price));
          };

          const price1 = getMinPrice(seats1);
          const price2 = getMinPrice(seats2);

          // Disponibilità deve esserci su entrambi
          const totalSeats = Math.min(
            seats1.reduce((acc, s) => acc + s.number_available, 0),
            seats2.reduce((acc, s) => acc + s.number_available, 0)
          );

          const totalDuration = (leg2.date_arrival.getTime() - leg1.date_departure.getTime()) / 36e5;

          results.push({
            type: '1_STOP',
            total_price: price1 + price2,
            available_seats: totalSeats,
            duration_hours: totalDuration,
            legs: [leg1, leg2]
          });
        }
      }
    }
    // 4. Ordinamento
    const sort = req.query.sort as string || 'price';

    results.sort((a, b) => {
      if (sort === 'price') {
        return a.total_price - b.total_price;
      } else if (sort === 'duration') {
        return a.duration_hours - b.duration_hours;
      } else if (sort === 'stops') {
        return a.legs.length - b.legs.length;
      } else if (sort === 'depart') {
        return a.legs[0].date_departure.getTime() - b.legs[0].date_departure.getTime();
      }
      return 0;
    });

    // 5. Filtro per numero passeggeri
    const passengers = parseInt(req.query.passengers as string) || 1;
    const filteredResults = results.filter(r => r.available_seats >= passengers);

    res.status(200).json(filteredResults);

  } catch (error) {
    console.error("Errore nella ricerca voli:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
});


export default router;

// Ottieni singolo volo per ID
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const flight = await Flight.findById(id)
      .populate('airline')
      .populate('from_airport')
      .populate('to_airport');
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    const seatTypes = await SeatType.find({ flight: flight._id });
    res.json({ flight, seatTypes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Estensione interfaccia Request...
// Rimosso: uso dichiarazione in auth.ts
/*declare module 'express-serve-static-core' {
  interface Request {
    user?: { _id: string };
  }
}*/
