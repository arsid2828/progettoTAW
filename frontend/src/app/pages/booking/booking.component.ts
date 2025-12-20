import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '@app/shared/ticket.service';
import { FlightService } from '@app/services/flight.service';

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

  flightId: string | null = null;
  selectedSeat: string | null = null;
  flight: any = null;
  seatTypes: any[] = [];
  passengers: any[] = [];
  passengerInputs: Array<{ nome: string; cognome: string }> = [];

  constructor() {
    this.flightId = this.route.snapshot.queryParamMap.get('flightId');
    this.selectedSeat = this.route.snapshot.queryParamMap.get('seat');
    // try to load flight details
    if (this.flightId) {
      const fs = inject(FlightService);
      fs.getFlightById(this.flightId).subscribe({ next: (res) => {
        this.flight = res.flight;
        this.seatTypes = res.seatTypes || [];
      }, error: () => {} });
    }
    // load passengers from localStorage if any
    try { const s = localStorage.getItem('passengers'); if (s) this.passengers = JSON.parse(s); } catch {}
    // if passengers param present and no saved passengers, create inputs
    const p = Number(this.route.snapshot.queryParamMap.get('passengers')) || 0;
    if (p > 0 && this.passengers.length === 0) {
      for (let i = 0; i < p; i++) this.passengerInputs.push({ nome: '', cognome: '' });
    }
  }

  confirmBooking() {
    if (!this.flightId) return;
    // save passenger inputs if present
    try { if (this.passengerInputs.length) localStorage.setItem('passengers', JSON.stringify(this.passengerInputs)); } catch {}
    // Navigate to payment page; ticket will be created after successful payment
    this.router.navigate(['/payment'], { queryParams: { ticketFlightId: this.flightId, seat: this.selectedSeat } });
  }
}
