using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using GinosGelato.Models;

namespace GinosGelato.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Flavor> Flavors => Set<Flavor>();
        public DbSet<Topping> Toppings => Set<Topping>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Store string collections as a single delimited column.
            var splitter = new ValueConverter<List<string>, string>(
                v => string.Join('|', v),
                v => string.IsNullOrEmpty(v)
                    ? new List<string>()
                    : v.Split('|', StringSplitOptions.RemoveEmptyEntries).ToList());

            var comparer = new ValueComparer<List<string>>(
                (a, b) => (a ?? new List<string>()).SequenceEqual(b ?? new List<string>()),
                v => v.Aggregate(0, (hash, s) => HashCode.Combine(hash, s.GetHashCode())),
                v => v.ToList());

            modelBuilder.Entity<Order>(entity =>
            {
                entity.Property(o => o.CustomerName).HasMaxLength(200).IsRequired();
                entity.Property(o => o.Email).HasMaxLength(256).IsRequired();
                entity.Property(o => o.Phone).HasMaxLength(50).IsRequired();
                entity.Property(o => o.ConfirmationNumber).HasMaxLength(50);
                entity.Property(o => o.Address).HasMaxLength(300);
                entity.Property(o => o.City).HasMaxLength(100);
                entity.Property(o => o.State).HasMaxLength(100);
                entity.Property(o => o.ZipCode).HasMaxLength(20);
                entity.Property(o => o.SpecialInstructions).HasMaxLength(1000);
                entity.Property(o => o.FulfillmentType).HasConversion<string>().HasMaxLength(20);
                entity.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
                entity.Property(o => o.Subtotal).HasColumnType("decimal(10,2)");
                entity.Property(o => o.Tax).HasColumnType("decimal(10,2)");
                entity.Property(o => o.DeliveryFee).HasColumnType("decimal(10,2)");
                entity.Property(o => o.ShippingFee).HasColumnType("decimal(10,2)");
                entity.Property(o => o.Total).HasColumnType("decimal(10,2)");
                entity.HasMany(o => o.Items)
                      .WithOne(i => i.Order!)
                      .HasForeignKey(i => i.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.Property(i => i.Container).HasMaxLength(20).IsRequired();
                entity.Property(i => i.LinePrice).HasColumnType("decimal(10,2)");
                entity.Property(i => i.Flavors)
                      .HasConversion(splitter)
                      .Metadata.SetValueComparer(comparer);
                entity.Property(i => i.Toppings)
                      .HasConversion(splitter)
                      .Metadata.SetValueComparer(comparer);
            });

            modelBuilder.Entity<Flavor>(entity =>
            {
                entity.Property(f => f.Name).HasMaxLength(100).IsRequired();
                entity.Property(f => f.Description).HasMaxLength(300);
                entity.Property(f => f.Color).HasMaxLength(30);
            });

            modelBuilder.Entity<Topping>(entity =>
            {
                entity.Property(t => t.Name).HasMaxLength(100).IsRequired();
                entity.Property(t => t.Price).HasColumnType("decimal(10,2)");
            });

            SeedCatalog(modelBuilder);
        }

        private static void SeedCatalog(ModelBuilder modelBuilder)
        {
            // Catalog is the authoritative source for validation and topping pricing.
            // Names and prices intentionally match the client builder catalog.
            modelBuilder.Entity<Flavor>().HasData(
                new Flavor { Id = 1, Name = "Vanilla Dream", Description = "Classic vanilla with Madagascar beans", Color = "#F3E5AB" },
                new Flavor { Id = 2, Name = "Chocolate Fudge", Description = "Rich dark chocolate delight", Color = "#5C4033" },
                new Flavor { Id = 3, Name = "Strawberry Bliss", Description = "Fresh strawberries and cream", Color = "#FC5A8D" },
                new Flavor { Id = 4, Name = "Mint Chocolate Chip", Description = "Cool mint with chocolate chips", Color = "#98FF98" },
                new Flavor { Id = 5, Name = "Cookies & Cream", Description = "Crushed Oreo cookies in vanilla", Color = "#D9D9D9" },
                new Flavor { Id = 6, Name = "Rocky Road", Description = "Chocolate with marshmallows & nuts", Color = "#8B5A2B" },
                new Flavor { Id = 7, Name = "Berry Burst", Description = "Mixed berry explosion", Color = "#7B68EE" },
                new Flavor { Id = 8, Name = "Pistachio", Description = "Authentic Italian pistachio", Color = "#93C572" },
                new Flavor { Id = 9, Name = "Lemon Sorbet", Description = "Refreshing lemon zest", Color = "#FFF44F" },
                new Flavor { Id = 10, Name = "Salted Caramel", Description = "Sweet caramel with sea salt", Color = "#C68E17" },
                new Flavor { Id = 11, Name = "Coffee Crunch", Description = "Espresso with coffee bean crunch", Color = "#6F4E37" },
                new Flavor { Id = 12, Name = "Rainbow Sherbet", Description = "Colorful fruit sherbet mix", Color = "#FF9AA2" }
            );

            modelBuilder.Entity<Topping>().HasData(
                new Topping { Id = 1, Name = "Rainbow Sprinkles", Price = 0.50m },
                new Topping { Id = 2, Name = "Chocolate Chips", Price = 0.75m },
                new Topping { Id = 3, Name = "Crushed Oreos", Price = 1.00m },
                new Topping { Id = 4, Name = "Caramel Sauce", Price = 0.75m },
                new Topping { Id = 5, Name = "Hot Fudge", Price = 0.75m },
                new Topping { Id = 6, Name = "Whipped Cream", Price = 0.50m },
                new Topping { Id = 7, Name = "Cherry", Price = 0.25m },
                new Topping { Id = 8, Name = "Crushed Nuts", Price = 1.00m },
                new Topping { Id = 9, Name = "Fresh Strawberries", Price = 1.25m },
                new Topping { Id = 10, Name = "Gummy Bears", Price = 0.75m },
                new Topping { Id = 11, Name = "Coconut Flakes", Price = 0.50m },
                new Topping { Id = 12, Name = "Graham Cracker", Price = 0.75m }
            );
        }
    }
}