// Dashboard amministratore
// Permette la gestione di utenti e compagnie aeree
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@app/shared/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
    http = inject(HttpClient);
    auth = inject(AuthService);
    router = inject(Router);
    fb = inject(FormBuilder);

    users: any[] = [];
    airlines: any[] = [];

    airlineForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
    });

    apiUrl = 'http://localhost:3000/api';

    ngOnInit() {
        if (this.auth.userRole() !== 'admin') {
            this.router.navigate(['/search']);
            return;
        }
        this.loadUsers();
        this.loadAirlines();
    }

    loadUsers() {
        this.http.get<any[]>(`${this.apiUrl}/profile`).subscribe({
            next: res => this.users = res,
            error: err => console.error(err)
        });
    }

    loadAirlines() {
        this.http.get<any[]>(`${this.apiUrl}/airlines`).subscribe({
            next: res => this.airlines = res,
            error: err => console.error(err)
        });
    }

    deleteUser(id: string) {
        if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;

        this.http.delete(`${this.apiUrl}/profile/${id}`).subscribe({
            next: () => {
                this.loadUsers();
                alert('Utente eliminato');
            },
            error: err => alert('Errore eliminazione utente')
        });
    }

    createAirline() {
        if (this.airlineForm.invalid) return;

        this.http.post(`${this.apiUrl}/airlines`, this.airlineForm.value).subscribe({
            next: (res) => {
                alert('Airline creata con successo');
                this.airlineForm.reset();
                this.loadAirlines();
            },
            error: (err) => alert('Errore creazione airline')
        });
    }
}
