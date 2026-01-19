
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule
  ],
  bootstrap: [],
  providers: [
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: 'dd/MM/yyyy' }
    }
  ]
})
export class AppModule { }