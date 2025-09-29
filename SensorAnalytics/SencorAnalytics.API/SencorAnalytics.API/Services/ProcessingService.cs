using Microsoft.AspNetCore.SignalR;
using SensorAnalytics.Api.Models;
using System.Collections.Concurrent;
using System.Threading.Channels;
using System;
using SensorAnalytics.Api.Hubs;
using SensorAnalytics.Api.Data;

namespace SensorAnalytics.Api.Services
{
    public class ProcessingService : BackgroundService
    {
        private readonly ChannelReader<SensorReading> _reader;
        private readonly CircularBuffer<SensorReading> _buffer;
        private readonly AnomalyDetector _detector;
        private readonly IServiceProvider _sp;
        private readonly ILogger<ProcessingService> _logger;
        private readonly IHubContext<SensorHub> _hub;

        // temporary history per sensor to compute z-score
        private readonly ConcurrentDictionary<Guid, List<double>> _history = new();

        public ProcessingService(ChannelReader<SensorReading> reader,
            CircularBuffer<SensorReading> buffer,
            AnomalyDetector detector,
            IServiceProvider sp,
            ILogger<ProcessingService> logger,
            IHubContext<SensorHub> hub)
        {
            _reader = reader;
            _buffer = buffer;
            _detector = detector;
            _sp = sp;
            _logger = logger;
            _hub = hub;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Processing service started");
            var writeBatch = new List<SensorReading>(500);
            var broadcastBatch = new List<SensorReading>(200);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var item = await _reader.ReadAsync(stoppingToken);
                    // store to circular buffer
                    _buffer.Add(item);

                    // history maintenance
                    var hist = _history.GetOrAdd(item.SensorId, _ => new List<double>());
                    lock (hist)
                    {
                        hist.Add(item.Value);
                        if (hist.Count > 500) hist.RemoveRange(0, hist.Count - 500);
                    }

                    // anomaly check
                    bool isAnomaly;
                    lock (hist)
                    {
                       // isAnomaly = _detector.IsAnomaly(hist, item.Value);
                       isAnomaly = true;
                    }
                    if (isAnomaly)
                    {
                        // notify hub
                        await _hub.Clients.All.SendAsync("anomaly", new { sensorId = item.SensorId, value = item.Value, timestamp = item.Timestamp });
                    }

                    // batching for DB writes
                    writeBatch.Add(item);
                    broadcastBatch.Add(item);

                    if (writeBatch.Count >= 200)
                    {
                        // batch write to DB using scoped context
                        using var scope = _sp.CreateScope();
                        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        db.SensorReadings.AddRange(writeBatch);
                        await db.SaveChangesAsync(stoppingToken);
                        writeBatch.Clear();
                    }

                    if (broadcastBatch.Count >= 100)
                    {
                        // group by sensor and send aggregated snapshot
                        var bySensor = broadcastBatch.GroupBy(r => r.SensorId)
                            .Select(g => new
                            {
                                sensorId = g.Key,
                                avg = g.Average(x => x.Value),
                                min = g.Min(x => x.Value),
                                max = g.Max(x => x.Value),
                                count = g.Count(),
                                lastTimestamp = g.Max(x => x.Timestamp)
                            });
                        await _hub.Clients.All.SendAsync("batch", bySensor);
                        broadcastBatch.Clear();
                    }
                }
                catch (OperationCanceledException) { break; }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Processing error");
                }
            }

            // flush residuals on stop
            if (writeBatch.Count > 0)
            {
                using var scope = _sp.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.SensorReadings.AddRange(writeBatch);
                await db.SaveChangesAsync(CancellationToken.None);
            }

            _logger.LogInformation("Processing service stopped");
        }

        // optional helper method: snapshot stats
        public AggregatedStats[] SnapshotStats()
        {
            var snapshot = _buffer.Snapshot();
            var groups = snapshot.GroupBy(s => s.SensorId)
                .Select(g => new AggregatedStats
                {
                    SensorId = g.Key,
                    Count = g.Count(),
                    Avg = g.Average(x => x.Value),
                    Min = g.Min(x => x.Value),
                    Max = g.Max(x => x.Value),
                    WindowEnd = DateTime.UtcNow
                }).ToArray();
            return groups;
        }
    }

}
