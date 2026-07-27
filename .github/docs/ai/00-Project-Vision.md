
# 00 - Project Vision

## Purpose
Gino's Gelato is a long-lived reference application demonstrating modern Azure cloud development, GitHub Copilot workflows, and production engineering practices. It is intentionally small enough to understand quickly, yet realistic enough to demonstrate architecture, deployment, testing, observability, and AI-assisted development.

## Product Vision
Build a production-quality online ordering application where a customer can browse products, customize gelato, manage a cart, choose pickup, local delivery, or continental U.S. shipping, submit an order, and receive an order confirmation.

## Architectural Principles
- React + TypeScript frontend hosted in Azure Static Web Apps.
- ASP.NET Core API hosted in Azure App Service.
- Azure SQL as the system of record.
- Azure Key Vault for secrets and configuration.
- Managed Identity wherever supported.
- Bicep for all Azure infrastructure.
- GitHub Actions with OIDC for deployment.
- No unnecessary cloud services.

## Engineering Standards
- Small, incremental changes.
- Clean architecture without over-engineering.
- DTOs between client and server.
- EF Core migrations.
- Async APIs.
- Structured logging.
- Stable Playwright tests.
- Documentation kept current.

## Security Standards
- Never commit secrets.
- Never hardcode credentials.
- Use least privilege.
- Client never accesses SQL or Key Vault.
- API is authoritative for pricing and validation.

## Roadmap
1. Application Foundation
2. Observability Foundation
3. Demo Readiness

This document is authoritative. Future milestone prompts should reference it before making changes.
