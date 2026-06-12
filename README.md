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

## Permissions

- `activeTab`: read the current page URL after you activate ClearCopy.
- `clipboardWrite`: copy the cleaned link.
- `contextMenus`: add the optional right-click actions.

ClearCopy does not request access to all websites or browsing history.

## Rule design

ClearCopy uses readable, local rule sets:

- Global rules for established tracking parameters such as `utm_*` and `fbclid`.
- Site-specific rules for parameters that are tracking only on particular sites.
- A small conservative classifier for unambiguous names such as `click_id`.
- Redirect rules for known wrappers such as Outlook Safe Links.

Unknown or ambiguous parameters are preserved to avoid breaking links.

## Test locally

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

The Firefox upload ZIP is created in `web-ext-artifacts`.

## Privacy

ClearCopy does not collect, transmit, or store browsing or usage data.

Read the full [privacy policy](PRIVACY.md).
