# 20days — Evidence Review: Data Collection, Trend-Triggered Reflection & the Verdict Day

**Date:** 2026-07-01
**Method:** Multi-source deep research (23 peer-reviewed / primary sources fetched, 105 claims extracted, top 25 adversarially verified — 21 confirmed, 4 refuted). Prioritised medical & psychology literature.
**Purpose:** Ground three product decisions for *20days* in evidence: (i) the daily data-collection instrument, (ii) whether a trend-triggered "verdict day" beats fixed intervals + how to detect the trend, (iii) how to structure the re-evaluation moment.

> **How to read confidence tags:** `[HIGH]` = multiple primary sources, unanimous adversarial verification. `[MED]` = confirmed but single-source or split vote or clinical→consumer generalisation risk. `[DESIGN DECISION]` = evidence did not resolve it; we choose a defensible default and must validate it ourselves. `[REFUTED]` = a plausible claim we checked and killed — do **not** design on it.

---

## TL;DR recommendations

1. **Instrument** — Capture **daily, in-the-moment** ratings, not weekly/retrospective summaries. One score per pillar (3 total) + one optional free-text note. Keep total entry under ~1 minute. `[HIGH]`
2. **Scale** — Evidence does **not** settle 1–5 vs 1–7 vs 0–10. We default to a **0–10 slider** per pillar for trend resolution, flagged to validate. `[DESIGN DECISION]`
3. **Cadence** — **Trend-triggered verdict is the right primary model**, but not *purely* — pair it with a low-key, dismissible periodic priorities check-in. The literature backs *decline-targeted* intervention over undifferentiated monitoring, and statistical/actuarial triggers over gut feel. `[MED]`
4. **Trigger** — Smooth daily noise first, then fire on a **sustained + material** negative trend with a **minimum-data gate** and a **cooldown**. Borrow the Reliable Change / clinically-significant-change idea to gate on *magnitude*, not just direction, to suppress false alarms. `[MED / DESIGN DECISION]`
5. **Verdict day** — The one hard, evidence-backed rule: **show the user their own logged trend** rather than asking them to recall the period (recall is peak-end biased). Everything else (prompt wording, values exercise, the 3 "doors") is sound product design but **unvalidated** — treat as hypotheses. `[HIGH for "show the data"; DESIGN DECISION for the rest]`
6. **Safety** — Detect decline conservatively, never diagnose, always give an "ignore/continue" door, signpost to external support (BetterHelp) for persistence and to crisis resources for severe lows. `[DESIGN DECISION]` — no safety-angle source produced a *verified* claim; this is prudent design, not established evidence.

---

## 1. The daily data-collection instrument

### 1.1 A short single-item-per-pillar rating is defensible `[HIGH]`

A single life-satisfaction item is adequately reliable and measures essentially the same construct as the full multi-item SWLS:

- Latent state-trait reliability of single-item life satisfaction ≈ **0.68–0.74** (up ~16% once occasion error is modelled), meeting the 0.70 heuristic in **3 of 4** national panels (Lucas & Donnellan 2012).
- Single-item vs full SWLS: mean **r ≈ .70** across six samples; zero-order **r = .62–.64**, disattenuated **r = .78–.80**. Single items produce **virtually identical** correlations with external variables (average difference 0.001–0.005) — "researchers get virtually identical answers" (Cheung & Lucas 2014). The authors **explicitly endorse** single-item use.

**Implication for 20days:** three quick pillar ratings + an optional note is a legitimate instrument. We are not sacrificing validity for brevity.

### 1.2 …but single items are *noisier over time* — so smooth before trending `[MED]`

The cost of brevity shows up in longitudinal stability, which is exactly what a trend engine consumes:

- 10-month test–retest: SWLS **ICC = .56** vs single item **ICC = .43** (Jovanović & Lazić 2020, Serbian samples — single source). A lone item cannot average out occasion-specific error.

**Implication:** raw daily single-item scores carry meaningful measurement error. **Do not trend raw daily points** — smooth/aggregate first (moving average), and consider offering 2–3 micro-items per pillar as an optional "deeper" mode later. Adherence still favours one item/day as the default.

### 1.3 Short daily self-report sustains high adherence at low burden `[HIGH]`

- Pooled EMA compliance ≈ **79.2%** (SD 13.6%); 56.8% of studies hit ≥80%, only 2.6% under 50% (Wrzus & Neubauer 2023 meta-analysis, 496 samples). A parallel 68-dataset meta-analysis found **81.9%** (95% CI 79.1–84.4), with no clinical vs non-clinical difference.
- Typical designs: ~5–6.5 prompts/day, 8–10 items/prompt, protocol median 7–12 days; a **<1-minute, ~10-item** prompt produced only "a little" burden (mean 1.2/…).

