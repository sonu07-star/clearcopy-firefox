# Contributing

Contributions that improve link cleaning without breaking useful URLs are welcome.

## Report a Broken Link

Open a GitHub issue and include:

- The original URL.
- The cleaned URL.
- What changed or stopped working.
- The expected cleaned URL.
- The Firefox version used.

Remove private tokens, account identifiers, and personal information first.

## Propose a Cleaning Rule

Rules must be conservative:

1. Use a global rule only when the parameter is unambiguously tracking metadata.
2. Use a site-specific rule for ambiguous parameter names.
3. Include positive and negative regression tests.
4. Avoid rules based only on parameter value length or randomness.

## Development

```powershell
npm install
npm run check
npm run build
```

Before submitting a pull request, confirm:

- All tests pass.
- `web-ext lint` reports zero errors and warnings.
- Existing useful parameters remain unchanged.
- No new permission or remote dependency is introduced without a clear reason.
