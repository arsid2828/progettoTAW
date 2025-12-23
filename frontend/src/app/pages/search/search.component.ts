// Componente per la ricerca voli
// Gestisce il form di ricerca e visualizzazione risultati
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

    // Mappa valori form ai parametri di query backend
    const queryParams = {
      from: this.form.value.from,
      to: this.form.value.to,
      date: this.form.value.departDate,
      sort: this.form.value.sort,
      passengers: this.form.value.passengers,
      directOnly: this.form.value.oneWay // Switch legato al controllo 'oneWay'
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

    // Determina target e parametri
    if (result?.legs && result.legs.length > 1) {
      targetPath = '/booking-multi';
      const ids = result.legs.map((l: any) => l._id).join(',');
      queryParams = { flightIds: ids, passengers };
    } else {
      const legId = result?.legs && result.legs[0]?._id;
      queryParams = { flightId: legId, passengers };
    }

    if (!this.authService.isLoggedIn()) {
      // Crea l'albero URL di ritorno
      const urlTree = this.router.createUrlTree([targetPath], { queryParams });
      // Serializzalo a stringa
      const returnUrl = this.router.serializeUrl(urlTree);

      this.router.navigate(['/login'], { queryParams: { returnUrl } });
      return;
    }

    // Navigazione normale
    this.router.navigate([targetPath], { queryParams });
  }



  // Helper per ottenere nome compagnia in sicurezza
  getAirlineName(leg: any): string {
    return leg.airline ? (leg.airline.name || 'SkyJourney') : 'Airline';
  }
}