**Implication:** a once-daily, ~3-rating + optional-note check-in is *well inside* the burden envelope the literature shows people tolerate. Our design is lighter than most research protocols.

### 1.4 Burden is state-dependent, not just length-dependent `[MED]`

- Within-person, **depressed mood added +0.15 burden units** (P=.002) and rising day-to-day stress +0.07 (P=.008). Protocol length alone showed "no compelling relationship" with compliance amid very high heterogeneity (I²>90%).

**Implication:** the people we most want to hear from (those declining) feel the logging as *heavier*. Keep entry frictionless, allow partial/skipped days gracefully, and **never** use guilt/streak mechanics (already our decision). This is also the core over-monitoring/rumination caution.

### 1.5 Capture momentary data, not recall — peak-end bias is large and real `[HIGH]`

- Peak-end rule confirmed in **everyday life** via ESM (Scharbert et al. 2025, N=1,889, 131,575 measurements) and meta-analytically **large** (r = **0.581**, 95% CI 0.487–0.661, 174 effect sizes; Alaybek et al. 2022). Duration effects are **essentially nil** (duration neglect).

**Two implications:**
1. Collect **daily** ratings; never rely on "how were the last 20 days?" summaries — they're systematically distorted by the worst and most-recent moments.
2. **This directly shapes the verdict day** (§3): show the user their *actual logged trend*, because their memory of the period is biased.

### 1.6 Scale granularity is NOT resolved by the evidence `[REFUTED / DESIGN DECISION]`

- A plausible claim that a **5-point** format beats 3-point and gains nothing from 7-point was **REFUTED (0-3)** in verification. The verified corpus gives **no basis** to prefer 1–5 vs 1–7 vs 0–10.

**Current choice (to validate):** **1–5 stepped slider per pillar** (`scale_version` 2). We started at 0–10 for trend resolution but shipped 1–5 for a faster, less clinical, more inviting check-in — the evidence doesn't favour either, so this is a UX call. Trade-off: coarser resolution against single-item noise, accepted because the engine already leans on a robust slope + magnitude-relative-to-SD gate rather than raw resolution. Raw scores + `scale_version` are stored so a re-widening stays possible. **Still flagged for A/B testing (1–5 vs 1–7 vs 0–10).**

### 1.7 Claims we checked and killed — do not design on these

- **[REFUTED 0-3]** "5-point scale is optimal." → granularity unresolved (above).
- **[REFUTED 0-3]** "EMA compliance decays day-over-day." → decay over a multi-week horizon is **not** established. Don't assume attrition is inevitable, but don't assume sustained adherence either (research protocols are mostly 7–12 days; **daily adherence over 20+ days is genuinely under-evidenced**).
- **[REFUTED 1-2]** "Time-of-day strongly drives compliance (afternoon best)." → equivocal; treat reminder-time as a user preference, not a validated lever.
- **[REFUTED 1-2]** A single study's very-low 10.9% non-adherence figure → not a reliable benchmark.

---

## 2. Trend-triggered vs fixed-interval reflection

### 2.1 Decline-targeted monitoring beats undifferentiated monitoring `[MED]`

Routine outcome monitoring (ROM) with feedback is the closest evidence base to our "verdict day":

- Overall ROM+feedback effect is **small: Hedges g ≈ 0.15** (~8% success-rate advantage).
- It **rises sharply to g ≈ 0.36–0.53** (20–29% advantage) when clinical support is **targeted at "not-on-track" (deteriorating) cases** (Barkham/de Jong et al. 2023 review).
- OQ-45 feedback meta-analyses: feedback clients had **<½ the odds of deterioration** and ~2.6× higher odds of reliable improvement (PCOMS/Lambert lineage).

**Implication:** intervening **when a decline is detected** (our verdict-day model) is more supported than reflecting on a blind fixed schedule. This validates the user's instinct.

### 2.2 Continuous collection doesn't beat less-frequent *on outcomes per se* — its value is earlier detection `[MED]`

- Data-collection **frequency** showed **no significant outcome difference** by itself; continuous collection's benefit was **earlier detection, fewer sessions, lower dropout**, and it "may be more critical in shorter-duration" contexts.

**Implication:** collect daily (cheap, enables early detection), but the *daily-ness* is not itself therapeutic — the **feedback/reflection event** is where value lands. Don't over-sell constant tracking.

### 2.3 Fire the trigger statistically/actuarially, not by vibe `[HIGH]`

- Statistical/actuarial models detect deterioration **far better than human judgment** (Meehl 1954; Aegisdottir 2006 ~13% advantage; Hannan 2005: actuarial flagged **36/40** deteriorators vs clinicians **1**). This is the OQ-45 "expected-trajectory / not-on-track" mechanism.

**Implication:** the verdict trigger must be a **defined algorithm on the logged data**, not a hand-wavy heuristic.

### 2.4 Concrete statistical tools the literature offers `[MED — clinical origin]`

