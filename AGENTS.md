<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- UI copy is Spanish (es-PE); keep every user-facing string in Spanish.
- Design tokens live only in `src/styles.css` (oklch); components use semantic classes and utilities (`surface-card`, `card-lift`, `eyebrow`, `arch`, `photo-placeholder`) — no raw color classes.
- Company accounts: `public.empresas` is the 1:1 profile of `auth.users` (filled by the `handle_new_empresa` signup trigger from signup metadata); roles live only in `public.user_roles` checked via `has_role()` — never on the profile.
- Public impact counters read only the aggregate `impacto_publico()` RPC; never expose `operaciones` rows to anon.
- Private area lives under `src/routes/_authenticated/panel/*` (client-only gate); unbuilt sections render `ComingSoon` and are toggled via `disponible` in `src/components/panel/nav.ts`.
- Form validation rules (RUC, Peru phone, districts) live in `src/lib/validation.ts` and are shared by signup and profile; keep tests in `src/lib/validation.test.ts`.
- No seeded/sample business data in the database; empty states instead.
- AI assistant: signed-in chat persists via `/api/chat` (bearer + RLS); public pages use the floating widget hitting `/api/public/asistente`, which stores nothing, accepts only text parts and caps history/length because it is unauthenticated. Both share the system prompt in `src/lib/chat/prompt.server.ts`.
- Lot mutations use authenticated server functions; creation and reporting use service-only atomic database functions to prevent concurrent limit violations. Public reads use safe aggregate RPCs and signed photo URLs, never privileged reads of company profiles.
- Who may request a lot is decided by `puedeSolicitarLote` in `src/lib/tratos-reglas.ts` (has session, not the owner, lot published) and re-checked by `solicitar_lote_validado` in the database; `mercado_lotes` returns `empresa_id` only so the market can hide the action on a company's own lots. Keep the two checks in sync.
- Public lot photos depend on `anon` having EXECUTE on `has_role` and `foto_es_publica` (the storage read policy calls them); if either function is recreated, re-grant it or the market and passport pages silently lose their photos.
- Delivery certificates (`constancias`) are issued only inside `transicion_trato` (confirm = deal completed + lot delivered + certificate, atomically); the public check returns only the fields in `CAMPOS_VERIFICACION_PUBLICA` (`src/lib/constancia.ts`), whose `huellaConstancia` must stay identical to `hash_constancia` (pinned by tests). The home "operaciones completadas" counter is the certificate count — never add a second certificate document.
- `listarMisTratos` reads lot and counterpart rows with the admin client only for ids already scoped to the caller's own deals, because RLS hides another company's lot from the buyer.
