import { readFile } from "node:fs/promises";
import {
  getLocalAnalysisCandidateFilePath,
  writeLocalTopicAnalysisBundle
} from "../src/lib/digest.js";

function readArgument(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index === process.argv.length - 1) {
    return null;
  }

  return process.argv[index + 1];
}

const inputFile = readArgument("--input") || getLocalAnalysisCandidateFilePath();
const rawText = await readFile(inputFile, "utf8");
const parsed = JSON.parse(rawText.replace(/^\uFEFF/, ""));
const saved = await writeLocalTopicAnalysisBundle(parsed);

console.log(
  JSON.stringify(
    {
      saved: true,
      inputFile,
      outputFile: saved.filePath,
      digestDateKey: saved.digestDateKey,
      topics: saved.topics.length
    },
    null,
    2
  )
);
