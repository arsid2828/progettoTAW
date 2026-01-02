// Modulo principale (legacy, usato per bootstrap opzionale)
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
@NgModule({
  declarations: [
    // Rimuovi AppComponent da qui se standalone
  ],
  imports: [
    BrowserModule
  ],
  bootstrap: [], // Lascia vuoto se usi un componente standalone
  providers: [
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: 'dd/MM/yyyy' }
    }
  ]
})
export class AppModule { }