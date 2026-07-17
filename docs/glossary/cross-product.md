# cross-product

Legacy iteration pattern: a loop walks an array and renders a sub-template for each element. Named after the original mergeEngine cross-product construct (`<*>` with `<[array]>`).

In [V2](./v2.md) destination design, the [host layer](./host-layer.md) prepares arrays and templates use section-style rendering rather than reimplementing loop control flow in template text.
