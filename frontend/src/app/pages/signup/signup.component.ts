import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './signup.component.html'
})
export class SignupComponent {
  messages: string[] = [];
  // per l'attributo [max] della data
  today = new Date().toISOString().slice(0,10);
}
