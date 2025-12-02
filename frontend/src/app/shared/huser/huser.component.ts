import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-huser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './huser.component.html',
  styleUrl: './huser.component.css'
})

//Variabili per capire se si è loggati oppure no 
export class HuserComponent {
  authService = inject(AuthService);
  isLoggedIn = this.authService.isLoggedIn;
  userName = this.authService.userName;
    router: Router = inject(Router);
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
