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
    id: "frontier-models",
    title: "Global Frontier Models",
    badge: "Models",
    description: "Track new model releases, post-training methods, evaluation signals, and ecosystem movement across frontier labs.",
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
      "Latest papers touching foundation models, multimodal systems, or post-training techniques."
  },
  {
    id: "ai4s",
    title: "AI4S / Scientific ML",
    badge: "AI4S",
    description: "Monitor scientific machine learning, materials informatics, molecular modeling, and AI for computational science.",
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
      "Papers on AI for scientific discovery, molecular systems, and simulation workflows."
  },
  {
    id: "atomistic",
    title: "LAMs / PFD / DFT / LAMMPS / ABACUS",
    badge: "Atomistic",
    description: "Watch atomistic-model design, pretraining or distillation for force fields, electronic-structure methods, and simulation tooling.",
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
      "Research touching atomistic simulation, electronic structure, and large atomistic models."
  },
  {
    id: "agents",
    title: "Agents & Tool Use",
    badge: "Agents",
    description: "Keep up with agent architectures, tool-use systems, multi-agent coordination, and applied workflows.",
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
      "Recent work on autonomous agents, multi-agent systems, and tool-use reasoning."
  },
  {
    id: "hardware",
    title: "Hardware Acceleration",
    badge: "Hardware",
    description: "Track FPGA/ASIC acceleration, GNN systems, memory bottlenecks, and systems for efficient large-model inference or training.",
    accent: "#ffb24c",
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
      "Hardware and systems papers for accelerated model execution and graph workloads."
  },
  {
    id: "magnetic-materials",
    title: "Magnetic Materials",
    badge: "Magnetism",
    description: "Surface new work in magnetism, spintronics, and magnetic-material discovery relevant to computation and materials design.",
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
      "Recent papers on magnetic materials, spin physics, and materials discovery."
  }
];
