// Elaborazione pagamento
// Componente di attesa durante il processamento del pagamento
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-processing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="container">
      <div class="search-card">
        <h1 class="page-title">Pagamento in corso</h1>
        <p>Stiamo elaborando il pagamento...</p>
      </div>
    </main>
  `
})
export class PaymentProcessingComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);

  constructor() {
    // simula elaborazione poi reindirizza ai biglietti
    setTimeout(() => this.router.navigate(['/biglietti']), 1200);
  }
}
