# CLAUDE.md — 20days

Lean index for Claude/humans. Deep detail lives in `docs/` — load it only when working on that area.

## What 20days is

A small, private, **iOS-first** life-satisfaction tracker. The user defines **exactly 3 life pillars** and scores each **once a day**. The app quietly collects data and shows the trend. When a sustained negative trend appears, it triggers a calm **Verdict Day** to help the user judge: real problem, or temporary illusion?

**Philosophy — do not drift:**
- **Help the user *recognise* a problem (or that it's a passing dip). Do not treat it.** Treatment is signposted elsewhere (BetterHelp). No therapy, diagnosis, or clinical claims.
- **Agency always** — every prompt is dismissible. No guilt, no streaks, no dark patterns.
- **Privacy is a feature** — intimate data stays on-device by default.

## Locked decisions

| Area | Decision |
|---|---|
| Platform | React Native + Expo (SDK 57), **iOS-first**. Indie/solo scale. |
| Data & privacy | **Local-first**, no account. Optional encrypted iCloud backup later. **No Supabase/Vercel for MVP.** |
| Pillars | **Exactly 3**, user-defined name + optional description. Editable at Verdict Day / priorities check-in. |
| Daily input | **Score + optional note** per pillar, one entry/day, < 1 min. Scale **1–5 segmented fill** (tap to score; filled bars in the pillar's trend colour — Brand Guidelines §06). `scale_version` 2; granularity still open to validation — see `docs/SPEC.md`. |
| Reminders | **One gentle daily local notification. No streaks / gamification.** |
| Cadence | **Hybrid**: trend-triggered Verdict Day (primary) + dismissible ~30-day priorities check-in (secondary). |
| UI | **Material 3 Expressive** per **Brand Guidelines v1** (`docs/DESIGN.md`): warm **Cream/Ink** neutral base + **dynamic trend-scale accent** (teal→ochre). Floating pill nav (neutral); segmented-fill check-in; trend colour reports trends only, never chrome. |
| Fonts | **Bricolage Grotesque** (300/400/500/600) → logo, headings, display, numbers. **Roboto** (300/400/500) → body / UI / labels. |

## Where things live

- `docs/RESEARCH.md` — evidence review (cite before changing data-collection / trend / Verdict-Day logic).
- `docs/SPEC.md` — daily check-in, trend engine, Verdict Day, data model.
- `docs/DESIGN.md` — M3 Expressive, fonts, dynamic color.
- `FUTURE_IDEAS.md` — post-MVP parking lot (e.g. AI accountability-partner chatbot). Don't scope-creep into MVP.

## Tech stack

Expo SDK 57 (React Native 0.86, React 19) · **Expo Router** (typed routes) + TypeScript (strict) · **react-native-paper** (Material 3) + custom Expressive theme · **expo-sqlite** + **Drizzle ORM** for the time-series · **expo-sqlite/kv-store** for settings (Expo-Go friendly; MMKV was dropped to avoid a custom dev build) · **Zustand** for reactive app state · **@material/material-color-utilities** for pure-JS dynamic color (no native dynamic-color module) · trend chart is a hand-rolled **react-native-svg** day-bar chart (`DayBars`, no chart lib) · **expo-notifications** for the one local daily reminder · fonts via **@expo-google-fonts/**. Everything runs in **Expo Go** — no prebuild needed for the scaffold.

## Repo map

```
/                CLAUDE.md, FUTURE_IDEAS.md, app.json, package.json, vitest.config.ts
/docs            RESEARCH.md, SPEC.md, DESIGN.md
/src/config.ts   scale (0–10), support URL
/src/app         Expo Router routes (flat, NO tab bar): _layout · index (Trend = home) · today (check-in, full screen, once-a-day gate + skip flag) · verdict (modal) · onboarding — pillars editing is a sheet on Trend, not a route
/src/db          schema.ts (Drizzle) · client.ts (open + initDb) · repo.ts (typed queries) · pillarDiff.ts (PURE pillar-edit diff, tested)
/src/trend       engine.ts (PURE, tested) · series.ts (PURE) · pillars.ts (per-pillar trends + personal copy helpers, tested) · refresh.ts (glue) · engine.test.ts · pillars.test.ts
/src/verdict     Verdict-Day narrator seam (tested): index.ts (generateNarrative: on-device model→templated fallback) · types.ts (contract) · questions.ts (per-category templated reflection Qs) · notes.ts (relevance-selects the user's own notes) · templatedNarrator.ts (deterministic floor) · applePrompt.ts (PURE: prompt, schema, `isReflective` advice-filter, `composeBoundedQuestions` bounded-hybrid) · appleNarrator.ts (on-device Apple Foundation Models — VERIFIED on device, no cloud; importing it retires Expo Go)
/src/theme       fonts.ts · trendColor.ts · theme.ts (seed→MD3) · ThemeProvider.tsx
/src/state       store.ts (Zustand)
/src/settings    settings.ts (kv-store)
/src/lib         date.ts · notifications.ts · haptics.ts (tick/success, fire-and-forget)
/src/theme       + expressive.ts (dynamic dial: M3 springs, shape, colour, copy) · brand.ts (tokens + hexMix/vivify/onColorFor) · pillarMeta.ts (pillar identity: icon + picker colour)
/src/components   ScorePicker(segmented, springs+haptic) · ScoreBadge(scallop+number) · DayBars(one pixel-column per day) · TrendChip · NestedRings · SegmentedFilter · Fab · ReminderSheet · AboutSheet · PillarsSheet (all three share the slide-up sheet pattern) · PillarPicker · WipeTransition · Icon(pixelarticons, MIT, inlined) · Wordmark · AnimatedCard · PressableScale · Scallop · Illustration · AnimatedSplash
```

## Key terminology

- **Pillar** — one of the user's exactly-3 life areas (name + optional description). Editable; edits are snapshotted to `priorities_revisions`.
- **Entry** — one score (1–5) + optional note for one pillar on one local day. Unique per `(pillar, date)`; re-saving upserts.
- **Composite** — the daily mean across pillars; the series the trend engine primarily judges.
- **Trend state** — `insufficient | stable | improving | declining`; also drives the UI seed color.
- **Verdict Day / checkpoint** — the re-evaluation moment shown when a sustained *declining* trend is detected. Shows the user's own data (per-pillar day-bar strips for what's sliding), a calm narrator reading (summary + reflection questions grounded in their data + their own most-telling notes, via `src/verdict`), an optional written reflection (saved to `verdict_events.reflection`, local-only), then three doors: ignore / adjust priorities / get support.
- **Verdict narrator** — `src/verdict/generateNarrative`: builds the checkpoint's summary + reflection questions + quoted notes. Prefers on-device **Apple Foundation Models** (private, never cloud — Phase 2, inert until a dev build activates it) and falls back to a deterministic **templated** narrator (the always-available floor). *Reflective/interpreter, never advice/author* (docs/RESEARCH.md, FUTURE_IDEAS.md #1).
- **Priorities check-in** — the calm, dismissible ~30-day review of whether the 3 pillars still fit (the hybrid cadence's secondary path). *Not yet built.*
- **Cooldown** — after a Verdict Day, re-triggering is suppressed for `cooldownDays` (default 14) to avoid nagging.

## How it works (data flow)

1. **Daily check-in** (`(tabs)/index.tsx`) → `repo.upsertEntry` writes to SQLite.
2. Any write calls `trend/refresh.refreshTrend()` → reads the last-20-days rows (`repo.getScoreRowsSince`) → `series.buildDailySeries` (fill gaps with null) → `engine.detectTrend` (Theil–Sen slope + magnitude gate) → `engine.shouldTriggerVerdict` (declining + enough data + past cooldown) → pushes `{trendState, verdictReady}` into the Zustand store.
3. **Theme** (`theme/ThemeProvider`) reads `trendState`, maps it to a seed color, and rebuilds the MD3 palette — so the whole UI subtly shifts with the trend.
4. **Trend tab** renders the sparkline + a checkpoint CTA when `verdictReady`.
5. **Verdict screen** shows the user's real logged series (anti-recall-bias), records the chosen door to `verdict_events`, sets `lastVerdictAt`, and starts the cooldown.

### How the important components work
- **`src/trend/engine.ts`** — the heart. PURE (no RN imports) so it's unit-tested in Node. Thresholds live in `DEFAULT_TREND_CONFIG` and are provisional `[DESIGN DECISION]`s. Robust slope + magnitude-relative-to-SD gate + min-data gate + cooldown all guard against false alarms on noisy single-item data.
- **`src/db`** — `initDb()` runs idempotent `CREATE TABLE IF NOT EXISTS` (swap to Drizzle migrations before shipping). `repo.ts` is the only place that touches the DB.
- **`src/theme`** — dynamic color is pure JS (`material-color-utilities`); `fonts.ts` maps display/headline/title → Bricolage, the rest → Roboto.

## Dev commands

```
npm install
npx expo start            # dev server; press i for iOS simulator, or scan QR with Expo Go
npm run ios               # build + run iOS
npm run typecheck         # tsc --noEmit
npm test                  # vitest (trend engine)
```

## Testing

- **Unit (runs anywhere, no simulator):** `npm test`. The trend engine + series builder are pure TS with full vitest coverage in `src/trend/engine.test.ts` (slope, decline/stable/improving, gaps, insufficient-data, cooldown). This is where trend-logic changes must be proven.
- **Typecheck:** `npm run typecheck` (strict).
- **End-to-end (manual, in the app):** `npx expo start` → open in Expo Go / iOS simulator, then walk the golden path:
  1. First launch → **onboarding** → enter 3 pillars → Start.
  2. **Today** tab → score the 3 pillars + a note → Save.
  3. **Trend** tab → sparkline shows today's point; "N of 20 logged".
  4. Force a Verdict Day without waiting 20 days: temporarily lower `DEFAULT_TREND_CONFIG.minLoggedDays` (e.g. to 3) in `src/trend/engine.ts`, log 3–4 descending scores across a few days, reopen **Trend** → the checkpoint CTA appears → open it → try each door. Revert the config after.
  5. **Settings** → rename a pillar (writes a priorities revision) and toggle the reminder.
- **Automated e2e (not yet wired):** recommended path is **Maestro** (`.maestro/*.yaml` flows) driving Expo Go — lightest for an indie RN app. Add when the flows above stabilize.
- **Reset state between manual runs:** delete the app from the simulator (clears the SQLite DB + kv-store), or add a debug "reset" button that drops tables.

## Conventions

- Keep it lean, local-first, privacy-preserving. Any new network dependency needs real justification.
- Changing data/trend/Verdict-Day behaviour → read `docs/RESEARCH.md` first; keep `[HIGH]` rules intact, note rationale when revising `[DESIGN DECISION]` items.
- Trend logic lives in `src/trend` as pure functions (no RN imports) so it stays unit-testable.
- Consume theme tokens; no scattered hex values.

## Open decisions (validate before/at build)

See `docs/SPEC.md`/`RESEARCH.md`: scale granularity (0–10 vs 1–5 vs 1–7), exact trend algorithm + thresholds, Verdict-Day copy, referral/crisis cutoffs, priorities-check-in interval, iCloud backup.

## Status

**Scaffold + usability pass + brand implementation done.** Verified each round: `tsc` clean · 14/14 unit tests · iOS JS bundle via `expo export`. Earlier round ran in Expo Go on iPhone 17 Pro sim (onboarding → Today → tab nav → Trend, DB reads/writes confirmed). **The brand round has not yet been run on a simulator — the warm Cream/Ink palette, fonts, and screens need an eyes-on pass.** expo-notifications stays limited in Expo Go (needs a dev build).

Built: animated splash (wordmark on Ink), onboarding (preset chips, pick-3), Today check-in (segmented 1–5 fill, per-pillar trend tags), Trend (pillar rings recoloured by per-pillar trend + composite hero + trend-coloured sparkline + checkpoint), Verdict Day (3 doors), Settings, floating pill nav (hand-rolled Feather icons), local-first DB, pure/tested trend engine, **brand theme (warm base + dynamic trend accent)**, Bricolage/Roboto fonts wired.

**M3 Expressive + dynamic dial (all screens):** an expressiveness dial (acute today + chronic trend → `useAppStore.dial`) drives spring motion, corner radius, accent vividness, and copy — grounded↔relaxed, warm at both poles, layout fixed. Motion on RN `Animated` (no worklet dep): `AnimatedCard` entrances, `PressableScale` press-squish, `SuccessBloom` (M3 scallop) on save; Reduce-Motion honoured. See `docs/DESIGN.md §3`. Verified on iOS sim across Today/Trend/Onboarding/Settings + full `expo export`; `tsc` + 14/14 tests green. Illustration slots are placeholders (empty-state/support only). **Motion feel best judged live — `today_motion.mp4` in the session scratchpad.**

**Alive + hyper-personal round (July 2026):** score bars ripple-fill with a spring + haptic tick (`expo-haptics`, works in Expo Go); rings draw in on mount (dashoffset, staggered); sparkline halos "you, today"; save fires a success haptic; FAB shows a check once logged. Personal copy from the user's own data: `pillarHighlight`/`decliningPillars`/`joinNames` in `src/trend/pillars.ts` (pure, tested) put pillar names into the Trend insight line, checkpoint, and Verdict; `todayGreeting(dial, hour)` is time-of-day aware; empty state counts down to the first trend read. A11y: `onColorFor` (brand.ts) picks Ink/white per fill luminance (fixes white-on-ochre chips/badges); `SCALE_LABELS` Rough/Great now anchor the score picker. `pillarHighlight` only calls a pillar "on the way up" when its latest score sits at/above its own window mean (an improving slope that just dipped reads as a dip, not a climb — stays quiet over claiming steadiness). Pillars editing unified into `PillarsSheet` (same spring bottom-sheet as About/Reminder; `/pillars` route removed, Verdict "adjust" opens it via `useAppStore.pillarsOpen`). Verified: `tsc` · 24/24 tests · `expo export` · eyes-on sim (Trend/Today/pillars sheet).

**Pixel-identity round (July 2026):** pixels are the app's data language — one day, one cell. `DayBars` replaced the sparkline everywhere (Trend + Verdict): 20 rounded columns, height = score, colour = that day's score on the brand scale, missed days = baseline dots, today haloed. Pillar identity (`theme/pillarMeta.ts`) follows each pillar: icon on its Today card + ring legend. Verdict now quotes the user's recent notes ("In your own words", `repo.getNotesSince`, deduped by day) — anti-recall-bias with their own words. **Pixel icon chrome was tried and reverted** (user: clashes with Bricolage + the app's roundness, and too small to be characteristic) — icons stay feather-style strokes; the pixel language lives only in the day-cell data viz. Also deliberately NOT done: pixel fonts / full retro takeover (fights calm-premium brand, a11y, no-gamification guardrail). Verified: `tsc` · 24/24 · `expo export` · eyes-on sim (Trend/Today/Verdict).

**Pillar-integrity round (July 2026):** pillar edits no longer rename rows in place (that let a swapped-in pillar inherit the old pillar's history, and the picker's reorder-on-toggle could silently transplant histories across unrelated pillars). `src/db/pillarDiff.ts` (pure, tested) matches picked names to rows **by name, never index**: kept names keep id + history (reorder = sortOrder only), swapped names archive the old pillar (`archived_at` — history kept in DB, hidden from UI) and create a fresh row that starts 'insufficient'. `repo.applyPillarEdit` applies the diff in one transaction and snapshots `priorities_revisions` AFTER the change, only when changed. Composite keeps all historical entries (day means stay historically true); a replacement records a `pillar_change` verdict event, restarting the checkpoint cooldown so it can't fire about a pillar the user just acted on. `verdict_events` is now the single cooldown source (`getLastVerdictAtMs`, seconds→ms; kv `lastVerdictAt` removed). Also: Trend reloads via `PillarsSheet.onSaved` + resets the pillar filter (a Modal closing fires no focus event — rings/filter were stale after edits); onboarding double-tap guarded (ref + idempotent `createInitialPillars`); `upsertEntry` defaults `scaleVersion` to `SCALE.version`; onboarded-flag-but-empty-DB desync redirects to onboarding. Accepted as-is: same-day swap keeps `hasToday` true; midnight-crossover save; Verdict swipe-dismiss records nothing (agency). Verified: `tsc` · 32/32 tests · `expo export` · sim cold-launch on the new bundle (Trend renders, DB reads fine); **swap-flow tap-through on sim still needs a hand** (no UI automation tool on this machine).

**Confidence model + neutral-fill (July 2026):** replaced the hard "insufficient" blackout with an always-on trend + a confidence flag. Unlogged days now count as the **scale midpoint (neutral 3)** in the trend maths and the Average stat (`DEFAULT_TREND_CONFIG.neutralValue`, `detectTrend` fills internally; `statsOf` in index fills for the average, real count for "days logged") — an "unknown = neutral" prior that regularises a sparse window toward *steady* instead of alarming, and lets a trend always show. `TrendResult.confident = realLoggedDays >= minLoggedDays(14)`; `loggedDays` counts REAL entries only. **The Verdict Day still gates on `confident`** (`shouldTriggerVerdict` → `!result.confident` blocks) so we never escalate on mostly-inferred data — the 14 is now an internal confidence/verdict gate, never surfaced. The day-bar chart stays honest (gaps = baseline dots, no fabricated bars). Trend UI: the empty-state line + `pillarHighlight` now key off `confident` (not `trendState === 'insufficient'`, which `detectTrend` no longer returns — the union member survives only as the store's pre-refresh default). Empty-state copy is now "Still learning about you — keep checking in and your trend comes into focus" (no exposed 14, no "read" jargon). Verified on sim in the low-confidence state (3 logged days): learning line shows, no highlight, Average shrinks to ~3, chart shows only real days. `tsc` · 33 tests · engine tests updated (confidence + neutral-fill regularisation cases).

**On-device polish (July 2026):** theme locked to the brand light palette — `ThemeProvider` ignores `useColorScheme`, `userInterfaceStyle: "light"` in app.json + `UIUserInterfaceStyle Light` in the generated Info.plist (system dark mode turned the app Ink-on-Ink on device; `buildTheme`'s dark branch is now unused but kept). Trend empty state simplified: scallop illustration + centered countdown removed; one left-aligned body line under the headline — "Your first read comes after 14 logged days — N to go" (the old "N more days" read as "of 20" and confused; 14 = `minLoggedDays`, not the window). Today screen compacted to fit one viewport (displayMedium header, tighter card/list/save spacing, ScoreBadge 48). Note input was hidden behind the keyboard → Today's ScrollView now has `automaticallyAdjustKeyboardInsets` + `keyboardShouldPersistTaps="handled"` + `keyboardDismissMode="interactive"` (iOS-native keyboard avoidance, no new dep).

**Native-build gotcha (July 2026, do not "fix"):** `npx expo run:ios` builds black-screened (`Cannot find native module 'ExpoAsset'`, zero Expo modules registered) because SDK 57's **prebuilt** `ExpoModulesCore.xcframework` resolves the generated `ExpoModulesProvider` as `"\(CFBundleName).ExpoModulesProvider"`, and the digit-leading app name means CFBundleName "20days" ≠ Swift module `_0days`. Fix: `CFBundleName` pinned to `_0days` in `app.json → ios.infoPlist` (+ generated `ios/20days/Info.plist`); `CFBundleDisplayName` stays "20days" so nothing user-visible changes. Escape hatch: `Podfile.properties.json` `"EXPO_USE_PRECOMPILED_MODULES": "false"`. Expo Go was never affected. The `ios/` dir is now generated (CNG); native testing on device: `npx expo run:ios --device --configuration Release`.

**Saturated palette + Verdict narrator round (July 2026):** (1) **Higher-contrast/more-saturated brand** — Ink deepened `#2A3350`→`#1E2540`, trend + score scales punched up (rising `#16A085` · steady `#4FB06A` · watch `#EBBB3F` · drifting `#F58A2E` · declining `#E85D2C`, still warm-not-alarm-red), pillar identity colours saturated. Warm Cream base + neutral chrome kept (locked); saturation lives in accents only. `onColorFor` still picks readable text per fill. Eyes-on sim (Trend/Today) + on LAN for the user's phone. (2) **Verdict Day made self-actionable** (`src/verdict/`): one screen even when 2 pillars slide (they usually share a cause) — per-pillar day-bar strips for what's sliding (relatedness becomes visible), a narrator summary, reflection questions grounded in the data (relational Q when ≥2 slide; per-category templated banks), the user's own most-telling notes (relevance-ranked by the sliding pillars' worst days, `notes.ts`, replacing the last-3 heuristic), and **one optional written reflection** saved to `verdict_events.reflection` (new column, additive migration in `client.ts`). Narrator is a seam: on-device **Apple Foundation Models** preferred (private, never cloud) → **templated** deterministic floor; interpreter-not-author, questions are reflective never prescriptive, notes quoted verbatim (anti-recall-bias). **Phase 2 (Apple FM) is scaffolded but INERT** — `APPLE_BACKEND_INSTALLED = false`, no external SDK in the bundle (Metro rejects an uninstalled/dynamic require), so Phase 1 ships in Expo Go; activation = `npm i @react-native-ai/apple ai` + uncomment 2 imports + flip the flag + dev build on an iOS 26 / A17-Pro+ device (does NOT run in the Simulator). Verified: `tsc` · 50 tests (questions/notes/narrator pure suites) · eyes-on sim: Verdict renders per-pillar strips + selected worst-day notes + relational question; Trend unaffected (declining state, checkpoint).

**Apple on-device narrator VERIFIED + guardrailed (July 2026):** Phase 2 activated and run on a physical iPhone 15 Pro (A17 Pro, iOS 26, Apple Intelligence on): `appleAvailable()=true`, `provider=apple`, ~3s inference, fully on-device (no cloud), notes quoted verbatim. **Guardrail gap found + fixed:** the 3B model drifted into ADVICE ("what strategies might you consider implementing to improve…") — violates interpreter-not-author. Fix = defence-in-depth: (1) hardened few-shot `SYSTEM_PROMPT` (GOOD/BAD examples), (2) `isReflective` deterministic advice-filter + **bounded hybrid** (`composeBoundedQuestions`): model contributes AT MOST ONE reflective question (advice-filtered) + its note ranking; the templated backbone (incl. the always-present signal-vs-noise question) carries the rest; prescriptive model output is dropped and backfilled from templated. Pure + unit-tested (the real failing question is a regression test). **Expo Go is now RETIRED** — importing `@react-native-ai/apple` calls `TurboModuleRegistry.getEnforcing`, which crashes on load in Expo Go / the plain Simulator; the app runs only in **dev builds** (device, or a sim dev build). Device-build recipe (all required, learned the hard way): `expo-build-properties ios.buildReactNativeFromSource:true` (prebuilt React.xcframework didn't export a symbol RNDateTimePicker needs → `Sealable` link error) · Podfile post_install pins pod targets to `SWIFT_VERSION=5.0` + `SWIFT_STRICT_CONCURRENCY=minimal` (source-built expo-modules-core fails Swift-6 strict concurrency under Xcode 26) · **phone must be on the SAME wifi** as the Mac (different-network = the `(null)` "No script URL" saga) · a TEMPORARY hardcoded `RCTBundleURLProvider.jsLocation = "<lan-ip>:8081"` in `ios/20days/AppDelegate.swift` forces the Metro host (on-device `ip.txt`/guessPackagerHost returned nil with source-built RN) — revisit (expo-dev-client or re-check ip.txt now wifi is fixed). Verified: `tsc` · 56 tests · Apple narrator ran on device.

Not yet built / next: the ~30-day priorities check-in (hybrid cadence secondary path) — natural home for the parked **per-pillar "why it matters" values anchor** (optional, private mirror, not scored; deep-research pass pending → FUTURE_IDEAS); crisis-tier vs BetterHelp signposting split (esp. before the on-device model can journal-prompt at a low); **activate + verify Verdict Phase 2 (Apple FM) on a capable device**; dev build to verify notifications + the Verdict "adjust → Settings" modal flow; Drizzle migrations (replace `initDb` bootstrap); Maestro e2e flows; validate the open `[DESIGN DECISION]`s in `docs/SPEC.md`.
