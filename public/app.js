const generatedAtEl = document.getElementById("generatedAt");
const topicCountEl = document.getElementById("topicCount");
const newsCountEl = document.getElementById("newsCount");
const paperCountEl = document.getElementById("paperCount");
const sourceCountEl = document.getElementById("sourceCount");
const topicGridEl = document.getElementById("topicGrid");
const failuresSectionEl = document.getElementById("failuresSection");
const failuresListEl = document.getElementById("failuresList");
const refreshButton = document.getElementById("refreshButton");
const copyMailButton = document.getElementById("copyMailButton");
const copyHtmlButton = document.getElementById("copyHtmlButton");
const toastEl = document.getElementById("toast");
const topicTemplate = document.getElementById("topicTemplate");
const itemTemplate = document.getElementById("itemTemplate");
const localeButtons = document.querySelectorAll(".locale-toggle__button");
const coverageListEl = document.getElementById("coverageList");
const principlesListEl = document.getElementById("principlesList");
const deliveryListEl = document.getElementById("deliveryList");

const UI_COPY = {
  zh: {
    heroEyebrow: "精选日报",
    heroTitle: "AI4S Daily Newsletter",
    heroText:
      "面向前沿大模型、AI4S、原子尺度模拟、硬件系统与全球重要事件的高信号每日简报。",
    refresh: "刷新简报",
    refreshing: "刷新中...",
    loading: "加载中...",
    copyPlain: "复制纯文本邮件",
    copyHtml: "复制 HTML 邮件",
    lastUpdated: "最后更新",
    topics: "专题",
    news: "新闻",
    papers: "论文",
    feeds: "信源",
    modeLabel: "编辑模式",
    modeValue: "高信号精选",
    deliveryLabel: "交付方式",
    deliveryValue: "网页与每日邮件",
    statusNote:
      "官方公告、近期论文与高影响力动态会统一排序，常规 commit 与过期内容会被过滤。",
    coverageEyebrow: "覆盖范围",
    coverageTitle: "一份简报覆盖七类重点主题",
    coverageText:
      "把前沿模型发布、AI4S 论文、原子模拟方法、硬件演进与全球宏观事件收敛到同一阅读入口。",
    coverageItems: [
      "前沿大模型与官方发布",
      "AI4S / Scientific ML / Agent 研究",
      "DFT、LAMMPS、ABACUS 与材料计算",
      "全球金融、科技、政治与军事高影响事件"
    ],
    principlesEyebrow: "编辑原则",
    principlesTitle: "近期、重要、可行动",
    principlesText:
      "默认聚焦最近七天，优先官方公告、强研究信号与值得跟进的实质性变化。",
    principlesItems: [
      "优先官方源、权威媒体与近期论文",
      "过滤 routine commit、低价值版本噪声与过旧内容",
      "每个 topic 提供 importance、confidence、why-it-matters、next-step 分析",
      "Global Watchlist 只保留真正值得关注的宏观事件"
    ],
    deliveryEyebrow: "交付方式",
    deliveryTitle: "网页可读，邮件可直接分发",
    deliveryText:
      "同一份 digest 同时驱动 Web UI、卡片式 HTML 邮件与 GitHub Actions 的每日自动发送。",
    deliveryItems: [
      "网页支持中英文切换与快速刷新",
      "邮件采用卡片式链接与主题分组",
      "GitHub Actions 每天自动生成并投递",
      "本地与 Cloud 环境都可继续扩展筛选逻辑"
    ],
    scopeEyebrow: "今日简报",
    scopeTitle: "按主题整理的当前重点",
    failuresEyebrow: "信源状态",
    failuresTitle: "暂时不可用的来源",
    importance: "重要性",
    confidence: "置信度",
    whyItMatters: "为何重要",
    nextStep: "下一步",
    official: "官方",
    newsSubnote: "最新动态",
    papersSubnote: "最新研究",
    openLink: "打开链接",
    noNews: "当前没有符合筛选条件的新闻。",
    noPapers: "当前没有符合筛选条件的论文。",
    newsOnly: "仅新闻",
    loadingDigest: "简报已加载。",
    refreshedDigest: "简报已刷新。",
    copiedPlain: "纯文本邮件已复制。",
    copiedHtml: "HTML 邮件已复制。",
    unknownDate: "未知时间",
    newsCount: (count) => `${count} 条新闻`,
    paperCount: (count) => `${count} 篇论文`
  },
  en: {
    heroEyebrow: "Curated daily brief",
    heroTitle: "AI4S Daily Newsletter",
    heroText:
      "A high-signal daily brief across frontier models, AI4S, atomistic simulation, hardware systems, and globally important developments.",
    refresh: "Refresh brief",
    refreshing: "Refreshing...",
    loading: "Loading...",
    copyPlain: "Copy text email",
    copyHtml: "Copy HTML email",
    lastUpdated: "Last updated",
    topics: "Topics",
    news: "News",
    papers: "Papers",
    feeds: "Sources",
    modeLabel: "Editorial mode",
    modeValue: "High-signal curation",
    deliveryLabel: "Delivery",
    deliveryValue: "Web and daily email",
    statusNote:
      "Official posts, recent papers, and high-impact updates are ranked together. Routine commits and stale items are filtered out.",
    coverageEyebrow: "Coverage",
    coverageTitle: "One brief across seven high-priority domains",
    coverageText:
      "Frontier model launches, AI4S papers, atomistic methods, hardware shifts, and global macro events are tracked in one place.",
    coverageItems: [
      "Frontier models and official product releases",
      "AI4S, scientific ML, and agent workflows",
      "DFT, LAMMPS, ABACUS, and atomistic computing",
      "High-impact finance, technology, politics, and defense signals"
    ],
    principlesEyebrow: "Editorial principles",
    principlesTitle: "Recent, material, and decision-oriented",
    principlesText:
      "The newsletter focuses on the last seven days, favors primary sources, and surfaces only changes worth monitoring or acting on.",
    principlesItems: [
      "Official sources, trusted media, and fresh papers are prioritized",
      "Routine commits, low-signal release noise, and stale items are excluded",
      "Each topic includes importance, confidence, why-it-matters, and next-step analysis",
      "The global watchlist is reserved for events with real strategic weight"
    ],
    deliveryEyebrow: "Delivery",
    deliveryTitle: "Readable on the web and ready for the inbox",
    deliveryText:
      "The same digest powers the web UI, a card-based HTML email, and daily delivery through GitHub Actions.",
    deliveryItems: [
      "Bilingual web view with quick refresh",
      "Card-style email layout grouped by topic",
      "Daily automation through GitHub Actions",
      "Local and cloud workflows remain easy to extend"
    ],
    scopeEyebrow: "Today's brief",
    scopeTitle: "Current coverage by topic",
    failuresEyebrow: "Source status",
    failuresTitle: "Unavailable sources",
    importance: "Importance",
    confidence: "Confidence",
    whyItMatters: "Why It Matters",
    nextStep: "Next Step",
    official: "Official",
    newsSubnote: "latest updates",
    papersSubnote: "latest research",
    openLink: "Open link",
    noNews: "No matched news items for this topic right now.",
    noPapers: "No matched papers for this topic right now.",
    newsOnly: "news only",
    loadingDigest: "Brief loaded.",
    refreshedDigest: "Brief refreshed.",
    copiedPlain: "Text email copied.",
    copiedHtml: "HTML email copied.",
    unknownDate: "Unknown date",
    newsCount: (count) => `${count} news items`,
    paperCount: (count) => `${count} papers`
  }
};

