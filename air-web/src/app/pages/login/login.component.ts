import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Login</h2>
    <p>Per ora il login non è implementato.</p>
  `
})
export class LoginComponent {}
