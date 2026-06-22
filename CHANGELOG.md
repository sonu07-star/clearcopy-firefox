# Changelog

All notable changes to ClearCopy are documented here.

## 1.1.0 - 2026-06-22

1. Added removal explanations for each cleaned field.
2. Added Markdown link copying from the popup and context menus.
3. Added a before/after size summary in the popup.
4. Expanded high-confidence Matomo, Sitecore, CleverReach, and Webtrends
   tracking rules.
5. Added regression coverage for removal metadata and Markdown workflows.
6. Kept permissions unchanged from 1.0.2.

## 1.0.2 - 2026-06-12

1. Refactored URL cleaning into documented global, site-specific, automatic, and
   redirect rule sets.
2. Added conservative automatic detection for unambiguous tracking identifiers.
3. Added support for Amazon storefronts, YouTube, Spotify, LinkedIn, and eBay
   share-link tracking.
4. Added redirect unwrapping for Google, Facebook, Instagram, Outlook Safe Links,
   and Slack.
5. Simplified the popup to use a Firefox-native utility design.
6. Added adversarial regression tests for spoofed domains, authentication
   callbacks, application state, and false positives.
7. Reduced permissions to `activeTab`, `clipboardWrite`, and `contextMenus`.

## 1.0.1 - 2026-06-12

1. Added automatic tracking-parameter detection and expanded Amazon cleaning.
2. Fixed context menu creation after Firefox restarts.
3. Added automated cleaner and background workflow tests.
4. Added a permanent extension ID, privacy policy, and public source repository.

## 1.0.0 - 2026-06-12

1. Initial ClearCopy release.
2. Added popup, context-menu, and keyboard-shortcut cleaning workflows.
