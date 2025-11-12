import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
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
}
