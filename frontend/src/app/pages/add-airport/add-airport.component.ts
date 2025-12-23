// Componente per aggiungere aeroporti
// Form per la creazione di nuovi aeroporti nel sistema
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FlightService } from '../../services/flight.service';

@Component({
    selector: 'app-add-airport',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './add-airport.component.html',
    styleUrls: ['./add-airport.component.css']
})
export class AddAirportComponent implements OnInit {
    airport = {
        name: '',
        city: '',
        code: ''
    };

    constructor(
        private flightService: FlightService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['city']) {
                this.airport.city = params['city'];
            }
        });
    }

    onAddAirport() {
        if (this.airport.name && this.airport.city && this.airport.code) {
            this.flightService.addAirport(this.airport).subscribe({
                next: () => {
                    console.log('Airport added');
                    this.router.navigate(['/airline-area']);
                },
                error: (err) => console.error(err)
            });
        }
    }
}
