# Common commands

```bash
pnpm run build        # build all packages
pnpm run test         # test all packages
pnpm run typecheck    # TypeScript check all packages
pnpm run check        # typecheck + lint + format + build + test
pnpm run lint:md      # root markdownlint (non-mdcp paths)
```

Documentation (Node >= 24):

```bash
pnpm run docs:compile # compile shards + refresh llms-index
pnpm run docs:check   # compile, refs, xrefs, markdownlint
pnpm run docs:context # export features monolith for agent context
```

Look up link slugs from compiled output (quote multi-word queries):

```bash
pnpm docs:refs -- "Template language"
```
