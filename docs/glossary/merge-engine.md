# mergeEngine

Classic **Recipe Programming Language (RPL)**-style templating by Jordan Henderson (original implementation in TCL). Templates treat text and data as operands—projection (`<*>`), conditionals (`<+>`), and indirection (`<##...##>`) express transformation rather than imperative programs.

This repository ports mergeEngine semantics to TypeScript with a Peggy parser and a [secure evaluator](./secure-evaluator.md). The **destination** keeps RPL's transformation power without a TCL-first template surface; see [V2](./v2.md) and [logic-less presentation](./logic-less-presentation.md).
