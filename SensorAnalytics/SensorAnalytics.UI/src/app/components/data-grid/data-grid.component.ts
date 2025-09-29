import { Component, OnInit } from '@angular/core';
import { SignalRService } from '../../services/signalr.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <p-table [value]="data" [paginator]="true" [rows]="10" [virtualScroll]="true">
      <ng-template pTemplate="header">
        <tr>
          <th>Sensor ID</th>
          <th>Avg</th>
          <th>Min</th>
          <th>Max</th>
          <th>Count</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-row>
        <tr>
          <td>{{row.sensorId}}</td>
          <td>{{row.avg | number:'1.1-2'}}</td>
          <td>{{row.min | number:'1.1-2'}}</td>
          <td>{{row.max | number:'1.1-2'}}</td>
          <td>{{row.count}}</td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class DataGridComponent implements OnInit {
  data: any[] = [];
  constructor(private signalR: SignalRService) {}
  ngOnInit(): void {
    this.signalR.readings$.subscribe(d => this.data = d);
  }
}
