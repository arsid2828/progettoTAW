// Componente pagamento multiplo
// Gestisce il pagamento per le prenotazioni multi-tratta
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TicketService } from '@app/shared/ticket.service';
import { FlightService } from '@app/services/flight.service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-multi',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './payment-multi.component.html',
  styleUrls: ['./payment-multi.component.css']
})
export class PaymentMultiComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  ticketService = inject(TicketService);
  flightService = inject(FlightService);

  loading = false;
  error: string | null = null;

  flights: any[] = [];
  total = 0;

  seat = this.route.snapshot.queryParamMap.get('seat') || null;
  seatTypeId = this.route.snapshot.queryParamMap.get('seatTypeId') || null;
  baggage = this.route.snapshot.queryParamMap.get('baggage') || null;

  seatSelections: Record<string, string> = {};
  seatTypesByFlight: any = {};
  passengerStub: any = null;
  seatTypeSelections: Record<string, string | null> = {}; // flightId -> seatTypeId mapping
  baggageSelections: Record<string, string | null> = {}; // flightId -> baggage choice mapping

  ngOnInit() {
    const ids = this.route.snapshot.queryParamMap.get('flightIds');
    if (!ids) return;
    const flightIds = ids.split(',').map(s => s.trim()).filter(Boolean);

    // load passengers from localstorage just to know count or direct data
    try {
      const p = localStorage.getItem('passengers');
      if (p) {
        const arr = JSON.parse(p);
        // If single passenger booking (old style) or just one in list
        if (Array.isArray(arr) && arr.length === 1) this.passengerStub = arr[0];
      }
    } catch { }

    try { const s = localStorage.getItem('seatSelections'); if (s) this.seatSelections = JSON.parse(s); } catch { }
    try { const p = localStorage.getItem('seatTypeSelections'); if (p) { const arr = JSON.parse(p); this.seatTypeSelections = arr; } } catch { }
    try { const p = localStorage.getItem('baggageSelections'); if (p) { const arr = JSON.parse(p); this.baggageSelections = arr; } } catch { }

    // Fetch details for all flights
    const observables = flightIds.map(id => this.flightService.getFlightById(id));

    forkJoin(observables).subscribe({
      next: (responses: any[]) => {
        this.flights = responses.map(r => r.flight || r);

        // Collect seat types if available
        responses.forEach((r, idx) => {
          // The API might return { flight: ..., seatTypes: ... }
          // We store it by flight ID
          const fid = this.flights[idx]._id;
          if (r.seatTypes) {
            this.seatTypesByFlight[fid] = r.seatTypes;
          }
        });

        this.calculateTotal();
      },
      error: (err) => {
        console.error(err);
        this.error = "Impossibile caricare i dettagli dei voli.";
      }
    });
  }

  // Find the seat type object for a specific flight consistent with the user's selection
  getSeatTypeForFlight(flightId: string) {

    let seatTypeObj = null;
    let seatTypeId = this.route.snapshot.queryParamMap.get('seatTypeId') || null;
    if (seatTypeId == null) { seatTypeId = this.seatTypeSelections[flightId]; }
    //if (seatTypeId == null) { seatTypeId = pass.seatTypeId; }

    // Resolve Seat Price (Priority: ID -> Economy -> First Available)
    if (this.seatTypesByFlight[flightId]) {
      const types = this.seatTypesByFlight[flightId];
      // 1. Try exact ID
      seatTypeObj = types.find((s: any) => String(s._id) === String(seatTypeId));
      // 2. Try 'Economy'
      if (!seatTypeObj) seatTypeObj = types.find((s: any) => (s.type === 'Economy' || s.seat_class === 'Economy'));
      // 3. Fallback
      if (!seatTypeObj && types.length > 0) seatTypeObj = types[0];

      //if (seatTypeObj) seatprice = seatTypeObj.price || 0;
    }
    return seatTypeObj;
    /*   // 1. Identify Target Name from global ID, OR Default to Economy
       let selectedSeatTypeName = 'Economy';
   
       if (this.seatTypeId) {
         for (const fid in this.seatTypesByFlight) {
           const types = this.seatTypesByFlight[fid];
           const match = types.find((t: any) => t._id === this.seatTypeId);
           if (match) {
             selectedSeatTypeName = match.type || match.seat_class || 'Economy';
             break;
           }
         }
       }*
   
       // 2. Find matching type in current flight
       if (this.seatTypesByFlight[flightId]) {
         // Try exact global ID match first
         let match = this.seatTypeId ? this.seatTypesByFlight[flightId].find((t: any) => t._id === this.seatTypeId) : null;
   
         // Try Name match
         if (!match) {
           match = this.seatTypesByFlight[flightId].find((t: any) => (t.type || t.seat_class) === selectedSeatTypeName);
         }
         // Fallback to first available if still nothing
         if (!match && this.seatTypesByFlight[flightId].length > 0) {
           match = this.seatTypesByFlight[flightId][0];
         }
         return match;
       }
       return null;*/
  }

  getPassengersByFlight(flightId: string) {
    let passengersList: any[] = [];
    try {
      const p = localStorage.getItem('passengers');
      if (p) passengersList = JSON.parse(p);
    } catch { }

    // Fallback if no list but we have a single passengerStub or param
    if (!passengersList || passengersList.length === 0) {
      if (this.passengerStub) passengersList = [this.passengerStub];
    }

    // Helper to generate passengers if count param is present (unlikely in this flow but safe to have)
    const passengersParam = this.route.snapshot.queryParamMap.get('passengers');
    const pNum = Number(passengersParam) || 0;
    if (pNum > 0 && passengersList.length === 0) {
      for (let i = 0; i < pNum; i++) passengersList.push({ nome: '', cognome: '', baggageChoice: 'hand' });
    }

    const flight = this.flights.find(f => f._id === flightId);
    if (!flight) return [];

    // Resolve Seat Price
    let typePrice = 0;
    const seatTypeObj = this.getSeatTypeForFlight(flightId);


    if (seatTypeObj) typePrice = seatTypeObj.price || 0;

    return passengersList.map((pass: any, index: number) => {
      let baggageChoice = null;
      if (!baggageChoice) {
        if (this.baggageSelections && this.baggageSelections[flightId]) {
          baggageChoice = this.baggageSelections[flightId]![index] || null;
        }
      }
      if (!baggageChoice) { baggageChoice = 'hand'; }

      // Seat Selection Fee
      const seatPrefSurcharge: Record<string, number> = { window: 15, aisle: 12, middle: 8, random: 0 };

      let specificSeatPref = this.seatSelections[flightId] || 'random';
      // Fallback to global param if not specific
      if (!this.seatSelections[flightId] && this.seat) {
        try {
          const parsed = JSON.parse(this.seat);
          specificSeatPref = parsed;
        } catch {
          specificSeatPref = this.seat;
        }
      }

      const seat_fee = seatPrefSurcharge[specificSeatPref] ? seatPrefSurcharge[specificSeatPref] : 0;

      // Calculate final price: Class Price + Seat Fee + Baggage
      let price = typePrice + seat_fee;

      if (baggageChoice === 'big_cabin') price += flight.price_of_bag || 0;
      if (baggageChoice === 'big_hold') price += flight.price_of_baggage || 0;

      // Labels
      const prefLabels = ['window', 'aisle', 'middle', 'random'];
      const seatLabel = pass.seat_number || (prefLabels.includes(specificSeatPref) ? specificSeatPref : 'Assegnato al check-in');

      return {
        passenger: pass,
        seat_type: seatTypeObj,
        seat_label: seatLabel,
        bag_label: baggageChoice,
        seat_fee,
        price
      };
    });
  }

  calculateTotal() {
    this.total = 0;
    this.flights.forEach(f => {
      const items = this.getPassengersByFlight(f._id);
      const flightTotal = items.reduce((sum, item) => sum + item.price, 0);
      this.total += flightTotal;
    });
  }

  pay() {
    if (this.flights.length === 0) return;
    this.loading = true;

    // Simulate payment delay
    setTimeout(() => {
      const calls: any[] = [];
      const seatTypeIdParam = this.route.snapshot.queryParamMap.get('seatTypeId');

      // Get fresh passengers list logic
      // Note: we're repeating logic a bit, but it ensures we grab latest state
      /*let passengers: any[] = [];
      try { const p = localStorage.getItem('passengers'); if (p) passengers = JSON.parse(p); } catch { }
     
      // If empty but we have stub
      if (passengers.length === 0 && this.passengerStub) passengers = [this.passengerStub];*/

      // If still empty, maybe it's just a seat reservation flow without passengers named? 
      // Fallback to "single items loop" like before

      //if (passengers.length > 0) {
       // 
          for (const flight of this.flights) {
            const fid = flight._id;
            const seatPref = this.seatSelections[fid] || 'random'; 
            let passengers = this.getPassengersByFlight(flight._id)
for (const passenger of passengers) {
            // Resolve correct seat type ID for THIS flight
            const correctSeatType = this.getSeatTypeForFlight(fid);

            // Construct payload compatible with backend (requires 'passengers' as JSON string)
            let p = this.getPassengersByFlight(flight._id);
            const singlePassengerObj: any = {
              nome: passenger.passenger.nome,
              cognome: passenger.passenger.cognome,
              baggageChoice: passenger.bag_label,
              seat_pref: seatPref,
              seatTypeId: passenger.seat_type._id
            };

            // Resolve Seat Type and add to passenger object if needed
            /*if (passenger.seatTypeId) singlePassengerObj.seatTypeId = passenger.seatTypeId;
            else if (correctSeatType) singlePassengerObj.seatTypeId = correctSeatType._id;
            else if (seatTypeIdParam) singlePassengerObj.seatTypeId = seatTypeIdParam;*/

            const payload: any = {
              flightId: fid,
              seatTypeId: singlePassengerObj.seatTypeId, // Global seat type for the flight (fallback)
              passengers: JSON.stringify([singlePassengerObj])
            };

            console.log(`Adding call for flight ${fid} with payload:`, payload);
            calls.push(this.ticketService.createTicket(payload));
          }
        }
      /*} else {
        // No passengers explicit (seat only flow?)
        for (const flight of this.flights) {
          const fid = flight._id;
          const seatPref = this.seatSelections[fid] || 'random';
          const correctSeatType = this.getSeatTypeForFlight(fid);

          // Legacy/Fallback payload if no passenger info
          const payload: any = { flightId: fid };
          if (correctSeatType) payload.seatTypeId = correctSeatType._id;

          // Even here, backend might expect passengers array for logic to run? 
          // If backend requires passengers array to create ticket, we must provide it or update backend.
          // Assuming we need at least one passenger stub
          const stubPassenger = {
            nome: 'Utente', cognome: 'Guest',
            seat_pref: seatPref,
            seatTypeId: correctSeatType ? correctSeatType._id : seatTypeIdParam
          };
          payload.passengers = JSON.stringify([stubPassenger]);

          calls.push(this.ticketService.createTicket(payload));
        }
      }*/

      console.log(`Submitting ${calls.length} ticket creation requests SEQUENTIALLY...`);

      // Execute sequentially
      import('rxjs').then(({ concat, of }) => {
        concat(...calls).subscribe({
          next: (res) => {
            console.log('Singola richiesta creazione completata:', res);
          },
          error: (err) => {
            console.error('Errore creazione sequenziale:', err);
            this.loading = false;
            this.error = 'Errore durante la creazione dei biglietti. Riprova.';
          },
          complete: () => {
            console.log('Tutte le richieste completate.');
            this.loading = false;
            this.router.navigate(['/biglietti']);
          }
        });
      });
    }, 900);
  }
}
