using Microsoft.ApplicationInsights.DependencyCollector;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.EntityFrameworkCore;
using GinosGelato.Data;
using GinosGelato.Services;
using GinosGelato.Telemetry;

var builder = WebApplication.CreateBuilder(args);

// Application Insights: request, dependency (including Azure SQL), and
// distributed-trace telemetry with ILogger integration. The connection string
// is supplied by the APPLICATIONINSIGHTS_CONNECTION_STRING app setting in Azure.
// When absent (local development), telemetry is disabled and behavior is
// unchanged.
builder.Services.AddApplicationInsightsTelemetry();

// Capture SQL command text on dependency telemetry so slow or failing queries
// are diagnosable. Parameter values are not recorded.
builder.Services.ConfigureTelemetryModule<DependencyTrackingTelemetryModule>(
    (module, _) => module.EnableSqlCommandTextInstrumentation = true);

// Stamp all telemetry with release/deployment context (application_Version,
// gitCommitSha, deploymentId, environment) for release correlation.
builder.Services.AddSingleton<ITelemetryInitializer, ReleaseTelemetryInitializer>();

// The Azure SQL connection string is supplied by configuration:
//  - Locally: appsettings.Development.json (LocalDB)
//  - In Azure: an App Service connection string that is a Key Vault reference,
//    resolved by the App Service managed identity. The client never touches
//    SQL or Key Vault.

// Add services to the container.
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });

// Entity Framework Core backed by Azure SQL (system of record).
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure()));

// Application services
builder.Services.AddScoped<OrderService>();
builder.Services.AddSingleton<PricingService>();

// Health checks (includes database connectivity).
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>("database");

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS driven by configuration/app settings.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "https://localhost:5173" };
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              // Expose the Application Insights correlation header so the browser
              // SDK can link client-side AJAX telemetry to the API request.
              .WithExposedHeaders("Request-Context");
    });
});

var app = builder.Build();

// Apply EF Core migrations on startup so schema and seed data exist. This makes
// orders durable across App Service restarts.
if (!string.IsNullOrWhiteSpace(connectionString))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

// Exposed so integration tests can reference the application entry point.
public partial class Program { }