import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";
import { NEWS_SOURCES, TOPICS } from "../config/topics.js";

const parser = new Parser();

const CACHE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_NEWS_LIMIT = 5;
const DEFAULT_PAPER_LIMIT = 5;
const DEFAULT_ACTION_LIMIT = 3;
const DEFAULT_SOURCE_LIMIT = 40;
const DEFAULT_LINK_METADATA_LIMIT = 8;
const FETCH_TIMEOUT_MS = 20000;
const FETCH_RETRY_COUNT = 2;
const DEFAULT_MAX_NEWS_AGE_HOURS = 24 * 7;
const DEFAULT_MAX_PAPER_AGE_HOURS = 24 * 7;
const DEFAULT_PREFERRED_NEWS_AGE_HOURS = 24 * 3;
const DEFAULT_PREFERRED_PAPER_AGE_HOURS = 24 * 3;
const DEFAULT_MAX_ITEMS_PER_SOURCE = 2;
const DEFAULT_MAX_SOFTWARE_ITEMS = 1;
const DEFAULT_ANALYSIS_ITEM_LIMIT = 4;
const DEFAULT_ANALYSIS_EXCERPT_LIMIT = 220;
const DEFAULT_REMOTE_ANALYSIS_TIMEOUT_MS = 45000;
const DEFAULT_LOCAL_ANALYSIS_PATH = "var/editorial-analysis/latest.json";
const DEFAULT_LOCAL_ANALYSIS_CANDIDATE_PATH = "var/editorial-analysis/candidate.json";
const DEFAULT_LOCAL_ANALYSIS_BRIEFING_PATH = "var/editorial-analysis/briefing.json";
const DEFAULT_LOCAL_ANALYSIS_MAX_AGE_HOURS = 30;

const LOCALE_MAP = {
  en: "en-US",
  zh: "zh-CN"
};

const ANALYSIS_PROVIDER_LABELS = {
  template: {
    en: "Template analysis",
    zh: "模板分析"
  },
  local: {
    en: "Local analysis",
    zh: "本地分析"
  },
  remote: {
    en: "Remote analysis",
    zh: "远程分析"
  }
};

const TOPIC_ANALYSIS_INSTRUCTIONS = [
  "Use only the supplied topic data.",
  "Reflect today's actual signals instead of evergreen commentary.",
  "Keep the writing concise but insight-dense.",
  "Connect today's developments to research direction, experiments, benchmarking, deployment, or scientific workflow decisions.",
  "Do not invent facts, sources, papers, or claims that are not present in the input.",
  "Return valid JSON only."
];

const TOPIC_ANALYSIS_SCHEMA = {
  name: "topic_analysis_bundle",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["topics"],
    properties: {
      topics: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "id",
            "importanceLevel",
            "confidenceLevel",
            "importanceTextEn",
            "importanceTextZh",
            "confidenceTextEn",
            "confidenceTextZh",
            "whyItMattersEn",
            "whyItMattersZh",
            "nextStepTextEn",
            "nextStepTextZh",
            "actionsEn",
            "actionsZh"
          ],
          properties: {
            id: { type: "string" },
            importanceLevel: {
              type: "string",
              enum: ["high", "medium", "watch", "low"]
            },
            confidenceLevel: {
              type: "string",
              enum: ["high", "medium", "low"]
            },
            importanceTextEn: { type: "string" },
            importanceTextZh: { type: "string" },
            confidenceTextEn: { type: "string" },
            confidenceTextZh: { type: "string" },
            whyItMattersEn: { type: "string" },
            whyItMattersZh: { type: "string" },
            nextStepTextEn: { type: "string" },
            nextStepTextZh: { type: "string" },
            actionsEn: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: { type: "string" }
            },
            actionsZh: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: { type: "string" }
            }
          }
        }
      }
    }
  }
};

const RENDER_COPY = {
  en: {
    digestTitle: "AI4S Daily Newsletter",
    digestSubtitle:
      "A curated daily brief for frontier models, AI4S, atomistic simulation, hardware systems, and globally important signals.",
    generated: "Generated",
    topics: "Topics",
    news: "News",
    papers: "Papers",
    feeds: "Feeds",
    importance: "Importance",
    confidence: "Confidence",
    whyItMatters: "Why It Matters",
    nextStep: "Next Step",
    actionIdeas: "Action Ideas",
    openLink: "Open link",
    latestUpdates: "latest updates",
    latestResearch: "latest research",
    newsOnly: "news only",
    noNews: "No matched news items for this topic right now.",
    noPapers: "No papers returned for this topic right now.",
    unavailableSources: "Unavailable sources"
  },
  zh: {
    digestTitle: "AI4S Daily Newsletter",
    digestSubtitle:
      "面向前沿大模型、AI4S、原子尺度模拟、硬件系统与全球重要信号的精选日报。",
    generated: "生成时间",
    topics: "专题",
    news: "新闻",
    papers: "论文",
    feeds: "信源",
    importance: "重要性",
    confidence: "置信度",
    whyItMatters: "为何重要",
    nextStep: "下一步",
    actionIdeas: "建议动作",
    openLink: "打开链接",
    latestUpdates: "最新动态",
    latestResearch: "最新研究",
    newsOnly: "仅新闻",
    noNews: "当前没有匹配到高相关新闻。",
    noPapers: "当前没有匹配到高相关论文。",
    unavailableSources: "暂不可用的来源"
  }
};

let digestCache = {
  generatedAt: 0,
  payload: null
};

function cleanText(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function stripBom(value = "") {
  return String(value).replace(/^\uFEFF/, "");
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normaliseDate(value) {
  const time = value ? Date.parse(value) : NaN;
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

function normaliseLooseDate(value) {
  const text = cleanText(value);
  if (!text) {
    return null;
  }

  let match = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).toISOString();
  }

  match = text.match(/^(\d{2})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, month, day, yearSuffix] = match;
    const year = Number(yearSuffix) >= 70 ? 1900 + Number(yearSuffix) : 2000 + Number(yearSuffix);
    return new Date(Date.UTC(year, Number(month) - 1, Number(day))).toISOString();
  }

  return normaliseDate(text);
}

function getAgeHours(value) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return Number.POSITIVE_INFINITY;
  }

  return (Date.now() - timestamp) / (1000 * 60 * 60);
}

function isWithinAgeHours(value, maxAgeHours) {
  return getAgeHours(value) <= maxAgeHours;
}

function formatDigestDate(value, locale = "zh") {
  if (!value) {
    return locale === "zh" ? "鏈煡鏃堕棿" : "Unknown date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return locale === "zh" ? "鏈煡鏃堕棿" : "Unknown date";
  }

  return new Intl.DateTimeFormat(LOCALE_MAP[locale] || LOCALE_MAP.en, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai"
  }).format(date);
}

export function formatDigestDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "unknown-date";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const lookup = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );

  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

export function getLocalAnalysisFilePath() {
  return path.resolve(
    process.cwd(),
    process.env.LOCAL_ANALYSIS_FILE || DEFAULT_LOCAL_ANALYSIS_PATH
  );
}

export function getLocalAnalysisCandidateFilePath() {
  return path.resolve(
    process.cwd(),
    process.env.LOCAL_ANALYSIS_CANDIDATE_FILE || DEFAULT_LOCAL_ANALYSIS_CANDIDATE_PATH
  );
}

export function getLocalAnalysisBriefingFilePath() {
  return path.resolve(
    process.cwd(),
    process.env.LOCAL_ANALYSIS_BRIEFING_FILE || DEFAULT_LOCAL_ANALYSIS_BRIEFING_PATH
  );
}

function trimText(value = "", limit = 120) {
  return value.length > limit ? `${value.slice(0, limit - 1)}...` : value;
}

