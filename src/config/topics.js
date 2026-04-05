export const NEWS_SOURCES = [
  {
    id: "openai-news",
    label: "OpenAI News",
    url: "https://openai.com/news/rss.xml",
    type: "news",
    official: true,
    priority: 5
  },
  {
    id: "anthropic-news",
    label: "Anthropic Newsroom",
    url: "https://www.anthropic.com/news",
    kind: "html-news",
    extractor: "anthropic-news",
    type: "news",
    official: true,
    priority: 5
  },
  {
    id: "google-ai-blog",
    label: "Google AI Blog",
    url: "https://blog.google/technology/ai/rss/",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "google-developer-tools",
    label: "Google Developers & Gemma",
    url: "https://blog.google/innovation-and-ai/technology/developers-tools/rss/",
    type: "news",
    official: true,
    priority: 5
  },
  {
    id: "deepmind-blog",
    label: "Google DeepMind Blog",
    url: "https://deepmind.google/blog/rss.xml",
    type: "news",
    official: true,
    priority: 5
  },
  {
    id: "microsoft-research-feed",
    label: "Microsoft Research",
    url: "https://www.microsoft.com/en-us/research/feed/",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "open-catalyst-project",
    label: "Open Catalyst Project",
    url: "https://opencatalystproject.org/",
    kind: "html-news",
    extractor: "open-catalyst-project",
    type: "news",
    official: true,
    priority: 5
  },
  {
    id: "isomorphic-labs-news",
    label: "Isomorphic Labs News",
    url: "https://www.isomorphiclabs.com/news",
    kind: "html-news",
    extractor: "isomorphic-labs-news",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "microsoft-mattergen-releases",
    label: "Microsoft MatterGen Releases",
    url: "https://github.com/microsoft/mattergen/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 5
  },
  {
    id: "microsoft-mattersim-releases",
    label: "Microsoft MatterSim Releases",
    url: "https://github.com/microsoft/mattersim/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 5
  },
  {
    id: "microsoft-ai2bmd-releases",
    label: "Microsoft AI2BMD Releases",
    url: "https://github.com/microsoft/AI2BMD/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "nvidia-bionemo-framework-releases",
    label: "NVIDIA BioNeMo Framework Releases",
    url: "https://github.com/NVIDIA/bionemo-framework/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "deepspeed-releases",
    label: "DeepSpeed Releases",
    url: "https://github.com/deepspeedai/DeepSpeed/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "mistral-news",
    label: "Mistral AI Releases",
    url: "https://github.com/mistralai/client-python/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 5
  },
  {
    id: "meta-llama-releases",
    label: "Meta Llama Releases",
    url: "https://github.com/meta-llama/llama-models/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "xai-sdk-releases",
    label: "xAI SDK Releases",
    url: "https://github.com/xai-org/xai-sdk-python/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "huggingface-transformers-releases",
    label: "Hugging Face Transformers Releases",
    url: "https://github.com/huggingface/transformers/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "nvidia-blog",
    label: "NVIDIA Blog",
    url: "https://blogs.nvidia.com/feed/",
    type: "news",
    official: true,
    priority: 3
  },
  {
    id: "google-cloud-compute",
    label: "Google Cloud Compute",
    url: "https://cloud.google.com/blog/products/compute",
    kind: "html-news",
    extractor: "google-cloud-compute",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "aws-machine-learning",
    label: "AWS Machine Learning Blog",
    url: "https://aws.amazon.com/blogs/machine-learning/feed/",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "intel-ai-news",
    label: "Intel AI Newsroom",
    url: "https://newsroom.intel.com/artificial-intelligence/feed/",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "amd-ai-blogs",
    label: "AMD Blogs",
    url: "https://www.amd.com/en/blogs.html",
    kind: "html-news",
    extractor: "amd-ai-blogs",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "cerebras-blog",
    label: "Cerebras Blog",
    url: "https://www.cerebras.ai/blog",
    kind: "html-news",
    extractor: "cerebras-blog",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "groq-newsroom",
    label: "Groq Newsroom",
    url: "https://groq.com/newsroom",
    kind: "html-news",
    extractor: "groq-newsroom",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "aws-neuron-sdk-releases",
    label: "AWS Neuron SDK Releases",
    url: "https://github.com/aws-neuron/aws-neuron-sdk/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "rocm-releases",
    label: "ROCm Releases",
    url: "https://github.com/ROCm/ROCm/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "techcrunch-ai",
    label: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    type: "news",
    priority: 2
  },
  {
    id: "venturebeat-ai",
    label: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/feed",
    type: "news",
    priority: 2
  },
  {
    id: "marktechpost",
    label: "MarkTechPost",
    url: "https://www.marktechpost.com/feed/",
    type: "news",
    priority: 1
  },
  {
    id: "the-verge",
    label: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    type: "news",
    priority: 2
  },
  {
    id: "cnbc-top-news",
    label: "CNBC Top News",
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    type: "news",
    priority: 2
  },
  {
    id: "cnbc-business",
    label: "CNBC Business",
    url: "https://www.cnbc.com/id/10001147/device/rss/rss.html",
    type: "news",
    priority: 2
  },
  {
    id: "cnbc-tech",
    label: "CNBC Tech",
    url: "https://www.cnbc.com/id/19854910/device/rss/rss.html",
    type: "news",
    priority: 2
  },
  {
    id: "npr-news",
    label: "NPR News",
    url: "https://feeds.npr.org/1001/rss.xml",
    type: "news",
    priority: 2
  },
  {
    id: "npr-politics",
    label: "NPR Politics",
    url: "https://feeds.npr.org/1014/rss.xml",
    type: "news",
    priority: 2
  },
  {
    id: "npr-business",
    label: "NPR Business",
    url: "https://feeds.npr.org/1006/rss.xml",
    type: "news",
    priority: 2
  },
  {
    id: "npr-economy",
    label: "NPR Economy",
    url: "https://feeds.npr.org/1017/rss.xml",
    type: "news",
    priority: 2
  },
  {
    id: "politico-politics",
    label: "POLITICO Politics",
    url: "https://rss.politico.com/politics-news.xml",
    type: "news",
    priority: 2
  },
  {
    id: "sky-world",
    label: "Sky News World",
    url: "https://feeds.skynews.com/feeds/rss/world.xml",
    type: "news",
    priority: 2
  },
  {
    id: "sky-politics",
    label: "Sky News Politics",
    url: "https://feeds.skynews.com/feeds/rss/politics.xml",
    type: "news",
    priority: 2
  },
  {
    id: "sky-technology",
    label: "Sky News Technology",
    url: "https://feeds.skynews.com/feeds/rss/technology.xml",
    type: "news",
    priority: 2
  },
  {
    id: "un-news",
    label: "UN News",
    url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
    type: "news",
    priority: 2
  },
  {
    id: "defense-news-global",
    label: "Defense News",
    url: "https://www.defensenews.com/arc/outboundfeeds/rss/category/global/?outputType=xml",
    type: "news",
    priority: 2
  },
  {
    id: "defense-one",
    label: "Defense One",
    url: "https://www.defenseone.com/rss/all/",
    type: "news",
    priority: 2
  },
  {
    id: "wsj-world",
    label: "WSJ World News",
    url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    type: "news",
    priority: 2
  },
  {
    id: "wsj-business",
    label: "WSJ Business",
    url: "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml",
    type: "news",
    priority: 2
  },
  {
    id: "marketwatch-top",
    label: "MarketWatch Top Stories",
    url: "https://www.marketwatch.com/rss/topstories",
    type: "news",
    priority: 2
  },
  {
    id: "deepmodeling-abacus-news",
    label: "DeepModeling ABACUS News",
    url: "https://blogs.deepmodeling.com/categories/ABACUS/",
    kind: "html-news",
    extractor: "deepmodeling-category",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "lammps-downloads",
    label: "LAMMPS Releases",
    url: "https://www.lammps.org/download.html",
    kind: "html-news",
    extractor: "lammps-downloads",
    type: "news",
    official: true,
    priority: 5
  },
  {
    id: "materials-project-db-versions",
    label: "Materials Project Database Versions",
    url: "https://docs.materialsproject.org/changes/database-versions",
    kind: "html-news",
    extractor: "materials-project-db-versions",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "cp2k-news",
    label: "CP2K News",
    url: "https://www.cp2k.org/_export/xhtml/news",
    kind: "html-news",
    extractor: "cp2k-news",
    type: "news",
    official: true,
    priority: 5
  },
  {
    id: "quantum-espresso-news",
    label: "Quantum ESPRESSO News",
    url: "https://www.quantum-espresso.org/feed/",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "ase-release-notes",
    label: "ASE Release Notes",
    url: "https://wiki.fysik.dtu.dk/ase/releasenotes.html",
    kind: "html-news",
    extractor: "ase-release-notes",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "oqmd-database-releases",
    label: "OQMD Database Releases",
    url: "https://www.oqmd.org/download/",
    kind: "html-news",
    extractor: "oqmd-download",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "psi-k-announcements",
    label: "Psi-k Announcements",
    url: "https://psi-k.net/category/announcements/feed/",
    type: "news",
    official: true,
    priority: 3
  },
  {
    id: "deepmd-kit-releases",
    label: "DeePMD-kit Releases",
    url: "https://github.com/deepmodeling/deepmd-kit/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "pymatgen-releases",
    label: "pymatgen Releases",
    url: "https://github.com/materialsproject/pymatgen/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "matgl-releases",
    label: "matgl Releases",
    url: "https://github.com/materialyzeai/matgl/releases.atom",
    kind: "github-releases",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "nature-spintronics",
    label: "Nature Spintronics",
    url: "https://www.nature.com/subjects/spintronics/nature.rss",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "nature-materials-spintronics",
    label: "Nature Materials Spintronics",
    url: "https://www.nature.com/subjects/spintronics/nmat.rss",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "nature-physics-spintronics",
    label: "Nature Physics Spintronics",
    url: "https://www.nature.com/subjects/spintronics/nphys.rss",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "nature-communications-spintronics",
    label: "Nature Communications Spintronics",
    url: "https://www.nature.com/subjects/spintronics/ncomms.rss",
    type: "news",
    official: true,
    priority: 4
  },
  {
    id: "nist-magnetics",
    label: "NIST Magnetics",
    url: "https://www.nist.gov/magnetics",
    kind: "html-news",
    extractor: "nist-magnetics",
    type: "news",
    official: true,
    priority: 3
  },
];

