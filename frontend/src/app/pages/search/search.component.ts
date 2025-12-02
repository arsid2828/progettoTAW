import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FlightService } from '@app/shared/flight.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  constructor(private fb: FormBuilder) {}

  form = this.fb.group({
    from: ['', Validators.required],
    to: ['', Validators.required],
    departDate: ['', Validators.required],
    returnDate: [''],
    oneWay: [false],
    passengers: [1, [Validators.required, Validators.min(1)]],
    cabin: ['economy', Validators.required],
  });

  onTripTypeChange() {
    if (this.form.get('oneWay')!.value) this.form.get('returnDate')!.reset();
  }


  flightService = inject(FlightService);
  onSubmit() {
    //  FACCIO UNA RICHIESTA AL BACKEND, LA VEDI SUGLI STRUMENTI DI SVILUPPO (F12) NELLA SEZIONE RETE sul browser
    /*if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    console.log('Ricerca voli:', this.form.value);*/
    this.flightService.getFlights("niente").subscribe({
      next: (response) => {
        console.log('Risposta dal backend:', response);
      },
      error: (error) => {
        console.error('Errore nella richiesta:', error);
      }
    });

    



  }
}
