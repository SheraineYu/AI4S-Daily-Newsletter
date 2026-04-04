import {
  buildDigest,
  renderHtmlDigest,
  renderPlaintextDigest
} from "../src/lib/digest.js";

const digest = await buildDigest({ force: true });

const payload = {
  generatedAt: digest.generatedAt,
  subject: `AI4S Daily Digest - ${digest.generatedAt.slice(0, 10)}`,
  plainText: renderPlaintextDigest(digest),
  html: renderHtmlDigest(digest)
};

console.log(JSON.stringify(payload, null, 2));
