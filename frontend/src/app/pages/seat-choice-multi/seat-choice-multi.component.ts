import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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
  selections: Record<string,string> = {};

  constructor(){
    const ids = this.route.snapshot.queryParamMap.get('flightIds');
    if(ids) this.flightIds = ids.split(',');
  }

  choose(flightId: string, seat: string){ this.selections[flightId] = seat; }

  continue(){
    // save selections and forward passengers param if present
      try { localStorage.setItem('seatSelections', JSON.stringify(this.selections)); } catch {}
      const flightIds = this.flightIds.join(',');
      const passengers = this.route.snapshot.queryParamMap.get('passengers') || '1';
      const seatTypeId = this.route.snapshot.queryParamMap.get('seatTypeId');
      const qp: any = { flightIds, passengers };
      if (seatTypeId) qp.seatTypeId = seatTypeId;
      this.router.navigate(['/payment-multi'], { queryParams: qp });
  }
}
