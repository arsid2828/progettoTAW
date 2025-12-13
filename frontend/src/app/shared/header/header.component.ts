import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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

  get user() {
    return { role: this.auth.userRole() };
  }

  isAuthPage(): boolean {
    // Show back button and hide Area Compagnie on login/signup pages
    const currentUrl = this.router.url;
    return currentUrl.includes('/login') || currentUrl.includes('/signup');
  }

  isAirlinePage(): boolean {
    return this.router.url.includes('/airline-area');
  }

  goBack(): void {
    // Navigate back to search page
    this.router.navigate(['/search']);
  }

  onLogout() {
    this.auth.logout();
    // opzionale: ridireziona alla search
    // location.assign('/'); // o usa il Router se preferisci
  }
}
