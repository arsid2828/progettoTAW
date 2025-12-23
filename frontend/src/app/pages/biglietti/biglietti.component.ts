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

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (response: any) => {
        this.tickets = Array.isArray(response) ? response : [];
        this.sortTickets('asc');
      },
      error: (error) => {
        console.error('Errore nel recupero dei biglietti:', error);
        // Se non autorizzato, manda al login
        if (error?.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  sortTickets(order: 'asc' | 'desc') {
    this.tickets.sort((a, b) => {
      const da = new Date(a.flight?.date_departure || a.flight?.date || a.date || '');
      const db = new Date(b.flight?.date_departure || b.flight?.date || b.date || '');
      return order === 'asc' ? +da - +db : +db - +da;
    });
  }
}

