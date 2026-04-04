import express from "express";
import { buildDigest, renderHtmlDigest, renderPlaintextDigest } from "./src/lib/digest.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

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
    const payload = await buildDigest({ force: req.query.refresh === "1" });
    res.json({
      generatedAt: payload.generatedAt,
      subject: `AI4S Daily Digest - ${payload.generatedAt.slice(0, 10)}`,
      plainText: renderPlaintextDigest(payload),
      html: renderHtmlDigest(payload)
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to build email digest.",
      detail: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`AI4S digest server is running at http://localhost:${port}`);
});
