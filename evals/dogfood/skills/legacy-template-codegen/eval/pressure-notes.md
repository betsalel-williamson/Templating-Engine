# RED pressure notes (wrong model)

1. **Runtime rendering** — `renderHelp()` / `parseLegacy` inside CLI instead of build-time codegen.
2. **Templates for stdout only** — formatting user output, not generating `.ts` files.
3. **No codegen script** — `.template` files present but nothing writes `src/generated/`.
4. **Hand-written duplicate** — full `src/help.ts` AND templates doing the same thing.
5. **Core in runtime src** — `template-engine-core` imported from `src/cli.ts`.

Arm B should spend tokens on **compact template meta-patterns** that **expand into TypeScript** at build time.
