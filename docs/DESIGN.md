# DESIGN.md — the "Full Stop" design language (v2, July 2026)

The visual language for 20days and every future damo.land app. Replaces the Material 3
Expressive / warm-Cream brand (v1) in full — the M3 Expressive *motion* thinking survives in
the six verbs; the colour system does not. Interactive brand board (reference of record for
look & feel): `docs/brand-board.html` (open in a browser; live demos of every element).

Typography-first, black-and-white, one blue. Inspired by Department of Time (thedot.space —
dot grids, editorial type, underlined rules), Sentinotes (soft feeling-colour), Figma-grade
playfulness at monochrome, and brutallyhuman.com-grade cross-app consistency.

## 0 · The idea

One mark, three jobs: **the dot.**

- It is the **full stop** that ends every headline (square, Prime Blue) — the brand mark.
- It is the **unit of data** — one day, one dot; a score is a stack; a window is a grid.
- It is the marker of **now** — today's column, the active tab.

The interface speaks in short written sentences; the dot ends them. Series signature: every
damo.land app is a lowercase wordmark + blue square stop — `20days.` today, the next app
tomorrow. App icon = ink square, short name, blue stop.

## 1 · Principles (in order of precedence)

1. **Say it, don't show it.** Typography is the interface. Every screen opens with a written
   sentence that already contains the answer — the headline *is* the data summary. Charts
   support the sentence, never replace it.
2. **One day, one dot.** The dot is the only data primitive. If a visualisation can't be
   built from dots, redesign the visualisation. Movement is written typographically
   (`2.8 → 4.1`) before any new chart form is invented.
3. **Ink on paper, either way round.** Two surfaces only — Ink and Paper — swapped wholesale
   for dark mode. Chrome is never coloured; grey exists only as *faded ink* for the past and
   the empty.
4. **Colour is emphasis, not decoration.** Prime Blue means *now and actionable*. State hues
   appear only at checkpoint-grade moments, only on data (tinted dots, or a glow behind one
   lone stat/quote). Most screens are pure ink.
5. **Play lives in the punctuation.** Personality = motion and oversized punctuation — dots
   that pop, the stop that settles, an arrow that springs forward. Never mascots, gradients-
   as-chrome, or extra colour.

## 2 · Colour

### Surfaces (tokens in `src/theme/brand.ts`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `paper` | `#F6F5F1` | `#0F0F0D` | background, sheets |
| `ink` | `#131311` | `#F2F1EC` | text, filled buttons, data dots |
| `faded` | `#6F6E67` | `#8E8D85` | secondary text, trend words, inactive tabs |
| `faint` | `#C9C7C0` | `#3A3A36` | empty/missed dots, handles |
| `hair` | `rgba(19,19,17,.16)` | `rgba(242,241,236,.16)` | hairline rules/dividers |

Warm bone, not clinical white; soft black, not `#000`. Dark mode = the same pair inverted —
no third palette. Grey is always *derived faded ink*, never a new hue.

### Prime Blue — `#2337FF`, ONE hex, both modes

