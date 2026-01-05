import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '@app/shared/ticket.service';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '@app/shared/auth.service';

@Component({
  selector: 'app-biglietti',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './biglietti.component.html',
  styleUrls: ['./biglietti.component.css']
})
export class BigliettiComponent implements OnInit {
  tickets: any[] = [];
  ticketService = inject(TicketService);
  router = inject(Router);
  trips: any[] = [];
  auth = inject(AuthService);
  location = inject(Location);

  showModal = false;
  selectedTrip: any = null;
  qrDataList: string[] = [];

  ngOnInit() {
    if (this.auth.userRole() == 'airline') {
      this.router.navigate(['/airline-area']);
      return;
    }
    if (this.auth.userRole() == 'admin') {
      this.router.navigate(['/admin']);
      return;
    }
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (response: any) => {
        this.tickets = Array.isArray(response) ? response : [];
        this.groupTicketsIntoTrips(this.tickets);
        this.sortTickets('asc');
      },
      error: (error) => {
        console.error('Errore nel recupero dei biglietti:', error);
        if (error?.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  groupTicketsIntoTrips(tickets: any[]) {
    const raw = tickets.slice();
    raw.sort((a, b) => new Date(a.flight?.date_departure || 0).getTime() - new Date(b.flight?.date_departure || 0).getTime());
    const groups: any[] = [];
    const used = new Set<number>();

    for (let i = 0; i < raw.length; i++) {
      if (used.has(i)) continue;
      const t = raw[i];
      const passenger = (t.p_nome || t.profile?.nome || '') + ' ' + (t.p_cognome || t.profile?.cognome || '');
      const trip: any = {
        mainId: t._id,
        passengerName: passenger.trim(),
        segments: [t],
        totalPrice: t.price_paid || 0,
        startDate: t.flight?.date_departure,
        endDate: t.flight?.date_arrival
      };
      used.add(i);

      let last = t;
      for (let j = i + 1; j < raw.length; j++) {
        if (used.has(j)) continue;
        const c = raw[j];
        const cName = (c.p_nome || c.profile?.nome || '') + ' ' + (c.p_cognome || c.profile?.cognome || '');
        if (cName.trim() !== trip.passengerName) continue;

        const prevDest = last.flight?.to_airport?.code;
        const nextOrig = c.flight?.from_airport?.code;

        if (prevDest && nextOrig && prevDest === nextOrig) {
          const prevArr = new Date(last.flight?.date_arrival).getTime();
          const nextDep = new Date(c.flight?.date_departure).getTime();
          const hours = (nextDep - prevArr) / (1000 * 60 * 60);

          if (hours >= 0 && hours < 24) {
            trip.segments.push(c);
            trip.totalPrice += c.price_paid || 0;
            trip.endDate = c.flight?.date_arrival;
            used.add(j);
            last = c;
          }
        }
      }

      groups.push(trip);
    }

    this.trips = groups;
  }

  openModal(trip: any) {
    this.selectedTrip = trip;
    const segs = Array.isArray(trip?.segments) ? trip.segments : [];
    this.qrDataList = segs.length ? segs.map((_: any, idx: number) => this.generateQrData(trip, idx)) : [this.generateQrData(trip, 0)];
    this.showModal = true;
    try { document.body.style.overflow = 'hidden'; } catch (e) { }
  }

  closeModal() {
    this.showModal = false;
    this.selectedTrip = null;
    this.qrDataList = [];
    try { document.body.style.overflow = ''; } catch (e) { }
  }

  generateQrData(trip: any, segmentIndex: number): string {
    const seg = Array.isArray(trip?.segments) ? trip.segments[segmentIndex] : null;

    const payload = JSON.stringify({
      tripId: trip?.mainId || '',
      segmentIndex,
      ticketId: seg?._id || '',
      passenger: trip?.passengerName || '',
      from: seg?.flight?.from_airport?.code ?? trip?.segments?.[0]?.flight?.from_airport?.code,
      to: seg?.flight?.to_airport?.code ?? trip?.segments?.[trip?.segments?.length - 1]?.flight?.to_airport?.code,
      dep: seg?.flight?.date_departure ?? seg?.flight?.departure ?? trip?.startDate,
      seat: seg?.seat_number ?? '',
      seatClass: seg?.seat_class?.seat_class ?? ''
    });

    const modules = 25;
    const cell = 6;
    const quiet = 2;
    const size = (modules + quiet * 2) * cell;

    let seed = 0;
    for (let i = 0; i < payload.length; i++) {
      seed = ((seed << 5) - seed) + payload.charCodeAt(i);
      seed |= 0;
    }

    const rand = (i: number) => {
      let v = (seed + i * 9973) | 0;
      v ^= (v << 13);
      v ^= (v >>> 17);
      v ^= (v << 5);
      return Math.abs(v) % 100;
    };

    const modulesArr: boolean[][] = [];
    for (let y = 0; y < modules; y++) {
      modulesArr[y] = [];
      for (let x = 0; x < modules; x++) modulesArr[y][x] = false;
    }

    const drawFinder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const cx = ox + x;
          const cy = oy + y;
          if (x === 0 || x === 6 || y === 0 || y === 6) modulesArr[cy][cx] = true;
          if (x >= 2 && x <= 4 && y >= 2 && y <= 4) modulesArr[cy][cx] = true;
          if ((x === 1 || x === 5) && (y === 1 || y === 5)) modulesArr[cy][cx] = false;
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(modules - 7, 0);
    drawFinder(0, modules - 7);

    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        if ((x < 8 && y < 8) || (x > modules - 9 && y < 8) || (x < 8 && y > modules - 9)) continue;
        const idx = x + y * modules;
        const v = rand(idx);
        modulesArr[y][x] = v < 38;
      }
    }

    let rects = '';
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        if (modulesArr[y][x]) {
          const rx = (x + quiet) * cell;
          const ry = (y + quiet) * cell;
          rects += `<rect x="${rx}" y="${ry}" width="${cell}" height="${cell}" fill="#0a0a0a"/>`;
        }
      }
    }

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'><rect width='100%' height='100%' fill='#ffffff'/>${rects}</svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  sortTickets(order: 'asc' | 'desc' | 'buy_desc' | 'buy_asc') {
    const getPurchaseTime = (x: any) => {
      const v = x?.createdAt ?? x?.created_at ?? x?.purchaseDate ?? x?.date_purchase ?? 0;
      const t = new Date(v || 0).getTime();
      return Number.isFinite(t) ? t : 0;
    };

