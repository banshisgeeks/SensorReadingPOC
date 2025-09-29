import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { SensorQueryReading, SensorReading } from '../Model/reading';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  constructor(private http: HttpClient) {}
   private apiUrl = 'https://localhost:44355';
  private hubConnection!: signalR.HubConnection;

  public readings$ = new BehaviorSubject<any[]>([]);
  public anomalies$ = new BehaviorSubject<any[]>([]);

  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/sensorHub`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('SignalR Connection Error:', err));

    this.hubConnection.on('batch', (data) => {
      this.readings$.next(data);
      console.log('batch',data);
    });

    this.hubConnection.on('anomaly', (data) => {
      const current = this.anomalies$.value;
            console.log('anomaly', data);

      this.anomalies$.next([data, ...current].slice(0, 50)); // keep last 50 anomalies
    });
  }

   getLatestReadings(): Observable<SensorReading[]> {
    const a = (`${this.apiUrl}api/readings/latest`);
    return this.http.get<SensorReading[]>(`${this.apiUrl}/api/readings/latest`);
  }
  getReadings(sensorId: string, limit: number = 100): Observable<SensorQueryReading[]> {
    const params = new HttpParams()
      .set('sensorId', sensorId)
      .set('limit', limit);

    return this.http.get<SensorQueryReading[]>(`${this.apiUrl}api/Readings`, { params });
  }
}
