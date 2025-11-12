import { Routes } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';

export const routes: Routes = [
  { path: '', component: SearchComponent, pathMatch: 'full' },
  { path: 'search', component: SearchComponent },
  // aggiungerai qui le altre pagine
];
