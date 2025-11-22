import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // import SearchComponent directly so the search UI is always rendered
  imports: [RouterOutlet, SearchComponent,HeaderComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {}
