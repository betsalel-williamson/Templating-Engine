# Secure Templating Guide: The Trusted Kernel Pattern

## 1. The Vulnerability: Runtime State Mutation

The ability to call functions from a template is powerful but introduces security risks. We must defend against two primary threats:

1.  **Registry Poisoning:** An attacker modifies the function registry `Map` after it has been created but before it is used.
2.  **Insecure Closures:** A registered function depends on a mutable external state, which an attacker later modifies.

### Example: Insecure Closure Attack

```typescript
// External, mutable state
let config = { rate: 10 };

// A function that is not pure
async function calculate(val) { return val * config.rate; }

// Register the function. The engine now has a reference to `calculate`.
const secureEvaluate = createSecureEvaluator({ functions: new Map([['calculate', calculate]]) });

// Attacker later modifies the external state.
config.rate = 9999;

// The evaluator calls the original `calculate` function, but the
// function now executes with the poisoned `config` state.
const result = await secureEvaluate('<{calculate(2)}>', new Map()); // returns 19998
```

## 2. Mitigation Strategies

### Level 1 (Default): Private Copying

By default, `createSecureEvaluator` creates a **private copy** of the function registry `Map`.

-   **`new Map(registry)`**
-   This creates a new, inaccessible map instance inside a closure.
-   **It completely defeats Registry Poisoning.**
-   It does *not* protect against the Insecure Closure attack. This is our baseline, "safe by default" behavior.

### Level 2 (Optional): Deep Cloning

For higher security environments, `createSecureEvaluator` accepts an optional `cloneFunctions: true` flag.

-   This option creates a **new function object** from the string body of the original function.
-   **It defeats both Registry Poisoning and the Insecure Closure attack.**
-   **Use with caution.** This is an advanced feature with trade-offs:
    -   It has a performance overhead.
    -   It will break any function that relies on a legitimate, intended closure. It should only be used for functions that are provably pure or self-contained.
