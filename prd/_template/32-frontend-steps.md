# 32 — Frontend Build Steps (Claude Code sessions)

> TEMPLATE: **optional** — only if the domain has UI. Same four-part ritual as `20-steps.md`
> (Opening → Review checklist → Gate → Commit), numbered F1…Fn so backend and frontend step IDs
> never collide in `CONTEXT.md`'s checklist. Run these **after** the backend steps: the generated
> hooks must exist before a screen can consume them.

## Step F1 — Feature folder + routes

**Opening:** create `features/{{domain}}/` and the route files from `30-frontend.md`, rendering
static placeholder content. No data fetching yet.
**Review checklist:**
- [ ] routes exist in every slot listed in `30-frontend.md` (`@admin` / `@user`).
- [ ] sidebar nav entry added, gated to the right role.
- [ ] every string already goes through `useTranslations` — added to **all 6** locale files.
**Gate:** `pnpm dev` renders each route without error.
**Commit:** `feat(web): {{domain}} routes + feature folder`

## Step F2 — {{Primary screen}} + data

**Opening:** wire the generated hook `use{{Operation}}()`. No hand-written fetch, no `any`.
**Review checklist:**
- [ ] data comes only from generated hooks.
- [ ] loading, empty, and error states all render something deliberate.
- [ ] URL carries the state for filters/search; typing is buffered locally, committed on
      submit/blur.
**Gate:** browser-verified — {{a concrete interaction and its expected result}}.
**Commit:** `feat(web): {{screen}}`

## Step F3 — {{Detail / CRUD screens}}

**Opening:** build on `EntityDataTable`, `EntityFormDialog`, `EntityDeleteConfirm`,
`actionsColumn()`, and `crudMutationOptions()` — do not re-implement the table or dialog shells.
**Review checklist:**
- [ ] create / edit / delete round-trip verified in the browser, not just in tests.
- [ ] server validation errors surface to the user, not just the console.
- [ ] reference fields are comboboxes backed by their master table, never free text.
**Gate:** `pnpm check:dupes` under 2% (a new screen that copies an existing one will trip it).
**Commit:** `feat(web): {{domain}} admin CRUD`

## Step F4 — Polish: a11y, responsive, motion

**Review checklist:**
- [ ] no horizontal overflow at 360px.
- [ ] reduced-motion verified (`page.emulateMedia({ reducedMotion: 'reduce' })`).
- [ ] keyboard path through every interactive element; focus visible throughout.
- [ ] zero new Biome a11y warnings.
**Gate:** `pnpm lint` — zero new warnings; browser-verified at 360px and desktop.
**Commit:** `polish(web): {{domain}} a11y + responsive`

## Frontend definition of done

Every F-step committed, all screens browser-verified (not just typecheck-green — the bugs that
matter here only appear in a real browser), `pnpm typecheck && pnpm lint && pnpm test` clean,
i18n complete across all 6 locales, and `CONTEXT.md` updated with what was verified and how.
