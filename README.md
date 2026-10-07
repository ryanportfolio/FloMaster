# FloMasters Plumbing and Drains

Website prototype for FloMasters, Antonio Spence's one-person plumbing business in Hampton Roads, Virginia. It is a base design to show the owner: every fact he hasn't confirmed yet appears as an ideal-case placeholder with a "confirm this" tag, and every photo is an AI-generated stand-in to be replaced with a real one.

- Research: [docs/research.md](docs/research.md)
- Design brief: [docs/design-brief.md](docs/design-brief.md)

## Run it

```bash
npm install
npm run build
npx astro preview
```

Open http://localhost:4321. Add `?tags=on` to any page, or use "Items to confirm" in the bar at the top, to see what the owner needs to supply. `/review` lists every item as a printable checklist.

`npm run build:public` builds the site for launch. It refuses to run until every fact is confirmed and every sample review and stand-in photo is replaced.

Commands and checks: [.claude/reference/commands.md](.claude/reference/commands.md).
