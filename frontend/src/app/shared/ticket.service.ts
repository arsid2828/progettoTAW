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
}
