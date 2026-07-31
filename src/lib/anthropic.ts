import Anthropic from "@anthropic-ai/sdk";
import type { AiResult, Question, Locale } from "./types";
import { CONCEPT_TAGS } from "./concepts";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

// Media types Claude's vision input accepts.
type ImgMedia = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

function mediaTypeFor(ext: string): ImgMedia {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    default:
      return "image/png";
  }
}

function buildSystemPrompt(question: Question, locale: Locale): string {
  if (locale === "en") {
    const tagList = CONCEPT_TAGS.map((t) => `- ${t.id} (${t.labelEn})`).join("\n");
    return `You are an experienced competition-math (Euclid / CSMC / IMO style) grader. The student uploads a photo of a handwritten or typed solution. Grade this problem.

Problem:
${question.contentEn}

Model answer and key points:
${question.standardAnswerEn}

Grading notes / common mistakes:
${question.rubric}

Available concept tags (concept_tags MUST be chosen from these ids only):
${tagList}

Your tasks:
1. Read the student's steps from the image and summarize concisely in English (recognized_content).
2. Decide whether the final conclusion is correct (is_correct).
3. If wrong, state exactly which step and what went wrong (error_step); otherwise null.
4. Classify the error as "knowledge" (concept/theorem not mastered) or "habitual" (careless slips, sign errors, forgotten steps that recur); null if correct.
5. Give the most relevant concept_tags (1-3 ids from the list). If correct, give the main concept tag of the problem.
6. Write an encouraging but direct feedback paragraph in English. If it's a habitual error, name the habit, e.g. "You forgot complementary counting again."

Strict output: output ONLY one JSON object, no explanation text, no markdown fences. Structure:
{
  "recognized_content": string,
  "is_correct": boolean,
  "error_step": string | null,
  "error_type": "knowledge" | "habitual" | null,
  "concept_tags": string[],
  "feedback": string
}`;
  }

  const tagList = CONCEPT_TAGS.map((t) => `- ${t.id} (${t.label})`).join("\n");
  return `你是一位资深的竞赛数学（Euclid / CSMC / IMO 风格）批改老师。学生会上传一张手写或打字的解题过程图片。你要批改这道题。

题目：
${question.content}

标准答案与评分要点：
${question.standardAnswer}

评分细则/常见错误：
${question.rubric}

可用的知识点标签（concept_tags 只能从下面这些 id 中选择）：
${tagList}

你的任务：
1. 识别图片中学生的解题步骤，用简洁中文概括（recognized_content）。
2. 判断学生最终结论是否正确（is_correct）。
3. 如果错误，指出具体在哪一步、什么问题（error_step），否则为 null。
4. 判断错误属于 "knowledge"（知识性：概念/定理没掌握）还是 "habitual"（习惯性：粗心、符号、忘记步骤等反复出现的小毛病）；正确则为 null。
5. 给出与该错误最相关的 concept_tags（1-3 个 id，从上面列表中选）。做对时给出本题主要考点的 tag。
6. 用鼓励但直接的口吻写一段中文反馈（feedback），如果发现是习惯性错误，可用类似 "你又忘了用补集计数了" 的口吻点出习惯。

严格输出要求：只输出一个 JSON 对象，不要有任何解释文字、不要用 markdown 代码块围栏。JSON 结构必须是：
{
  "recognized_content": string,
  "is_correct": boolean,
  "error_step": string | null,
  "error_type": "knowledge" | "habitual" | null,
  "concept_tags": string[],
  "feedback": string
}`;
}

// Extract the first balanced JSON object from arbitrary model text.
function extractJson(text: string): string | null {
  // Strip common markdown fences first.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
    } else {
      if (ch === '"') inStr = true;
      else if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return candidate.slice(start, i + 1);
      }
    }
  }
  return null;
}

const VALID_TAGS = new Set(CONCEPT_TAGS.map((t) => t.id));

