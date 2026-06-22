const MENU_PAGE = "clearcopy-page";
const MENU_LINK = "clearcopy-link";
const MENU_PAGE_MARKDOWN = "clearcopy-page-markdown";
const MENU_LINK_MARKDOWN = "clearcopy-link-markdown";

async function createMenus() {
  await browser.contextMenus.removeAll();
  browser.contextMenus.create({
    id: MENU_PAGE,
    title: "Copy clean link for this page",
    contexts: ["page"]
  });
  browser.contextMenus.create({
    id: MENU_LINK,
    title: "Copy clean link",
    contexts: ["link"]
  });
  browser.contextMenus.create({
    id: MENU_PAGE_MARKDOWN,
    title: "Copy clean Markdown link for this page",
    contexts: ["page"]
  });
  browser.contextMenus.create({
    id: MENU_LINK_MARKDOWN,
    title: "Copy clean Markdown link",
    contexts: ["link"]
  });
}

browser.runtime.onInstalled.addListener(() => createMenus().catch(console.error));
browser.runtime.onStartup.addListener(() => createMenus().catch(console.error));

function markdownLink(title, url) {
  const safeTitle = (title || "Clean link").replaceAll("[", "\\[").replaceAll("]", "\\]");
  return `[${safeTitle}](${url})`;
}

async function copyUrl(value, tabId, title, format = "url") {
  if (!isCleanableUrl(value)) {
    return;
  }

  const result = cleanLink(value);
  const text = format === "markdown" ? markdownLink(title, result.cleanUrl) : result.cleanUrl;
  await navigator.clipboard.writeText(text);

  if (Number.isInteger(tabId)) {
    await browser.action.setBadgeBackgroundColor({ color: "#285d3d", tabId });
    await browser.action.setBadgeText({ text: "OK", tabId });
    window.setTimeout(() => {
      browser.action.setBadgeText({ text: "", tabId }).catch(console.error);
    }, 1300);
  }
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  const isLink = info.menuItemId === MENU_LINK || info.menuItemId === MENU_LINK_MARKDOWN;
  const isMarkdown =
    info.menuItemId === MENU_PAGE_MARKDOWN || info.menuItemId === MENU_LINK_MARKDOWN;
  const value = isLink ? info.linkUrl : info.pageUrl;
  const title = isLink ? info.linkText : tab?.title;
  copyUrl(value, tab?.id, title, isMarkdown ? "markdown" : "url").catch(console.error);
});

browser.commands.onCommand.addListener(async (command) => {
  if (command !== "copy-clean-link") {
    return;
  }

  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]?.url) {
    await copyUrl(tabs[0].url, tabs[0].id, tabs[0].title);
  }
});
