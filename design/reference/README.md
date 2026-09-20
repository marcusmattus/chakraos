# ChakraOS — Design System (imported reference)

> Source: Claude Design project `chakraos` (96ff9616-4ae8-4044-bdd6-6ca0eafef76f), imported 2026-09-12.
> This is **visual/copy reference only** — a browser-JSX mockup, not React Native code to paste in.
> Canonical typography for this app stays Outfit / JetBrains Mono / Lora (already implemented in
> `app/_layout.tsx` and `components/ui.tsx`); SN Pro from this export is not adopted.

> *Spotify + Duolingo + WHOOP for consciousness.* A personal operating system for inner-state optimization, with a real-time 3D body model as its central interface.

ChakraOS is a mobile-first, web-companion product that maps the user's nine chakras (Earth Star → Soul Star) onto a living 3D body, then layers five AI agents — Awareness, Frequency, Ritual, Growth, Memory — on top of journal entries, mood logs, breathwork, sound sessions, and sleep data to produce personalized inner-state guidance.

The design system is named **Clinical Mysticism**: instrumented reverence for inner state. It looks like an MRI for the soul; it feels like a NASA mission console for the self. It deliberately avoids both the tarot/crystals/woo aesthetic *and* a soulless pure-clinical biotech aesthetic — the synthesis is rigorous, measured, and quietly numinous.

## Content Fundamentals

**System voice** (UI, coach, notifications) — second person, gentle imperative, never breathless. No jargon-spirituality ("manifest", "vibration", "5D") and no clinical condescension ("symptoms", "diagnosis"). It *observes*, it doesn't *prescribe*.

**User voice** (journal entries) — set in `Lora` italic, to visually mark "this is you, not the system." The product never imitates this voice back to the user.

### Casing & tone rules
- Sentence case for all UI strings. Never Title Case.
- UPPERCASE micro-labels (0.2em tracking) only for data labels above numbers ("ROOT · 396 HZ").
- "We" is forbidden — the coach speaks as "I"; the system speaks neutrally.
- Numbers are stated, not framed: "+18%" not "an impressive +18%".
- No emoji in product copy (only in the user's own journal text).
- Hedged observations, never diagnoses: "I've noticed…" never "You have…"/"You are…".

## Visual Foundations

- Page background near-black `#020408`, faint radial cyan gradient + 1px cyan grid at 4% opacity.
- Cards are glass: `rgba(10,15,26,0.6)` + `blur(12px) saturate(140%)` + 1px hairline border at 6% white. No opaque cards.
- Two coexisting palettes: `clinical.*` (cyan/violet/leaf/blood/amber) for UI chrome/signal; `chakra.*` (root→soul) for body data. Don't mix at random.
- Outfit for UI (300 display / 400–500 body), JetBrains Mono for all numbers (tabular-nums, non-negotiable), Lora italic for journal/quoted voice only.
- 4pt spacing grid: 4/8/12/16/24/32/48/64.
- Inset hairlines, not outer shadows. Outer glows only for floating UI, colored by chakra/signal — never neutral black, never "soft" drop shadows.
- Radii: 4 (chips) / 8 (buttons) / 12 (small cards) / 16 (primary card) / 20 (large surface) / 28 (drawer/sheet).
- Motion: `--ease-clinical` cubic-bezier(0.4,0,0.2,1) for transitions; springy easing reserved for tweak panels/entrances only. Three tempos: breath (6s), heartbeat (1s), drift (10s).
- Icons: Lucide, single 1.5px stroke, outline by default; active state lights the container (ring+glow), not the glyph fill.

## Files in this reference bundle

Full project (readable via DesignSync, projectId `96ff9616-4ae8-4044-bdd6-6ca0eafef76f`):
`ChakraOS App.html`, `Landing.html`, `colors_and_type.css` (copied here), `app/*.jsx` (atoms, auth,
body-scene, chakra-data, charts, ios-frame, onboarding, particle-field, screens-extra, screens-main),
`assets/logo/*.svg`, `assets/imagery/field-bloom.svg`, `screenshots/*.png`.

Pull additional files with `DesignSync get_file` (projectId above) when building a specific screen —
not all were mirrored to disk to keep this reference lightweight.
