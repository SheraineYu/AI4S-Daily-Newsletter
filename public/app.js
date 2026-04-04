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

function showToast(message) {
  toastEl.textContent = message;
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toastEl.textContent = "";
  }, 3200);
}

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function createEmptyState(message) {
  const node = document.createElement("div");
  node.className = "empty-card";
  node.textContent = message;
  return node;
}

function createItem(item) {
  const fragment = itemTemplate.content.cloneNode(true);
  const anchor = fragment.querySelector(".digest-item");
  const meta = fragment.querySelector(".digest-item__meta");
  const title = fragment.querySelector(".digest-item__title");
  const excerpt = fragment.querySelector(".digest-item__excerpt");

  anchor.href = item.link;
  meta.textContent = `${item.source} | ${formatDate(item.publishedAt)}`;
  title.textContent = item.title;
  excerpt.textContent = item.excerpt || "Open the original link for more detail.";

  return fragment;
}

function renderIdeas(listEl, ideas) {
  listEl.innerHTML = "";

  ideas.forEach((idea) => {
    const li = document.createElement("li");
    li.textContent = idea;
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
    const briefingSummary = fragment.querySelector(".briefing-summary-text");
    const briefingWarning = fragment.querySelector(".briefing-warning-text");
    const briefingIdeas = fragment.querySelector(".briefing-ideas-list");

    card.style.setProperty("--card-accent", topic.accent);
    badge.textContent = topic.badge;
    title.textContent = topic.title;
    description.textContent = topic.description;
    newsCount.textContent = `${topic.news.length} news`;
    paperCount.textContent = topic.showPapers === false ? "news only" : `${topic.papers.length} papers`;
    briefingSummary.textContent = topic.analysis.summary;
    briefingWarning.textContent = topic.analysis.warning;
    renderIdeas(briefingIdeas, topic.analysis.ideas || []);

    if (topic.news.length) {
      topic.news.forEach((item) => newsList.appendChild(createItem(item)));
    } else {
      newsList.appendChild(createEmptyState("No matched news items for this topic right now."));
    }

    if (topic.showPapers === false) {
      paperSection.remove();
      topicColumns.classList.add("topic-columns--single");
    } else if (topic.papers.length) {
      topic.papers.forEach((item) => paperList.appendChild(createItem(item)));
    } else {
      paperList.appendChild(createEmptyState("No papers returned for this topic right now."));
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

async function fetchDigest(forceRefresh = false) {
  refreshButton.disabled = true;
  refreshButton.textContent = forceRefresh ? "Refreshing..." : "Loading...";

  try {
    const response = await fetch(`/api/digest${forceRefresh ? "?refresh=1" : ""}`);
    if (!response.ok) {
      throw new Error(`Digest request failed with ${response.status}`);
    }

    const payload = await response.json();
    renderOverview(payload.overview, payload.generatedAt);
    renderTopics(payload.topics);
    renderFailures(payload.failures);
    showToast(forceRefresh ? "Digest refreshed." : "Digest loaded.");
  } catch (error) {
    showToast(error.message);
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = "Refresh digest";
  }
}

async function copyEmailField(field) {
  try {
    const response = await fetch("/api/digest/email");
    if (!response.ok) {
      throw new Error(`Email digest request failed with ${response.status}`);
    }

    const payload = await response.json();
    await navigator.clipboard.writeText(payload[field]);
    showToast(field === "html" ? "HTML digest copied." : "Plain text digest copied.");
  } catch (error) {
    showToast(error.message);
  }
}

refreshButton.addEventListener("click", () => fetchDigest(true));
copyMailButton.addEventListener("click", () => copyEmailField("plainText"));
copyHtmlButton.addEventListener("click", () => copyEmailField("html"));

fetchDigest();
