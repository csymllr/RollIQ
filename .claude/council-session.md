# Council Session: RollIQ code review and design direction for growth

## Topic

Review the current RollIQ bowling app codebase and determine the best design decisions for growing it from a personal project into a useful tool for the broader bowling community.

## Optimist

**The data model is already community-grade, not just personal-grade.**

The schema in `src/types/db.ts` is doing far more work than a personal tracker needs. The `bowlers` table stores PAP, axis tilt, axis rotation, rev profile, speed profile, style type, and typical miss — a full fitting profile that most pro shop software charges money to maintain. The `frames` table captures `ball_id` per frame, `leave_type`, `result_type`, and `converted` alongside raw pin counts. The `sessions` table records lane pair, center name, event type, and stores a `pattern_snapshot` as JSON so the oil pattern context is preserved even if the pattern catalog changes. This is not a hobbyist data model; it is the foundation of what a shot-tracking analytics platform looks like. The work of designing this correctly is already done, and it only compounds in value as users accumulate sessions.

**The scoring engine is clean, tested, and ready to power aggregate analytics.**

`src/lib/scoring.ts` is a pure functional module — no Vue reactivity, no Supabase, just frame inputs and frame results. It correctly handles the 10th frame edge cases (sequential strikes, bonus roll availability), produces per-frame `resultType` and `cumulative` values, and ships with a spec file (`scoring.spec.ts`). That purity means it can be imported server-side in a Supabase Edge Function without modification. This is the critical unlock for community features: the same logic that powers live scorekeeping can also power backend-aggregated leaderboards, rolling averages, spare conversion rate by leave type, and per-ball performance breakdowns — all without rewriting a single line of scoring logic.

**The AI spec lookup paired with the structured catalog creates a defensible moat.**

Most bowling apps ask users to type in cover stock and core from memory, producing garbage data. RollIQ's approach is layered: the `ballCatalog.ts` seed data covers 13 brands and roughly 150 models with structured `role_tag`, `cover_type`, and `finish_surface` fields, auto-populating the form on model selection. When a ball is not in the catalog, `useFetchBallSpecs` calls GPT-4o-mini with a constrained enum schema — meaning the AI's output is normalized to the same vocabulary as the catalog (`"Solid Reactive"`, `"benchmark"`, etc.) rather than free text. This means every ball in every user's arsenal, whether seeded or AI-fetched, shares a queryable ontology. That vocabulary is what makes cross-user analysis possible: "show me average score by role tag on 40-foot house shots" becomes a real query when the data is clean. No competitor is doing this.

**The layout system is the kind of domain-specific depth that builds word-of-mouth among serious bowlers.**

The `BallEditView.vue` layout presets — Storm's `pin × pap × mass bias` system alongside dual-angle with separate 1H/2H preset tables — are not generic UX features. They reflect the actual vocabulary that pro shop operators and competitive bowlers use. A bowler looking at their arsenal can see `5×4×2` on their benchmark ball and `3×4.5×2` on their strong asym and immediately understand the intended reaction shape difference. This specificity is what turns a general "ball tracker" into something a 210-average league bowler tells their teammates about. The `layout_text` field is free-form, so bowlers using the Pin Buffer system or any other notation can still enter what they know. The presets reduce friction for the majority while not locking out edge cases.

**The Supabase + Vue 3 + Vite stack positions this to scale from zero to thousands of users without infrastructure changes.**

Supabase's row-level security model means multi-user isolation is a configuration concern, not a code concern — each user's balls, sessions, and bowler profile are already scoped by `bowler_id` and `user_id` foreign keys. Supabase Edge Functions can run the scoring aggregations. Supabase Realtime can power a live session view where a coach and bowler watch the same scorecard update. The Vue 3 Composition API stores (`useArsenalStore`, `useSessionsStore`, `useBowlerStore`, `usePatternsStore`) are already written as independent Pinia modules, which means adding a new data domain — say, a `useTournamentsStore` or `useCoachStore` — follows an established, low-friction pattern. The architecture does not need to be rethought to grow; it needs features added to a pattern that already works.

## Pessimist

### Risk 1: The OpenAI API key is exposed in the compiled bundle and will be stolen within days of public launch

