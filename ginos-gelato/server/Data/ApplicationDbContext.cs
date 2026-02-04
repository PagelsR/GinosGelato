using Microsoft.EntityFrameworkCore;
using GinosGelato.Models;

namespace GinosGelato.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Flavor> Flavors { get; set; }
        public DbSet<Topping> Toppings { get; set; }
        public DbSet<IceCream> IceCreams { get; set; }
        public DbSet<Order> Orders { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Additional configuration can be added here
        }
    }
}