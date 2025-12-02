import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';
import { HeaderComponent } from './shared/header/header.component';
import { AuthService } from './shared/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  // import SearchComponent directly so the search UI is always rendered
  imports: [RouterOutlet, SearchComponent,HeaderComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  authService = inject(AuthService);
  constructor() {
    this.authService.refresh().subscribe({
      next: (risposta) => {
        console.log('Token refreshed on app start', risposta);
      },
      error: (err) => {
        console.error('Errore durante il refresh del token all\'avvio dell\'app', err);
      }
    });
  }

}
