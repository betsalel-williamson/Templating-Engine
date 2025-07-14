# Recipe 1: Dynamic SQL Generation

## Use Case

You need to generate SQL `INSERT` statements from a list of data objects. A common challenge is correctly formatting the list of column names and the list of values, ensuring commas appear between items but not after the last one.

## Key Feature: Conditional Delimiters (`<*?delimiter:terminator>`)

This engine's conditional delimiter syntax (`<*?, >`) elegantly solves this problem without extra logic. The delimiter is only inserted *between* generated items.

This is a prime example of a feature that simplifies a common code generation task that is often cumbersome in other templating languages, which might require complex `if/else` logic checking for the "last item in the loop."
