# RollIQ — Design Handoff

**Retro bowling-alley direction.** Dark neon "after-hours alley" primary, with a cream vintage-poster light mode available via token swap. This folder is framework-agnostic — hand to an engineer working in React, Vue, Swift, Kotlin, or any other stack.

---

## 📦 What's in here

```
design_handoff_rolliq/
├── README.md                 ← this file
├── design-tokens.json        ← W3C design-tokens spec — colors, type, radius, spacing, effects
├── logo.svg                  ← RollIQ wordmark (Kalnia italic, cyan + pink)
├── screenshots/              ← PNG references of every screen at design size
│   ├── pulse-desktop.png       (1440×900)
│   ├── pulse-mobile.png        (390×800)
│   ├── live-desktop.png        (1440×900)
│   ├── live-mobile.png         (390×800)
│   ├── analytics-desktop.png   (1440×900)
│   ├── analytics-mobile.png    (390×800)
│   ├── session-start-mobile.png(390×800)
│   ├── arsenal-mobile.png      (390×800)
│   └── ball-detail-mobile.png  (390×800)
└── prototype/                ← interactive HTML reference (open `RollIQ HiFi.html`)
    ├── RollIQ HiFi.html        ← open this in a browser
    ├── hifi.css                ← all tokens + utilities
    ├── hifi-retro.jsx          ← Pulse screen (desktop + mobile)
    ├── hifi-retro-screens.jsx  ← Live / Analytics / Session / Arsenal / Ball Detail
    ├── design-canvas.jsx       ← pan/zoom canvas that holds all artboards
    └── tweaks-panel.jsx        ← runtime tweak panel (accent, intensity, etc.)
```

The prototype is a visual spec, not production code. **Build native; mirror the tokens.**

---

## 🎨 Design direction in one sentence

> A 1960s bowling alley's neon marquee meets a modern sports analytics tool.

**Visual DNA:**
- **Type personality is everything.** Four families do specific jobs:
  - `Kalnia` *italic* — screen titles, event names, ball names ("Pulse", "Thursday Doubles", "Phaze II")
  - `Bungee` UPPERCASE — section labels, chips, buttons, **all numbers** ("LIVE · G2 OF 3", "213", "+3.1")
  - `Monoton` — decorative "Roll IQ" wordmark only
  - `JetBrains Mono` — metadata, timestamps, ball specs
  - `Inter` — body copy and fallback
- **Neon hot-pink + electric-cyan** on deep-purple-black. Light mode swaps to cream + deep magenta + teal.
- **Scoresheet as cultural anchor.** The classic 10-frame grid, ball-marks at cell tops (X, /, numbers), running totals at the bottom — this is the heart of the brand.
- **Square-ish corners (4-6px)**, no blur-heavy glass. Subtle scanline overlays and neon text-shadows instead.

---

## 🎯 Tokens

