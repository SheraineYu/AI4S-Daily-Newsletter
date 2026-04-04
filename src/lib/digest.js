import Parser from "rss-parser";
import { NEWS_SOURCES, TOPICS } from "../config/topics.js";

const parser = new Parser();

const CACHE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_NEWS_LIMIT = 5;
const DEFAULT_PAPER_LIMIT = 5;
const DEFAULT_IDEA_LIMIT = 3;
const DEFAULT_SOURCE_LIMIT = 40;
const FETCH_TIMEOUT_MS = 20000;

let digestCache = {
  generatedAt: 0,
  payload: null
};

function cleanText(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
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

function formatDigestDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai"
  }).format(date);
}

function trimText(value = "", limit = 120) {
  return value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
}

function listToSentence(items = []) {
  if (!items.length) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]}、${items[1]}`;
  }

  return `${items.slice(0, -1).join("、")}、${items.at(-1)}`;
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
    item.description
  ];

  for (const candidate of candidates) {
    const text = cleanText(candidate);
    if (text) {
      return text.slice(0, 280);
    }
  }

  return "";
}

function scoreByKeywords(item, keywords = []) {
  const title = cleanText(item.title || "").toLowerCase();
  const excerpt = cleanText(
    [item.contentSnippet, item.summary, item.content, item.excerpt]
      .filter(Boolean)
      .join(" ")
  ).toLowerCase();
  const categories = cleanText(item.categories?.join(" ") || "").toLowerCase();

  let score = 0;
  let titleHits = 0;
  let categoryHits = 0;
  let bodyHits = 0;

  for (const keyword of keywords) {
    const needle = keyword.toLowerCase();

    if (title.includes(needle)) {
      titleHits += 1;
      score += needle.length > 8 ? 4 : 3;
      continue;
    }

    if (categories.includes(needle)) {
      categoryHits += 1;
      score += needle.length > 8 ? 3 : 2;
      continue;
    }

    if (excerpt.includes(needle)) {
      bodyHits += 1;
      score += needle.length > 8 ? 2 : 1;
    }
  }

  return {
    score,
    titleHits,
    categoryHits,
    bodyHits,
    strongMatch: titleHits > 0 || categoryHits > 0 || bodyHits > 1
  };
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

function sortByScoreThenTime(items) {
  return items.sort((left, right) => {
    const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : 0;
    const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : 0;
    return right.score - left.score || rightTime - leftTime;
  });
}

function filterCorpusForTopic(topic, corpus) {
  return corpus.filter((item) => {
    if (topic.allowedSourceTypes?.length && !topic.allowedSourceTypes.includes(item.sourceType)) {
      return false;
    }

    if (topic.sourceIds?.length && !topic.sourceIds.includes(item.sourceId)) {
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

function buildTopicAnalysis(topic, news, papers) {
  const visiblePapers = topic.showPapers === false ? [] : papers;
  const allSignals = [...news, ...visiblePapers];
  const sourceLabels = summariseTopSources(allSignals);
  const sourceSummary = sourceLabels.length
    ? `${listToSentence(sourceLabels)}`
    : "当前抓取到的有效来源";
  const headlineSummary = allSignals
    .slice(0, 3)
    .map((item) => `《${trimText(item.title, 58)}》`);
  const evidenceText = headlineSummary.length
    ? `当前最强信号集中在 ${listToSentence(headlineSummary)}。`
    : "今天还没有抓到足够强的高相关信号。";

  const countParts = [];
  if (news.length) {
    countParts.push(`${news.length} 条新闻`);
  }
  if (visiblePapers.length) {
    countParts.push(`${visiblePapers.length} 篇论文`);
  }

  const activityText = countParts.length
    ? `今天收录了 ${listToSentence(countParts)}，主要来源于 ${sourceSummary}。`
    : `今天相关条目较少，建议把这个专题当作弱信号观察位，而不是立即下判断。`;

  const sourceTypeCounts = allSignals.reduce(
    (counts, item) => {
      counts[item.sourceType] = (counts[item.sourceType] || 0) + 1;
      return counts;
    },
    {}
  );

  let warning = topic.warningFocus;
  if (!visiblePapers.length && news.length) {
    warning += " 今天偏新闻驱动，结论要等论文、基准或代码结果进一步验证。";
  } else if (!news.length && visiblePapers.length) {
    warning += " 今天偏论文驱动，距离产业落地或真实工作流验证通常还有时滞。";
  } else if ((sourceTypeCounts.software || 0) >= 2) {
    warning += " 当前有明显的软件栈更新信号，但工程提交不等于下游效果已经稳定成立。";
  } else if (sourceLabels.length === 1) {
    warning += " 当前信号集中在单一来源，注意来源偏差。";
  }

  return {
    summary: `值得关注方向：${listToSentence(topic.focusAreas || [])}。${activityText} ${evidenceText}`.trim(),
    warning,
    ideas: (topic.ideaPrompts || []).slice(0, DEFAULT_IDEA_LIMIT)
  };
}

async function parseFeed(source) {
  if (source.kind === "github-commits") {
    return fetchGithubCommits(source);
  }

  const feed = await fetchAndParseXml(source.url);
  return (feed.items || [])
    .slice(0, DEFAULT_SOURCE_LIMIT)
    .map((item) => ({
      id: `${source.id}-${slugify(item.id || item.guid || item.link || item.title)}`,
      title: cleanText(item.title || "Untitled"),
      link: item.link || "",
      sourceId: source.id,
      source: source.label,
      sourceType: source.type,
      publishedAt: normaliseDate(
        item.isoDate || item.pubDate || item.published || item.updated
      ),
      excerpt: buildExcerpt(item),
      categories: Array.isArray(item.categories) ? item.categories : []
    }))
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
      max_results: String(limit * 3),
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
      sourceType: "paper",
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
      ...scoreByKeywords(item, topic.paperKeywords || topic.newsKeywords)
    }));

  const filtered = sortByScoreThenTime(ranked).filter(
    (item) => item.score > 0 && item.strongMatch
  );
  return (filtered.length ? filtered : ranked).slice(0, limit);
}

function selectNewsForTopic(topic, corpus, limit = DEFAULT_NEWS_LIMIT) {
  const ranked = filterCorpusForTopic(topic, corpus)
    .map((item) => ({
      ...item,
      ...scoreByKeywords(item, topic.newsKeywords)
    }))
    .filter((item) => item.score > 0 && item.strongMatch);

  return uniqueByLink(sortByScoreThenTime(ranked)).slice(0, limit);
}

function buildOverview(topics) {
  return {
    totalTopics: topics.length,
    newsCount: topics.reduce((sum, topic) => sum + topic.news.length, 0),
    paperCount: topics.reduce((sum, topic) => sum + topic.papers.length, 0),
    sourceCount: NEWS_SOURCES.length
  };
}

export function renderPlaintextDigest(payload) {
  const lines = ["AI4S Daily Digest", `Generated: ${payload.generatedAt}`, ""];

  payload.topics.forEach((topic) => {
    lines.push(topic.title);
    lines.push(topic.description);
    lines.push(`Briefing: ${topic.analysis.summary}`);
    lines.push(`Warning: ${topic.analysis.warning}`);

    if (topic.analysis.ideas.length) {
      lines.push("Ideas:");
      topic.analysis.ideas.forEach((idea) => {
        lines.push(`- ${idea}`);
      });
    }

    if (topic.news.length) {
      lines.push("News:");
      topic.news.forEach((item) => {
        lines.push(`- ${item.title}`);
        lines.push(`  ${item.source} | ${item.publishedAt || "Unknown date"}`);
        lines.push(`  ${item.link}`);
      });
    }

    if (topic.showPapers !== false && topic.papers.length) {
      lines.push("Papers:");
      topic.papers.forEach((item) => {
        lines.push(`- ${item.title}`);
        lines.push(`  ${item.source} | ${item.publishedAt || "Unknown date"}`);
        lines.push(`  ${item.link}`);
      });
    }

    lines.push("");
  });

  if (payload.failures.length) {
    lines.push("Unavailable sources:");
    payload.failures.forEach((failure) => {
      lines.push(`- ${failure.source}: ${failure.message}`);
    });
  }

  return lines.join("\n");
}

export function renderHtmlDigest(payload) {
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
                  ${escapeHtml(item.source)} | ${escapeHtml(formatDigestDate(item.publishedAt))}
                </div>
                <div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.45;font-weight:700;color:#101b2d;">
                  ${escapeHtml(item.title)}
                </div>
                <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#56677f;margin-top:10px;">
                  ${escapeHtml(item.excerpt || "Open the original link for more detail.")}
                </div>
                <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${accent};margin-top:12px;">
                  Open link
                </div>
              </a>
            </td>
          </tr>
        `
      )
      .join("");
  };

  const sections = payload.topics
    .map(
      (topic) => `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid #dde6f2;border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:22px 22px 18px;background:linear-gradient(180deg, rgba(13,24,40,0.02), rgba(13,24,40,0));">
              <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${topic.accent};margin-bottom:10px;">
                ${escapeHtml(topic.badge)}
              </div>
              <div style="font-family:Arial,sans-serif;font-size:24px;line-height:1.15;font-weight:700;color:#101b2d;margin-bottom:10px;">
                ${escapeHtml(topic.title)}
              </div>
              <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.65;color:#56677f;">
                ${escapeHtml(topic.description)}
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;border-collapse:separate;border-spacing:0;">
                <tr>
                  <td style="padding:0 0 12px;">
                    <div style="border:1px solid #dce6f3;border-radius:18px;padding:16px;background:#f7fbff;">
                      <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${topic.accent};margin-bottom:8px;">
                        Briefing
                      </div>
                      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#405067;">
                        ${escapeHtml(topic.analysis.summary)}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;">
                      <tr>
                        <td style="padding:0 10px 0 0;vertical-align:top;">
                          <div style="height:100%;border:1px solid #f2d7cf;border-radius:18px;padding:16px;background:#fff7f4;">
                            <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#c25c43;margin-bottom:8px;">
                              Warning
                            </div>
                            <div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#7a4b3f;">
                              ${escapeHtml(topic.analysis.warning)}
                            </div>
                          </div>
                        </td>
                        <td style="padding:0;vertical-align:top;">
                          <div style="height:100%;border:1px solid #dbe6f6;border-radius:18px;padding:16px;background:#f9fbfe;">
                            <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#4d6ea8;margin-bottom:8px;">
                              Ideas
                            </div>
                            <div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#50617a;">
                              ${(topic.analysis.ideas || [])
                                .map((idea) => `• ${escapeHtml(idea)}`)
                                .join("<br>")}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>
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
                    <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#101b2d;">News</div>
                    <div style="font-family:Arial,sans-serif;font-size:12px;color:#7a8aa0;">latest updates</div>
                  </td>
                </tr>
                ${renderCardList(topic.news, topic.accent, "No matched news items for this topic right now.")}
                ${
                  topic.showPapers === false
                    ? ""
                    : `
                      <tr>
                        <td style="padding:8px 0 10px;">
                          <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#101b2d;">Papers</div>
                          <div style="font-family:Arial,sans-serif;font-size:12px;color:#7a8aa0;">latest research</div>
                        </td>
                      </tr>
                      ${renderCardList(topic.papers, topic.accent, "No papers returned for this topic right now.")}
                    `
                }
              </table>
            </td>
          </tr>
        </table>
      `
    )
    .join("");

  const failures = payload.failures.length
    ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;border-collapse:separate;border-spacing:0;background:#fff7f4;border:1px solid #f1d3cb;border-radius:20px;overflow:hidden;">
        <tr>
          <td style="padding:18px 20px;">
            <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#8e4635;margin-bottom:8px;">Unavailable sources</div>
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
                    Daily research monitoring
                  </div>
                  <div style="font-family:Arial,sans-serif;font-size:34px;line-height:1.05;font-weight:700;color:#f7fbff;margin-bottom:14px;">
                    AI4S Daily Digest
                  </div>
                  <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#d6e6ff;max-width:720px;">
                    A compact briefing for AI4S, frontier models, agents, atomistic simulation, and hardware systems.
                  </div>
                  <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:18px;border-collapse:collapse;">
                    <tr>
                      <td style="padding:0 10px 10px 0;">
                        <div style="min-width:110px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,0.08);font-family:Arial,sans-serif;">
                          <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#b2ccf3;">Topics</div>
                          <div style="font-size:24px;font-weight:700;color:#ffffff;">${payload.overview.totalTopics}</div>
                        </div>
                      </td>
                      <td style="padding:0 10px 10px 0;">
                        <div style="min-width:110px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,0.08);font-family:Arial,sans-serif;">
                          <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#b2ccf3;">News</div>
                          <div style="font-size:24px;font-weight:700;color:#ffffff;">${payload.overview.newsCount}</div>
                        </div>
                      </td>
                      <td style="padding:0 10px 10px 0;">
                        <div style="min-width:110px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,0.08);font-family:Arial,sans-serif;">
                          <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#b2ccf3;">Papers</div>
                          <div style="font-size:24px;font-weight:700;color:#ffffff;">${payload.overview.paperCount}</div>
                        </div>
                      </td>
                      <td style="padding:0 0 10px 0;">
                        <div style="min-width:110px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,0.08);font-family:Arial,sans-serif;">
                          <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#b2ccf3;">Generated</div>
                          <div style="font-size:14px;font-weight:700;color:#ffffff;line-height:1.45;">${escapeHtml(formatDigestDate(payload.generatedAt))}</div>
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

