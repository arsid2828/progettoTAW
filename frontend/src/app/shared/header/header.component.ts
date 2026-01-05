import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../auth.service';
import { HuserComponent } from '../huser/huser.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, HuserComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  auth = inject(AuthService);
  router = inject(Router);
  location = inject(Location);

  get user() {
    return { role: this.auth.userRole() };
  }

  get userName() {
    return this.auth.userName();
  }

  isAuthPage(): boolean {
    // Show back button and hide Area Compagnie on login/signup pages
    const currentUrl = this.router.url;
    return currentUrl.includes('/login') || currentUrl.includes('/signup');
  }

  isAirlinePage(): boolean {
    return this.router.url.includes('/airline-area');
  }

  isAirlineLogin(): boolean {
    return this.router.url.includes('/airline-login');
  }

  isAdmin(): boolean {
    return this.auth.userRole() === 'admin';
  }

  isHome(): boolean {
    const url = this.router.url || '';
    return url === '/' || url === '/search' || url.startsWith('/search?');
  }

  isBigliettiPage(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/biglietti');
  }

  goBack(event?: Event): void {
    if (event) event.preventDefault();
    this.location.back();
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/search']).then(() => {
      // Optional: reload if state persists oddly
      window.location.reload();
    });
  }
  goHome() {
    console.log('Navigating to home');
    this.router.navigate(['/search']);
    
  }
}
