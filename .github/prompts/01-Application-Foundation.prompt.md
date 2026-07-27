---
name: ginos-application-foundation
description: Build and deploy the Gino's Gelato application foundation
agent: agent
model: Claude Opus 4.8 (copilot)
tools: ['execute', 'read', 'edit', 'search', 'web', 'agent', 'todo']
---

# 01 - Application Foundation

## Read First
Read and follow the authoritative project specification: [00 - Project Vision](../docs/ai/00-Project-Vision.md)

Treat that document as the source of truth for:

- Product scope
- Application architecture
- Azure standards
- Security requirements
- Engineering principles
- Explicitly prohibited approaches

## Objective
Produce a fully working, production-quality application that can be deployed repeatedly to Azure.

## Functional Requirements
- Complete customer ordering workflow.
- Shopping cart.
- Pickup, local delivery, continental U.S. shipping.
- Order confirmation.
- Azure SQL persistence.
- Order survives application restart.

## Technical Requirements
- Replace InMemory database.
- EF Core migrations.
- Azure Key Vault.
- Managed Identity.
- Bicep deployment.
- GitHub Actions using OIDC.
- Health endpoint.
- Configuration via app settings.

## Quality Requirements
- Reliable Playwright happy-path tests.
- Unit tests for pricing and validation.
- Updated README.

## Explicitly Out of Scope
- Application Insights
- Custom telemetry
- Service Bus
- Authentication
- Real payments

## Validation Checklist
- Solution builds.
- Tests pass.
- Bicep validates.
- Azure deployment succeeds.
- Checkout works end-to-end.
- Orders persist in Azure SQL.
- App Service restart does not lose data.

## Exit Criteria
Stop once every validation item passes. Summarize changes, files modified, validation performed, and remaining risks.
