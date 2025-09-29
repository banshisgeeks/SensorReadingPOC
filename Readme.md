# Real-Time Sensor Analytics Dashboard (POC)

## Overview
This Proof of Concept demonstrates a **real-time analytics dashboard** for streaming IoT-style sensor data.  

The system:
- Simulates **1000 sensor readings per second** from 3 sensors
- Processes and stores the latest **100,000 readings in memory**
- Detects anomalies (sudden spikes/drops)
- Streams live data and alerts to a **real-time Angular dashboard** via **SignalR**

The goal is to prove that the backend + frontend can handle high-frequency streaming and display live insights at scale.

---

## Architecture

### Backend (.NET 9)
- **ASP.NET Core Web API**
- **SignalR** → Real-time communication with frontend
- **Channel\<T\>** → Internal pipeline for high-throughput ingestion
- **Circular Buffer** → Keeps a sliding window of 100,000 recent readings
- **Background Services**:
  - `SensorSimulatorService` → generates 1000 readings/sec with 5% anomalies
  - `ProcessingService` → consumes readings, calculates metrics, broadcasts via SignalR
  - `DataRetentionService` (planned) → auto-purges data older than 24h
- **AnomalyDetector** → flags unusual values (spikes) using simple thresholds

### Frontend (Angular 19)
- **Angular Standalone Components**
- **SignalR client** for real-time data
- **ApexCharts** for live time-series visualization
- **PrimeNG** for UI components (cards, alerts)
- **UI Layout**:
  - KPI Cards → Avg / Min / Max per sensor
  - Live Charts → One per sensor, auto-updating
  - Alerts Panel → Displays anomalies in real-time

---

## Data Flow
1. **Simulator generates data**  
   → 1000 readings/sec pushed into a Channel.
2. **Processor consumes channel**  
   → Stores in circular buffer, aggregates, runs anomaly detection.
3. **SignalR Hub broadcasts**  
   → Sends batches of metrics and anomalies to all connected clients.
4. **Angular frontend displays**  
   → Charts, KPIs, and alerts update instantly.

---

## Endpoints
- `GET /api/sensors/latest` → Snapshot of current statistics (for debugging or cold start)
- **SignalR Hub `/sensorhub`**:
  - `batch` → periodic aggregated readings
  - `anomaly` → anomaly alerts

---

## How to Run

### Backend
```bash
cd SensorAnalytics.Api
dotnet run

### Frontend

cd SensorAnalytics.UI
npm install 
### If you encounter dependency errors, use:
npm install --legacy-peer-deps
ng serve
