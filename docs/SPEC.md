# 20days — Product & Data Spec

Detailed behaviour spec. `CLAUDE.md` holds the locked decisions and points here. Evidence for every rule below is in `RESEARCH.md` (read it before changing data-collection, trend, or Verdict-Day behaviour).

Confidence tags: `[HIGH]` evidence-backed · `[DESIGN DECISION]` chosen default, validate later.

---

## 1. The daily check-in (data collection)

Evidence: `RESEARCH.md` §1.

- **Momentary, not retrospective.** `[HIGH]` Ask for *today's* score. Never ask "how were the last few weeks?" — recall is peak-end biased (r≈.58). The app reconstructs the period from logged daily data, not memory.
- **One score per pillar + one optional free-text note.** `[HIGH]` A single item is validly ≈ the full SWLS (r≈.70). 3 sliders + optional notes, done in < 1 min.
- **Scale: 1–5 stepped slider per pillar** (`scale_version` 2). `[DESIGN DECISION]` The "5-point is best" claim was refuted, so this stays open to validation (1–5 vs 1–7 vs 0–10). We moved 0–10 → 1–5 for a faster, more inviting check-in and to avoid false precision; the cost is coarser trend resolution against single-item noise, mitigated by the engine's robust slope + magnitude gate. **Always store the raw scale + `scale_version`** so historical data survives a scale change; the trend engine's `magnitudeFloor` is re-derived proportionally when the span changes.
- **Skips are fine.** Missing days degrade gracefully (see §2 min-data gate). No guilt UI for a missed day.

---

## 2. Trend engine & Verdict Day trigger

Evidence: `RESEARCH.md` §2. Trend-triggered beats undifferentiated fixed intervals (decline-targeted ROM g~.15 → .36–.53; actuarial alerts >> intuition). Cadence is **hybrid** (confirmed):

1. **Verdict Day (primary, alert path)** — fires on a sustained + material negative trend.
2. **Priorities check-in (secondary, dismissible)** — ~every 30 days / user-set, calm, purely to review whether the 3 pillars still fit. Not an alarm.

### Trigger algorithm (design sketch — validate before shipping) `[DESIGN DECISION]`

- Compute per-pillar **and** composite (mean of pillars) daily series.
- **Smooth first** — single-item scores are noisy (ICC≈.43). Moving average, candidate window ~5–7 days.
- Fire only when **all** hold:
  - **Direction** — negative slope over a rolling ~20-day window. Candidates: Mann-Kendall / Theil-Sen slope (robust to noise), or CUSUM-slope for change-point.
  - **Magnitude gate** — decline exceeds a minimum meaningful size, not just any downward tilt. Borrow the Reliable-Change idea (`|RC| = |Δ|/S_diff > 1.96`) / clinically-significant-change thresholding to suppress noise-driven false alarms.
  - **Minimum data gate** — enough logged days in the window (candidate: ≥14 of 20). No verdict on sparse data.
- **Cooldown / hysteresis** — after a Verdict Day, suppress re-triggering for N days (avoid nagging + rumination risk).
- **Calm surfacing** — no constantly-updating red "you're declining" gauge. Trends shown neutrally; the heavy moment is rare.

⚠️ All ROM evidence is clinical, therapist-delivered — transfer to a self-guided app is unproven, overall effect small. Instrument our own retention/outcomes. Thresholds above are candidates.

---

## 3. The Verdict Day (re-evaluation moment)

Evidence: `RESEARCH.md` §3. Only "show the data" is evidence-backed; the rest is tested-hypothesis design.

1. **Calm open** `[DESIGN DECISION]` — *"Your Health pillar has trended down over the last few weeks. Let's look together."* Never diagnostic/alarming.
2. **Show their real data** `[HIGH]` — the actual logged trend (per-pillar + composite). Memory of the period is biased; *show* it. This is the anti-recall-bias core.
3. **Real-vs-illusion prompts** `[DESIGN DECISION]` — "What was going on these weeks?" / "Rough patch with a cause likely to pass, or a persistent pattern?" / app highlights the driving pillar.
4. **Priorities re-evaluation** `[DESIGN DECISION]` — "Do these 3 pillars still reflect what matters most right now?" → inline **edit pillars** (writes a `priorities_revisions` snapshot).
5. **Three doors (agency)** — non-negotiable that the user can always walk away:
   - **Ignore / keep going** — dismiss, no guilt, keep tracking.
   - **Adjust priorities** — edit pillars.
   - **Get support** — CTA to external platform (**BetterHelp**), framed *"if this feels persistent, talking to someone can help."* Signpost, not prescription.

### Safety rails (non-negotiable) `[DESIGN DECISION — prudent practice, not evidence-established thresholds]`

- No diagnosis / no medical claims; explicit "not medical advice."
- **Two tiers:** moderate persistent dip → BetterHelp signpost; **severe** signals (floor-level scores) → surface **crisis helplines** directly, not a marketing CTA.
- Conservative trigger thresholds (§2) — false alarms erode trust and can harm.
- Privacy: local-first storage is itself a safety feature for this data.

---

## 4. Data model

```
pillars(id, name, description, order, created_at, archived_at)
entries(id, pillar_id, date, score, scale_version, note, created_at)   -- one row per pillar per day
priorities_revisions(id, snapshot_json, reason, created_at)            -- history of pillar edits
verdict_events(id, triggered_at, trigger_reason, window_start, window_end, user_action, cooldown_until)
```

- `entries`: unique on `(pillar_id, date)`; upsert on same-day re-edit.
- `scale_version`: bump when the scoring scale changes so old scores remain interpretable.
- `priorities_revisions`: append-only history of the 3-pillar definition (satisfies "priorities change over time").
- `verdict_events`: records each trigger, what the user chose (ignore / adjust / support), and the cooldown window.
