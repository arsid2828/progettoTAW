// Login per compagnie aeree
// Gestisce l'accesso all'area riservata delle compagnie
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-airline-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './airline-login.component.html',
  styleUrls: ['./airline-login.component.css']
})
export class AirlineLoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  submit(e?: Event) {
    e?.preventDefault();
    this.loading = true;
    this.error = null;
    this.auth.login({ email: this.email, password: this.password } as any).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.mustChangePassword) {
          this.router.navigate(['/change-password']);
          return;
        }
        // naviga all'area airline dopo login con successo
        this.router.navigate(['/airline-area']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Credenziali non valide';
      }
    });
  }
}
