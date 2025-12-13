import { Routes } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';
import { PassengersComponent } from './pages/passengers/passengers.component';
import { SignupComponent } from './pages/signup/signup.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: 'search', component: SearchComponent, title: 'Cerca Voli' },
  { path: 'signup', component: SignupComponent, title: 'Registrati' },
  { path: 'login', component: LoginComponent, title: 'Accedi' },
  { path: 'passengers', component: PassengersComponent, title: 'Passeggeri' },
  { path: 'airline-area', loadComponent: () => import('./pages/airline-area/airline-area.component').then(m => m.AirlineAreaComponent), title: 'Area Compagnia' },
  { path: 'add-plane', loadComponent: () => import('./pages/add-plane/add-plane.component').then(m => m.AddPlaneComponent), title: 'Aggiungi Aereo' },
  { path: 'add-airport', loadComponent: () => import('./pages/add-airport/add-airport.component').then(m => m.AddAirportComponent), title: 'Aggiungi Aeroporto' },
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: '**', redirectTo: 'search' }
];
