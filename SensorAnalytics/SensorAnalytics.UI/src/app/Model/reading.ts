export interface SensorReading {
  sensorId: string;
  windowEnd: string;  
  avg: number;
  min: number;
  max: number;
  count: number;
}

export interface SensorQueryReading {
  id: number;
  sensorId: string;
  value: number;
  timestamp: string;  
  metadata: string;
}


export interface DataPoint {
  timestamp: Date;
  value: number;
  sensorId: string;
}

export interface AnomalyAlert {
  id: string;
  sensorId: string;
  timestamp: Date;
  value: number;
  threshold: number;
  type: 'HIGH' | 'LOW' | 'SPIKE';
  severity: 'WARNING' | 'CRITICAL';
}