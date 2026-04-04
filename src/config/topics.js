export const NEWS_SOURCES = [
  {
    id: "openai-news",
    label: "OpenAI News",
    url: "https://openai.com/news/rss.xml",
    type: "news"
  },
  {
    id: "google-ai-blog",
    label: "Google AI Blog",
    url: "https://blog.google/innovation-and-ai/technology/ai/rss/",
    type: "news"
  },
  {
    id: "nvidia-blog",
    label: "NVIDIA Blog",
    url: "https://blogs.nvidia.com/feed/",
    type: "news"
  },
  {
    id: "techcrunch-ai",
    label: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    type: "news"
  },
  {
    id: "venturebeat-ai",
    label: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/feed",
    type: "news"
  },
  {
    id: "marktechpost",
    label: "MarkTechPost",
    url: "https://www.marktechpost.com/feed/",
    type: "news"
  },
  {
    id: "cnbc-business",
    label: "CNBC Business",
    url: "https://www.cnbc.com/id/10001147/device/rss/rss.html",
    type: "news"
  },
  {
    id: "cnbc-tech",
    label: "CNBC Tech",
    url: "https://www.cnbc.com/id/19854910/device/rss/rss.html",
    type: "news"
  },
  {
    id: "npr-news",
    label: "NPR News",
    url: "https://feeds.npr.org/1001/rss.xml",
    type: "news"
  },
  {
    id: "npr-politics",
    label: "NPR Politics",
    url: "https://feeds.npr.org/1014/rss.xml",
    type: "news"
  },
  {
    id: "un-news",
    label: "UN News",
    url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
    type: "news"
  },
  {
    id: "defense-news-global",
    label: "Defense News",
    url: "https://www.defensenews.com/arc/outboundfeeds/rss/category/global/?outputType=xml",
    type: "news"
  },
  {
    id: "abacus-commits",
    label: "ABACUS Develop",
    url: "https://api.github.com/repos/deepmodeling/abacus-develop/commits?sha=develop&per_page=8",
    kind: "github-commits",
    type: "software"
  },
  {
    id: "lammps-commits",
    label: "LAMMPS Develop",
    url: "https://api.github.com/repos/lammps/lammps/commits?sha=develop&per_page=8",
    kind: "github-commits",
    type: "software"
  }
];

