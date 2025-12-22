import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '@app/shared/ticket.service';
import { forkJoin } from 'rxjs';
import { FlightService } from '@app/services/flight.service';

@Component({
  selector: 'app-booking-multi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-multi.component.html',
  styleUrls: ['./booking-multi.component.css']
})
export class BookingMultiComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  ticketService = inject(TicketService);
  flightService = inject(FlightService);

  flightIds: string[] = [];
  flights: any[] = [];
  passengersQty = 1;
  seatTypeId: string | null = null;
  passengerInputs: Array<{ nome: string; cognome: string }> = [];
  loading = false;
  error: string | null = null;

  constructor() {
    const ids = this.route.snapshot.queryParamMap.get('flightIds');
    if (ids) this.flightIds = ids.split(',');
    const p = Number(this.route.snapshot.queryParamMap.get('passengers')) || 1;
    this.passengersQty = p;
    for (let i = 0; i < this.passengersQty; i++) this.passengerInputs.push({ nome: '', cognome: '' });

    // load flight details
    if (this.flightIds.length) {
      const calls = this.flightIds.map(id => this.flightService.getFlightById(id));
      forkJoin(calls).subscribe({ next: (res:any[]) => {
        this.flights = res.map(r => r.flight || r);
      }, error: (err) => { console.error('Error loading flights', err); } });
    }
  }

  confirmMulti() {
    if (!this.flightIds.length) return;
    // save passengers to localStorage for next steps
    try { localStorage.setItem('passengers', JSON.stringify(this.passengerInputs)); } catch {}
      const qp: any = { flightIds: this.flightIds.join(','), passengers: this.passengersQty };
      if (this.seatTypeId) qp.seatTypeId = this.seatTypeId;
      this.router.navigate(['/seat-choice-multi'], { queryParams: qp });
  }
}