export async function buildDigest({ force = false } = {}) {
  const now = Date.now();
  if (!force && digestCache.payload && now - digestCache.generatedAt < CACHE_TTL_MS) {
    return digestCache.payload;
  }

  const { items: corpus, failures } = await fetchNewsCorpus();
  const paperResults = await Promise.allSettled(
    TOPICS.map((topic) => fetchArxivPapers(topic, topic.paperLimit || DEFAULT_PAPER_LIMIT))
  );

  const topics = TOPICS.map((topic, index) => {
    const paperResult = paperResults[index];
    const papers = paperResult.status === "fulfilled" ? paperResult.value : [];

    if (paperResult.status === "rejected" && topic.showPapers !== false) {
      failures.push({
        source: `${topic.title} arXiv query`,
        message: paperResult.reason?.message || "Paper fetch failed"
      });
    }

    const news = selectNewsForTopic(topic, corpus, topic.newsLimit || DEFAULT_NEWS_LIMIT);
    const analysis = buildTopicAnalysis(topic, news, papers);

    return {
      ...topic,
      news,
      papers,
      analysis
    };
  });

  const payload = {
    generatedAt: new Date().toISOString(),
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
  return items.slice(0, DEFAULT_SOURCE_LIMIT).map((item) => ({
    id: `${source.id}-${item.sha}`,
    title: cleanText(item.commit?.message?.split("\n")[0] || "Commit update"),
    link: item.html_url || "",
    sourceId: source.id,
    source: source.label,
    sourceType: source.type,
    publishedAt: normaliseDate(
      item.commit?.author?.date || item.commit?.committer?.date
    ),
    excerpt: cleanText(item.commit?.message || ""),
    categories: []
  }));
}

async function fetchJson(url) {
  const text = await fetchText(url, {
    "User-Agent": "AI4S-Digest/1.0 (+https://local.newsletter)",
    Accept: "application/vnd.github+json"
  });
  return JSON.parse(text);
}

async function fetchText(url, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers,
      redirect: "follow",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timer);
  }
}
