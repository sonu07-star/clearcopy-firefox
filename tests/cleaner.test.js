const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { URL };
vm.createContext(context);
vm.runInContext(
  `${fs.readFileSync(path.join(__dirname, "..", "cleaner.js"), "utf8")}
  this.cleanLink = cleanLink;
  this.isTrackingParameter = isTrackingParameter;
  this.isCleanableUrl = isCleanableUrl;`,
  context
);

const cases = [
  {
    name: "removes generic campaign trackers and preserves useful parameters",
    input: "https://example.com/article?id=42&utm_source=newsletter&fbclid=test",
    expected: "https://example.com/article?id=42"
  },
  {
    name: "removes case-insensitive tracking parameters",
    input: "https://example.com/?UTM_Source=email&GCLID=123&item=yes",
    expected: "https://example.com/?item=yes"
  },
  {
    name: "automatically removes high-confidence tracker identifiers",
    input:
      "https://example.com/product?id=42&affiliate_id=partner&custom_clickid=abc&tracking-token=secret",
    expected: "https://example.com/product?id=42"
  },
  {
    name: "does not remove ambiguous application identifiers",
    input:
      "https://example.com/app?session_id=abc&customer_id=42&campaign_name=spring&ref_=section",
    expected:
      "https://example.com/app?session_id=abc&customer_id=42&campaign_name=spring&ref_=section"
  },
  {
    name: "preserves descriptive marketing fields that are not identifiers",
    input:
      "https://example.com/report?campaign_name=spring&affiliate_status=active&tracking_enabled=true",
    expected:
      "https://example.com/report?campaign_name=spring&affiliate_status=active&tracking_enabled=true"
  },
  {
    name: "preserves site-specific-looking parameters outside their site",
    input: "https://example.com/item?pd_rd_r=required&pf_rd_p=layout&si=session",
    expected: "https://example.com/item?pd_rd_r=required&pf_rd_p=layout&si=session"
  },
  {
    name: "preserves fragments and non-tracking parameters",
    input: "https://example.com/search?q=shoes&page=2#reviews",
    expected: "https://example.com/search?q=shoes&page=2#reviews"
  },
  {
    name: "unwraps Google redirects and cleans the destination",
    input:
      "https://www.google.com/url?q=https%3A%2F%2Fexample.com%2Fpost%3Futm_medium%3Dsocial%26id%3D7",
    expected: "https://example.com/post?id=7"
  },
  {
    name: "unwraps Facebook redirects and cleans the destination",
    input:
      "https://l.facebook.com/l.php?u=https%3A%2F%2Fexample.com%2Fpost%3Ffbclid%3Dabc%26id%3D7",
    expected: "https://example.com/post?id=7"
  },
  {
    name: "unwraps Outlook Safe Links",
    input:
      "https://nam01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fexample.com%2Fpost%3Futm_source%3Demail%26id%3D7&data=tracking",
    expected: "https://example.com/post?id=7"
  },
  {
    name: "unwraps Slack redirects",
    input:
      "https://slack-redir.net/link?url=https%3A%2F%2Fexample.com%2Fpost%3Fclick_id%3Dabc%26id%3D7",
    expected: "https://example.com/post?id=7"
  },
  {
    name: "does not unwrap lookalike redirect domains",
    input:
      "https://google.com.example.org/url?q=https%3A%2F%2Fexample.com%2Fprivate",
    expected:
      "https://google.com.example.org/url?q=https%3A%2F%2Fexample.com%2Fprivate"
  },
  {
    name: "does not unwrap invalid or non-web redirect targets",
    input: "https://www.google.com/url?q=javascript%3Aalert%281%29&source=web",
    expected: "https://www.google.com/url?q=javascript%3Aalert%281%29&source=web"
  },
  {
    name: "cleans an Amazon landing page",
    input: "https://www.amazon.com/?tag=admarketus-20&ref=pd_test&mfadid=adm",
    expected: "https://www.amazon.com/"
  },
  {
    name: "preserves meaningful Amazon search filters",
    input:
      "https://www.amazon.com/s?i=luxury&srs=219369026011&bbn=219369026011&rh=n%3A18981045011&s=featured-rank&fs=true&pd_rd_r=abc&pf_rd_p=def&qid=123",
    expected:
      "https://www.amazon.com/s?i=luxury&srs=219369026011&bbn=219369026011&rh=n%3A18981045011&s=featured-rank&fs=true"
  },
  {
    name: "cleans Amazon store links while preserving encoding",
    input:
      "https://www.amazon.com/stores/page/81DFC04D-8C43-469D-9CE8-1C75C39654CC/?_encoding=UTF8&pd_rd_w=abc&content-id=def&ref_=pd_hp",
    expected:
      "https://www.amazon.com/stores/page/81DFC04D-8C43-469D-9CE8-1C75C39654CC/?_encoding=UTF8"
  },
  {
    name: "supports non-US Amazon storefronts",
    input: "https://www.amazon.co.uk/dp/B000000000?tag=test-21&th=1",
    expected: "https://www.amazon.co.uk/dp/B000000000?th=1"
  },
  {
    name: "does not remove Amazon-only names from unrelated sites",
    input: "https://example.com/product?tag=important&ref=section",
    expected: "https://example.com/product?tag=important&ref=section"
  },
  {
    name: "does not apply Amazon rules to lookalike domains",
    input: "https://amazon.com.example.org/product?tag=required&ref=section",
    expected: "https://amazon.com.example.org/product?tag=required&ref=section"
  },
  {
    name: "cleans YouTube share links while preserving video and timestamp",
    input: "https://www.youtube.com/watch?v=abc123&t=90s&si=share-token&feature=shared",
    expected: "https://www.youtube.com/watch?v=abc123&t=90s"
  },
  {
    name: "cleans Spotify share links",
    input: "https://open.spotify.com/track/abc123?si=share-token",
    expected: "https://open.spotify.com/track/abc123"
  },
  {
    name: "cleans LinkedIn tracking without removing profile paths",
    input: "https://www.linkedin.com/in/example/?trk=public_profile&trackingId=abc",
    expected: "https://www.linkedin.com/in/example/"
  },
  {
    name: "cleans eBay affiliate parameters while preserving the item",
    input: "https://www.ebay.com/itm/123456?var=789&mkcid=1&campid=2&toolid=3",
    expected: "https://www.ebay.com/itm/123456?var=789"
  },
  {
    name: "does not remove short share parameter names globally",
    input: "https://example.com/watch?si=important&feature=enabled",
    expected: "https://example.com/watch?si=important&feature=enabled"
  },
  {
    name: "preserves authentication and application state",
    input:
      "https://example.com/callback?code=abc&state=xyz&token=session&client_id=app",
    expected:
      "https://example.com/callback?code=abc&state=xyz&token=session&client_id=app"
  },
  {
    name: "removes new unambiguous tracker name variants",
    input:
      "https://example.com/page?partner-token=abc&promo_code=def&referral_id=ghi&article=1",
    expected: "https://example.com/page?article=1"
  },
  {
    name: "removes Matomo and Sitecore campaign parameters",
    input:
      "https://example.com/page?id=1&matomo_campaign=sale&sc_campaign=launch&wt_mc=email",
    expected: "https://example.com/page?id=1"
  },
  {
    name: "preserves duplicate useful parameters",
    input: "https://example.com/?filter=red&filter=blue&utm_campaign=sale",
    expected: "https://example.com/?filter=red&filter=blue"
  }
];

