import { Routes } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';
import { PassengersComponent } from './pages/passengers/passengers.component';
import { SignupComponent } from './pages/signup/signup.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: 'search', component: SearchComponent , title: 'Cerca Voli'},
  { path: 'signup', component: SignupComponent , title: 'Registrati'},
  { path: 'login', component: LoginComponent , title: 'Accedi'},
  { path: 'passengers', component: PassengersComponent , title: 'Passeggeri'},
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: '**', redirectTo: 'search' }
];