`VITE_OPENAI_API_KEY` is a Vite public env variable. Everything prefixed `VITE_` is inlined into the JavaScript bundle at build time and shipped to every browser that loads the app. Any user who opens DevTools, any bot that scrapes the Vercel deployment, or anyone who downloads the bundle with `curl` can extract the key in under a minute. There is zero obfuscation; the string `Bearer sk-...` appears literally in the compiled output.

The concrete failure sequence: app goes live, a bot or a curious user pulls the key, they run OpenAI calls against it at scale, the billing account accumulates hundreds or thousands of dollars in charges before it is noticed. OpenAI's automated abuse detection sometimes catches this within hours; sometimes it does not. Even if they catch it, the account holder is liable for charges incurred before the key is revoked. This is not a theoretical risk — exposed Vite/React OpenAI keys are one of the most common causes of surprise billing events for indie developers. The fix is non-negotiable before any public release: the OpenAI call must move behind a server-side function (Vercel Edge Function, Supabase Edge Function, or similar). The client must never hold the key.

### Risk 2: There are no Row Level Security policies visible in the codebase, meaning every authenticated user may be reading every other user's data right now

The Supabase queries are written with the implicit assumption that the database enforces per-user isolation, but nothing in this repository demonstrates that RLS is actually enabled and correctly configured. In `arsenal.ts` line 29: `supabase.from('balls').select('*').order('created_at')` — no `.eq('bowler_id', ...)` filter is applied client-side. If RLS is not active on `balls`, `sessions`, `games`, `frames`, and `bowlers`, then every logged-in user receives every other user's data in that single query. This would not be caught during solo development because there is only one user.

The `bowler.ts` store uses `.maybeSingle()` with no user ID filter. That works correctly only if RLS silently scopes the query to the current user's rows — a hidden, untestable dependency on a database configuration that is not version-controlled anywhere in this repository. If the Supabase project is ever cloned to a staging environment, migrated, or an RLS policy is accidentally dropped, data isolation disappears silently with no error thrown anywhere in the application code. Before inviting a second user, the RLS policies need to exist as SQL migration files in `supabase/migrations/` and be treated as code.

### Risk 3: The static ball catalog is already inconsistent, and the AI fallback will corrupt user data with confident hallucinations

The catalog in `ballCatalog.ts` is already internally inconsistent. Hammer entries on lines 66–68 use the non-standard cover type string `'Reactive'` instead of any of the six allowed enum values (`'Solid Reactive'`, `'Pearl Reactive'`, etc.). Those balls will be filtered, sorted, or displayed incorrectly by any future code that checks cover type against the enum vocabulary. The `core_type` field is absent from every catalog entry.

The AI fallback compounds this. When a user enters a ball not in the catalog, `useFetchBallSpecs` calls GPT-4o-mini and persists its response directly to the `balls` row with no verification layer. GPT-4o-mini's training data for niche bowling ball core names and factory surface specs is unreliable — it will confidently return plausible-sounding but wrong values. A user who owns a Motiv Jackal Ghost might get a correctly labeled cover type but a fabricated core name that does not exist. That incorrect data is now permanently in their record, silently degrading any future analytics built on it. There is no human review step, no flagging mechanism, no source citation, and no way for the user to know the AI invented something. As the catalog ages and new balls ship, the proportion of users hitting the AI fallback grows, and the data quality problem compounds across the user base.

### Risk 4: The one-bowler-per-user constraint is baked into the data model and will require breaking migrations to undo

`bowler.fetchMine()` calls `.maybeSingle()` with no filter. `bowler.upsertMine()` conflicts on `user_id`, enforcing exactly one profile per auth account. Every downstream write operation — creating balls, creating sessions — inherits the single `bowler_id` from `bowler.profile.id`. This works for a personal app.

The moment the scope expands even modestly — a pro shop operator logging balls for customers, a coach tracking multiple students, a junior league coordinator managing young bowlers who do not have their own accounts — the entire data model requires structural surgery. The `bowlers` table would need a relationship to `auth.users` that is optional or mediated by a separate roles/permissions table. Every store's fetch logic changes. The router's auth assumptions change. This is not "add a feature"; it is a breaking schema migration on production data. The choice to enforce one-bowler-per-user should be an explicit, documented architectural decision with a written plan for how to undo it — not an accidental artifact of calling `.maybeSingle()` without a filter.

### Risk 5: The router's auth guard uses a polling loop with no timeout, producing silent infinite blank screens on any network hiccup

