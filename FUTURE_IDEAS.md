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

---

## Template for new ideas

```
## N. Title
**What** — one-line description
**Why** — the user/product problem it solves
**Rough shape** — how it might work
**Open risks** — what to resolve before building
```