export const TOPICS = [
  {
    id: "global-watchlist",
    title: "Global Watchlist",
    badge: "World",
    description:
      "Track globally important developments across finance, technology, geopolitics, public policy, and military security.",
    accent: "#3d8bfd",
    newsLimit: 8,
    showPapers: false,
    allowedSourceTypes: ["news"],
    sourceIds: [
      "cnbc-business",
      "cnbc-tech",
      "npr-news",
      "npr-politics",
      "un-news",
      "defense-news-global"
    ],
    newsKeywords: [
      "market",
      "economy",
      "trade",
      "tariff",
      "inflation",
      "technology",
      "chip",
      "semiconductor",
      "policy",
      "politics",
      "election",
      "security",
      "defense",
      "military",
      "war",
      "sanction",
      "geopolitics"
    ],
    focusAreas: [
      "全球金融与产业链波动",
      "科技平台与半导体政策",
      "地缘政治与军事安全风险"
    ],
    warningFocus:
      "这个专题偏快讯和政策信号，容易被单一国家叙事或突发事件带偏，需要交叉验证事实和时间线。",
    ideaPrompts: [
      "把影响 AI 供应链的宏观事件单独做一张风险矩阵，关联芯片、能源、出口管制和资本流向。",
      "为重要政治或军事事件加一个“对模型训练、算力采购、国际合作”的二级影响判断。",
      "把值得持续跟踪的全球议题整理成 watchlist，例如利率路径、算力出口、关键航道和地区冲突。"
    ]
  },
  {
    id: "frontier-models",
    title: "Global Frontier Models",
    badge: "Models",
    description:
      "Track new model releases, post-training methods, evaluation signals, and ecosystem movement across frontier labs.",
    accent: "#ef6b48",
    newsKeywords: [
      "large language model",
      "foundation model",
      "frontier model",
      "openai",
      "anthropic",
      "deepmind",
      "gemini",
      "gpt",
      "claude",
      "llm",
      "multimodal",
      "deepseek",
      "qwen",
      "llama"
    ],
    paperKeywords: [
      "large language model",
      "language model",
      "foundation model",
      "multimodal",
      "post-training",
      "reasoning",
      "llm"
    ],
    paperQuery:
      'all:"large language model" OR all:"foundation model" OR all:"multimodal model" OR all:"post-training"',
    paperFocus:
      "Latest papers touching foundation models, multimodal systems, or post-training techniques.",
    focusAreas: [
      "post-training 与 reasoning 策略变化",
      "多模态与工具调用能力边界",
      "开闭源模型生态与价格带重排"
    ],
    warningFocus:
      "这一类信号很容易被发布节奏和 benchmark 宣传放大，真实可复现能力要看公开评测、工具链表现和后续开发者反馈。",
    ideaPrompts: [
      "把最近一个月的 post-training 方法按可迁移性分类，整理成你自己的实验路线图。",
      "把 frontier 模型的工具使用、代码、科学任务能力拆开评估，避免只看综合榜单。",
      "关注更小参数模型的高效蒸馏和长上下文方案，判断哪些可以迁移到 AI4S 场景。"
    ]
  },
  {
    id: "ai4s",
    title: "AI4S / Scientific ML",
    badge: "AI4S",
    description:
      "Monitor scientific machine learning, materials informatics, molecular modeling, and AI for computational science.",
    accent: "#289d8f",
    newsKeywords: [
      "ai4science",
      "scientific machine learning",
      "scientific ai",
      "materials informatics",
      "molecular modeling",
      "computational science",
      "drug discovery",
      "scientific foundation model"
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
      "科学基础模型与多尺度建模",
      "材料与分子体系的数据效率",
      "仿真-实验闭环中的模型可迁移性"
    ],
    warningFocus:
      "AI4S 成果常常在特定数据集或任务上很强，但跨材料体系、跨实验条件时可能迅速失真，要警惕数据泄漏和过拟合。",
    ideaPrompts: [
      "把当前 AI4S 论文按数据规模、标签成本、物理约束方式做一个横向比较表。",
      "优先找能与 DFT、LAMMPS、ABACUS 形成闭环的模型，而不是只做离线预测的工作。",
      "尝试为你的方向建立一个“小样本高价值任务”清单，观察哪些模型真正降低了模拟或实验成本。"
    ]
  },
  {
    id: "atomistic",
    title: "LAMs / PFD / DFT / LAMMPS / ABACUS",
    badge: "Atomistic",
    description:
      "Watch atomistic-model design, pretraining or distillation for force fields, electronic-structure methods, and simulation tooling.",
    accent: "#4f7cff",
    newsKeywords: [
      "density functional theory",
      "dft",
      "lammps",
      "abacus",
      "atomistic",
      "force field",
      "materials simulation",
      "pretraining",
      "fine-tuning",
      "distillation"
    ],
    paperKeywords: [
      "density functional theory",
      "dft",
      "lammps",
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
      "LAMs 设计与预训练数据组织",
      "PFD、蒸馏与势函数微调效率",
      "DFT 到分子动力学软件栈的工程联动"
    ],
    warningFocus:
      "这个方向最容易出现“指标更好但可迁移性不足”的问题，尤其要注意势函数在新元素、新相态和长时间尺度上的稳定性。",
    ideaPrompts: [
      "把 LAM、PFD、蒸馏的工作拆成数据、结构、训练目标三层，寻找真正能复用到你体系里的部件。",
      "从 ABACUS 和 LAMMPS 的近期工程更新里找混合精度、内存路径和并行策略上的切入点。",
      "尝试设计一个统一基准，把 DFT 精度、分子动力学稳定性和下游材料性质预测放在同一张表上。"
    ]
  },
  {
    id: "agents",
    title: "Agents & Tool Use",
    badge: "Agents",
    description:
      "Keep up with agent architectures, tool-use systems, multi-agent coordination, and applied workflows.",
    accent: "#c870ff",
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
      "工具调用与 workflow 编排可靠性",
      "多 agent 分工、协作与记忆机制",
      "面向科研任务的 agent 可控性"
    ],
    warningFocus:
      "agent 演示往往依赖精心挑选的任务和工具环境，真正落地时最常见的问题是状态漂移、上下文膨胀和权限边界失控。",
    ideaPrompts: [
      "把 agent 任务拆成观察、规划、执行、校验四段，逐段评估哪里最容易失效。",
      "尝试把你的科研流程接成半自动 agent pipeline，但保留关键节点的人类审查。",
      "重点关注 memory、tool schema 和 fallback 设计，而不是只追求更长的 autonomous run。"
    ]
  },
  {
    id: "hardware",
    title: "Hardware Acceleration",
    badge: "Hardware",
    description:
      "Track FPGA/ASIC acceleration, GNN systems, memory bottlenecks, and systems for efficient large-model inference or training.",
    accent: "#ffb24c",
    sourceIds: [
      "nvidia-blog",
      "techcrunch-ai",
      "cnbc-tech",
      "abacus-commits",
      "lammps-commits"
    ],
    newsKeywords: [
      "fpga",
      "asic",
      "accelerator",
      "gnn",
      "memory",
      "hbm",
      "chip",
      "inference hardware",
      "training hardware"
    ],
    paperKeywords: [
      "fpga",
      "asic",
      "accelerator",
      "gnn",
      "memory",
      "chip",
      "hbm",
      "hardware"
    ],
    paperQuery:
      'all:FPGA OR all:ASIC OR all:"GNN accelerator" OR all:"AI accelerator" OR all:"memory system"',
    paperFocus:
      "Hardware and systems papers for accelerated model execution and graph workloads.",
    focusAreas: [
      "算力架构与内存瓶颈再平衡",
      "FPGA/ASIC 在专用 workload 上的优势",
      "GNN 与稀疏计算的系统设计"
    ],
    warningFocus:
      "硬件新闻经常强调峰值吞吐和融资消息，但真正值得盯的是能耗、内存墙、软件栈成熟度和部署门槛。",
    ideaPrompts: [
      "把加速方向分成训练、推理、图计算、内存优化四类，分别评估是否对你的任务有意义。",
      "从混合精度、访存模式和编译器支持三个维度筛选硬件论文，而不是只看 TOPS。",
      "针对 AI4S 和原子模拟 workload，单独建立一套与大模型推理不同的硬件评价指标。"
    ]
  },
  {
    id: "magnetic-materials",
    title: "Magnetic Materials",
    badge: "Magnetism",
    description:
      "Surface new work in magnetism, spintronics, and magnetic-material discovery relevant to computation and materials design.",
    accent: "#ff6f91",
    newsKeywords: [
      "magnetic materials",
      "magnetism",
      "spintronics",
      "ferromagnetic",
      "antiferromagnetic",
      "magnetic semiconductor"
    ],
    paperKeywords: [
      "magnetic",
      "magnetism",
      "spintronic",
      "ferromagnetic",
      "antiferromagnetic",
      "skyrmion"
    ],
    paperQuery:
      'all:"magnetic materials" OR all:magnetism OR all:spintronics OR all:ferromagnetic OR all:antiferromagnetic',
    paperFocus:
      "Recent papers on magnetic materials, spin physics, and materials discovery.",
    focusAreas: [
      "磁性材料发现与相稳定性",
      "spintronics、skyrmion 与功能器件",
      "磁性体系中的结构-性质关系"
    ],
    warningFocus:
      "磁性材料论文很多是非常具体的体系结果，短期内不一定可泛化到材料设计流程，需要警惕样品条件和计算设定差异。",
    ideaPrompts: [
      "把值得长期跟踪的磁性体系按二维材料、氧化物、拓扑相关材料分层整理。",
      "关注是否能把磁性材料任务接入 AI4S 或 atomistic pipeline，而不是孤立阅读单篇结果。",
      "尝试记录每篇工作里的可复现实验或计算条件，为后续复现和数据集构建做准备。"
    ]
  }
];
