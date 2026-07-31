# 竞赛数学 AI 辅导 · AI Competition Coach（产品原型 Demo）

一个面向竞赛数学（Euclid / CSMC / IMO 风格）的 AI 辅导网站原型。核心链路：

> 上传解题过程 → **Claude 多模态批改**（判对错 + 定位错误步骤）→ 错误**归因到知识点标签** → 系统统计**薄弱知识点与习惯性错误** → 生成**个性化练习推荐**与学情看板。

产品定位是 **1v1 私教**：整个网站只服务当前这一位用户，没有学生切换、没有多账号。所有批改记录都持久化保存，退出/重启后数据不丢。

本项目是产品概念演示 Demo：无需真实用户系统、无需付费、无需生产级安全与并发。目标是把完整流程跑通、界面清晰，让评委/用户直观感受产品价值。

## 新特性

- **中英文双语**：右上角一键切换「中文 / EN」。界面文案、题目、标准答案、知识点标签、AI 反馈全部随语言切换；选择记忆在浏览器里。
- **单用户私教模式**：去掉了学生下拉框，所有记录归当前用户一人。
- **数据持久化 + 云端预留**：记录写入本地文件 `data/store.json`，退出/重启不丢。存储层做了接口抽象（`src/lib/store/`），未来上线只需新增一个云数据库实现并切换驱动，页面和 API 不用改。见「上线到云端」一节。
- **极简 ins 风界面**：暖白画布、近黑正文、克制的单一强调色、发丝级边框、大量留白。

---

## 技术栈

- **Next.js 14（App Router）+ TypeScript + Tailwind CSS**
- 后端：Next.js API Routes（无独立后端服务）
- 数据存储：本地 **JSON 文件**（`data/store.json`，退出/重启不丢；存储层已抽象，可平滑切到云数据库，见「上线到云端」）
- AI 能力：**Anthropic Claude API**（多模态，图片输入），用于识别解题内容、判对错、定位错误步骤、归因知识点
- 图表：Recharts（雷达图 + 条形图）
- 图片上传：本地保存到 `public/uploads/`

---

## 本地启动

前置：Node.js 18+（推荐 20+）。

```bash
# 1. 安装依赖
npm install

# 2. 配置 API Key（可选，见下方“Mock 模式”）
cp .env.example .env.local
#   然后编辑 .env.local，填入你的 ANTHROPIC_API_KEY

# 3. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可。

### 配置 Anthropic API Key

1. 在 https://console.anthropic.com/ 获取 API Key。
2. 复制 `.env.example` 为 `.env.local`。
3. 填入：
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
   ANTHROPIC_MODEL=claude-sonnet-4-6   # 可选，默认即为多模态模型
   ```
4. 重启 `npm run dev`。

### Mock 模式（无需 API Key 也能完整演示）

如果 `ANTHROPIC_API_KEY` 为空，应用会自动进入 **Mock 模式**：用一套确定性的假批改结果驱动整个流程（对错、错误定位、知识点归因、反馈都会生成），因此**不配置 Key 也能演示完整链路**。批改结果卡片上会显示“示例批改”标记。

若配置了 Key 但调用出错（网络/额度等），也会自动降级到 Mock，保证 Demo 不中断。

---

## 演示流程建议

1. （可选）右上角切换「中文 / EN」语言。
2. 进入 **上传批改** 页：选一道题 → 上传解答图片 → 提交。
   - 可直接用内置示例图片：`public/samples/sample-correct.png`（Q「补集计数」正确解答）与 `public/samples/sample-wrong.png`（Q「容斥原理」漏减重叠的错误解答）。
   - 用 Claude 真机测试时，这两张图能演示“判对 / 判错并定位”的差异（注意：题目要选对应的那道）。
3. 查看 **批改结果页**：AI 识别内容、判对错、错误步骤定位、错误类型（知识性/习惯性）、知识点标签、自然语言反馈，并可展开标准答案。
4. 多提交几次后回到 **学情看板**：查看各领域雷达图、具体考点掌握度条形图、最常出现的错误模式、以及个性化练习推荐。
5. **错题本** 页回顾所有做错的题目。

> 提示：想快速看到看板效果，可对不同题目多提交几次（Mock 模式下约 2/3 判对、1/3 判错，含习惯性/知识性错误）。所有记录都会保存，下次打开仍在。

---

## 示例图片说明

