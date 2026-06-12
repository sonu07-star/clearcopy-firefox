const TRACKING_PARAMETERS = new Set([
  "_hsenc",
  "_hsmi",
  "dclid",
  "fbclid",
  "gclid",
  "gbraid",
  "igshid",
  "li_fat_id",
  "mc_cid",
  "mc_eid",
  "mkt_tok",
  "msclkid",
  "oly_anon_id",
  "oly_enc_id",
  "rb_clickid",
  "s_cid",
  "twclid",
  "vero_conv",
  "vero_id",
  "wbraid",
  "wickedid",
  "yclid"
]);

const TRACKING_PREFIXES = [
  "utm_",
  "pk_",
  "mtm_",
  "hsa_",
  "vero_"
];

function isTrackingParameter(name) {
  const normalized = name.toLowerCase();
  return (
    TRACKING_PARAMETERS.has(normalized) ||
    TRACKING_PREFIXES.some((prefix) => normalized.startsWith(prefix))
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
  const hostname = url.hostname.replace(/^www\./, "");
  let target;

  if (hostname === "google.com" && url.pathname === "/url") {
    target = url.searchParams.get("q") || url.searchParams.get("url");
  } else if (hostname.endsWith("facebook.com") && url.pathname === "/l.php") {
    target = url.searchParams.get("u");
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
    if (isTrackingParameter(name)) {
      url.searchParams.delete(name);
      removed.push(name);
    }
  }

  const unwrapped = url.href !== originalUrl.href && url.origin !== originalUrl.origin;
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