Non-negotiable (user-locked): no lifted dark-mode variant. It sits a touch quieter on Ink;
accepted — brand consistency wins. Means: **now** (today's dots, active-tab dot), **actionable**
(the arrow on a link when it acts), **brand** (the square stop, wordmark, save-button stop).
Never body text, never backgrounds, never chrome fills.

### State hues (exceptional — most screens carry none)

| Hue | Hex | Meaning |
|---|---|---|
| Mint | `#46C08A` | improving |
| Sun | `#EFBF3C` | a dip worth watching |
| Coral | `#EF6F5A` | checkpoint / declining |
| Lilac | `#9C8CF2` | the user's own words (quotes) |

Three permitted forms — colour only where something is MOVING; steady stays neutral so the
hues keep meaning:

1. **Tinted dots (default).** The hue goes *into* the dot cluster — whole cluster, one hue
   family. On Paper: hue as fill `#E06450`, faint `#F0C4BA`, today/deep `#B44430` (coral
   example). On Ink: brighter tints. **Never a glow behind dot clusters or sections** —
   rejected three times as mush.
2. **State-block washes (Trend pillar rows — user-requested).** A soft solid wash
   (`STATE_BLOCKS` in `brand.ts`) behind a MOVING pillar's row: mint wash rising, coral wash
   sliding; steady/settling rows get a neutral paper wash instead. Everything on a wash is
   tone-on-tone: trend word, big latest-score number and today's dot in the deep hue, day
   dots in the hue. The one sanctioned "card": a state block, radius 16, never elevated.
3. **The glow (rarest).** A soft radial (`Glow` component, SVG radial gradient ~35% opacity,
   Breathe pulse) behind ONE compact block — a lone stat or a quoted note. Whatever sits on
   it takes its hue (tone on tone). Never behind words in headlines/running text.

No alarm red anywhere. Warm, unhurried.

## 3 · Typography

**Funnel Display** (headlines, numbers, buttons, wordmark) + **Funnel Sans** (body, labels) —
companion families, same skeleton, via `@expo-google-fonts/funnel-display` /
`@expo-google-fonts/funnel-sans`. Helvetica was rejected (iOS-only licensing, flat next to
Funnel); Bricolage/Roboto retired with brand v1.

**Six sizes, fixed tokens (`TYPE` in `src/theme/brand.ts`), nothing in between.** pt = RN dp.

| Token | Face / weight | Size / line | Use |
|---|---|---|---|
| `display` | Funnel Display 600 | 36 / 40, track −1.5% | screen headline sentence |
| `headline` | Funnel Display 600 | 28 / 32 | section-level statements, big CTAs |
| `title` | Funnel Display 500 | 20 / 26 | pillar names, sheet titles |
| `body` | Funnel Sans 400 | 16 / 24 | paragraphs — the FLOOR; nothing reads below 16 |
| `label` | Funnel Sans 500 | 13 / 18 | trend words, links, nav tabs, note dates |
| `micro` | Funnel Sans 600 | 11 / 14, caps, +0.14em | eyebrows ONLY ("THURSDAY 3 JULY", "PILLARS") |

Numbers: always Funnel Display 600 + `fontVariant: ['tabular-nums']`, at display/headline size.

## 4 · Shape rule

**Square = punctuation · circle = a day, a moment, now. Never swapped.**

- The **square stop** (Prime Blue) ends every headline *statement* — and headlines ONLY,
  never buttons or body copy. Questions keep their `?`. Implementation: the `■` glyph
  (`components/Stop.tsx`) — an inline `<View>` bottom-aligns to the line box and "falls"
  under descenders; the glyph sits on the baseline like real punctuation.
- **Circles** are data: day dots, score-picker dots, nav's active dot, progress dots.
- Buttons: ONE solid ink pill per screen at most (radius 999, Paper text, plain label — no
  stop). Everything else is an **underlined lowercase text link**. Screen-level secondary
  destinations collapse into the **`···` ellipsis menu** (punctuation, not a burger icon) —
  a small slide-up sheet of editorial rows (`MenuSheet`).
- **No cards, no drop shadows.** Hairline rules divide; whitespace groups. Sheets keep the
  slide-up spring but sit on plain `paper` with a `faint` handle.
- **No icon set, no illustrations.** Words do the work; the only glyphs are typographic —
  `→ + ×` set in Funnel (ink when data, blue when they act). If a pictogram is ever
  unavoidable: dot-grid (3×3 cells). Empty states = faint dot constellations + a sentence.

## 5 · Signature elements

1. **The blue square stop** — every headline statement ends in it. THE series mark.
2. **The rule** — full-width 1px ink line under every screen headline.
3. **The day-dot strip** (`DayDots`) — literally one day, one dot: each day's dot sits at its
   score's height, so the trend reads as a rising/falling line of dots. Missed day = hollow
   faint dot on the hairline baseline; today = Prime Blue. No bars, lines, axes. (v1 stacked
   dots-per-score was rejected as unreadable — "dot soup".)
4. **Pillar state blocks** — pillar overview rows: name + tone-on-tone trend word left,
   mini 7-day strip centre, BIG latest score right (Numbers, 30pt), on a state wash (§2.2).
5. **The arrow** — second punctuation mark: score travel written typographically
   (`3.8 → 2.9`, deep hue, tabular), forward action (`find support →`, blue arrow), `←` back.
   `↗` is BANNED — Funnel has no glyph (renders as a tofu box); externals use `→`. On press
   the arrow springs ~5px forward (the gap opens).
6. **Editorial actions** — underlined lowercase links for secondary actions; one ink pill for
   the primary.
7. **The travelling dot** — one blue dot moves through the UI: under the active nav tab, into
   the score picker, arriving as the save button's stop.

## 6 · Motion — six verbs, nothing else moves

All on RN `Animated` springs (no Reanimated dependency); the expressiveness dial
(`src/theme/expressive.ts`) still tunes bounce (grounded ↔ relaxed). Reduce Motion collapses
every verb to a ≤150ms fade.

| Verb | What | Where |
|---|---|---|
| **Pop** | dots spring in, ~20ms stagger, today lands last | matrix/dot-row entrances, score fill |
| **Travel** | one dot slides between states | nav tab switch, save (picker → button) |
| **Settle** | the square stop lands with a sprung quarter-turn | headline entrance, "Saved." |
| **Blink** | stop blinks twice on attention | scroll-into-focus (app), hover (web) |
| **Breathe** | glow pulses over ~5s | the one glow, if present |
| **Draw** | head-rule draws left→right, then the stop settles | screen enter (rule + stop + dots < 600ms) |

Press feedback: squish (scale 0.97 spring, `PressableScale`) + haptic tick; save = success
haptic. Loading/narrator thinking: score-fill loader — five dots filling 1→5 in sequence.

## 7 · Voice

Second person, present tense. Statements end with the (blue) full stop; questions end with
`?`; **never an exclamation mark**. **Never an em dash (—) in app copy** (user-locked):
rewrite with a comma, a period, or a colon; the em dash also collides with the `—` we don't
use as list markers. Links lowercase. The app states what it sees ("Craft has been sliding
for six days.") and asks rather than advises ("Does that match how it feels?").
Interpreter-not-author guardrails (docs/RESEARCH.md) unchanged. No streak/guilt language.

## 8 · Screens (as built)

- **Trend (home)** — eyebrow date + `···` menu (edit pillars / reminder / about) · headline
  verdict-sentence ("Holding steady." / "Quietly improving." / "Drifting down." /
  low-confidence "Still coming into focus."; when the trend-triggered checkpoint is live it
  TAKES OVER the headline: "Worth a look." + one body line + ink pill "See what's sliding" —
  one message per screen, never a repeat below) · rule · labelled pillar state blocks
  (latest score + 7-day strip; NO summary sentence under them — the blocks already say it,
  and a per-pillar line can contradict the composite headline) · "The bigger picture" title
  + label sub · composite `DayDots` · stat band (open, cells divided by one vertical
  hairline, 30pt numbers: average, days logged) · `BottomNav`.
- **Today** — eyebrow day+daypart · headline tense follows the clock ("How is today going?"
  before 5pm, "How was today?" after) · rule · per pillar: name left + the selection said in
  a word right (`SCALE_WORDS`: rough / uneven / okay / good / great, lowercase faded) +
  wordless 5-dot `ScorePicker` (end anchors were noise) + per-pillar hairline note field ·
  ink pill "Save today" · "skip for today" link · `BottomNav`. Keyboard-inset aware.
- **Verdict (sheet)** — the SAME slide-up sheet as every other overlay (one overlay language;
  it was a route modal and read inconsistent) · eyebrow CHECKPOINT · "Worth a look." · rule ·
  narrator summary ·
  per-sliding-pillar strips: name + `3.9 → 2.1` + coral-tinted `DayDots` · IN YOUR OWN WORDS
  + verbatim quotes (2px ink left border) · reflection questions (— marker) · "YOUR TAKE ·
  OPTIONAL" labelled bordered input (a plain underline read as body text — inputs need a
  visible field) · three doors with a visible default: ink pill "It's a blip — keep going"
  (gentlest = clearest affordance, not pressure) + two underlined links (adjust priorities /
  find support →) · micro disclaimer.
- **Onboarding** — wordmark · statement headline + stop · three how-it-works rows (no icons,
  hairline-separated) · picker step ("Choose your three.") with outline/fill pill chips ·
  progress dots · ink pill CTA.
- **Sheets** (About / Reminder / Pillars) — same spring slide-up, paper surface, faint
  handle, title in Funnel Display, editorial content.
- **Splash** — wordmark (Paper on Ink `#131311`) + blue stop; springs in, fades out.

## 9 · Guardrails — always / never

**Always:** headline as a sentence with the stop + rule beneath — ONE message per screen
(a live checkpoint takes the headline over, never repeats below) · data drawn in dots, today
in blue · every chart carries a micro label saying what it is · key numbers BIG (Numbers
tokens, ≥28) · dark mode = Ink/Paper swap only · state colour only where something MOVES
(tinted dots, state-block washes, one glow max), tone on tone · movement written `a → b` ·
underlined lowercase links, `···` menu for secondary destinations · inputs look like inputs
(labelled, bordered) · body type ≥ 16 · Reduce Motion honoured.

**Never:** state hues on words in running text, on chrome, buttons, tabs or full
backgrounds · glows behind dot clusters/charts/sections · ink-black or blue elements sitting
on a wash/glow (tone on tone only) · decorative cards or shadows (the state block is the one
sanctioned block) · the stop on buttons or body copy · `↗` (no glyph in Funnel — tofu) ·
alarm red, exclamation marks, streaks · a second display face or ad-hoc font sizes · icons
where a word fits (`···` is punctuation, not an icon) · colour-coded scores in the composite
strip.

## 10 · Web-only expressions (future damo.land site — NOT the app)

- Prime Blue square trails the system cursor (arrow unchanged), spins with movement, morphs
  into a larger fainter circle ONLY over `cursor: pointer` targets — the morph is the pointer
  indicator (square = statement, circle = action).
- Hovered headline → its stop settles (quarter-turn). Arrow links open the gap on hover.
- Live implementations in `docs/brand-board.html`.

## 11 · Implementation notes / asset debt

- Fonts load in `src/theme/fonts.ts`; Paper MD3 variants are mapped to the fixed scale so
  `Text variant=` can't drift off-token.
- `userInterfaceStyle: "automatic"` (dark mode is back on — brand v1's Light pin is retired;
  `buildTheme(dark)` now has a real dark palette).
- Headline stops are inline `<View>`s inside `<Text>` (iOS supports inline views) — see
  `components/Stop.tsx`.
- **Asset debt:** `assets/images/icon.png`, `splash-icon.png`, Android adaptive icons still
  carry brand v1 (Bricolage wordmark on old Ink `#2A3350`). Regenerate: ink `#131311` square,
  `20` + blue `#2337FF` square stop in Funnel Display 600. Until then only the native splash
  frame and home-screen icon are stale.
