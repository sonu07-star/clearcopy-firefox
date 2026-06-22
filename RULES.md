# Cleaning Rules

ClearCopy removes tracking data conservatively. Its priority is preserving the
destination and behavior of a link.

## Rule Types

### Global exact names

Established tracking parameters that can be removed across sites, including:

```text
fbclid, gclid, msclkid, srsltid, ttclid, twclid, mc_cid, mc_eid
```

### Global prefixes

Established families of tracking parameters:

```text
utm_*, _ga_*, _gac_*, hsa_*, mtm_*, pk_*, vero_*
```

Additional high-confidence campaign systems such as Matomo, Sitecore, and
Webtrends are covered by exact names or prefixes.

### Conservative automatic names

Names that clearly identify tracking metadata, such as:

```text
affiliate_id, click_id, partner-token, referral_id, tracking-token
```

Ambiguous names such as `id`, `code`, `state`, `token`, `ref`, and `session_id`
are preserved globally.

### Site-specific rules

Some short or ambiguous parameters are removed only on sites where their tracking
purpose is known. Current site-specific rules cover:

- Amazon storefronts
- YouTube
- Spotify
- LinkedIn
- eBay

### Redirect wrappers

ClearCopy can unwrap known redirect URLs from:

- Google
- Facebook
- Instagram
- Outlook Safe Links
- Slack

Only valid `http` and `https` destinations are accepted.

## Adding a Rule

1. Add the smallest rule that solves the problem.
2. Prefer a site-specific rule when a parameter name can have another meaning.
3. Add a positive test proving the tracker is removed.
4. Add a negative test proving similar useful parameters remain.
5. Run `npm run check`.

Report missing or incorrect rules through
[GitHub Issues](https://github.com/sonu07-star/clearcopy-firefox/issues).
