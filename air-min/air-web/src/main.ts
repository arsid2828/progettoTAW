// src/main.ts
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

console.log('[BOOT] air-min/air-web - avvio Angular');

bootstrapApplication(AppComponent, { providers: [provideRouter(routes)] })
  .catch(err => console.error(err));
