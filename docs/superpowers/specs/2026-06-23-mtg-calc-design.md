# MTG 機率計算機 — Design Spec

**Date:** 2026-06-23  
**Status:** Approved  
**Scope:** Vue 3 SPA — Magic: The Gathering opening hand probability calculator

---

## 1. Overview

A single-page calculator that helps MTG players evaluate their deck's land distribution and mana colour reliability across the first 5 rounds of a game. All computation is client-side; no server, no persistence.

**Target users:** Chinese-speaking MTG players (Limited and Constructed formats).  
**UI language:** Chinese (Traditional/Simplified mix acceptable; no i18n toggle in v1).

---

## 2. Features

### 2.1 Land Probability Section

- User inputs **deck size** (preset: 40 / 60, or custom free-input ≥ 7) and **land count**.
- Non-land count is derived: `nonland = deckSize − landCount`.
- Displays the full hypergeometric probability distribution for drawing exactly 0, 1, 2 … 11 lands across hand sizes of **7, 8, 9, 10, 11 cards** (opening hand + turns 1–4).
- Output: **bar chart** (Chart.js via vue-chartjs) + **numeric table** (exact percentages).

### 2.2 Colour Probability Section

- Appears only when at least one colour count > 0.
- User inputs per-colour land counts for **B, W, U, G, R** using `<input type="number">`.
- For each colour with count > 0, shows a full hypergeometric distribution (same shape as §2.1) — one chart + table per colour.
- User may optionally enter a **mana cost** string (e.g. `1GG`, `BB`, `UB`) to enable castability calculation.
- **Play first / Draw first toggle** (default: play first): affects how many land drops are available per round.
- **Castability:** per round — first apply the **turn-drop gate** (see §4.3), then P(total lands drawn ≥ CMC) × Π_color P(color_c drawn ≥ pip_c). Both conditions must hold jointly. Treating total-land and per-color requirements as independent is the same approximation used for multi-color independence — acceptable for typical splits, stated explicitly.
- Castability display is hidden when mana cost field is empty or unparseable.

### 2.3 Advisor

- A live advisory card displayed between DeckConfig and LandSection.
- Updates reactively on every input change.
- Emits messages of three types: `warn` (🟡), `ok` (🟢), `info` (🔵).

**Benchmark rules:**

| Format | Deck size | Recommended lands |
|--------|-----------|-------------------|
| Limited | 40 | 17 |
| Standard / Modern | 60 | 24 |
| Custom | any | `round(deckSize × 0.425)` |

**Probability warnings (based on 7-card opening hand):**

| Condition | Threshold | Message |
|-----------|-----------|---------|
| P(0 or 1 land) | > 25% | 地牌過少，起手卡頓風險高 |
| P(5+ lands) | > 20% | 地牌過多，資源浪費風險高 |
| P(castable for entered cost) by turn 3 (`r=2` on play, `r=3` on draw) | < 50% | 色源不足，難以如期施放（需 CMC 張地且足夠色源）|

---

## 3. Architecture

### 3.1 Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Vue 3 + Vite | Composition API reactivity ideal for live calculator |
| Styling | Tailwind CSS | Utility-first, responsive with minimal custom CSS |
| Charts | Chart.js + vue-chartjs | Lightweight, good bar/line, minimal bundle |
| State | Local `ref`/`computed` only | No router, no Pinia — scope doesn't warrant it |

### 3.2 Project Structure

```
src/
  composables/
    useLandProbability.js   # hypergeometric math + land distribution matrix
    useColorProbability.js  # per-colour distribution + castability
    useAdvisor.js           # benchmark + probability-based advisory messages
  components/
    DeckConfig.vue          # deck size toggle (40/60/custom) + land input
    AdvisorCard.vue         # live advisory message list
    LandSection.vue         # land distribution chart + table
    ColorConfig.vue         # B/W/U/G/R inputs + mana cost input
    ColorSection.vue        # per-colour charts + castability table
    ProbChart.vue           # reusable Chart.js bar chart wrapper
    ProbTable.vue           # reusable probability percentage table
  App.vue                   # composes all sections top-to-bottom
  main.js
```

### 3.3 Page Layout

Single column, top-to-bottom:

```
┌─────────────────────────────────────┐
│  🃏 MTG 機率計算機  (header)          │
├─────────────────────────────────────┤
│  DeckConfig                          │
│  [40] [60] [自訂: ___]  地/非地輸入   │
├─────────────────────────────────────┤
│  AdvisorCard  (live, always visible) │
├─────────────────────────────────────┤
│  LandSection                         │
│    ProbChart + ProbTable             │
├─────────────────────────────────────┤
│  ColorConfig (B/W/U/G/R + 費用輸入)  │
├─────────────────────────────────────┤
│  ColorSection (hidden if all 0)      │
│    Per-colour ProbChart + ProbTable  │
│    CastabilityTable (if cost set)    │
└─────────────────────────────────────┘
```

