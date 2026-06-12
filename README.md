# ClearCopy - Clean Links

ClearCopy removes common marketing and social tracking parameters from links
before you share them. It combines maintained rules for popular sites with
conservative automatic detection for recognizable tracking identifiers. All
processing happens locally in Firefox.

## Why people would install it

- One click turns long tracked URLs into clean, shareable links.
- Right-click any link and choose **Copy clean link**.
- Press `Alt+Shift+C` to clean and copy the current page URL.
- No account, ads, analytics, remote code, or data collection.
- Minimal permissions and no access to browsing history.
- Preserves search terms, product selections, timestamps, filters, and other
  useful link behavior.

## Test in Firefox

1. Open `about:debugging`.
2. Select **This Firefox**.
3. Select **Load Temporary Add-on**.
4. Choose `manifest.json`.
5. Open a URL containing a tracker, such as
   `https://example.com/article?utm_source=newsletter&fbclid=test`.

## Development checks

```powershell
npm install
npm run check
npm run build
```

The upload-ready ZIP is created in `web-ext-artifacts`.

## Privacy

ClearCopy does not collect or transmit data. Local usage totals are stored only
on the user's device and can be removed by uninstalling the extension or
clearing its local extension storage.

Read the full [privacy policy](PRIVACY.md).
