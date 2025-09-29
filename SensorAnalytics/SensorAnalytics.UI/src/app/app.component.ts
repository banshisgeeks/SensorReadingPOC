import { Component, OnInit } from '@angular/core';
import { LiveChartComponent } from './components/live-chart/live-chart.component';
import { KpiDashboardComponent } from './components/kpi-dashboard/kpi-dashboard.component';
import { AlertPanelComponent } from './components/alert-panel/alert-panel.component';
import { DataGridComponent } from './components/data-grid/data-grid.component';
import { SignalRService } from './services/signalr.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LiveChartComponent,
    
  ],
  template: `
    <div class="container mx-auto p-4 space-y-4">
     
      <app-live-chart></app-live-chart>
     
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(private signalR: SignalRService) {}

  ngOnInit(): void {
    this.signalR.startConnection();
  }
}
