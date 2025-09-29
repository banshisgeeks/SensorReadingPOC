import { Component, OnInit } from '@angular/core';
import { SignalRService } from '../../services/signalr.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-red-50 rounded shadow max-h-64 overflow-y-auto">
      <div *ngFor="let a of alerts" class="mb-1 p-2 bg-red-100 rounded">
        <strong>{{a.sensorId}}</strong>: {{a.value | number:'1.1-2'}} at {{a.timestamp | date:'mediumTime'}}
      </div>
    </div>
  `
})
export class AlertPanelComponent implements OnInit {
  alerts: any[] = [];

  constructor(private signalR: SignalRService) {}

  ngOnInit(): void {
    this.signalR.anomalies$.subscribe(a => this.alerts = a);
  }
}
