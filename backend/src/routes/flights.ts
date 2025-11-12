import { Router } from 'express';

const router = Router();

// MOCK: helper per comporre risposte in stile base.html
function directFlight(id: string, from: any, to: any, airline: any, date: string, time: string) {
  return { id, from_airport_rel: from, to_airport_rel: to, airline, date_departure: date, departure: time };
}

router.get('/search', (req, res) => {
  const { from_airport = '', to_airport = '', date = '', passengers = '1' } = req.query as Record<string,string>;
  const messages: string[] = [];
  if (!from_airport.trim()) messages.push('Inserisci l’aeroporto di partenza');

  // MOCK dati
  const FCO = { id:'1', code:'FCO', name:'Roma Fiumicino' };
  const CTA = { id:'2', code:'CTA', name:'Catania Fontanarossa' };
  const NYC = { id:'3', code:'JFK', name:'New York JFK' };
  const AZ  = { id:'AZ', name:'ITA Airways' };

  const seat_types = [
    { flight_id: 'AZ100', class:'ECO', number_available: 8, price: 89.90 },
    { flight_id: 'AZ200', class:'ECO', number_available: 3, price: 399.00 },
    { flight_id: 'AZ201', class:'ECO', number_available: 5, price: 120.00 },
  ];

  // due risultati: uno diretto FCO->CTA, uno con scalo FCO->CTA->JFK (esempio)
  const f1 = directFlight('AZ100', FCO, CTA, AZ, date || '2025-12-20', '08:30');
  const f2a = directFlight('AZ200', FCO, CTA, AZ, date || '2025-12-20', '10:10');
  const f2b = directFlight('AZ201', CTA, NYC, AZ, date || '2025-12-20', '14:20');

  const results = [
    { flight_tuple: f1, best_price: 89.90 },
    { flight_tuple: [f2a, f2b] as any, best_price: 120.00 }
  ];

  res.json({ flights: results, seat_types, messages });
});

export default router;
