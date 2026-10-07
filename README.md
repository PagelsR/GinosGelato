# 🍨 Gino's Gelato

[![Build and Deploy to Azure (main)](https://github.com/PagelsR/GinosGelato/actions/workflows/BuildDeploy.yml/badge.svg?branch=main)](https://github.com/PagelsR/GinosGelato/actions/workflows/BuildDeploy.yml)
[![Playwright Testing - Daily Schedule](https://github.com/PagelsR/GinosGelato/actions/workflows/playwright-testing.yml/badge.svg)](https://github.com/PagelsR/GinosGelato/actions/workflows/playwright-testing.yml)

A full-stack ice cream shop application for building custom gelato creations, managing a cart, and placing orders.

## Features

- **Build Your Gelato**: Choose cone or cup, up to 3 flavors, and toppings
- **Cart Management**: Add, update, and remove creations from the cart
- **Checkout Flow**: Collect order details and submit to the API
- **Responsive UI**: Polished, mobile-friendly layout with a gelato-themed design

## Technology Stack

### Backend
- .NET 10 ASP.NET Core Web API
- Entity Framework Core with **Azure SQL** (system of record) and EF Core migrations
- Authoritative server-side pricing and validation
- Health endpoint at `/health` (includes a database connectivity check)
- Swagger/OpenAPI

### Frontend
- React 19 with TypeScript
- Vite for fast development
- Tailwind CSS with custom gelato theme
- React Context API for state management

### Azure & Platform
- Azure SQL Database (`Basic` tier - durable order persistence, kept small)
- Azure Key Vault (holds the SQL connection string secret; access-policy based)
- Managed Identity (the API reads the secret via a Key Vault reference; the client never touches SQL or Key Vault)
- Bicep for all infrastructure
- GitHub Actions (deploys on every push to `main`; idempotent Bicep)

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 18+](https://nodejs.org/)
- SQL Server / LocalDB for local development (or a reachable Azure SQL database)
- PowerShell (Windows) or Bash (Linux/Mac)

## Quick Start

### 1. Clone and Navigate

```powershell
cd c:\Users\RandyPagels\Repos\GinosGelato
```

### 2. Backend Setup

The API reads its connection string from configuration. For local development the
`appsettings.Development.json` file points at SQL Server LocalDB. Migrations are
applied automatically on startup, seeding the flavor and topping catalog.

```powershell
# Navigate to API folder
cd ginos-gelato\server

# Run the API (default port: 5000). Applies EF Core migrations on startup.
dotnet run
```

The API will be available at: `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`
Health check: `http://localhost:5000/health`

To use a different database, set the connection string:

```powershell
$env:ConnectionStrings__DefaultConnection = 'Server=...;Database=GinosGelatoDb;...'
```

### 3. Frontend Setup

Open a **new terminal** and run:

```powershell
# Navigate to client folder
cd c:\Users\RandyPagels\Repos\GinosGelato\ginos-gelato\client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Usage

1. **Build a Gelato**:
  - Choose a container (cone or cup)
  - Select up to three flavors
  - Add toppings
  - Add the creation to your cart

2. **Manage Your Cart**:
  - Review items in the cart
  - Update quantities or remove items

3. **Checkout**:
  - Enter order details
  - Submit your order

## API Endpoints

### Flavors
- `GET /api/flavors` - Get all flavors (from Azure SQL)

### Toppings
- `GET /api/toppings` - Get all toppings (from Azure SQL)

### Orders
- `POST /api/orders` - Create and persist a new order (server validates and prices)
- `GET /api/orders/{id}` - Get a persisted order
- `GET /api/orders` - List orders

### Health
- `GET /health` - Liveness/readiness including database connectivity

## Fulfillment options

Orders support three fulfillment types, each priced by the API:

- **Pickup** - free
- **Local delivery** - $4.99
- **Continental U.S. shipping** - $9.99

## Reference app: intentional fault injection for Application Insights demos

This repo doubles as a teaching tool for Azure Application Insights and
GitHub Copilot-assisted troubleshooting. On top of the real storefront, it
ships a small set of **deterministic, feature-flagged faults** that a
presenter can trigger on demand to generate realistic failure telemetry -
without touching real order data.

The faults are disabled unless explicitly selected, so normal customer
journeys never hit them:

| Fault | Trigger | What it does |
|---|---|---|
| `slow-sql` | `/fault?fault=slow-sql` | Runs a real `WAITFOR DELAY '00:00:03'` against Azure SQL - a genuine slow SQL dependency |
| `sql-failure` | `/fault?fault=sql-failure` | Runs a deliberate `RAISERROR` - a genuine failed SQL dependency (red SQL node on the Application Map) |
| `api-failure` | `/fault?fault=api-failure` | Returns HTTP 503 from the API - a failed server request |
| `browser-exception` | `/fault?fault=browser-exception` | Throws an unhandled client-side error (`DemoBrowserException`) |

Key implementation points:

- Server logic lives in [`ginos-gelato/server/Controllers/DemoController.cs`](ginos-gelato/server/Controllers/DemoController.cs),
  gated by the `DemoFaults:Enabled` config value (defaults to `true`; set to
  `false` to hard-disable in an environment).
- Client trigger logic lives in [`ginos-gelato/client/src/pages/FaultDemo.tsx`](ginos-gelato/client/src/pages/FaultDemo.tsx)
  and [`ginos-gelato/client/src/utils/demoFaults.ts`](ginos-gelato/client/src/utils/demoFaults.ts).
- [`e2e/journey-4-fault-demo.spec.ts`](e2e/journey-4-fault-demo.spec.ts) drives
  all four faults through Playwright and runs automatically via the daily
  scheduled `.github/workflows/playwright-testing.yml` workflow, so
  Application Insights always has recent fault telemetry to investigate.
- The full presenter walkthrough - what to click, what to say, and how to
  read the resulting telemetry - is in
  [`.github/trainer-guides/Ginos-Gelato-AppInsights-Demo-Runbook-75min.md`](.github/trainer-guides/Ginos-Gelato-AppInsights-Demo-Runbook-75min.md).

## Testing

### Unit tests (pricing & validation)

```powershell
dotnet test ginos-gelato/server.Tests/GinosGelato.Tests.csproj
```

### End-to-end (Playwright)

```powershell
npm ci
npx playwright test e2e/happy-path.spec.ts
```

The `happy-path.spec.ts` test drives the full build → cart → checkout →
confirmation workflow and is intentionally deterministic.

## Database migrations

```powershell
# Create a migration after model changes
dotnet ef migrations add <Name> --project ginos-gelato/server/GinosGelato.csproj

# Apply migrations to a database
dotnet ef database update --project ginos-gelato/server/GinosGelato.csproj
```

Migrations are also applied automatically when the API starts.

## Deployment (Azure)

Infrastructure is defined in `iac/` (Bicep) and deployed via GitHub Actions on
every push to `main`. The Bicep is idempotent, so re-running the pipeline safely
reconciles the resources. Configure these repository secrets:

- `AZURE_CREDENTIALS` - service principal JSON used by `azure/login`
- `AZURE_SUBSCRIPTION_ID` - target subscription ID
- `SQL_ADMIN_PASSWORD` - Azure SQL administrator password (never committed)
- `AZURE_DEPLOY_SP_OBJECT_ID` *(optional)* - object ID of the deployment service
  principal, if the pipeline itself needs to read secrets
- `PLAYWRIGHT_SERVICE_URL` *(optional)* - the Playwright Workspace's regional
  browser endpoint, needed for the "testing at scale" jobs below. It isn't an
  ARM output - copy it once from the workspace's **Get Started** page in the
  Azure Portal after the first deploy.

Your Key Vault admin access (full read/edit/delete on secrets) is set via the
`adminObjectId` default in [iac/main.bicep](iac/main.bicep) - AAD object IDs are
identifiers, not secrets, so they are safe to commit. [iac/playwrightWorkspace.bicep](iac/playwrightWorkspace.bicep)
can *also* grant that object ID (plus the optional deployment service
principal) the **Playwright Workspace Contributor** role, but this is
**off by default** (`assignPlaywrightWorkspaceRoles = false`) because role
assignment requires Owner/User Access Administrator, not the Contributor role
CI principals should have. Grant it manually once instead:

```powershell
az role assignment create --assignee <objectId> --role "Playwright Workspace Contributor" --scope <playwrightWorkspaceResourceId>
```

The pipeline provisions the App Service, Static Web App, Azure SQL, Key Vault,
and a Playwright Workspace (Azure App Testing), writes the SQL connection
string secret, wires it to the App Service as a Key Vault reference resolved
by the managed identity, deploys the API and frontend, and verifies the
`/health` endpoint.

### Testing at scale (Azure App Testing - Playwright Workspaces)

Both `.github/workflows/playwright-testing.yml` and
`.github/workflows/BuildDeploy.yml` run the `/e2e/` suite on managed cloud
browsers via Playwright Workspaces (`playwright.service.config.ts`), in
addition to the regular local/CI run. Results are reported in two
complementary dashboards:

- **Trend history** - https://pagelsr.github.io/GinosGelato/ - pass/fail and
  duration trends across every run over time.
- **Playwright Workspace dashboard** - printed in the relevant job summary -
  per-run parallel workers, traces, screenshots, recordings, and Live View.

## Project Structure

```
iac/                 # Bicep infrastructure (App Service, SWA, SQL, Key Vault, configSettings, Playwright Workspace)
ginos-gelato/
  client/            # React + Vite frontend
  server/            # .NET 10 Web API backend
    Migrations/      # EF Core migrations
  server.Tests/      # xUnit unit tests (pricing & validation)
e2e/                 # Playwright end-to-end tests
```

## License

This project is for demonstration purposes.

## Contributing

This is a prototype application. Feel free to fork and extend!

---

**Built with ❤️ for gelato lovers**
