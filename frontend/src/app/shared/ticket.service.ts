import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  
    private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/';


  getTickets() {
     return this.http.get(this.apiUrl + "tickets");
  }

    createTicket(payload: any) {
      // payload should include flightId and optional extras: seat_pref, baggageChoice, seatTypeId, p_nome, p_cognome, seat_number
      return this.http.post(this.apiUrl + 'tickets', payload);
    }

    createMultipleTickets(flightIds: string[]) {
      // Call createTicket for each id and return forkJoin later where used
      const calls = flightIds.map(id => this.createTicket(id));
      return calls.length ? this.http.post(this.apiUrl + 'tickets/multi', { flightIds }) : this.http.post(this.apiUrl + 'tickets/multi', { flightIds });
    }
}
