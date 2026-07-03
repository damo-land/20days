# DESIGN.md — the "Full Stop" design language

**Source of truth for the visual language, voice and micro-interactions of every damo.land
app.** Use this file to brand a NEW app or rebrand an EXISTING one; it is written to be
dropped into any repo and followed by a Claude Code session without extra context.

- **Part A** is the portable system: everything here applies to every app, verbatim.
- **Part B** is 20days applied: the reference implementation of Part A. Use it as the worked
  example; component/file names refer to the 20days repo (`src/theme/brand.ts`,
  `src/components/*`), which is the reference codebase to copy from.
- **Part C** is implementation recipes, hard-won gotchas, and the new-app checklist.
- Interactive reference of record for look, feel and the web expressions:
  `docs/brand-board.html` (open in a browser; live demos of every element).

Provenance: v2, July 2026. Replaced the Material 3 Expressive / warm-Cream brand (v1) in
full. Inspiration register: Department of Time (thedot.space; dot data, editorial type,
rules), Sentinotes (soft feeling-colour), Figma-grade playfulness at monochrome,
brutallyhuman.com-grade cross-app consistency. Iterated with damo over 6+ review rounds;
rules marked **(user-locked)** were explicit corrections. Do not regress them.

---

# PART A — the portable system (every app)

## A0 · The idea

One mark, three jobs: **the dot.**

- The **full stop** that ends every headline statement (a SQUARE, Prime Blue): the brand mark.
- The **unit of data**: one day, one dot; a value is a dot at a height; a period is a strip.
- The marker of **now**: today's dot, the active tab's dot.

The interface speaks in short written sentences; the dot ends them. Series signature: every
app is a lowercase wordmark + blue square stop (`20days.` today, the next app tomorrow).
App icon = ink rounded square, short lowercase name/numeral, blue square stop.

## A1 · Principles (in order of precedence)

1. **Say it, don't show it.** Typography is the interface. Every screen opens with a written
   sentence that already contains the answer: the headline IS the data summary. Charts
   support the sentence, never replace it. One message per screen, never repeated below.
2. **One day, one dot.** The dot is the only data primitive. If a visualisation can't be
   built from dots, redesign the visualisation. Movement is written typographically
   (`2.8 → 4.1`) before any new chart form is invented.
3. **Ink on paper, either way round.** Two surfaces only, Ink and Paper, swapped wholesale
   for dark mode. Chrome is never coloured; grey exists only as *faded ink* for the past and
   the empty.
4. **Colour is emphasis, not decoration.** Prime Blue means *now and actionable*. State hues
   appear only where something is MOVING, only on data (tinted dots, state washes, one glow),
   always tone on tone. Most screens are pure ink.
5. **Play lives in the punctuation.** Personality = motion and oversized punctuation: dots
   that pop, the stop that settles, an arrow that springs forward, the `···` menu. Never
   mascots, gradient chrome, or extra colour.

## A2 · Colour tokens

### Surfaces (the only neutrals that exist)

| Token | Light | Dark | Use |
|---|---|---|---|
| `paper` | `#F6F5F1` | `#0F0F0D` | background, sheets |
| `ink` | `#131311` | `#F2F1EC` | text, filled buttons, data dots |
| `faded` | `#6F6E67` | `#8E8D85` | secondary text, state words, inactive tabs |
| `faint` | `#C9C7C0` | `#3A3A36` | empty/missed dots, sheet handles |
| `hair` | `rgba(19,19,17,.16)` | `rgba(242,241,236,.16)` | hairline rules, dividers, input borders |

Warm bone, not clinical white; soft black, not `#000`. Dark mode = the SAME pair inverted;
no third palette, nothing else changes **(user-locked)**. Grey is always derived faded ink,
never a new hue. Neutral wash (the steady state block): `mix(paper, ink, 0.045)`.

### Prime Blue — `#2337FF`, ONE hex, both modes (user-locked)

