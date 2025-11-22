import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-huser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './huser.component.html',
  styleUrl: './huser.component.css'
})

//Variabili per capire se si è loggati oppure no 
export class HuserComponent {
 userName: string | null = 'username';
 loggedIn: boolean = false;
}
