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
const pages = [
  ["radarr-library", `http://${serverIp}:7878/`],
  ["radarr-media-management", `http://${serverIp}:7878/settings/mediamanagement`],
  ["sonarr-library", `http://${serverIp}:8989/`],
  ["sonarr-media-management", `http://${serverIp}:8989/settings/mediamanagement`]
];

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

  for (const [name, url] of pages) {
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: path.join(outputDir, `${name}.png`),
        fullPage: false
      });
      console.log(`${name}: ${page.url()}`);
    } catch (error) {
      console.error(`${name}: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
})();
