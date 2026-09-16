# SKYFORGE — Build Your First Drone This Weekend 🛸

> 42 parts. One weekend. Zero excuses.

**SKYFORGE** is a dependency-free landing page for a DIY drone-kit brand,
wrapped in a dawn "mission control" atmosphere: drifting clouds, an HUD grid
with corner brackets, a roaming scan sweep, and a **Canvas flight-path
engine** — a dashed waypoint route with a spinning-rotor drone marker,
orange trail and radar blips. No libraries, no build step, no WebGL.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)]()
[![Build](https://img.shields.io/badge/build-not%20required-brightgreen.svg)]()

<img width="1349" height="4554" alt="image" src="https://github.com/user-attachments/assets/b15c79f5-a2f5-4584-aab9-7a3797ba2051" />

---

## ✨ Features

- 🌅 **Dawn sky stack** — pure-CSS gradient sky, horizon glow and blurred
  clouds drifting on independent loops
- 🛰️ **Flight-path canvas** — waypoint route, constant-speed drone with
  spinning rotor arms, fading trail and popping radar blips
- 📟 **Live telemetry** — ALT / SPD / BAT readouts jitter every 900 ms
  (static values remain if JS is blocked)
- 🖥️ **HUD dressing** — grid overlay, corner brackets, roaming scan sweep,
  config terminal with blinking cursor
- 🌀 **Spinning rotor logo** — two counter-rotating CSS arcs
- 🎞️ **Parts marquee** — infinite seamless ticker, pauses on hover
- 🔢 **Count-up stats** — 42 parts · 6 hr build · 9.4k builders
- 🧰 **Kit / Build / Specs / Pricing** sections with glass cards and a
  gradient-border "Most built" tier
- 👀 **Scroll reveals** — gated behind `html.js`, content never hides if
  scripts are blocked
- ♿ **Reduced-motion aware** — clouds, sweep, rotors and reveals calm down
- 📴 **Offline-ready** — works from `file://` in any modern browser

## 🚀 Quick Start

```bash
git clone https://github.com/AmiARMiess/skyforge.git
cd skyforge
open index.html        # double-click works — no server needed
```

Fonts (Rajdhani + Inter) load from Google Fonts when online and fall back to
system sans offline. Everything else is fully local.

## 📁 Structure

```
skyforge/
├── index.html     # background stack + hero, marquee, kit, build, specs, pricing, CTA
├── style.css      # tokens, sky/HUD layers, glass cards, marquee, animations
├── script.js      # flight-path engine + watchdog, telemetry, reveals, counters
├── README.md      # this file
└── .gitattributes # line-ending + linguist rules
```

## 🧩 Sections

| Section  | Content                                              |
|----------|------------------------------------------------------|
| Hero     | Kit badge, uppercase headline, live telemetry, stats |
| Marquee  | Infinite scrolling parts ticker                      |
| Kit      | 6 glass cards — frame, motors, ESC, FC, RX, VTX      |
| Build    | 4-step timeline with arrow connectors                |
| Specs    | Checklist + HUD config terminal card                 |
| Quote    | Builder testimonial with gradient accent             |
| Pricing  | 3 tiers with gradient-border "Most built" plan       |
| CTA      | Glass panel with dual buttons                        |
| Footer   | Auto year + docs/safety/regulations links            |

## 🎨 Theming

All tokens live in `:root` of `style.css`:

```css
:root{
  --night:#04101E;   /* pre-dawn blue        */
  --ink:#EAF4FF;     /* cockpit white        */
  --orange:#FF7A1A;  /* signal orange        */
  --cyan:#35C4E8;    /* HUD cyan             */
  --green:#6EF2A6;   /* telemetry green      */
  --grad:linear-gradient(100deg,var(--orange),var(--cyan));
}
```

Swap the two accent colors and every gradient, glow, trail, tag and ticket
border follows automatically.

## 🛡️ Graceful Degradation

1. **JS blocked** → reveals never hide content (`html.js` gate); sky, clouds,
   sweep, rotor and marquee keep animating in pure CSS; telemetry shows
   static values.
2. **Canvas unavailable** → flight-path init exits silently; HUD remains.
3. **Loop stalled** → a 400 ms watchdog re-arms `requestAnimationFrame`
   after tab switches, sleep or browser throttling.
4. **No IntersectionObserver** → reveals and counters resolve instantly.
5. **Reduced motion** → clouds, sweep, rotors and reveals freeze into a
   clean static poster.

## ⚙️ Performance

- Zero network requests except optional fonts
- All CSS motion is compositor-friendly (transform / opacity on fixed layers)
- Canvas draws one route, one drone and ≤4 blips per frame at capped DPR (2)
- Parallax and telemetry use passive listeners / intervals, no layout thrash
- ~180 lines of vanilla JS, fully wrapped in `try/catch`

## 🧑 Browser Support

Any modern browser (Chrome, Edge, Firefox, Safari), including older builds —
no WebGL, no modules, no polyfills.

## 📄 License

MIT — free for personal and commercial use.

---

*The sky needs builders. Fly safe, fly legal.*
