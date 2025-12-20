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
    // pass selected seat to booking as query param (optional)
    const passengers = this.route.snapshot.queryParamMap.get('passengers');
    const qp: any = { flightId: this.flightId, seat: this.selectedSeat };
    if (passengers) qp.passengers = passengers;
    this.router.navigate(['/booking'], { queryParams: qp });
  }
}