All design tokens are in `design-tokens.json` following the [W3C Design Tokens Community Group format](https://design-tokens.github.io/community-group/format/). Import directly into Style Dictionary, Tokens Studio, or any compliant pipeline.

### Color — quick reference

| Role | Dark mode | Light mode |
|---|---|---|
| Page bg | `#1A1020` | `#FFF6E0` |
| Card | `#221630` | `#FFFBEF` |
| Primary text | `#FFF6E0` | `#1A1020` |
| **Accent** (pink/magenta) | `#FF2E6E` | `#D91458` |
| **Accent-2** (cyan/teal) | `#00E0FF` | `#0097B8` |
| Success | `#6CFF9A` | `#1FA26A` |
| Danger | `#FF2E6E` | `#D91458` |

### Type scale

Mobile hero: 72px Bungee. Desktop hero: 88px Bungee. Section titles: 22–40px Kalnia italic. Body: 13px Inter. Mono metadata: 10–12px JetBrains Mono. Full scale in tokens.

### Radius

`sm: 4px` is the default retro corner (scoresheet cells, chips, cards). `md: 6px` for inputs. Nothing above 8px — we want angular, not squishy.

---

## 📱 Screens

All screens support dark + light via a single `data-theme` attribute. The prototype currently wires this through a `theme` prop on each component; in production, put `data-theme="retro-dark"` or `data-theme="retro-light"` on your app root and all CSS variables cascade.

**Web / desktop (1440×900):**
1. **Pulse** — home dashboard. Hero is 30-day rolling avg. Coach's daily-read card, 4 KPI tiles, recent sessions, bag contents, top-3 leaks.
2. **Live game** — full scoresheet, strike/spare/open counters, running average chart, next-frame coaching hint.
3. **Analytics** — 12-week average line chart, first-ball conversion by pin, spare conversion matrix, leak leaderboard.

**Mobile (390×800):**
4. **Pulse (mobile)** — condensed hero, stat row, coach card, recent games list.
5. **Live game (mobile)** — big strike/spare tap targets (56px hit area), current-frame emphasis in scoresheet, ball-selection chip.
6. **Analytics (mobile)** — swipeable insight cards, 12-week chart, pin-deck conversion.
7. **Session start** — center alley selector, league vs. practice vs. tournament, ball picker.
8. **Arsenal** — scrollable bag with ball cards (weight, surface, pin-to-PAP, last rolled).
9. **Ball detail** — hero ball with specs, 10-game performance sparkline, layout diagram.

Tablet and larger-than-1440 breakpoints: widen the page gutter, keep the column structure. No separate tablet layout needed.

---

## 🔊 Voice & copy

Direct, coach-like, second-person. Numbers do most of the work; prose frames them.

Good: *"Your 10-pin is costing you 6.2 pins per game."*
Bad: *"We've noticed some interesting trends in your right-side conversions."*

Section titles are always Kalnia italic and always in title-case or lowercase ("Recent sessions", "In the bag") — never ALL CAPS. Chips, buttons, and data labels are always Bungee UPPERCASE ("LIVE · G2 OF 3", "OPEN DRILL PLAN").

---

## ⚙️ Engineering notes

- **Fonts** — load via Google Fonts:
  `Archivo:wght@400;600;700;800;900`, `Inter:wght@400;500;600;700`, `JetBrains+Mono:wght@400;500;600;700`, `Monoton`, `Bungee`, `Kalnia:ital,wght@0,600;1,600`, `Playfair+Display:ital,wght@1,600`. The last two are fallbacks for Kalnia on platforms where it's unavailable.
- **Neon glow** — dark mode only. Apply to `.accent`/`.accent-2` text via `text-shadow` and to primary buttons via `box-shadow`. Never apply in light mode (the effects are set to `none` in light tokens).
- **Scanlines** — the subtle 1px-per-4px overlay (see `$effect.scanlines` token). Dark-mode only, hero cards only, never globally.
- **Scoresheet** — 10 frames, last frame has 3 balls. Strike = `X`, spare = `/`, running total below ball marks. The prototype's `RScore` component (`hifi-retro-screens.jsx`) is the canonical visual — reimplement in your framework, don't port the JSX.
- **Hit targets** — mobile strike/spare/open buttons use 56px; nothing below 44px per token `hit-target.min`.
- **Tabular numerals** — all data-display uses `font-variant-numeric: tabular-nums`. Bungee is already tabular; when falling back to Archivo, add it explicitly.

---

## ✏️ What's intentionally NOT spec'd

- **Icons.** Used sparingly; placeholders in the prototype (small glyphs). Pick an icon set that matches the square/angular feel — [Phosphor](https://phosphoricons.com/) regular, [Lucide](https://lucide.dev/), or custom. Don't use filled pastel iconography.
- **Photography.** Ball imagery in the prototype is CSS gradients. Production should use real ball photos on transparent backgrounds, consistent lighting, 1:1 crops.
- **Empty / error / loading states.** Ask design before building — they should feel native to the retro aesthetic (e.g. a spinning marquee "LOADING…" rather than a generic skeleton).
- **Full dark/light parity.** The current prototype's "light mode" flips the outer page background but keeps the app surface dark as an accent panel — that's an intentional "framed poster" look. If you need a fully-cream light mode, the tokens are there; the CSS variable chain is already wired; just make sure card backgrounds reference `var(--bg-1)` etc. rather than the hardcoded dark hex values the prototype currently uses on a handful of nav/sidebar surfaces.

---

## 🔗 Contact

Questions, missing tokens, edge cases → ping design. Don't invent tokens; ask.
