// ── Palette ──────────────────────────────────────────────────────────────────
// Cream is the dominant surface. Greens are accents + isolation elements only.
export const Colors = {
  // Surfaces (dominant — ~80% of UI)
  pageBg:   "#FBF6F0",   // light cream — page background
  cardBg:   "#FFFFFF",   // pure white — bubbles, panels
  inputBg:  "#FBF6F0",   // cream — textarea well

  // Ink & text (greens used as text/icon color, not fill)
  ink:      "#0D3A35",   // deep bluish-green — primary text, headings, strong accents
  inkMid:   "#276152",   // moderate green — secondary accents, icons, covered states
  inkMuted: "#B1B7AB",   // laurel sage — placeholder, muted text, inactive

  // Borders
  border:   "rgba(177,183,171,0.35)",
  borderStrong: "rgba(39,97,82,0.25)",

  // Accent fills (used sparingly — chips, CTAs, user bubble)
  accentFill:      "#0D3A35",   // user bubble bg, CTA buttons
  accentFillMid:   "#276152",   // active interest chip
  accentFillLight: "rgba(39,97,82,0.08)",  // covered objective row tint
  chipInactive:    "rgba(177,183,171,0.18)",
} as const;