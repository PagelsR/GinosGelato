using Microsoft.AspNetCore.Mvc;
using GinosGelato.Dtos;
using GinosGelato.Models;
using GinosGelato.Services;

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
        [ProducesResponseType(typeof(OrderResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OrderResponse>> CreateOrder([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
        {
            var result = await _orderService.CreateOrderAsync(request, cancellationToken);
            if (!result.Success || result.Order is null)
            {
                return BadRequest(new { errors = result.Errors });
            }

            var response = ToResponse(result.Order);
            return CreatedAtAction(nameof(GetOrder), new { id = result.Order.Id }, response);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(OrderResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<OrderResponse>> GetOrder(int id, CancellationToken cancellationToken)
        {
            var order = await _orderService.GetOrderByIdAsync(id, cancellationToken);
            if (order is null)
            {
                return NotFound();
            }
            return Ok(ToResponse(order));
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OrderResponse>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<OrderResponse>>> GetOrders(CancellationToken cancellationToken)
        {
            var orders = await _orderService.GetOrdersAsync(cancellationToken);
            return Ok(orders.Select(ToResponse));
        }

        private static OrderResponse ToResponse(Order order) => new(
            order.Id,
            order.ConfirmationNumber,
            order.CustomerName,
            order.FulfillmentType.ToString(),
            order.Subtotal,
            order.Tax,
            order.DeliveryFee,
            order.ShippingFee,
            order.Total,
            order.Status.ToString(),
            order.OrderDate,
            order.Items.Select(i => new OrderItemResponse(i.Container, i.Flavors, i.Toppings, i.LinePrice)).ToList());
    }
}