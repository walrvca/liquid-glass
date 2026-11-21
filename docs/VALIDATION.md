# Validation

This page lists checks that were actually completed. It does not guarantee the absence of defects.

## Automated checks

- TypeScript and the Vite production build (`npm run build`).
- Formatting (`npm run format:check`).
- Behavior tests (`npm test`, Vitest and Testing Library in jsdom): hash navigation and history, tab-to-panel links, toasts, theme preferences, sorting with `aria-sort`, selection and bulk delete, chart values, validation in both forms, keyboard search, the mobile menu, focus after deletes and navigation, system accessibility preferences, and overview metrics.
- Regression tests that failed before their fix: tab panels losing their `aria-controls` target, selections lost when two clicks land in the same tick, focus lost after a bulk delete, the scroll spy losing the chosen section when Enter navigates, and a card component added without updating the count.
- `npm audit --omit=dev`: no vulnerabilities reported at the time of the run. No alerts does not mean no vulnerabilities.

## Static checks

- Identity color pairs across ten theme and palette combinations: primary buttons ≥ 5.02:1, selection surfaces ≥ 6.84:1.
- Control boundaries (`--border-strong`), computed from the tokens: ≥ 3.26:1 in the light theme and ≥ 3.39:1 in the dark theme, against the background, surfaces, and the five selection colors.

## Browser checks

- Type scale: computed font sizes of every text, in all three tabs, at 390, 900, and 1400px, compared with the previous version. Only labels below 11px changed, as intended.
- No horizontal page scroll at 390, 760, 1000, 1250, and 1440px. The table keeps its own horizontal scroll.
- Appearance before first paint: the inline script in `index.html`, tested without React, applies the stored theme and palette and ignores invalid palettes and corrupt storage. The `theme-color` follows theme and palette.
- Navigation: direct links (`#forms`), sidebar clicks, the Back button, tab changes without new history entries, Ctrl/Cmd-click left to the browser, and the active section following the scroll.
- Component search: arrow keys, Home, End, and Enter; the page scrolls to the section after the dialog closes, and focus moves to it.
- Hit areas: `elementFromPoint` confirms at least 24×24px on checkbox, radio, switch, slider thumb, and the sort button.
- Mobile menu at 390px: focus moves into the menu, the page becomes `inert`, the close button does not overlap the brand, and focus returns to the menu button.
- Fonts load through `<link>` with `preconnect`, as variable fonts (Inter 400–700, Space Grotesk 400–700, JetBrains Mono 400–500), confirmed in `document.fonts`.
- After the English translation: string literals in the source and the visible text of all three tabs scanned for leftover Portuguese, and overflow checked at 390, 760, 980, and 1440px.
- Reload with a hash lands on the named section. Browser scroll restoration is set to manual on purpose, so reloading or going Back returns to the top of the section in the hash, not to the exact offset inside it.

## Not verified

- Screen readers (NVDA, VoiceOver, Orca). The WCAG 2.2 AA target still needs a full audit, including screen readers and every interactive state.
- Dark theme and reduced motion coming from the operating system. Browser automation cannot emulate these preferences, so they are covered only by automated tests.

There is no backend, PWA installation, or offline support in this version.
