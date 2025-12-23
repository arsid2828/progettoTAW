// Componente per il login utente
// Gestisce l'autenticazione tramite email e password
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { ILogData } from '@app/shared/i-log-data';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  route: ActivatedRoute = inject(ActivatedRoute);

  onSubmit() {

    let loginData: ILogData = {
      email: this.email,
      password: this.password
    }
    this.authService.login(loginData).subscribe({
      next: (risposta) => {
        console.log('Utente loggato!', risposta);
        console.log('CHECK CAMBIO PASS:', (risposta as any).mustChangePassword);

        if ((risposta as any).mustChangePassword) {
          this.router.navigate(['/change-password']);
          return;
        }

        if (this.authService.userRole() === 'admin') {
          this.router.navigate(['/admin']);
          return;
        }

        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.router.navigate(['/search']);
        }
      },
      error: (err) => console.error('Errore', err)
    });
  }
}

