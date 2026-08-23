import type { Locale, Question } from "./types";

// Central UI string dictionary. Keys are stable; values are per-locale.
export const MESSAGES = {
  "app.title": { zh: "竞赛数学 AI 辅导", en: "Competition Math AI Coach" },
  "app.tagline": {
    zh: "你的专属 1v1 私教",
    en: "Your personal 1:1 tutor",
  },
  "nav.dashboard": { zh: "学情看板", en: "Dashboard" },
  "nav.practice": { zh: "上传批改", en: "Practice" },
  "nav.mistakes": { zh: "错题本", en: "Mistakes" },
  "nav.papers": { zh: "历年真题", en: "Past Papers" },
  "footer.note": { zh: "AI Competition Coach · 产品原型", en: "AI Competition Coach · Prototype" },

  // Dashboard
  "dash.title": { zh: "学情看板", en: "Learning Dashboard" },
  "dash.subtitle": {
    zh: "你的学习画像 · 基于历史批改记录自动生成",
    en: "Your learning profile · generated from your grading history",
  },
  "dash.upload": { zh: "上传新的解答", en: "Upload a solution" },
  "dash.kpi.graded": { zh: "已批改", en: "Graded" },
  "dash.kpi.accuracy": { zh: "总体正确率", en: "Overall accuracy" },
  "dash.kpi.habitual": { zh: "习惯性错误", en: "Habitual errors" },
  "dash.kpi.weak": { zh: "薄弱知识点", en: "Weak concepts" },
  "unit.problems": { zh: "题", en: "" },
  "unit.times": { zh: "次", en: "" },
  "unit.count": { zh: "个", en: "" },
  "dash.radar.title": { zh: "各领域正确率", en: "Accuracy by domain" },
  "dash.radar.sub": { zh: "数论 · 组合 · 代数 · 几何", en: "Number theory · Combinatorics · Algebra · Geometry" },
  "dash.bars.title": { zh: "具体考点掌握度", en: "Mastery by concept" },
  "dash.bars.sub": { zh: "按正确率从低到高", en: "Lowest accuracy first" },
  "dash.errors.title": { zh: "最常出现的错误模式", en: "Most common error patterns" },
  "dash.errors.sub": { zh: "基于 AI 对错误的知识点归因", en: "From the AI's concept attribution of errors" },
  "dash.errors.wrongN": { zh: "相关题目错误", en: "errors on related problems" },
  "dash.errors.habitualN": { zh: "其中习惯性错误", en: "of which habitual" },
  "dash.errors.repeat": { zh: "易反复出错", en: "Recurring" },
  "dash.errors.none": { zh: "太棒了，暂时没有明显的错误模式。", en: "Great — no clear error patterns yet." },
  "dash.trend.title": { zh: "学习曲线", en: "Learning trajectory" },
  "dash.trend.sub": {
    zh: "正确率随练习次数的变化 · 近期状态回升即在进步",
    en: "Accuracy over attempts · a rising recent line means you're improving",
  },
  "dash.trend.rolling": { zh: "近期正确率", en: "Recent form" },
  "dash.trend.cumulative": { zh: "累计正确率", en: "Cumulative" },
  "dash.rec.title": { zh: "为你推荐的练习", en: "Recommended practice" },
  "dash.rec.sub": { zh: "针对正确率最低的知识点定制", en: "Targeted at your lowest-accuracy concepts" },
  "dash.rec.go": { zh: "去练习 →", en: "Practice →" },
  "dash.review.title": { zh: "今日复习", en: "Today's review" },
  "dash.review.sub": {
    zh: "有错题到期，按记忆曲线该复习了",
    en: "Mistakes are due for review on your memory schedule",
  },
  "dash.review.go": { zh: "开始复习 →", en: "Start review →" },
  "dash.empty.title": { zh: "还没有批改记录", en: "No grading records yet" },
  "dash.empty.body": {
    zh: "上传一份解题过程，AI 会自动批改、定位错误并归因到知识点。多做几题后，这里会生成你的专属学习画像。",
    en: "Upload a solution and the AI grades it, locates the error, and maps it to a concept. After a few problems, your learning profile appears here.",
  },
  "dash.empty.cta": { zh: "开始第一次练习", en: "Start your first practice" },

  // Recommendation reasons
  "rec.reason.weak": { zh: "针对薄弱知识点", en: "Targets weak concept" },
  "rec.reason.accuracy": { zh: "正确率", en: "accuracy" },
  "rec.reason.fresh": { zh: "开始练习，建立你的知识画像", en: "Start practicing to build your profile" },
  "rec.reason.consolidate": { zh: "巩固提升：尝试新的挑战题", en: "Level up with a fresh challenge" },

  // Practice
  "practice.title": { zh: "上传批改", en: "Upload & Grade" },
  "practice.subtitle": {
    zh: "选择题目，上传你的手写或打字解答，AI 将批改并定位错误。",
    en: "Pick a problem, upload your handwritten or typed solution, and the AI grades and locates the error.",
  },
  "practice.select": { zh: "选择题目", en: "Select a problem" },
  "practice.uploadLabel": { zh: "上传解答（拍照或选择文件）", en: "Upload solution (photo or file)" },
  "practice.dropTitle": { zh: "点击上传图片", en: "Click to upload an image" },
  "practice.dropHint": { zh: "支持 PNG / JPG，手机可直接拍照", en: "PNG / JPG · phones can take a photo" },
  "practice.selected": { zh: "已选择", en: "Selected" },
  "practice.remove": { zh: "移除", en: "Remove" },
  "practice.submit": { zh: "提交批改", en: "Submit for grading" },
  "practice.submitting": { zh: "AI 正在批改中…", en: "AI is grading…" },
  "practice.submitHint": {
    zh: "提交后 AI 会识别内容、判断对错并归因到知识点",
    en: "The AI will read your work, judge it, and map it to concepts",
  },
  "practice.err.student": { zh: "用户未就绪", en: "User not ready" },
  "practice.err.question": { zh: "请选择题目", en: "Please select a problem" },
  "practice.err.image": { zh: "请上传解题图片", en: "Please upload a solution image" },
  "practice.err.failed": { zh: "提交失败，请重试", en: "Submission failed, please retry" },

  // Result
  "result.back": { zh: "← 返回练习", en: "← Back to practice" },
  "result.toDash": { zh: "查看学情看板 →", en: "View dashboard →" },
  "result.yourUpload": { zh: "你上传的解答", en: "Your uploaded solution" },
  "result.showAnswer": { zh: "查看标准答案", en: "Show model answer" },
  "result.again": { zh: "再练一题", en: "Practice another" },
  "result.similar": { zh: "练同类题", en: "Practice similar" },
  "result.correct": { zh: "回答正确", en: "Correct" },
  "result.wrong": { zh: "存在错误", en: "Has an error" },
  "result.badge": { zh: "AI 批改结果", en: "AI grading result" },
  "result.sec.recognized": { zh: "识别到的解题内容", en: "Recognized solution" },
  "result.sec.error": { zh: "错误定位", en: "Error location" },
  "result.sec.concepts": { zh: "关联知识点", en: "Related concepts" },
  "result.sec.feedback": { zh: "AI 反馈", en: "AI feedback" },
  "result.mock": { zh: "示例批改", en: "Sample grading" },
  "result.notfound": { zh: "记录不存在", en: "Record not found" },

  // Socratic tutor chat
  "tutor.trigger": { zh: "我还是不懂，问问 AI 私教", en: "Still don't get it — ask the AI tutor" },
  "tutor.title": { zh: "AI 私教", en: "AI tutor" },
  "tutor.sub": { zh: "循循善诱，带你自己想出来", en: "Guiding questions, not just answers" },
  "tutor.opener": { zh: "我还是没看懂这道题，能一步步带我想吗？", en: "I still don't understand this problem — can you walk me through it step by step?" },
  "tutor.placeholder": { zh: "说说你的想法或不懂的地方…", en: "Share your thinking or what's unclear…" },
  "tutor.send": { zh: "发送", en: "Send" },
  "tutor.error": { zh: "回复失败，请重试。", en: "Failed to reply — please try again." },

  // Mistakes
  "mistakes.title": { zh: "错题本", en: "Mistake Book" },
  "mistakes.subtitle": { zh: "做错的题目 · 共", en: "Problems you got wrong · " },
  "mistakes.subtitle2": { zh: "道，回顾错误定位与知识点", en: " total — review the errors and concepts" },
  "mistakes.empty.title": { zh: "还没有错题", en: "No mistakes yet" },
  "mistakes.empty.body": {
    zh: "继续上传解答练习，做错的题目会自动收录到这里，方便你复习。",
    en: "Keep practicing — problems you get wrong are collected here for review.",
  },
  "mistakes.empty.cta": { zh: "去练习", en: "Go practice" },

  // Badges
  "diff.easy": { zh: "简单", en: "Easy" },
  "diff.medium": { zh: "中等", en: "Medium" },
  "diff.hard": { zh: "困难", en: "Hard" },
  "err.knowledge": { zh: "知识性错误", en: "Knowledge gap" },
  "err.habitual": { zh: "习惯性错误", en: "Habitual slip" },

  "common.loading": { zh: "加载中…", en: "Loading…" },

  // Past papers
  "papers.title": { zh: "历年竞赛真题", en: "Past Competition Papers" },
  "papers.subtitle": {
    zh: "官方免费真题合集 · 点击即可下载 PDF。所有链接均指向主办方官方发布页面。",
    en: "Official free past papers · click to download the PDF. All links point to the organizers' official sources.",
  },
  "papers.official": { zh: "官方真题", en: "Official archives" },
  "papers.ownBooklet": { zh: "本站练习册", en: "Our practice booklet" },
  "papers.booklet.desc": {
    zh: "由本站原创的 18 道竞赛风格题目整理而成，含标准答案，可直接下载为 PDF 打印练习。",
    en: "18 original contest-style problems written for this site, with model answers — download as a printable PDF.",
  },
  "papers.booklet.download": { zh: "下载练习册 PDF", en: "Download booklet PDF" },
  "papers.problems": { zh: "题目 PDF", en: "Problems PDF" },
  "papers.solutions": { zh: "解答 PDF", en: "Solutions PDF" },
  "papers.viewOnOfficial": { zh: "官方页面", en: "Official page" },
  "papers.allYears": { zh: "全部年份", en: "All years" },
  "papers.official.note": {
    zh: "真题版权归各主办方所有，本站仅提供官方免费下载入口，不转载或修改原文件。",
    en: "Copyright belongs to each organizer. This site only links to their official free downloads — nothing is re-hosted or altered.",
  },

  // Booklet (print) page
  "booklet.title": { zh: "竞赛数学练习册", en: "Competition Math Practice Booklet" },
  "booklet.subtitle": {
    zh: "AI Competition Coach · 原创题目合集",
    en: "AI Competition Coach · Original problem set",
  },
  "booklet.print": { zh: "打印 / 保存为 PDF", en: "Print / Save as PDF" },
  "booklet.back": { zh: "← 返回真题库", en: "← Back to papers" },
  "booklet.problems": { zh: "题目", en: "Problems" },
  "booklet.answers": { zh: "参考答案", en: "Answers" },
  "booklet.problem": { zh: "第", en: "Problem" },
  "booklet.problemUnit": { zh: "题", en: "" },
  "booklet.printHint": {
    zh: "在打印对话框中选择「另存为 PDF」即可下载。",
    en: "In the print dialog, choose \"Save as PDF\" to download.",
  },

  // Practice topic categories
  "practice.category":  { zh: "选择板块", en: "Select topic" },
  "practice.pickPrompt": { zh: "从左侧选择一个板块开始练习", en: "Pick a topic on the left to begin" },
  "practice.roll":      { zh: "换一题 ↺", en: "New question ↺" },
  "practice.hint.show": { zh: "查看方法提示", en: "Show method hints" },
  "practice.hint.hide": { zh: "收起提示", en: "Hide hints" },
  "practice.noQs":      { zh: "该板块暂无题目", en: "No questions in this topic" },

  // Practice modes (recommend / review / free) + deeplink context
  "practice.mode.recommend": { zh: "推荐练习", en: "Recommended" },
  "practice.mode.review":    { zh: "今日复习", en: "Today's review" },
  "practice.mode.free":      { zh: "按板块",   en: "By topic" },
  "practice.mode.recommend.hint": {
    zh: "根据你的薄弱知识点与错题智能挑选，优先练最需要巩固的题目。",
    en: "Picked from your weak concepts and mistakes — practices what needs it most.",
  },
  "practice.mode.review.hint": {
    zh: "到期需要复习的错题，按间隔重复安排，及时巩固记忆。",
    en: "Mistakes due for spaced review — reinforce them before you forget.",
  },
  "practice.context":     { zh: "为什么是这道题", en: "Why this problem" },
  "practice.similarOf":   { zh: "同类题练习：", en: "Similar problems: " },
  "practice.clearFilter": { zh: "清除筛选，回到推荐", en: "Clear filter · back to recommended" },
  "practice.review.empty": {
    zh: "今天没有到期复习的错题，做得不错！",
    en: "Nothing due for review today — nice work!",
  },

  // Mistake book — mastery status, filters, per-entry meta
  "mistakes.filter.all":        { zh: "全部",     en: "All" },
  "mistakes.filter.unresolved": { zh: "待攻克",   en: "Unresolved" },
  "mistakes.filter.reviewing":  { zh: "复习中",   en: "Reviewing" },
  "mistakes.filter.mastered":   { zh: "已掌握",   en: "Mastered" },
  "mistakes.status.unresolved": { zh: "待攻克",   en: "Unresolved" },
  "mistakes.status.reviewing":  { zh: "复习中",   en: "Reviewing" },
  "mistakes.status.mastered":   { zh: "已掌握",   en: "Mastered" },
  "mistakes.due":         { zh: "今日待复习", en: "Due today" },
  "mistakes.attempts":    { zh: "练习次数",   en: "Attempts" },
  "mistakes.wrong":       { zh: "错误次数",   en: "Wrong" },
  "mistakes.similar":     { zh: "练同类题 →", en: "Practice similar →" },
  "mistakes.viewGrading": { zh: "查看批改",   en: "View grading" },

  "cat.permcomb":      { zh: "排列与组合",  en: "Permutations & Combinations" },
  "cat.arithmetic":    { zh: "等差数列",    en: "Arithmetic Sequences" },
  "cat.geometric":     { zh: "等比数列",    en: "Geometric Sequences" },
  "cat.number_theory": { zh: "数论",        en: "Number Theory" },
  "cat.geometry":      { zh: "几何",        en: "Geometry" },
  "cat.algebra":       { zh: "代数与方程",  en: "Algebra & Equations" },
  "cat.inequality":    { zh: "不等式",      en: "Inequalities" },
  "cat.functions":     { zh: "函数",        en: "Functions" },
  "cat.counting":      { zh: "容斥与鸽笼",  en: "Inclusion-Exclusion" },
} as const;

export type MessageKey = keyof typeof MESSAGES;

export function translate(key: MessageKey, locale: Locale): string {
  const entry = MESSAGES[key];
  return entry ? entry[locale] : key;
}

// Localized accessors for question fields.
export function questionTitle(q: Question, locale: Locale): string {
  return locale === "en" ? q.titleEn : q.title;
}
export function questionContent(q: Question, locale: Locale): string {
  return locale === "en" ? q.contentEn : q.content;
}
export function questionAnswer(q: Question, locale: Locale): string {
  return locale === "en" ? q.standardAnswerEn : q.standardAnswer;
}
