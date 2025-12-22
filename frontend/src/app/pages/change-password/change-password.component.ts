import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
    fb = inject(FormBuilder);
    http = inject(HttpClient);
    router = inject(Router);

    form = this.fb.group({
        newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    apiUrl = 'http://localhost:3000/api';

    onSubmit() {
        if (this.form.invalid) return;

        this.http.post(`${this.apiUrl}/session/change-password`, this.form.value).subscribe({
            next: () => {
                alert('Password aggiornata con successo. Effettua nuovamente il login.');
                // Logout via token removal? 
                // Ideally backend should invalidate session too but simplest is client side cleanup.
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                this.router.navigate(['/login']);
            },
            error: (err) => alert('Errore aggiornamento password')
        });
    }
}
