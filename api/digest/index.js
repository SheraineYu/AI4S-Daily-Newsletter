import { buildDigest } from "../../src/lib/digest.js";

export default async function handler(req, res) {
  try {
    const force = req.query?.refresh === "1";
    const payload = await buildDigest({ force });
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({
      message: "Failed to build digest.",
      detail: error.message
    });
  }
}
