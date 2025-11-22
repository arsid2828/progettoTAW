// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';   // <-- il file che mi hai mostrato prima

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)   // <-- questa riga mancava!
  ]
}).catch(err => console.error(err));