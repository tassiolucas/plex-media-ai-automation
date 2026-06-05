const fs = require("fs");
const path = require("path");
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require(
    path.join(process.env.TEMP, "pwcore-i10", "node_modules", "playwright-core")
  ));
}

const outputDir = path.resolve("docs/assets");
fs.mkdirSync(outputDir, { recursive: true });

const serverIp = process.env.MEDIA_SERVER_IP || "192.168.1.100";
const plexToken = process.env.PLEX_TOKEN;
const plexMachineId = process.env.PLEX_MACHINE_ID;
const qbitUrl = process.env.QBIT_URL;
const pages = [
  ["radarr-library", `http://${serverIp}:7878/`],
  ["radarr-media-management", `http://${serverIp}:7878/settings/mediamanagement`],
  ["sonarr-library", `http://${serverIp}:8989/`],
  ["sonarr-media-management", `http://${serverIp}:8989/settings/mediamanagement`],
  ["prowlarr-applications", `http://${serverIp}:9898/settings/applications`]
];

if (plexToken) {
  const serverQuery = plexMachineId ? `?server=${plexMachineId}` : "";
  pages.push([
    "plex-dashboard",
    `http://${serverIp}:32400/web/index.html#!/${serverQuery}`
  ]);
}

if (qbitUrl) {
  pages.push(["qbittorrent-dashboard-redacted", qbitUrl]);
}

(async () => {
  const launchOptions = { headless: true };
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  if (fs.existsSync(chromePath)) {
    launchOptions.executablePath = chromePath;
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 }
  });

  if (plexToken) {
    await context.addInitScript((token) => {
      localStorage.setItem("myPlexAccessToken", token);
    }, plexToken);
  }

  for (const [name, url] of pages) {
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(3000);
      if (name === "qbittorrent-dashboard-redacted") {
        await page.addStyleTag({
          content: `
            #torrentsTableDiv tbody td:nth-child(2),
            #torrentsTableDiv .dynamicTableRow td:nth-child(2),
            #trackersFilterList li:not(:first-child) {
              color: transparent !important;
              text-shadow: none !important;
              background: #454545 !important;
            }
          `
        });
      }
      const screenshotOptions = {
        path: path.join(outputDir, `${name}.png`),
        fullPage: false
      };
      if (name === "plex-dashboard") {
        screenshotOptions.clip = { x: 0, y: 60, width: 1440, height: 840 };
      }
      await page.screenshot(screenshotOptions);
      const finalUrl = new URL(page.url());
      console.log(`${name}: ${finalUrl.origin}${finalUrl.pathname}`);
    } catch (error) {
      console.error(`${name}: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
})();
