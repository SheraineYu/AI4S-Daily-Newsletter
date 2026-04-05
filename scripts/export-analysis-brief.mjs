import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildLocalAnalysisBriefing,
  getLocalAnalysisBriefingFilePath
} from "../src/lib/digest.js";

const force = !process.argv.includes("--cached");
const outputFile = getLocalAnalysisBriefingFilePath();

const briefing = await buildLocalAnalysisBriefing({ force });
await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(briefing, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      saved: true,
      file: outputFile,
      digestDateKey: briefing.digestDateKey,
      topics: briefing.topics.length,
      failures: briefing.failures.length
    },
    null,
    2
  )
);
