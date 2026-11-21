# Project guidelines

These rules apply to anyone changing this repository, human or AI agent.

- Preserve the Liquid Glass Technical identity: glass on navigation and overlays; data, forms, and charts on solid surfaces.
- Lucide is the default icon family. Do not add other icon families without a recorded need.
- Use semantic tokens: `brand` defines identity, `primary` defines main actions, and `accent` defines interaction surfaces. Success, warning, and error colors do not change with the palette.
- Preserve light and dark themes, the five palettes, responsive layout, keyboard support, visible focus, and the reduced motion and transparency preferences.
- Keep UI primitives independent of business data, APIs, and AI SDKs. Compose features in the application, with adapters at the boundaries.
- Do not put credentials in the frontend, in localStorage, or in the repository. Do not render untrusted HTML.
- Keep the demo independent of a backend. Gallery business data is temporary; localStorage only stores appearance settings.
- Write UI copy, code, comments, and documentation in English.
- Before finishing a change, run `npm test` and `npm run build`, and check the affected flows in a browser. Do not claim WCAG conformance without an audit.
- Format code with `npm run format`. Keep the lockfile in sync when dependencies change.
- Keep the README and `docs/` consistent with design system changes. Record proposals as proposals, not as approved decisions.