function flattenCategoryValue(value) {
  if (value == null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(flattenCategoryValue).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    return [
      value.term,
      value.label,
      value.name,
      value.text,
      value.value,
      value._,
      value["#text"]
    ]
      .map(flattenCategoryValue)
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

function coerceTextValue(value) {
  if (value == null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(coerceTextValue).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    const flattened = flattenCategoryValue(value);
    if (flattened) {
      return flattened;
    }

    try {
      return JSON.stringify(value);
    } catch (error) {
      return "";
    }
  }

  return "";
}

function listToSentence(items = [], locale = "en") {
  if (!items.length) {
    return "";
  }

  if (locale === "zh") {
    return items.join("、");
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildExcerpt(item) {
  const candidates = [
    item.contentSnippet,
    item.summary,
    item.content,
    item.description,
    item.body
  ];

  for (const candidate of candidates) {
    const text = cleanText(candidate);
    if (text) {
      return text.slice(0, 280);
    }
  }

  return "";
}

function buildLocalizedText(en, zh = en) {
  return { en, zh: zh || en };
}

function buildLocalizedArray(en = [], zh = en) {
  return { en, zh: zh?.length ? zh : en };
}

function buildAnalysisProvider(id = "template", generatedAt = null) {
  const labels =
    id === "local"
      ? { en: "Local analysis", zh: "鏈湴鍒嗘瀽" }
      : id === "remote"
        ? { en: "Remote analysis", zh: "杩滅▼鍒嗘瀽" }
        : { en: "Template analysis", zh: "模板分析" };
  return {
    id,
    label: buildLocalizedText(labels.en, labels.zh),
    generatedAt: normaliseDate(generatedAt)
  };
}

function cleanActionList(values, fallbackValues = []) {
  const cleaned = (Array.isArray(values) ? values : [])
    .map((value) => cleanText(value))
    .filter(Boolean)
    .slice(0, DEFAULT_ACTION_LIMIT);

  if (cleaned.length === DEFAULT_ACTION_LIMIT) {
    return cleaned;
  }

  const fallback = (Array.isArray(fallbackValues) ? fallbackValues : [])
    .map((value) => cleanText(value))
    .filter(Boolean);

  for (const value of fallback) {
    if (cleaned.length >= DEFAULT_ACTION_LIMIT) {
      break;
    }

    if (!cleaned.includes(value)) {
      cleaned.push(value);
    }
  }

  return cleaned.slice(0, DEFAULT_ACTION_LIMIT);
}

function pickLocalized(value, locale = "en") {
  if (value && typeof value === "object" && ("en" in value || "zh" in value)) {
    return value[locale] || value.en || value.zh || "";
  }

  return value;
}

function buildTopicText(topic) {
  return {
    title: buildLocalizedText(topic.title, topic.titleZh),
    badge: buildLocalizedText(topic.badge, topic.badgeZh),
    description: buildLocalizedText(topic.description, topic.descriptionZh),
    whyItMattersBase: buildLocalizedText(
      topic.whyItMattersBase,
      topic.whyItMattersBaseZh
    ),
    focusAreas: buildLocalizedArray(topic.focusAreas || [], topic.focusAreasZh || []),
    warningFocus: buildLocalizedText(topic.warningFocus, topic.warningFocusZh),
    nextStepPrompts: buildLocalizedArray(
      topic.nextStepPrompts || [],
      topic.nextStepPromptsZh || []
    )
  };
}

function getAnalysisMode() {
  const mode = String(process.env.DIGEST_ANALYSIS_MODE || "hybrid")
    .trim()
    .toLowerCase();

  if (mode === "template" || mode === "remote" || mode === "hybrid" || mode === "local") {
    return mode;
  }

  return "hybrid";
}

function shouldAttemptLocalAnalysis() {
  const mode = getAnalysisMode();
  return mode === "local" || mode === "hybrid";
}

function shouldAttemptRemoteAnalysis() {
  const mode = getAnalysisMode();

  if (mode === "template" || mode === "local") {
    return false;
  }

  return Boolean(
    process.env.REMOTE_ANALYSIS_API_KEY?.trim() &&
      process.env.REMOTE_ANALYSIS_BASE_URL?.trim() &&
      process.env.REMOTE_ANALYSIS_MODEL?.trim()
  );
}

function buildAnalysisSignalDigest(items, limit = DEFAULT_ANALYSIS_ITEM_LIMIT) {
  return items.slice(0, limit).map((item) => ({
    title: trimText(cleanText(item.title || ""), 180),
    source: cleanText(item.source || ""),
    publishedAt: item.publishedAt || null,
    excerpt: trimText(cleanText(item.excerpt || ""), DEFAULT_ANALYSIS_EXCERPT_LIMIT),
    official: Boolean(item.sourceOfficial),
    type: item.sourceType || "news"
  }));
}

function buildTopicAnalysisPromptPayload(topicDrafts) {
  return topicDrafts.map(({ topic, topicText, news, papers, analysis }) => ({
    id: topic.id,
    title: pickLocalized(topicText.title, "en"),
    titleZh: pickLocalized(topicText.title, "zh"),
    description: pickLocalized(topicText.description, "en"),
    descriptionZh: pickLocalized(topicText.description, "zh"),
    focusAreas: pickLocalized(topicText.focusAreas, "en"),
    focusAreasZh: pickLocalized(topicText.focusAreas, "zh"),
    warningFocus: pickLocalized(topicText.warningFocus, "en"),
    warningFocusZh: pickLocalized(topicText.warningFocus, "zh"),
    fallbackImportanceLevel: analysis.importance.level,
    fallbackConfidenceLevel: analysis.confidence.level,
    counts: {
      news: news.length,
      papers: papers.length,
      sources: new Set([...news, ...papers].map((item) => item.source)).size,
      officialSignals: [...news, ...papers].filter((item) => item.sourceOfficial).length
    },
    news: buildAnalysisSignalDigest(news),
    papers: buildAnalysisSignalDigest(papers)
  }));
}

function scoreByRecency(publishedAt) {
  const ageHours = getAgeHours(publishedAt);
  if (!Number.isFinite(ageHours)) {
    return 0;
  }

  if (ageHours <= 12) return 8;
  if (ageHours <= 24) return 6;
  if (ageHours <= 72) return 4;
  if (ageHours <= 168) return 2;
  return 0;
}

function scoreByKeywords(item, keywords = []) {
  const title = cleanText(item.title || "").toLowerCase();
  const excerpt = cleanText(
    [item.contentSnippet, item.summary, item.content, item.excerpt]
      .filter(Boolean)
      .join(" ")
  ).toLowerCase();
  const categories = cleanText(flattenCategoryValue(item.categories || [])).toLowerCase();

  let score = (item.sourcePriority || 0) * 3 + scoreByRecency(item.publishedAt);
  if (item.sourceOfficial) {
    score += 4;
  }
  if (item.sourceType === "software") {
    score -= 2;
  }
  let titleHits = 0;
  let categoryHits = 0;
  let bodyHits = 0;

  for (const keyword of keywords) {
    const needle = keyword.toLowerCase();

    if (title.includes(needle)) {
      titleHits += 1;
      score += needle.length > 10 ? 5 : 4;
      continue;
    }

    if (categories.includes(needle)) {
      categoryHits += 1;
      score += needle.length > 10 ? 4 : 3;
      continue;
    }

    if (excerpt.includes(needle)) {
      bodyHits += 1;
      score += needle.length > 10 ? 3 : 2;
    }
  }

  return {
    score,
    titleHits,
    categoryHits,
    bodyHits,
    strongMatch:
      titleHits > 0 ||
      categoryHits > 0 ||
      bodyHits > 1 ||
      (item.sourceOfficial && bodyHits > 0)
  };
}

function matchesAnyPattern(text, patterns = []) {
  const haystack = cleanText(text).toLowerCase();
  return patterns.some((pattern) => pattern.test(haystack));
}

const ROUTINE_DEVELOPER_PATTERNS = [
  /^(fix|feat|chore|docs?|test|ci|build|style|refactor|perf|bump|deps?|dependency update|merge pull request|merge branch|revert)\b/,
  /\b(bugfix|maintenance|housekeeping|minor release|patch release)\b/,
  /\b(update|upgrade)\s+(dependencies|deps|requirements|lockfile|readme|docs?)\b/,
  /\b(ci|build|lint|format|typing|type hints?|unit tests?)\b/
];

const GITHUB_RELEASE_NOISE_PATTERNS = [
  /^(release\s+)?v?\d+\.\d+\.\d+([.-][a-z0-9]+)?$/,
  /^(python|sdk|client|package)\b/,
  /\b(pre-?release|alpha|beta|rc\d*)\b/,
  /\b(changelog|dependency|dependencies|deps|package|wheel|pypi)\b/
];

const FRONTIER_IMPORTANT_PATTERNS = [
  /\b(model|models|launch|launched|announce|announced|introduc|release|released|reasoning|multimodal|agent|tool use|benchmark|evaluation|api|checkpoint|open model)\b/,
  /\b(gemma|gemini|gpt|claude|llama|grok|mistral|deepseek|qwen)\b/
];

const FRONTIER_MEDIA_NOISE_PATTERNS = [
  /\b(private market|private markets|valuation|funding|raises?|raised|rumou?r|reportedly|sources say)\b/,
  /\b(secondary sale|tender offer|private deal|backed by|series [a-z])\b/
];

const AGENT_IMPORTANT_PATTERNS = [
  /\b(agent|agentic|tool use|tool-use|workflow|multi-agent|orchestrat|memory|planning|delegat|autonomous)\b/
];

const HARDWARE_IMPORTANT_PATTERNS = [
  /\b(fpga|asic|accelerator|chip|semiconductor|gpu|npu|hbm|memory|interconnect|packaging|fab|fabrication|export control|throughput|latency|tpu|trainium|inferentia|gaudi|rocm|wafer-scale|serving|compiler|kernel|rack-scale)\b/
];

const HARDWARE_MEDIA_NOISE_PATTERNS = [
  /\b(shares?|stock|market cap|valuation|funding|raises?|raised|startup)\b/,
  /\b(private market|private markets|series [a-z]|venture)\b/
];

const HARDWARE_STRATEGIC_PATTERNS = [
  /\b(export control|export controls|fab|fabrication|manufacturing|packaging|hbm|interconnect|gpu|npu|semiconductor|tpu|trainium|inferentia|gaudi|rocm|wafer-scale|serving|compiler|kernel|rack-scale)\b/
];

const GLOBAL_SUMMARY_NOISE_PATTERNS = [
  /\bweek in politics\b/,
  /\brocky week\b/,
  /\broundup\b/,
  /\bmorning brief\b/,
  /\bevening brief\b/
];

const GLOBAL_SPECULATION_NOISE_PATTERNS = [
  /\btech download\b/,
  /\bwindfall\b/,
  /\bstock market\b/,
  /\bcorrection floor\b/,
  /\bcould hit bottom\b/
];

const ATOMISTIC_DOMAIN_PATTERNS = [
  /\babacus\b/,
  /\blammps\b/,
  /\bcp2k\b/,
  /\bquantum espresso\b/,
  /\base\b/,
  /\bdeepmodeling\b/,
  /\bopen catalyst\b/,
  /\bcatalyst\b/,
  /\belectrocatalysis\b/,
  /\bmaterials project\b/,
  /\bpymatgen\b/,
  /\boqmd\b/,
  /\bpsi-k\b/,
  /\bdensity functional\b/,
  /\belectronic structure\b/,
  /\bhybrid functional\b/,
  /\binteratomic\b/,
  /\bforce field\b/,
  /\bmolecular dynamics\b/,
  /\bmaterials simulation\b/,
  /\bab initio\b/
];

const ATOMISTIC_IMPORTANT_PATTERNS = [
  /\brelease\b/,
  /\brelease notes?\b/,
  /\bfeature release\b/,
  /\bstable release\b/,
  /\bavailable for download\b/,
  /\bdatabase version\b/,
  /\bbenchmark\b/,
  /\bdataset\b/,
  /\bmodels?\b/,
  /\bperformance\b/,
  /\bscal(?:e|ing|able)\b/,
  /\baccelerat/i,
  /\bparallel\b/,
  /\bgpu\b/,
  /\bmajor\b/,
  /\bmajor changes?\b/,
  /\bnew structures?\b/,
  /\bmethod\b/,
  /\balgorithm\b/,
  /\bworkflow\b/,
  /\bhybrid functional\b/
];

const ATOMISTIC_NOISE_PATTERNS = [
  /\bfellowship\b/,
  /\bposition(s)?\b/,
  /\bworkshop(s)?\b/,
  /\bconference\b/,
  /\bsymposi(?:um|a)\b/,
  /\bsummer school\b/,
  /\btutorial\b/,
  /\bmailing list\b/,
  /\bfunding call\b/,
  /\bcall for\b/,
  /\bexpression(s)? of interest\b/,
  /\bjob(s)?\b/,
  /\bcareer(s)?\b/
];

function passesTopicSignalGate(topic, item) {
  const title = cleanText(item.title || "");
  const text = cleanText(`${item.source || ""} ${title} ${item.excerpt || ""}`);

  if (!title) {
    return false;
  }

  if (matchesAnyPattern(title, ROUTINE_DEVELOPER_PATTERNS)) {
    return false;
  }

  if (item.sourceKind?.startsWith("github") && matchesAnyPattern(text, GITHUB_RELEASE_NOISE_PATTERNS)) {
    return false;
  }

  if (topic.id === "frontier-models") {
    if (item.sourceKind === "github-releases") {
      return matchesAnyPattern(text, FRONTIER_IMPORTANT_PATTERNS);
    }

    if (
      !item.sourceOfficial &&
      matchesAnyPattern(text, FRONTIER_MEDIA_NOISE_PATTERNS) &&
      !matchesAnyPattern(text, FRONTIER_IMPORTANT_PATTERNS)
    ) {
      return false;
    }

    return item.sourceOfficial || matchesAnyPattern(text, FRONTIER_IMPORTANT_PATTERNS);
  }

  if (topic.id === "agents") {
    if (
      !item.sourceOfficial &&
      matchesAnyPattern(text, FRONTIER_MEDIA_NOISE_PATTERNS) &&
      !matchesAnyPattern(text, AGENT_IMPORTANT_PATTERNS)
    ) {
      return false;
    }

    return item.sourceOfficial || matchesAnyPattern(text, AGENT_IMPORTANT_PATTERNS);
  }

  if (topic.id === "hardware") {
    if (
      !item.sourceOfficial &&
      matchesAnyPattern(text, HARDWARE_MEDIA_NOISE_PATTERNS) &&
      !matchesAnyPattern(text, HARDWARE_STRATEGIC_PATTERNS)
    ) {
      return false;
    }

    return (
      matchesAnyPattern(text, HARDWARE_IMPORTANT_PATTERNS) ||
      (item.sourceOfficial && matchesAnyPattern(text, HARDWARE_STRATEGIC_PATTERNS))
    );
  }

  if (topic.id === "global-watchlist") {
    return (
      !matchesAnyPattern(text, GLOBAL_SUMMARY_NOISE_PATTERNS) &&
      !matchesAnyPattern(text, GLOBAL_SPECULATION_NOISE_PATTERNS)
    );
  }

  if (topic.id === "atomistic") {
    if (matchesAnyPattern(text, ATOMISTIC_NOISE_PATTERNS)) {
      return false;
    }

    return (
      item.sourceOfficial &&
      matchesAnyPattern(text, ATOMISTIC_DOMAIN_PATTERNS) &&
      matchesAnyPattern(text, ATOMISTIC_IMPORTANT_PATTERNS)
    );
  }

  return true;
}

function uniqueByLink(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.link || item.id;
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function uniqueBySignal(items) {
  const seenLinks = new Set();
  const seenTitles = new Set();

  return items.filter((item) => {
    const linkKey = item.link || item.id;
    const titleKey = slugify(cleanText(item.title || ""));

    if (linkKey && seenLinks.has(linkKey)) {
      return false;
    }

    if (titleKey && seenTitles.has(titleKey)) {
      return false;
    }

    if (linkKey) {
      seenLinks.add(linkKey);
    }

    if (titleKey) {
      seenTitles.add(titleKey);
    }

    return true;
  });
}

function takeItemsWithCaps(
  items,
  {
    limit,
    maxItemsPerSource = Number.POSITIVE_INFINITY,
    maxSoftwareItems = Number.POSITIVE_INFINITY,
    maxUnofficialItems = Number.POSITIVE_INFINITY
  }
) {
  const selected = [];
  const sourceCounts = new Map();
  let softwareCount = 0;
  let unofficialCount = 0;

  for (const item of items) {
    if (selected.length >= limit) {
      break;
    }

    const sourceKey = item.sourceId || item.source || item.id;
    const currentSourceCount = sourceCounts.get(sourceKey) || 0;
    if (currentSourceCount >= maxItemsPerSource) {
      continue;
    }

    if (item.sourceType === "software" && softwareCount >= maxSoftwareItems) {
      continue;
    }

    if (!item.sourceOfficial && unofficialCount >= maxUnofficialItems) {
      continue;
    }

    selected.push(item);
    sourceCounts.set(sourceKey, currentSourceCount + 1);
    if (item.sourceType === "software") {
      softwareCount += 1;
    }
    if (!item.sourceOfficial) {
      unofficialCount += 1;
    }
  }

  return selected;
}

function selectRecentItems(
  items,
  {
    limit,
    preferredAgeHours,
    maxAgeHours,
    maxItemsPerSource = Number.POSITIVE_INFINITY,
    maxSoftwareItems = Number.POSITIVE_INFINITY,
    maxUnofficialItems = Number.POSITIVE_INFINITY
  }
) {
  const preferred = [];
  const recent = [];

  uniqueBySignal(items).forEach((item) => {
    if (!isWithinAgeHours(item.publishedAt, maxAgeHours)) {
      return;
    }

    if (isWithinAgeHours(item.publishedAt, preferredAgeHours)) {
      preferred.push(item);
      return;
    }

    recent.push(item);
  });

  return takeItemsWithCaps(
    [...sortByScoreThenTime(preferred), ...sortByScoreThenTime(recent)],
    {
      limit,
      maxItemsPerSource,
      maxSoftwareItems,
      maxUnofficialItems
    }
  );
}

function sortByScoreThenTime(items) {
  return items.sort((left, right) => {
    const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : 0;
    const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : 0;
    return right.score - left.score || rightTime - leftTime;
  });
}

function filterCorpusForTopic(topic, corpus) {
  return corpus.filter((item) => {
    if (
      topic.allowedSourceTypes?.length &&
      !topic.allowedSourceTypes.includes(item.sourceType)
    ) {
      return false;
    }

    if (Array.isArray(topic.sourceIds) && !topic.sourceIds.includes(item.sourceId)) {
      return false;
    }

    return true;
  });
}

function summariseTopSources(items, limit = 3) {
  const counts = new Map();

  items.forEach((item) => {
    if (!item.source) {
      return;
    }

    counts.set(item.source, (counts.get(item.source) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label]) => label);
}

function describeImportanceLevel(level, locale) {
  if (locale === "zh") {
    return {
      high: "高优先级",
      medium: "中优先级",
      watch: "观察级",
      low: "低优先级"
    }[level];
  }

  return {
    high: "High Priority",
    medium: "Medium Priority",
    watch: "Watch List",
    low: "Low Priority"
  }[level];
}

function describeConfidenceLevel(level, locale) {
  if (locale === "zh") {
    return {
      high: "高置信度",
      medium: "中等置信度",
      low: "低置信度"
    }[level];
  }

  return {
    high: "High Confidence",
    medium: "Moderate Confidence",
    low: "Low Confidence"
  }[level];
}

function inferImportanceLevel({ signalCount, sourceCount, hasPapers, officialCount }) {
  if (signalCount >= 6 && sourceCount >= 3 && (hasPapers || officialCount >= 2)) {
    return "high";
  }

  if (signalCount >= 3 && (sourceCount >= 2 || officialCount >= 1)) {
    return "medium";
  }

  if (signalCount >= 1) {
    return "watch";
  }

  return "low";
}

function inferConfidenceLevel({
  signalCount,
  sourceCount,
  evidenceTypeCount,
  officialCount
}) {
  if (signalCount >= 4 && sourceCount >= 3 && evidenceTypeCount >= 2 && officialCount >= 1) {
    return "high";
  }

  if (signalCount >= 2 && (sourceCount >= 2 || officialCount >= 1)) {
    return "medium";
  }

  return "low";
}

function buildTopicAnalysis(topic, topicText, news, papers) {
  const visiblePapers = topic.showPapers === false ? [] : papers;
  const allSignals = [...news, ...visiblePapers];
  const sourceLabels = summariseTopSources(allSignals);
  const sourceCount = new Set(allSignals.map((item) => item.source)).size;
  const evidenceTypes = new Set(allSignals.map((item) => item.sourceType));
  const officialCount = allSignals.filter((item) => item.sourceOfficial).length;
  const signalCount = allSignals.length;
  const hasPapers = visiblePapers.length > 0;
  const importanceLevel = inferImportanceLevel({
    signalCount,
    sourceCount,
    hasPapers,
    officialCount
  });
  const confidenceLevel = inferConfidenceLevel({
    signalCount,
    sourceCount,
    evidenceTypeCount: evidenceTypes.size,
    officialCount
  });

  const focusAreasEn = pickLocalized(topicText.focusAreas, "en");
  const focusAreasZh = pickLocalized(topicText.focusAreas, "zh");
  const warningEn = pickLocalized(topicText.warningFocus, "en");
  const warningZh = pickLocalized(topicText.warningFocus, "zh");
  const whyBaseEn = pickLocalized(topicText.whyItMattersBase, "en");
  const whyBaseZh = pickLocalized(topicText.whyItMattersBase, "zh");
  const nextPromptsEn = pickLocalized(topicText.nextStepPrompts, "en").slice(
    0,
    DEFAULT_ACTION_LIMIT
  );
  const nextPromptsZh = pickLocalized(topicText.nextStepPrompts, "zh").slice(
    0,
    DEFAULT_ACTION_LIMIT
  );

  const sourcesEn = sourceLabels.length
    ? listToSentence(sourceLabels, "en")
    : "today's available sources";
  const sourcesZh = sourceLabels.length
    ? listToSentence(sourceLabels, "zh")
    : "褰撳墠鍙敤鏉ユ簮";
  const focusSummaryEn = listToSentence(focusAreasEn, "en");
  const focusSummaryZh = listToSentence(focusAreasZh, "zh");
  const typeSummaryEn = listToSentence(
    [...evidenceTypes].map((type) => {
      if (type === "paper") return "papers";
      if (type === "software") return "software updates";
      return "news";
    }),
    "en"
  );
  const typeSummaryZh = listToSentence(
    [...evidenceTypes].map((type) => {
      if (type === "paper") return "璁烘枃";
      if (type === "software") return "杞欢鏇存柊";
      return "鏂伴椈";
    }),
    "zh"
  );

  const importanceTextEn =
    importanceLevel === "low"
      ? `Low priority today. The signal cluster is thin, so keep ${focusSummaryEn} on watch rather than pushing immediate decisions.`
      : importanceLevel === "watch"
        ? `Watch-list priority. Early signals are forming around ${focusSummaryEn}, but the cluster is still too small to lock in direction.`
        : importanceLevel === "medium"
          ? `Medium priority. ${signalCount} relevant items surfaced around ${focusSummaryEn}, which is enough to influence short-term monitoring and experiment planning.`
          : `High priority. ${signalCount} strong signals surfaced around ${focusSummaryEn}, making this topic worth immediate monitoring or action.`;
  const importanceTextZh =
    importanceLevel === "low"
      ? `今天优先级较低。相关信号仍偏弱，建议先把 ${focusSummaryZh} 保持在观察清单中，而不是立即做判断。`
      : importanceLevel === "watch"
        ? `目前处于观察级。${focusSummaryZh} 已出现早期信号，但规模还不足以支持明确方向判断。`
        : importanceLevel === "medium"
          ? `今天属于中优先级。围绕 ${focusSummaryZh} 已出现 ${signalCount} 条相关条目，足以影响短期监控、阅读和实验安排。`
          : `今天属于高优先级。围绕 ${focusSummaryZh} 已形成 ${signalCount} 条强信号，值得立即跟踪并安排具体动作。`;

  const confidenceTextEn =
    confidenceLevel === "high"
      ? `High confidence. The cluster spans ${sourcesEn} and covers ${typeSummaryEn}, which reduces single-source bias.`
      : confidenceLevel === "medium"
        ? `Moderate confidence. There is at least one credible signal path, but the evidence is still concentrated in ${sourcesEn}.`
        : `Low confidence. Today's cluster is either sparse or mostly single-source, so treat it as an early indicator rather than a firm conclusion.`;
  const confidenceTextZh =
    confidenceLevel === "high"
      ? `置信度较高。当前信号横跨 ${sourcesZh}，并覆盖 ${typeSummaryZh}，单一路径偏差相对较低。`
      : confidenceLevel === "medium"
        ? `置信度中等。当前至少存在一条可信信号链，但证据仍比较集中，主要来自 ${sourcesZh}。`
        : `置信度较低。今天的信号要么数量偏少，要么过于集中在单一路径，更适合作为早期预警，而不是确定结论。`;

  const whyTextEn = `${whyBaseEn} Today's strongest sources are ${sourcesEn}.`;
  const whyTextZh = `${whyBaseZh} 今天的主要信号来源是 ${sourcesZh}。`;

  const nextStepTextEn =
    signalCount > 0
      ? "Push this topic from passive reading into concrete tracking or experiments with the action list below."
      : "Keep the next-step list ready so weak signals can be converted into action as soon as better evidence appears.";
  const nextStepTextZh =
    signalCount > 0
      ? "建议把这个专题从被动阅读推进到具体跟踪、实验或内部讨论，优先执行下面的动作。"
      : "先保留下一步动作清单，等更强证据出现时再迅速转成执行。";

  return {
    importance: {
      level: importanceLevel,
      label: buildLocalizedText(
        describeImportanceLevel(importanceLevel, "en"),
        describeImportanceLevel(importanceLevel, "zh")
      ),
      text: buildLocalizedText(importanceTextEn, importanceTextZh)
    },
    confidence: {
      level: confidenceLevel,
      label: buildLocalizedText(
        describeConfidenceLevel(confidenceLevel, "en"),
        describeConfidenceLevel(confidenceLevel, "zh")
      ),
      text: buildLocalizedText(confidenceTextEn, confidenceTextZh)
    },
    whyItMatters: {
      text: buildLocalizedText(whyTextEn, whyTextZh)
    },
    nextStep: {
      text: buildLocalizedText(nextStepTextEn, nextStepTextZh),
      actions: buildLocalizedArray(nextPromptsEn, nextPromptsZh)
    },
    warning: buildLocalizedText(warningEn, warningZh),
    provider: buildAnalysisProvider("template")
  };
}

function mergeExternalTopicAnalysis(
  fallbackAnalysis,
  externalAnalysis,
  topicText,
  providerId = "template",
  generatedAt = null
) {
  if (!externalAnalysis) {
    return fallbackAnalysis;
  }

  const fallbackActionsEn = pickLocalized(topicText.nextStepPrompts, "en");
  const fallbackActionsZh = pickLocalized(topicText.nextStepPrompts, "zh");
  const importanceLevel = externalAnalysis.importanceLevel || fallbackAnalysis.importance.level;
  const confidenceLevel = externalAnalysis.confidenceLevel || fallbackAnalysis.confidence.level;

  return {
    importance: {
      level: importanceLevel,
      label: buildLocalizedText(
        describeImportanceLevel(importanceLevel, "en"),
        describeImportanceLevel(importanceLevel, "zh")
      ),
      text: buildLocalizedText(
        cleanText(externalAnalysis.importanceTextEn) ||
          pickLocalized(fallbackAnalysis.importance.text, "en"),
        cleanText(externalAnalysis.importanceTextZh) ||
          pickLocalized(fallbackAnalysis.importance.text, "zh")
      )
    },
    confidence: {
      level: confidenceLevel,
      label: buildLocalizedText(
        describeConfidenceLevel(confidenceLevel, "en"),
        describeConfidenceLevel(confidenceLevel, "zh")
      ),
      text: buildLocalizedText(
        cleanText(externalAnalysis.confidenceTextEn) ||
          pickLocalized(fallbackAnalysis.confidence.text, "en"),
        cleanText(externalAnalysis.confidenceTextZh) ||
          pickLocalized(fallbackAnalysis.confidence.text, "zh")
      )
    },
    whyItMatters: {
      text: buildLocalizedText(
        cleanText(externalAnalysis.whyItMattersEn) ||
          pickLocalized(fallbackAnalysis.whyItMatters.text, "en"),
        cleanText(externalAnalysis.whyItMattersZh) ||
          pickLocalized(fallbackAnalysis.whyItMatters.text, "zh")
      )
    },
    nextStep: {
      text: buildLocalizedText(
        cleanText(externalAnalysis.nextStepTextEn) ||
          pickLocalized(fallbackAnalysis.nextStep.text, "en"),
        cleanText(externalAnalysis.nextStepTextZh) ||
          pickLocalized(fallbackAnalysis.nextStep.text, "zh")
      ),
      actions: buildLocalizedArray(
        cleanActionList(externalAnalysis.actionsEn, fallbackActionsEn),
        cleanActionList(externalAnalysis.actionsZh, fallbackActionsZh)
      )
    },
    warning: fallbackAnalysis.warning,
    provider: buildAnalysisProvider(providerId, generatedAt)
  };
}

function createAnalysisError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normaliseTopicAnalysisEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const id = cleanText(entry.id);
  const importanceLevel = cleanText(entry.importanceLevel).toLowerCase();
  const confidenceLevel = cleanText(entry.confidenceLevel).toLowerCase();

  if (!id) {
    return null;
  }

  if (!["high", "medium", "watch", "low"].includes(importanceLevel)) {
    return null;
  }

  if (!["high", "medium", "low"].includes(confidenceLevel)) {
    return null;
  }

  return {
    id,
    importanceLevel,
    confidenceLevel,
    importanceTextEn: cleanText(entry.importanceTextEn),
    importanceTextZh: cleanText(entry.importanceTextZh),
    confidenceTextEn: cleanText(entry.confidenceTextEn),
    confidenceTextZh: cleanText(entry.confidenceTextZh),
    whyItMattersEn: cleanText(entry.whyItMattersEn),
    whyItMattersZh: cleanText(entry.whyItMattersZh),
    nextStepTextEn: cleanText(entry.nextStepTextEn),
    nextStepTextZh: cleanText(entry.nextStepTextZh),
    actionsEn: cleanActionList(entry.actionsEn),
    actionsZh: cleanActionList(entry.actionsZh)
  };
}

function normaliseTopicAnalysisBundle(bundle, { allowedTopicIds } = {}) {
  const allowedIds = allowedTopicIds || new Set(TOPICS.map((topic) => topic.id));
  const rawTopics = Array.isArray(bundle?.topics) ? bundle.topics : [];
  const topics = rawTopics
    .map((entry) => normaliseTopicAnalysisEntry(entry))
    .filter((entry) => entry && allowedIds.has(entry.id));

  if (!topics.length) {
    throw createAnalysisError(
      "invalid",
      "Topic analysis bundle did not include any valid newsletter topics"
    );
  }

  const generatedAt = normaliseDate(bundle?.generatedAt || new Date().toISOString());
  const digestDateKey = cleanText(bundle?.digestDateKey) || formatDigestDateKey(generatedAt);

  return {
    source: cleanText(bundle?.source) || "local-analysis",
    generatedAt,
    digestDateKey,
    topics
  };
}

async function loadLocalTopicAnalyses(topicDrafts, { digestDateKey } = {}) {
  const filePath = getLocalAnalysisFilePath();
  const allowedTopicIds = new Set(topicDrafts.map(({ topic }) => topic.id));

  let rawText = "";
  let stats = null;

  try {
    [rawText, stats] = await Promise.all([readFile(filePath, "utf8"), stat(filePath)]);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw createAnalysisError("absent", `Local analysis file not found at ${filePath}`);
    }

    throw createAnalysisError(
      "unreadable",
      `Failed to read local analysis file at ${filePath}: ${error.message}`
    );
  }

  let parsed = null;
  try {
    parsed = JSON.parse(stripBom(rawText));
  } catch (error) {
    throw createAnalysisError(
      "invalid",
      `Local analysis file is not valid JSON at ${filePath}: ${error.message}`
    );
  }

  const bundle = normaliseTopicAnalysisBundle(parsed, { allowedTopicIds });
  const expectedDateKey = digestDateKey || formatDigestDateKey(new Date().toISOString());
  if (bundle.digestDateKey !== expectedDateKey) {
    throw createAnalysisError(
      "stale",
      `Local analysis is for ${bundle.digestDateKey}, expected ${expectedDateKey}`
    );
  }

  const freshnessAnchor = bundle.generatedAt || normaliseDate(stats?.mtime);
  const maxAgeHours = Number(
    process.env.LOCAL_ANALYSIS_MAX_AGE_HOURS || DEFAULT_LOCAL_ANALYSIS_MAX_AGE_HOURS
  );
  if (
    Number.isFinite(maxAgeHours) &&
    maxAgeHours > 0 &&
    !isWithinAgeHours(freshnessAnchor, maxAgeHours)
  ) {
    throw createAnalysisError(
      "stale",
      `Local analysis is older than ${maxAgeHours} hours`
    );
  }

  return {
    generatedAt: freshnessAnchor,
    filePath,
    map: new Map(bundle.topics.map((entry) => [entry.id, entry]))
  };
}

export async function writeLocalTopicAnalysisBundle(bundle, { filePath } = {}) {
  const targetPath = path.resolve(filePath || getLocalAnalysisFilePath());
  const normalised = normaliseTopicAnalysisBundle(bundle);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(`${targetPath}`, `${JSON.stringify(normalised, null, 2)}\n`, "utf8");
  return {
    ...normalised,
    filePath: targetPath
  };
}

async function generateRemoteTopicAnalyses(topicDrafts) {
  const apiKey = process.env.REMOTE_ANALYSIS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("REMOTE_ANALYSIS_API_KEY is not configured");
  }

  const model = String(process.env.REMOTE_ANALYSIS_MODEL || "").trim();
  if (!model) {
    throw new Error("REMOTE_ANALYSIS_MODEL is not configured");
  }
  const timeoutMs = Number(
    process.env.REMOTE_ANALYSIS_TIMEOUT_MS || DEFAULT_REMOTE_ANALYSIS_TIMEOUT_MS
  );
  const baseUrl = String(process.env.REMOTE_ANALYSIS_BASE_URL || "").replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("REMOTE_ANALYSIS_BASE_URL is not configured");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const payload = {
    model,
    messages: [
      {
        role: "system",
        content:
          "You are the research editor for AI4S Daily Newsletter. Use only the provided topic data. Write concise but insight-dense analysis that reflects the actual daily signals, not generic evergreen commentary. Prioritize what changed, how credible the signal is, why it matters for research and experimentation, and what concrete next steps should be tried next. Avoid hype, avoid invented facts, and do not reference sources or papers that are not present in the input. Chinese should read naturally, not as literal translation."
      },
      {
        role: "user",
        content: [
          "Generate bilingual topic analysis for the daily newsletter.",
          ...TOPIC_ANALYSIS_INSTRUCTIONS,
          "For each topic:",
          "- set importanceLevel to high, medium, watch, or low based on today's actual signals",
          "- set confidenceLevel to high, medium, or low based on corroboration, source quality, and evidence diversity",
          "- importanceText should explain what changed or why today's cluster deserves attention",
          "- confidenceText should explain why the signal is or is not reliable",
          "- whyItMatters should connect today's items to research, benchmarking, modeling, deployment, or scientific workflow decisions",
          "- nextStepText should state the strategic action for today",
          "- actionsEn and actionsZh should each contain exactly 3 concrete, research-useful next ideas",
          "- stay grounded in the supplied items and topic priors",
          "",
          JSON.stringify(buildTopicAnalysisPromptPayload(topicDrafts))
        ].join("\n")
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: TOPIC_ANALYSIS_SCHEMA
    }
  };

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const rawText = await response.text();
    if (!response.ok) {
      throw new Error(`Remote analysis request failed with ${response.status}: ${rawText}`);
    }

    const data = JSON.parse(rawText);
    const content = data.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("Remote analysis response did not include structured content");
    }

    const parsed = JSON.parse(content);
    const topicEntries = Array.isArray(parsed?.topics) ? parsed.topics : [];
    return {
      generatedAt: new Date().toISOString(),
      map: new Map(topicEntries.map((entry) => [entry.id, entry]))
    };
  } finally {
    clearTimeout(timer);
  }
}

function toPublicTopic(topic, news, papers, analysis) {
  const text = buildTopicText(topic);
  return {
    id: topic.id,
    accent: topic.accent,
    showPapers: topic.showPapers !== false,
    title: text.title,
    badge: text.badge,
    description: text.description,
    analysis,
    news,
    papers
  };
}

function getRenderCopy(locale = "zh") {
  return RENDER_COPY[locale] || RENDER_COPY.zh;
}

export function renderPlaintextDigest(payload, { locale = "zh" } = {}) {
  const copy = getRenderCopy(locale);
  const lines = [copy.digestTitle, `${copy.generated}: ${payload.generatedAt}`, ""];

  payload.topics.forEach((topic) => {
    lines.push(pickLocalized(topic.title, locale));
    lines.push(pickLocalized(topic.description, locale));
    lines.push(
      `${copy.importance}: ${pickLocalized(topic.analysis.importance.label, locale)}. ${pickLocalized(
        topic.analysis.importance.text,
        locale
      )}`
    );
    lines.push(
      `${copy.confidence}: ${pickLocalized(topic.analysis.confidence.label, locale)}. ${pickLocalized(
        topic.analysis.confidence.text,
        locale
      )}`
    );
    lines.push(
      `${copy.whyItMatters}: ${pickLocalized(topic.analysis.whyItMatters.text, locale)}`
    );
    lines.push(`${copy.nextStep}: ${pickLocalized(topic.analysis.nextStep.text, locale)}`);

    const actions = pickLocalized(topic.analysis.nextStep.actions, locale) || [];
    if (actions.length) {
      lines.push(`${copy.actionIdeas}:`);
      actions.forEach((action) => {
        lines.push(`- ${action}`);
      });
    }

    if (topic.news.length) {
      lines.push(`${copy.news}:`);
      topic.news.forEach((item) => {
        lines.push(`- ${item.title}`);
        lines.push(`  ${item.source} | ${formatDigestDate(item.publishedAt, locale)}`);
        lines.push(`  ${item.link}`);
      });
    } else {
      lines.push(`${copy.news}: ${copy.noNews}`);
    }

    if (topic.showPapers && topic.papers.length) {
      lines.push(`${copy.papers}:`);
      topic.papers.forEach((item) => {
        lines.push(`- ${item.title}`);
        lines.push(`  ${item.source} | ${formatDigestDate(item.publishedAt, locale)}`);
        lines.push(`  ${item.link}`);
      });
    } else if (topic.showPapers) {
      lines.push(`${copy.papers}: ${copy.noPapers}`);
    }

    lines.push("");
  });

  if (payload.failures.length) {
    lines.push(`${copy.unavailableSources}:`);
    payload.failures.forEach((failure) => {
      lines.push(`- ${failure.source}: ${failure.message}`);
    });
  }

  return lines.join("\n");
}

export function renderHtmlDigest(payload, { locale = "zh" } = {}) {
  const copy = getRenderCopy(locale);

  const renderCardList = (items, accent, fallbackLabel) => {
    if (!items.length) {
      return `
        <tr>
          <td style="padding:0 0 12px;">
            <div style="border:1px dashed #cfd9e8;border-radius:18px;padding:16px;background:#f8fbff;color:#607089;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">
              ${escapeHtml(fallbackLabel)}
            </div>
          </td>
        </tr>
      `;
    }

    return items
      .map(
        (item) => `
          <tr>
            <td style="padding:0 0 12px;">
              <a
                href="${escapeHtml(item.link)}"
                style="display:block;text-decoration:none;color:#101b2d;border:1px solid #dce6f3;border-radius:18px;padding:18px;background:#ffffff;"
              >
                <div style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.02em;color:#62738b;margin-bottom:8px;">
                  ${escapeHtml(item.source)} | ${escapeHtml(formatDigestDate(item.publishedAt, locale))}
                </div>
                <div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.45;font-weight:700;color:#101b2d;">
                  ${escapeHtml(item.title)}
                </div>
                <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#56677f;margin-top:10px;">
                  ${escapeHtml(item.excerpt || fallbackLabel)}
                </div>
                <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${accent};margin-top:12px;">
                  ${escapeHtml(copy.openLink)}
                </div>
              </a>
            </td>
          </tr>
        `
      )
      .join("");
  };

  const renderActionList = (items) =>
    items
      .map(
        (item) =>
          `<div style="margin-top:8px;font-family:Arial,sans-serif;font-size:13px;line-height:1.65;color:#50617a;">&#8226; ${escapeHtml(item)}</div>`
      )
      .join("");

  const sections = payload.topics
    .map((topic) => {
      const title = pickLocalized(topic.title, locale);
      const badge = pickLocalized(topic.badge, locale);
      const description = pickLocalized(topic.description, locale);
      const importanceLabel = pickLocalized(topic.analysis.importance.label, locale);
      const importanceText = pickLocalized(topic.analysis.importance.text, locale);
      const confidenceLabel = pickLocalized(topic.analysis.confidence.label, locale);
      const confidenceText = pickLocalized(topic.analysis.confidence.text, locale);
      const whyText = pickLocalized(topic.analysis.whyItMatters.text, locale);
      const nextText = pickLocalized(topic.analysis.nextStep.text, locale);
      const nextActions = pickLocalized(topic.analysis.nextStep.actions, locale) || [];

      return `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid #dde6f2;border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:22px 22px 18px;background:linear-gradient(180deg, rgba(13,24,40,0.02), rgba(13,24,40,0));">
              <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${topic.accent};margin-bottom:10px;">
                ${escapeHtml(badge)}
              </div>
              <div style="font-family:Arial,sans-serif;font-size:24px;line-height:1.15;font-weight:700;color:#101b2d;margin-bottom:10px;">
                ${escapeHtml(title)}
              </div>
              <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.65;color:#56677f;">
                ${escapeHtml(description)}
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;border-collapse:separate;border-spacing:0;">
                <tr>
                  <td style="padding:0 10px 10px 0;vertical-align:top;width:50%;">
                    <div style="height:100%;border:1px solid #dce6f3;border-radius:18px;padding:16px;background:#f7fbff;">
                      <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${topic.accent};margin-bottom:8px;">
                        ${escapeHtml(copy.importance)}
                      </div>
                      <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;line-height:1.5;color:#233249;margin-bottom:8px;">
                        ${escapeHtml(importanceLabel)}
                      </div>
                      <div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#44556d;">
                        ${escapeHtml(importanceText)}
                      </div>
                    </div>
                  </td>
                  <td style="padding:0 0 10px;vertical-align:top;width:50%;">
                    <div style="height:100%;border:1px solid #dce6f3;border-radius:18px;padding:16px;background:#f7fbff;">
                      <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${topic.accent};margin-bottom:8px;">
                        ${escapeHtml(copy.confidence)}
                      </div>
                      <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;line-height:1.5;color:#233249;margin-bottom:8px;">
                        ${escapeHtml(confidenceLabel)}
                      </div>
                      <div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#44556d;">
                        ${escapeHtml(confidenceText)}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 10px 0 0;vertical-align:top;width:50%;">
                    <div style="height:100%;border:1px solid #dce6f3;border-radius:18px;padding:16px;background:#f9fbfe;">
                      <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${topic.accent};margin-bottom:8px;">
                        ${escapeHtml(copy.whyItMatters)}
                      </div>
                      <div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#50617a;">
                        ${escapeHtml(whyText)}
                      </div>
                    </div>
                  </td>
                  <td style="padding:0;vertical-align:top;width:50%;">
                    <div style="height:100%;border:1px solid #dce6f3;border-radius:18px;padding:16px;background:#f9fbfe;">
                      <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${topic.accent};margin-bottom:8px;">
                        ${escapeHtml(copy.nextStep)}
                      </div>
                      <div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#50617a;">
                        ${escapeHtml(nextText)}
                      </div>
                      ${renderActionList(nextActions)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 22px 22px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:0 0 10px;">
                    <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#101b2d;">${escapeHtml(copy.news)}</div>
                    <div style="font-family:Arial,sans-serif;font-size:12px;color:#7a8aa0;">${escapeHtml(copy.latestUpdates)}</div>
                  </td>
                </tr>
                ${renderCardList(topic.news, topic.accent, copy.noNews)}
                ${
                  topic.showPapers
                    ? `
                      <tr>
                        <td style="padding:8px 0 10px;">
                          <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#101b2d;">${escapeHtml(copy.papers)}</div>
                          <div style="font-family:Arial,sans-serif;font-size:12px;color:#7a8aa0;">${escapeHtml(copy.latestResearch)}</div>
                        </td>
                      </tr>
                      ${renderCardList(topic.papers, topic.accent, copy.noPapers)}
                    `
                    : ""
                }
              </table>
            </td>
          </tr>
        </table>
      `;
    })
    .join("");

  const failures = payload.failures.length
    ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;border-collapse:separate;border-spacing:0;background:#fff7f4;border:1px solid #f1d3cb;border-radius:20px;overflow:hidden;">
        <tr>
          <td style="padding:18px 20px;">
            <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#8e4635;margin-bottom:8px;">${escapeHtml(copy.unavailableSources)}</div>
            <div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#7a4b3f;">
              ${payload.failures
                .map(
                  (failure) =>
                    `${escapeHtml(failure.source)}: ${escapeHtml(failure.message)}`
                )
                .join("<br>")}
            </div>
          </td>
        </tr>
      </table>
    `
    : "";

  return `
    <div style="margin:0;padding:24px 0;background:#edf3fb;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:920px;margin:0 auto;border-collapse:collapse;">
        <tr>
          <td style="padding:0 18px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;background:linear-gradient(135deg, #0b1321, #132238);border-radius:28px;overflow:hidden;">
              <tr>
                <td style="padding:28px;">
                  <div style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9ecfff;margin-bottom:12px;">
                    Curated daily brief
                  </div>
                  <div style="font-family:Arial,sans-serif;font-size:34px;line-height:1.05;font-weight:700;color:#f7fbff;margin-bottom:14px;">
                    ${escapeHtml(copy.digestTitle)}
                  </div>
                  <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#d6e6ff;max-width:720px;">
                    ${escapeHtml(copy.digestSubtitle)}
                  </div>
                  <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:18px;border-collapse:collapse;">
                    <tr>
                      <td style="padding:0 10px 10px 0;">
                        <div style="min-width:110px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,0.08);font-family:Arial,sans-serif;">
                          <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#b2ccf3;">${escapeHtml(copy.topics)}</div>
                          <div style="font-size:24px;font-weight:700;color:#ffffff;">${payload.overview.totalTopics}</div>
                        </div>
                      </td>
                      <td style="padding:0 10px 10px 0;">
                        <div style="min-width:110px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,0.08);font-family:Arial,sans-serif;">
                          <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#b2ccf3;">${escapeHtml(copy.news)}</div>
                          <div style="font-size:24px;font-weight:700;color:#ffffff;">${payload.overview.newsCount}</div>
                        </div>
                      </td>
                      <td style="padding:0 10px 10px 0;">
                        <div style="min-width:110px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,0.08);font-family:Arial,sans-serif;">
                          <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#b2ccf3;">${escapeHtml(copy.papers)}</div>
                          <div style="font-size:24px;font-weight:700;color:#ffffff;">${payload.overview.paperCount}</div>
                        </div>
                      </td>
                      <td style="padding:0 10px 10px 0;">
                        <div style="min-width:110px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,0.08);font-family:Arial,sans-serif;">
                          <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#b2ccf3;">${escapeHtml(copy.feeds)}</div>
                          <div style="font-size:24px;font-weight:700;color:#ffffff;">${payload.overview.sourceCount}</div>
                        </div>
                      </td>
                      <td style="padding:0 0 10px 0;">
                        <div style="min-width:130px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,0.08);font-family:Arial,sans-serif;">
                          <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#b2ccf3;">${escapeHtml(copy.generated)}</div>
                          <div style="font-size:14px;font-weight:700;color:#ffffff;line-height:1.45;">${escapeHtml(
                            formatDigestDate(payload.generatedAt, locale)
                          )}</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <div style="height:20px;"></div>
            ${sections}
            ${failures}
          </td>
        </tr>
      </table>
    </div>
  `;
}

async function parseFeed(source) {
  if (source.kind === "github-commits") {
    return fetchGithubCommits(source);
  }

  if (source.kind === "github-releases") {
    return fetchGithubReleases(source);
  }

  if (source.kind === "html-news") {
    return fetchHtmlNews(source);
  }

  const feed = await fetchAndParseXml(source.url);
  return (feed.items || [])
    .slice(0, DEFAULT_SOURCE_LIMIT)
    .map((item) => {
      const link = coerceTextValue(item.link);
      const guid = coerceTextValue(item.guid);
      const itemId = coerceTextValue(item.id);
      const title = cleanText(coerceTextValue(item.title) || "Untitled");

      return {
      id: `${source.id}-${slugify(itemId || guid || link || title)}`,
      title,
      link,
      sourceId: source.id,
      source: source.label,
      sourceKind: source.kind || "rss",
      sourceType: source.type,
      sourceOfficial: Boolean(source.official),
      sourcePriority: source.priority || 0,
      publishedAt: normaliseDate(
        item.isoDate || item.pubDate || item.published || item.updated
      ),
      excerpt: buildExcerpt(item),
      categories: Array.isArray(item.categories) ? item.categories : []
    };})
    .filter((item) => item.title && item.link);
}

async function fetchNewsCorpus() {
  const settled = await Promise.allSettled(NEWS_SOURCES.map(parseFeed));
  const items = [];
  const failures = [];

  settled.forEach((result, index) => {
    const source = NEWS_SOURCES[index];
    if (result.status === "fulfilled") {
      items.push(...result.value);
      return;
    }

    failures.push({
      source: source.label,
      message: result.reason?.message || "Feed fetch failed"
    });
  });

  return { items, failures };
}

async function fetchArxivPapers(topic, limit = DEFAULT_PAPER_LIMIT) {
  if (!topic.paperQuery || topic.showPapers === false) {
    return [];
  }

  const url =
    "https://export.arxiv.org/api/query?" +
    new URLSearchParams({
      search_query: topic.paperQuery,
      start: "0",
      max_results: String(limit * 6),
      sortBy: "submittedDate",
      sortOrder: "descending"
    }).toString();

  const feed = await fetchAndParseXml(url);
  const ranked = (feed.items || [])
    .map((item) => ({
      id: `paper-${topic.id}-${slugify(item.id || item.link || item.title)}`,
      title: cleanText(item.title || "Untitled paper"),
      link: item.link || item.id || "",
      source: "arXiv",
      sourceId: "arxiv",
      sourceType: "paper",
      sourceOfficial: false,
      sourcePriority: 4,
      publishedAt: normaliseDate(
        item.isoDate || item.pubDate || item.published || item.updated
      ),
      excerpt: buildExcerpt(item),
      authors: Array.isArray(item.creator)
        ? item.creator
        : cleanText(item.creator || item.author || ""),
      categories: Array.isArray(item.categories) ? item.categories : []
    }))
    .map((item) => ({
      ...item,
      ...scoreByKeywords(item, topic.paperKeywords || topic.newsKeywords || [])
    }));

  const filtered = sortByScoreThenTime(ranked).filter(
    (item) => item.score > 0 && item.strongMatch
  );

  return selectRecentItems(filtered.length ? filtered : ranked, {
    limit,
    preferredAgeHours: topic.preferredPaperAgeHours || DEFAULT_PREFERRED_PAPER_AGE_HOURS,
    maxAgeHours: topic.maxPaperAgeHours || DEFAULT_MAX_PAPER_AGE_HOURS
  });
}

function selectNewsForTopic(topic, corpus, limit = DEFAULT_NEWS_LIMIT) {
  const ranked = filterCorpusForTopic(topic, corpus)
    .map((item) => ({
      ...item,
      ...scoreByKeywords(item, topic.newsKeywords || [])
    }))
    .filter((item) => item.score > 0 && item.strongMatch && passesTopicSignalGate(topic, item));

  return selectRecentItems(ranked, {
    limit,
    preferredAgeHours: topic.preferredNewsAgeHours || DEFAULT_PREFERRED_NEWS_AGE_HOURS,
    maxAgeHours: topic.maxNewsAgeHours || DEFAULT_MAX_NEWS_AGE_HOURS,
    maxItemsPerSource: topic.maxItemsPerSource || DEFAULT_MAX_ITEMS_PER_SOURCE,
    maxUnofficialItems:
      topic.maxUnofficialItems == null ? Number.POSITIVE_INFINITY : topic.maxUnofficialItems,
    maxSoftwareItems:
      topic.maxSoftwareItems == null ? DEFAULT_MAX_SOFTWARE_ITEMS : topic.maxSoftwareItems
  });
}

function buildOverview(topics) {
  return {
    totalTopics: topics.length,
    newsCount: topics.reduce((sum, topic) => sum + topic.news.length, 0),
    paperCount: topics.reduce((sum, topic) => sum + topic.papers.length, 0),
    sourceCount: NEWS_SOURCES.length
  };
}

async function buildDigestDraft() {
  const generatedAt = new Date().toISOString();
  const { items: corpus, failures } = await fetchNewsCorpus();
  const paperResults = await Promise.allSettled(
    TOPICS.map((topic) => fetchArxivPapers(topic, topic.paperLimit || DEFAULT_PAPER_LIMIT))
  );

  const topicDrafts = TOPICS.map((topic, index) => {
    const paperResult = paperResults[index];
    const papers = paperResult.status === "fulfilled" ? paperResult.value : [];

    if (paperResult.status === "rejected" && topic.showPapers !== false) {
      failures.push({
        source: `${topic.title} arXiv query`,
        message: paperResult.reason?.message || "Paper fetch failed"
      });
    }

    const news = selectNewsForTopic(topic, corpus, topic.newsLimit || DEFAULT_NEWS_LIMIT);
    const topicText = buildTopicText(topic);
    const analysis = buildTopicAnalysis(topic, topicText, news, papers);

    return {
      topic,
      topicText,
      news,
      papers,
      analysis
    };
  });

  return {
    generatedAt,
    failures,
    topicDrafts
  };
}

export async function buildLocalAnalysisBriefing({ force = true } = {}) {
  const { generatedAt, failures, topicDrafts } = await buildDigestDraft();
  return {
    generatedAt,
    digestDateKey: formatDigestDateKey(generatedAt),
    analysisMode: getAnalysisMode(),
    outputFile: getLocalAnalysisFilePath(),
    candidateFile: getLocalAnalysisCandidateFilePath(),
    instructions: TOPIC_ANALYSIS_INSTRUCTIONS,
    outputSchema: TOPIC_ANALYSIS_SCHEMA.schema,
    topics: buildTopicAnalysisPromptPayload(topicDrafts),
    failures
  };
}

export async function buildDigest({ force = false } = {}) {
  const now = Date.now();
  if (!force && digestCache.payload && now - digestCache.generatedAt < CACHE_TTL_MS) {
    return digestCache.payload;
  }

  const { generatedAt, failures, topicDrafts } = await buildDigestDraft();
  const digestDateKey = formatDigestDateKey(generatedAt);

  let localAnalysisResult = null;
  if (shouldAttemptLocalAnalysis()) {
    try {
      localAnalysisResult = await loadLocalTopicAnalyses(topicDrafts, { digestDateKey });
    } catch (error) {
      if (error.code !== "absent" || getAnalysisMode() === "local") {
        failures.push({
          source: "Local analysis",
          message: error.message || "Local analysis failed; using fallback"
        });
      }
    }
  }

  let remoteAnalysisResult = null;
  if (!localAnalysisResult && shouldAttemptRemoteAnalysis()) {
    try {
      remoteAnalysisResult = await generateRemoteTopicAnalyses(topicDrafts);
    } catch (error) {
      failures.push({
        source: "Remote analysis",
        message: error.message || "Remote analysis failed; using template fallback"
      });
    }
  } else if (getAnalysisMode() === "remote") {
    failures.push({
      source: "Remote analysis",
      message: "Remote analysis settings are missing; using template fallback"
    });
  }

  const topics = topicDrafts.map(({ topic, topicText, news, papers, analysis }) => {
    const localAnalysis = localAnalysisResult?.map?.get(topic.id);
    const remoteAnalysis = remoteAnalysisResult?.map?.get(topic.id);
    const mergedAnalysis = localAnalysis
      ? mergeExternalTopicAnalysis(
          analysis,
          localAnalysis,
          topicText,
          "local",
          localAnalysisResult.generatedAt
        )
      : remoteAnalysis
        ? mergeExternalTopicAnalysis(
            analysis,
            remoteAnalysis,
            topicText,
            "remote",
            remoteAnalysisResult.generatedAt
          )
        : analysis;

    return toPublicTopic(topic, news, papers, mergedAnalysis);
  });

  const payload = {
    generatedAt,
    overview: buildOverview(topics),
    failures,
    topics
  };

  digestCache = {
    generatedAt: now,
    payload
  };

  return payload;
}

async function fetchAndParseXml(url) {
  const xml = await fetchText(url, {
    "User-Agent": "AI4S-Digest/1.0 (+https://local.newsletter)"
  });
  return parser.parseString(xml);
}

async function fetchGithubCommits(source) {
  const items = await fetchJson(source.url);
  return items
    .slice(0, DEFAULT_SOURCE_LIMIT)
    .map((item) => {
      const title = cleanText(item.commit?.message?.split("\n")[0] || "Commit update");
      const excerpt = cleanText(item.commit?.message || "");
      return {
        id: `${source.id}-${item.sha}`,
        title,
        link: item.html_url || "",
        sourceId: source.id,
        source: source.label,
        sourceKind: source.kind || "github-commits",
        sourceType: source.type,
        sourceOfficial: Boolean(source.official),
        sourcePriority: source.priority || 0,
        publishedAt: normaliseDate(
          item.commit?.author?.date || item.commit?.committer?.date
        ),
        excerpt,
        categories: []
      };
    })
    .filter((item) => isHighImpactCommit(item.title, item.excerpt));
}

async function fetchGithubReleases(source) {
  const items = await fetchJson(source.url);
  return items
    .slice(0, DEFAULT_SOURCE_LIMIT)
    .map((item) => {
      const title = cleanText(item.name || item.tag_name || "Release update");
      const excerpt = cleanText(item.body || "");
      return {
        id: `${source.id}-${item.id || slugify(item.tag_name || item.name)}`,
        title,
        link: item.html_url || "",
        sourceId: source.id,
        source: source.label,
        sourceKind: source.kind || "github-releases",
        sourceType: source.type,
        sourceOfficial: Boolean(source.official),
        sourcePriority: source.priority || 0,
        publishedAt: normaliseDate(item.published_at || item.created_at),
        excerpt,
        categories: item.prerelease ? ["prerelease"] : []
      };
    })
    .filter((item) => isHighImpactRelease(source, item.title, item.excerpt));
}

async function fetchHtmlNews(source) {
  const html = await fetchText(source.url, {
    "User-Agent": "AI4S-Digest/1.0 (+https://local.newsletter)"
  });

  if (source.extractor === "anthropic-news") {
    return extractWindowedHtmlItems(html, source, {
      linkPattern: /href="(?<link>\/news\/[^"]+)"/g,
      titlePatterns: [/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i],
      excerptPatterns: [/<p[^>]*>([\s\S]*?)<\/p>/i],
      datePatterns: [
        /<time[^>]*(?:dateTime|datetime)="([^"]+)"/i,
        /<time[^>]*>([\s\S]*?)<\/time>/i
      ],
      windowSize: 2400
    });
  }

  if (source.extractor === "deepmodeling-category") {
    return extractDeepModelingCategoryItems(html, source);
  }

  if (source.extractor === "open-catalyst-project") {
    return extractOpenCatalystProjectItems(html, source);
  }

  if (source.extractor === "isomorphic-labs-news") {
    return extractIsomorphicLabsNewsItems(html, source);
  }

  if (source.extractor === "materials-project-db-versions") {
    return extractMaterialsProjectDatabaseVersions(html, source);
  }

  if (source.extractor === "lammps-downloads") {
    return extractLammpsDownloadItems(html, source);
  }

  if (source.extractor === "cp2k-news") {
    return extractCp2kNewsItems(html, source);
  }

  if (source.extractor === "ase-release-notes") {
    return extractAseReleaseNotesItems(html, source);
  }

  if (source.extractor === "oqmd-download") {
    return extractOqmdDownloadItems(html, source);
  }

  if (source.extractor === "google-cloud-compute") {
    return extractGoogleCloudComputeItems(html, source);
  }

  if (source.extractor === "amd-ai-blogs") {
    return extractAmdAiBlogItems(html, source);
  }

  if (source.extractor === "cerebras-blog") {
    return extractCerebrasBlogItems(html, source);
  }

  if (source.extractor === "groq-newsroom") {
    return extractGroqNewsroomItems(html, source);
  }

  if (source.extractor === "nist-magnetics") {
    return extractNistMagneticsItems(html, source);
  }

  throw new Error(`Unknown HTML extractor: ${source.extractor}`);
}

function extractWindowedHtmlItems(
  html,
  source,
  { linkPattern, titlePatterns, excerptPatterns, datePatterns, windowSize = 2200 }
) {
  const matches = [...html.matchAll(linkPattern)];
  const items = [];
  const seen = new Set();

  for (const match of matches) {
    const rawLink = match.groups?.link || match[1];
    if (!rawLink) {
      continue;
    }

    const link = new URL(rawLink, source.url).toString();
    if (seen.has(link)) {
      continue;
    }
    seen.add(link);

    const start = match.index || 0;
    const window = html.slice(start, start + windowSize);
    const title = extractFirstMatch(window, titlePatterns);
    if (!title || title.length < 6) {
      continue;
    }

    const excerpt = extractFirstMatch(window, excerptPatterns);
    const publishedAt = normaliseDate(extractFirstMatch(window, datePatterns));

    items.push({
      id: `${source.id}-${slugify(link)}`,
      title,
      link,
      sourceId: source.id,
      source: source.label,
      sourceKind: source.kind || "html-news",
      sourceType: source.type,
      sourceOfficial: Boolean(source.official),
      sourcePriority: source.priority || 0,
      publishedAt,
      excerpt,
      categories: []
    });
  }

  return items.slice(0, DEFAULT_SOURCE_LIMIT);
}

function buildSourceItem(source, values = {}) {
  const resolvedLink = values.link ? new URL(values.link, source.url).toString() : source.url;
  return {
    id: values.id || `${source.id}-${slugify(resolvedLink || values.title || Date.now())}`,
    title: cleanText(values.title || "Untitled"),
    link: resolvedLink,
    sourceId: source.id,
    source: source.label,
    sourceKind: source.kind || "html-news",
    sourceType: source.type,
    sourceOfficial: Boolean(source.official),
    sourcePriority: source.priority || 0,
    publishedAt: normaliseDate(values.publishedAt),
    excerpt: cleanText(values.excerpt || ""),
    categories: Array.isArray(values.categories) ? values.categories : []
  };
}

function extractDeepModelingCategoryItems(html, source) {
  const items = [];
  const pattern =
    /<article[\s\S]*?<time[^>]*datetime="(?<datetime>[^"]+)"[\s\S]*?<a class="post-title-link" href="(?<link>[^"]+)"[\s\S]*?<span itemprop="name">(?<title>[\s\S]*?)<\/span>[\s\S]*?<\/article>/g;

  for (const match of html.matchAll(pattern)) {
    const link = new URL(match.groups?.link || "", source.url).toString();
    const title = cleanText(match.groups?.title || "");
    const publishedAt = match.groups?.datetime || "";
    const windowStart = match.index || 0;
    const window = html.slice(windowStart, windowStart + 2200);
    const excerpt =
      cleanText(
        window.match(/<div class="post-body"[^>]*>([\s\S]*?)<div class="post-button">/i)?.[1] || ""
      ) || title;

    if (!title || !link) {
      continue;
    }

    items.push(
      buildSourceItem(source, {
        id: `${source.id}-${slugify(link)}`,
        title,
        link,
        publishedAt,
        excerpt,
        categories: ["abacus", "deepmodeling"]
      })
    );
  }

  return items.slice(0, DEFAULT_SOURCE_LIMIT);
}

function extractMaterialsProjectDatabaseVersions(html, source) {
  const items = [];
  const pattern =
    /<h2 id="v(?<version>[\d.]+[^"]*)"[\s\S]*?<div class="flex-1[\s\S]*?>(?<heading>v[\d.]+[^<]*)<\/div><\/h2><p[^>]*>(?<excerpt>[\s\S]*?)<\/p>/g;

  for (const match of html.matchAll(pattern)) {
    const version = cleanText(match.groups?.heading || match.groups?.version || "");
    const excerpt = cleanText(match.groups?.excerpt || "");
    const normalizedVersion = cleanText(match.groups?.version || "").replace(/^v/i, "");
    const publishedAt = normalizedVersion.split(".").slice(0, 3).join("-");

    if (!version) {
      continue;
    }

    items.push(
      buildSourceItem(source, {
        id: `${source.id}-${slugify(version)}`,
        title: `Materials Project Database ${version}`,
        link: `${source.url}#v${match.groups?.version || ""}`,
        publishedAt,
        excerpt,
        categories: ["materials-project", "database version"]
      })
    );
  }

  return items.slice(0, DEFAULT_SOURCE_LIMIT);
}

