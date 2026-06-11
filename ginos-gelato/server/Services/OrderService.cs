using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using GinosGelato.Data;
using GinosGelato.Models;

namespace GinosGelato.Services
{
    public class OrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly OrderQueueService _orderQueueService;

        public OrderService(ApplicationDbContext context, OrderQueueService orderQueueService)
        {
            _context = context;
            _orderQueueService = orderQueueService;
        }

        public async Task<Order> CreateOrderAsync(List<IceCream> iceCreams)
        {
            var order = new Order
            {
                IceCreams = iceCreams,
                TotalPrice = iceCreams.Sum(ic => ic.Price),
                OrderDate = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            _orderQueueService.EnqueueOrder(order.Id);

            return order;
        }

        public async Task<List<Order>> GetOrdersAsync()
        {
            return await _context.Orders.ToListAsync();
        }

        public async Task<Order?> GetOrderByIdAsync(int orderId)
        {
            return await _context.Orders.FindAsync(orderId);
        }
    }
}