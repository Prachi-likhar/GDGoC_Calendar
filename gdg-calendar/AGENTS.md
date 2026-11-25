# AGENTS.md: rules for the AI agent

You are building the GDG Event Calendar. Follow these rules in every session.

## Read order at the start of every session
1. `README.md`
2. `PROGRESS.md` (find where we stopped and the "Next steps")
3. `SKILLS.md`
4. The relevant file in `docs/`

## Mandatory bookkeeping (do not skip)
After **every** completed task or meaningful change:
1. **Append** an entry to `PROGRESS.md` using the template inside that file (date, what was done, files created/changed, decisions, issues, next steps). Never delete old entries.
2. **Update `SKILLS.md`** if you introduced a new library, pattern, convention, or reusable helper.
3. **Update `README.md`** if setup steps, env vars, scripts, or features changed.
4. Keep `docs/` accurate. If you deviate from a spec, update the spec and note the reason in `PROGRESS.md`.

## Engineering rules
- Build phase by phase following `docs/06-build-phases.md`. Do not start a phase until the previous one meets its acceptance criteria.
- Server: layered structure `routes -> controllers -> services -> models`. Validate every request body with Zod. Centralised error handler. Never trust client-supplied roles or IDs for authorisation.
- Client: functional components and hooks, API calls only through `client/src/api/`, no hard-coded URLs.
- Never commit secrets. Keep `.env.example` files updated.
- Use ES modules (`"type": "module"`) on both sides.
- Write small, readable commits and meaningful names. Add basic tests for services (conflict detection, template task generation, auth).
- Passwords hashed with bcrypt. JWT in an `Authorization: Bearer` header. Rate-limit auth routes. Use `helmet` and `cors` with `CLIENT_URL` only.
- All dates stored in UTC, displayed in IST (Asia/Kolkata) on the client.
- If a requirement is ambiguous, choose the simplest reasonable option, document it in `PROGRESS.md` under "Decisions", and continue.

## Definition of done for any task
- Code runs without errors, lint passes, manual test steps written in `PROGRESS.md`.
- Docs and bookkeeping files updated as above.
