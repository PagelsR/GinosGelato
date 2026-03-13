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

        public OrdersController(OrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(Order order)
        {
            var createdOrder = await _orderService.CreateOrderAsync(order.IceCreams, order.CustomerName, order.OrderType);
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

        [HttpPatch("{id}/status")]
        public async Task<ActionResult<Order>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            var order = await _orderService.UpdateOrderStatusAsync(id, request.Status);
            if (order == null)
            {
                return NotFound();
            }
            return Ok(order);
        }
    }

    public record UpdateOrderStatusRequest(OrderStatus Status);
}
