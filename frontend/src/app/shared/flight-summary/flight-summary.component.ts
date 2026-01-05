import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flight-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flight-summary.component.html',
  styleUrl: './flight-summary.component.css'
})
export class FlightSummaryComponent {
  @Input() flight: any;


  //viene usata in più parti dell'app
  compareDatesIngoreTime(date1: Date, date2: Date): boolean {
  
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
    }
}
