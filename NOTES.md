# 项目决策与背景笔记

> 这份文件记录开发过程中做出的关键决定与产品背景，随代码进入 Git，永不丢失。
> 对话记录本身保存在 Claude Code 客户端（本地 `~/.claude/`），不保证永久；重要内容以本文件为准。

## 产品定位

- 竞赛数学（Euclid / CSMC / IMO 风格）AI 辅导网站原型。
- **1v1 私教模式**：整个网站只服务当前一位用户，无学生切换、无多账号、无注册登录。
- 定位是产品概念 Demo：不做真实付费、多用户并发、生产级安全。

## 核心链路

上传解题图片 → Claude 多模态批改（判对错 + 定位错误步骤）→ 错误归因到知识点标签 → 统计薄弱知识点与习惯性错误 → 个性化练习推荐 + 学情看板。

## 已定技术决策

- 技术栈：Next.js 14 (App Router) + TypeScript + Tailwind CSS，后端用 API Routes。
- AI：Anthropic Claude API，多模态图片输入；无 API Key 时自动进入 Mock 模式（确定性假批改），保证无 Key 也能完整演示。
- 存储：**当前用本地文件持久化**（`data/store.json`），退出/重启数据不丢。
  - 存储层已抽象为 `SubmissionStore` 接口（`src/lib/store/`），**云端上线只需新增一个实现并切换驱动，页面和 API 零改动**。
  - 云端方案尚未选定：待定 Supabase 或 Vercel Postgres（用户倾向"先本地，以后上线"）。
- 界面：中英文双语一键切换（右上角），选择记忆在浏览器 localStorage。
- 视觉风格：极简 "ins 风" —— 暖白画布、近黑正文、单一克制强调色、发丝级边框、大量留白。
- 题库：18 道自编竞赛题（规避版权），中英双语，带标准答案与评分 rubric。

## 待办 / 未决

- [ ] 真接云数据库（选 Supabase 还是 Vercel Postgres 后补 `supabaseStore.ts`）。
- [ ] 若要区分多个真实用户：给 `Submission` 加回 `userId` 字段并在 store 接口按用户过滤（当前固定用户 `me`，见 `src/lib/seed.ts` 的 `CURRENT_USER_ID`）。

## 怎么重新跑起来（关机重启后）

```bash
cd C:\Users\mo\ai-competition-coach
npm run dev
```

或双击项目根目录的 `start.bat`。然后打开终端显示的地址（http://localhost:3000 ，被占用时会自动换 3001/3002）。历史批改记录都还在。
