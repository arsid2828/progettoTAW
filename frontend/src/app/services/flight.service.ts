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
    code: string;
}
export interface Plane {
    id: string;
    model: string;
}
export interface Flight {
    id: string;
    from_airport_rel: { name: string };
    to_airport_rel: { name: string };
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
        // return this.http.get(`${this.apiUrl}/airline/stats`);
        return of({
            revenue: 15000.50,
            sold: 342,
            topRoutes: [
                { from_name: 'Roma', to_name: 'Milano', sold: 120 },
                { from_name: 'Parigi', to_name: 'Londra', sold: 95 }
            ]
        });
    }

    getPlanes(): Observable<Plane[]> {
        // return this.http.get<Plane[]>(`${this.apiUrl}/airline/planes`);
        return of([
            { id: 'P001', model: 'Boeing 737' },
            { id: 'P002', model: 'Airbus A320' }
        ]);
    }

    getFlights(): Observable<Flight[]> {
        // return this.http.get<Flight[]>(`${this.apiUrl}/airline/flights`);
        return of([
            {
                id: 'F001',
                from_airport_rel: { name: 'Fiumicino' },
                to_airport_rel: { name: 'Malpensa' },
                date_departure: '2025-12-25',
                departure: '10:00',
                seat_types: [
                    { type: 'economy', price: 50 },
                    { type: 'business', price: 150 }
                ]
            }
        ]);
    }

    getAirports(city: string): Observable<Airport[]> {
        // return this.http.get<Airport[]>(`${this.apiUrl}/airports?city=${city}`);
        if (city.toLowerCase().includes('roma')) {
            return of([
                { id: 'A001', name: 'Fiumicino', code: 'FCO' },
                { id: 'A002', name: 'Ciampino', code: 'CIA' }
            ]);
        } else if (city.toLowerCase().includes('milano')) {
            return of([
                { id: 'A003', name: 'Malpensa', code: 'MXP' },
                { id: 'A004', name: 'Linate', code: 'LIN' }
            ]);
        } else {
            return of([]);
        }
    }

    addFlight(flightData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/flights`, flightData);
    }

    addPlane(plane: any): Observable<any> {
        // return this.http.post(`${this.apiUrl}/airline/planes`, plane);
        return of(plane);
    }

    addAirport(airport: any): Observable<any> {
        // return this.http.post(`${this.apiUrl}/airports`, airport);
        return of(airport);
    }
}

