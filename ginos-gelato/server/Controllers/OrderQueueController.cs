using Microsoft.AspNetCore.Mvc;
using GinosGelato.Models;
using GinosGelato.Services;

namespace GinosGelato.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderQueueController : ControllerBase
    {
        private readonly OrderQueueService _orderQueueService;

        public OrderQueueController(OrderQueueService orderQueueService)
        {
            _orderQueueService = orderQueueService;
        }

        /// <summary>
        /// Returns the current queue status including pending order count,
        /// in-progress order count, and estimated wait time for new customers.
        /// </summary>
        [HttpGet("status")]
        public ActionResult<QueueStatus> GetQueueStatus()
        {
            var status = _orderQueueService.GetQueueStatus();
            return Ok(status);
        }

        /// <summary>
        /// Returns the average preparation time (in minutes) based on historical order data.
        /// Uses actual completion times when available; falls back to estimates otherwise.
        /// </summary>
        [HttpGet("averagetime")]
        public ActionResult<double> GetAveragePrepTime()
        {
            var avgTime = _orderQueueService.GetAveragePrepTime();
            return Ok(avgTime);
        }

        /// <summary>
        /// Marks an order as completed so store staff can update the queue
        /// and the average preparation time statistics stay accurate.
        /// </summary>
        [HttpPost("{id}/complete")]
        public ActionResult CompleteOrder(int id)
        {
            var success = _orderQueueService.CompleteOrder(id);
            if (!success)
                return NotFound(new { message = $"Order {id} was not found in the queue." });

            return NoContent();
        }
    }
}
