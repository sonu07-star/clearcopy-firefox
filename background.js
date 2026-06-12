const MENU_PAGE = "clearcopy-page";
const MENU_LINK = "clearcopy-link";

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
}

browser.runtime.onInstalled.addListener(() => createMenus().catch(console.error));
browser.runtime.onStartup.addListener(() => createMenus().catch(console.error));

async function recordClean(removedCount) {
  const stats = await browser.storage.local.get(["linksCleaned", "trackersRemoved"]);
  const safeRemovedCount = Number.isInteger(removedCount) ? removedCount : 0;
  await browser.storage.local.set({
    linksCleaned: (stats.linksCleaned || 0) + 1,
    trackersRemoved: (stats.trackersRemoved || 0) + safeRemovedCount
  });
}

async function copyUrl(value, tabId) {
  if (!isCleanableUrl(value)) {
    return;
  }

  const result = cleanLink(value);
  await navigator.clipboard.writeText(result.cleanUrl);
  await recordClean(result.removed.length);

  if (Number.isInteger(tabId)) {
    await browser.action.setBadgeBackgroundColor({ color: "#285d3d", tabId });
    await browser.action.setBadgeText({ text: "OK", tabId });
    window.setTimeout(() => {
      browser.action.setBadgeText({ text: "", tabId }).catch(console.error);
    }, 1300);
  }
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  const value = info.menuItemId === MENU_LINK ? info.linkUrl : info.pageUrl;
  copyUrl(value, tab?.id).catch(console.error);
});

browser.commands.onCommand.addListener(async (command) => {
  if (command !== "copy-clean-link") {
    return;
  }

  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]?.url) {
    await copyUrl(tabs[0].url, tabs[0].id);
  }
});

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === "record-clean") {
    return recordClean(message.removedCount);
  }
});
