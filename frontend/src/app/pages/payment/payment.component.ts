import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TicketService } from '@app/shared/ticket.service';

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
  ticketId = this.route.snapshot.queryParamMap.get('ticketId') || this.route.snapshot.queryParamMap.get('ticketFlightId');
  ticketService = inject(TicketService);
  loading = false;
  error: string | null = null;
  seat = this.route.snapshot.queryParamMap.get('seat') || null;
  seatTypeId = this.route.snapshot.queryParamMap.get('seatTypeId') || null;
  baggage = this.route.snapshot.queryParamMap.get('baggage') || null;

  // load passenger override if stored in localStorage (single-passenger booking)
  passenger: any = null;
  constructor() {
    try { const p = localStorage.getItem('passengers'); if (p) { const arr = JSON.parse(p); if (Array.isArray(arr) && arr.length === 1) this.passenger = arr[0]; } } catch {}
  }

  pay() {
    if (!this.ticketId) return;
    this.loading = true;
    // simulate payment delay then create the ticket
    setTimeout(() => {
      const payload: any = { flightId: this.ticketId };
      if (this.seat) payload.seat_pref = this.seat;
      if (this.seatTypeId) payload.seatTypeId = this.seatTypeId;
      if (this.baggage) payload.baggageChoice = this.baggage;
      if (this.passenger) { payload.p_nome = this.passenger.nome; payload.p_cognome = this.passenger.cognome; }

      this.ticketService.createTicket(payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/biglietti']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Errore durante la creazione del biglietto';
        }
      });
    }, 900);
  }
}
