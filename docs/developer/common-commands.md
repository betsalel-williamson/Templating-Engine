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
pnpm run docs:compile # compile shards to monoliths
pnpm run docs:check   # compile, refs, xrefs, markdownlint
pnpm run docs:context # print features monolith for agent context
```

List link slugs from compiled output:

```bash
pnpm docs:refs
```
