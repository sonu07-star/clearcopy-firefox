// Rules are intentionally conservative. A parameter is removed only when it is
// known tracking metadata or its name is an unambiguous tracking identifier.
const GLOBAL_PARAMETER_RULES = {
  exact: new Set([
    "_ga",
    "_hsenc",
    "_hsmi",
    "_openstat",
    "campaign_id",
    "ck_subscriber_id",
    "dclid",
    "epik",
    "fbclid",
    "gbraid",
    "gclid",
    "gclsrc",
    "igshid",
    "irclickid",
    "irgwc",
    "li_fat_id",
    "matomo_campaign",
    "matomo_cid",
    "matomo_content",
    "matomo_group",
    "matomo_keyword",
    "matomo_medium",
    "matomo_placement",
    "matomo_source",
    "mc_cid",
    "mc_eid",
    "mkt_tok",
    "msclkid",
    "oly_anon_id",
    "oly_enc_id",
    "rb_clickid",
    "s_cid",
    "sc_campaign",
    "sc_channel",
    "sc_content",
    "sc_country",
    "sc_geo",
    "sc_medium",
    "sc_outcome",
    "sc_publisher",
    "sc_src",
    "srsltid",
    "ttclid",
    "twclid",
    "vero_conv",
    "vero_id",
    "wbraid",
    "wickedid",
    "yclid"
  ]),
  prefixes: ["_ga_", "_gac_", "utm_", "pk_", "mtm_", "hsa_", "vero_", "wt_"],
  patterns: [
    /(^|[_-])(ad|affiliate|click|marketing|partner|promo|referral|tracking|tracker)[_-]?(id|code|token)$/i,
    /(^|[_-])(adid|affid|clickid|trackingid|trackerid)$/i,
    /(^|[_-])[a-z]*clid$/i
  ]
};

const REMOVAL_REASONS = {
  automatic: "automatic tracker name",
  globalExact: "known tracking parameter",
  globalPattern: "tracking name pattern",
  globalPrefix: "tracking prefix",
  redirect: "redirect wrapper",
  siteExact: "site-specific tracking parameter",
  sitePattern: "site-specific tracking pattern"
};

const AMAZON_DOMAINS = new Set([
  "amazon.ae",
  "amazon.ca",
  "amazon.cn",
  "amazon.co.jp",
  "amazon.co.uk",
  "amazon.com",
  "amazon.com.au",
  "amazon.com.be",
  "amazon.com.br",
  "amazon.com.mx",
  "amazon.com.tr",
  "amazon.de",
  "amazon.eg",
  "amazon.es",
  "amazon.fr",
  "amazon.in",
  "amazon.it",
  "amazon.nl",
  "amazon.pl",
  "amazon.sa",
  "amazon.se",
  "amazon.sg"
]);

const SITE_PARAMETER_RULES = [
  {
    domains: AMAZON_DOMAINS,
    parameters: new Set([
      "content-id",
      "ds",
      "mfadid",
      "pd_rd_r",
      "pd_rd_w",
      "pd_rd_wg",
      "pf_rd_p",
      "pf_rd_r",
      "qid",
      "ref",
      "ref_",
      "tag",
      "xpid"
    ]),
    patterns: [/^(pd|pf)_rd_/i]
  },
  {
    domains: new Set(["youtube.com", "youtu.be"]),
    parameters: new Set(["feature", "si"])
  },
  {
    domains: new Set(["open.spotify.com"]),
    parameters: new Set(["si"])
  },
  {
    domains: new Set(["linkedin.com"]),
    parameters: new Set(["lipi", "midsig", "midtoken", "trk", "trkemail"])
  },
  {
    domains: new Set(["ebay.com", "ebay.co.uk", "ebay.de", "ebay.ca", "ebay.com.au"]),
    parameters: new Set(["campid", "customid", "mkcid", "mkevt", "mkrid", "toolid"])
  }
];

