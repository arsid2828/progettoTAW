import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FlightService } from '@app/shared/flight.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  constructor(private fb: FormBuilder) { }

  form = this.fb.group({
    from: ['', Validators.required],
    to: [''],
    departDate: [new Date().toISOString().split('T')[0], Validators.required],
    returnDate: [''],
    oneWay: [false],
    passengers: [1, [Validators.required, Validators.min(1)]],
    sort: ['price'],
  });

  results: any[] = [];
  searched = false;

  onTripTypeChange() {
    if (this.form.get('oneWay')!.value) this.form.get('returnDate')!.reset();
  }


  flightService = inject(FlightService);
  router = inject(Router);
  onSubmit() {
    this.searched = true;
    this.results = []; // Clear previous results

    console.log('Ricerca voli:', this.form.value);

    // Map form values to query params expected by backend
    const queryParams = {
      from: this.form.value.from,
      to: this.form.value.to,
      date: this.form.value.departDate,
      sort: this.form.value.sort,
      passengers: this.form.value.passengers
    };

    this.flightService.getFlights(queryParams).subscribe({
      next: (response: any) => {
        console.log('Risposta dal backend:', response);
        this.results = response;
      },
      error: (error) => {
        console.error('Errore nella richiesta:', error);
      }
    });
  }

  bookTicket(result: any) {
    const passengers = Number(this.form.get('passengers')!.value) || 1;
    // If result contains multiple legs (connection), go to multi-seat-choice
    if (result?.legs && result.legs.length > 1) {
      const ids = result.legs.map((l: any) => l._id).join(',');
      this.router.navigate(['/seat-choice-multi'], { queryParams: { flightIds: ids, passengers } });
      return;
    }

    // Single leg: if multiple passengers, go to booking page (to select passengers & classes)
    const legId = result?.legs && result.legs[0]?._id;
    if (passengers > 1) {
      this.router.navigate(['/booking'], { queryParams: { flightId: legId, passengers } });
      return;
    }

    // Single passenger single leg: choose seat then payment
    this.router.navigate(['/seat-choice'], { queryParams: { flightId: legId } });
  }



  // Helper to get airline name safely
  getAirlineName(leg: any): string {
    return leg.airline ? (leg.airline.name || 'SkyJourney') : 'Airline';
  }
}
