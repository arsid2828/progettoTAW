import { Routes } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';
import { PassengersComponent } from './pages/passengers/passengers.component';

export const routes: Routes = [
  { path: 'search', component: SearchComponent , title: 'Cerca Voli'},
  { path: 'passengers', component: PassengersComponent , title: 'Passeggeri'},
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: '**', redirectTo: 'search' }
];
