import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildDigest,
  formatDigestDateKey,
  renderHtmlDigest,
  renderPlaintextDigest
} from "./src/lib/digest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";
const displayHost = host === "0.0.0.0" ? "localhost" : host;

app.use(express.static(publicDir));

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/healthz", (_req, res) => {
  res.json({
    ok: true,
    service: "ai4s-daily-newsletter",
    runtime: "express",
    uptimeSeconds: Math.round(process.uptime())
  });
});

app.get("/api/digest", async (req, res) => {
  try {
    const payload = await buildDigest({ force: req.query.refresh === "1" });
    res.json(payload);
  } catch (error) {
    res.status(500).json({
      message: "Failed to build digest.",
      detail: error.message
    });
  }
});

app.get("/api/digest/email", async (req, res) => {
  try {
    const locale = req.query.locale === "en" ? "en" : "zh";
    const payload = await buildDigest({ force: req.query.refresh === "1" });
    res.json({
      generatedAt: payload.generatedAt,
      subject: `AI4S Daily Newsletter | ${formatDigestDateKey(payload.generatedAt)}`,
      plainText: renderPlaintextDigest(payload, { locale }),
      html: renderHtmlDigest(payload, { locale })
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to build email digest.",
      detail: error.message
    });
  }
});

if (process.env.VERCEL !== "1") {
  app.listen(port, host, () => {
    console.log(`AI4S Daily Newsletter is running at http://${displayHost}:${port}`);
  });
}

export default app;
