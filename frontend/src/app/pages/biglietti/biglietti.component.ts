// Componente biglietti utente
// Visualizza lo storico dei biglietti acquistati
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '@app/shared/ticket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-biglietti',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './biglietti.component.html',
  styleUrls: ['./biglietti.component.css']
})
export class BigliettiComponent implements OnInit {
  tickets: any[] = [];
  ticketService = inject(TicketService);
  router = inject(Router);

  ngOnInit() {
    this.loadTickets();
  }

  // Helper logic to group tickets into trips
  trips: any[] = [];

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (response: any) => {
        console.log('Biglietti response:', response);
        const rawTickets = Array.isArray(response) ? response : [];
        this.groupTicketsIntoTrips(rawTickets);
        console.log('Trips calcolati:', this.trips);
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
    // 1. Sort by date ASC
    tickets.sort((a, b) => {
      const da = new Date(a.flight?.date_departure || 0);
      const db = new Date(b.flight?.date_departure || 0);
      return da.getTime() - db.getTime();
    });

    const grouped: any[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < tickets.length; i++) {
      if (usedIndices.has(i)) continue;

      const currentTicket = tickets[i];
      const trip = {
        mainId: currentTicket._id, // ID for keying
        passengerName: (currentTicket.p_nome || currentTicket.profile?.nome) + ' ' + (currentTicket.p_cognome || currentTicket.profile?.cognome),
        segments: [currentTicket],
        totalPrice: currentTicket.price_paid || 0,
        startDate: currentTicket.flight?.date_departure,
        endDate: currentTicket.flight?.date_arrival
      };
      usedIndices.add(i);

      // Try to find connecting flights
      let pendingConnection = currentTicket;

      for (let j = i + 1; j < tickets.length; j++) {
        if (usedIndices.has(j)) continue;

        const candidate = tickets[j];

        // Checks:
        // 1. Same Passenger
        const candName = (candidate.p_nome || candidate.profile?.nome) + ' ' + (candidate.p_cognome || candidate.profile?.cognome);
        if (candName !== trip.passengerName) continue;

        // 2. Connection Logic: Dest of Prev == Origin of Next
        // and formatting checks to ensure object existence
        const prevDestCode = pendingConnection.flight?.to_airport?.code;
        const nextOriginCode = candidate.flight?.from_airport?.code;

        if (prevDestCode && nextOriginCode && prevDestCode === nextOriginCode) {
          // 3. Time check (e.g. within 24 hours of previous arrival)
          const prevArr = new Date(pendingConnection.flight?.date_arrival).getTime();
          const nextDep = new Date(candidate.flight?.date_departure).getTime();
          const diffHours = (nextDep - prevArr) / (1000 * 60 * 60);

          if (diffHours >= 0 && diffHours < 24) {
            // It is a connection!
            trip.segments.push(candidate);
            trip.totalPrice += (candidate.price_paid || 0);
            trip.endDate = candidate.flight?.date_arrival;

            usedIndices.add(j);
            pendingConnection = candidate; // Advance pointer
          }
        }
      }
      grouped.push(trip);
    }

    // Sort trips by date (most recent first usually preferred for history?)
    // Let's keep ASC for upcoming, or DESC for default history. 
    // User didn't specify, but lists usually newest first or nearest future.
    // Let's default to ASC (closest date first) as per previous code intent
    this.trips = grouped;
  }

  sortTickets(order: 'asc' | 'desc') {
    // Sort trips instead of raw tickets
    this.trips.sort((a, b) => {
      const da = new Date(a.startDate).getTime();
      const db = new Date(b.startDate).getTime();
      return order === 'asc' ? da - db : db - da;
    });
  }
}

