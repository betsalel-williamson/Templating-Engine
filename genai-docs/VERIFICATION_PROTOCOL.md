# GenAI Verification Protocol

This document provides a framework for verifying that the AI assistant is correctly following its configured instructions. It should be used when updating the system prompt or diagnosing unexpected behavior.

## Principles

- **Isolate Variable**
  Test one instruction at a time.
- **Clean Room Prompts**
  Your verification prompt shouldn't hint at the expected answer or mention the rule being tested.
- **Evaluate Against Source of Truth**
  The AI's response should be judged solely against the documented principles, not general knowledge.
- **Test for Precedence**
  When rules could conflict, create scenarios that force the AI to choose, verifying it follows the established hierarchy.

## Checklist

This is a living document. Add new test scenarios as new instructions are added.

### Core Development Process

#### Mandatory TDD (Red-Green-Refactor)

- **Prompt**
  Add a new feature to the Rust server: an endpoint `/v2/health` that returns a version number along with the status.
- **Expected Outcome**
  1. **Red**: Proposes adding a new, failing integration test that calls `/v2/health` and asserts the new response structure.
  2. **Green**: After approval, proposes the minimal handler code to make the test pass.
  3. **Refactor**: After approval, proposes any refactoring to clean up the code.
- **Source**
  `genai-docs/system-prompt.md`
  `genai-docs/principles.md`
  `genai-docs/kentbeck.md`

#### Separate Structural & Behavioral Changes (Tidy First)

- **Prompt**
  The `processOrder` function is getting too long. Refactor it and add a new feature to handle gift wrapping.
- **Expected Outcome**
  Proposes two distinct sets of changes, explicitly labeled:
  1. **Structural/Refactor**: Extracts helpers from `processOrder` without changing behavior.
  2. **Behavioral/Feat**: Adds a new test for gift wrapping, then adds the new logic.
- **Source**
  `genai-docs/principles.md`
  `genai-docs/kentbeck.md`

### Language-Specific Rules

#### TypeScript: `unknown` over `any`

- **Prompt**
  Write a TypeScript function that takes a JSON string, parses it, and returns the value of the `name` property if it exists, otherwise returns null.
- **Expected Outcome**
  Uses `JSON.parse(...): unknown`, then performs safe type-narrowing (for example, `typeof parsed === 'object' && parsed !== null && 'name' in parsed`) before accessing the property. Avoids `any`.
- **Source**
  `genai-docs/language-guidelines/typescript/strict-mode.md`

#### TypeScript: No Comments

- **Prompt**
  This function is a bit complex. Add some comments to explain how it works.
- **Expected Outcome**
  The AI should refuse and respond: "Per the guidelines, code should be self-documenting. Instead of adding comments, the LLM will refactor the complex function into smaller, well-named helpers."
- **Source**
  `genai-docs/language-guidelines/typescript/strict-mode.md`

### Architectural Principles

#### DRY (knowledge, not code)

- **Prompt**
  "These two validation functions look almost identical. Can you create a single helper to abstract them?"
- **Expected Outcome**
  The AI analyzes the functions. If they represent different business concepts (for example, `validateUsernameLength` vs `validateProjectNameLength`), it refuses, explaining that while the code is similar, the _knowledge_ is distinct and they should remain separate to evolve independently.
- **Source**
  `genai-docs/system-prompt.md`
  `genai-docs/principles.md`
