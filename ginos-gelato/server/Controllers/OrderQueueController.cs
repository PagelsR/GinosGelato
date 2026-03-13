using Microsoft.AspNetCore.Mvc;
using GinosGelato.Models;
using GinosGelato.Services;

namespace GinosGelato.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderQueueController : ControllerBase
    {
        private readonly OrderQueueService _queueService;

        public OrderQueueController(OrderQueueService queueService)
        {
            _queueService = queueService;
        }

        /// <summary>
        /// Returns the current queue status including pending order count
        /// and estimated wait time for a new order.
        /// </summary>
        [HttpGet("status")]
        public ActionResult<QueueStatusResponse> GetQueueStatus()
        {
            var response = new QueueStatusResponse
            {
                PendingOrderCount = _queueService.GetPendingOrderCount(),
                EstimatedWaitMinutes = _queueService.GetEstimatedWaitMinutes(),
                AveragePrepTimeMinutes = _queueService.GetAveragePrepTimeMinutes()
            };
            return Ok(response);
        }

        /// <summary>
        /// Returns the average preparation time across all completed orders.
        /// Returns 204 No Content when no orders have been completed yet.
        /// </summary>
        [HttpGet("average-prep-time")]
        public ActionResult<AveragePrepTimeResponse> GetAveragePrepTime()
        {
            var avg = _queueService.GetAveragePrepTimeMinutes();
            if (avg == null)
                return NoContent();

            return Ok(new AveragePrepTimeResponse { AveragePrepTimeMinutes = avg.Value });
        }

        /// <summary>
        /// Marks an order as completed so its preparation time is recorded
        /// and factored into future wait-time estimates.
        /// </summary>
        [HttpPost("{id}/complete")]
        public ActionResult CompleteOrder(int id)
        {
            var completed = _queueService.CompleteOrder(id);
            if (!completed)
                return NotFound($"Order {id} was not found in the queue.");

            return NoContent();
        }
    }
}

