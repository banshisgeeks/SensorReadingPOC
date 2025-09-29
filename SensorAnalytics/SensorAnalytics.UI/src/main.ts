import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TableModule } from 'primeng/table';
import { HttpClient } from '@microsoft/signalr';
import { provideHttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserAnimationsModule,
      NgApexchartsModule,
      TableModule,
      CardModule 
    ),
    provideHttpClient(),
  ]
}).catch(err => console.error(err));
