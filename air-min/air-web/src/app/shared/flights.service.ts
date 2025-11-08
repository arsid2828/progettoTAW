import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Flight {
  id: number; airline: string; from: string; to: string;
  date: string; depart: string; arrive: string; price: number;
}

@Injectable({ providedIn: 'root' })
export class FlightsService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api';

  async search(from: string, to: string, date: string) {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to', to);
    if (date) params = params.set('date', date);
    return await firstValueFrom(this.http.get<Flight[]>(`${this.base}/flights`, { params }));
  }
}