function extractLammpsDownloadItems(html, source) {
  const items = [];
  const pattern =
    /<tr>\s*<td>(?<title>LAMMPS (?:Stable|Feature) Release)<\/td>\s*<td>(?<releaseDate>[^<]+)<\/td>\s*<td>\s*(?<excerpt>[\s\S]*?)<\/td>\s*<td><a href="(?<downloadLink>[^"]+)"/g;

  for (const match of html.matchAll(pattern)) {
    const title = cleanText(match.groups?.title || "");
    const releaseDate = cleanText(match.groups?.releaseDate || "");
    const excerpt = cleanText(match.groups?.excerpt || "");
    const downloadLink = match.groups?.downloadLink || source.url;
    const lastUpdated =
      excerpt.match(/Last updated\s+([A-Za-z]{3,9}\s+\d{1,2}\s+\d{4})/i)?.[1] || releaseDate;

    if (!title) {
      continue;
    }

    items.push(
      buildSourceItem(source, {
        id: `${source.id}-${slugify(title)}`,
        title: `${title} ${releaseDate}`,
        link: downloadLink,
        publishedAt: lastUpdated,
        excerpt,
        categories: ["lammps", "release"]
      })
    );
  }

  return items.slice(0, DEFAULT_SOURCE_LIMIT);
}