const SOURCE_SHORT_LABELS = {
  "OpenAI News": "OpenAI",
  "Anthropic Newsroom": "Anthropic",
  "Google AI Blog": "Google AI",
  "Google Developers & Gemma": "Google Developers",
  "Google DeepMind Blog": "DeepMind",
  "Mistral AI Releases": "Mistral",
  "Meta Llama Releases": "Meta Llama",
  "xAI SDK Releases": "xAI",
  "Hugging Face Transformers Releases": "Hugging Face",
  "NVIDIA Blog": "NVIDIA",
  "TechCrunch AI": "TechCrunch",
  "VentureBeat AI": "VentureBeat",
  "MarkTechPost": "MarkTechPost",
  "The Verge": "The Verge",
  "CNBC Top News": "CNBC",
  "CNBC Business": "CNBC",
  "CNBC Tech": "CNBC",
  "NPR News": "NPR",
  "NPR Politics": "NPR",
  "NPR Business": "NPR",
  "NPR Economy": "NPR",
  "Sky News World": "Sky News",
  "Sky News Politics": "Sky News",
  "Sky News Technology": "Sky News",
  "POLITICO Politics": "POLITICO",
  "Defense News": "Defense News",
  "Defense One": "Defense One",
  "WSJ World News": "WSJ",
  "WSJ Business": "WSJ",
  "MarketWatch Top Stories": "MarketWatch",
  "UN News": "UN",
  "DeepModeling ABACUS News": "ABACUS",
  "LAMMPS Releases": "LAMMPS",
  "Materials Project Database Versions": "Materials Project",
  "OQMD Database Releases": "OQMD",
  "Psi-k Announcements": "Psi-k"
};

