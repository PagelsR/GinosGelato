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
        /// Returns the current queue status, including the number of pending orders
        /// and the estimated wait time in minutes.
        /// </summary>
        [HttpGet("status")]
        public ActionResult<QueueStatusResponse> GetQueueStatus()
        {
            return Ok(_orderQueueService.GetQueueStatus());
        }

        /// <summary>
        /// Returns the average preparation time in minutes based on completed orders.
        /// </summary>
        [HttpGet("averagetime")]
        public ActionResult<double> GetAveragePreparationTime()
        {
            return Ok(_orderQueueService.GetAveragePreparationTimeMinutes());
        }

        /// <summary>
        /// Returns all queue entries (pending and completed).
        /// </summary>
        [HttpGet]
        public ActionResult<IEnumerable<OrderQueueEntry>> GetQueueEntries()
        {
            return Ok(_orderQueueService.GetAllEntries());
        }

        /// <summary>
        /// Marks an order as completed, recording its actual preparation time.
        /// </summary>
        [HttpPost("{orderId}/complete")]
        public ActionResult CompleteOrder(int orderId)
        {
            var success = _orderQueueService.CompleteOrder(orderId);
            if (!success)
            {
                return NotFound(new { message = $"Pending order with id {orderId} not found in queue." });
            }
            return NoContent();
        }
    }
}
