---
name: ginos-observability-foundation
description: Add production-grade Application Insights observability
agent: agent
---

# 02 - Observability Foundation

## Read First
Read and follow the authoritative project specification: [00 - Project Vision](../../docs/ai/00-Project-Vision.md)

Treat that document as the source of truth for:

- Product scope
- Application architecture
- Azure standards
- Security requirements
- Engineering principles
- Explicitly prohibited approaches

## Objective
Instrument the existing application without changing user behavior.

## Implement
- Azure Application Insights
- Browser telemetry
- API telemetry
- SQL dependency tracking
- Distributed tracing
- Custom business events
- Useful KQL queries
- Documentation

## Do Not Add
- Random failures
- Slow SQL scenarios
- Demo automation

## Validation
- Every checkout generates correlated telemetry.
- Dependencies appear correctly.
- Browser, API and SQL traces correlate.
- KQL queries return expected data.

## Exit Criteria
Observability is production quality while the application behavior remains unchanged.