// Coerce a parsed object into a safe AiResult, dropping bad fields.
function normalize(obj: any, locale: Locale): AiResult {
  const isCorrect = Boolean(obj?.is_correct);
  let errorType = obj?.error_type;
  if (errorType !== "knowledge" && errorType !== "habitual") errorType = null;
  if (isCorrect) errorType = null;

  let tags: string[] = Array.isArray(obj?.concept_tags)
    ? obj.concept_tags.filter((t: unknown): t is string => typeof t === "string" && VALID_TAGS.has(t))
    : [];
  tags = Array.from(new Set(tags)).slice(0, 3);

  const fallbackRecognized = locale === "en" ? "(Could not read the solution)" : "（未能识别解题内容）";
  const fallbackFeedback = locale === "en" ? "(No feedback)" : "（无反馈）";

  return {
    recognized_content:
      typeof obj?.recognized_content === "string" ? obj.recognized_content : fallbackRecognized,
    is_correct: isCorrect,
    error_step:
      !isCorrect && typeof obj?.error_step === "string" && obj.error_step.trim()
        ? obj.error_step
        : null,
    error_type: errorType,
    concept_tags: tags,
    feedback: typeof obj?.feedback === "string" ? obj.feedback : fallbackFeedback,
  };
}

// Deterministic mock so the whole flow demos without an API key.
export function mockGrade(question: Question, locale: Locale): AiResult {
  const hash = question.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const correct = hash % 3 !== 0; // ~2/3 correct
  const primaryTag = question.conceptTags[0] ?? "casework";
  const title = locale === "en" ? question.titleEn : question.title;
  const en = locale === "en";

  if (correct) {
    return {
      recognized_content: en
        ? `The student solved "${title}" with the standard approach; the reasoning is clear and the final answer matches the model answer.`
        : `学生按标准思路完成了本题（${title}），推导清晰，最终结论与标准答案一致。`,
      is_correct: true,
      error_step: null,
      error_type: null,
      concept_tags: [primaryTag],
      feedback: en
        ? "Nicely done — complete reasoning and a correct conclusion. Keep up this clean write-up."
        : "做得很好，思路完整、结论正确。继续保持这种规范的书写。",
      _source: "mock",
    };
  }
  const habitual = hash % 2 === 0;
  return {
    recognized_content: en
      ? `The overall approach is right, but there's a slip at a key step in "${title}".`
      : `学生大体思路正确，但在关键一步出现了偏差（${title}）。`,
    is_correct: false,
    error_step: en
      ? "The error is in the substitution step after setting up the relation, throwing off the final result."
      : "在建立关系式后代入计算的那一步出现错误，导致最终结果偏离标准答案。",
    error_type: habitual ? "habitual" : "knowledge",
    concept_tags: question.conceptTags.slice(0, 2),
    feedback: habitual
      ? en
        ? "The idea is fine, but you slipped again on the substitution step. Plug your answer back in to check next time."
        : "思路没问题，但你又在代入这一步粗心算错了。做完记得回代验证一下结果。"
      : en
        ? "The core concept here isn't fully solid yet. Review the relevant theorem, then try a couple more of the same type."
        : "这道题的核心考点还没完全掌握，建议先复习相关定理再多练两道同类题。",
    _source: "mock",
  };
}

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Grade a submission. Falls back to mock if no key or on API error.
export async function gradeSubmission(
  question: Question,
  imageBase64: string,
  ext: string,
  locale: Locale
): Promise<AiResult> {
  if (!hasApiKey()) {
    const mock = mockGrade(question, locale);
    mock._locale = locale;
    return mock;
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1200,
      system: buildSystemPrompt(question, locale),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaTypeFor(ext),
                data: imageBase64,
              },
            },
            {
              type: "text",
              text:
                locale === "en"
                  ? "This is my solution. Please grade it as instructed and output JSON only."
                  : "这是我的解题过程，请按要求批改并只输出 JSON。",
            },
          ],
        },
      ],
    });

    const textPart = message.content.find((c) => c.type === "text");
    const raw = textPart && textPart.type === "text" ? textPart.text : "";
    const jsonStr = extractJson(raw);
    if (!jsonStr) throw new Error("No JSON found in model output");
    const parsed = JSON.parse(jsonStr);
    const result = normalize(parsed, locale);
    result._source = "claude";
    result._model = DEFAULT_MODEL;
    result._locale = locale;
    return result;
  } catch (err) {
    // Graceful degradation — keep the demo alive even if the API hiccups.
    console.error("[gradeSubmission] Claude call failed, using mock:", err);
    const mock = mockGrade(question, locale);
    mock._locale = locale;
    const prefix =
      locale === "en"
        ? "(Note: AI grading is temporarily unavailable; sample result below.) "
        : "（注意：AI 批改服务暂时不可用，以下为示例结果）";
    mock.feedback = `${prefix}${mock.feedback}`;
    return mock;
  }
}
