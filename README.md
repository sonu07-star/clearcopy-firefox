# ClearCopy - Clean Links

ClearCopy removes common marketing and social tracking parameters from links
before you share them. All processing happens locally in Firefox.

## Why people would install it

- One click turns long tracked URLs into clean, shareable links.
- Right-click any link and choose **Copy clean link**.
- Press `Alt+Shift+C` to clean and copy the current page URL.
- No account, ads, analytics, remote code, or data collection.
- Minimal permissions and no access to browsing history.

## Test in Firefox

1. Open `about:debugging`.
2. Select **This Firefox**.
3. Select **Load Temporary Add-on**.
4. Choose `manifest.json`.
5. Open a URL containing a tracker, such as
   `https://example.com/article?utm_source=newsletter&fbclid=test`.

## Before publishing

1. Replace `clearcopy@example.com` in `manifest.json` with a permanent extension ID.
2. Add polished PNG icons at 48, 96, and 128 pixels if AMO requests raster assets.
3. Test the popup, context menus, shortcut, dark mode, and restricted Firefox pages.
4. Package the extension and submit it through
   [addons.mozilla.org](https://addons.mozilla.org/developers/).

## Privacy

ClearCopy does not collect or transmit data. Local usage totals are stored only
on the user's device and can be removed by uninstalling the extension or
clearing its local extension storage.
