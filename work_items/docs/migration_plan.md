# Migration Plan: Adopting a Modern Templating Syntax (Jinja2/Handlebars-like)

**Overall Goal:** To enhance developer productivity, improve maintainability, and reduce onboarding friction by migrating our internal templating language to a syntax more familiar to modern web developers, while strictly adhering to our principles of small batch sizes, user-centricity, and continuous improvement.

**Target Syntax Scope (Initial):**
The new syntax will draw inspiration from widely adopted template engines (e.g., Jinja2, Handlebars, Vue.js templating). Key constructs will include:

- **Variable & Function Output:** `{{ expression }}` (e.g., `{{ user.name }}`, `{{ now() }}`, `{{ add(1, 2) }}`)
- **Conditional Logic:** `{% if condition %}` ... `{% else %}` ... `{% endif %}`
- **Looping/Iteration:** `{% for item in collection %}` ... `{% endfor %}`
- **Literal Text:** Any content outside explicit tag delimiters.

Initially, not all advanced features of the existing TCL-based engine (e.g., specific array slicing notations, complex indirect variable chaining, conditional delimiters in loops) will be directly translated. The focus is on establishing the core syntax and behavior.

## Canonical AST Strategy

To ensure a single, performant `evaluator` function independent of syntax versions, both the legacy and new templating grammars will produce a **unified, canonical Abstract Syntax Tree (AST)**. This means:

- The `src/types.ts` file defines the canonical AST node structures (e.g., `VariableNode`, `ConditionalNode`, `CrossProductNode`).
- Each grammar (`src/grammar.peggy` for legacy, `src/grammar_new.peggy` for modern) is responsible for parsing its specific syntax and directly mapping it to these canonical AST node types.
- The `src/evaluator.ts` will continue to operate solely on this canonical AST, remaining oblivious to the original syntax.

This approach minimizes runtime overhead by avoiding an intermediate AST transformation step and maximizes maintainability by centralizing evaluation logic.

---

## **Phases of Migration:**

### **Phase 0: Planning & Parallel Development Setup (Current Focus)**

- **Define New Grammar:** Create a separate Peggy grammar file (`src/grammar_new.peggy`) that defines the new syntax rules. This will be a distinct, self-contained grammar.
- **Extend AST Types:** Introduce new AST node types in `src/types.ts` as necessary to represent the new syntax's control flow structures (e.g., `NewCrossProductNode` for `for` loops, `ConditionalNode` with simpler condition handling).
- **Adapt Evaluator:** Update `src/evaluator.ts` to include logic for processing these new AST node types. The core evaluation functions for existing node types (Literal, Variable, FunctionCall) should largely remain unchanged, promoting reusability.
- **Integrate Build Process:** Modify `package.json` to include a new build step (`npm run build:parser:new`) that compiles `src/grammar_new.peggy` into a separate parser file (`lib/parser_new.js`). The main `npm run build` command will now compile _both_ parsers.
- **Flexible Test Evaluator:** Enhance `test/test-helper.ts` to allow specifying which parser (`lib/parser.js` or `lib/parser_new.js`) to use for a given test suite.
- **Duplicate Initial Tests (Small Batch 1):** Create a new test directory (e.g., `test/new_syntax/`). Create a new test file in this directory named descriptively after the feature being ported (e.g., `basic-variable-replacement.test.ts`, `if-else-conditionals.test.ts`). This is our first verifiable small batch. Convert its template examples to the new syntax.

### **Phase 1: Incremental Feature Parity & Test-Driven Porting**

- **Systematic Porting (Small Batches):** For each existing user story's test file (`test/story1.test.ts`, `test/story2.test.ts`, etc.):
  - Create a corresponding new syntax test file, named descriptively after the feature (e.g., `test/new_syntax/recursive-variable-resolution.test.ts`).
  - Convert the templates in the new test file to the target new syntax.
  - Develop or extend the `src/grammar_new.peggy` rules to support the features demonstrated by these tests.
  - Refine the `src/evaluator.ts` logic as needed to correctly interpret the new AST nodes generated by the new grammar.
  - **Crucial:** Each user story's porting (grammar, evaluator, tests) is treated as a **small, atomic, and independently verifiable batch**. This maintains delivery stability and throughput.
- **Prioritize Common Use Cases:** Focus on porting the most frequently used or critical templating features first to provide immediate value.
- **Maintain DORA Metrics Focus:** Continuously monitor `Change Lead Time`, `Deployment Frequency`, and `Change Failure Rate` during this phase to ensure that the incremental changes do not degrade our delivery performance.

### **Phase 2: Template Migration & Tooling Development**

- **Audit Existing Templates:** Identify all existing templates using the old syntax across projects. Categorize them by complexity, frequency of use, and ownership.
- **Develop Migration Strategy:**
  - For simple templates, develop an automated migration script (a CLI tool, for example) that takes an old template and outputs a new template. This reuses our own templating capabilities.
  - For complex templates, acknowledge that manual review and refactoring will be necessary.
- **Pilot Migration (Small Batches):** Select a small, non-critical set of existing templates for an initial migration pilot. Use this to refine the automated tool and manual process.
- **Team Enablement:** Provide training and clear documentation on the new syntax and the migration process. Empower teams to migrate their own templates.
- **Documentation Updates:** Update `README.md`, `docs/PRINCIPLES.md`, and any other relevant documentation to prominently feature the new syntax as the preferred standard. Include a guide on how to migrate existing templates.

### **Phase 3: Deprecation & Sunset of Old Syntax**

- **Announce Deprecation:** Officially communicate a deprecation period for the old templating syntax. Provide a clear timeline and support window.
- **Gradual Transition:** Continue to support both parsers and syntaxes during the deprecation period to allow teams ample time to migrate.
- **Final Migration Push:** Work with teams to ensure all remaining templates are converted by the deadline.
- **Remove Old Grammar & Tests:** Once all templates are successfully migrated and validated in production, the `src/grammar.peggy` file and its associated tests (`test/story*.test.ts`, `test/legacy.test.ts`) can be removed. This reduces the codebase's cognitive load and maintenance burden, ensuring the DRY principle is applied to our internal standards.
- **Post-Migration Review:** Conduct a retrospective to capture learnings from the migration process. Re-evaluate DORA metrics to confirm the long-term positive impact on developer productivity and satisfaction.

This phased, data-informed, and small-batch approach will ensure a controlled transition that minimizes disruption while achieving the significant long-term benefits of a more developer-friendly templating language.
