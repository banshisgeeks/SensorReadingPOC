using Microsoft.EntityFrameworkCore;
using SensorAnalytics.Api.Data;
using System;

namespace SensorAnalytics.Api.Services
{
    public class DataRetentionService : BackgroundService
    {
        private readonly IServiceProvider _sp;
        private readonly ILogger<DataRetentionService> _logger;

        public DataRetentionService(IServiceProvider sp, ILogger<DataRetentionService> logger)
        {
            _sp = sp;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Data retention service started");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _sp.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var cutoff = DateTime.UtcNow.AddHours(-24);
                    // batched delete to avoid locking too much
                    var batchSize = 10000;
                    while (true)
                    {
                        var toDelete = await db.SensorReadings
                            .Where(r => r.Timestamp < cutoff)
                            .OrderBy(r => r.Timestamp)
                            .Take(batchSize)
                            .ToListAsync(stoppingToken);

                        if (toDelete.Count == 0) break;
                        db.SensorReadings.RemoveRange(toDelete);
                        await db.SaveChangesAsync(stoppingToken);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Retention job failed");
                }

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken); // run every 5 minutes
            }
        }
    }

}
