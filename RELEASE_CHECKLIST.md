# Release Checklist

## Automated

Run from the project folder:

```powershell
npm install
npm run check
npm run build
```

Confirm:

- Cleaner tests pass.
- Mozilla `web-ext lint` reports zero errors and zero warnings.
- The ZIP in `web-ext-artifacts` contains only runtime and user-facing files.

## Manual Firefox Test

1. Open `about:debugging`.
2. Select **This Firefox**.
3. Load `manifest.json` as a temporary add-on.
4. Test the popup on tracked, clean, and restricted Firefox pages.
5. Test **Copy clean link** from the popup.
6. Test **Replace address with clean link**.
7. Test both page and link context-menu actions.
8. Test `Alt+Shift+C`.
9. Test light and dark Firefox themes.
10. Confirm copied links still reach the intended page with filters and product
    selections intact.

## AMO Submission

1. Upload the latest ZIP from `web-ext-artifacts`.
2. Select Firefox desktop compatibility.
3. State that no data is collected or transmitted.
4. Use `STORE_LISTING.md` for listing copy.
5. Link the source repository and privacy policy.
6. Upload clear screenshots showing the popup and context-menu workflow.
