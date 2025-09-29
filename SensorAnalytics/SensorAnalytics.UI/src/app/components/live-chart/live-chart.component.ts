import { Component, OnDestroy, OnInit } from '@angular/core';
import { SignalRService } from '../../services/signalr.service';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, NgApexchartsModule } from "ng-apexcharts";
import { CommonModule } from '@angular/common';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AnomalyAlert, SensorReading } from '../../Model/reading';
import { EnhancedSignalRServiceService } from '../../services/enhanced-signal-rservice.service';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { Checkbox, CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-live-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, CardModule,FormsModule,CheckboxModule,Checkbox],
  templateUrl: './live-chart.component.html',
  styleUrls: ['./live-chart.component.css']
})
export class LiveChartComponent implements OnInit, OnDestroy {
  avg = 0;
  min = 0;
  max = 0;
  // series: ApexAxisChartSeries = [
  //   { name: 'Sensor Value', data: [] as number[] }];
  // chart: ApexChart = { type: 'line', height: 350, animations: { enabled: true } };
  // xaxis: ApexXAxis = { categories: [] };
  // dataLabels: ApexDataLabels = { enabled: false };
  series: ApexAxisChartSeries = [
  { name: 'Sensor 1', data: [] as number[] },
  { name: 'Sensor 2', data: [] as number[] },
  { name: 'Sensor 3', data: [] as number[] }
];

chart: ApexChart = { 
  type: 'line', 
  height: 350, 
  animations: { enabled: true } 
};

xaxis: ApexXAxis = { categories: [] };
dataLabels: ApexDataLabels = { enabled: false };

// Add colors for different sensors (optional)
colors: string[] = ['#008FFB', '#00E396', '#FEB019'];
  readings: SensorReading[] = [];
  private destroy$ = new Subject<void>();

  stats: any = {};
  chartData: any = {};
  alerts: any[] = [];
  bufferSize: number = 0;
  sensorStats: {
    [sensorId: string]: {
      avg: number;
      min: number;
      max: number;
      values: number[];
    };
  } = {};
 showAnomalies: boolean = true;
  yaxis: any;
  constructor(private signalR: SignalRService, private realtime: EnhancedSignalRServiceService) { }

  ngOnInit(): void {
    this.loadSensor();
   this.signalR.readings$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.updateChartDynamic(data);
    });

  this.signalR.readings$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      data.forEach(sensor => {
        const id = sensor.sensorId;
        if (!this.sensorStats[id]) {
          this.sensorStats[id] = { avg: 0, min: sensor.avg, max: sensor.avg, values: [] };
        }
        const stats = this.sensorStats[id];
        stats.values.push(sensor.avg);
        if (stats.values.length > 100) stats.values.shift();
        stats.avg = stats.values.reduce((a, b) => a + b, 0) / stats.values.length;
        stats.min = Math.min(...stats.values);
        stats.max = Math.max(...stats.values);        
      });
    //  this.realtime.processReadings(data);
    });
     this.signalR.anomalies$
    .pipe(takeUntil(this.destroy$))
    .subscribe(anomalies => {
      anomalies.forEach(anomaly => {
        this.realtime.checkForAnomalies(anomaly); 
      });
    });
    this.realtime.alerts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((a: AnomalyAlert[]) => this.alerts = a);

  }

 private loadSensor(): void {
  this.signalR.getLatestReadings()
    .pipe(takeUntil(this.destroy$))
    .subscribe((data: SensorReading[]) => {
      const sensorGroups: { [key: string]: SensorReading[] } = {};
      
      data.forEach(reading => {
        if (!sensorGroups[reading.sensorId]) {
          sensorGroups[reading.sensorId] = [];
        }
        sensorGroups[reading.sensorId].push(reading);
      });

      const sensorIds = Object.keys(sensorGroups);
      
      // Update each sensor series
      sensorIds.forEach((sensorId, index) => {
        if (index < 3) { // Limit to 3 sensors
          const readings = sensorGroups[sensorId];
          readings.forEach(reading => {
            (this.series[index].data as number[]).push(reading.avg);
          });
        }
      });

      // Update x-axis categories (assuming all sensors have same timestamps)
      if (sensorIds.length > 0) {
        const firstSensorReadings = sensorGroups[sensorIds[0]];
        firstSensorReadings.forEach(reading => {
          this.xaxis.categories!.push(
            new Date(reading.windowEnd).toLocaleTimeString()
          );
        });
      }

      // Keep only last 100 data points
      this.series.forEach(series => {
        if (series.data.length > 100) {
          series.data = (series.data as number[]).slice(-100);
        }
      });
      
      if (this.xaxis.categories && this.xaxis.categories.length > 100) {
        this.xaxis.categories = this.xaxis.categories.slice(-100);
      }
    });
}



private updateChartDynamic(sensorData: SensorReading[]): void {
  const currentTime = new Date().toLocaleTimeString();  
  const groupedData: { [key: string]: number } = {};
  sensorData.forEach(reading => {
    groupedData[reading.sensorId] = reading.min; 
  });  
  const availableSensors = Object.keys(groupedData);
  const sensorOrder = availableSensors.sort((a, b) => groupedData[b] - groupedData[a]);
  sensorOrder.forEach((sensorId, index) => {
     const currentData = this.series[index].data as number[];
      const newData = [...currentData, groupedData[sensorId]];
      
      this.series[index] = {
        ...this.series[index],
        data: newData.slice(-100) 
      };
  }); 
 
  
  // Update X-axis categories (time labels)
  const currentCategories = this.xaxis.categories as string[];
  const newCategories = [...currentCategories, currentTime];
  
  this.xaxis = {
    ...this.xaxis,
    categories: newCategories.slice(-100) 
  };
}


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearAlerts() {
    this.realtime.clearAlerts();
  }
   onAnomaliesToggle(event: any) {
    if (event.checked) {
      this.showAnomalies = true;
    } else {
      this.showAnomalies = false;
    }

}
}
