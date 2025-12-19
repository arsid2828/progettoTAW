import { Component,AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '@app/shared/ticket.service';

@Component({
  selector: 'app-biglietti',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './biglietti.component.html',
  styleUrls: ['./biglietti.component.css']
})
export class BigliettiComponent {
  // Placeholder tickets data — adapt later if needed
  tickets = [ ];
  ticketService = inject(TicketService)
  ngAfterViewInit() {
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
