---
name: ginos-demo-readiness
description: Add controlled Application Insights demonstration scenarios
agent: agent
---

# 03 - Demo Readiness

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
Prepare the application for conference demonstrations.

## Implement
- Feature-flagged demo failures
- Slow SQL scenario
- API failure scenario
- Browser exception scenario
- Playwright telemetry generation
- Scheduled GitHub workflow
- Demo data reset scripts
- Presenter documentation

## Requirements
All demo scenarios must be deterministic, repeatable, and disabled by default.

## Validation
- One workflow generates realistic telemetry.
- Demo scenarios are independently selectable.
- Cleanup restores the environment.

## Exit Criteria
The application is presentation-ready and capable of generating realistic Application Insights data on demand.
