import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FlightService } from '@app/shared/flight.service';
import { AuthService } from '@app/shared/auth.service';
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
  authService = inject(AuthService);

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
      passengers: this.form.value.passengers,
      directOnly: this.form.value.oneWay // The switch is bound to 'oneWay' form control
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
    let targetPath = '/booking';
    let queryParams: any = {};

    // Determine target and params
    if (result?.legs && result.legs.length > 1) {
      targetPath = '/booking-multi';
      const ids = result.legs.map((l: any) => l._id).join(',');
      queryParams = { flightIds: ids, passengers };
    } else {
      const legId = result?.legs && result.legs[0]?._id;
      queryParams = { flightId: legId, passengers };
    }

    if (!this.authService.isLoggedIn()) {
      // Create the return URL tree
      const urlTree = this.router.createUrlTree([targetPath], { queryParams });
      // Serialize it to a string
      const returnUrl = this.router.serializeUrl(urlTree);

      this.router.navigate(['/login'], { queryParams: { returnUrl } });
      return;
    }

    // Normal navigation
    this.router.navigate([targetPath], { queryParams });
  }



  // Helper to get airline name safely
  getAirlineName(leg: any): string {
    return leg.airline ? (leg.airline.name || 'SkyJourney') : 'Airline';
  }
}
