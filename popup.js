const elements = {
  card: document.querySelector("#result-card"),
  icon: document.querySelector("#result-icon"),
  title: document.querySelector("#result-title"),
  summary: document.querySelector("#result-summary"),
  removed: document.querySelector("#removed-list"),
  removedDetails: document.querySelector("#removed-details"),
  detailsPanel: document.querySelector("#details-panel"),
  cleanUrl: document.querySelector("#clean-url"),
  copy: document.querySelector("#copy-button"),
  copyMarkdown: document.querySelector("#copy-markdown-button"),
  replace: document.querySelector("#replace-button"),
};

let currentTab;
let result;

function showResult() {
  elements.card.classList.remove("loading");
  elements.card.classList.toggle("dirty", result.changed);
  elements.icon.textContent = result.changed ? result.removedCount : "OK";
  elements.title.textContent = result.changed
    ? `${result.removedCount} tracking field${result.removedCount === 1 ? "" : "s"} found`
    : "This link is already clean";
  elements.summary.textContent = result.changed
    ? shortUrlDiff(result.originalUrl, result.cleanUrl)
    : "Nothing needs to be removed.";
  elements.cleanUrl.value = result.cleanUrl;
  elements.cleanUrl.title = result.cleanUrl;

  if (result.changed) {
    elements.removed.replaceChildren(
      ...result.removedItems.map((item) => {
        const chip = document.createElement("span");
        chip.textContent = item.name;
        chip.title = `${item.name}: ${item.reason}`;
        return chip;
      })
    );
    elements.removed.hidden = false;
    elements.removedDetails.replaceChildren(
      ...result.removedItems.map((item) => {
        const detail = document.createElement("li");
        detail.textContent = `${item.name}: ${item.reason}`;
        return detail;
      })
    );
    elements.detailsPanel.hidden = false;
  }

  elements.copy.disabled = false;
  elements.copyMarkdown.disabled = !currentTab?.title;
  elements.replace.disabled = !result.changed || !Number.isInteger(currentTab?.id);
}

function shortUrlDiff(originalUrl, cleanUrl) {
  const removedCharacters = Math.max(originalUrl.length - cleanUrl.length, 0);
  if (removedCharacters === 0) {
    return "Ready to copy without the tracking clutter.";
  }

  return `${removedCharacters} character${removedCharacters === 1 ? "" : "s"} removed without changing the destination.`;
}

function markdownLink(title, url) {
  const safeTitle = (title || "Clean link").replaceAll("[", "\\[").replaceAll("]", "\\]");
  return `[${safeTitle}](${url})`;
}

async function copyCleanLink() {
  try {
    await navigator.clipboard.writeText(result.cleanUrl);
    elements.copy.textContent = "Copied";
    window.setTimeout(() => window.close(), 650);
  } catch {
    elements.copy.textContent = "Copy failed";
  }
}

async function copyMarkdownLink() {
  try {
    await navigator.clipboard.writeText(markdownLink(currentTab?.title, result.cleanUrl));
    elements.copyMarkdown.textContent = "Markdown copied";
  } catch {
    elements.copyMarkdown.textContent = "Copy failed";
  }
}

async function initialize() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  [currentTab] = tabs;

  if (!currentTab?.url || !isCleanableUrl(currentTab.url)) {
    elements.icon.textContent = "-";
    elements.title.textContent = "This page cannot be cleaned";
    elements.summary.textContent = "Open a regular web page and try again.";
    elements.cleanUrl.value = currentTab?.url || "URL unavailable";
    elements.card.classList.remove("loading");
    return;
  }

  result = cleanLink(currentTab.url);
  showResult();
}

elements.copy.addEventListener("click", copyCleanLink);
elements.copyMarkdown.addEventListener("click", copyMarkdownLink);

elements.replace.addEventListener("click", async () => {
  try {
    await browser.tabs.update(currentTab.id, { url: result.cleanUrl });
    window.close();
  } catch {
    elements.replace.textContent = "Could not replace this address";
  }
});

initialize().catch(() => {
  elements.icon.textContent = "!";
  elements.title.textContent = "ClearCopy could not read this page";
  elements.summary.textContent = "Try again on a regular website.";
  elements.card.classList.remove("loading");
});
