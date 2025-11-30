import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
///***** tutto nuovo
@Injectable({
  providedIn: 'root'
})
export class FlightService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/';
  constructor() { }

    getFlights(data:any) { //<TODO> togliere any e mettere uninterfaccia
      // this._isLoggedIn.set(true);
      //this._userName.set(name);
      //localStorage.setItem('sj_user', JSON.stringify({ name }));
  
      return this.http.get(this.apiUrl + "flights/search", data);
    }
}
