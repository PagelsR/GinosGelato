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

        public OrderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Order> CreateOrderAsync(List<IceCream> iceCreams, string customerName = "", OrderType orderType = OrderType.Pickup)
        {
            var order = new Order
            {
                CustomerName = customerName,
                IceCreams = iceCreams,
                TotalPrice = iceCreams.Sum(ic => ic.Price),
                OrderDate = DateTime.UtcNow,
                Status = OrderStatus.Pending,
                OrderType = orderType
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return order;
        }

        public async Task<List<Order>> GetOrdersAsync()
        {
            return await _context.Orders.Include(o => o.IceCreams).ToListAsync();
        }

        public async Task<Order?> GetOrderByIdAsync(int orderId)
        {
            return await _context.Orders.Include(o => o.IceCreams).FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<Order?> UpdateOrderStatusAsync(int orderId, OrderStatus status)
        {
            var order = await _context.Orders.Include(o => o.IceCreams).FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null)
                return null;

            order.Status = status;

            if (status == OrderStatus.InProgress && order.StartedAt == null)
                order.StartedAt = DateTime.UtcNow;
            else if (status == OrderStatus.Completed && order.CompletedAt == null)
                order.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return order;
        }
    }
}