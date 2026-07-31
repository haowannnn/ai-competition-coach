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
  "dash.rec.title": { zh: "为你推荐的练习", en: "Recommended practice" },
  "dash.rec.sub": { zh: "针对正确率最低的知识点定制", en: "Targeted at your lowest-accuracy concepts" },
  "dash.rec.go": { zh: "去练习 →", en: "Practice →" },
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
  "result.correct": { zh: "回答正确", en: "Correct" },
  "result.wrong": { zh: "存在错误", en: "Has an error" },
  "result.badge": { zh: "AI 批改结果", en: "AI grading result" },
  "result.sec.recognized": { zh: "识别到的解题内容", en: "Recognized solution" },
  "result.sec.error": { zh: "错误定位", en: "Error location" },
  "result.sec.concepts": { zh: "关联知识点", en: "Related concepts" },
  "result.sec.feedback": { zh: "AI 反馈", en: "AI feedback" },
  "result.mock": { zh: "示例批改", en: "Sample grading" },
  "result.notfound": { zh: "记录不存在", en: "Record not found" },

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