function extractOqmdDownloadItems(html, source) {
  const items = [];
  const pattern =
    /<h2>OQMD (?<version>v[\d.]+)<\/h2>\s*(?<body>[\s\S]*?)(?=<h2>OQMD v[\d.]+<\/h2>|<\/div>\s*<\/div>)/g;

  for (const match of html.matchAll(pattern)) {
    const version = cleanText(match.groups?.version || "");
    const body = match.groups?.body || "";
    const excerpt = cleanText(body);
    const link =
      body.match(/href="(?<link>https:\/\/static\.oqmd\.org\/static\/downloads\/[^"]+)"/i)?.groups
        ?.link || source.url;
    const monthLabel =
      body.match(/Database updated on:\s*([A-Za-z]+,\s*\d{4})/i)?.[1] || "";

    if (!version) {
      continue;
    }

    items.push(
      buildSourceItem(source, {
        id: `${source.id}-${slugify(version)}`,
        title: `OQMD ${version} Database Release`,
        link,
        publishedAt: monthLabel,
        excerpt,
        categories: ["oqmd", "database release"]
      })
    );
  }

  return items.slice(0, DEFAULT_SOURCE_LIMIT);
}

function normalisePageTitle(value = "") {
  return cleanText(value).replace(
    /\s+[|鈥?]\s+(?:Google Cloud Blog|Google Cloud|AMD|Cerebras|Groq|Isomorphic Labs|NIST|Quantum Espresso).*$/i,
    ""
  );
}

