---
agent: agent
description: 'GHAS Demo 1.3: ask Copilot to find a hard-coded SQL connection string and point to a GHAS custom pattern that detects it. Read-only analysis.'
tools: ['search', 'read', 'web']
---

Does my codebase contain a hard-coded SQL connection string? If so, find a
pre-defined pattern (it can be multiple if you believe that is better) in the
`advanced-security/secret-scanning-custom-patterns` repository that can detect
a database connection string, and tell me step by step how to add this custom
pattern. Include a link to the pattern so I can verify it myself.

DO NOT EXPOSE THE FOUND CONNECTION STRING IN THIS CHAT. Keep your response brief.