`public/samples/` 下提供两张示例学生解答图（打字版，清晰易读，规避手写生成难题）：

| 文件 | 对应题目 | 内容 |
| --- | --- | --- |
| `sample-correct.png` | Q02「至少一个偶数的排列」 | 正确使用补集计数，答案 108 |
| `sample-wrong.png` | Q06「3 或 5 的倍数」 | 忘记用容斥减去 15 的倍数，误得 106（正确 93） |

重新生成示例图片（可选）：

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/gen-samples.ps1
```

---

## 项目结构

```
src/
  app/
    layout.tsx              # 全局布局 + 语言上下文 + 导航
    page.tsx                # 学情看板 Dashboard（雷达图/条形图/错误模式/推荐）
    practice/               # 上传批改流程（含 URL ?questionId 预选）
    result/[id]/            # 批改结果页（客户端按语言渲染）
    mistakes/               # 错题本
    api/
      questions/            # GET 题库
      submissions/          # POST 批改 + GET 列表；[id] 单条
      stats/                # GET 学情聚合数据（按 ?locale 本地化）
  components/               # NavBar(含语言切换) / Footer / 图表 / 结果卡片 / 徽章 / 语言上下文
  lib/
    types.ts                # 领域类型（含双语字段）
    i18n.ts                 # 界面文案字典 + 题目本地化访问器
    concepts.ts             # 知识点标签体系（中英双语）
    seed.ts                 # 18 道原创竞赛题（双语）+ 固定用户 id
    db.ts                   # 数据访问入口（题库只读 + 委托 store）
    store/                  # 存储抽象：types.ts 接口 / fileStore.ts 文件实现 / index.ts 驱动选择
    anthropic.ts            # Claude 批改集成（双语 prompt、Mock、容错解析）
    stats.ts                # 学情聚合与推荐逻辑（本地化）
public/
  samples/                  # 示例解答图片
  uploads/                  # 运行时上传的图片
data/store.json             # 运行时生成的数据（含提交记录，持久保存）
```

## 数据模型

- **Question**：`id, title/titleEn, content/contentEn, standardAnswer/standardAnswerEn, rubric, conceptTags[], domain, difficulty`
- **Submission**：`id, questionId, imagePath, aiResult(JSON), createdAt`（单用户，无 studentId）

`aiResult` 为 Claude 返回并经服务端容错解析的严格 JSON：

```json
{
  "recognized_content": "识别出的解题步骤描述",
  "is_correct": true,
  "error_step": "错误定位（正确则为 null）",
  "error_type": "knowledge | habitual | null",
  "concept_tags": ["complementary_counting"],
  "feedback": "自然语言反馈（跟随当前语言）"
}
```

服务端会对模型输出做 JSON 提取（去除代码围栏、括号配平）、字段校验与标签白名单过滤，模型偶尔输出非严格 JSON 也能兜底。批改语言由前端把当前 `locale` 传给后端决定。

---

## 上线到云端（预留架构）

现在记录存本地文件，退出/重启不丢，适合本地演示。上线让多设备/真实云端保存时，**不用改页面和 API**，只需两步：

1. 在 `src/lib/store/` 下新增一个实现 `SubmissionStore` 接口的文件，例如 `supabaseStore.ts`（`list / get / add` 三个方法接你的云数据库）。
2. 在 `src/lib/store/index.ts` 里按环境变量切换驱动：

   ```ts
   const driver = process.env.STORE_DRIVER ?? "file";
   export const store = driver === "supabase" ? supabaseStore : fileStore;
   ```

全站只通过这个 `store` 读写提交记录，因此其余代码零改动。若要区分多个真实用户，再给 `Submission` 加回 `userId` 字段并在接口里按用户过滤即可（当前用固定用户 `me`，见 `src/lib/seed.ts` 的 `CURRENT_USER_ID`）。

> 想真接云数据库时告诉我用 Supabase 还是 Vercel Postgres，我来补上对应实现。

## 重置演示数据

删除 `data/store.json`（以及 `public/uploads/` 下的图片）即可恢复到干净状态，下次启动会自动重建。

## 已知范围（Demo 边界）

- 1v1 私教定位，固定单用户，无注册/登录。
- 云端保存目前用本地文件持久化 + 接口预留，尚未接真数据库。
- 无支付、无真实并发、无生产级安全加固。
- 题库为自编的 Euclid/CSMC 风格题目，规避版权问题。
