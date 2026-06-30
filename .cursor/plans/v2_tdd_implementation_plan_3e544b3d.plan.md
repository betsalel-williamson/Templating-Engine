---
name: V2 TDD Implementation Plan
overview: A step-by-step TDD plan to implement the V2 modern syntax, starting with setting up V2 golden files and then iteratively implementing features with boundary and stress tests.
todos:
  - id: create-v2-golden-files
    content: "Commit: test: add v2 golden template files for existing recipes"
    status: completed
  - id: create-v2-test-harness
    content: "Commit: test: add v2 recipes test harness"
    status: completed
  - id: test-recursive-var
    content: "Commit: test: add failing tests for v2 recursive variable replacement"
    status: completed
  - id: impl-recursive-var
    content: "Commit: feat: implement v2 recursive variable replacement"
    status: completed
  - id: test-iteration
    content: "Commit: test: add failing tests for v2 basic iteration"
    status: completed
  - id: impl-iteration
    content: "Commit: feat: implement v2 basic iteration"
    status: completed
  - id: test-filters
    content: "Commit: test: add failing tests for v2 filter pipeline and join"
    status: completed
  - id: impl-filters
    content: "Commit: feat: implement v2 filter pipeline and join filter"
    status: completed
  - id: test-conditionals
    content: "Commit: test: add failing tests for v2 conditional logic"
    status: completed
  - id: impl-conditionals
    content: "Commit: feat: implement v2 conditional logic"
    status: completed
  - id: test-dot-notation
    content: "Commit: test: add failing tests for v2 dot notation property access"
    status: completed
  - id: impl-dot-notation
    content: "Commit: feat: implement v2 dot notation property access"
    status: completed
  - id: refactor-v2-1-sections
    content: "Commit: refactor: migrate to logic-less Mustache sections (V2.1)"
    status: pending
  - id: refactor-v2-1-macros
    content: "Commit: refactor: implement TS-driven m4-style macro evaluation (V2.1)"
    status: pending
  - id: feat-v2-1-security
    content: "Commit: feat: add TrustedTemplate class and SSTI prevention boundaries (V2.1)"
    status: pending
isProject: false
---

# V2 TDD Implementation Plan

**Goal:** Implement the V2 modern syntax using a Test-Driven Development (TDD) approach, ensuring boundary and stress tests are included. The ultimate target is to have a new set of V2 golden files (`.v2.template`) that produce the exact same output as the existing `.result` files.

## Phase 1: Establish the Golden File Test Harness
Before implementing features, we need to define the end goal.
- Create `.v2.template` versions of the existing recipes in `[packages/template-engine-core/recipes/](packages/template-engine-core/recipes/)` (e.g., `01-dynamic-sql-generation.v2.template`, `02-multi-env-config.v2.template`).
- Create a new test suite `[packages/template-engine-core/test/recipes-v2.test.ts](packages/template-engine-core/test/recipes-v2.test.ts)` that evaluates the `.v2.template` files using the `new` parser and asserts the output matches the existing `.result` files.
- *Note: These tests will initially fail, serving as our overarching integration test target.*

**Atomic Commits for Phase 1:**
- `test: add v2 golden template files for existing recipes`
- `test: add v2 recipes test harness`

## Phase 2: Iterative Feature Implementation (TDD)
We will tackle the V2 features one at a time. For each feature, we will:
1. Write failing unit tests (including boundary and stress tests) in `test/new_syntax/`.
2. Implement the parsing in `grammar_new.peggy` and evaluation in `evaluator.ts`.
3. Refactor and ensure tests pass.

### Step 1: Modern Recursive Variable Replacement (Issue #16)
- **Tests:** Create `test/new_syntax/recursive-variable-replacement.test.ts`. Add boundary tests (empty strings, whitespace) and stress tests (deep recursion chains, circular reference detection).
- **Implementation:** Ensure `{{ alias_var }}` correctly resolves to its target value and detects circular loops without just hitting max call stack depth.
- **Atomic Commits:**
  - `test: add failing tests for v2 recursive variable replacement`
  - `feat: implement v2 recursive variable replacement`

### Step 2: Modern Basic Iteration (Issue #17)
- **Tests:** Create `test/new_syntax/basic-iteration.test.ts`. Add boundary tests (empty arrays, missing arrays) and stress tests (large arrays, deeply nested loops).
- **Implementation:** Add `{% for item in array %}` to `grammar_new.peggy` and handle the AST in `evaluator.ts`.
- **Atomic Commits:**
  - `test: add failing tests for v2 basic iteration`
  - `feat: implement v2 basic iteration`

### Step 3: Modern Loop Delimiters & Filters (Issue #20 & #25)
- **Tests:** Create `test/new_syntax/filters.test.ts`.
- **Implementation:** Implement the filter pipeline (`|`) and the `join` filter to replace the legacy cross-product delimiters (`<*? ... >`).
- **Atomic Commits:**
  - `test: add failing tests for v2 filter pipeline and join`
  - `feat: implement v2 filter pipeline and join filter`

### Step 4: Modern Conditional Logic (Issue #19)
- **Tests:** Create `test/new_syntax/conditional-logic.test.ts`.
- **Implementation:** Add `{% if condition %}` and `{% else %}` blocks.
- **Atomic Commits:**
  - `test: add failing tests for v2 conditional logic`
  - `feat: implement v2 conditional logic`

### Step 5: Dot Notation Property Access (Issue #24)
- **Tests:** Create `test/new_syntax/property-access.test.ts`.
- **Implementation:** Support `{{ user.address.city }}` natively in the new grammar.
- **Atomic Commits:**
  - `test: add failing tests for v2 dot notation property access`
  - `feat: implement v2 dot notation property access`

## Phase 3: Validation
- Once all features are implemented, the `recipes-v2.test.ts` suite should pass completely, proving 100% parity with the legacy engine using the modern syntax.

## Phase 4: V2.1 Mustache/m4 Hybrid Refactoring (Upcoming)
Based on the updated architectural vision in `docs/features/architecture/v2_mathematical_design.md`, we will shift the parsing away from procedural Twig/Jinja elements (`{% for %}`, `{% if %}`) and instead defer logic to the TypeScript runtime context via Mustache-style logic-less sections and m4-style macro expansions.

### Step 1: Migrate to Logic-less Sections
- **Tests:** Update `basic-iteration.test.ts` and `conditional-logic.test.ts` to expect Mustache-style tags (`{{#array}}...{{/array}}`, `{{^boolean}}...{{/boolean}}`) rather than procedural blocks.
- **Implementation:** Strip out procedural block AST nodes from `grammar_new.peggy`. Implement section parsing and context stack traversal in `evaluator.ts`.

### Step 2: Implement Context-driven Macros & Lambdas
- **Tests:** Update `filters.test.ts` to expect m4-style TS macro expansion (e.g., `{{ paginate(users, 3) }}`) instead of built-in engine filters.
- **Implementation:** Enhance the context engine to evaluate TS function properties as macros, passing parameters directly and returning safe output.

### Step 3: Implement Security Boundaries (TrustedTemplate)
- **Tests:** Add SSTI and Domain Injection prevention tests.
- **Implementation:** Introduce `TrustedTemplate` class. Ensure that strings returned from context functions are properly escaped and never rescanned, while `TrustedTemplate` returns can safely be expanded.