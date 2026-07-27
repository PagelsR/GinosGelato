using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using GinosGelato.Data;
using GinosGelato.Dtos;
using GinosGelato.Models;
using GinosGelato.Services;
using Xunit;

namespace GinosGelato.Tests
{
    public class OrderServiceValidationTests
    {
        private static ApplicationDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var context = new ApplicationDbContext(options);
            context.Flavors.AddRange(
                new Flavor { Id = 1, Name = "Vanilla" },
                new Flavor { Id = 2, Name = "Chocolate" },
                new Flavor { Id = 3, Name = "Strawberry" });
            context.Toppings.AddRange(
                new Topping { Id = 1, Name = "Sprinkles", Price = 0.50m },
                new Topping { Id = 2, Name = "Chocolate Sauce", Price = 0.75m });
            context.SaveChanges();
            return context;
        }

        private static OrderService CreateService(ApplicationDbContext context) =>
            new(context, new PricingService(), NullLogger<OrderService>.Instance);

        private static OrderItemRequest ValidItem() =>
            new("cone", new List<string> { "Vanilla", "Chocolate" }, new List<string> { "Sprinkles" });

        private static CreateOrderRequest ValidRequest(
            string fulfillment = "Pickup",
            List<OrderItemRequest>? items = null,
            string? address = null,
            string? city = null,
            string? state = null,
            string? zip = null) =>
            new(
                CustomerName: "Ada Lovelace",
                Email: "ada@example.com",
                Phone: "555-0100",
                FulfillmentType: fulfillment,
                Address: address,
                City: city,
                State: state,
                ZipCode: zip,
                SpecialInstructions: null,
                Items: items ?? new List<OrderItemRequest> { ValidItem() });

        [Fact]
        public async Task CreateOrder_ValidPickup_SucceedsAndPersists()
        {
            using var context = CreateContext();
            var service = CreateService(context);

            var result = await service.CreateOrderAsync(ValidRequest());

            Assert.True(result.Success);
            Assert.NotNull(result.Order);
            Assert.StartsWith("GG", result.Order!.ConfirmationNumber);
            // cone 2.50 + 2 flavors * 2.00 + sprinkles 0.50 = 7.00
            Assert.Equal(7.00m, result.Order.Subtotal);
            Assert.Equal(0m, result.Order.DeliveryFee);
            Assert.Single(await context.Orders.ToListAsync());
        }

        [Fact]
        public async Task CreateOrder_NoItems_Fails()
        {
            using var context = CreateContext();
            var service = CreateService(context);

            var result = await service.CreateOrderAsync(ValidRequest(items: new List<OrderItemRequest>()));

            Assert.False(result.Success);
            Assert.Contains(result.Errors, e => e.Contains("at least one item"));
        }

        [Fact]
        public async Task CreateOrder_MissingCustomerFields_Fails()
        {
            using var context = CreateContext();
            var service = CreateService(context);
            var request = new CreateOrderRequest("", "", "", "Pickup", null, null, null, null, null,
                new List<OrderItemRequest> { ValidItem() });

            var result = await service.CreateOrderAsync(request);

            Assert.False(result.Success);
            Assert.Contains(result.Errors, e => e.Contains("Customer name"));
            Assert.Contains(result.Errors, e => e.Contains("Email"));
            Assert.Contains(result.Errors, e => e.Contains("Phone"));
        }

        [Fact]
        public async Task CreateOrder_DeliveryWithoutAddress_Fails()
        {
            using var context = CreateContext();
            var service = CreateService(context);

            var result = await service.CreateOrderAsync(ValidRequest(fulfillment: "Delivery"));

            Assert.False(result.Success);
            Assert.Contains(result.Errors, e => e.Contains("Address is required"));
        }

        [Fact]
        public async Task CreateOrder_DeliveryWithAddress_AddsDeliveryFee()
        {
            using var context = CreateContext();
            var service = CreateService(context);

            var result = await service.CreateOrderAsync(ValidRequest(
                fulfillment: "Delivery", address: "1 Main St", city: "Detroit", state: "MI", zip: "48201"));

            Assert.True(result.Success);
            Assert.Equal(PricingService.DeliveryFee, result.Order!.DeliveryFee);
        }

        [Fact]
        public async Task CreateOrder_ShippingWithAddress_AddsShippingFee()
        {
            using var context = CreateContext();
            var service = CreateService(context);

            var result = await service.CreateOrderAsync(ValidRequest(
                fulfillment: "Shipping", address: "1 Main St", city: "Detroit", state: "MI", zip: "48201"));

            Assert.True(result.Success);
            Assert.Equal(PricingService.ShippingFee, result.Order!.ShippingFee);
        }

        [Fact]
        public async Task CreateOrder_UnknownFlavor_Fails()
        {
            using var context = CreateContext();
            var service = CreateService(context);
            var item = new OrderItemRequest("cone", new List<string> { "Rocky Road" }, new List<string>());

            var result = await service.CreateOrderAsync(ValidRequest(items: new List<OrderItemRequest> { item }));

            Assert.False(result.Success);
            Assert.Contains(result.Errors, e => e.Contains("unknown flavor"));
        }

        [Fact]
        public async Task CreateOrder_TooManyFlavors_Fails()
        {
            using var context = CreateContext();
            var service = CreateService(context);
            var item = new OrderItemRequest("cone",
                new List<string> { "Vanilla", "Chocolate", "Strawberry", "Vanilla" }, new List<string>());

            var result = await service.CreateOrderAsync(ValidRequest(items: new List<OrderItemRequest> { item }));

            Assert.False(result.Success);
            Assert.Contains(result.Errors, e => e.Contains("between 1 and 3 flavors"));
        }

        [Fact]
        public async Task CreateOrder_InvalidContainer_Fails()
        {
            using var context = CreateContext();
            var service = CreateService(context);
            var item = new OrderItemRequest("bowl", new List<string> { "Vanilla" }, new List<string>());

            var result = await service.CreateOrderAsync(ValidRequest(items: new List<OrderItemRequest> { item }));

            Assert.False(result.Success);
            Assert.Contains(result.Errors, e => e.Contains("container must be"));
        }

        [Fact]
        public async Task CreateOrder_UnknownFulfillment_Fails()
        {
            using var context = CreateContext();
            var service = CreateService(context);

            var result = await service.CreateOrderAsync(ValidRequest(fulfillment: "Teleport"));

            Assert.False(result.Success);
            Assert.Contains(result.Errors, e => e.Contains("Unknown fulfillment type"));
        }
    }
}