function cleanSeedExcerpt(value = "") {
  const text = cleanText(value);
  if (!text) {
    return "";
  }

  return /^by\s.+\s+鈥s+\d+-minute read$/i.test(text) ? "" : text;
}

async function enrichCandidatesWithPageMetadata(
  source,
  candidates,
  { limit = DEFAULT_LINK_METADATA_LIMIT, defaultCategories = [] } = {}
) {
  const selected = [];
  const seen = new Set();

  for (const candidate of candidates) {
    const link = new URL(candidate.link, source.url).toString();
    if (seen.has(link)) {
      continue;
    }

    seen.add(link);
    selected.push({
      ...candidate,
      link
    });

    if (selected.length >= limit) {
      break;
    }
  }

  const settled = await Promise.allSettled(
    selected.map(async (candidate) => {
      let title = cleanText(candidate.title || "");
      let excerpt = cleanSeedExcerpt(candidate.excerpt || "");
      let publishedAt = normaliseLooseDate(candidate.publishedAt);

      try {
        const pageHtml = await fetchText(candidate.link, {
          "User-Agent": "AI4S-Digest/1.0 (+https://local.newsletter)"
        });
        const pageTitle = normalisePageTitle(
          extractFirstMatch(pageHtml, [
            /<meta property="og:title" content="([^"]+)"/i,
            /<meta name="twitter:title" content="([^"]+)"/i,
            /<meta name="dcterms\.title" content="([^"]+)"/i,
            /<title>([\s\S]*?)<\/title>/i
          ])
        );
        const pageExcerpt = cleanSeedExcerpt(
          extractFirstMatch(pageHtml, [
            /<meta name="description" content="([^"]+)"/i,
            /<meta property="og:description" content="([^"]+)"/i,
            /<meta name="twitter:description" content="([^"]+)"/i,
            /<meta name="dcterms\.description" content="([^"]+)"/i
          ])
        );
        const pagePublishedAt = normaliseLooseDate(
          extractFirstMatch(pageHtml, [
            /<meta property="article:published_time" content="([^"]+)"/i,
            /<meta name="published_time" content="([^"]+)"/i,
            /<meta name="dcterms\.date" content="([^"]+)"/i,
            /<meta name="dcterms\.created" content="([^"]+)"/i,
            /<meta property="og:updated_time" content="([^"]+)"/i,
            /"datePublished":"([^"]+)"/i,
            /"publishedAt":"([^"]+)"/i,
            /<time[^>]+datetime="([^"]+)"/i
          ])
        );

        title = title || pageTitle;
        excerpt = pageExcerpt || excerpt;
        publishedAt = pagePublishedAt || publishedAt;
      } catch (error) {
        // Fall back to listing metadata when the linked article cannot be fetched.
      }

      if (!title || !candidate.link) {
        return null;
      }

      return buildSourceItem(source, {
        id: `${source.id}-${slugify(candidate.link)}`,
        title,
        link: candidate.link,
        publishedAt,
        excerpt: excerpt || title,
        categories: [...defaultCategories, ...(candidate.categories || [])]
      });
    })
  );

  return settled
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value)
    .slice(0, DEFAULT_SOURCE_LIMIT);
}

