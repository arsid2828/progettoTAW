import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

// Define interfaces if not already defined in a model file
export interface Route {
    from_name: string;
    to_name: string;
    sold: number;
}
export interface Airport {
    id: string;
    name: string;
    city: string;
    code: string;
}
export interface Plane {
    _id: string; // MongoDB ID
    brand: string;
    model: string;
    registration: string;
}
export interface Flight {
    _id: string;
    from_airport: { name: string, city: string, code: string };
    to_airport: { name: string, city: string, code: string };
    date_departure: string;
    departure: string;
    seat_types: any[];
}

@Injectable({
    providedIn: 'root'
})
export class FlightService {

    private apiUrl = 'http://localhost:3000/api'; // Adjust base URL as needed

    constructor(private http: HttpClient) { }

    getAirlineStats(): Observable<any> {
        // For now, keep mock or implement backend route later if needed.
        // User focused on ADDING flights, so stats are secondary.
        return of({
            revenue: 0,
            sold: 0,
            topRoutes: []
        });
    }

    getPlanes(): Observable<Plane[]> {
        return this.http.get<Plane[]>(`${this.apiUrl}/planes`);
    }

    getFlights(): Observable<Flight[]> {
        return this.http.get<Flight[]>(`${this.apiUrl}/flights/my-flights`);
    }

    getAirports(city?: string): Observable<Airport[]> {
        return this.http.get<Airport[]>(`${this.apiUrl}/airports`);
    }

    addFlight(flightData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/flights`, flightData);
    }

    addPlane(plane: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/planes`, plane);
    }

    getFlightById(id: string) {
        return this.http.get<any>(`${this.apiUrl}/flights/${id}`);
    }

    addAirport(airport: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/airports`, airport);
    }
}

