# 20days — Future Ideas

Parking lot for post-MVP ideas. Not committed scope. Each entry: what, why, rough shape, open risks.

---

## 1. AI accountability partner / support chatbot (with long-term user memory)

**What**
A conversational agent inside the app that knows the user's history and acts as an accountability partner and reflective companion — not a therapist. Complements the "verdict day" reflection rather than replacing external professional support.

**Why**
The core app only measures and signals trends. A chatbot could help the user *interpret* a trend, talk through a low pillar, and stay accountable to the priorities they set — the "recognise a problem exists or it's a temporary illusion" goal, made interactive.

**Rough shape**
- **Memory as a vector knowledge base**: embed the user's daily scores, notes, pillar definitions, past verdict-day reflections, and edited priorities. Retrieve relevant history per conversation (RAG) so the bot has continuity ("last month your Health pillar dipped whenever work travel spiked").
- Possible layers: raw entries → periodic summaries (weekly/monthly rollups) → durable "facts about me" (like a memory file per user).
- On-device vs cloud embeddings decision — heavy privacy implications (see risks).
- Could surface at: verdict day, on request, or as an optional daily check-in voice.

**Open risks / to resolve**
- **Privacy**: this is the most sensitive data in the app. Local-first vector store (on-device embeddings) strongly preferred; any cloud LLM call leaks intimate data. Consider on-device models or strict opt-in + encryption.
- **Clinical overreach**: must stay accountability/reflection, NOT therapy or crisis handling. Needs guardrails + escalation-to-human/hotline paths. Aligns with the app's "we help recognise, others help treat" stance.
- **Cost**: LLM inference for an indie app — token budget, on-device model feasibility.
- **Trust**: users may over-rely on it. Keep external-support CTA (e.g. BetterHelp) primary for real problems.

**Evidence verdict (2026-07-02)** — *deep-research pass, 23 sources / 115 claims / adversarial verify; confidence tags per `docs/RESEARCH.md` convention.*

> **Verdict: NO to the idea as written (open-ended, always-available, persona "partner", RAG over full history). Narrow YES available only for a bounded, non-persona, Verdict-Day-only trend-interpreter — and even that is lower priority than the unbuilt core (priorities check-in, crisis/BetterHelp split) and imports real safety cost.** The single strongest finding: across every angle, harms cluster in the *open-ended / persona / always-on / relationship-simulating* design, and benefits cluster in the *bounded / user-driven / structured / interpreter-not-author* design. The app's own philosophy already sits on the safe side — so a companion built as parked would fight the product; a narrow interpreter would extend it.