function extractOpenCatalystProjectItems(html, source) {
  const items = [];
  const pattern =
    /<p class="mb-0 text-black">(?<date>\d{2}-\d{2}-\d{2})<\/p>[\s\S]*?<p class="my-2 news-copy overflow-hidden"[^>]*>(?<title>[\s\S]*?)<\/p>[\s\S]*?<a[^>]+href="(?<link>[^"]+)"/g;

  for (const match of html.matchAll(pattern)) {
    const title = cleanText(match.groups?.title || "");
    const link = match.groups?.link || source.url;

    if (!title || !link) {
      continue;
    }

    items.push(
      buildSourceItem(source, {
        id: `${source.id}-${slugify(link)}`,
        title,
        link,
        publishedAt: normaliseLooseDate(match.groups?.date || ""),
        excerpt: title,
        categories: ["open catalyst", "catalyst"]
      })
    );
  }

  return items.slice(0, DEFAULT_SOURCE_LIMIT);
}

async function extractIsomorphicLabsNewsItems(html, source) {
  const candidates = [];
  const pattern =
    /<a[^>]+href="(?<link>\/articles\/[^"]+)"[^>]*class="news-card[^"]*"[\s\S]*?<h3[^>]*>(?<title>[\s\S]*?)<\/h3>[\s\S]*?<div class="text-tag-s">(?<date>\d{2}\.\d{2}\.\d{4})<\/div>/g;

  for (const match of html.matchAll(pattern)) {
    candidates.push({
      link: match.groups?.link || "",
      title: match.groups?.title || "",
      publishedAt: match.groups?.date || "",
      categories: ["drug discovery", "isomorphic labs"]
    });
  }

  return enrichCandidatesWithPageMetadata(source, candidates, {
    defaultCategories: ["drug discovery", "isomorphic labs"]
  });
}

