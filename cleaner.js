// Rules are intentionally conservative. A parameter is removed only when it is
// known tracking metadata or its name is an unambiguous tracking identifier.
const GLOBAL_PARAMETER_RULES = {
  exact: new Set([
    "_ga",
    "_hsenc",
    "_hsmi",
    "_openstat",
    "campaign_id",
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
    "mc_cid",
    "mc_eid",
    "mkt_tok",
    "msclkid",
    "oly_anon_id",
    "oly_enc_id",
    "rb_clickid",
    "s_cid",
    "srsltid",
    "ttclid",
    "twclid",
    "vero_conv",
    "vero_id",
    "wbraid",
    "wickedid",
    "yclid"
  ]),
  prefixes: ["_ga_", "_gac_", "utm_", "pk_", "mtm_", "hsa_", "vero_"],
  patterns: [
    /(^|[_-])(ad|affiliate|click|marketing|partner|promo|referral|tracking|tracker)[_-]?(id|code|token)$/i,
    /(^|[_-])(adid|affid|clickid|trackingid|trackerid)$/i,
    /(^|[_-])[a-z]*clid$/i
  ]
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

function matchesParameterRules(name, rules) {
  return (
    rules.exact?.has(name) ||
    rules.parameters?.has(name) ||
    rules.prefixes?.some((prefix) => name.startsWith(prefix)) ||
    rules.patterns?.some((pattern) => pattern.test(name))
  );
}

function getSiteRules(hostname) {
  return SITE_PARAMETER_RULES.filter((rule) => hostMatchesDomains(hostname, rule.domains));
}

function isTrackingParameter(name, hostname) {
  const normalizedName = name.toLowerCase();
  const normalizedHost = normalizeHostname(hostname);

  return (
    matchesParameterRules(normalizedName, GLOBAL_PARAMETER_RULES) ||
    getSiteRules(normalizedHost).some((rule) => matchesParameterRules(normalizedName, rule))
  );
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
    return url;
  }

  const target = rule.parameters
    .map((parameter) => url.searchParams.get(parameter))
    .find((value) => value && isCleanableUrl(value));

  return target ? new URL(target) : url;
}

function cleanLink(value) {
  const originalUrl = new URL(value);
  const url = unwrapKnownRedirect(originalUrl);
  const removed = [];

  for (const name of [...url.searchParams.keys()]) {
    if (isTrackingParameter(name, url.hostname)) {
      url.searchParams.delete(name);
      removed.push(name);
    }
  }

  if (url.href !== originalUrl.href && url.href !== value) {
    removed.unshift("redirect wrapper");
  }

  return {
    originalUrl: value,
    cleanUrl: url.href,
    changed: url.href !== value,
    removed: [...new Set(removed)]
  };
}
