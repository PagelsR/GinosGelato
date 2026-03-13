using Microsoft.AspNetCore.Mvc;
using GinosGelato.Models;
using GinosGelato.Services;

namespace GinosGelato.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QueueController : ControllerBase
    {
        private readonly OrderQueueService _queueService;

        public QueueController(OrderQueueService queueService)
        {
            _queueService = queueService;
        }

        /// <summary>Returns current queue stats including active orders and estimated wait time.</summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetQueueStats()
        {
            var stats = await _queueService.GetQueueStatsAsync();
            return Ok(stats);
        }

        /// <summary>Returns average preparation time for the last 24 hours, optionally filtered by order type.</summary>
        [HttpGet("average-prep-time")]
        public async Task<IActionResult> GetAveragePrepTime([FromQuery] OrderType? orderType = null)
        {
            var minutes = await _queueService.GetAveragePrepTimeAsync(orderType);
            return Ok(new { averagePrepTimeMinutes = minutes, orderType });
        }

        /// <summary>Returns order volume and average wait time grouped by hour of day.</summary>
        [HttpGet("peak-hours")]
        public async Task<IActionResult> GetPeakHours([FromQuery] int days = 7)
        {
            var data = await _queueService.GetPeakHoursAsync(days);
            return Ok(data);
        }

        /// <summary>Returns daily order metrics for the given number of past days.</summary>
        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] int days = 30)
        {
            var metrics = await _queueService.GetHistoricalMetricsAsync(days);
            return Ok(metrics);
        }

        /// <summary>Downloads a CSV report of all orders in the given date range.</summary>
        [HttpGet("export/csv")]
        public async Task<IActionResult> ExportCsv([FromQuery] int days = 30)
        {
            var csvBytes = await _queueService.ExportToCsvAsync(days);
            var filename = $"orders-{DateTime.UtcNow:yyyy-MM-dd}.csv";
            return File(csvBytes, "text/csv", filename);
        }
    }
}