In `router/index.ts` lines 24–27, the navigation guard waits for `auth.loading` to become false using a `setInterval` that fires every 50ms with no maximum wait time and no error state. If `supabase.auth.getSession()` hangs — due to a network issue, a Supabase incident, or edge-case cold-start latency on Vercel — this loop runs indefinitely. The user sees a blank screen with no spinner, no error message, no timeout, and no recovery path.

There is also a subtler ordering risk: `auth.init()` is async, but `createRouter` runs synchronously. On a cold page load, the router can process the initial navigation before `init()` has finished, making `auth.loading` true at exactly the moment the guard runs — which is the intended case for the polling workaround. But the polling fix adds latency to every subsequent navigation as well, because the guard rechecks `auth.loading` on every route change. A Promise-based approach — where `init()` resolves a single awaitable that the guard awaits once — eliminates both the blank-screen risk and the per-navigation overhead. The current implementation is a band-aid that will become a support burden as more users hit it on slow mobile connections.

## Neutral

**1. The hardest question is not technical — it is about the target user and their trust threshold.**

The current system has a 1:1 assumption baked into every query: one Supabase auth user maps to exactly one bowler row (`maybeSingle()` in `bowler.ts`), and the ball and session queries in `arsenal.ts` and `sessions.ts` fetch without an explicit `bowler_id` filter in the client-side call, relying entirely on Supabase Row-Level Security to scope data. That architecture can be correct, but it creates a silent dependency: the security of every user's data is contingent on RLS policies being correctly authored, applied, and tested against all table relationships. An RLS misconfiguration is the class of bug that passes all client-side tests and silently exposes another user's balls or session history. Before any public launch, those policies need to be audited and integration-tested. This is not a "can we add it later" item — it is the gate that determines whether the tool is safe for multiple users at all.

**2. The OpenAI API key is client-visible; at any scale beyond a single known user, that is a billing and abuse surface.**

`useFetchBallSpecs.ts` reads `VITE_OPENAI_API_KEY` from the Vite environment, which means the key is compiled into the JS bundle and visible to any user who opens browser DevTools. For a personal tool, this is a pragmatic shortcut. For a shared product with unknown users, any one of them can extract that key and make arbitrary OpenAI calls against it at the project owner's expense. The fix — wrapping the call in a Supabase Edge Function — is well within the existing stack and is not architecturally disruptive. The open question is timeline: moving this before the second user sees the feature versus moving it after. That is a risk tolerance decision, not a technical one.

**3. The static ball catalog is a maintenance liability whose cost scales with community size and brand release cadence.**

The catalog in `ballCatalog.ts` covers 13 brands and roughly 150 models hardcoded as TypeScript. Major brands (Storm, Roto Grip, Hammer, Motiv) each release several balls per quarter. There is no stated maintenance process — no versioning, no source-of-truth citation, no update workflow. For a personal tool, this is tolerable. For a community tool, stale catalog data undermines credibility with exactly the serious competitive bowlers who are the most valuable early adopters. Three realistic paths exist: (a) keep the file static and accept a defined update cadence, (b) move catalog data to a Supabase table so it can be updated without a code deploy, or (c) treat the AI fallback as the primary lookup and shrink the static catalog to a smaller high-confidence seed. Each path has different cost and different trust implications. What is not yet known: whether community bowlers will notice a missing ball and complain, or simply use the AI fallback without friction. That is an empirical question only real users can answer.

**4. The data model captures outcomes but not decisions — which bounds the analytical ceiling.**

The schema records scores, ball used per frame, leave type, result type, and pattern metadata at the session level. What it does not record is anything about in-game adjustment decisions: when a bowler moved their feet, changed their target, or switched balls mid-game and why. The `frame_note` free-text field is the only escape hatch for this information, and free text is analytically opaque. For the current personal-tracker use case this is sufficient. For any future "recommend a ball change" or "identify your miss pattern" feature, the system will be constrained by what was captured at input time. Adding structured fields later requires schema migrations and risks breaking the consistency of historical data. The decision of how much structure to impose at input time is a tradeoff between future analytical richness and present-day entry friction — and higher friction directly threatens whether bowlers use the tool consistently enough to accumulate meaningful data.

**5. "Growth into a community tool" is not a single destination — it is at least three distinct products with incompatible near-term requirements.**

