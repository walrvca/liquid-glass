# Contributing

Thanks for your interest in Liquid Glass. This guide explains how to propose changes.

## Before you start

- For bugs, open an issue with steps to reproduce, what you expected, and what happened.
- For new components or visual changes, open an issue first to discuss the idea. Changes to the identity (glass, tokens, palettes, typography) need agreement before code.
- Read [AGENTS.md](AGENTS.md). Its rules apply to every change, whether you write it yourself or with an AI coding agent.

## Set up

Requires Node.js 22.12 or later (see `.nvmrc`).

```bash
npm ci
npm run dev
```

## Make a change

1. Create a branch from `main`.
2. Keep the change focused on one problem.
3. Add or update tests for behavior changes. For a bug, write a test that fails before your fix.
4. Check visual changes in a browser, in the light and dark themes, and at a narrow width (around 390px).
5. Run the same checks as CI:

   ```bash
   npm run format
   npm test
   npm run build
   ```

6. Update the README or `docs/` if your change affects them.

## Pull requests

- Describe what changed, why, and how you checked it.
- Include screenshots for visual changes.
- Keep the lockfile in sync if you change dependencies, and explain why a new dependency is needed.
- Use clear commit messages in English, in the imperative mood (for example, "Fix focus after bulk delete").

## Accessibility

Keyboard support, visible focus, accessible names, and the reduced motion and transparency preferences are requirements, not extras. Do not claim WCAG conformance in code or docs without an audit.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
