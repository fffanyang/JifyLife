# 🦀 JifyLife

> **P人也能变J人** — J-ify Your Life!

JifyLife 是一款跨平台个人效率管理工具，帮助你从随性的 P 人变成有条理的 J 人。

你只管随手记录，JifyLife 帮你理清思路、生成日记、发现值得坚持的好习惯。

## ✨ 核心功能

| 功能 | 描述 |
|------|------|
| 🎤 语音输入 | 说话即记录，AI 自动识别意图并分类，支持实时转写和智能指令 |
| 📅 日程管理 | "下午三点开会"→ 自动创建日程，支持提醒和重复 |
| 📝 备忘录 | "提醒我明天带伞"→ 自动创建备忘并设置提醒 |
| 📖 流水账→日记 | 碎片化记录自动整合，AI 生成结构化每日日记 |
| ✅ 打卡提炼 | "今天跑了五公里"→ 自动识别打卡项，统计连续天数 |
| 🧠 知识整理 | 知识卡片自动归档，标签体系，关联检索 |

> **设计理念**：一个窗口，一个输入框，说出来就好。没有复杂导航，没有页面跳转——你只管说，AI 帮你整理。

## 🛠 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (PWA)
- **后端**：Node.js + Express + TypeScript + Prisma
- **数据库**：SQLite (开发) / PostgreSQL (生产)
- **AI**：OpenAI / Claude API（可切换模板模式）
- **项目管理**：pnpm Monorepo

## 📂 项目结构

```
JifyLife/
├── docs/              # 产品文档
├── packages/shared/   # 前后端共享类型/常量/校验
├── apps/web/          # 前端 PWA 应用
└── apps/server/       # 后端 API 服务
```

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发环境
pnpm dev

# 仅启动前端
pnpm --filter web dev

# 仅启动后端
pnpm --filter server dev
```

## 🌐 部署到 GitHub Pages

项目已配置好 GitHub Actions 自动部署。只需以下几步：

**1. 创建 GitHub 仓库并推送代码**

```bash
git init
git add -A
git commit -m "Initial commit"
git remote add origin https://github.com/<你的用户名>/JifyLife.git
git branch -M main
git push -u origin main
```

**2. 开启 GitHub Pages**

进入仓库 → Settings → Pages → Source 选择 **GitHub Actions**。

**3. 等待自动部署**

推送到 `main` 分支后，GitHub Actions 会自动构建并部署。部署完成后访问：

```
https://<你的用户名>.github.io/JifyLife/
```

**4. 手机安装为 PWA**

手机浏览器打开上述网址 → 点击"添加到主屏幕"，即可像原生 App 一样使用，离线也能正常运行。

> 注意：如果你的仓库名不是 `JifyLife`，需要修改 `.github/workflows/deploy.yml` 中的 `VITE_BASE_PATH` 环境变量为 `/<你的仓库名>/`。

## 📄 文档

- [产品需求文档 (PRD)](./docs/PRD.md)
- [UI 设计方案](./docs/UI-DESIGN.md)

## 📜 License

MIT
