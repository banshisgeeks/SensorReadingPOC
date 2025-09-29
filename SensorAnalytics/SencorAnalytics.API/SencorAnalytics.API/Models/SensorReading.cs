namespace SensorAnalytics.Api.Models
{
    public class SensorReading
    {
        public long Id { get; set; }
        public Guid SensorId { get; set; }
        public double Value { get; set; }
        public DateTime Timestamp { get; set; }
        public string Metadata { get; set; } = "";
    }
}
