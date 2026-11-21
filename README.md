# Liquid Glass Design System

[![CI](https://github.com/walrvca/liquid-glass/actions/workflows/ci.yml/badge.svg)](https://github.com/walrvca/liquid-glass/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A design system for dashboards, PWAs, and full applications, built with React, Tailwind CSS 4, and Radix UI. Its identity is **Liquid Glass Technical**: glass on peripheral layers, solid surfaces for data.

> This is an independent project. It is not affiliated with, endorsed by, or related to Apple Inc. or any Apple design language.

## Demo

[Open the interactive gallery](https://walrvca.github.io/liquid-glass/)

The gallery includes buttons, inputs, form validation, select, checkbox, switches, radio group, slider, badges, alerts, toast, tooltip, tabs, a table with search, sorting, selection, and bulk actions, dropdown, popover, dialogs, a sample chart, progress, empty states, skeleton, and a keyboard-driven component search.

It also shows tokens, typography, spacing, icons, and guidelines. Each section has a direct link (for example, `#forms`), and the side navigation follows your scroll position. There are five palettes (Indigo, Cyan, Emerald, Amber, and Magenta), Clean and Graphite themes, and settings to reduce motion and transparency. The theme follows your operating system until you pick one, and the appearance is applied before the first paint.

## Getting started

Requires Node.js 24.15 or later (or 22.22.2 or later on Node 22) and npm.

```bash
git clone https://github.com/walrvca/liquid-glass.git
cd liquid-glass
npm ci
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server |
| `npm test` | Runs the behavior tests (Vitest and Testing Library in jsdom) |
| `npm run build` | Type-checks and builds the static site into `dist/` |
| `npm run format` | Formats the code with Prettier |
| `npm run format:check` | Checks formatting, as CI does |

The tests cover behavior (navigation, table, forms, search, mobile menu, preferences, and toasts), not layout or CSS. Check visual changes in a browser.

## Tech stack

- React and TypeScript, with Vite.
- Tailwind CSS 4 and semantic CSS tokens compatible with shadcn/ui.
- Local components that follow shadcn/ui composition: Radix UI, class-variance-authority, clsx, and tailwind-merge.
- Lucide for icons.

The components in this version are a local demo base, not yet a published package or shadcn registry. The chart is a CSS example with a text description for accessibility.

## Structure

| File | Responsibility |
| --- | --- |
| `src/tokens.css` | Portable tokens, type scale, and five palettes in both themes |
| `src/styles.css` | Material, layout, states, and responsive behavior |
| `src/ui.tsx` | Reusable primitives and Radix composition |
| `src/preferences.ts` | Local appearance preferences |
| `src/data.ts` | Demo data, navigation, and the showcase registry |
| `src/App.tsx` | Gallery composition and demo behavior |
| `src/CommandPalette.tsx` | Component search with keyboard navigation |
| `src/*.test.tsx` | Behavior tests |
| `docs/VALIDATION.md` | Checks that were run and what is not verified |

Presentation components must not import backend SDKs or AI providers. Integrations belong to the consuming applications, with authorization and secrets kept on the server.

## Data and security

Projects, forms, and deletions are examples kept in memory. Reloading the page restores the data. Only appearance settings are saved in localStorage, with no credentials or business data. The CSV export contains the demo data from the current session.

There is no authentication, API, code execution, or call to AI providers. The delete confirmation shows a visual pattern; real applications must enforce authorization on the server. React escapes rendered text, and this demo does not use `dangerouslySetInnerHTML`.

Fonts load from Google Fonts. For applications with privacy or offline requirements, host the font files with the application.

To report a vulnerability, see [SECURITY.md](SECURITY.md).

## Accessibility and limits

Project target: WCAG 2.2 AA. The implementation includes accessible names, visible focus, dialog primitives with focus management, keyboard support, 24px minimum hit areas, and reduced motion and transparency. This is not a conformance certification, and it has not been audited with screen readers yet.

Identity color pairs were checked across five palettes and two themes: a minimum contrast of 5.02:1 on primary buttons and 6.84:1 on selection surfaces. Control boundaries use `--border-strong`, with a minimum contrast of 3.26:1 in the light theme and 3.39:1 in the dark theme. See [docs/VALIDATION.md](docs/VALIDATION.md) for details.

This release is a responsive web demo. PWA manifest, service worker, installation, offline mode, and sync are not implemented yet.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request, and follow the [Code of Conduct](CODE_OF_CONDUCT.md). The rules in [AGENTS.md](AGENTS.md) apply to everyone, including AI coding agents.

## License

[MIT](LICENSE) © walrvca