for (const testCase of cases) {
  assert.equal(context.cleanLink(testCase.input).cleanUrl, testCase.expected, testCase.name);
}

assert.equal(context.isCleanableUrl("https://example.com"), true);
assert.equal(context.isCleanableUrl("http://example.com"), true);
assert.equal(context.isCleanableUrl("about:debugging"), false);
assert.equal(context.isCleanableUrl("javascript:alert(1)"), false);
assert.equal(context.isCleanableUrl("not a URL"), false);

const metadataResult = context.cleanLink(
  "https://www.google.com/url?q=https%3A%2F%2Fexample.com%2Fpost%3Futm_source%3Dsocial%26id%3D7"
);
assert.equal(metadataResult.removedCount, 2);
assert.deepEqual(Array.from(metadataResult.removed), ["redirect wrapper", "utm_source"]);
assert.equal(metadataResult.removedItems[0].type, "redirect");
assert.equal(metadataResult.removedItems[1].reason, "tracking prefix");

assert.equal(context.isTrackingParameter("click_id", "example.com"), true);
assert.equal(context.isTrackingParameter("session_id", "example.com"), false);
assert.equal(context.isTrackingParameter("si", "youtube.com"), true);
assert.equal(context.isTrackingParameter("si", "example.com"), false);

console.log(`Passed ${cases.length + 13} cleaner checks.`);
