import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TicketService } from '@app/shared/ticket.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-payment-multi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-multi.component.html',
  styleUrls: ['./payment-multi.component.css']
})
export class PaymentMultiComponent {
  router = inject(Router);
  route = inject(ActivatedRoute);
  ticketService = inject(TicketService);
  loading = false;
  error: string | null = null;

  pay() {
    const ids = this.route.snapshot.queryParamMap.get('flightIds');
    if (!ids) return;
    const flightIds = ids.split(',').map(s => s.trim()).filter(Boolean);
    if (!flightIds.length) return;
    this.loading = true;
    // gather passengers and seat selections from localStorage
    let passengers: any[] = [];
    let seatSelections: Record<string,string> = {};
    try { const p = localStorage.getItem('passengers'); if (p) passengers = JSON.parse(p); } catch {}
    try { const s = localStorage.getItem('seatSelections'); if (s) seatSelections = JSON.parse(s); } catch {}

    // simulate payment then create all tickets (one per passenger per flight)
    setTimeout(() => {
      const calls: any[] = [];
      if (passengers.length) {
        for (const passenger of passengers) {
          for (const fid of flightIds) {
            const payload: any = { flightId: fid, seat_pref: seatSelections[fid] || 'random', p_nome: passenger.nome, p_cognome: passenger.cognome };
            calls.push(this.ticketService.createTicket(payload));
          }
        }
      } else {
        // single ticket per flight
        for (const fid of flightIds) {
          const payload: any = { flightId: fid, seat_pref: seatSelections[fid] || 'random' };
          calls.push(this.ticketService.createTicket(payload));
        }
      }

      forkJoin(calls).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/biglietti']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Errore durante la prenotazione multipla';
        }
      });
    }, 900);
  }
}
