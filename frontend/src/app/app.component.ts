import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // import SearchComponent directly so the search UI is always rendered
  imports: [RouterOutlet, SearchComponent],
  template: '<app-search></app-search>'
})
export class AppComponent {}
