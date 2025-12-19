import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class FlightService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/';
  constructor() { }

  getFlights(data: any) {
    return this.http.get(this.apiUrl + "flights", { params: data });
  }

  bookTicket(data: any) {
    return this.http.post(this.apiUrl + "tickets", data);
  }
}
