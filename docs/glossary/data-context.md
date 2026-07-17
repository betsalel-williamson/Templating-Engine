# data context

Named values a template reads at evaluation time. The [host layer](./host-layer.md) prepares context before render; the core library uses `Map` keys and values. Nested objects from JSON should be converted to nested `Map` instances before evaluation.
