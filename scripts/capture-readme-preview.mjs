import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const port = Number(process.env.PREVIEW_PORT || 3000);
const outputPath = path.resolve(projectRoot, "docs/images/web-home.png");
const targetUrl = `http://127.0.0.1:${port}/?locale=en`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 90_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { headers: { accept: "application/json" } });
      if (response.ok) {
        return;
      }
    } catch {}

    await sleep(500);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function capturePreview() {
  await mkdir(path.dirname(outputPath), { recursive: true });

  const server = spawn(process.execPath, ["server.js"], {
    cwd: projectRoot,
    stdio: "inherit",
    env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" }
  });

  let browser;

  try {
    await waitForServer(`http://127.0.0.1:${port}/healthz`);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 2200 },
      deviceScaleFactor: 1.25
    });

    await page.goto(targetUrl, { waitUntil: "networkidle" });
    await page.waitForFunction(() => {
      const generatedAt = document.querySelector("#generatedAt")?.textContent?.trim() || "";
      const refreshText = document.querySelector("#refreshButton")?.textContent?.trim() || "";
      const topicCards = document.querySelectorAll("#topicGrid .topic-card").length;
      const digestItems = document.querySelectorAll("#topicGrid .digest-item").length;

      return generatedAt && !/loading/i.test(generatedAt) &&
        refreshText && !/loading/i.test(refreshText) &&
        topicCards > 0 &&
        digestItems > 0;
    }, { timeout: 90_000 });

    await page.screenshot({
      path: outputPath,
      fullPage: false
    });
  } finally {
    if (browser) {
      await browser.close();
    }

    if (!server.killed) {
      server.kill("SIGTERM");
    }
  }
}

capturePreview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
