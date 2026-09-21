using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.ApplicationInsights.Extensibility;

namespace GinosGelato.Telemetry
{
    /// <summary>
    /// Stamps every telemetry item with release/deployment context so failures
    /// and performance can be correlated to a specific build — answering "did
    /// this start after the last deploy?".
    ///
    /// Values are supplied by deployment app settings (Release:Version,
    /// Release:CommitSha, Release:DeploymentId). Sensible fallbacks keep local
    /// development and tests working without configuration.
    /// </summary>
    public class ReleaseTelemetryInitializer : ITelemetryInitializer
    {
        private readonly string _version;
        private readonly string _commitSha;
        private readonly string _deploymentId;
        private readonly string _environment;

        public ReleaseTelemetryInitializer(IConfiguration configuration, IHostEnvironment environment)
        {
            var release = configuration.GetSection("Release");
            _version = FirstNonEmpty(
                release["Version"],
                typeof(ReleaseTelemetryInitializer).Assembly.GetName().Version?.ToString(),
                "unknown");
            _commitSha = FirstNonEmpty(release["CommitSha"], "unknown");
            _deploymentId = FirstNonEmpty(release["DeploymentId"], "unknown");
            _environment = environment.EnvironmentName;
        }

        public void Initialize(ITelemetry telemetry)
        {
            // Populates the application_Version column used by release annotations
            // and cross-release comparison.
            telemetry.Context.Component.Version = _version;

            if (telemetry is ISupportProperties supportProperties)
            {
                supportProperties.Properties.TryAdd("gitCommitSha", _commitSha);
                supportProperties.Properties.TryAdd("deploymentId", _deploymentId);
                supportProperties.Properties.TryAdd("environment", _environment);
            }
        }

        private static string FirstNonEmpty(params string?[] values)
            => values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v)) ?? "unknown";
    }
}
