using Microsoft.AspNetCore.Mvc;
using GinosGelato.Models;
using GinosGelato.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GinosGelato.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly OrderService _orderService;
        private readonly OrderQueueService _orderQueueService;

        public OrdersController(OrderService orderService, OrderQueueService orderQueueService)
        {
            _orderService = orderService;
            _orderQueueService = orderQueueService;
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(Order order)
        {
            var createdOrder = await _orderService.CreateOrderAsync(order.IceCreams);
            _orderQueueService.EnqueueOrder(createdOrder.Id, createdOrder.IceCreams.Count);
            return CreatedAtAction(nameof(GetOrder), new { id = createdOrder.Id }, createdOrder);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null)
            {
                return NotFound();
            }
            return order;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            var orders = await _orderService.GetOrdersAsync();
            return Ok(orders);
        }
    }
}