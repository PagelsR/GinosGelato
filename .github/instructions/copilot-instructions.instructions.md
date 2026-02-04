---
applyTo: '**'
---

# Gino's Gelato – Copilot Instructions

## Project Overview

This is a full-stack ice cream shop application called "Gino's Gelato" where users can:
- Customize ice cream by selecting containers (cone/cup), up to 3 flavors, and toppings
- Add creations to a shopping cart
- Complete checkout with order processing

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** .NET 8 + ASP.NET Core Web API + Entity Framework Core (In-Memory)
- **Styling:** Tailwind CSS with custom gelato theme colors
- **State Management:** React Context API

**TypeScript/React:**
- Use functional components with hooks (useState, useEffect, useContext)
- Prefer TypeScript strict mode with explicit interface/type definitions
- Use `const` for immutable values, avoid `var`
- Handle async operations with try-catch and proper error states
- Destructure props for cleaner component code

**.NET 8/C#:**
- Use modern C# features (pattern matching, async streams, records)
- Prefer `var` when type is obvious
- Always include error handling for async operations with try-catch
- Use async/await for all asynchronous code
- Use xUnit for unit tests with proper mocking

**General:**
- Keep code DRY and follow single responsibility principle
- Provide supportive, encouraging guidance in all responsess