export const TOPICS = [
  {
    id: "global-watchlist",
    title: "Global Watchlist",
    titleZh: "全球重点新闻",
    badge: "World",
    badgeZh: "全球",
    description:
      "Track globally important developments across finance, technology, geopolitics, public policy, and military security.",
    descriptionZh:
      "聚合全球最值得持续关注的金融、科技、地缘政治、公共政策与军事安全信号。",
    whyItMattersBase:
      "This topic shapes compute access, capital flows, export controls, and the macro environment around AI and scientific research.",
    whyItMattersBaseZh:
      "这个专题直接影响算力获取、资本流向、出口管制以及 AI 与科研所处的宏观环境。",
    accent: "#3d8bfd",
    newsLimit: 8,
    maxItemsPerSource: 1,
    showPapers: false,
    allowedSourceTypes: ["news"],
    sourceIds: [
      "cnbc-top-news",
      "cnbc-business",
      "cnbc-tech",
      "the-verge",
      "marketwatch-top",
      "npr-news",
      "npr-politics",
      "npr-business",
      "npr-economy",
      "politico-politics",
      "sky-world",
      "sky-politics",
      "sky-technology",
      "un-news",
      "defense-news-global",
      "defense-one",
      "wsj-world",
      "wsj-business"
    ],
    newsKeywords: [
      "market",
      "economy",
      "trade",
      "tariff",
      "inflation",
      "interest rate",
      "chip",
      "semiconductor",
      "technology",
      "policy",
      "regulation",
      "politics",
      "election",
      "security",
      "defense",
      "military",
      "war",
      "sanction",
      "shipping",
      "geopolitics"
    ],
    focusAreas: [
      "financial volatility and supply chains",
      "technology regulation and chip policy",
      "geopolitical and defense risk"
    ],
    focusAreasZh: [
      "全球金融与产业链波动",
      "科技监管与芯片政策",
      "地缘政治与军事安全风险"
    ],
    warningFocus:
      "This watchlist moves fast and is sensitive to headlines, so single-source narratives and breaking-news timing errors are common.",
    warningFocusZh:
      "这个专题偏快讯和政策信号，容易被单一来源叙事或突发事件带偏，需要交叉核验事实和时间线。",
    nextStepPrompts: [
      "Build a compact risk matrix that links each macro event to chips, energy, export controls, and capital allocation.",
      "Add a second-order impact note for each major political or military event to estimate consequences for training, compute procurement, and collaboration.",
      "Keep a persistent watchlist for items such as rate paths, export controls, critical shipping routes, and regional conflicts."
    ],
    nextStepPromptsZh: [
      "把影响 AI 供应链的宏观事件单独做一张风险矩阵，关联芯片、能源、出口管制和资本流向。",
      "为重要政治或军事事件增加二阶影响判断，评估其对模型训练、算力采购和国际合作的后果。",
      "把值得持续跟踪的全球议题沉淀成长期 watchlist，例如利率路径、关键航道、出口限制和地区冲突。"
    ]
  },
  {
    id: "frontier-models",
    title: "Global Frontier Models",
    titleZh: "全球前沿大模型",
    badge: "Models",
    badgeZh: "模型",
    description:
      "Track new model releases, post-training methods, evaluation signals, and ecosystem movement across frontier labs.",
    descriptionZh:
      "跟踪前沿实验室的大模型发布、后训练方法、评测信号与生态位变化。",
    whyItMattersBase:
      "This topic determines what capabilities can realistically transfer into AI4S, agents, and cost-sensitive deployment.",
    whyItMattersBaseZh:
      "这个专题决定哪些能力可以真实迁移到 AI4S、Agent 和成本敏感的部署场景。",
    accent: "#ef6b48",
    newsLimit: 6,
    maxItemsPerSource: 2,
    maxUnofficialItems: 2,
    maxSoftwareItems: 0,
    sourceIds: [
      "openai-news",
      "anthropic-news",
      "google-ai-blog",
      "google-developer-tools",
      "deepmind-blog",
      "mistral-news",
      "meta-llama-releases",
      "xai-sdk-releases",
      "huggingface-transformers-releases",
      "nvidia-blog",
      "techcrunch-ai",
      "venturebeat-ai",
      "marktechpost"
    ],
    newsKeywords: [
      "large language model",
      "foundation model",
      "frontier model",
      "openai",
      "anthropic",
      "deepmind",
      "gemma",
      "gemini",
      "gpt",
      "claude",
      "llm",
      "multimodal",
      "deepseek",
      "qwen",
      "llama",
      "grok",
      "mistral",
      "transformers"
    ],
    paperKeywords: [
      "large language model",
      "language model",
      "foundation model",
      "multimodal",
      "post-training",
      "reasoning",
      "llm",
      "agentic"
    ],
    paperQuery:
      'all:"large language model" OR all:"foundation model" OR all:"multimodal model" OR all:"post-training"',
    paperFocus:
      "Latest papers touching foundation models, multimodal systems, or post-training techniques.",
    focusAreas: [
      "post-training and reasoning shifts",
      "multimodal and tool-use boundaries",
      "open versus closed model market reshaping"
    ],
    focusAreasZh: [
      "后训练与推理策略变化",
      "多模态与工具使用能力边界",
      "开源与闭源模型生态重排"
    ],
    warningFocus:
      "Release cadence and benchmark marketing can easily distort perception, so real capability should be judged by reproducibility, tool use, and developer feedback.",
    warningFocusZh:
      "这个方向很容易被发布节奏和 benchmark 营销放大，真实能力要看可复现性、工具调用表现和开发者反馈。",
    nextStepPrompts: [
      "Map the last month of post-training methods into a compact experimentation tree for your own work.",
      "Separate scientific ability, tool use, and coding performance instead of trusting a single leaderboard.",
      "Watch smaller models that gain efficiency through distillation or context engineering and test whether they transfer into AI4S scenarios."
    ],
    nextStepPromptsZh: [
      "把最近一个月的后训练方法整理成实验树，标记哪些值得迁移到你的体系中。",
      "把科学任务能力、工具使用能力和代码能力拆开评估，不要只看单一榜单。",
      "关注通过蒸馏或上下文工程获得效率提升的小模型，并验证它们是否能迁移到 AI4S 场景。"
    ]
  },
  {
    id: "ai4s",
    title: "AI4S / Scientific ML",
    titleZh: "AI4S / 科学机器学习",
    badge: "AI4S",
    badgeZh: "AI4S",
    description:
      "Monitor scientific machine learning, materials informatics, molecular modeling, and AI for computational science.",
    descriptionZh:
      "关注科学机器学习、材料信息学、分子建模以及面向计算科学的 AI 进展。",
    whyItMattersBase:
      "This topic is the closest bridge between general-model progress and your own scientific discovery workflow.",
    whyItMattersBaseZh:
      "这个专题是通用模型进展与自身科研发现流程之间最直接的桥梁。",
    accent: "#289d8f",
    maxItemsPerSource: 1,
    sourceIds: [
      "microsoft-research-feed",
      "open-catalyst-project",
      "isomorphic-labs-news",
      "deepmind-blog",
      "google-ai-blog",
      "nvidia-blog",
      "aws-machine-learning",
      "microsoft-mattergen-releases",
      "microsoft-mattersim-releases",
      "microsoft-ai2bmd-releases",
      "nvidia-bionemo-framework-releases",
      "deepspeed-releases"
    ],
    newsKeywords: [
      "ai4science",
      "scientific machine learning",
      "scientific ai",
      "materials informatics",
      "molecular modeling",
      "computational science",
      "drug discovery",
      "scientific foundation model",
      "mattergen",
      "mattersim",
      "ai2bmd",
      "deepspeed4science",
      "deepspeed",
      "open catalyst",
      "electrocatalysis",
      "bionemo",
      "biomolecular",
      "protein",
      "protein design",
      "genomics",
      "chemistry",
      "weather",
      "climate",
      "seismic",
      "scientific workflow",
      "isomorphic labs"
    ],
    paperKeywords: [
      "scientific machine learning",
      "scientific ai",
      "materials informatics",
      "molecular",
      "drug discovery",
      "simulation",
      "scientific"
    ],
    paperQuery:
      'all:"AI4Science" OR all:"scientific machine learning" OR all:"materials informatics" OR all:"molecular modeling"',
    paperFocus:
      "Papers on AI for scientific discovery, molecular systems, and simulation workflows.",
    focusAreas: [
      "scientific foundation models and multiscale systems",
      "data efficiency for materials and molecules",
      "simulation-to-experiment transfer"
    ],
    focusAreasZh: [
      "科学基础模型与多尺度系统",
      "材料与分子体系的数据效率",
      "仿真到实验的迁移能力"
    ],
    warningFocus:
      "AI4S papers often look strong on curated tasks but break quickly across materials, conditions, or measurement regimes, so leakage and overfitting remain central risks.",
    warningFocusZh:
      "AI4S 论文经常在精心挑选的数据集上表现很好，但跨材料体系、实验条件或测量范式时会快速失效，仍需警惕泄漏和过拟合。",
    nextStepPrompts: [
      "Compare candidate papers by data scale, labeling cost, and the way physical priors are injected.",
      "Prioritize work that can close the loop with DFT, LAMMPS, or ABACUS rather than isolated offline prediction.",
      "Keep a short list of small-data, high-value scientific tasks to test whether the claimed gains reduce real simulation or experiment cost."
    ],
    nextStepPromptsZh: [
      "从数据规模、标注成本和物理先验注入方式三个维度比较候选论文。",
      "优先关注能与 DFT、LAMMPS 或 ABACUS 形成闭环的工作，而不是纯离线预测。",
      "维护一份小样本高价值科学任务清单，验证这些方法是否真正降低了模拟或实验成本。"
    ]
  },
  {
    id: "atomistic",
    title: "LAMs / PFD / DFT / LAMMPS / ABACUS",
    titleZh: "LAMs / PFD / DFT / LAMMPS / ABACUS",
    badge: "Atomistic",
    badgeZh: "原子尺度",
    description:
      "Watch atomistic-model design, pretraining or distillation for force fields, electronic-structure methods, and simulation tooling.",
    descriptionZh:
      "跟踪原子模型设计、力场预训练与蒸馏、电子结构方法以及模拟软件栈更新。",
    whyItMattersBase:
      "This topic is the shortest path from new papers to concrete gains in your atomistic workflow and benchmark stack.",
    whyItMattersBaseZh:
      "这个专题是从新论文走到原子尺度工作流与基准体系实际收益的最短路径。",
    accent: "#4f7cff",
    newsLimit: 4,
    sourceIds: [
      "deepmodeling-abacus-news",
      "lammps-downloads",
      "cp2k-news",
      "quantum-espresso-news",
      "ase-release-notes",
      "materials-project-db-versions",
      "oqmd-database-releases",
      "psi-k-announcements",
      "open-catalyst-project",
      "deepmd-kit-releases",
      "pymatgen-releases",
      "matgl-releases"
    ],
    maxItemsPerSource: 1,
    maxSoftwareItems: 0,
    newsKeywords: [
      "density functional theory",
      "dft",
      "lammps",
      "cp2k",
      "quantum espresso",
      "ase",
      "abacus",
      "deepmd",
      "deepmd-kit",
      "deeppot",
      "open catalyst",
      "materials project",
      "matgl",
      "pymatgen",
      "oqmd",
      "atomistic",
      "force field",
      "interatomic potential",
      "materials simulation",
      "benchmark",
      "performance",
      "scaling",
      "release",
      "database version",
      "release notes",
      "checkpoint",
      "pretrained model",
      "pretraining",
      "fine-tuning",
      "distillation"
    ],
    paperKeywords: [
      "density functional theory",
      "dft",
      "lammps",
      "cp2k",
      "quantum espresso",
      "ase",
      "abacus",
      "atomistic",
      "interatomic",
      "force field",
      "materials simulation",
      "distillation",
      "pretraining"
    ],
    paperQuery:
      'all:"density functional theory" OR all:DFT OR all:LAMMPS OR all:ABACUS OR all:"atomistic simulation" OR all:"force field"',
    paperFocus:
      "Research touching atomistic simulation, electronic structure, and large atomistic models.",
    focusAreas: [
      "LAM design and pretraining corpora",
      "PFD, distillation, and force-field tuning efficiency",
      "software-path coupling from DFT to MD"
    ],
    focusAreasZh: [
      "LAM 设计与预训练数据组织",
      "PFD、蒸馏与力场微调效率",
      "从 DFT 到 MD 的软件路径耦合"
    ],
    warningFocus:
      "This area often reports better metrics without proving transfer stability, so new elements, new phases, and long-horizon dynamics remain the failure modes to watch.",
    warningFocusZh:
      "这个方向最容易出现指标更好但迁移稳定性不足的问题，尤其要注意新元素、新相态和长时间动力学上的失败模式。",
    nextStepPrompts: [
      "Break LAM, PFD, and distillation papers into data, architecture, and objective choices, then isolate the reusable pieces.",
      "Scan ABACUS and LAMMPS updates for mixed precision, memory paths, and parallel strategy changes worth testing.",
      "Build a unified benchmark table that combines DFT fidelity, MD stability, and downstream property prediction."
    ],
    nextStepPromptsZh: [
      "把 LAM、PFD 和蒸馏工作拆成数据、结构和训练目标三层，找出真正可复用的部分。",
      "从 ABACUS 和 LAMMPS 更新里筛出混合精度、内存路径和并行策略上的可测切入点。",
      "构建一张统一基准表，把 DFT 精度、MD 稳定性和下游性质预测放在一起比较。"
    ]
  },
  {
    id: "agents",
    title: "Agents & Tool Use",
    titleZh: "Agents 与工具使用",
    badge: "Agents",
    badgeZh: "Agent",
    description:
      "Keep up with agent architectures, tool-use systems, multi-agent coordination, and applied workflows.",
    descriptionZh:
      "关注 Agent 架构、工具使用系统、多 Agent 协作与面向真实任务的工作流。",
    whyItMattersBase:
      "This topic determines how much of your research pipeline can move from manual monitoring into reliable semi-automation.",
    whyItMattersBaseZh:
      "这个专题决定你的科研流程有多少可以从人工监控转向可靠的半自动化。",
    accent: "#c870ff",
    newsLimit: 4,
    maxItemsPerSource: 2,
    maxUnofficialItems: 2,
    maxSoftwareItems: 0,
    newsKeywords: [
      "ai agent",
      "llm agent",
      "agentic",
      "multi-agent",
      "tool use",
      "tool-use",
      "autonomous agent"
    ],
    paperKeywords: [
      "agent",
      "agentic",
      "tool use",
      "tool-use",
      "multi-agent",
      "autonomous"
    ],
    paperQuery:
      'all:"LLM agent" OR all:"AI agent" OR all:"tool use" OR all:"multi-agent"',
    paperFocus:
      "Recent work on autonomous agents, multi-agent systems, and tool-use reasoning.",
    focusAreas: [
      "tool calling and workflow reliability",
      "multi-agent delegation and memory",
      "controllability for research tasks"
    ],
    focusAreasZh: [
      "工具调用与工作流可靠性",
      "多 Agent 分工、协作与记忆机制",
      "面向科研任务的可控性"
    ],
    warningFocus:
      "Agent demos are often optimized around carefully chosen tasks and permissions, so state drift, context bloat, and unsafe tool boundaries remain the practical failure points.",
    warningFocusZh:
      "Agent 演示往往依赖精心挑选的任务和权限环境，真正落地时最常见的问题是状态漂移、上下文膨胀和工具边界失控。",
    nextStepPrompts: [
      "Split workflows into observe, plan, execute, and verify to measure where failures really happen.",
      "Connect part of your research process into a semi-automated pipeline while keeping human review at critical gates.",
      "Prioritize memory design, tool schemas, and fallback behavior instead of chasing long autonomous runs."
    ],
    nextStepPromptsZh: [
      "把 Agent 工作流拆成观察、规划、执行、校验四段，逐段测量失败发生的位置。",
      "把部分科研流程接成半自动 pipeline，但在关键节点保留人工复核。",
      "优先优化记忆机制、工具 schema 和 fallback 行为，而不是盲目追求更长自主运行。"
    ]
  },
  {
    id: "hardware",
    title: "Hardware Acceleration",
    titleZh: "硬件加速",
    badge: "Hardware",
    badgeZh: "硬件",
    description:
      "Track FPGA/ASIC acceleration, GNN systems, memory bottlenecks, and systems for efficient large-model inference or training.",
    descriptionZh:
      "跟踪 FPGA/ASIC 加速、GNN 系统、内存瓶颈以及大模型训练与推理的高效硬件路径。",
    whyItMattersBase:
      "This topic determines whether new models can actually run within your memory, power, and deployment constraints.",
    whyItMattersBaseZh:
      "这个专题决定新模型是否真的能在你的内存、功耗和部署约束内落地。",
    accent: "#ffb24c",
    newsLimit: 4,
    maxItemsPerSource: 1,
    maxUnofficialItems: 2,
    maxSoftwareItems: 0,
    sourceIds: [
      "nvidia-blog",
      "google-cloud-compute",
      "aws-machine-learning",
      "intel-ai-news",
      "amd-ai-blogs",
      "cerebras-blog",
      "groq-newsroom",
      "aws-neuron-sdk-releases",
      "rocm-releases"
    ],
    newsKeywords: [
      "fpga",
      "asic",
      "accelerator",
      "gnn",
      "memory",
      "hbm",
      "chip",
      "tpu",
      "neuron",
      "trainium",
      "inferentia",
      "gaudi",
      "rocm",
      "mi300",
      "mi350",
      "wafer-scale",
      "hyperpod",
      "cluster",
      "distributed training",
      "runtime",
      "supercomputer",
      "serving",
      "compiler",
      "kernel",
      "latency",
      "throughput",
      "rack-scale",
      "scale-out",
      "inference hardware",
      "training hardware",
      "interconnect"
    ],
    paperKeywords: [
      "fpga",
      "asic",
      "accelerator",
      "gnn",
      "memory",
      "chip",
      "hbm",
      "tpu",
      "trainium",
      "inferentia",
      "gaudi",
      "rocm",
      "hardware"
    ],
    paperQuery:
      'all:FPGA OR all:ASIC OR all:"GNN accelerator" OR all:"AI accelerator" OR all:"memory system"',
    paperFocus:
      "Hardware and systems papers for accelerated model execution and graph workloads.",
    focusAreas: [
      "compute-memory rebalance",
      "specialized accelerators for domain workloads",
      "GNN and sparse-system design"
    ],
    focusAreasZh: [
      "算力架构与内存瓶颈再平衡",
      "面向领域 workload 的专用加速器",
      "GNN 与稀疏系统设计"
    ],
    warningFocus:
      "Hardware coverage tends to overemphasize peak throughput and fundraising, while the real decision drivers are energy, memory wall behavior, software maturity, and deployment friction.",
    warningFocusZh:
      "硬件新闻经常强调峰值吞吐和融资，但真正重要的是能耗、内存墙行为、软件成熟度和部署摩擦。",
    nextStepPrompts: [
      "Split candidates into training, inference, graph, and memory-optimization paths before judging relevance.",
      "Filter hardware papers by mixed precision, memory behavior, and compiler maturity rather than TOPS alone.",
      "Define a separate scorecard for AI4S and atomistic workloads instead of reusing frontier-model inference metrics."
    ],
    nextStepPromptsZh: [
      "先把候选路线按训练、推理、图计算和内存优化拆开，再判断相关性。",
      "从混合精度、访存行为和编译器成熟度筛选硬件论文，而不是只看 TOPS。",
      "为 AI4S 和原子尺度 workload 单独设计评价表，不要直接复用大模型推理指标。"
    ]
  },
  {
    id: "magnetic-materials",
    title: "Magnetic Materials",
    titleZh: "磁性材料",
    badge: "Magnetism",
    badgeZh: "磁性",
    description:
      "Surface new work in magnetism, spintronics, and magnetic-material discovery relevant to computation and materials design.",
    descriptionZh:
      "跟踪磁性材料、Spintronics 与材料发现方向中值得持续关注的新进展。",
    whyItMattersBase:
      "This topic keeps long-horizon materials ideas visible and helps connect them back to simulation, discovery, and benchmarking.",
    whyItMattersBaseZh:
      "这个专题帮助你持续保留中长期材料方向的视野，并把它们重新接回模拟、发现和基准设计。",
    accent: "#ff6f91",
    sourceIds: [
      "nature-spintronics",
      "nature-materials-spintronics",
      "nature-physics-spintronics",
      "nature-communications-spintronics",
      "nist-magnetics"
    ],
    newsKeywords: [
      "magnetic materials",
      "magnetism",
      "spintronics",
      "spin-wave",
      "spin wave",
      "magnon",
      "skyrmion",
      "ferromagnetic",
      "antiferromagnetic",
      "magnetic semiconductor"
    ],
    paperKeywords: [
      "magnetic",
      "magnetism",
      "spintronic",
      "magnon",
      "ferromagnetic",
      "antiferromagnetic",
      "skyrmion"
    ],
    paperQuery:
      'all:"magnetic materials" OR all:magnetism OR all:spintronics OR all:ferromagnetic OR all:antiferromagnetic',
    paperFocus:
      "Recent papers on magnetic materials, spin physics, and materials discovery.",
    focusAreas: [
      "material discovery and phase stability",
      "spintronics and skyrmion devices",
      "structure-property mapping in magnetic systems"
    ],
    focusAreasZh: [
      "磁性材料发现与相稳定性",
      "Spintronics 与 Skyrmion 器件",
      "磁性体系中的结构-性质映射"
    ],
    warningFocus:
      "Many magnetic-material results are highly system-specific, so experimental setup and computational assumptions can make generalization fragile.",
    warningFocusZh:
      "很多磁性材料结果高度依赖具体体系，实验设置和计算假设的差异会让泛化能力非常脆弱。",
    nextStepPrompts: [
      "Group promising systems into 2D materials, oxides, and topology-related families for longer-term tracking.",
      "Check whether each result can plug into your AI4S or atomistic pipeline instead of treating it as an isolated reading note.",
      "Log reproducible experimental or computational conditions from each paper for later benchmark construction."
    ],
    nextStepPromptsZh: [
      "把值得长期跟踪的体系按二维材料、氧化物和拓扑相关材料分层整理。",
      "判断每个结果能否接入你的 AI4S 或原子尺度 pipeline，而不是只做孤立阅读笔记。",
      "记录论文中的可复现实验或计算条件，为后续基准和数据集构建做准备。"
    ]
  }
];
