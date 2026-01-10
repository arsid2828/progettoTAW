// Scelta posto voli multipli
// Permette selezione posto per ogni tratta del viaggio
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FlightService } from '@app/shared/admin.flight.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-seat-choice-multi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-choice-multi.component.html',
  styleUrls: ['./seat-choice-multi.component.css']
})
export class SeatChoiceMultiComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  flightIds: string[] = [];
  selections: Record<string, string> = {};
  location = inject(Location);
  flightService = inject(FlightService);
  flights: any[] = [];
  constructor() {
    const ids = this.route.snapshot.queryParamMap.get('flightIds');
    if (ids) this.flightIds = ids.split(',');

    const observables = this.flightIds.map(id => this.flightService.getFlightById(id));

    forkJoin(observables).subscribe({
      next: (responses: any[]) => {
        this.flights = responses.map(r => r.flight || r);

      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  choose(flightId: string, seat: string) { this.selections[flightId] = seat; }

  continue() {
    // Salva selezioni e inoltra parametro passeggeri se presente
    try { localStorage.setItem('seatSelections', JSON.stringify(this.selections)); } catch { }
    const flightIds = this.flightIds.join(',');
    const passengers = this.route.snapshot.queryParamMap.get('passengers') || '1';
    const seatTypeId = this.route.snapshot.queryParamMap.get('seatTypeId');
    const qp: any = { flightIds, passengers };
    if (seatTypeId) qp.seatTypeId = seatTypeId;
    this.router.navigate(['/payment-multi'], { queryParams: qp });
  }

  goBack(event?: Event) {
    if (event) event.preventDefault();
    this.location.back();
  }
}
