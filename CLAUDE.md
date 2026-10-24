# AI Environment Instructions & Path Rules

## Directory Mapping
The project structure does NOT use a `src` folder. Everything is in the root:
- Components are in `./components/`
- Libraries/Helpers are in `./lib/`
- Data is in `./data/`
- Public assets are in `./public/`

## Path Alias Configuration (Crucial)
- The alias `@/*` must point directly to the ROOT directory `./*` (e.g., `@/lib/utils` resolves to `./lib/utils`).
- You are explicitly allowed to create `vite.config.ts`, `tsconfig.json`, `postcss.config.js`, `index.html` and a global CSS file in the root during your cloud session.

## Internal Refactoring Rules
- Animation library used: `motion` (imported as `motion/react` in components).
- If a component looks for `@/components/ui/` but the file is directly under `@/components/`, automatically create a `ui/` subdirectory or update the import path.
- If generic Next.js components like `next/image` or `next-themes` are found, mock them or replace them with standard HTML `<img>` tags and standard React state.
