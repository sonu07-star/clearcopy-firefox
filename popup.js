const elements = {
  card: document.querySelector("#result-card"),
  icon: document.querySelector("#result-icon"),
  title: document.querySelector("#result-title"),
  summary: document.querySelector("#result-summary"),
  removed: document.querySelector("#removed-list"),
  cleanUrl: document.querySelector("#clean-url"),
  copy: document.querySelector("#copy-button"),
  replace: document.querySelector("#replace-button"),
  stats: document.querySelector("#stats")
};

let currentTab;
let result;

function showResult() {
  elements.card.classList.remove("loading");
  elements.card.classList.toggle("dirty", result.changed);
  elements.icon.textContent = result.changed ? result.removed.length : "✓";
  elements.title.textContent = result.changed
    ? `${result.removed.length} tracker${result.removed.length === 1 ? "" : "s"} found`
    : "This link is already clean";
  elements.summary.textContent = result.changed
    ? "Ready to copy without the tracking clutter."
    : "Nothing needs to be removed.";
  elements.cleanUrl.textContent = result.cleanUrl;
  elements.cleanUrl.title = result.cleanUrl;

  if (result.changed) {
    elements.removed.replaceChildren(
      ...result.removed.map((name) => {
        const chip = document.createElement("span");
        chip.textContent = name;
        chip.title = name;
        return chip;
      })
    );
    elements.removed.hidden = false;
  }

  elements.copy.disabled = false;
  elements.replace.disabled = !result.changed;
}

async function updateStats() {
  const { linksCleaned = 0, trackersRemoved = 0 } =
    await browser.storage.local.get(["linksCleaned", "trackersRemoved"]);

  if (linksCleaned > 0) {
    elements.stats.textContent =
      `${trackersRemoved} tracker${trackersRemoved === 1 ? "" : "s"} removed from ` +
      `${linksCleaned} link${linksCleaned === 1 ? "" : "s"}.`;
  }
}

async function copyCleanLink() {
  await navigator.clipboard.writeText(result.cleanUrl);
  await browser.runtime.sendMessage({
    type: "record-clean",
    removedCount: result.removed.length
  });
  elements.copy.querySelector("span").textContent = "Copied!";
  window.setTimeout(() => window.close(), 650);
}

async function initialize() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  [currentTab] = tabs;

  if (!currentTab?.url || !isCleanableUrl(currentTab.url)) {
    elements.icon.textContent = "–";
    elements.title.textContent = "This page cannot be cleaned";
    elements.summary.textContent = "Open a regular web page and try again.";
    elements.cleanUrl.textContent = currentTab?.url || "URL unavailable";
    elements.card.classList.remove("loading");
    return;
  }

  result = cleanLink(currentTab.url);
  showResult();
}

elements.copy.addEventListener("click", copyCleanLink);

elements.replace.addEventListener("click", async () => {
  await browser.tabs.update(currentTab.id, { url: result.cleanUrl });
  window.close();
});

Promise.all([initialize(), updateStats()]).catch(() => {
  elements.icon.textContent = "!";
  elements.title.textContent = "ClearCopy could not read this page";
  elements.summary.textContent = "Try again on a regular website.";
  elements.card.classList.remove("loading");
});
