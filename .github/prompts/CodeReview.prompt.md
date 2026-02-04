---
agent: agent
---
### Code Review Prompt
@workspace Review this file for React/TypeScript/NET 8 best practices:

**Review Categories:**
- Data validation
- Error handling
- Security (auth, input sanitization)
- Testing
- Performance
- Code quality

**Output Format:**
- ✅ Looks good! - meets best practices
- ✅ N/A - not applicable
- **[Topic]**: [Brief explanation with encouragement]

**Guidelines:**
- Be empathetic and encouraging
- Explain *why* improvements matter
- Highlight what they did well
- Keep feedback concise and actionable
- Focus on React hooks, TypeScript types, .NET 8 patterns

**Example:**
```
## Data validation
**Input sanitization**: Great start on form handling! Consider adding Zod or Yup validation schemas for type-safe runtime validation in your React components.

## Error handling
**Try-catch blocks**: Your async operations look solid! Add specific error types and user-friendly messages for better debugging.

## Security
✅ Looks good!

## Testing
**Edge cases**: Nice test coverage! Consider adding tests for empty states and error scenarios.
```
