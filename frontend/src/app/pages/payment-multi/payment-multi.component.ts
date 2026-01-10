// Componente pagamento multiplo
// Gestisce il pagamento per le prenotazioni multi-tratta
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TicketService } from '@app/shared/ticket.service';
import { Location } from '@angular/common';
import { FlightService } from '@app/shared/admin.flight.service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { FlightSummaryComponent } from '@app/shared/flight-summary/flight-summary.component';
import { AuthService } from '@app/shared/auth.service';

@Component({
  selector: 'app-payment-multi',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FlightSummaryComponent],
  templateUrl: './payment-multi.component.html',
  styleUrls: ['./payment-multi.component.css']
})
export class PaymentMultiComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  ticketService = inject(TicketService);
  location = inject(Location);
  flightService = inject(FlightService);
  auth = inject(AuthService);

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
  seatTypeSelections: Record<string, string | null> = {}; // Mappatura flightId -> seatTypeId
  baggageSelections: Record<string, string | null> = {}; // Mappatura flightId -> scelta bagaglio

  ngOnInit() {
    if (this.auth.userRole() == 'airline') {
      this.router.navigate(['/airline-area']);
      return;
    }
    if (this.auth.userRole() == 'admin') {
      this.router.navigate(['/admin']);
      return;
    }
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }


    const ids = this.route.snapshot.queryParamMap.get('flightIds');
    if (!ids) return;
    const flightIds = ids.split(',').map(s => s.trim()).filter(Boolean);

    // Carica passeggeri da localstorage solo per conteggio o dati diretti
    try {
      const p = localStorage.getItem('passengers');
      if (p) {
        const arr = JSON.parse(p);
        // Se prenotazione singolo passeggero (vecchio stile) o solo uno in lista
        if (Array.isArray(arr) && arr.length === 1) this.passengerStub = arr[0];
      }
    } catch { }

    try { const s = localStorage.getItem('seatSelections'); if (s) this.seatSelections = JSON.parse(s); } catch { }
    try { const p = localStorage.getItem('seatTypeSelections'); if (p) { const arr = JSON.parse(p); this.seatTypeSelections = arr; } } catch { }
    try { const p = localStorage.getItem('baggageSelections'); if (p) { const arr = JSON.parse(p); this.baggageSelections = arr; } } catch { }

    // Recupera dettagli per tutti i voli
    const observables = flightIds.map(id => this.flightService.getFlightById(id));

    forkJoin(observables).subscribe({
      next: (responses: any[]) => {
        this.flights = responses.map(r => r.flight || r);

        // Raccoglie tipi di posto se disponibili
        responses.forEach((r, idx) => {
          // L'API potrebbe restituire { flight: ..., seatTypes: ... }
          // Memorizziamo per ID volo
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

  // Trova oggetto tipo posto per un volo specifico coerente con selezione utente
  getSeatTypeForFlight(flightId: string) {

    let seatTypeObj = null;
    let seatTypeId = this.route.snapshot.queryParamMap.get('seatTypeId') || null;
    if (seatTypeId == null) { seatTypeId = this.seatTypeSelections[flightId]; }
    //if (seatTypeId == null) { seatTypeId = pass.seatTypeId; }

    // Risolvi Prezzo Posto (Priorità: ID -> Economy -> Primo Disponibile)
    if (this.seatTypesByFlight[flightId]) {
      const types = this.seatTypesByFlight[flightId];
      // 1. Prova ID esatto
      seatTypeObj = types.find((s: any) => String(s._id) === String(seatTypeId));
      // 2. Prova 'Economy'
      if (!seatTypeObj) seatTypeObj = types.find((s: any) => (s.type === 'Economy' || s.seat_class === 'Economy'));
      // 3. Fallback
      if (!seatTypeObj && types.length > 0) seatTypeObj = types[0];

      //if (seatTypeObj) seatprice = seatTypeObj.price || 0;
    }
    return seatTypeObj;

  }

  getPassengersByFlight(flightId: string) {
    let passengersList: any[] = [];
    try {
      const p = localStorage.getItem('passengers');
      if (p) passengersList = JSON.parse(p);
    } catch { }

    // Fallback se nessuna lista ma abbiamo un singolo passengerStub o param
    if (!passengersList || passengersList.length === 0) {
      if (this.passengerStub) passengersList = [this.passengerStub];
    }

    // Helper per generare passeggeri se parametro count presente (improbabile qui ma sicuro averlo)
    const passengersParam = this.route.snapshot.queryParamMap.get('passengers');
    const pNum = Number(passengersParam) || 0;
    if (pNum > 0 && passengersList.length === 0) {
      for (let i = 0; i < pNum; i++) passengersList.push({ nome: '', cognome: '', baggageChoice: 'hand' });
    }

    const flight = this.flights.find(f => f._id === flightId);
    if (!flight) return [];

    // Risolvi Prezzo Posto
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

      // Tariffa Selezione Posto
      const seatPrefSurcharge: Record<string, number> = { window: 15, aisle: 12, middle: 8, random: 0 };

      let specificSeatPref = this.seatSelections[flightId] || 'random';
      // Fallback a parametro globale se non specifico
      if (!this.seatSelections[flightId] && this.seat) {
        try {
          const parsed = JSON.parse(this.seat);
          specificSeatPref = parsed;
        } catch {
          specificSeatPref = this.seat;
        }
      }

      const seat_fee = seatPrefSurcharge[specificSeatPref] ? seatPrefSurcharge[specificSeatPref] : 0;

      // Calcola prezzo finale: Prezzo Classe + Tariffa Posto + Bagaglio
      let price = typePrice + seat_fee;

      if (baggageChoice === 'Grande') price += flight.price_of_bag || 0;
      if (baggageChoice === 'Stiva') price += flight.price_of_baggage || 0;

      // Etichette
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

    // Simula ritardo pagamento
    setTimeout(() => {
      const calls: any[] = [];
      const seatTypeIdParam = this.route.snapshot.queryParamMap.get('seatTypeId');



      //if (passengers.length > 0) {
      // 
      for (const flight of this.flights) {
        const fid = flight._id;
        const seatPref = this.seatSelections[fid] || 'random';
        let passengers = this.getPassengersByFlight(flight._id)
        for (const passenger of passengers) {
          // Risolvi ID tipo posto corretto per QUESTO volo
          const correctSeatType = this.getSeatTypeForFlight(fid);

          // Costruisci payload compatibile con backend (richiede 'passengers' come stringa JSON)
          let p = this.getPassengersByFlight(flight._id);
          const singlePassengerObj: any = {
            nome: passenger.passenger.nome,
            cognome: passenger.passenger.cognome,
            baggageChoice: passenger.bag_label,
            seat_pref: seatPref,
            seatTypeId: passenger.seat_type._id,
            price: passenger.price
          };


          const payload: any = {
            flightId: fid,
            seatTypeId: singlePassengerObj.seatTypeId, // Tipo posto globale per il volo (fallback)
            passengers: JSON.stringify([singlePassengerObj]),
            totalPrice: passenger.price
          };

          console.log(`Adding call for flight ${fid} with payload:`, payload);
          calls.push(this.ticketService.createTicket(payload));
        }
      }


      console.log(`Submitting ${calls.length} ticket creation requests SEQUENTIALLY...`);

      // Esegui sequenzialmente
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

  goBack(event?: Event) {
    if (event) event.preventDefault();
    this.location.back();
  }

}
