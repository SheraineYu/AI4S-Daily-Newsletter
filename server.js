import express from "express";
import {
  buildDigest,
  formatDigestDateKey,
  renderHtmlDigest,
  renderPlaintextDigest
} from "./src/lib/digest.js";

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";
const displayHost = host === "0.0.0.0" ? "localhost" : host;

app.use(express.static("public"));

app.get("/healthz", (_req, res) => {
  res.json({
    ok: true,
    service: "ai4s-daily-newsletter",
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

app.listen(port, host, () => {
  console.log(`AI4S Daily Newsletter is running at http://${displayHost}:${port}`);
});