function extractCp2kNewsItems(html, source) {
  const items = [];
  const pattern =
    /<h2[^>]*id="(?<id>[^"]+)"[^>]*>(?<title>[\s\S]*?)<\/h2>\s*<div class="level2">\s*<p>(?<excerpt>[\s\S]*?)<\/p>/g;

  for (const match of html.matchAll(pattern)) {
    const title = cleanText(match.groups?.title || "");
    const excerpt = cleanText(match.groups?.excerpt || "");
    const dateText = title.match(/\(([^()]+\d{4})\)/)?.[1] || "";
    const releaseLink =
      excerpt.match(/href="(?<link>https:\/\/[^"]+)"/i)?.groups?.link ||
      `https://www.cp2k.org/news#${match.groups?.id || ""}`;

    if (!title) {
      continue;
    }

    items.push(
      buildSourceItem(source, {
        id: `${source.id}-${slugify(releaseLink)}`,
        title,
        link: releaseLink,
        publishedAt: normaliseLooseDate(dateText),
        excerpt,
        categories: ["cp2k", "release"]
      })
    );
  }

  return items.slice(0, DEFAULT_SOURCE_LIMIT);
}

function extractAseReleaseNotesItems(html, source) {
  const items = [];
  const pattern =
    /<section id="(?<id>version-[^"]+)">[\s\S]*?<h2>(?<title>[\s\S]*?)<a class="headerlink"[\s\S]*?<\/h2>\s*<p>(?<date>[^:]+):\s*<a[^>]+href="(?<link>[^"]+)"[^>]*>[\s\S]*?<\/a><\/p>\s*<p>(?<excerpt>[\s\S]*?)<\/p>/g;

  for (const match of html.matchAll(pattern)) {
    const title = cleanText(match.groups?.title || "");
    const link = match.groups?.link || `https://wiki.fysik.dtu.dk/ase/releasenotes.html#${match.groups?.id || ""}`;

    if (!title) {
      continue;
    }

    items.push(
      buildSourceItem(source, {
        id: `${source.id}-${slugify(link)}`,
        title,
        link,
        publishedAt: normaliseLooseDate(match.groups?.date || ""),
        excerpt: cleanText(match.groups?.excerpt || ""),
        categories: ["ase", "release notes"]
      })
    );
  }

  return items.slice(0, DEFAULT_SOURCE_LIMIT);
}

async function extractGoogleCloudComputeItems(html, source) {
  const candidates = [];
  const pattern =
    /<a href="(?<link>https:\/\/cloud\.google\.com\/blog\/products\/compute\/[^"]+)" class="w7DBpd"[\s\S]*?<h5[^>]*>(?<title>[\s\S]*?)<\/h5>[\s\S]*?<p class="nRhiJb-cHYyed gh5m8">(?<excerpt>[\s\S]*?)<\/p>/g;

  for (const match of html.matchAll(pattern)) {
    candidates.push({
      link: match.groups?.link || "",
      title: match.groups?.title || "",
      excerpt: match.groups?.excerpt || "",
      categories: ["google cloud", "compute"]
    });
  }

  return enrichCandidatesWithPageMetadata(source, candidates, {
    defaultCategories: ["google cloud", "compute"]
  });
}

