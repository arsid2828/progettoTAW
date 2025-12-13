import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FlightService } from '../../services/flight.service';

@Component({
    selector: 'app-add-plane',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './add-plane.component.html',
    styleUrls: ['./add-plane.component.css']
})
export class AddPlaneComponent {
    model: string = '';

    constructor(private flightService: FlightService, private router: Router) { }

    onAddPlane() {
        if (this.model) {
            this.flightService.addPlane({ model: this.model }).subscribe({
                next: () => {
                    console.log('Plane added');
                    this.router.navigate(['/airline-area']);
                },
                error: (err) => console.error(err)
            });
        }
    }
}