- **Wrong evidence class.** The Woebot/Wysa RCT base does **not** transfer — that is purpose-built therapy chatbots. Our class is reflective/journaling companions, where the best evidence is proof-of-concept grade: MindScape (N=20, 8-week, LLM journaling *prompts* not chat: +7% positive / −11% negative affect, PHQ-4 −0.25/wk) had **no control group** and **excluded depressed users (PHQ-8) for safety** because the prompts were unmoderated. `[MED — no RCT]` APA (Nov 2025) draws the same line: benefit evidence applies only to purpose-built apps, not general GenAI. `[HIGH]`
- **Timing paradox (the core objection).** 20days would surface the companion exactly at sustained decline / Verdict Day — the moment MindScape *screened people out* for. Unmoderated AI reflection deployed at the user's lowest point. `[HIGH]`
- **It attacks our own premise.** DiaryMate (N=24, 10-day): users over-relied on the AI, prioritised its emotional wording over their own, and suffered **distorted recall** — "after I read AI suggestions I forgot my feelings and followed what AI said… did I really feel that way?". Our whole anti-recall-bias thesis is *show the user their authentic data*; an AI that reframes corrupts it. `[MED]`
- **Sycophancy = opposite of "recognise a passing dip."** APA + Replika corpus: agreeable AI validates/amplifies self-defeating narratives and feeds rumination/reassurance loops. A companion "talking through a low pillar" risks confirming a dip as a crisis. Mood-monitoring *alone* already triggers rumination for some users (npj Digital Medicine 2025) — chat amplifies it. `[MED]`
- **Therapy-drift is user-side and disclaimer-proof.** DiaryMate users perceived the LLM as a therapist despite zero therapy framing. A "NOT a therapist" label does not control the experience. `[MED]`
- **Regulation is tightening toward exactly this.** Illinois WOPR Act (eff. Aug 1 2025) bans AI that offers recommendations to *improve* mental/behavioral health — not limited to clinicians, reaches developers, **$10k/violation**, and an AEI analyst says it plausibly covers journaling/meditation apps; it specifically bans AI "detecting emotions or mental states." Nevada + Utah similar; CA/PA/NJ drafting; CA SB243 / NY AB6767 mandate suicidal-ideation crisis plans. FTC 6(b) (Sept 2025) flags "companion" framing; Apple 5.1.2(i) (Nov 2025) requires explicit consent to send personal data to third-party AI or removal. `[HIGH]`
- **Case studies say don't.** **Woebot** shut its consumer app (June 30 2025) after ~1.5M users — best-credentialed, FDA-track, and still couldn't survive B2C. **Headspace Ebb** shipped *exactly* the "empathetic companion, no advice/guidance/diagnoses" scope we're considering — but bundled it **free with no plans to monetise** (engagement feature, not revenue), built it with clinical psychologists + motivational interviewing + rigorous boundary testing + hotline-routing crisis guardrail, and at launch it **only remembered the last conversation** (less than our proposed RAG-over-history). The paid/usage-limited assumption is contradicted by the one incumbent doing this scope. `[MED]`
- **Cost is not the blocker; the blocker is fit + safety.** Cloud Claude Haiku 4.5 ≈ **$0.20/user/mo** for a bounded interpreter (~100k in / 20k out), less with prompt caching / Batch API for a *pre-computed* Verdict narrative. On-device (Apple Foundation Models, iOS 26, ~3B params, **4096-token** hard context, Apple endorses RAG) is $0 marginal and fully private — but needs a **dev build / New Architecture, breaking our "runs in Expo Go" constraint**, and is capped at a small model with 10× device variance. `[HIGH]`

**If ever built — narrowest viable design (an *interpreter*, not a *companion*):** fires **only at Verdict Day** (never daily, never always-on); **no persona, no name, no relationship, no open thread**; generates **reflection questions grounded in the user's own logged data, not answers/advice** (interpreter-not-author, per DiaryMate remedy); hard low message cap; **pre-computed / on-device** to preserve local-first; mandatory crisis-detection → hotline routing → end conversation (Ebb bar); still fully dismissible (agency). This is an *enhancement of Verdict Day §3.3*, not a chatbot — and it should wait behind the priorities check-in and the crisis/BetterHelp split.

**Build status (July 2026)** — the narrow interpreter is now partly built as the **Verdict narrator** (`src/verdict/`). **Phase 1 (shipped, Expo Go):** templated (no-AI) interpreter — grounded reflection questions + relevance-selected verbatim notes + one optional written reflection; no persona, no chat, no advice. **Phase 2 (scaffolded, INERT):** on-device **Apple Foundation Models** behind the same seam (`appleNarrator.ts`, `APPLE_BACKEND_INSTALLED = false`) — private, never cloud; generates note-aware questions + extractively ranks notes. **Still owed before Phase 2 ships:** the crisis-tier gate (floor scores → skip journaling, route to hotline) — the timing-paradox mitigation — and on-device verification (needs a dev build + iOS 26 / A17-Pro+ device). OpenRouter/cloud was explicitly rejected (keep it sealed on-device).

---

## Template for new ideas

```
## N. Title
**What** — one-line description
**Why** — the user/product problem it solves
**Rough shape** — how it might work
**Open risks** — what to resolve before building
```
