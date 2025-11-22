import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

  onLogout() {
    this.auth.logout();
    // opzionale: ridireziona alla search
    // location.assign('/'); // o usa il Router se preferisci
  }
}
