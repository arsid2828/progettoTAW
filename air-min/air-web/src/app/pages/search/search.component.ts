import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html'
})
export class SearchComponent {
  from = ''; to = ''; date = '';
  search() { alert(`Cerco voli: ${this.from} → ${this.to} ${this.date || ''}`); }
}
