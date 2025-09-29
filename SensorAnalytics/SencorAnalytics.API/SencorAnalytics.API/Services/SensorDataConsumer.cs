using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Threading.Channels;

namespace SensorAnalytics.Api.Services
{
    public class SensorDataConsumer
    {
        private readonly AsyncEventingBasicConsumer _consumer;
        private readonly IChannel _channel;

        public SensorDataConsumer(AsyncEventingBasicConsumer consumer, IChannel channel)
        {
            this._consumer = consumer;
            this._channel = channel;
            consumer.ReceivedAsync += ReceivedSensorDataAsync;
        }
        private Task ReceivedSensorDataAsync(object model, BasicDeliverEventArgs ea)
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            Console.WriteLine($" [x] Received {message}");
            return Task.CompletedTask;
        }

        public async Task StartConsuming()
        {
            await _channel.BasicConsumeAsync(queue: "SensorReadingDataQueue", autoAck: true, consumer: _consumer);
        }
    }
}
