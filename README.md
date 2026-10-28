# AVI — dh_frontend_avi

AI assistant/agent PWA for LiberSalus: chat, voice, and instruction execution
with context scoped by identity. This is the **only Next.js micro-frontend** in
the monorepo; the rest (landing, signin, signup, app) use Vite + React 19.

**Status:** shell — UI and mock interactions only, no `dh_avi` service or real AI.

## Scope

- Next.js (App Router) is used **only here**, as a deliberate exception. The
  Vite conventions still govern the other micro-frontends.
- AVI-specific adaptations of those conventions live in this README, not in the
  shared `frontend/docs/`.

## Stack

- Next.js 16 (App Router) + TypeScript + React 19.
- PWA: Serwist (`@serwist/next`) + `app/manifest.ts`.
- CSS Modules (no Tailwind) + `@/` path alias.

## Architecture (DDD)

```
src/
├── app/              # routes (App Router)
├── domain/           # types + repository interface (no framework deps)
├── application/      # AviService
├── infrastructure/   # MockAviRepository + composition root
├── presentation/     # AviApp (components)
├── shared/           # mock data
└── sw.ts             # service worker (Serwist)
```

## Adaptations vs the Vite conventions

| Vite rule | Next.js equivalent |
|---|---|
| `VITE_*` env vars | `NEXT_PUBLIC_*` |
| `vite.config.ts` base path | `next.config.ts` `basePath` |
| react-router / `ROUTE_PATHS` | App Router folders |
| `index.html` no-cache meta | `<meta http-equiv>` in root layout |

## Pending

- Deploy mode: `output: 'export'` (static) vs Node runtime — undecided.
- No-cache HTTP header location (nginx vs `headers()`), depends on the above.

## Remotes

- `origin` → `m4ck-y/dh_frontend_avi` (personal, private) — current primary.
- **Pending**: publish to the organization (`LiberSalus/ls_frontend_avi`). Once
  created, the organization remote becomes the **principal** (`origin`) and the
  personal repo stays as the secondary mirror.

## Run

```bash
npm run dev     # http://localhost:3005 (Turbopack; service worker disabled)
npm run build   # next build --webpack (generates sw.js)
npm run start   # serves the production build
```

## Docs

- `docs/FLOW.md` — navigation flow (Mermaid).
- `docs/SCREENS.md` — screens, fields, ASCII wireframes.