There are meaningfully different versions of the transition: (a) a publicly hosted single-player app that any bowler signs up for and uses privately — this primarily requires the RLS audit, the API key proxy, a catalog maintenance plan, and a Vercel deploy; (b) a social or comparative tool where bowlers see aggregated community data, compare arsenals, or follow each other's sessions — this requires explicit data-sharing consent flows, anonymization decisions, and a content stance; (c) a pro-shop or coaching tool where one operator manages multiple bowler profiles — this requires a tenant or role model that does not currently exist in the schema. These paths are not on a linear roadmap. They diverge at the data model level, the security model level, and the UX level. The most important design decision to make first is which of these is the actual next step, because that answer changes which current limitations are urgent and which can wait.

## Synthesis

### Consensus signals — high-confidence findings

All three members agree on these points without qualification:

1. **The foundation is legitimately strong.** The schema (PAP, axis tilt, ball-per-frame tracking, pattern snapshots), the pure scoring engine, and the Pinia/Supabase architecture are not personal-project hacks — they are the correct bones for a community tool. This is rare; most projects hit a wall before they're ready. RollIQ does not need a rewrite to grow.

2. **The OpenAI key in the client bundle is a hard blocker for any public release.** All three flagged it independently. At personal/solo use it's a pragmatic shortcut. The moment an unknown second user touches the app, the key is extractable and the billing risk is real. Moving it behind a Supabase Edge Function is the specific fix — it's already in the stack, it's ~30 lines of Deno, and it must happen before any public Vercel URL is shared.

3. **RLS policies must be written, committed to the repo, and verified before user two exists.** The queries work correctly for solo use precisely because there's only one user's data to fetch. The data isolation the app assumes is not proven anywhere in the codebase. This is not a "nice to have" — it is the gate that determines whether the app is safe for multiple users at all.

4. **The static ball catalog has a maintenance problem.** Whether the fix is moving it to a Supabase table, defining an update cadence, or leaning harder on the AI fallback, the current approach (hardcoded TypeScript with no update workflow) doesn't scale with community use — especially given the existing `'Reactive'` inconsistency that already exists in the Hammer entries.

---

### Core tension — where Optimist and Pessimist sharply disagree

**"The architecture scales without rethinking" vs. "The architecture has silent, untestable dependencies that will break at scale."**

The optimist is correct that Supabase RLS is the right model — isolation as database configuration rather than application code is a mature, proven approach. The pessimist is correct that RLS-as-configuration is only safe when the policies are written, tested, and version-controlled. These positions are not actually in conflict: the architecture is right, but it is currently *half-finished*. The one-bowler-per-user constraint is the sharpest version of this — it is not wrong for now, but it is undocumented and will require breaking schema surgery the moment coaching or pro-shop use cases enter the picture. That decision deserves to be explicit, not accidental.

---

### Open questions — must be resolved before the next design decision

From Neutral's analysis, three questions determine which current gaps are urgent vs. deferrable:

1. **Which community model comes first?** Private multi-user (anyone signs up, uses it solo), social/comparative (bowlers see each other's data), or coaching/pro-shop (one operator manages multiple bowler profiles). These three paths diverge at the schema and security model level. Choosing the first one makes the to-do list concrete.

2. **Will catalog staleness hurt or not?** If serious competitive bowlers — the most valuable early adopters — try to add a ball released in the last 6 months and it's not in the catalog, does the AI fallback feel like a feature or a failure? Only real users can answer this, but the answer should drive whether catalog maintenance is tackled before or after launch.

3. **How much input friction is acceptable?** The `frame_note` free-text field is the only place bowlers can record *why* they made a decision. Any future "recommend a ball change" or "identify your miss pattern" feature is bounded by what was captured. More structure at entry time means richer future analytics but slower entry — and inconsistent entry destroys the data advantage the app is building.

---

### Recommendation: **Proceed with conditions**

The codebase is in a better position than most personal projects that attempt this transition. The conditions that must be met before inviting any second user are exactly three, in priority order:

1. **Verify and commit RLS policies** — write `supabase/migrations/` SQL that proves data isolation exists and is tested. This is the safety gate.
2. **Move the OpenAI call to a Supabase Edge Function** — the key must never touch the browser bundle. This is the billing gate.
3. **Fix the `ballCatalog.ts` `'Reactive'` inconsistency** and decide on a catalog maintenance approach. This is the data integrity gate.

Once those three are cleared, the path to a genuinely useful community tool is additive — features built on a solid foundation — rather than corrective.