The research surfaced usable primitives (clinical contexts; adapt, don't copy blindly):

- **Reliable Change Index (RCI):** `RC = (x₂ − x₁) / S_diff`; **|RC| > 1.96** ⇒ change unlikely (p<.05) to be measurement error (Jacobson & Truax 1991). Use the *idea*: gate the trigger on change large enough to exceed daily noise.
- **Clinically-significant-change thresholds:** e.g. OQ-45 uses a fixed **14-point** change. Analogue: require the smoothed decline to clear a **minimum magnitude**, not just a downward slope.
- **CUSUM-slope** statistics for detecting signal onset/offset against background noise; **moving averages**; **slope/Mann-Kendall trend tests** for short noisy series.

### 2.5 Over-monitoring & rumination risk is real `[MED]`

- Mobile mood-monitoring can raise self-awareness (benefit) **but also carries reactivity/rumination risk** (MeMO study, young people); burden rises with low mood (§1.4).

**Implication:** don't show a constantly-updating red "you're declining" gauge; don't nag. Present trends calmly, trigger the heavy moment rarely, and add a **cooldown** after each verdict.

### 2.6 Critical take: pure trend-trigger has a blind spot → go hybrid

The user asked for continuous, decline-only triggering vs fixed intervals. The honest critique:

- **Trend-trigger is right for the *alert* path** (§2.1, §2.3). ✔
- **But it never fires when life is flat or improving** — and *priorities drift regardless of mood*. A user who's "fine" for a year never gets prompted to check whether their 3 pillars still reflect what matters. The user explicitly wants "what matters most in my life changes over time" — a decline-only trigger can't deliver that.
- **Recommendation:** **Hybrid.**
  - **Primary — trend-triggered "Verdict Day":** the evidence-backed decline alert (rare, magnitude-gated, cooldown-protected).
  - **Secondary — periodic, gentle "priorities check-in":** low-key, fully dismissible, every ~30 days or user-set, purely for *values/priorities* review (not framed as an alarm). This is a product decision (evidence is silent on the exact cadence), justified by the priorities-drift requirement, not by clinical need.

### 2.7 Big caveat on all of §2

**All ROM/feedback/alert evidence comes from therapist-delivered clinical care, not consumer wellbeing apps.** The overall effect is small (g~0.15), one key paper's support was a split (2-1) vote, and a Cochrane review found insufficient evidence overall. The "decline-targeted beats undifferentiated" result is *additive-intervention* evidence, **not** a head-to-head trial of monitoring schedules. Treat the whole trend-trigger model as **well-motivated but requiring our own validation**.

---

## 3. Structuring the "Verdict Day"

**Scope warning:** No verified source directly prescribes how to structure a *non-clinical* re-evaluation. Below, only §3.1 is evidence-backed; §3.2–3.5 are reasoned product design (`[DESIGN DECISION]`) — ship them as hypotheses to test, not facts.

### 3.1 Show the data; don't ask for recall `[HIGH]`

Because retrospective summaries are peak-end biased (§1.5), the verdict day must **lead with the user's own logged daily trend** (charts per pillar + composite) rather than "how do you feel the last few weeks went?". Seeing 20 days of real data is the antidote to a memory dominated by the worst/most-recent day.

### 3.2 A calm, non-alarming frame `[DESIGN DECISION]`

Open neutrally: *"Your **Health** pillar has trended down over the last few weeks. Let's look at it together."* — never "You're in decline" or anything diagnostic. Safety literature (JMIR Human Factors 2025) says digital tools should track outcomes, identify at-risk users, and **signpost** — without clinical overreach.

### 3.3 Real problem vs temporary illusion — reflective prompts `[DESIGN DECISION]`

After showing the data, a few structured prompts to separate signal from noise:
- *"What was going on during these weeks?"* (context anchoring)
- *"Does this feel like a rough patch with a specific cause likely to pass — or a persistent pattern?"*
- *"Which single pillar is driving the dip?"* (the app can pre-answer from data)

### 3.4 Values / priorities re-evaluation `[DESIGN DECISION]`

- *"Do these 3 pillars still reflect what matters most to you right now?"* → inline **edit pillars & definitions**. This satisfies the priorities-drift requirement and doubles as the payload of the periodic check-in (§2.6).

### 3.5 Agency — three doors `[DESIGN DECISION]`

The user must always be able to walk away:
1. **Ignore / keep going** — dismiss, no guilt, keep tracking. (Non-negotiable: user agency to continue.)
2. **Adjust priorities** — edit pillars (§3.4).
3. **Get support** — CTA to **BetterHelp**-style external platform, framed as *"if this feels persistent, talking to someone can help"* — signpost, not prescription. Consistent with the product stance: *help the user recognise a problem, let others treat it.*

### 3.6 Safety rails `[DESIGN DECISION]`

> Note: the safety-angle sources (JMIR Human Factors 2025, Frontiers 2026) informed this section but **none produced a verified claim** in the adversarial pass. Treat the rails below as prudent, standard-practice design — not evidence-established thresholds.


- **No diagnosis, no clinical claims**; explicit "not medical advice."
- **Two-tier response:** *persistent-but-moderate* dip → BetterHelp signpost; *severe* signals (e.g. floor-level scores) → surface **crisis resources / helplines** directly, not just a marketing CTA.
- **Conservative thresholds** to avoid false alarms (magnitude gate + minimum data + cooldown, §2.4–2.5). False alarms erode trust and can themselves cause harm.
- **Privacy:** this is the most sensitive data the app holds → local-first storage is a safety feature, not just an infra choice.

---

## 4. What remains open (validate before/at build)

1. **Scale granularity** — 0–10 vs 1–5 vs 1–7 (evidence refuted the "5 is best" claim). A/B test.
2. **Exact trend algorithm & minimum data points** — smoothing window, slope test vs CUSUM vs RCI-style magnitude gate, how many logged days before a verdict can fire. Prototype on synthetic + pilot data.
3. **Verdict-day prompt wording & values exercise** — entirely unvalidated; usability-test.
4. **Referral thresholds & false-alarm calibration** — no source covered consumer-app referral thresholds; design conservatively and monitor.
5. **Sustained daily adherence over 20+ days** — under-evidenced (protocols mostly 7–12 days); instrument the app to measure our own retention.
6. **Clinical→consumer transfer** — does small clinical ROM benefit survive in a self-guided app? Unknown; measure engagement→outcome ourselves.

---

## 5. Sources

**Instrument / single-item validity**
- Lucas & Donnellan (2012), *Estimating the Reliability of Single-Item Life Satisfaction Measures* — https://pmc.ncbi.nlm.nih.gov/articles/PMC3475500/
- Cheung & Lucas (2014), *Assessing the validity of single-item life satisfaction measures* — https://pmc.ncbi.nlm.nih.gov/articles/PMC4221492/
- Jovanović & Lazić (2020), *Is Longer Always Better? Single- vs Multiple-item Life Satisfaction* — https://link.springer.com/article/10.1007/s11482-018-9680-6
- (Scale granularity, REFUTED) — https://files.eric.ed.gov/fulltext/EJ1359497.pdf

**EMA/ESM adherence, burden, reactivity**
- Wrzus & Neubauer (2023), *EMA: A Meta-Analysis on Designs, Samples, and Compliance* — https://journals.sagepub.com/doi/10.1177/10731911211067538
- mEMA design review (JMIR 2021) — https://www.jmir.org/2021/3/e17023
- Daily-EMA burden (state-dependent) — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11079761/
- Compliance decay / time-of-day (REFUTED claims) — https://formative.jmir.org/2022/3/e32537/
- Mobile mood-monitoring reactivity (MeMO) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8363129/

**Peak-end / retrospective bias**
- Scharbert et al. (2025), peak-end in everyday life (Eur. J. Personality) — https://journals.sagepub.com/doi/abs/10.1177/08902070241235969
- Alaybek et al. (2022), peak-end meta-analysis (174 effect sizes) — https://www.sciencedirect.com/science/article/abs/pii/S0749597822000334

**ROM / feedback / alerts / change indices**
- Barkham/de Jong et al. (2023), *ROM and Feedback: Review & Recommendations* (Psychotherapy Research) — https://www.tandfonline.com/doi/full/10.1080/10503307.2023.2181114
- PCOMS journal article (2015) — https://betteroutcomesnow.com/wp-content/uploads/partners-for-change-outcome-management-system-2015-journal-article-1.pdf
- Jacobson & Truax (1991), *Clinically Significant Change* (RCI) — https://www.researchgate.net/publication/221745228_Clinically_Significant_Change
- OQ-45 / ROM implementation — https://pmc.ncbi.nlm.nih.gov/articles/PMC11076375/ · https://pmc.ncbi.nlm.nih.gov/articles/PMC8038917/ · https://pubmed.ncbi.nlm.nih.gov/30335463/

**Trend statistics & safety / referral**
- CUSUM-slope statistic — https://www.researchgate.net/publication/228577752_A_Theoretical_Analysis_of_Cumulative_Sum_Slope_CUSUM-Slope_Statistic
- Digital mental health safety (JMIR Human Factors 2025) — https://humanfactors.jmir.org/2025/1/e62974/
- Digital-health safety/referral (Frontiers 2026) — https://www.frontiersin.org/journals/digital-health/articles/10.3389/fdgth.2026.1814547/full

*Full machine-readable output (all claims, votes, evidence quotes): `~/.claude/projects/-Users-damo-Desktop-damo-code-20days/…/tasks/ws2zyvl84.output`.*
