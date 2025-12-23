// Modulo principale (legacy, usato per bootstrap opzionale)
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    // Rimuovi AppComponent da qui se standalone
  ],
  imports: [
    BrowserModule
  ],
  bootstrap: [] // Lascia vuoto se usi un componente standalone
})
export class AppModule { }