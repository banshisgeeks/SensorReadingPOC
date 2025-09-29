using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SensorAnalytics.Api.Data;
using SensorAnalytics.Api.Services;

namespace SensorAnalytics.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReadingsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ProcessingService _proc;

        public ReadingsController(AppDbContext db, ProcessingService proc)
        {
            _db = db;
            _proc = proc;
        }

        [HttpGet("latest")]
        public IActionResult Latest()
        {
            var stats = _proc.SnapshotStats();
            return Ok(stats);
        }

        [HttpGet("query")]
        public async Task<IActionResult> Query([FromQuery] Guid sensorId, [FromQuery] int limit = 100)
        {
            var q = _db.SensorReadings
                .Where(r => r.SensorId == sensorId)
                .OrderByDescending(r => r.Timestamp)
                .Take(limit);
            var res = await q.ToListAsync();
            return Ok(res);
        }
    }
}