async function extractAmdAiBlogItems(html, source) {
  const candidates = [];
  const seen = new Set();

  for (const match of html.matchAll(/https:\/\/www\.amd\.com\/en\/blogs\/\d{4}\/[^"]+\.html/g)) {
    const link = match[0];
    if (seen.has(link)) {
      continue;
    }

    seen.add(link);
    candidates.push({
      link,
      categories: ["amd", "accelerator"]
    });
  }

  return enrichCandidatesWithPageMetadata(source, candidates, {
    defaultCategories: ["amd", "accelerator"]
  });
}

async function extractCerebrasBlogItems(html, source) {
  const candidates = [];
  const pattern =
    /<a[^>]+href="(?<link>\/blog\/[^"]+)"[^>]*>[\s\S]*?<h3[^>]*>(?<title>[\s\S]*?)<\/h3><p[^>]*font-semibold uppercase font-mono[^>]*>(?<date>[\s\S]*?)<\/p>/g;

  for (const match of html.matchAll(pattern)) {
    candidates.push({
      link: match.groups?.link || "",
      title: match.groups?.title || "",
      publishedAt: match.groups?.date || "",
      categories: ["cerebras", "inference"]
    });
  }

  return enrichCandidatesWithPageMetadata(source, candidates, {
    defaultCategories: ["cerebras", "inference"]
  });
}

async function extractGroqNewsroomItems(html, source) {
  const candidates = [];
  const pattern =
    /<article class="card u-link-reset"[\s\S]*?<time dateTime="(?<date>[^"]+)"[^>]*>[\s\S]*?<\/time>[\s\S]*?<h2[^>]*>\s*<a href="(?<link>\/newsroom\/[^"]+)">(?<title>[\s\S]*?)<\/a>/g;

  for (const match of html.matchAll(pattern)) {
    candidates.push({
      link: match.groups?.link || "",
      title: match.groups?.title || "",
      publishedAt: match.groups?.date || "",
      categories: ["groq", "inference"]
    });
  }

  return enrichCandidatesWithPageMetadata(source, candidates, {
    defaultCategories: ["groq", "inference"]
  });
}

async function extractNistMagneticsItems(html, source) {
  const candidates = [];
  const pattern =
    /<a href="(?<link>\/news-events\/news\/\d{4}\/\d{2}\/[^"]+)">[\s\S]*?<h3><span[^>]*>(?<title>[\s\S]*?)<\/span>\s*<\/h3>[\s\S]*?<div[^>]*class="text-with-summary">(?<excerpt>[\s\S]*?)<\/div>/g;

  for (const match of html.matchAll(pattern)) {
    candidates.push({
      link: match.groups?.link || "",
      title: match.groups?.title || "",
      excerpt: match.groups?.excerpt || "",
      categories: ["magnetics", "nist"]
    });
  }

  return enrichCandidatesWithPageMetadata(source, candidates, {
    defaultCategories: ["magnetics", "nist"]
  });
}

function extractFirstMatch(text, patterns = []) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return cleanText(match.groups?.value || match[1] || match[0]);
    }
  }

  return "";
}

async function fetchJson(url) {
  const headers = {
    "User-Agent": "AI4S-Digest/1.0 (+https://local.newsletter)",
    Accept: "application/vnd.github+json"
  };

  if (process.env.GITHUB_TOKEN?.trim()) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN.trim()}`;
  }

  const text = await fetchText(url, headers);
  return JSON.parse(text);
}

async function fetchText(url, headers) {
  let lastError;

  for (let attempt = 0; attempt <= FETCH_RETRY_COUNT; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers,
        redirect: "follow",
        signal: controller.signal
      });

      if (!response.ok) {
        const error = new Error(`Request failed with ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return response.text();
    } catch (error) {
      lastError = error;
      if (attempt === FETCH_RETRY_COUNT || !shouldRetryFetch(error)) {
        throw error;
      }

      await sleep(400 * (attempt + 1));
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

function scoreCommitImpact(text, patterns) {
  const haystack = cleanText(text).toLowerCase();
  return patterns.reduce((count, pattern) => count + (pattern.test(haystack) ? 1 : 0), 0);
}

function isHighImpactCommit(title, excerpt = "") {
  const combinedText = `${title} ${excerpt}`;
  const strongImpactScore = scoreCommitImpact(combinedText, [
    /\brelease\b/,
    /\bbreaking\b/,
    /\bmajor\b/,
    /\bbenchmark\b/,
    /\bperformance\b/,
    /\bthroughput\b/,
    /\blatency\b/,
    /\bgpu\b/,
    /\bcuda\b/,
    /\bparallel\b/,
    /\bdistributed\b/,
    /\bscal(?:ing|ability|e[- ]?out|e[- ]?up)\b/i,
    /\baccelerat/i
  ]);
  const weakImpactScore = scoreCommitImpact(combinedText, [
    /\bmemory\b/,
    /\bprecision\b/,
    /\bfp16\b/,
    /\bfp32\b/,
    /\bbf16\b/
  ]);
  const isRoutineCommit = /^(fix|feat|chore|docs|test|ci|build|style|refactor|merge pull request|merge branch|revert)\b/i.test(
    cleanText(title)
  );

  if (strongImpactScore === 0 && weakImpactScore === 0) {
    return false;
  }

  if (isRoutineCommit) {
    return strongImpactScore > 0;
  }

  if (strongImpactScore === 0 && weakImpactScore < 2) {
    return false;
  }

  return true;
}

function isHighImpactRelease(source, title, excerpt = "") {
  const normalizedTitle = cleanText(title);
  const text = cleanText(`${title} ${excerpt}`).toLowerCase();
  const hasFrontierKeyword =
    /\b(model|reasoning|multimodal|vision|audio|agent|gemma|gemini|llama|grok|claude|qwen|mistral|checkpoint|api)\b/i.test(
      text
    );
  const looksLikeSdkVersion =
    /^(python|sdk|client)\b/i.test(normalizedTitle) ||
    /^(release\s+)?v?\d+\.\d+\.\d+/i.test(normalizedTitle);
  const looksLikeRoutineRelease =
    looksLikeSdkVersion ||
    /^(fix|feat|chore|docs|test|ci|build|refactor|perf)\b/i.test(normalizedTitle) ||
    /\b(dependency|dependencies|deps|maintenance|patch|bugfix|changelog)\b/i.test(text);

  if (
    source.id === "mistral-news" ||
    source.id === "xai-sdk-releases" ||
    source.id === "meta-llama-releases" ||
    source.id === "huggingface-transformers-releases"
  ) {
    return hasFrontierKeyword && !looksLikeRoutineRelease;
  }

  return true;
}

function shouldRetryFetch(error) {
  if (!error) {
    return false;
  }

  if (typeof error.status === "number") {
    return error.status === 429 || error.status >= 500;
  }

  const message = String(error.message || "").toLowerCase();
  return (
    message.includes("fetch failed") ||
    message.includes("timed out") ||
    message.includes("aborted") ||
    message.includes("econnreset") ||
    message.includes("enotfound")
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


