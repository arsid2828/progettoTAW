// Area riservata compagnia aerea
// Dashboard per visualizzare statistiche, aerei e gestire voli
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FlightService, Route, Airport, Plane, Flight } from '../../shared/admin.flight.service';
import { Location } from '@angular/common';
import { AuthService } from '../../shared/auth.service';
import { inject } from '@angular/core';

// Interfacce
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
    auth = inject(AuthService);
    get airlineName() { return this.auth.name() || this.auth.userName() || 'Compagnia'; }
    location = inject(Location);
    router = inject(Router);
    totalRevenue: number = 0;
    totalSold: number = 0;
    topRoutes: Route[] = [];

    today: string = new Date().toISOString().split('T')[0];

    // Dati del Form
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

        if (this.auth.userRole() == 'user') {
            this.router.navigate(['/search']);
            return;
        }
        if (this.auth.userRole() == 'admin') {
            this.router.navigate(['/admin']);
            return;
        }
        if (this.auth.mustChangePassword()) {
            this.router.navigate(['/change-password']);
            return;
        }
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
        });
    }

    loadAirports(): void {
        this.flightService.getAirports().subscribe(data => {
            // Filtra se è stata digitata una città, altrimenti mostra tutto
            // Approccio semplice: mostra tutti quelli disponibili nel DB per la selezione
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
        // Controlla se i campi obbligatori sono presenti (check basilare)
        if (!this.newFlight.fromAirportId || !this.newFlight.toAirportId || !this.newFlight.planeId) {
            console.error('Missing required fields');
            alert('Compila tutti i campi obbligatori (Aeroporti, Aereo, Date)');
            return;
        }

        console.log('Adding flight:', this.newFlight);

        // Pre-calcolo delle date in formato ISO UTC corrette
        // Costruiamo la data combinando i campi stringa e l'ora locale del browser
        const depDate = new Date(`${this.newFlight.dateDeparture}T${this.newFlight.timeDeparture}`);
        const arrDate = new Date(`${this.newFlight.dateArrival}T${this.newFlight.timeArrival}`);

        // Creiamo un payload esteso
        const payload = {
            ...this.newFlight,
            dateTimeDepartureUTC: depDate.toISOString(),
            dateTimeArrivalUTC: arrDate.toISOString()
        };

        this.flightService.addFlight(payload).subscribe({
            next: (res) => {
                console.log('Flight added!', res);
                alert('Volo aggiunto con successo!');
                // Reset form o mostra messaggio successo
                this.loadFlights();
            },
            error: (err) => {
                console.error('Error adding flight', err);
            }
        });
    }

    getSold(flight: any): number {
        return flight.sold || 0;
    }

    getRevenue(flight: any): number {
        return flight.revenue || 0;
    }
}
