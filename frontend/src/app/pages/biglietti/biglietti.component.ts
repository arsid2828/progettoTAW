import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
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
  // Modal state
  showModal = false;
  selectedTrip: any = null;
  qrData: string | null = null;

  @ViewChild('modalContainer') modalContainer!: ElementRef;

  ngOnInit() {
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
        // If unauthorized, send user to login
        if (error?.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  groupTicketsIntoTrips(tickets: any[]) {
    // Simple grouping by passenger and connecting flights (lightweight)
    const raw = tickets.slice();
    raw.sort((a,b) => new Date(a.flight?.date_departure || 0).getTime() - new Date(b.flight?.date_departure || 0).getTime());
    const groups: any[] = [];
    const used = new Set<number>();
    for (let i=0;i<raw.length;i++){
      if (used.has(i)) continue;
      const t = raw[i];
      const passenger = (t.p_nome || t.profile?.nome || '') + ' ' + (t.p_cognome || t.profile?.cognome || '');
      const trip: any = { mainId: t._id, passengerName: passenger.trim(), segments: [t], totalPrice: t.price_paid || 0, startDate: t.flight?.date_departure, endDate: t.flight?.date_arrival };
      used.add(i);
      let last = t;
      for (let j=i+1;j<raw.length;j++){
        if (used.has(j)) continue;
        const c = raw[j];
        const cName = (c.p_nome || c.profile?.nome || '') + ' ' + (c.p_cognome || c.profile?.cognome || '');
        if (cName.trim() !== trip.passengerName) continue;
        const prevDest = last.flight?.to_airport?.code;
        const nextOrig = c.flight?.from_airport?.code;
        if (prevDest && nextOrig && prevDest === nextOrig){
          const prevArr = new Date(last.flight?.date_arrival).getTime();
          const nextDep = new Date(c.flight?.date_departure).getTime();
          const hours = (nextDep - prevArr) / (1000*60*60);
          if (hours >= 0 && hours < 24){
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

  openModal(trip: any){
    this.selectedTrip = trip;
    this.qrData = this.generateQrData(trip);
    this.showModal = true;
    try{ document.body.style.overflow = 'hidden'; }catch(e){}

    // Move modal element to document.body to avoid stacking/transform issues
    setTimeout(()=>{
      try{
        const el = this.modalContainer?.nativeElement as HTMLElement | undefined;
        if(el && el.parentElement !== document.body){
          document.body.appendChild(el);
        }
      }catch(err){/* ignore */}
    }, 0);
  }

  closeModal(){
    // Remove modal from body if appended
    try{
      const el = this.modalContainer?.nativeElement as HTMLElement | undefined;
      if(el && el.parentElement === document.body){
        document.body.removeChild(el);
      }
    }catch(err){/* ignore */}
    this.showModal = false;
    this.selectedTrip = null;
    this.qrData = null;
    try{ document.body.style.overflow = ''; }catch(e){}
  }

  generateQrData(trip: any): string{
    const payload = JSON.stringify({id: trip.mainId || '', passenger: trip.passengerName || '', from: trip.segments?.[0]?.flight?.from_airport?.code, to: trip.segments?.[trip.segments.length-1]?.flight?.to_airport?.code, date: trip.startDate});
    // QR-like grid parameters
    const modules = 25; // modules per side
    const cell = 6; // px per module
    const quiet = 2; // quiet zone modules
    const size = (modules + quiet*2) * cell;

    // simple deterministic hash seed
    let seed = 0;
    for (let i=0;i<payload.length;i++){ seed = ((seed << 5) - seed) + payload.charCodeAt(i); seed |= 0; }

    const rand = (i: number) => {
      // xorshift-ish deterministic function
      let v = (seed + i * 9973) | 0;
      v ^= (v << 13);
      v ^= (v >>> 17);
      v ^= (v << 5);
      return Math.abs(v) % 100;
    };

    const modulesArr: boolean[][] = [];
    for (let y=0;y<modules;y++){ modulesArr[y] = []; for (let x=0;x<modules;x++){ modulesArr[y][x] = false; } }

    // draw finder patterns (7x7) at TL, TR, BL
    const drawFinder = (ox: number, oy: number) => {
      for (let y=0;y<7;y++){
        for (let x=0;x<7;x++){
          const inOuter = true;
          const cx = ox + x;
          const cy = oy + y;
          if (x===0||x===6||y===0||y===6) modulesArr[cy][cx] = true; // outer dark
          if (x>=2 && x<=4 && y>=2 && y<=4) modulesArr[cy][cx] = true; // center dark
          if ( (x===1||x===5) && (y===1||y===5) ) modulesArr[cy][cx] = false; // inner white ring
        }
      }
    };
    drawFinder(0,0);
    drawFinder(modules-7,0);
    drawFinder(0,modules-7);

    // fill remaining modules with deterministic pattern
    for (let y=0;y<modules;y++){
      for (let x=0;x<modules;x++){
        // skip finder area (rough check)
        if ((x<8 && y<8) || (x>modules-9 && y<8) || (x<8 && y>modules-9)) continue;
        const idx = x + y*modules;
        const v = rand(idx);
        // threshold tuned to create realistic density
        modulesArr[y][x] = v % 100 < 38;
      }
    }

    // build rects with quiet zone offset
    let rects = '';
    for (let y=0;y<modules;y++){
      for (let x=0;x<modules;x++){
        if (modulesArr[y][x]){
          const rx = (x + quiet) * cell;
          const ry = (y + quiet) * cell;
          rects += `<rect x="${rx}" y="${ry}" width="${cell}" height="${cell}" fill="#0a0a0a"/>`;
        }
      }
    }

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'><rect width='100%' height='100%' fill='#ffffff'/>${rects}</svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  sortTickets(order: 'asc' | 'desc') {
    if (this.trips && this.trips.length) {
      this.trips.sort((a: any, b: any) => {
        const da = new Date(a.startDate || 0).getTime();
        const db = new Date(b.startDate || 0).getTime();
        return order === 'asc' ? da - db : db - da;
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

