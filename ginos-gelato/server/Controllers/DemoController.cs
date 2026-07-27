using Microsoft.ApplicationInsights;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GinosGelato.Data;

namespace GinosGelato.Controllers
{
    /// <summary>
    /// Deterministic, feature-flagged demo fault simulators used to generate
    /// Application Insights telemetry on demand during conference demonstrations.
    ///
    /// These endpoints are inert during normal customer journeys: nothing calls
    /// them unless a presenter (or the fault demo Playwright journey) explicitly
    /// opts in via the client fault flag. They can be hard-disabled per
    /// environment with the <c>DemoFaults:Enabled</c> configuration value.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class DemoController : ControllerBase
    {
        private const int SlowSqlDelaySeconds = 3;

        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<DemoController> _logger;
        private readonly TelemetryClient? _telemetry;

        public DemoController(
            ApplicationDbContext context,
            IConfiguration configuration,
            ILogger<DemoController> logger,
            TelemetryClient? telemetry = null)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _telemetry = telemetry;
        }

        // Faults are disabled unless explicitly enabled for the environment.
        // Defaults to true so the deployed demo environment and the daily fault
        // journey work out of the box; presenters can set DemoFaults:Enabled to
        // false to lock the endpoints down.
        private bool FaultsEnabled => _configuration.GetValue("DemoFaults:Enabled", true);

        // GET: api/demo/status
        [HttpGet("status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult GetStatus() => Ok(new
        {
            faultsEnabled = FaultsEnabled,
            faults = new[] { "slow-sql", "api-failure", "browser-exception" }
        });

        // GET: api/demo/slow-sql
        // Produces a genuine, deterministic slow Azure SQL dependency so a
        // slow-query scenario appears in Application Insights on demand.
        [HttpGet("slow-sql")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SlowSql(CancellationToken cancellationToken)
        {
            if (!FaultsEnabled)
            {
                return NotFound();
            }

            // Fixed literal delay (no user input) tracked as a SQL dependency.
            await _context.Database.ExecuteSqlRawAsync("WAITFOR DELAY '00:00:03'", cancellationToken);

            _telemetry?.TrackEvent(
                "DemoSlowSql",
                new Dictionary<string, string> { ["delaySeconds"] = SlowSqlDelaySeconds.ToString() });
            _logger.LogWarning("Demo slow-SQL fault executed with a deliberate {Seconds}s delay.", SlowSqlDelaySeconds);

            return Ok(new { fault = "slow-sql", delaySeconds = SlowSqlDelaySeconds });
        }

        // GET: api/demo/api-failure
        // Deterministically returns 503 so a failed API request/dependency
        // appears in Application Insights on demand.
        [HttpGet("api-failure")]
        [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult ApiFailure()
        {
            if (!FaultsEnabled)
            {
                return NotFound();
            }

            _telemetry?.TrackEvent("DemoApiFailure");
            _logger.LogError("Demo API-failure fault triggered (deliberate 503 Service Unavailable).");

            return Problem(
                title: "Demo API failure",
                detail: "Deliberate demo fault: the API returned 503 Service Unavailable.",
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }
    }
}
