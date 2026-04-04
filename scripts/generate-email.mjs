import {
  buildDigest,
  renderHtmlDigest,
  renderPlaintextDigest
} from "../src/lib/digest.js";
import { pathToFileURL } from "node:url";

export async function generateEmailPayload({ force = true } = {}) {
  const digest = await buildDigest({ force });

  return {
    generatedAt: digest.generatedAt,
    subject: `AI4S Daily Digest - ${digest.generatedAt.slice(0, 10)}`,
    plainText: renderPlaintextDigest(digest),
    html: renderHtmlDigest(digest)
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const payload = await generateEmailPayload();
  console.log(JSON.stringify(payload, null, 2));
}
