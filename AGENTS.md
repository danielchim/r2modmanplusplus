# Agent Instructions (r2modmanPlusPlus/vite-app)

This repository is a Vite + React + TypeScript app using Tailwind CSS v4 and shadcn/ui.
Use this file as the default operating/manual for agentic coding in this repo.

## Quick Commands

Package manager
- Prefer `pnpm` (repo contains `pnpm-lock.yaml`).

Install
- `pnpm install`

Dev server
- `pnpm dev`

Production build
- `pnpm build`
  - Runs `tsc -b` (project refs) then `vite build`.

Preview production build
- `pnpm preview`

Lint
- `pnpm lint`
  - Maps to `eslint .` using `eslint.config.js` (flat config).

Typecheck only
- `pnpm -s tsc -b --pretty false`
  - Uses TS project references (`tsconfig.json` -> `tsconfig.app.json`, `tsconfig.node.json`).

Clean (manual)
- Remove `dist/` if needed.
- If TS build info causes issues: delete `node_modules/.tmp/`.

## Tests

Current state
- No test runner is configured yet (no `test` script, no `vitest/jest/playwright` config, no `*.test.*` / `*.spec.*` files).

If you add tests (recommended defaults)
- Prefer Vitest for unit/component tests in Vite projects.
  - Add: `vitest`, `@vitest/ui` (optional), `jsdom`, `@testing-library/react`.
  - Add scripts:
    - `test`: `vitest`
    - `test:watch`: `vitest --watch`
    - `test:ui`: `vitest --ui`

Running a single test (once Vitest exists)
- Single file: `pnpm vitest src/path/to/foo.test.ts`
- By name: `pnpm vitest -t "renders empty state"`
- Re-run changed tests: `pnpm vitest --changed` (if enabled in your setup)

If you add e2e tests
- Prefer Playwright.
  - Single test: `pnpm playwright test tests/example.spec.ts -g "scenario name"`

## Repository Conventions

### Project structure
- App entry: `src/main.tsx`.
- Top-level component: `src/App.tsx`.
- UI components: `src/components/ui/*` (shadcn-style).
- Shared utils: `src/lib/*`.

### Path aliases
- Use `@/…` for imports from `src/`.
  - Configured in `vite.config.ts` and `tsconfig*.json` (`@/*` -> `src/*`).

### ESLint
- Config: `eslint.config.js` using flat config + recommended rulesets.
- Ignore: `dist/`.
- Keep code passing `pnpm lint` and TypeScript `strict` mode.

## Code Style Guidelines

### Formatting (match existing code)
- Use double quotes for strings in TS/TSX imports and code.
- Semicolons: prefer no semicolons (most files omit them). Keep consistent within a file.
- Indentation: 2 spaces.
- Trailing commas: keep standard TS/JS trailing commas in multi-line objects/arrays when convenient.
- Keep lines readable; break long Tailwind class strings only when it improves maintenance.

### Imports
Order imports in this repo like:
1. External libraries (react, base-ui, etc.)
2. Blank line
3. Internal alias imports (`@/…`)
4. Blank line
5. Side-effect imports (CSS)

Examples
- `import * as React from "react"`
- `import { cn } from "@/lib/utils"`
- `import "./index.css"`

Prefer named imports when stable; use `type` imports for types:
- `import { clsx, type ClassValue } from "clsx"`

### React components
- Prefer function components.
- Prefer named exports for reusable components in `src/components/ui/*`.
- Keep component props typed explicitly:
  - Use `React.ComponentProps<"input">` / `ComponentPropsWithoutRef` when wrapping primitives.
  - Use `VariantProps<typeof …>` for CVA variants (pattern exists in `src/components/ui/button.tsx`).

### TypeScript
- `strict: true` is enabled; make changes type-safe.
- Avoid `any`. If unavoidable, isolate and justify via narrow scope.
- Prefer `type` over `interface` for component props/utility unions unless declaration merging is needed.
- Prefer discriminated unions over boolean-flag soup.
- Avoid non-null assertions (`!`) except at app boundaries where justified (e.g., root element lookup in `src/main.tsx`).

### Naming
- React components: `PascalCase` and file names `kebab-case.tsx` in `src/components/*` (existing style), `ui/*` follows shadcn naming.
- Hooks: `useSomething`.
- Utilities: verbs for functions (`cn`, `formatX`, `parseX`), nouns for constants.
- Booleans: `isX`, `hasX`, `canX`.

### Tailwind/shadcn/ui patterns
- Use the `cn()` helper from `src/lib/utils.ts` for className composition.
- Do not concatenate class strings manually when conditional logic exists.
- Prefer CVA (`class-variance-authority`) for variant-heavy components.
- Keep `data-slot` attributes (used in shadcn/base-ui components) intact.

### Error handling
- Prefer early returns / guard clauses.
- For user-facing failures, surface a clear message in UI; don’t silently swallow errors.
- For developer-only diagnostics, use `console.error` with actionable context.
- Avoid catching errors unless you can add context or recover.

### Changes, hygiene, and safety
- Don’t commit build artifacts (`dist/`).
- Minimize formatting-only diffs unless you are already touching the file.
- When adding dependencies, align with existing stack (Vite + React + TS + Tailwind/shadcn).

## Agent Notes

No Cursor/Copilot instruction files were found:
- No `.cursorrules`
- No `.cursor/rules/*`
- No `.github/copilot-instructions.md`

If such rules are added later, update this file to reflect them.
