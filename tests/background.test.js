const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const listeners = {};
const menus = [];
const badgeTexts = [];
const clipboardWrites = [];
const storageWrites = [];

function event(name) {
  return {
    addListener(listener) {
      listeners[name] = listener;
    }
  };
}

const browser = {
  action: {
    async setBadgeBackgroundColor() {},
    async setBadgeText(details) {
      badgeTexts.push(details.text);
    }
  },
  commands: {
    onCommand: event("command")
  },
  contextMenus: {
    async removeAll() {
      menus.length = 0;
    },
    create(details) {
      menus.push(details);
    },
    onClicked: event("menuClicked")
  },
  runtime: {
    onInstalled: event("installed"),
    onMessage: event("message"),
    onStartup: event("startup")
  },
  storage: {
    local: {
      async get() {
        return {};
      },
      async set(details) {
        storageWrites.push(details);
      }
    }
  },
  tabs: {
    async query() {
      return [
        {
          id: 7,
          url: "https://example.com/article?id=42&utm_source=email"
        }
      ];
    }
  }
};

const context = {
  URL,
  browser,
  console,
  navigator: {
    clipboard: {
      async writeText(value) {
        clipboardWrites.push(value);
      }
    }
  },
  window: {
    setTimeout(callback) {
      callback();
    }
  }
};

vm.createContext(context);
vm.runInContext(
  `${fs.readFileSync(path.join(__dirname, "..", "cleaner.js"), "utf8")}
  ${fs.readFileSync(path.join(__dirname, "..", "background.js"), "utf8")}`,
  context
);

async function run() {
  await listeners.installed();
  assert.equal(menus.length, 2, "installation creates both context menus");

  menus.length = 0;
  await listeners.startup();
  assert.equal(menus.length, 2, "browser startup recreates both context menus");

  await listeners.command("copy-clean-link");
  assert.equal(clipboardWrites.at(-1), "https://example.com/article?id=42");
  assert.equal(storageWrites.at(-1).linksCleaned, 1);
  assert.equal(storageWrites.at(-1).trackersRemoved, 1);
  assert.deepEqual(badgeTexts.slice(-2), ["OK", ""]);

  const writesBeforeUnknownCommand = clipboardWrites.length;
  await listeners.command("unknown-command");
  assert.equal(clipboardWrites.length, writesBeforeUnknownCommand);

  console.log("Passed 8 background workflow checks.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
