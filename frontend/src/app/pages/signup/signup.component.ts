import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';
import { IProfile } from '@app/shared/i-profile';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './signup.component.html'
})
export class SignupComponent {
  messages: string[] = [];
  // per l'attributo [max] della data
  today = new Date().toISOString().slice(0, 10);
  nome: string = '';
  cognome: string = '';
  email: string = '';
  telefono: string = '';
  data_nascita: Date | null = null;
  indirizzo: string = '';
  nazionalita: string = '';
  citta_nascita: string = '';
  maschio: boolean = true;
  femmina: boolean = false;
  password: string = '';
  password2: string = '';
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  isValidPassword(): boolean {
    return this.password === this.password2 && this.password.length > 4;
  }

  areValidPasswords(): boolean {
    if (!this.isValidPassword() && (this.password2.length >= 4)) {
      return false;
    }
    return true;
  }
  onSubmit() {
    if (!this.isValidPassword()) { alert('Le password non corrispondono'); return; }
    if (this.data_nascita && this.data_nascita >= new Date()) { alert('La data di nascita deve essere nel passato'); return; }
    if (!this.data_nascita) { alert('La data di nascita è obbligatoria'); return; }
    //<TODO>if("tutti i campi"!="tutti i campi") 
    let newUser: IProfile = {
      email: this.email,
      password: this.password,
      nome: this.nome,
      cognome: this.cognome,
      sesso: this.maschio ? 0 : 1, // 0=M,1=F (come nel BD)
      telefono: this.telefono,
      nazionalita: this.nazionalita,
      data_nascita: this.data_nascita as Date,
      citta_nascita: this.citta_nascita,
    }
    this.authService.signup(newUser).subscribe({
      next: (risposta) => {
        console.log('Utente creato!', risposta);
        this.router.navigate(['/login']);
      },
      error: (err) => console.error('Errore', err)
    });
  }
}


