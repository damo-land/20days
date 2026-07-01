# 20days — Design System

Material 3 **Expressive**, warm neutral base with a **dynamic trend accent**. Implements the
designer's **Brand Guidelines v1** (July 2026). `CLAUDE.md` holds the locked choices and points here.

---

## 1. Typography

- **Bricolage Grotesque** — logo, **headings, display, and numbers**. Weights: Light 300 / Regular 400 / Medium 500 / SemiBold 600. Display & headings track slightly tight (−1.5% to −3%).
- **Roboto** — interface, **body, and labels**. Weights: Light 300 (long-form reading) / Regular 400 / Medium 500.
- Scale: **Display 44 · Heading 28 · Body 15 (Roboto Light) · Label 11 (Roboto Medium, uppercase, +~24% tracking)**. Eyebrow labels apply the uppercase/tracking inline (not globally, so buttons stay sentence-case).
- Wire both into the Paper `fonts` config (`src/theme/fonts.ts`): display/headline/title → Bricolage, body/label → Roboto. Gate first render on `useFonts(...)`.
- The wordmark (`src/components/Wordmark.tsx`) is text-only Bricolage SemiBold, lowercase, tracked −3.5%. No icon.

## 2. Colour — warm base, dynamic trend accent

The base is **fixed** and warm; the **accent is dynamic** and follows the trend (Brand Guidelines §04, §07).

**Base (fixed)** — `src/theme/brand.ts`:

| Role | Name | Hex |
|---|---|---|
| Surface | Cream | `#FBF0E0` |
| Raised / card | Card | `#FFF7EC` |
| Text & primary | Ink | `#2A3350` |
| Body copy | Slate | `#5C5A57` |
| Muted label | Sand | `#A79470` |

**Trend scale (accent)** — `src/theme/trendColor.ts`. Colour *reports the trend*; it never decorates:

| Meaning | Hex | App state |
|---|---|---|
| Rising | `#2FA08F` | `improving` |
| Steady | `#7FB48A` | `stable` |
| Watch | `#E6C36A` | — |
| Drifting | `#F0994C` | — |
| Declining | `#E07636` | `declining` |

- **Neutral base, dynamic accent.** `buildTheme(trendState, dark)` fixes surface/primary to Cream/Ink and maps the M3 **secondary** role to the current trend colour; surfaces warm *very subtly* with the trend. Insufficient data → neutral Sand accent, no tint.
- **Trend colour only where it reports a trend** — pillar states, rings, charts, the checkpoint accent. **Never** for general UI chrome (the floating nav stays neutral Ink).

**Guardrails (from research + a11y):**
- **Never rely on colour alone** — always pair with text/word (WCAG; the trend tag shows the word too).
- **Declining ≠ aggressive red.** It warms to ochre, never alarm-red. Over-alarming feeds rumination (`RESEARCH.md` §2.5).
- Maintain M3 contrast tokens; support light **and** dark.

## 2a. Shape (M3 Expressive corner scale, §08)

`src/theme/brand.ts` `RADIUS`: XS 4 · S 8 · M 12 · L 16 · XL 28 · Full (pill). Cards use L/XL; the nav + buttons use Full.

## 3. Expressive specifics — motion + the dynamic dial

We lean into **Material 3 Expressive** (spring/physics motion, organic rounded shapes, emphasised type) and make the *expressiveness* itself dynamic — driven by the user's own signal. Validated against M3's motion model and adaptive-mood-UI patterns in wellbeing apps; kept brand-restrained (no gamification).

**The dial** — `src/theme/expressive.ts`. One scalar `dial ∈ [0,1]` (grounded → relaxed) computed from two timescales: today's composite (acute) + the 20-day trend (chronic). Stored in Zustand (`useAppStore.dial`, set in `refreshTrend`) so every screen is consistent. It drives, subtly:
- **Motion** — `motionTokens(dial)` returns M3-style springs (spatial vs effects × fast/default/slow) as RN `Animated.spring` `{stiffness,damping,mass}` configs. Overshoot is **asymmetric**: only the good side of the dial gets bounce, so grounded days stay calm. Reduce-Motion → critically damped / instant.
- **Shape** — `dialRadius(dial)` softens card corners (16 → ~26).
- **Colour** — `accentEnergy(dial, hex)` vivifies the trend accent on good days (`vivify` HSL nudge in `brand.ts`); base palette unchanged.
- **Copy** — `todayGreeting(dial)` warms the check-in line.

**Brand guardrail:** the "serious" (declining) pole stays **warm and grounded, never cold** — the bigger delta lives on the good direction (anti-rumination, `RESEARCH.md §2.5`). Layout and control positions never change with the dial — only tone — which keeps the adaptive UI from feeling unstable.

**Motion components** (RN `Animated`, no Reanimated/worklet dependency): `AnimatedCard` (staggered spring entrance), `PressableScale` (press-squish), `SuccessBloom` (M3 scalloped "cookie" shape via `Scallop` + spring, shown on save). `useReduceMotion` gates them all.

- `react-native-paper` supplies MD3 tokens; layer Expressive shape/motion on top rather than fighting it.
- **Illustrations** (`Illustration.tsx`) are used **sparingly** — empty states + support tail only, calm subset only (see brand critique); never on check-in / trend chart / checkpoint header. Placeholder renders a quiet scallop until styled assets land in `assets/illustrations/`.

## 4. Implementation notes

- Single source of truth for the theme in `src/theme/`:
  - `fonts.ts` — Paper font config (Bricolage/Roboto variant map).
  - `trendColor.ts` — trend-state → seed color.
  - `theme.ts` — builds light/dark MD3 themes from the seed + fonts; exposed via Paper `PaperProvider`.
- Do not scatter raw hex values in components — consume theme tokens (`theme.colors.*`).
