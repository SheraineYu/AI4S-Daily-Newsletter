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