No lifted dark-mode variant, ever (rejected twice). It sits a touch quieter on Ink;
accepted, brand consistency wins. Means: **now** (today's dot, active-tab dot),
**actionable** (a link's arrow when it acts), **brand** (the square stop, the wordmark).
Never body text, never backgrounds, never chrome fills, never on a coloured wash.

### State hues (exceptional; most screens carry none)

| Hue | Hex | Meaning |
|---|---|---|
| Mint | `#46C08A` | improving / rising |
| Sun | `#EFBF3C` | a dip worth watching |
| Coral | `#EF6F5A` | declining / checkpoint-grade attention |
| Lilac | `#9C8CF2` | the user's own words (quotes) |

No alarm red anywhere in the system. Warm, unhurried.

**Three permitted forms** (colour only where something MOVES; steady stays neutral so hues
keep meaning):

1. **Tinted dots (default).** The hue goes INTO the dot cluster; whole cluster, one hue
   family. Coral ramp on Paper: fill `#E06450`, faint `#F0C4BA`, emphasis `#B44430`; on Ink:
   fill `#EF8975`, faint `#4E332E`, emphasis `#FFB4A4`. **Never a glow behind dot clusters,
   charts or sections** (user-locked; rejected three times as mush).
2. **State-block washes.** A soft SOLID wash behind a moving row/block, tone on tone: the
   state word, big number and emphasis dot in the deep hue, data dots in the hue.
   Mint block light: wash `#E4F1E9`, deep `#1E6B47`, dot `#46C08A`, faint `#C2DFD0`;
   dark: `#17221C` / `#9FE0BE` / `#3FA377` / `#2C4437`.
   Coral block light: wash `#F9E9E4`, deep `#96371F`, dot `#E06450`, faint `#EDC7BC`;
   dark: `#251613` / `#F0A18F` / `#C96A56` / `#4E332E`.
   The state block is the ONE sanctioned "card": radius 16, never elevated, never a border.
3. **The glow (rarest).** A soft radial (SVG radial gradient, ~35% opacity, Breathe pulse)
   behind ONE compact block: a lone stat or a quoted note. Whatever sits on it takes its hue.
   Never behind words in headlines/running text; never behind dots.

**Tone on tone (user-locked):** anything sitting on a wash or glow takes that hue's family
(deep on Paper, bright on Ink). Never ink-black or blue elements on colour.

## A3 · Typography

**Funnel Display** (headlines, numbers, buttons, wordmark) + **Funnel Sans** (body, labels).
Companion families, same skeleton, free on Google Fonts (`@expo-google-fonts/funnel-display`,
`@expo-google-fonts/funnel-sans`; web: self-host woff2). Helvetica was rejected (iOS-only
licensing, flat next to Funnel). No second display face, ever.

**Six sizes, fixed tokens, nothing in between** (user-locked: "large enough and super
consistent"). pt = RN dp = CSS px.

| Token | Face / weight | Size / line | Tracking | Use |
|---|---|---|---|---|
| `display` | Funnel Display 600 | 36 / 40 | −1.5% (−0.54) | the screen's headline sentence |
| `headline` | Funnel Display 600 | 28 / 32 | −1% (−0.28) | section statements, big CTAs |
| `title` | Funnel Display 500 | 20 / 26 | 0 | item names, sheet titles |
| `body` | Funnel Sans 400 | 16 / 24 | 0 | paragraphs; the FLOOR, nothing reads below 16 |
| `label` | Funnel Sans 500 | 13 / 18 | 0 | state words, links, nav tabs, dates |
| `micro` | Funnel Sans 600 | 11 / 14 | +0.14em, UPPERCASE | eyebrows ONLY ("FRIDAY 3 JULY") |

**Numbers:** always Funnel Display 600 + tabular figures, and BIG: 28–36pt for key stats
(user-locked: small numbers rejected). Secondary fragment inside a number (`/20`) drops to
18pt faded.

## A4 · Shape rule

**Square = punctuation · circle = a day, a moment, now. Never swapped.**

- **The square stop** (Prime Blue) ends every headline *statement*, and headlines ONLY:
  never buttons, never body copy (user-locked). Questions keep their `?`. Size ≈ 0.13–0.15×
  the headline size.
- **Circles** are data and time: day dots, score-picker dots, the nav's active dot,
  progress dots.
- **Buttons:** ONE solid ink pill per screen at most (height 54, radius 999, Paper text,
  Funnel Display 600 at 18, plain label). Label says what it does ("See what's sliding",
  not "Look together").
- **Links:** every other action is an underlined lowercase text link (Funnel Sans 500).
- **The `···` menu:** screen-level secondary destinations collapse into an ellipsis button
  (Funnel Display, ~22pt; punctuation, not a burger icon) opening a small sheet of editorial
  rows. Micro footer links were rejected as "nonsensical" (user-locked).
- **No decorative cards, no drop shadows.** Hairline rules divide; whitespace groups. The
  state block (A2.2) is the only filled container.
- **No icon set, no illustrations.** Words do the work; the only glyphs are typographic:
  `→ ← + × ···` set in Funnel (ink when data, blue when they act). `↗` is BANNED: Funnel has
  no glyph for it and it renders as a tofu box; externals use `→` (user-locked). If a
  pictogram is ever unavoidable: dot-grid, 3×3 cells. Empty states = faint dot constellation
  + a sentence.
- **Radii set:** pill 999 · state block 16 · input field 12 · sheet top corners 28. Nothing
  else is rounded.

## A5 · Signature elements (the kit of parts)

1. **The blue square stop** — ends every headline statement. THE series mark.
2. **The rule** — full-width 1px ink line (85% opacity) under every screen headline.
3. **The day-dot strip** — the chart. Literally one day, one dot: each day's single dot sits
   at its value's height, so the trend reads as a rising/falling line of dots. Missed day =
   hollow faint dot on a hairline baseline; today = Prime Blue. No bars, lines, axes, or
   smoothing. (Stacked dots-per-score was rejected as unreadable "dot soup", user-locked.)
   Spec: dot ≤12, horizontal gap 6, hollow = radius−1 with 1.5 stroke.
4. **State blocks** — overview rows on a state wash: name + tone-on-tone state word left,
   mini strip centre, BIG latest value right (30pt tabular). Colour only when moving.
5. **The arrow** — the second punctuation mark: value travel written typographically
   (`3.9 → 2.1`, deep hue, tabular), forward action (`find support →`, blue arrow), `←`
   back. On press/hover the gap opens: the arrow springs ~5px forward.
6. **Editorial actions** — one ink pill (the primary) + underlined lowercase links.
7. **The travelling dot** — one blue dot moves through the UI: it slides under the active
   nav tab, fills the picker, marks today. The dot never vanishes; it goes somewhere.
8. **Eyebrow + headline + rule** — every screen opens the same way: micro caps eyebrow,
   display-size sentence with the stop (or `?`), the rule.
9. **Charts are labelled** — every chart carries a title (title token) or a micro label
   saying exactly what it shows (user-locked). Stats sit under it as an open band: big
   numbers, micro caps labels, cells divided by one vertical hairline (no horizontal rule
   above, user-locked).

## A6 · Motion — six verbs, nothing else moves

Sprung, quick, quiet. Reduce Motion collapses every verb to a ≤150ms fade, always.

| Verb | What | Where |
|---|---|---|
| **Pop** | dots spring in with a ~20–55ms stagger, the emphasis dot lands last | strip entrances, score-picker fill |
| **Travel** | one dot slides between states (spring, stiffness ~300) | nav tab switch |
| **Settle** | the square stop lands with a sprung quarter-turn (a square reads identical at 90°, so the end state is stable) | headline entrance, save confirmation |
| **Blink** | the stop blinks twice on attention | scroll-into-focus (app), hover (web) |
| **Breathe** | glow opacity pulses ~0.28→0.42 over ~5s | the one glow, if present |
| **Draw** | the head-rule draws left→right (~420ms), then the stop settles | screen enter; whole sequence < 600ms |

- **Press feedback:** squish (scale 0.97, fast spring) + a light haptic tick on every
  meaningful tap; success haptic on save.
- **Loading / thinking:** the score-fill loader: five dots filling 1→5 in sequence and
  emptying. Never a system spinner.
- **The dial:** one scalar (0 grounded → 1 relaxed, derived from the user's own signal)
  tunes spring bounce only. Layout, colour and structure never change with it; overshoot
  only grows on the good side (never punish a bad day with a jumpier UI).
- Springs (stiffness, damping ratio): default 300 / 1.0→0.5 · fast 520 · slow 190. Opacity
  never overshoots.

## A7 · Voice

Second person, present tense. Statements end with the (blue) full stop; questions end with
`?`. **Never an exclamation mark. Never an em dash (—) in user-facing copy** (user-locked):
rewrite with a comma, a period or a colon; not as list markers either. Links lowercase.
Headline tense follows the clock where time is involved ("How is today going?" before 5pm,
"How was today?" after). The app states what it sees ("Craft has been sliding for six
days.") and asks rather than advises ("Does that match how it feels?"). No streak, guilt or
dark-pattern language. Copy on controls says exactly what happens.

## A8 · Structural conventions

- Screen padding: 24 horizontal. Content, not chrome, scrolls.
- **One overlay language (user-locked):** EVERY overlay, from a small menu to a full
  checkpoint, is the same sheet: paper surface, top radius 28, faint 40×5 handle, backdrop
  `rgba(10,10,9,0.45)`, springs up (spatial default), backdrop-tap dismisses. Never a native
  page-sheet route modal (read as inconsistent). Two Modals can't swap same-tick: close one,
  open the next after ~300ms.
- **Nav:** bottom bar, paper + hairline top, two/three lowercase word tabs (Funnel Sans 500,
  15), the travelling blue dot (6px) under the active word. No icons, no pill.
- **Inputs look like inputs (user-locked):** micro caps label above + hairline border box
  (radius 12, padding 14) for multiline; single-line quick fields may use a hairline
  underline with a clear placeholder ("add a note…").
- Options with a default: the gentlest/most common choice is the ink pill, alternatives are
  links below (a visible default is an affordance, not pressure).
- Every chart labelled; key numbers big; body ≥16; a11y labels carry the meaning words.

## A9 · Guardrails — always / never

**Always:** eyebrow + headline sentence with stop (or `?`) + rule, one message per screen ·
data drawn in dots, today in blue · every chart labelled · key numbers ≥28pt tabular · dark
mode = Ink/Paper swap only · state colour only where something moves, tone on tone · movement
written `a → b` · underlined lowercase links; `···` menu for secondary destinations · one
sheet language for all overlays · inputs labelled and bordered · body ≥16 · haptic tick on
meaningful taps · Reduce Motion honoured.

**Never:** state hues on words in running text, chrome, buttons, tabs or full backgrounds ·
glows behind dot clusters/charts/sections · ink or blue elements on a wash/glow · decorative
cards or shadows · the stop on buttons or body copy · em dashes or exclamation marks in copy ·
`↗` anywhere · alarm red · streaks/gamification · a second display face or ad-hoc font sizes ·
icons where a word fits · redundant summary lines that repeat what a block already shows (or
contradict the headline) · native modal presentation for overlays.

## A10 · Wordmark, icon, splash (series identity)

- **Wordmark:** app name, lowercase, Funnel Display 600, tracking −2%, + blue square stop
  (side ≈ 0.15× size) sitting on the baseline.
- **App icon:** ink `#131311` rounded square, short lowercase name or numeral in Funnel
  Display 600 (Paper `#F6F5F1`), blue square stop. Same recipe every app.
- **Splash:** always ink-side regardless of mode: wordmark in Paper on Ink `#131311`,
  springs in (friction 7 / tension 60), fades out over the app.

## A11 · Web-only expressions (marketing sites, not apps)

- A Prime Blue SQUARE trails the system cursor (the arrow itself never changes or hides);
  it spins with movement and morphs into a larger, fainter CIRCLE only over
  `cursor: pointer` targets. The morph IS the pointer indicator: square = statement,
  circle = action. Never in-app (no cursor).
- Hovered headline: its stop settles (quarter-turn). Arrow links open the gap ~5px on hover.
- Live implementations: `docs/brand-board.html` (fonts embedded, self-contained).

---

# PART B — 20days applied (the reference implementation)

How Part A lands in the first app. Component names = `src/components/*` in the 20days repo.

- **Tokens:** `src/theme/brand.ts` (`tones(dark)`, `BLUE`, `STATE`, `CORAL_DOTS`,
  `STATE_BLOCKS`, `TYPE`, `NUMBER_FONT`, `hexMix`). Fonts: `src/theme/fonts.ts` maps ALL
  react-native-paper MD3 variants onto the six tokens so `Text variant=` can't drift.
  `ThemeProvider` follows `useColorScheme()` and exposes the `useTones()` hook: the styling
  handle used everywhere. No trend-driven chrome colour (v1 retired); the trend speaks
  through the headline and the dots.
- **Components:** `Stop` (glyph, A4) · `Rule` (Draw) · `Wordmark` · `DayDots` (day-dot
  strip, `tint` prop for the coral ramp) · `ScorePicker` (five 30pt circles; tap nth fills
  1…n with Pop + tick; wordless, the selection's word renders beside the item name) ·
  `PillButton` · `TextLink` (arrow nudge) · `BottomNav` (travelling dot) · `MenuSheet` (`···`)
  · `VerdictSheet` / `AboutSheet` / `ReminderSheet` / `PillarsSheet` (one sheet pattern) ·
  `Glow` (built, reserved) · `AnimatedCard` (entrance) · `PressableScale` (squish) ·
  `AnimatedSplash` · `WipeTransition` (monochrome panels on save).
- **Trend (home):** eyebrow date + `···` menu (edit pillars / daily reminder / about) ·
  headline verdict-sentence: "Holding steady." / "Quietly improving." / "Drifting down." /
  low-confidence "Still coming into focus."; when the trend-triggered checkpoint is live it
  TAKES OVER the headline ("Worth a look.") with one body line + pill "See what's sliding" ·
  rule · `PILLARS · LATEST SCORE & LAST 7 DAYS` micro label · three state blocks (name +
  state word: rising/steady/sliding/settling in · mini 7-day strip · 30pt latest score); NO
  summary sentence under the blocks (repeats them, can contradict the headline) · "The
  bigger picture" title + label sub · composite 20-day `DayDots` · open stat band (average ·
  days logged) · `BottomNav` (trend | today).
- **Today:** eyebrow day+daypart · clock-tensed headline (A7) · rule · per pillar: name left
  + selection word right (`SCALE_WORDS`: rough / uneven / okay / good / great, lowercase
  faded, live-updates on tap) · wordless `ScorePicker` · hairline note field ("add a
  note…", per pillar) · ink pill "Save today" · "skip for today" link · `BottomNav`.
  Keyboard-inset aware; saving fires success haptic + monochrome wipe back to Trend.
- **Verdict (the checkpoint, a `VerdictSheet`):** the app's only coloured surface. Eyebrow
  CHECKPOINT · "Worth a look." + rule · narrator summary ("…This isn't a diagnosis, just
  what you logged.") · per-sliding-pillar strips: title + `3.9 → 2.1` delta (coral deep,
  tabular) + coral-tinted `DayDots` · IN YOUR OWN WORDS + verbatim quotes (2px ink left
  border + micro date) · headline question "A real problem,\nor a rough patch?" (manual
  break after the comma) · reflection questions as plain paragraphs (no list markers) ·
  YOUR TAKE · OPTIONAL labelled bordered input · doors: ink pill "It's a blip, keep going"
  + links "adjust my priorities" / "find support →" · micro disclaimer. Backdrop-dismiss
  records nothing (agency).
- **Onboarding:** wordmark · statement headline + stop + rule · hairline-separated
  how-it-works rows (no icons) · "Choose your three." picker (outline/fill pill chips,
  three slot dots, hairline "add your own…" field) · progress dots (blue = current) ·
  ink pill CTA · "← back" link.
- **Motion coverage in 20days today:** Pop (picker) · Travel (nav) · Draw (rule) · squish +
  haptics · sheet springs · splash spring. Settle/Blink of the headline stop and the
  score-fill loader are specified (A6) but not yet wired: the glyph Stop is currently
  static. Wire them when touching those surfaces; do not invent other motion.

## B1 · Data-viz semantics (tracker-specific)

Score 1–5 = dot height on the strip. Missed day = hollow faint dot at baseline (honest,
quiet; no fabricated data). Today = blue (or the wash's deep hue when on a state block).
Composite strip stays INK (never colour-coded by score); colour enters only via state
tinting (Verdict) and state blocks (Trend). Deltas: first-half vs second-half mean of logged
days, written `a → b`.

---

# PART C — implementation notes, gotchas, new-app checklist

## C1 · React Native / Expo recipes

- **Stop:** render the `■` glyph (`<Text>`, fontSize ≈ 0.42× headline size, colour BLUE),
  NOT an inline `<View>` inside `<Text>`: inline views bottom-align to the line box and
  visually "fall" below the baseline under descenders (learned the hard way). The glyph
  falls back to a system symbol font and sits on the baseline like real punctuation.
- **Rule (Draw):** Animated width `'0%' → '100%'`, ~420ms, non-native driver (1px view,
  cheap). 85% opacity ink.
- **Day-dot strip:** SVG circles; `cy = height − r − (value − min) × step`. Hairline
  baseline as an SVG line.
- **Travelling dot (nav):** measure tab centers `onLayout`, spring `translateX`
  (stiffness 300, damping 22); first placement teleports (no animation), Reduce Motion
  always teleports.
- **Arrow nudge:** the arrow is its own `<Animated.Text>` in a row next to the underlined
  label (nested `<Text>` fragments cannot transform); spring translateX ±5.
- **Sheets:** RN `Modal` `transparent` + backdrop `Animated.View` (opacity = progress) +
  content `translateY` spring from ~360–720 by content height; `KeyboardAvoidingView`
  behavior `padding` when the sheet has inputs; `maxHeight '90–93%'`; `statusBarTranslucent`.
- **Fonts via Paper:** map every MD3 variant to the six tokens in `configureFonts` (see
  `src/theme/fonts.ts`) so library components inherit the scale.
- **Dark mode:** `userInterfaceStyle: "automatic"` in app.json. GOTCHA: an already-built
  dev build has `UIUserInterfaceStyle` baked into its Info.plist; JS changes won't flip it.
  Patch the installed bundle with PlistBuddy or rebuild.
- **Haptics:** `expo-haptics`; tick = selection/light impact on taps, success on save.
  Fire-and-forget.

## C2 · Web recipes

Self-host Funnel woff2 (or inline as data URIs; see `docs/brand-board.html`). The cursor
square: fixed 10px div, lerp follow (~0.14), rotation += |dx|+|dy| × 0.9, `.big` class on
`mouseover` of `a`/buttons → 36px, border-radius 50%, opacity 0.22 (transitions 220ms).
Gate ALL of it behind `(pointer: fine)` and `(prefers-reduced-motion: no-preference)`.

## C3 · Copy-paste token block (for a new repo)

```ts
export const BLUE = '#2337FF'; // one hex, both modes, non-negotiable
export const STATE = { mint: '#46C08A', sun: '#EFBF3C', coral: '#EF6F5A', lilac: '#9C8CF2' };
const LIGHT = { dark: false, paper: '#F6F5F1', ink: '#131311', faded: '#6F6E67', faint: '#C9C7C0', hair: 'rgba(19,19,17,0.16)', blue: BLUE };
const DARK  = { dark: true,  paper: '#0F0F0D', ink: '#F2F1EC', faded: '#8E8D85', faint: '#3A3A36', hair: 'rgba(242,241,236,0.16)', blue: BLUE };
export const TYPE = {
  display:  { fontFamily: 'FunnelDisplay_600SemiBold', fontSize: 36, lineHeight: 40, letterSpacing: -0.54 },
  headline: { fontFamily: 'FunnelDisplay_600SemiBold', fontSize: 28, lineHeight: 32, letterSpacing: -0.28 },
  title:    { fontFamily: 'FunnelDisplay_500Medium',   fontSize: 20, lineHeight: 26 },
  body:     { fontFamily: 'FunnelSans_400Regular',     fontSize: 16, lineHeight: 24 },
  label:    { fontFamily: 'FunnelSans_500Medium',      fontSize: 13, lineHeight: 18 },
  micro:    { fontFamily: 'FunnelSans_600SemiBold',    fontSize: 11, lineHeight: 14, letterSpacing: 1.5, textTransform: 'uppercase' },
};
export const NUMBER_FONT = 'FunnelDisplay_600SemiBold'; // + fontVariant: ['tabular-nums'], 28–36pt
// Radii: pill 999 · state block 16 · input 12 · sheet top 28. Screen padding 24.
```

## C4 · New-app / rebrand checklist (run top to bottom)

1. Install `@expo-google-fonts/funnel-display` + `@expo-google-fonts/funnel-sans`; load
   500/600 Display + 400/500/600 Sans. Remove every other display face.
2. Copy the token block (C3) into `src/theme/`; wire a `useTones()` provider off
   `useColorScheme()`; map Paper/MUI/etc. variants onto the six TYPE tokens.
3. `userInterfaceStyle: "automatic"`; splash background `#131311`.
4. Port the primitives from the 20days repo: Stop, Rule, Wordmark, DayDots (if the app has
   time-series data), PillButton, TextLink, BottomNav, MenuSheet, the sheet pattern,
   PressableScale, AnimatedCard, AnimatedSplash.
5. Every screen: eyebrow (micro) → headline sentence + Stop (or `?`) → Rule → content.
   Write the headline FIRST: it must contain the screen's answer.
6. Data → dots (A5.3); movement → `a → b`; state colour only via A2's three forms.
7. Buttons: one ink pill max per screen; everything else links; secondary destinations
   into `···`.
8. Copy pass with A7 (no em dashes, no exclamation marks, tense follows the clock,
   controls say what they do).
9. Wordmark/icon/splash per A10 (lowercase name + blue square stop).
10. Audit against A9 always/never. Verify BOTH modes on device/sim. Reduce Motion pass.
11. Regenerate store assets (icon, splash PNGs) to the recipe: this is the step that gets
    forgotten (20days still owes it, see C5).

## C5 · Known debt (20days)

- `assets/images/icon.png`, `splash-icon.png`, Android adaptive icons still carry brand v1
  (Bricolage wordmark on old Ink `#2A3350`). Regenerate per A10.
- Settle/Blink on the headline stop + the score-fill loader: specified, not yet wired (B).
- `Glow` component built but intentionally unused until a surface earns it.
