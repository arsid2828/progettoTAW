// Componente pagamento
// Gestisce il riepilogo e la simulazione di pagamento
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { TicketService } from '@app/shared/ticket.service';
import { forkJoin } from 'rxjs';
import { FlightService } from '@app/services/flight.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  // Support multiple parameter names for compatibility: ticketId, ticketFlightId, flightIds
  ticketId = this.route.snapshot.queryParamMap.get('ticketId')
    || this.route.snapshot.queryParamMap.get('ticketFlightId')
    || this.route.snapshot.queryParamMap.get('flightIds');
  ticketService = inject(TicketService);
  flightService = inject(FlightService);
  location = inject(Location);
  loading = false;
  error: string | null = null;
  seat = this.route.snapshot.queryParamMap.get('seat') || null;
  seatTypeId = this.route.snapshot.queryParamMap.get('seatTypeId') || null;
  baggage = this.route.snapshot.queryParamMap.get('baggage') || null;

  // carica override passeggero se presente in localStorage (prenotazione singolo passeggero)
  passenger: any = null;
  flights: any = null;
  items: any[] = [];
  total = 0;
  seatTypesByFlight: any = {};
  passengerStub: any = null; // Stubs just in case
  seatTypeSelections: Record<string, string | null> = {}; // flightId -> seatTypeId mapping
  baggageSelections: Record<string, string | null> = {}; // flightId -> baggage choice mapping

  constructor() { }

  ngOnInit() {
    try { const p = localStorage.getItem('passengers'); if (p) { const arr = JSON.parse(p); if (Array.isArray(arr) && arr.length === 1) this.passenger = arr[0]; } } catch { }
    try { const p = localStorage.getItem('seatTypeSelections'); if (p) { const arr = JSON.parse(p); this.seatTypeSelections = arr; } } catch { }
    try { const p = localStorage.getItem('baggageSelections'); if (p) { const arr = JSON.parse(p); this.baggageSelections = arr; } } catch { }

    // load flight details and prepare items
    if (this.ticketId) {
      this.loading = true;
      console.log('Fetching details for ticketId:', this.ticketId);

      this.flightService.getFlightById(this.ticketId).subscribe({
        next: (res: any) => {
          this.loading = false;
          console.log('Flight details response:', res);

          // Robustly handle single vs multi response
          if (res.flight) {
            this.flights = [res.flight];
            // Map seat types using the ACTUAL flight ID from response
            if (res.seatTypes) {
              this.seatTypesByFlight[String(res.flight._id)] = res.seatTypes;
            }
          } else if (res.flights) {
            this.flights = res.flights;
            this.seatTypesByFlight = res.seatTypesByFlight || {};
            // Ensure keys are strings just in case
            const newMap: any = {};
            for (const k in this.seatTypesByFlight) newMap[String(k)] = this.seatTypesByFlight[k];
            this.seatTypesByFlight = newMap;
          } else {
            this.flights = [];
          }
          console.log('Processed flights:', this.flights);
          console.log('Processed seatTypesByFlight:', this.seatTypesByFlight);

          let passengersList: any[] = [];
          try {
            const p = localStorage.getItem('passengers');
            if (p) passengersList = JSON.parse(p);
          } catch { }
          if (!passengersList || passengersList.length === 0) {
            if (this.passenger) passengersList = [this.passenger];
          }

          const passengersParam = this.route.snapshot.queryParamMap.get('passengers');
          const pNum = Number(passengersParam) || 0;
          if (pNum > 0 && passengersList.length === 0) {
            for (let i = 0; i < pNum; i++) passengersList.push({ nome: '', cognome: '', baggageChoice: 'hand' });
          }

          const rawSeatParam = this.route.snapshot.queryParamMap.get('seat') || this.seat || null;
          let seat_pref: any = null;
          if (rawSeatParam) {
            try { seat_pref = JSON.parse(rawSeatParam); } catch { seat_pref = rawSeatParam; }
          }
          // const seatTypeId = this.route.snapshot.queryParamMap.get('seatTypeId') || null; // This is already a class property

          const seatPrefSurcharge: Record<string, number> = { window: 15, aisle: 12, middle: 8, random: 0 };

          this.items = passengersList.map((pass: any) => {
            // Keep this for backward compatibility if template uses 'items' anywhere, 
            // but mainly we rely on getPassengersByFlight now.
            // We can just execute the same single-flight logic for the first flight to populate 'items' 
            // as a fallback for single-passenger view.
            return { passenger: pass, price: 0 }; // Placeholder
          });

          // Calculate REAL total across all flights
          this.calculateTotal();

          try {
            const toSave = this.items.map((x: any) => ({
              nome: x.passenger?.nome || '',
              cognome: x.passenger?.cognome || '',
              baggageChoice: x.bag_label || 'hand',
              seat_number: x.seat_label || undefined,
              seatTypeId: x.seat_type && x.seat_type._id ? String(x.seat_type._id) : (this.seatTypeId || undefined)
            }));
            localStorage.setItem('passengers', JSON.stringify(toSave));
          } catch { }
        }, error: (err) => {
          console.error(err);
          this.loading = false;
          this.error = "Impossibile caricare i dettagli del volo. Riprova.";
        }
      });
    }
  }

  getPassengersByFlight(flightId: string) {
    if (!flightId || !this.flights) return [];

    let passengersList: any[] = [];
    try {
      const p = localStorage.getItem('passengers');
      if (p) passengersList = JSON.parse(p);
    } catch { }

    if (!passengersList || passengersList.length === 0) {
      if (this.passenger) passengersList = [this.passenger];
      if (passengersList.length === 0) passengersList = [{ nome: '', cognome: '', baggageChoice: 'hand' }];
    }

    // Since we call this from template often, optimize lookup
    const flight = this.flights.find((f: any) => String(f._id) === String(flightId));
    if (!flight) return [];

    let items = passengersList.map((pass: any, index: number) => {
      let baggageChoice = null;
      if (!baggageChoice) {
        if (this.baggageSelections && this.baggageSelections[flightId]) {
          baggageChoice = this.baggageSelections[flightId]![index] || null;
        }
      }
      if (!baggageChoice) { baggageChoice = 'hand'; }

      let seatTypeId = this.route.snapshot.queryParamMap.get('seatTypeId') || null;
      if (seatTypeId == null) { seatTypeId = this.seatTypeSelections[flightId]; }
      if (seatTypeId == null) { seatTypeId = pass.seatTypeId; }

      let seatprice = 0;
      let seatTypeObj = null;

      // Resolve Seat Price (Priority: ID -> Economy -> First Available)
      if (this.seatTypesByFlight[flightId]) {
        const types = this.seatTypesByFlight[flightId];
        // 1. Try exact ID
        seatTypeObj = types.find((s: any) => String(s._id) === String(seatTypeId));
        // 2. Try 'Economy'
        if (!seatTypeObj) seatTypeObj = types.find((s: any) => (s.type === 'Economy' || s.seat_class === 'Economy'));
        // 3. Fallback
        if (!seatTypeObj && types.length > 0) seatTypeObj = types[0];

        if (seatTypeObj) seatprice = seatTypeObj.price || 0;
      }

      const rawSeatParam = this.route.snapshot.queryParamMap.get('seat') || this.seat || null;
      let seat_pref: any = null;
      if (rawSeatParam) {
        try { seat_pref = JSON.parse(rawSeatParam); } catch { seat_pref = rawSeatParam; }
      }
      if (pass.seat_pref) seat_pref = pass.seat_pref;

      const seatPrefSurcharge: Record<string, number> = { window: 15, aisle: 12, middle: 8, random: 0 };
      const seat_fee = seat_pref && seatPrefSurcharge[String(seat_pref)] ? seatPrefSurcharge[String(seat_pref)] : 0;

      let price = (seatprice || 0) + seat_fee;
      if (baggageChoice === 'big_cabin') price += flight.price_of_bag || 0;
      if (baggageChoice === 'big_hold') price += flight.price_of_baggage || 0;

      const prefLabels = ['window', 'aisle', 'middle', 'random'];
      const seatLabel = pass.seat_number || (seat_pref && prefLabels.includes(String(seat_pref)) ? String(seat_pref) : null);

      return {
        passenger: pass,
        seat_type: seatTypeObj,
        seat_label: seatLabel,
        bag_label: baggageChoice,
        seat_fee,
        price
      };
    });
    return items;
  }

  calculateTotal() {
    let t = 0;
    if (this.flights) {
      this.flights.forEach((f: any) => {
        const items = this.getPassengersByFlight(f._id);
        const sub = items.reduce((s: number, it: any) => s + (it.price || 0), 0);
        t += sub;
      });
    }
    this.total = t;
  }

  pay() {
    if (!this.flights || !this.flights.length) return;
    this.loading = true;

    // Create a request for EACH flight
    const requests = this.flights.map((flight: any) => {
      const flightItems = this.getPassengersByFlight(flight._id);

      const passengersPayload = flightItems.map((it: any) => {
        // Ensure seat_pref is cleaned (remove quotes if JSON stringified)
        let seatPrefClean = this.seat;
        if (seatPrefClean) {
          try { seatPrefClean = JSON.parse(seatPrefClean); } catch { }
        }

        return {
          nome: it.passenger?.nome || '',
          cognome: it.passenger?.cognome || '',
          baggageChoice: it.bag_label,
          seat_pref: seatPrefClean || undefined,
          seat_number: it.seat_label || undefined,
          seatTypeId: it.seat_type && it.seat_type._id ? String(it.seat_type._id) : (this.seatTypeId || undefined)
        };
      });

      const payload: any = { flightId: flight._id, passengers: JSON.stringify(passengersPayload) };

      return this.ticketService.createTicket(payload);
    });

    forkJoin(requests).subscribe({
      next: (results) => {
        console.log('All tickets created', results);
        this.loading = false;
        this.router.navigate(['/biglietti']);
      },
      error: (err) => {
        console.error('Error creating tickets', err);
        this.loading = false;
        this.error = "Errore durante il pagamento o creazione biglietti. Riprova.";
      }
    });
  }

  goBack(event?: Event) {
    if (event) event.preventDefault();
    this.location.back();
  }
}
