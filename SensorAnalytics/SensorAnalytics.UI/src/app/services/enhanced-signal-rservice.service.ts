
// services/enhanced-signalr.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnomalyAlert, DataPoint, SensorReading } from '../Model/reading';

@Injectable({
  providedIn: 'root'
})
export class EnhancedSignalRServiceService {
 
  private alerts = new BehaviorSubject<AnomalyAlert[]>([]);

  alerts$ = this.alerts.asObservable();


  constructor() {}  
// processReadings(data: SensorReading[]) {
//   data.forEach(reading => {
//     this.checkForAnomalies(reading);
//   });
// }
   checkForAnomalies(reading: any) {
    if (reading.value > reading.max*1.2 ) {
      this.createAlert(reading.sensorId, reading.avg, reading.max, 'SPIKE', 'CRITICAL');
    }
    if (reading.value > 100) {
      this.createAlert(reading.sensorId, reading.avg, 150, 'HIGH', 'WARNING');
    }
    if (reading.value < 10) {
      this.createAlert(reading.sensorId, reading.avg, 10, 'LOW', 'WARNING');
    }
  }

  private createAlert(
    sensorId: string,
    value: number,
    threshold: number,
    type: 'HIGH' | 'LOW' | 'SPIKE',
    severity: 'WARNING' | 'CRITICAL'
  ) {
    const alert: AnomalyAlert = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      sensorId,
      timestamp: new Date(),
      value,
      threshold,
      type,
      severity
    };
    const currentAlerts = this.alerts.value;
    const newAlerts = [alert, ...currentAlerts.slice(0, 49)];
    this.alerts.next(newAlerts);
  }

  clearAlerts() {
    this.alerts.next([]);
  }
 
}
