//Componente per aggiungere aeroporti
//Form per la creazione di nuovi aeroporti nel sistema
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { FlightService } from '../../shared/admin.flight.service';
import { AuthService } from '../../shared/auth.service';
import { Location } from '@angular/common';
@Component({
    selector: 'app-add-airport',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, RouterLink],
    templateUrl: './add-airport.component.html',
    styleUrls: ['./add-airport.component.css']
})
export class AddAirportComponent implements OnInit {
    auth = inject(AuthService);
    location = inject(Location);
    router = inject(Router);
    airport = {
        name: '',
        city: '',
        code: ''
    };
    

    constructor(
        private flightService: FlightService,
 
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        if (this.auth.userRole() == 'user') {
            this.router.navigate(['/search']);
            return;
        }
        if (this.auth.userRole() == 'admin') {
        this.router.navigate(['/admin']);
        return;
        }
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
