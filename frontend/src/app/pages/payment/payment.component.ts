// Componente pagamento
// Gestisce il riepilogo e la simulazione di pagamento
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TicketService } from '@app/shared/ticket.service';
import { FlightService } from '@app/services/flight.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  ticketId = this.route.snapshot.queryParamMap.get('ticketId') || this.route.snapshot.queryParamMap.get('flightIds');
  ticketService = inject(TicketService);
  flightService = inject(FlightService);
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
  constructor() {
    try { const p = localStorage.getItem('passengers'); if (p) { const arr = JSON.parse(p); if (Array.isArray(arr) && arr.length === 1) this.passenger = arr[0]; } } catch { }
    // load flight details and prepare items
    if (this.ticketId) {
      this.flightService.getFlightById(this.ticketId).subscribe({
        next: (res: any) => {
          this.flights = res.flight ? [res.flight] : res.flights || [];

          if (res.seatTypes) {
            this.seatTypesByFlight[String(this.ticketId)] = res.seatTypes;
          } else if (res.seatTypesByFlight) {
            this.seatTypesByFlight = res.seatTypesByFlight;
          }
          //const seatTypes = res.seatTypes? {this.ticketId: res.seatTypes} || this.flights[0]?.seat_types || [];
          // determine passengers list
          let passengersList: any[] = [];
          try {
            const p = localStorage.getItem('passengers');
            if (p) passengersList = JSON.parse(p);
          } catch { }
          if (!passengersList || passengersList.length === 0) {
            if (this.passenger) passengersList = [this.passenger];
          }



          // Se query param 'passengers' fornito come numero, crea placeholder

          const passengersParam = this.route.snapshot.queryParamMap.get('passengers');
          const pNum = Number(passengersParam) || 0;
          if (pNum > 0 && passengersList.length === 0) {
            for (let i = 0; i < pNum; i++) passengersList.push({ nome: '', cognome: '', baggageChoice: 'hand' });
          }



          // parse query param 'seat': potrebbe essere JSON stringified

          const rawSeatParam = this.route.snapshot.queryParamMap.get('seat') || this.seat || null;
          let seat_pref: any = null;
          if (rawSeatParam) {
            try { seat_pref = JSON.parse(rawSeatParam); } catch { seat_pref = rawSeatParam; }
          }
          const seatTypeId = this.route.snapshot.queryParamMap.get('seatTypeId') || null;

          const seatPrefSurcharge: Record<string, number> = { window: 15, aisle: 12, middle: 8, random: 0 };

          this.items = passengersList.map((pass: any) => {
            const baggageChoice = pass.baggageChoice || this.baggage || 'hand';
            let seatType = null;
            /*if (seatTypeId) seatType = seatTypes.find((s: any) => String(s._id) === String(seatTypeId));
            if (!seatType) seatType = seatTypes[0] || { type: 'ECONOMY', price: 0 };
            const seat_fee = seat_pref && seatPrefSurcharge[String(seat_pref)] ? seatPrefSurcharge[String(seat_pref)] : 0;
            let price = (seatType.price || 0) + seat_fee;
            if (baggageChoice === 'big_cabin') price += this.flight?.price_of_bag || 0;
            if (baggageChoice === 'big_hold') price += this.flight?.price_of_baggage || 0;*/

            // determina etichetta posto: preferisci seat_number esplicito, altrimenti preferenza (es. 'window')
            const prefLabels = ['window', 'aisle', 'middle', 'random'];
            const seatLabel = pass.seat_number || (seat_pref && prefLabels.includes(String(seat_pref)) ? String(seat_pref) : null);
            return {
              passenger: pass/*,
              seat_type: seatType,
              seat_label: seatLabel,
              bag_label: baggageChoice,
              seat_fee,
              price*/
            };
          });

          this.total = this.items.reduce((s: number, it: any) => s + (it.price || 0), 0);



          // persisti passeggeri includendo classe scelta (seatTypeId)
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
        }, error: () => { }
      });
    }
  }
  getPassengersByFlight(flightId: string) {
    let passengersList: any[] = [];
    try {
      const p = localStorage.getItem('passengers');
      if (p) passengersList = JSON.parse(p);
    } catch { }
    if (!passengersList || passengersList.length === 0) {
      if (this.passenger) passengersList = [this.passenger];
    }
    let flight=this.flights[flightId];
    let items = passengersList.map((pass: any, index: number) => {
      const baggageChoice = pass.baggageChoice || this.baggage || 'hand';
      let seatType = null;
      const seatTypeId = this.route.snapshot.queryParamMap.get('seatTypeId') || null;
      let seatprice=0;
      if (seatTypeId !== null) {
        let seatTypes = this.seatTypesByFlight[flightId];//  seatTypes.find((s: any) => String(s._id) === String(seatTypeId));
        seatprice=seatTypes.find((s: any) => String(s._id) === String(flight.seatTypeId)).price;
      }


      const rawSeatParam = this.route.snapshot.queryParamMap.get('seat') || this.seat || null;
      let seat_pref: any = null;
      if (rawSeatParam) {
        try { seat_pref = JSON.parse(rawSeatParam); } catch { seat_pref = rawSeatParam; }
      }
      const seatPrefSurcharge: Record<string, number> = { window: 15, aisle: 12, middle: 8, random: 0 };
      const seat_fee = seat_pref && seatPrefSurcharge[String(seat_pref)] ? seatPrefSurcharge[String(seat_pref)] : 0;
      let price = (seatprice || 0) + seat_fee;
      if (baggageChoice === 'big_cabin') price += this.flights[flightId]?.price_of_bag || 0;
      if (baggageChoice === 'big_hold') price += this.flights[flightId]?.price_of_baggage || 0;

      // determina etichetta posto: preferisci seat_number esplicito, altrimenti preferenza (es. 'window')
      const prefLabels = ['window', 'aisle', 'middle', 'random'];
      const seatLabel = pass.seat_number || (seat_pref && prefLabels.includes(String(seat_pref)) ? String(seat_pref) : null);
      return {
        passenger: pass,
              seat_type: seatType,
              seat_label: seatLabel,
              bag_label: baggageChoice,
              seat_fee,
              price/**/
      };
    });
    return items;
  }
  pay() {
    if (!this.ticketId) return;
    this.loading = true;
    // simula delay pagamento poi crea biglietto
    setTimeout(() => {
      // costruisci payload passeggeri da items
      const passengersPayload = this.items.map(it => ({
        nome: it.passenger?.nome || '',
        cognome: it.passenger?.cognome || '',
        baggageChoice: it.bag_label,
        seat_pref: this.seat || undefined,
        seat_number: it.seat_label || undefined,
        seatTypeId: it.seat_type && it.seat_type._id ? String(it.seat_type._id) : (this.seatTypeId || undefined)
      }));

      const payload: any = { flightId: this.ticketId, passengers: JSON.stringify(passengersPayload) };
      const seat_pref = this.route.snapshot.queryParamMap.get('seat');
      if (seat_pref) payload.seat_pref = seat_pref;
      const seatTypeIdParam = this.route.snapshot.queryParamMap.get('seatTypeId');
      if (seatTypeIdParam) payload.seatTypeId = seatTypeIdParam;

      this.ticketService.createTicket(payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/biglietti']);
        }, error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Errore durante la creazione del biglietto';
        }
      });
    }, 900);
  }
}
