import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TicketService } from '@app/shared/ticket.service';
import { forkJoin } from 'rxjs';
import { FlightService } from '@app/services/flight.service';
import { FlightSummaryComponent } from '@app/shared/flight-summary/flight-summary.component';

@Component({
  selector: 'app-booking-multi',
  standalone: true,
  imports: [CommonModule, FormsModule, FlightSummaryComponent],
  templateUrl: './booking-multi.component.html',
  styleUrls: ['./booking-multi.component.css']
})
export class BookingMultiComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  ticketService = inject(TicketService);
  flightService = inject(FlightService);
  location = inject(Location);

  flightIds: string[] = [];
  flights: any[] = [];
  passengersQty = 1;
  seatTypeId: string | null = null;
  passengerInputs: Array<{ nome: string; cognome: string }> = [];
  loading = false;
  error: string | null = null;

  stringify = JSON.stringify;

  constructor() {
    const ids = this.route.snapshot.queryParamMap.get('flightIds');
    if (ids) this.flightIds = ids.split(',');
    const p = Number(this.route.snapshot.queryParamMap.get('passengers')) || 1;
    this.passengersQty = p;
    for (let i = 0; i < this.passengersQty; i++) this.passengerInputs.push({ nome: '', cognome: '' });

    // load flight details
    if (this.flightIds.length) {
      const calls = this.flightIds.map(id => this.flightService.getFlightById(id));
      forkJoin(calls).subscribe({
        next: (res: any[]) => {
          this.flights = res.map(r => r.flight || r);
          this.flights = this.flights.map(f => ({ ...f, bagage_choices: [] }));
          this.flights.forEach((flight, idx) => {
            const id = (flight && (flight._id || flight.id)) as string | undefined;
            if (!id) return;
            this.flightService.getFlightById(id).subscribe({
              next: (resp: any) => {
                // integra i dettagli ricevuti nel singolo elemento di this.flights
                this.flights[idx] = {
                  ...this.flights[idx],
                  seatTypes: resp.seatTypes || this.flights[idx].seatTypes || []
                };
              },
              error: (err) => { console.error('Error loading flight details', err); }
            });
          });
        }, error: (err) => { console.error('Error loading flights', err); }
      });
    }
  }

  confirmMulti() {
    if (!this.flightIds.length) return;
    // save passengers to localStorage for next steps
    try { localStorage.setItem('passengers', JSON.stringify(this.passengerInputs)); } catch { }
    const qp: any = { flightIds: this.flightIds.join(','), passengers: this.passengersQty };

    let seatTypeSelections: any = {};
    this.flights.forEach((flight, idx) => {
      seatTypeSelections[flight._id || flight.id] = flight.seatTypeId || null;
    });
    try { localStorage.setItem('seatTypeSelections', JSON.stringify(seatTypeSelections)); } catch { }


    let baggageSelections: any = {};
    this.flights.forEach((flight, idx) => {
      baggageSelections[flight._id || flight.id] = flight.bagage_choices || null;
    });
    try { localStorage.setItem('baggageSelections', JSON.stringify(baggageSelections)); } catch { }

    if (this.passengerInputs.length > 1) {
      // console.log(JSON.stringify(seatTypeSelections));
      this.router.navigate(['/payment'], { queryParams: qp });
    } else {
      this.router.navigate(['/seat-choice-multi'], { queryParams: qp });
    }
  }

  goBack(event?: Event) {
    if (event) event.preventDefault();
    this.location.back();
  }
}
