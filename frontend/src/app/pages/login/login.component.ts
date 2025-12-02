import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
  onSubmit() {

    let loginData: ILogData = {
      email: this.email,
      password: this.password
    }
    this.authService.login(loginData).subscribe({
      next: (risposta) => {
        console.log('Utente loggato!', risposta);
        this.router.navigate(['/search']);
      },
      error: (err) => console.error('Errore', err)
    });
  }
}

