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
        this._isLoggedIn.set(true);
        this._userName.set(localStorage.getItem('email'));
        localStorage.setItem('accessToken', res.accessToken);

      })
    );
  }
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/';

  // usiamo Angular signals per semplicità
  private _isLoggedIn = signal<boolean>(false);
  private _userName = signal<string | null>(null);

  isLoggedIn = this._isLoggedIn.asReadonly();
  userName = this._userName.asReadonly();

  constructor() {
    // bootstrap da localStorage (se avevi già loggato)
    const saved = localStorage.getItem('sj_user');
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        this._isLoggedIn.set(!!obj?.name);
        this._userName.set(obj?.name || null);
      } catch { /* ignore */ }
    }
  }

  login(data: ILogData) {
    return this.http.post<ILogData>(this.apiUrl + "session/login", data).pipe(
      tap(response => {
        this._isLoggedIn.set(true);
        this._userName.set(data.email);
        localStorage.setItem('email', data.email);
        localStorage.setItem('accessToken', response.accessToken!);
        localStorage.setItem('refreshToken', response.refreshToken!);
      })
    );
  }

  logout() {
    this._isLoggedIn.set(false);
    this._userName.set(null);
    localStorage.removeItem('email');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  signup(newUser: IProfile) {
    console.log('Registrazione utente:', newUser);
    return this.http.post<IProfile>(this.apiUrl + "profile", newUser);
  }

}
