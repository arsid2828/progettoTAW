// Componente per aggiungere aerei
// Form per la creazione di nuovi aerei per la flotta
import { Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FlightService } from '../../shared/admin.flight.service';
import { AuthService } from '../../shared/auth.service';


@Component({
    selector: 'app-add-plane',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './add-plane.component.html',
    styleUrls: ['./add-plane.component.css']
})
export class AddPlaneComponent {
    // Uilizziamo inject() per tutte le dipendenze per coerenza ed evitare errori
    private auth = inject(AuthService);
    private flightService = inject(FlightService);
    private router = inject(Router);

    plane = {
        brand: '',
        model: '',
        registration: ''
    };
ngOnInit() {
        // Logica di protezione copiata dall'altro componente
        if (this.auth.userRole() == 'user') {
            this.router.navigate(['/search']);
            return;
        }
        if (this.auth.userRole() == 'admin') {
            this.router.navigate(['/admin']);
            return;
        }
    }

    onAddPlane() {
        if (this.plane.brand && this.plane.model && this.plane.registration) {
            this.flightService.addPlane(this.plane).subscribe({
                next: () => {
                    console.log('Plane added');
                    this.router.navigate(['/airline-area']);
                },
                error: (err) => console.error(err)
            });
        }
    }
}
