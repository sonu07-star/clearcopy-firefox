<p align="center">
  <img src="listing-assets/clearcopy-logo-256.png" width="128" height="128" alt="ClearCopy logo">
</p>

<h1 align="center">ClearCopy - Clean Links</h1>

<p align="center">
  Remove tracking parameters and copy clean, shareable links in one click.
</p>

## Features

- Clean and copy the current page from the toolbar popup.
- Right-click a page or link and choose **Copy clean link**.
- Copy clean Markdown links for notes, docs, and GitHub issues.
- Press `Alt+Shift+C` to clean and copy the current page.
- Remove common marketing, affiliate, click-tracking, and social parameters.
- Unwrap known redirect links from Google, Facebook, Instagram, Outlook, and Slack.
- Preserve useful search terms, product selections, filters, timestamps, and pagination.
- See why each tracking field was removed.
- Process every link locally without analytics, accounts, remote code, or data collection.

## Example

```text
Before:
https://example.com/article?id=42&utm_source=newsletter&fbclid=abc

After:
https://example.com/article?id=42
```

## Install

### Firefox Add-ons

ClearCopy has been submitted to Mozilla Add-ons. The public installation link
will be added here after Mozilla publishes the listing.

### Temporary development installation

1. Download or clone this repository.
2. Open `about:debugging` in Firefox.
3. Select **This Firefox**.
4. Select **Load Temporary Add-on**.
5. Choose `manifest.json`.

## How It Works

ClearCopy uses readable local rule sets:

- **Global rules** for established tracking parameters such as `utm_*` and `fbclid`.
- **Site-specific rules** for parameters that are tracking only on particular sites.
- **Conservative automatic rules** for unambiguous names such as `click_id`.
- **Redirect rules** for known wrappers such as Outlook Safe Links.
- **Removal explanations** shown in the popup for transparent review.

Unknown or ambiguous parameters are preserved to avoid breaking links. See
[RULES.md](RULES.md) for details.

## Permissions

| Permission | Purpose |
| --- | --- |
| `activeTab` | Read the current page URL after the user activates ClearCopy. |
| `clipboardWrite` | Copy the cleaned link. |
| `contextMenus` | Add optional right-click actions. |

ClearCopy does not request access to all websites or browsing history.

## Development

Requirements:

- Node.js
- npm
- Firefox

```powershell
npm install
npm run check
npm run build
```

- `npm test` runs cleaner and background workflow regression tests.
- `npm run lint` validates the extension with Mozilla `web-ext`.
- `npm run build` creates the upload ZIP in `web-ext-artifacts`.

## Documentation

- [Cleaning rules](RULES.md)
- [Privacy policy](PRIVACY.md)
- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## Support

Report bugs or suggest tracking rules through
[GitHub Issues](https://github.com/sonu07-star/clearcopy-firefox/issues).

When reporting a broken link, include the original URL and the cleaned URL. Remove
private tokens or personal information before posting.

## License

[MIT](LICENSE)
