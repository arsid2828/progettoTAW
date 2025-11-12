import { Component, signal } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/header/header.component';
import { SearchService } from './search.service';
import { SearchQuery, SearchResult } from '../../shared/models/search';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, NgIf, NgFor],
  templateUrl: './search.component.html'
})
export class SearchComponent {
  // form model
  from_airport = '';
  to_airport = '';
  date = '';
  passengers = 1;

  // stato
  loading = signal(false);
  messages = signal<string[] | null>(null);
  result = signal<SearchResult | null>(null);

  constructor(private api: SearchService) {}

  search() {
    const q: SearchQuery = {
      from_airport: this.from_airport.trim(),
      to_airport: this.to_airport.trim() || undefined,
      date: this.date || undefined,
      passengers: this.passengers || 1,
      one_way: true
    };
    if (!q.from_airport) { this.messages.set(['Inserisci l’aeroporto di partenza']); return; }

    this.loading.set(true);
    this.api.search(q).subscribe({
      next: (res) => {
        this.result.set(res);
        this.messages.set(res.messages ?? null);
        this.loading.set(false);
      },
      error: (err) => {
        this.messages.set([`Errore ricerca: ${err?.error?.message || err.message || 'sconosciuto'}`]);
        this.loading.set(false);
      }
    });
  }

  isConnection(item: any) { return Array.isArray(item); }

  // Somma posti disponibili per un singolo flight (filtra seat_types per flight_id)
  getSeatCountForFlight(flightId: number): number {
    const r = this.result();
    if (!r || !r.seat_types) return 0;
    return r.seat_types
      .filter((s: any) => s.flight_id === flightId)
      .reduce((acc: number, s: any) => acc + (s.number_available ?? 0), 0);
  }

  // Calcola posti rimanenti per un tuple (diretto -> usa flight.id, scalo -> min tra le due tratte)
  remainingForTuple(tuple: any): number {
    const r = this.result();
    if (!r) return 0;
    if (Array.isArray(tuple) && tuple.length === 2) {
      const a1 = this.getSeatCountForFlight(tuple[0].id);
      const a2 = this.getSeatCountForFlight(tuple[1].id);
      return Math.min(a1, a2);
    } else {
      return this.getSeatCountForFlight(tuple.id);
    }
  }

  // Stub prenotazione (modificare per integrare routing/backend)
  startBooking(flightId: number, qty: number) {
    console.log('startBooking', { flightId, qty });
    // es.: this.router.navigate(['/booking'], { queryParams: { flight_id: flightId, qty }});
  }

  startBookingMulti(f1: number, f2: number, qty: number) {
    console.log('startBookingMulti', { f1, f2, qty });
    // es.: POST al backend o navigate
  }
}