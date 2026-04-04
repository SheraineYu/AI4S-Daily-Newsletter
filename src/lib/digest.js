import Parser from "rss-parser";
import { NEWS_SOURCES, TOPICS } from "../config/topics.js";

const parser = new Parser();

const CACHE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_NEWS_LIMIT = 5;
const DEFAULT_PAPER_LIMIT = 5;
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

function normaliseDate(value) {
  const time = value ? Date.parse(value) : NaN;
  return Number.isNaN(time) ? null : new Date(time).toISOString();
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
  const haystack = cleanText(
    [
      item.title,
      item.contentSnippet,
      item.summary,
      item.content,
      item.excerpt,
      item.categories?.join(" ")
    ]
      .filter(Boolean)
      .join(" ")
  ).toLowerCase();

  let score = 0;
  for (const keyword of keywords) {
    if (haystack.includes(keyword.toLowerCase())) {
      score += keyword.length > 8 ? 2 : 1;
    }
  }

  return score;
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
      score: scoreByKeywords(item, topic.paperKeywords || topic.newsKeywords)
    }));

  const filtered = sortByScoreThenTime(ranked).filter((item) => item.score > 0);
  return (filtered.length ? filtered : ranked).slice(0, limit);
}

function selectNewsForTopic(topic, corpus, limit = DEFAULT_NEWS_LIMIT) {
  const ranked = corpus
    .map((item) => ({
      ...item,
      score: scoreByKeywords(item, topic.newsKeywords)
    }))
    .filter((item) => item.score > 0);

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

    if (topic.news.length) {
      lines.push("News:");
      topic.news.forEach((item) => {
        lines.push(`- ${item.title}`);
        lines.push(`  ${item.source} | ${item.publishedAt || "Unknown date"}`);
        lines.push(`  ${item.link}`);
      });
    }

    if (topic.papers.length) {
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
  const sections = payload.topics
    .map((topic) => {
      const news = topic.news
        .map(
          (item) =>
            `<li><a href="${item.link}">${item.title}</a><br><small>${item.source} | ${item.publishedAt || "Unknown date"}</small></li>`
        )
        .join("");

      const papers = topic.papers
        .map(
          (item) =>
            `<li><a href="${item.link}">${item.title}</a><br><small>${item.source} | ${item.publishedAt || "Unknown date"}</small></li>`
        )
        .join("");

      return `
        <section style="margin-bottom:24px;">
          <h2 style="margin:0 0 8px;color:${topic.accent};font-family:Arial,sans-serif;">${topic.title}</h2>
          <p style="margin:0 0 12px;color:#444;font-family:Arial,sans-serif;">${topic.description}</p>
          <div style="margin-bottom:10px;">
            <strong>News</strong>
            <ul>${news || "<li>No news matched today.</li>"}</ul>
          </div>
          <div>
            <strong>Papers</strong>
            <ul>${papers || "<li>No papers matched today.</li>"}</ul>
          </div>
        </section>
      `;
    })
    .join("");

  return `
    <div style="max-width:860px;margin:0 auto;padding:24px;background:#fcfaf6;">
      <h1 style="font-family:Arial,sans-serif;margin:0 0 8px;">AI4S Daily Digest</h1>
      <p style="font-family:Arial,sans-serif;color:#555;margin:0 0 24px;">Generated at ${payload.generatedAt}</p>
      ${sections}
    </div>
  `;
}

export async function buildDigest({ force = false } = {}) {
  const now = Date.now();
  if (!force && digestCache.payload && now - digestCache.generatedAt < CACHE_TTL_MS) {
    return digestCache.payload;
  }

  const { items: corpus, failures } = await fetchNewsCorpus();
  const paperResults = await Promise.allSettled(TOPICS.map((topic) => fetchArxivPapers(topic)));

  const topics = TOPICS.map((topic, index) => {
    const paperResult = paperResults[index];
    const papers = paperResult.status === "fulfilled" ? paperResult.value : [];

    if (paperResult.status === "rejected") {
      failures.push({
        source: `${topic.title} arXiv query`,
        message: paperResult.reason?.message || "Paper fetch failed"
      });
    }

    return {
      ...topic,
      news: selectNewsForTopic(topic, corpus),
      papers
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