const REDIRECT_RULES = [
  { domains: new Set(["google.com"]), path: "/url", parameters: ["q", "url"] },
  { domains: new Set(["facebook.com"]), path: "/l.php", parameters: ["u"] },
  { domains: new Set(["l.instagram.com"]), parameters: ["u"] },
  {
    domainSuffix: "safelinks.protection.outlook.com",
    parameters: ["url"]
  },
  { domains: new Set(["slack-redir.net"]), path: "/link", parameters: ["url"] }
];

function normalizeHostname(hostname) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

function hostMatchesDomain(hostname, domain) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function hostMatchesDomains(hostname, domains) {
  return [...domains].some((domain) => hostMatchesDomain(hostname, domain));
}

function getParameterMatch(name, rules, source) {
  if (rules.exact?.has(name)) {
    return { source, reason: REMOVAL_REASONS.globalExact };
  }

  if (rules.parameters?.has(name)) {
    return { source, reason: REMOVAL_REASONS.siteExact };
  }

  if (rules.prefixes?.some((prefix) => name.startsWith(prefix))) {
    return { source, reason: REMOVAL_REASONS.globalPrefix };
  }

  if (rules.patterns?.some((pattern) => pattern.test(name))) {
    return {
      source,
      reason: source === "automatic" ? REMOVAL_REASONS.automatic : REMOVAL_REASONS.sitePattern
    };
  }

  return null;
}

function getSiteRules(hostname) {
  return SITE_PARAMETER_RULES.filter((rule) => hostMatchesDomains(hostname, rule.domains));
}

function getTrackingParameterMatch(name, hostname) {
  const normalizedName = name.toLowerCase();
  const normalizedHost = normalizeHostname(hostname);
  const globalMatch = getParameterMatch(normalizedName, GLOBAL_PARAMETER_RULES, "global");

  if (globalMatch) {
    return globalMatch;
  }

  for (const rule of getSiteRules(normalizedHost)) {
    const siteMatch = getParameterMatch(normalizedName, rule, normalizedHost);
    if (siteMatch) {
      return siteMatch;
    }
  }

  return null;
}

function isTrackingParameter(name, hostname) {
  return Boolean(getTrackingParameterMatch(name, hostname));
}

function isCleanableUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function matchesRedirectRule(url, rule) {
  const hostname = normalizeHostname(url.hostname);
  const domainMatch =
    (rule.domains && hostMatchesDomains(hostname, rule.domains)) ||
    (rule.domainSuffix && hostMatchesDomain(hostname, rule.domainSuffix));

  return domainMatch && (!rule.path || url.pathname === rule.path);
}

function unwrapKnownRedirect(url) {
  const rule = REDIRECT_RULES.find((candidate) => matchesRedirectRule(url, candidate));
  if (!rule) {
    return { url, unwrapped: false };
  }

  const target = rule.parameters
    .map((parameter) => url.searchParams.get(parameter))
    .find((value) => value && isCleanableUrl(value));

  return target
    ? { url: new URL(target), unwrapped: true }
    : { url, unwrapped: false };
}

function cleanLink(value) {
  const originalUrl = new URL(value);
  const redirectResult = unwrapKnownRedirect(originalUrl);
  const url = redirectResult.url;
  const removedItems = [];

  for (const name of [...url.searchParams.keys()]) {
    const match = getTrackingParameterMatch(name, url.hostname);
    if (match) {
      url.searchParams.delete(name);
      removedItems.push({
        name,
        reason: match.reason,
        source: match.source,
        type: "parameter"
      });
    }
  }

  if (redirectResult.unwrapped && url.href !== value) {
    removedItems.unshift({
      name: "redirect wrapper",
      reason: REMOVAL_REASONS.redirect,
      source: normalizeHostname(originalUrl.hostname),
      type: "redirect"
    });
  }

  const uniqueRemovedItems = removedItems.filter(
    (item, index, items) => items.findIndex((candidate) => candidate.name === item.name) === index
  );

  return {
    originalUrl: value,
    cleanUrl: url.href,
    changed: url.href !== value,
    removed: uniqueRemovedItems.map((item) => item.name),
    removedItems: uniqueRemovedItems,
    removedCount: uniqueRemovedItems.length
  };
}
