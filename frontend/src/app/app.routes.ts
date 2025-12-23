// Definizione delle rotte dell'applicazione
import { Routes } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';
import { SignupComponent } from './pages/signup/signup.component';
import { LoginComponent } from './pages/login/login.component';
import { AirlineAreaComponent } from './pages/airline-area/airline-area.component';

export const routes: Routes = [
  { path: 'search', component: SearchComponent, title: 'Cerca Voli' },
  { path: 'signup', component: SignupComponent, title: 'Registrati' },
  { path: 'login', component: LoginComponent, title: 'Accedi' },
  { path: 'biglietti', loadComponent: () => import('./pages/biglietti/biglietti.component').then(m => m.BigliettiComponent), title: 'I miei biglietti' },
  { path: 'booking', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), title: 'Prenota' },
  { path: 'booking-multi', loadComponent: () => import('./pages/booking-multi/booking-multi.component').then(m => m.BookingMultiComponent), title: 'Prenotazione multipla' },
  { path: 'seat-choice', loadComponent: () => import('./pages/seat-choice/seat-choice.component').then(m => m.SeatChoiceComponent), title: 'Selezione posto' },
  { path: 'seat-choice-multi', loadComponent: () => import('./pages/seat-choice-multi/seat-choice-multi.component').then(m => m.SeatChoiceMultiComponent), title: 'Selezione posti' },
  { path: 'payment', loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent), title: 'Pagamento' },
  { path: 'payment-multi', loadComponent: () => import('./pages/payment-multi/payment-multi.component').then(m => m.PaymentMultiComponent), title: 'Pagamento multiplo' },
  { path: 'payment-processing', loadComponent: () => import('./pages/payment-processing/payment-processing.component').then(m => m.PaymentProcessingComponent), title: 'Pagamento in corso' },
  { path: 'airline-login', loadComponent: () => import('./pages/airline-login/airline-login.component').then(m => m.AirlineLoginComponent), title: 'Login Compagnia' },
  { path: 'airline-area', component: AirlineAreaComponent, title: 'Area Compagnia' },
  //{ path: 'airline-area', loadComponent: () => import('./pages/airline-area/airline-area.component').then(m => m.AirlineAreaComponent), title: 'Area Compagnia' },
  { path: 'add-plane', loadComponent: () => import('./pages/add-plane/add-plane.component').then(m => m.AddPlaneComponent), title: 'Aggiungi Aereo' },
  { path: 'add-airport', loadComponent: () => import('./pages/add-airport/add-airport.component').then(m => m.AddAirportComponent), title: 'Aggiungi Aeroporto' },
  { path: 'admin', loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), title: 'Admin Dashboard' },
  { path: 'change-password', loadComponent: () => import('./pages/change-password/change-password.component').then(m => m.ChangePasswordComponent), title: 'Cambia Password' },
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: '**', redirectTo: 'search' }
];
