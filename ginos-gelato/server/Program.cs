using Microsoft.EntityFrameworkCore;
using GinosGelato.Data;
using GinosGelato.Models;
using GinosGelato.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        options.SerializerSettings.Converters.Add(new Newtonsoft.Json.Converters.StringEnumConverter());
    });

// Add Entity Framework
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseInMemoryDatabase("GinosGelatoDb")); // Using in-memory database for simplicity

// Add custom services
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<OrderQueueService>();

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173") // Vite default ports
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Seed demo data for the management dashboard
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    SeedDemoData(db);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();

static void SeedDemoData(ApplicationDbContext db)
{
    if (db.Orders.Any())
        return;

    var now = DateTime.UtcNow;
    var rng = new Random(42);
    var names = new[] { "Alice", "Bob", "Carol", "David", "Eve", "Frank", "Grace", "Hank" };
    var orders = new List<Order>();

    // Historical completed orders spanning the last 14 days
    for (int i = 0; i < 80; i++)
    {
        var daysAgo = rng.Next(1, 15);
        var hour = rng.Next(10, 21);
        var orderDate = now.AddDays(-daysAgo).Date.AddHours(hour).AddMinutes(rng.Next(0, 60));
        var prepMinutes = rng.Next(3, 12);
        var startDelay = rng.Next(1, 4);
        var orderType = (OrderType)rng.Next(0, 2);

        var iceCream = new IceCream
        {
            ContainerType = rng.Next(0, 2) == 0 ? "cone" : "cup",
            Flavors = new List<string> { "Vanilla", "Chocolate" }.Take(rng.Next(1, 3)).ToList(),
            Toppings = new List<string> { "Sprinkles" },
            Price = 4.50m + rng.Next(0, 4) * 0.5m
        };

        orders.Add(new Order
        {
            CustomerName = names[rng.Next(names.Length)],
            IceCreams = new List<IceCream> { iceCream },
            TotalPrice = iceCream.Price,
            OrderDate = orderDate,
            Status = OrderStatus.Completed,
            OrderType = orderType,
            StartedAt = orderDate.AddMinutes(startDelay),
            CompletedAt = orderDate.AddMinutes(startDelay + prepMinutes)
        });
    }

    // A few active orders in the queue right now
    var activeCustomers = new[] { "Iris", "Jack", "Karen", "Leo" };
    for (int i = 0; i < activeCustomers.Length; i++)
    {
        var minutesAgo = rng.Next(2, 15);
        var status = i < 2 ? OrderStatus.InProgress : OrderStatus.Pending;
        var iceCream = new IceCream
        {
            ContainerType = "cup",
            Flavors = new List<string> { "Strawberry" },
            Toppings = new List<string>(),
            Price = 4.50m
        };

        var orderDate = now.AddMinutes(-minutesAgo);
        orders.Add(new Order
        {
            CustomerName = activeCustomers[i],
            IceCreams = new List<IceCream> { iceCream },
            TotalPrice = iceCream.Price,
            OrderDate = orderDate,
            Status = status,
            OrderType = OrderType.Pickup,
            StartedAt = status == OrderStatus.InProgress ? orderDate.AddMinutes(1) : null,
            CompletedAt = null
        });
    }

    db.Orders.AddRange(orders);
    db.SaveChanges();
}