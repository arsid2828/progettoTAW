import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IProfile } from './i-profile';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/';
  
  // usiamo Angular signals per semplicità
  private _isLoggedIn = signal<boolean>(false);
  private _userName   = signal<string | null>(null);

  isLoggedIn = this._isLoggedIn.asReadonly();
  userName   = this._userName.asReadonly();

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

  login(name: string) {
    this._isLoggedIn.set(true);
    this._userName.set(name);
    localStorage.setItem('sj_user', JSON.stringify({ name }));
  }

  logout() {
    this._isLoggedIn.set(false);
    this._userName.set(null);
    localStorage.removeItem('sj_user');
  }

  signup(newUser:IProfile) {
    console.log('Registrazione utente:', newUser);
    return this.http.post<IProfile>(this.apiUrl+"profile", newUser);
  }
  
}
