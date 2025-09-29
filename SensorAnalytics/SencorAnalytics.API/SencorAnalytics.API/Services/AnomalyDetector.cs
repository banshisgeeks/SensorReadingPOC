namespace SensorAnalytics.Api.Services
{
    public class AnomalyDetector
    {
        // Simple z-score based detector; configurable threshold
        private readonly double _zThreshold;

        public AnomalyDetector(double zThreshold = 3.0)
        {
            _zThreshold = zThreshold;
        }

        public bool IsAnomaly(IEnumerable<double> history, double value)
        {
            var arr = history as double[] ?? history.ToArray();
            if (arr.Length < 5) return false; // not enough data
            var mean = arr.Average();
            var variance = arr.Select(v => Math.Pow(v - mean, 2)).Average();
            var stdev = Math.Sqrt(variance);
            if (stdev == 0) return false;
            var z = Math.Abs((value - mean) / stdev);
            return z >= _zThreshold;
        }
    }
}
