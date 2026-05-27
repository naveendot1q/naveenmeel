---
name: Theme system
description: How dark/light theme is implemented across the portfolio/blog
---

ThemeProvider in `artifacts/naveen-blog/src/lib/theme.tsx`:
- Reads/writes `localStorage.getItem('theme')`, defaults to `'dark'`
- Sets `document.documentElement.setAttribute('data-theme', theme)` on each change
- Exports `useTheme()` hook returning `{ theme, toggle }`

CSS in `src/index.css`:
- `:root, [data-theme="dark"]` defines dark vars
- `[data-theme="light"]` overrides with light vars
- Key vars: `--bg, --bg2, --bg3, --surface, --border, --fg, --fg2, --muted, --accent, --accent-dim, --accent-border, --blue, --green, --red, --nav-bg`

**Why:** Attribute-based (not class-based) so CSS selectors are simple and readable in DevTools.

**How to apply:** All components use `var(--xxx)` inline styles. Use `useTheme()` only for theme-conditional rendering (e.g. different gradients, icon).
