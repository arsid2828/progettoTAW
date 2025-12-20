
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlightService, Route, Airport, Plane, Flight } from '../../services/flight.service';

// Interfaces (Should preferably be in shared/models)
interface SeatType {
    type: string;
    price: number;
}

@Component({
    selector: 'app-airline-area',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './airline-area.component.html',
    styleUrls: ['./airline-area.component.css']
})
export class AirlineAreaComponent implements OnInit {
    airlineName: string = 'Compagnia A'; // Should come from AuthService
    totalRevenue: number = 0;
    totalSold: number = 0;
    topRoutes: Route[] = [];

    today: string = new Date().toISOString().split('T')[0];

    // Form Data
    newFlight = {
        fromCity: '',
        toCity: '',
        fromAirportId: '',
        toAirportId: '',
        dateDeparture: '',
        dateArrival: '',
        timeDeparture: '',
        timeArrival: '',
        planeId: '',
        priceEconomy: null,
        seatsEconomy: null,
        priceBusiness: null,
        seatsBusiness: null,
        priceFirst: null,
        seatsFirst: null,
        priceBag: null,
        priceBaggage: null
    };

    availableFromAirports: Airport[] = [];
    availableToAirports: Airport[] = [];
    planes: Plane[] = [];
    flights: Flight[] = [];
    statsMap: { [key: string]: { sold: number, revenue: number } } = {};

    constructor(private flightService: FlightService) { }

    ngOnInit(): void {
        this.loadAirlineData();
        this.loadPlanes();
        this.loadFlights();
    }

    loadAirlineData(): void {
        this.flightService.getAirlineStats().subscribe(data => {
            this.totalRevenue = data.revenue;
            this.totalSold = data.sold;
            this.topRoutes = data.topRoutes;
        });
    }

    loadPlanes(): void {
        this.flightService.getPlanes().subscribe(data => {
            this.planes = data;
        });
    }

    loadFlights(): void {
        this.flightService.getFlights().subscribe(data => {
            this.flights = data;
            // Mock stats for loaded flights
            this.flights.forEach(f => {
                this.flights.forEach(f => {
                    this.statsMap[f._id] = { sold: 50, revenue: 2500 }; // Mock values
                });
            });
        });
    }

    loadAirports(): void {
        this.flightService.getAirports().subscribe(data => {
            // Filter if city is typed, otherwise show all OR show all and let select handle it
            // Simple approach: show all available in DB for selection
            if (this.newFlight.fromCity) {
                this.availableFromAirports = data.filter(a => a.city.toLowerCase().includes(this.newFlight.fromCity.toLowerCase()) || a.name.toLowerCase().includes(this.newFlight.fromCity.toLowerCase()));
            } else {
                this.availableFromAirports = data;
            }

            if (this.newFlight.toCity) {
                this.availableToAirports = data.filter(a => a.city.toLowerCase().includes(this.newFlight.toCity.toLowerCase()) || a.name.toLowerCase().includes(this.newFlight.toCity.toLowerCase()));
            } else {
                this.availableToAirports = data;
            }
        });
    }

    onAddFlight(): void {
        console.log('Validating flight form...', this.newFlight);
        // Check if required fields are present (basic check)
        if (!this.newFlight.fromAirportId || !this.newFlight.toAirportId || !this.newFlight.planeId) {
            console.error('Missing required fields');
            alert('Compila tutti i campi obbligatori (Aeroporti, Aereo, Date)');
            return;
        }

        console.log('Adding flight:', this.newFlight);
        this.flightService.addFlight(this.newFlight).subscribe({
            next: (res) => {
                console.log('Flight added!', res);
                // Reset form or show success message
                this.loadFlights();
            },
            error: (err) => {
                console.error('Error adding flight', err);
            }
        });
    }

    getSold(flightId: string): number {
        return this.statsMap[flightId]?.sold || 0;
    }

    getRevenue(flightId: string): number {
        return this.statsMap[flightId]?.revenue || 0;
    }
}
