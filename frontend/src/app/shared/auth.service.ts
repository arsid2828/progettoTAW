import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { IProfile } from './i-profile';
import { ILogData } from './i-log-data';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // services/auth.service.ts
  addToken(req: HttpRequest<any>) {
    const token = localStorage.getItem('accessToken');
    return token ? req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }) : req;
  }

  refresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<{ accessToken: string }>(this.apiUrl + 'session/refresh', { refreshToken }).pipe(
      tap(res => {
        // 1. Save new token IMMEDIATELY
        localStorage.setItem('accessToken', res.accessToken);
        this._isLoggedIn.set(true);

        // LOOP FIX: Do NOT call session/me here. 
        // If it fails (401), the interceptor might trigger refresh() again => Infinite Loop.
        // We accept that the username might just be the email until next full reload or navigation.
        this._userName.set(localStorage.getItem('email') || 'User');
      })
    );
  }
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/';

  // usiamo Angular signals per semplicità
  private _isLoggedIn = signal<boolean>(false);
  private _userName = signal<string | null>(null);
  private _userRole = signal<string | null>(null);

  isLoggedIn = this._isLoggedIn.asReadonly();
  userName = this._userName.asReadonly();
  userRole = this._userRole.asReadonly();

  constructor() {
    // bootstrap da localStorage (se avevi già loggato)
    const saved = localStorage.getItem('sj_user');
    const role = localStorage.getItem('role');
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        this._isLoggedIn.set(!!obj?.name);
        this._userName.set(obj?.name || null);
        this._userRole.set(role || null);
      } catch { /* ignore */ }
    }
  }

  login(data: ILogData) {
    return this.http.post<ILogData>(this.apiUrl + "session/login", data).pipe(
      tap(response => {
        this._isLoggedIn.set(true);
        // Initially set email; then fetch profile to get real name
        this._userName.set(data.email);
        // Assuming response might contain role or we set it from data if applicable, 
        // but typically login response should have it. 
        // For now, let's assume we save what we can or if the user is an airline, 
        // the backend login should probably return the role.
        // If ILogData doesn't have role, we might need to fetch profile or check token.
        // Let's assume for this specific task we might need to trust ILogData or response.
        // If response has role:
        const role = (response as any).role || 'user'; // Fallback
        this._userRole.set(role);
        localStorage.setItem('email', data.email);
        localStorage.setItem('role', role);
        localStorage.setItem('accessToken', response.accessToken!);
        localStorage.setItem('refreshToken', response.refreshToken!);
        // Fetch profile/me to get full name
        this.http.get<any>(this.apiUrl + 'session/me').subscribe({
          next: (p) => {
            let full = '';
            if (p?.name) {
              // Airline
              full = p.name;
            } else if (p?.nome) {
              // User
              full = p.nome + (p.cognome ? (' ' + p.cognome) : '');
            }

            const display = full || data.email;
            this._userName.set(display);
            localStorage.setItem('sj_user', JSON.stringify({ name: display }));
          }, error: () => {
            // ignore
          }
        });
      })
    );
  }

  logout() {
    this._isLoggedIn.set(false);
    this._userName.set(null);
    this._userRole.set(null);
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sj_user'); // Fix: remove persistent user data
  }

  signup(newUser: IProfile) {
    console.log('Registrazione utente:', newUser);
    return this.http.post<IProfile>(this.apiUrl + "profile", newUser);
  }

}
