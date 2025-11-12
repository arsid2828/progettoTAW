import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <header class="main-header">
    <div class="header-content">
      <div class="header-section">
        <!-- Se loggato: saluto + link; altrimenti: Accedi/Registrati -->
        <ng-container *ngIf="auth.isLoggedIn(); else loggedOut">
          <div class="user-greeting">
            <span class="welcome-text">Ciao, {{ auth.userName() }}!</span>
            <a class="btn btn-secondary" [routerLink]="['/passengers']">I tuoi Passeggeri</a>
            <a class="btn btn-secondary" [routerLink]="['/my-flights']">I miei voli</a>
            <button class="btn btn-outline" type="button" (click)="onLogout()">Logout</button>
          </div>
        </ng-container>
        <ng-template #loggedOut>
          <a class="btn btn-primary" [routerLink]="['/login']">Accedi / Registrati</a>
        </ng-template>
      </div>

      <div class="header-logo"><span class="logo-text">SkyJourney</span></div>

      <div class="header-section">
        <a class="btn btn-airline" [routerLink]="['/airline']">Area Compagnie</a>
      </div>
    </div>
  </header>
  `
})
export class HeaderComponent {
  auth = inject(AuthService);

  onLogout() {
    this.auth.logout();
    // opzionale: ridireziona alla search
    // location.assign('/'); // o usa il Router se preferisci
  }
}