    const getTripPurchaseTime = (trip: any) => {
      const segs = Array.isArray(trip?.segments) ? trip.segments : [];
      if (!segs.length) return getPurchaseTime(trip);
      for (const s of segs) {
        const ts = getPurchaseTime(s);
        if (ts) return ts;
      }
      return getPurchaseTime(segs[0]);
    };

    if (this.trips && this.trips.length) {
      if (order === 'buy_desc' || order === 'buy_asc') {
        this.trips.sort((a: any, b: any) => {
          const da = getTripPurchaseTime(a);
          const db = getTripPurchaseTime(b);
          return order === 'buy_asc' ? da - db : db - da;
        });
      } else {
        this.trips.sort((a: any, b: any) => {
          const da = new Date(a.startDate || 0).getTime();
          const db = new Date(b.startDate || 0).getTime();
          return order === 'asc' ? da - db : db - da;
        });
      }
    } else {
      if (order === 'buy_desc' || order === 'buy_asc') {
        this.tickets.sort((a, b) => {
          const da = getPurchaseTime(a);
          const db = getPurchaseTime(b);
          return order === 'buy_asc' ? da - db : db - da;
        });
      } else {
        this.tickets.sort((a, b) => {
          const da = new Date(a.flight?.date_departure || a.flight?.date || a.date || '').getTime();
          const db = new Date(b.flight?.date_departure || b.flight?.date || b.date || '').getTime();
          return order === 'asc' ? da - db : db - da;
        });
      }
    }
  }
}
