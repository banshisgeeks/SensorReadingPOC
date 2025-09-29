using SensorAnalytics.Api.Models;
using System.Threading.Channels;

namespace SensorAnalytics.Api.Services
{
    public class SensorSimulatorHostedService : BackgroundService
    {
        private readonly ChannelWriter<SensorReading> _writer;
        private readonly ILogger<SensorSimulatorHostedService> _logger;
        private readonly Random _rng = new();

        public SensorSimulatorHostedService(ChannelWriter<SensorReading> writer, ILogger<SensorSimulatorHostedService> logger)
        {
            _writer = writer;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // We'll produce in batches of 100 every 100ms -> ~1000/s
            var sensors = new[] {
                Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Guid.Parse("33333333-3333-3333-3333-333333333333")
            };

            _logger.LogInformation("Sensor simulator started");

            while (!stoppingToken.IsCancellationRequested)
            {
                var batchSize = 100; // 100 per 100ms
                for (int i = 0; i < batchSize; i++)
                {
                    var sensorId = sensors[_rng.Next(sensors.Length)];
                    var baseValue = sensorId == sensors[0] ? 20.0 : sensorId == sensors[1] ? 100.0 : 50.0;
                    var noise = (_rng.NextDouble() - 0.5) * 2.0; // +/-1
                    var value = baseValue + Math.Sin(DateTime.UtcNow.Ticks / 1e7 + i) * 0.5 + noise;
                    var r = new SensorReading
                    {
                        SensorId = sensorId,
                        Timestamp = DateTime.UtcNow,
                        Value = value,
                        Metadata = ""
                    };
                    await _writer.WriteAsync(r, stoppingToken);
                }
                await Task.Delay(100, stoppingToken); // sleep 100ms -> ~1000/sec
            }
            _logger.LogInformation("Sensor simulator stopping");
        }
    }

}
