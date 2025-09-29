using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SensorAnalytics.Api.Data;
using SensorAnalytics.Api.Hubs;
using SensorAnalytics.Api.Models;
using SensorAnalytics.Api.Services;
using System.Threading.Channels;

var builder = WebApplication.CreateBuilder(args);

// Configuration for Postgres
var conn = builder.Configuration.GetConnectionString("DefaultConnection");

// Add services
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(conn));
builder.Services.AddCors(options =>
{
    options.AddPolicy("",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Needed for SignalR
        });
});


// Single channel for producer -> consumer
var channel = Channel.CreateUnbounded<SensorReading>();
builder.Services.AddSingleton(channel.Reader);
builder.Services.AddSingleton(channel.Writer);

// Circular buffer capacity 100k
builder.Services.AddSingleton(new CircularBuffer<SensorReading>(100_000));
builder.Services.AddSingleton(new AnomalyDetector(3.0));

// Processing service and simulator
builder.Services.AddHostedService<SensorSimulatorHostedService>(sp =>
{
    var writer = sp.GetRequiredService<ChannelWriter<SensorReading>>();
    var logger = sp.GetRequiredService<ILogger<SensorSimulatorHostedService>>();
    return new SensorSimulatorHostedService(writer, logger);
});
builder.Services.AddSingleton<ProcessingService>(sp =>
{
    var reader = sp.GetRequiredService<ChannelReader<SensorReading>>();
    var buffer = sp.GetRequiredService<CircularBuffer<SensorReading>>();
    var detector = sp.GetRequiredService<AnomalyDetector>();
    var logger = sp.GetRequiredService<ILogger<ProcessingService>>();
    var hub = sp.GetRequiredService<IHubContext<SensorHub>>();
    return new ProcessingService(reader, buffer, detector, sp, logger, hub);
});
builder.Services.AddHostedService(sp => sp.GetRequiredService<ProcessingService>());

builder.Services.AddHostedService<DataRetentionService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("");
app.MapControllers();
app.MapHub<SensorHub>("/sensorHub");

app.Run();
