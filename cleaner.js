const TRACKING_PARAMETERS = new Set([
  "_hsenc",
  "_hsmi",
  "_ga",
  "_openstat",
  "campaign_id",
  "dclid",
  "epik",
  "fbclid",
  "gclid",
  "gclsrc",
  "gbraid",
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
]);

const TRACKING_PREFIXES = [
  "_ga_",
  "_gac_",
  "utm_",
  "pk_",
  "mtm_",
  "hsa_",
  "vero_"
];

const AUTOMATIC_TRACKING_NAME_PATTERNS = [
  /(^|[_-])(ad|affiliate|click|marketing|partner|promo|referral|tracking|tracker)[_-]?(id|code|token)$/i,
  /(^|[_-])(adid|affid|clickid|trackingid|trackerid)$/i,
  /(^|[_-])[a-z]*clid$/i,
  /^(pd|pf)_rd_/i
];

const AMAZON_TRACKING_PARAMETERS = new Set([
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
]);

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

const HOST_TRACKING_PARAMETERS = [
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
    parameters: new Set(["lipi", "midSig", "midToken", "trk", "trkEmail"])
  },
  {
    domains: new Set(["ebay.com", "ebay.co.uk", "ebay.de", "ebay.ca", "ebay.com.au"]),
    parameters: new Set(["campid", "customid", "mkcid", "mkevt", "mkrid", "toolid"])
  }
];

function hostMatchesDomain(hostname, domain) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function getHostTrackingParameters(hostname) {
  const normalized = hostname.replace(/^www\./, "").toLowerCase();

  for (const domain of AMAZON_DOMAINS) {
    if (hostMatchesDomain(normalized, domain)) {
      return AMAZON_TRACKING_PARAMETERS;
    }
  }

  const parameters = new Set();
  for (const rule of HOST_TRACKING_PARAMETERS) {
    if ([...rule.domains].some((domain) => hostMatchesDomain(normalized, domain))) {
      for (const name of rule.parameters) {
        parameters.add(name.toLowerCase());
      }
    }
  }

  return parameters;
}

function isTrackingParameter(name, hostname) {
  const normalized = name.toLowerCase();
  return (
    TRACKING_PARAMETERS.has(normalized) ||
    TRACKING_PREFIXES.some((prefix) => normalized.startsWith(prefix)) ||
    getHostTrackingParameters(hostname).has(normalized) ||
    AUTOMATIC_TRACKING_NAME_PATTERNS.some((pattern) => pattern.test(normalized))
  );
}

function isCleanableUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function unwrapKnownRedirect(url) {
  const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
  let target;

  if (hostname === "google.com" && url.pathname === "/url") {
    target = url.searchParams.get("q") || url.searchParams.get("url");
  } else if (hostname.endsWith("facebook.com") && url.pathname === "/l.php") {
    target = url.searchParams.get("u");
  } else if (hostname === "l.instagram.com") {
    target = url.searchParams.get("u");
  } else if (hostname.endsWith("safelinks.protection.outlook.com")) {
    target = url.searchParams.get("url");
  } else if (hostname === "slack-redir.net" && url.pathname === "/link") {
    target = url.searchParams.get("url");
  }

  if (target && isCleanableUrl(target)) {
    return new URL(target);
  }

  return url;
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

  const unwrapped = url.href !== originalUrl.href && url.href !== value;
  if (unwrapped) {
    removed.unshift("redirect wrapper");
  }

  return {
    originalUrl: value,
    cleanUrl: url.href,
    changed: url.href !== value,
    removed: [...new Set(removed)]
  };
}
