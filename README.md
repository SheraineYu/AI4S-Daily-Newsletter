# AI4S Daily Digest

一个从零搭建的本地网页，用于汇总你关注领域的每日全球新闻、论文和研究链接：

- Frontier foundation models / 全球大模型
- AI4S / Scientific ML
- LAMs / PFD / DFT / LAMMPS / ABACUS
- Agents / Tool use
- FPGA / ASIC / GNN / memory acceleration
- Magnetic materials / magnetism / spintronics

## 功能

- 后端统一聚合多路 RSS / Atom 源。
- 新闻源覆盖 OpenAI、Google AI Blog、NVIDIA、TechCrunch AI、VentureBeat AI、MarkTechPost，以及 ABACUS 开发更新流。
- 论文与研究源使用 arXiv 最新 Atom 查询。
- 页面会按研究主题分区展示，并生成邮件可直接使用的纯文本 / HTML 摘要。
- 抓取具备容错逻辑，个别源失败不会拖垮整页。

## 启动

```bash
npm install
npm run dev
```

默认地址：

```text
http://localhost:3000
```

## API

- `GET /api/digest`
  返回网页展示所需的聚合数据。
- `GET /api/digest?refresh=1`
  强制刷新，绕过 15 分钟缓存。
- `GET /api/digest/email`
  返回可直接用于邮件发送的 `plainText` 和 `html` 内容。

也可以直接在命令行生成邮件内容：

```bash
npm run digest:email
```

## 后续接入每日邮件

这个项目已经把“邮件正文生成”准备好了。要做到真正的每日发送，需要再接一个调度器或自动化执行层，例如：

- Codex automation 每天定时抓取并通过 Gmail 插件发送
- GitHub Actions / cron job 定时请求 `/api/digest/email`
- 自己的 Node 定时任务结合 Gmail API 或 SMTP

当前这一步先把聚合和展示层做好，方便你后续直接接发送链路。

## GitHub Actions 每日自动邮件

已新增生产可用的自动化工作流：`.github/workflows/daily-digest.yml`。

- 触发方式：
  - `schedule`（每天 UTC `0 0 * * *`）
  - `workflow_dispatch`（手动触发）
- 时区说明：`0 0 * * *` 是 **UTC 00:00**，对应 **Asia/Shanghai 08:00**。
- 工作流步骤：
  1. checkout 仓库
  2. setup Node.js 22
  3. `npm ci`
  4. `npm run digest:send`

### 邮件发送实现（Gmail SMTP）

新增脚本：`scripts/send-email.mjs`，基于 Gmail SMTP（Node 原生实现）发送邮件，不依赖 Codex 插件。

- 先调用 `scripts/generate-email.mjs` 生成 JSON（subject/plainText/html）
- 发送 HTML 正文，并附带纯文本 fallback
- 缺失必需环境变量时会明确报错退出

支持环境变量：

- `GMAIL_SMTP_HOST`（可选，默认 `smtp.gmail.com`）
- `GMAIL_SMTP_PORT`（可选，默认 `465`）
- `GMAIL_SMTP_USER`（必需）
- `GMAIL_SMTP_PASS`（必需）
- `DIGEST_TO_EMAIL`（必需）
- `DIGEST_FROM_EMAIL`（可选，默认等于 `GMAIL_SMTP_USER`）

### GitHub Secrets 配置

在仓库 **Settings → Secrets and variables → Actions** 中添加：

- `GMAIL_SMTP_HOST`（建议填 `smtp.gmail.com`）
- `GMAIL_SMTP_PORT`（建议填 `465`）
- `GMAIL_SMTP_USER`（你的 Gmail 地址）
- `GMAIL_SMTP_PASS`（Gmail App Password）
- `DIGEST_FROM_EMAIL`（可选，不填则默认 `GMAIL_SMTP_USER`）

> 说明：收件人已在 workflow 中固定为 `DIGEST_TO_EMAIL=yusheraine@gmail.com`。

### Gmail App Password 获取

Gmail SMTP 推荐使用 App Password：

1. 为 Google 账号开启 2-Step Verification。
2. 在 Google 账号安全设置中创建 App Password。
3. 将 16 位密码写入 `GMAIL_SMTP_PASS` secret。

### 手动测试

本地：

```bash
npm ci
npm run digest:email
node scripts/send-email.mjs --dry-run
```

- `--dry-run` 不发信，只输出收件人、主题、正文长度。

GitHub Actions：

1. 打开仓库 **Actions** 页面。
2. 选择 **Daily AI4S Digest Email**。
3. 点击 **Run workflow** 手动执行一次，验证 secrets 与发信链路。