let currentLocale = window.localStorage.getItem("digest-locale") === "en" ? "en" : "zh";
let currentPayload = null;

function getCopy() {
  return UI_COPY[currentLocale];
}

function getLocalized(value) {
  if (value && typeof value === "object" && ("en" in value || "zh" in value)) {
    return value[currentLocale] || value.en || value.zh || "";
  }

  return value;
}

function showToast(message) {
  toastEl.textContent = message;
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toastEl.textContent = "";
  }, 3200);
}

function formatDate(value) {
  const copy = getCopy();
  if (!value) {
    return copy.unknownDate;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return copy.unknownDate;
  }

  return new Intl.DateTimeFormat(currentLocale === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai"
  }).format(date);
}

function createEmptyState(message) {
  const node = document.createElement("div");
  node.className = "empty-card";
  node.textContent = message;
  return node;
}

function compactText(value, limit = 120) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit - 3).trimEnd()}...`;
}

function getCompactSourceLabel(source) {
  return SOURCE_SHORT_LABELS[source] || source;
}

function getCompactTitle(item) {
  const title = String(item.title || "").replace(/\s+/g, " ").trim();

  if (!title) {
    return "";
  }

  if (/Releases$/i.test(item.source || "")) {
    const normalized = title.replace(/^Release candidate\s+/i, "").replace(/^Release\s+/i, "");
    const [prefix, ...restParts] = normalized.split(/:\s+/);

    if (restParts.length) {
      const releaseNotes = restParts
        .join(": ")
        .split(/\s*,\s*/)
        .map((part) => part.trim())
        .filter(Boolean);

      if (releaseNotes.length) {
        const head = releaseNotes.slice(0, 2).join(", ");
        const suffix = releaseNotes.length > 2 ? ` +${releaseNotes.length - 2}` : "";
        return compactText(`${prefix} | ${head}${suffix}`, 86);
      }
    }

    return compactText(normalized, 86);
  }

  return compactText(title, 100);
}

function getCompactExcerpt(item) {
  const excerpt = String(item.excerpt || "").replace(/\s+/g, " ").trim();
  if (!excerpt) {
    return "";
  }

  return compactText(excerpt, 180);
}

function createItem(item) {
  const copy = getCopy();
  const fragment = itemTemplate.content.cloneNode(true);
  const anchor = fragment.querySelector(".digest-item");
  const source = fragment.querySelector(".digest-item__source");
  const date = fragment.querySelector(".digest-item__date");
  const title = fragment.querySelector(".digest-item__title");
  const excerpt = fragment.querySelector(".digest-item__excerpt");
  const cta = fragment.querySelector(".digest-item__cta");
  const formattedDate = formatDate(item.publishedAt);
  const compactTitle = getCompactTitle(item);
  const compactExcerpt = getCompactExcerpt(item);
  const compactSource = getCompactSourceLabel(item.source);

  anchor.href = item.link;
  anchor.title = `${item.title}\n${item.source} | ${formattedDate}`;
  source.textContent = compactSource;
  date.textContent = formattedDate;
  title.textContent = compactTitle || item.title;
  title.title = item.title;
  excerpt.textContent = compactExcerpt || copy.openLink;
  excerpt.title = item.excerpt || item.title;
  cta.textContent = copy.openLink;

  if (item.sourceOfficial) {
    source.classList.add("is-official");
    source.dataset.officialLabel = copy.official;
  }

  if (item.sourceType) {
    anchor.dataset.type = item.sourceType;
  }

  return fragment;
}

function renderActionList(listEl, actions) {
  listEl.innerHTML = "";
  actions.forEach((action) => {
    const li = document.createElement("li");
    li.textContent = action;
    listEl.appendChild(li);
  });
}

function renderBriefingList(listEl, items) {
  listEl.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    listEl.appendChild(li);
  });
}

function renderFailures(failures) {
  if (!failures.length) {
    failuresSectionEl.classList.add("hidden");
    failuresListEl.innerHTML = "";
    return;
  }

  failuresSectionEl.classList.remove("hidden");
  failuresListEl.innerHTML = "";

  failures.forEach((failure) => {
    const li = document.createElement("li");
    li.textContent = `${failure.source}: ${failure.message}`;
    failuresListEl.appendChild(li);
  });
}

function renderTopics(topics) {
  const copy = getCopy();
  topicGridEl.innerHTML = "";

  topics.forEach((topic) => {
    const fragment = topicTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".topic-card");
    const badge = fragment.querySelector(".topic-badge");
    const title = fragment.querySelector("h3");
    const description = fragment.querySelector(".topic-description");
    const newsCount = fragment.querySelector(".topic-news-count");
    const paperCount = fragment.querySelector(".topic-paper-count");
    const newsList = fragment.querySelector(".topic-news-list");
    const paperList = fragment.querySelector(".topic-paper-list");
    const paperSection = fragment.querySelector(".topic-paper-section");
    const topicColumns = fragment.querySelector(".topic-columns");
    const importanceLabel = fragment.querySelector(".analysis-importance-label");
    const importanceHeadline = fragment.querySelector(".analysis-importance-headline");
    const importanceText = fragment.querySelector(".analysis-importance-text");
    const confidenceLabel = fragment.querySelector(".analysis-confidence-label");
    const confidenceHeadline = fragment.querySelector(".analysis-confidence-headline");
    const confidenceText = fragment.querySelector(".analysis-confidence-text");
    const whyLabel = fragment.querySelector(".analysis-why-label");
    const whyText = fragment.querySelector(".analysis-why-text");
    const nextLabel = fragment.querySelector(".analysis-next-label");
    const nextText = fragment.querySelector(".analysis-next-text");
    const nextActions = fragment.querySelector(".analysis-next-actions");
    const newsTitle = fragment.querySelector(".topic-news-title");
    const newsSubnote = fragment.querySelector(".topic-news-subnote");
    const paperTitle = fragment.querySelector(".topic-paper-title");
    const paperSubnote = fragment.querySelector(".topic-paper-subnote");

    card.style.setProperty("--card-accent", topic.accent);
    badge.textContent = getLocalized(topic.badge);
    title.textContent = getLocalized(topic.title);
    description.textContent = getLocalized(topic.description);
    newsCount.textContent = copy.newsCount(topic.news.length);
    paperCount.textContent = topic.showPapers
      ? copy.paperCount(topic.papers.length)
      : copy.newsOnly;

    importanceLabel.textContent = copy.importance;
    importanceHeadline.textContent = getLocalized(topic.analysis.importance.label);
    importanceText.textContent = getLocalized(topic.analysis.importance.text);
    confidenceLabel.textContent = copy.confidence;
    confidenceHeadline.textContent = getLocalized(topic.analysis.confidence.label);
    confidenceText.textContent = getLocalized(topic.analysis.confidence.text);
    whyLabel.textContent = copy.whyItMatters;
    whyText.textContent = getLocalized(topic.analysis.whyItMatters.text);
    nextLabel.textContent = copy.nextStep;
    nextText.textContent = getLocalized(topic.analysis.nextStep.text);
    renderActionList(nextActions, getLocalized(topic.analysis.nextStep.actions) || []);

    newsTitle.textContent = copy.news;
    newsSubnote.textContent = copy.newsSubnote;
    paperTitle.textContent = copy.papers;
    paperSubnote.textContent = copy.papersSubnote;

    if (topic.news.length) {
      topic.news.forEach((item) => newsList.appendChild(createItem(item)));
    } else {
      newsList.appendChild(createEmptyState(copy.noNews));
    }

    if (!topic.showPapers) {
      paperSection.remove();
      topicColumns.classList.add("topic-columns--single");
    } else if (topic.papers.length) {
      topic.papers.forEach((item) => paperList.appendChild(createItem(item)));
    } else {
      paperList.appendChild(createEmptyState(copy.noPapers));
    }

    topicGridEl.appendChild(fragment);
  });
}

function renderOverview(overview, generatedAt) {
  generatedAtEl.textContent = formatDate(generatedAt);
  topicCountEl.textContent = overview.totalTopics;
  newsCountEl.textContent = overview.newsCount;
  paperCountEl.textContent = overview.paperCount;
  sourceCountEl.textContent = overview.sourceCount;
}

function renderStaticPanels() {
  const copy = getCopy();

  document.getElementById("coverageEyebrow").textContent = copy.coverageEyebrow;
  document.getElementById("coverageTitle").textContent = copy.coverageTitle;
  document.getElementById("coverageText").textContent = copy.coverageText;
  document.getElementById("principlesEyebrow").textContent = copy.principlesEyebrow;
  document.getElementById("principlesTitle").textContent = copy.principlesTitle;
  document.getElementById("principlesText").textContent = copy.principlesText;
  document.getElementById("deliveryEyebrow").textContent = copy.deliveryEyebrow;
  document.getElementById("deliveryTitle").textContent = copy.deliveryTitle;
  document.getElementById("deliveryText").textContent = copy.deliveryText;

  renderBriefingList(coverageListEl, copy.coverageItems);
  renderBriefingList(principlesListEl, copy.principlesItems);
  renderBriefingList(deliveryListEl, copy.deliveryItems);
}

function updateStaticCopy() {
  const copy = getCopy();
  document.documentElement.lang = currentLocale === "zh" ? "zh-CN" : "en";
  document.title = copy.heroTitle;

  document.getElementById("heroEyebrow").textContent = copy.heroEyebrow;
  document.getElementById("heroTitle").textContent = copy.heroTitle;
  document.getElementById("heroText").textContent = copy.heroText;
  document.getElementById("lastUpdatedLabel").textContent = copy.lastUpdated;
  document.getElementById("topicsLabel").textContent = copy.topics;
  document.getElementById("newsLabel").textContent = copy.news;
  document.getElementById("papersLabel").textContent = copy.papers;
  document.getElementById("feedsLabel").textContent = copy.feeds;
  document.getElementById("modeLabel").textContent = copy.modeLabel;
  document.getElementById("modeValue").textContent = copy.modeValue;
  document.getElementById("deliveryLabel").textContent = copy.deliveryLabel;
  document.getElementById("deliveryValue").textContent = copy.deliveryValue;
  document.getElementById("statusNote").textContent = copy.statusNote;
  document.getElementById("scopeEyebrow").textContent = copy.scopeEyebrow;
  document.getElementById("scopeTitle").textContent = copy.scopeTitle;
  document.getElementById("failuresEyebrow").textContent = copy.failuresEyebrow;
  document.getElementById("failuresTitle").textContent = copy.failuresTitle;
  refreshButton.textContent = copy.refresh;
  copyMailButton.textContent = copy.copyPlain;
  copyHtmlButton.textContent = copy.copyHtml;

  renderStaticPanels();

  localeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.locale === currentLocale);
  });
}

function renderFromState() {
  updateStaticCopy();

  if (!currentPayload) {
    generatedAtEl.textContent = getCopy().loading;
    return;
  }

  renderOverview(currentPayload.overview, currentPayload.generatedAt);
  renderTopics(currentPayload.topics);
  renderFailures(currentPayload.failures);
}

function setLocale(locale) {
  currentLocale = locale === "en" ? "en" : "zh";
  window.localStorage.setItem("digest-locale", currentLocale);
  renderFromState();
}

function setRefreshButtonState(isLoading, forceRefresh = false) {
  const copy = getCopy();
  refreshButton.disabled = isLoading;
  refreshButton.textContent = isLoading
    ? forceRefresh
      ? copy.refreshing
      : copy.loading
    : copy.refresh;
}

async function fetchDigest(forceRefresh = false) {
  setRefreshButtonState(true, forceRefresh);

  try {
    const response = await fetch(`/api/digest${forceRefresh ? "?refresh=1" : ""}`);
    if (!response.ok) {
      throw new Error(`Digest request failed with ${response.status}`);
    }

    currentPayload = await response.json();
    renderFromState();
    showToast(forceRefresh ? getCopy().refreshedDigest : getCopy().loadingDigest);
  } catch (error) {
    showToast(error.message);
  } finally {
    setRefreshButtonState(false, forceRefresh);
  }
}

async function copyEmailField(field) {
  try {
    const response = await fetch(`/api/digest/email?locale=${currentLocale}`);
    if (!response.ok) {
      throw new Error(`Email digest request failed with ${response.status}`);
    }

    const payload = await response.json();
    await navigator.clipboard.writeText(payload[field]);
    showToast(field === "html" ? getCopy().copiedHtml : getCopy().copiedPlain);
  } catch (error) {
    showToast(error.message);
  }
}

localeButtons.forEach((button) => {
  button.addEventListener("click", () => setLocale(button.dataset.locale));
});

refreshButton.addEventListener("click", () => fetchDigest(true));
copyMailButton.addEventListener("click", () => copyEmailField("plainText"));
copyHtmlButton.addEventListener("click", () => copyEmailField("html"));

renderFromState();
fetchDigest();
