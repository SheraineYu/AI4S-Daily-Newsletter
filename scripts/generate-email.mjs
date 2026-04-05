import {
  buildDigest,
  formatDigestDateKey,
  renderHtmlDigest,
  renderPlaintextDigest
} from "../src/lib/digest.js";
import { pathToFileURL } from "node:url";

export async function generateEmailPayload({
  force = true,
  locale = process.env.DIGEST_LOCALE === "en" ? "en" : "zh"
} = {}) {
  const digest = await buildDigest({ force });

  return {
    generatedAt: digest.generatedAt,
    subject: `AI4S Daily Newsletter | ${formatDigestDateKey(digest.generatedAt)}`,
    plainText: renderPlaintextDigest(digest, { locale }),
    html: renderHtmlDigest(digest, { locale })
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const payload = await generateEmailPayload();
  console.log(JSON.stringify(payload, null, 2));
}