Responsive: full-width on mobile, max-width container centred on desktop. Charts full-width on mobile, two-column on tablet+ (`sm:` Tailwind breakpoints).

---

## 4. Data Model

### 4.1 Hypergeometric PMF

$$P(X = k) = \frac{\binom{K}{k}\binom{N-K}{n-k}}{\binom{N}{n}}$$

- $N$ = deck size
- $K$ = land count (or per-colour count)
- $n$ = cards drawn (7, 8, 9, 10, 11)
- $k$ = exact count of lands drawn

Implementation uses **log-space computation** (`logGamma` / Stirling) to avoid floating-point overflow for large custom deck sizes.

### 4.2 Composable Interfaces & Dependency Wiring

All three composables are instantiated in `App.vue`. Reactive refs are passed as arguments so each composable remains a pure function with no hidden imports.

```js
// App.vue (wiring only)
const land = useLandProbability()
const color = useColorProbability(land.deckSize, land.landMatrix)
const advisor = useAdvisor(land, color)

// useLandProbability.js  — owns deck config state
{
  deckSize: ref(40),          // number
  landCount: ref(17),         // number
  nonlandCount: computed,     // deckSize - landCount
  landMatrix: computed,       // number[5][12]
                              // [roundIdx][k] = P(exactly k lands)
                              // roundIdx 0–4 → hands 7,8,9,10,11
}

// useColorProbability.js — receives deckSize and landMatrix as args
{
  playFirst: ref(true),       // true = play first; false = draw first
  colorCounts: ref({ B:0, W:0, U:0, G:0, R:0 }),
  manaCost: ref(''),          // raw string, e.g. "1GG"
  parsedCost: computed,       // { cmc: 7, pips: { G:2 } } — CMC = generic + Σpips
  colorMatrix: computed,      // Record<Color, number[5][12]>
  castability: computed,      // number[5] — P(castable) per round
}

// useAdvisor.js — receives land and color composable return values as args
{
  advisorMessages: computed,  // Array<{ type: 'warn'|'ok'|'info', text: string }>
}
```

### 4.3 Mana Cost Parsing

Parse mana cost string into `{ generic, cmc, pips }`:
- Extract leading integer (generic mana) → `generic`. Default 0 if absent.
- Count each remaining colour character → `pips: Record<Color, number>`.
- `CMC = generic + Σpips`.
- Examples: `"2GG"` → `{ generic:2, cmc:4, pips:{G:2} }` | `"UB"` → `{ generic:0, cmc:2, pips:{U:1,B:1} }` | `"5GG"` → `{ generic:5, cmc:7, pips:{G:2} }` | `"XZ"` → invalid.

**Castability formula per round index `r` (0-based, hand size `n = r+7`):**

**Step 1 — Turn-drop gate:**
$$\text{maxMana}(r) = \begin{cases} r+1 & \text{play first} \\ r & \text{draw first} \end{cases}$$
$$\text{if } \text{CMC} > \text{maxMana}(r) \Rightarrow P_{\text{cast}}(r) = 0$$

Rationale: you play at most 1 land per turn. On the play, turn 1 is available at r=0; on the draw, your first land drop is at r=1 (after drawing into 8 cards).

**Step 2 — Probability (only when CMC ≤ maxMana):**
$$P_{\text{cast}}(r) \approx P_{\text{lands}}(r) \times \prod_c P(\text{color}_c \geq \text{pip}_c \mid n)$$
- If `generic === 0`, set $P_{\text{lands}}(r)=1$ because the required coloured pips already imply enough total lands for the CMC.
- If `generic > 0`, set $P_{\text{lands}}(r)=P(\text{lands} \geq \text{CMC} \mid n)$ from `landMatrix` (cumulative sum over k ≥ CMC). This remains a conservative independence approximation for generic-heavy costs.
- $P(\text{color}_c \geq \text{pip}_c \mid n)$ — from `colorMatrix[c]` (cumulative sum over k ≥ pip_c).
- All multiplied terms treated as independent (approximation).

---

## 5. Error Handling & Edge Cases

| Condition | Behaviour |
|-----------|-----------|
| `landCount > deckSize` | Input red border; advisor error; charts hidden |
| `landCount = 0` | Charts show 0% land curve; advisor warns 無地牌 |
| `colorCounts sum > landCount` | Advisor warns 色源總數超過地牌數 |
| Custom deck size < 7 | Input blocked at minimum 7 |
| Unparseable mana cost | Input red border; castability row hidden |
| All colour inputs = 0 | ColorSection hidden entirely |
| `k > n` or `k > K` in PMF | Explicit return 0 (guard before log-space calc) |

---

## 6. Out of Scope (v1)

- Mulligan simulation (London mulligan)
- i18n / language toggle
- Deck saving / sharing
- Commander / Brawl format presets (custom input covers the need)
- Probability of drawing specific non-land cards
