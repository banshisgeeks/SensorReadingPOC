using System.ComponentModel.DataAnnotations;

namespace SensorAnalytics.Api.Models
{
    public class AggregatedStats
    {
        [Key]
        public Guid SensorId { get; set; }
        public DateTime WindowEnd { get; set; }
        public double Avg { get; set; }
        public double Min { get; set; }
        public double Max { get; set; }
        public int Count { get; set; }
    }
}
