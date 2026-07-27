using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace GinosGelato.Data
{
    /// <summary>
    /// Enables EF Core design-time tooling (migrations) without a live database
    /// or the full application host. Uses a local design-time connection string
    /// that is never used at runtime.
    /// </summary>
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var connectionString = Environment.GetEnvironmentVariable("DESIGN_TIME_CONNECTION")
                ?? "Server=(localdb)\\MSSQLLocalDB;Database=GinosGelatoDesignTime;Trusted_Connection=True;";

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer(connectionString)
                .Options;

            return new ApplicationDbContext(options);
        }
    }
}
