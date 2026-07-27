using Microsoft.EntityFrameworkCore;
using GinosGelato.Data;
using GinosGelato.Dtos;
using GinosGelato.Models;

namespace GinosGelato.Services
{
    /// <summary>Result of validating and creating an order.</summary>
    public class OrderResult
    {
        public bool Success { get; init; }
        public List<string> Errors { get; init; } = new();
        public Order? Order { get; init; }

        public static OrderResult Failed(params string[] errors) =>
            new() { Success = false, Errors = errors.ToList() };

        public static OrderResult Succeeded(Order order) =>
            new() { Success = true, Order = order };
    }

    public class OrderService
    {
        private const int MinFlavors = 1;
        private const int MaxFlavors = 3;

        private readonly ApplicationDbContext _context;
        private readonly PricingService _pricing;
        private readonly ILogger<OrderService> _logger;

        public OrderService(ApplicationDbContext context, PricingService pricing, ILogger<OrderService> logger)
        {
            _context = context;
            _pricing = pricing;
            _logger = logger;
        }

        public async Task<OrderResult> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.CustomerName))
            {
                errors.Add("Customer name is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                errors.Add("Email is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Phone))
            {
                errors.Add("Phone is required.");
            }

            if (!TryParseFulfillment(request.FulfillmentType, out var fulfillmentType))
            {
                errors.Add($"Unknown fulfillment type: '{request.FulfillmentType}'. Expected Pickup, Delivery, or Shipping.");
            }

            if (fulfillmentType is FulfillmentType.Delivery or FulfillmentType.Shipping)
            {
                if (string.IsNullOrWhiteSpace(request.Address)) errors.Add("Address is required for delivery and shipping.");
                if (string.IsNullOrWhiteSpace(request.City)) errors.Add("City is required for delivery and shipping.");
                if (string.IsNullOrWhiteSpace(request.State)) errors.Add("State is required for delivery and shipping.");
                if (string.IsNullOrWhiteSpace(request.ZipCode)) errors.Add("ZIP code is required for delivery and shipping.");
            }

            if (request.Items is null || request.Items.Count == 0)
            {
                errors.Add("An order must contain at least one item.");
                return OrderResult.Failed(errors.ToArray());
            }

            // Load catalog once for validation and pricing.
            var toppingsByName = await _context.Toppings
                .AsNoTracking()
                .ToDictionaryAsync(t => t.Name.ToLower(), cancellationToken);
            var flavorNames = await _context.Flavors
                .AsNoTracking()
                .Select(f => f.Name.ToLower())
                .ToListAsync(cancellationToken);
            var flavorSet = flavorNames.ToHashSet();

            var orderItems = new List<OrderItem>();

            for (var index = 0; index < request.Items.Count; index++)
            {
                var item = request.Items[index];
                var position = index + 1;

                var container = PricingService.NormalizeContainer(item.Container);
                if (container is not ("cone" or "cup"))
                {
                    errors.Add($"Item {position}: container must be 'cone' or 'cup'.");
                    continue;
                }

                var flavors = item.Flavors ?? new List<string>();
                if (flavors.Count < MinFlavors || flavors.Count > MaxFlavors)
                {
                    errors.Add($"Item {position}: choose between {MinFlavors} and {MaxFlavors} flavors.");
                }

                foreach (var flavor in flavors)
                {
                    if (!flavorSet.Contains(flavor.Trim().ToLower()))
                    {
                        errors.Add($"Item {position}: unknown flavor '{flavor}'.");
                    }
                }

                var toppings = item.Toppings ?? new List<string>();
                var toppingPrices = new List<decimal>();
                foreach (var topping in toppings)
                {
                    if (toppingsByName.TryGetValue(topping.Trim().ToLower(), out var match))
                    {
                        toppingPrices.Add(match.Price > 0 ? match.Price : PricingService.DefaultToppingPrice);
                    }
                    else
                    {
                        errors.Add($"Item {position}: unknown topping '{topping}'.");
                    }
                }

                if (errors.Count == 0)
                {
                    orderItems.Add(new OrderItem
                    {
                        Container = container,
                        Flavors = flavors.Select(f => f.Trim()).ToList(),
                        Toppings = toppings.Select(t => t.Trim()).ToList(),
                        LinePrice = _pricing.CalculateLinePrice(container, flavors.Count, toppingPrices)
                    });
                }
            }

            if (errors.Count > 0)
            {
                return OrderResult.Failed(errors.ToArray());
            }

            var totals = _pricing.CalculateOrderTotals(orderItems.Select(i => i.LinePrice), fulfillmentType);

            var order = new Order
            {
                CustomerName = request.CustomerName.Trim(),
                Email = request.Email.Trim(),
                Phone = request.Phone.Trim(),
                FulfillmentType = fulfillmentType,
                Address = request.Address?.Trim(),
                City = request.City?.Trim(),
                State = request.State?.Trim(),
                ZipCode = request.ZipCode?.Trim(),
                SpecialInstructions = request.SpecialInstructions?.Trim(),
                Items = orderItems,
                Subtotal = totals.Subtotal,
                Tax = totals.Tax,
                DeliveryFee = totals.DeliveryFee,
                ShippingFee = totals.ShippingFee,
                Total = totals.Total,
                Status = OrderStatus.Received,
                OrderDate = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync(cancellationToken);

            order.ConfirmationNumber = $"GG{order.OrderDate:yyMMdd}-{order.Id:D5}";
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Created order {ConfirmationNumber} with {ItemCount} item(s), total {Total:C}.",
                order.ConfirmationNumber, order.Items.Count, order.Total);

            return OrderResult.Succeeded(order);
        }

        public async Task<Order?> GetOrderByIdAsync(int orderId, CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .Include(o => o.Items)
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
        }

        public async Task<List<Order>> GetOrdersAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .Include(o => o.Items)
                .AsNoTracking()
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync(cancellationToken);
        }

        private static bool TryParseFulfillment(string? value, out FulfillmentType fulfillmentType)
        {
            return Enum.TryParse(value, ignoreCase: true, out fulfillmentType)
                && Enum.IsDefined(fulfillmentType);
        }
    }
}