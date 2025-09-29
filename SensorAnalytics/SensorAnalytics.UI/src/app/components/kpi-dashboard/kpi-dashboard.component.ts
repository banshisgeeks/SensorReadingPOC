import { Component, OnDestroy, OnInit } from '@angular/core';
import { SignalRService } from '../../services/signalr.service';
import { CommonModule } from '@angular/common';
import { AnomalyAlert, SensorReading } from '../../Model/reading';
import { Subject, takeUntil } from 'rxjs';
import { EnhancedSignalRServiceService } from '../../services/enhanced-signal-rservice.service';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-kpi-dashboard',
  standalone: true,
  imports: [CommonModule,CardModule],
  templateUrl: './kpi-dashboard.component.html',
  styleUrls: ['./kpi-dashboard.component.css']
})
export class KpiDashboardComponent implements OnInit, OnDestroy {
  avg = 0;
  min = 0;
  max = 0;
  readings: SensorReading[] = [];
  private destroy$ = new Subject<void>();

  stats: any = {};
  chartData: any = {};
  alerts: any[] = [];
  bufferSize: number = 0;
 

  constructor(private signalR: SignalRService, private realtime: EnhancedSignalRServiceService) { }

  ngOnInit(): void {
  // this.signalR.readings$.subscribe(data => {
  //     if (data.length > 0) {
  //       const values = data.map(d => d.avg);
  //       this.avg = values.reduce((a,b)=>a+b,0)/values.length;
  //       this.min = Math.min(...values);
  //       this.max = Math.max(...values);
  //     }
  //   });
  //  this.loadSensor();
    //  this.realtime.stats$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((s: any) => this.stats = s);

    // this.realtime.chartData$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((c: any) => this.chartData = c);

    // this.realtime.alerts$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((a: AnomalyAlert[]) => this.alerts = a);

    // this.realtime.bufferSize$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((b: number) => this.bufferSize = b);
  }


  loadSensor() {
   this.signalR.getLatestReadings().subscribe(data => this.readings = data);
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearAlerts() {
    this.realtime.clearAlerts();
  }
  sensorIds(): string[] {
    return Object.keys(this.stats || {});
  }
  kpiColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

getKpiColor(index: number): string {
  return this.kpiColors[index % this.kpiColors.length];
}

}
