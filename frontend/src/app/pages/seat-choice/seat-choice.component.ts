// Scelta posto volo
// Permette selezione posto e salvataggio preferenza
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-seat-choice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-choice.component.html',
  styleUrls: ['./seat-choice.component.css']
})
export class SeatChoiceComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  flightId = this.route.snapshot.queryParamMap.get('flightId');
  selectedSeat: string | null = null;

  chooseSeat(seat: string) { this.selectedSeat = seat; }

  continue() {
    // passa posto selezionato al pagamento come query param
    const passengers = this.route.snapshot.queryParamMap.get('passengers');
    const seatTypeId = this.route.snapshot.queryParamMap.get('seatTypeId');
    const qp: any = { ticketFlightId: this.flightId, seat: JSON.stringify(this.selectedSeat) };
    if (passengers) qp.passengers = passengers;
    if (seatTypeId) qp.seatTypeId = seatTypeId;
    this.router.navigate(['/payment'], { queryParams: qp });
  }
}
