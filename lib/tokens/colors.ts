/**
 * ChakraOS color tokens — "Clinical Mysticism".
 *
 * Canonical values come from the Claude Design import (design/reference/colors_and_type.css,
 * project 96ff9616-4ae8-4044-bdd6-6ca0eafef76f). The app's pre-existing ad-hoc hex values were
 * already close to this palette (e.g. #0a0e18 ≈ --co-deep #0A0F1A); this module is the single
 * place those values live now. `surface.inset` and `border.muted` have no exact equivalent in
 * the web design export (which uses translucent glass over black, not solid RN panels) — they
 * consolidate several near-duplicate one-off hex values found in the app into one token each.
 */

export const colors = {
  surface: {
    /** True page background. Was #020408 already in some places. */
    void: '#020408',
    /** Raised panels/cards. Was #0a0e18, #0e1420, #0f1420, #0d1424. */
    deep: '#0A0F1A',
    /** Deep inset wells, gradient ends. Was #05060a, #080b13. */
    sunken: '#050811',
    /** Inactive segmented-control / unselected pill fill. Was #141a28. */
    inset: '#141A28',
  },
  border: {
    /** 1px hairline on glass panels. */
    hairline: 'rgba(255,255,255,0.06)',
    hairlineStrong: 'rgba(255,255,255,0.12)',
    /** Inactive dot/border/divider. Was #1e2535, #2a3346, #2a3144, #3a4255. */
    muted: '#2A3346',
  },
  text: {
    /** Primary readable. Was #e9ecf5. */
    primary: '#F8FAFC',
    /** Secondary text. Was #c9cfe0, #c8d0e0. */
    secondary: '#CBD5E1',
    /** Tertiary / captions. Was #8a90a6. */
    tertiary: '#94A3B8',
    /** Dim / metadata. Was #565c72. */
    dim: '#64748B',
    /** Dimmest — placeholders, ghost text. Was #3a4255. */
    ghost: '#475569',
  },
  accent: {
    /** Cyan — primary signal. Body tab. Was #36d6e7. */
    cyan: '#22D3EE',
    /** Violet — neural/secondary. Sound tab. Was #6b6bff, #8a90ff, #a56bff. */
    violet: '#8B5CF6',
    /** Emerald — vitality. Coach tab, positive deltas. Was #3ddc97, #36f5a6. */
    leaf: '#4ADE80',
    /** Rose — alerts, negative deltas. Was #ff4d5e, #ff6b6b, #ff5c6e. */
    blood: '#F43F5E',
    /** Amber — cofactor. Journal tab. Was #e8b23d. */
    amber: '#FBBF24',
    /** Aura "excited" pink. You tab. Was #ff5ca8. */
    rose: '#F472B6',
  },
} as const;

export type Colors = typeof colors;
