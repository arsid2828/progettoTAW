// Componente per la prenotazione biglietti
// Gestisce la raccolta dati passeggeri e selezione posto
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '@app/shared/ticket.service';
import { FlightService } from '@app/services/flight.service';
import { AuthService } from '@app/shared/auth.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  ticketService = inject(TicketService);
  auth = inject(AuthService);
  flightId: string | null = null;
  selectedSeat: string | null = null;
  seatTypeId: string | null = null;
  flight: any = null;
  seatTypes: any[] = [];
  passengers: any[] = [];
  passengerInputs: Array<{ nome: string; cognome: string; baggageChoice: string; }> = [
    { nome: this.auth.name() || '', cognome: this.auth.surname() || '', baggageChoice: 'hand' }
  ];

  stringify = JSON.stringify;

  constructor() {
    this.flightId = this.route.snapshot.queryParamMap.get('flightId');
    this.selectedSeat = this.route.snapshot.queryParamMap.get('seat');
    // prova a caricare i dettagli del volo
    if (this.flightId) {
      const fs = inject(FlightService);
      fs.getFlightById(this.flightId).subscribe({
        next: (res) => {
          this.flight = res.flight;
          this.seatTypes = res.seatTypes || [];
        }, error: () => { }
      });
    }
    // carica passeggeri da localStorage
    try { const s = localStorage.getItem('passengers'); if (s) this.passengerInputs = JSON.parse(s); } catch { }
    // se parametro passeggeri presente, adatta array
    const p = Number(this.route.snapshot.queryParamMap.get('passengers')) || 0;

    if (p > 0) {
      if (this.passengerInputs.length > p) {
        this.passengerInputs = this.passengerInputs.slice(0, p);
      } else {
        for (let i = this.passengerInputs.length; i < p; i++) {
          this.passengerInputs.push({ nome: '', cognome: '', baggageChoice: 'hand' });
        }
      }
    }
  }

  confirmBooking() {
    if (!this.flightId) return;
    // salva dati passeggeri se presenti
    try { if (this.passengerInputs.length) localStorage.setItem('passengers', JSON.stringify(this.passengerInputs)); } catch { }
    // procedi alla scelta posto
    const navExtras: any = { queryParams: { flightId: this.flightId } };
    if (this.passengerInputs.length > 0) {
      navExtras.queryParams.passengers = this.passengerInputs.length;
    }
    if (this.seatTypeId) {
      navExtras.queryParams.seatTypeId = this.seatTypeId;
    }
    this.router.navigate(['/seat-choice'], navExtras);
  }
}
