using Microsoft.EntityFrameworkCore;
using SensorAnalytics.Api.Models;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace SensorAnalytics.Api.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<SensorReading> SensorReadings { get; set; }
        public DbSet<AggregatedStats> AggregatedStats { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<SensorReading>()
                .HasKey(r => r.Id);
            modelBuilder.Entity<SensorReading>()
                .HasIndex(r => r.Timestamp);
            base.OnModelCreating(modelBuilder);
        }
    }
}
