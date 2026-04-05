import {
  buildDigest,
  renderHtmlDigest,
  renderPlaintextDigest
} from "../../src/lib/digest.js";

export default async function handler(req, res) {
  try {
    const force = req.query?.refresh === "1";
    const payload = await buildDigest({ force });

    res.status(200).json({
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
}
