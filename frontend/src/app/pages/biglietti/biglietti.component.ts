import { Component,AfterViewInit, inject } from '@angular/core';
import { TicketService } from '@app/shared/ticket.service';

@Component({
  selector: 'app-biglietti',
  standalone: true,
  templateUrl: './biglietti.component.html',
  styleUrls: ['./biglietti.component.css']
})
export class BigliettiComponent {
  // Placeholder tickets data — adapt later if needed
  tickets = [
    { id: 1, title: 'Milano (MXP) → Dubai (DXB)', date: '2025-09-27', price: '€394.00', passenger: 'mario rossi' },
    { id: 2, title: 'Roma (FCO) → Milano (MXP)', date: '2025-10-02', price: '€511.00', passenger: 'lucia rossi' }
  ];
  ticketService = inject(TicketService)
  ngAfterViewInit() {
    alert('Componente biglietti visibile!');
    this.ticketService.getTickets().subscribe({
      next: (response: any) => {
        console.log('Biglietti ricevuti dal backend:', response);
        this.tickets = response;
      },
      error: (error) => {
        console.error('Errore nel recupero dei biglietti:', error);
      }
    });
  }
}
