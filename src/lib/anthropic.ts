import Anthropic from "@anthropic-ai/sdk";
import type { AiResult, Question, Locale } from "./types";
import { CONCEPT_TAGS, tagLabel } from "./concepts";

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

Strict output: output ONLY one JSON object, no explanation text, no markdown fences. Any mathematical expression inside the string fields MUST be written as LaTeX: inline math wrapped in single dollar signs $...$ and standalone formulas in double dollar signs $$...$$ (e.g. write $\\binom{9}{3}$, $x^2+1$, $\\frac{a}{b}$). Do not use markdown code fences for math. Structure:
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

所有数学公式一律用 LaTeX 表示：行内公式用 $...$ 包裹，独立成行的公式用 $$...$$ 包裹（例如 $\binom{5}{2}$、$$\sum_{k=1}^{n} k = \frac{n(n+1)}{2}$$）。这适用于 recognized_content、error_step、feedback 三个字段。普通中文文字不要包裹。

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

// ─────────────────────────────────────────────────────────────────────────────
// Socratic tutor — the "I still don't get it" follow-up conversation.
//
// This is what separates a tutor from a grader: instead of dumping the full
// solution, the tutor asks guiding questions that lead the student to the next
// step themselves. It has the full grading context (what the student wrote,
// where they went wrong, the model answer) so its hints are specific.
// ─────────────────────────────────────────────────────────────────────────────

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

function buildTutorPrompt(question: Question, result: AiResult, locale: Locale): string {
  if (locale === "en") {
    return `You are a warm, patient competition-math tutor helping a student one-on-one, right after their solution was graded. Your teaching style is SOCRATIC: you lead the student to the answer with small guiding questions and hints — you do NOT hand over the full solution.

The problem:
${question.contentEn}

Model answer (for YOUR reference — do not reveal it wholesale):
${question.standardAnswerEn}

What the student wrote (AI recognition):
${result.recognized_content}

Grading verdict: ${result.is_correct ? "correct" : "incorrect"}${
      result.error_step ? `\nWhere it went wrong: ${result.error_step}` : ""
    }
Earlier feedback the student already saw:
${result.feedback}

Rules for every reply:
- Reply in English.
- Keep it short: 2-4 sentences, usually ending in ONE guiding question.
- Give ONE small hint or ask ONE question at a time — never the whole solution.
- Build on what the student just said. If they answer your question correctly, confirm warmly and nudge to the next step.
- Only if the student is clearly stuck after several tries (or explicitly asks for the answer) may you reveal the next concrete step — and even then, just that one step.
- Use LaTeX for math: inline $...$, display $$...$$.
- Be encouraging and human, never condescending. Plain conversational text, no JSON, no markdown headers.`;
  }

  return `你是一位温和、有耐心的竞赛数学 1v1 私教，学生刚拿到这道题的批改结果，想进一步弄懂。你的教学风格是"苏格拉底式"：用一个个小问题和提示引导学生自己想到下一步，绝不直接把完整解法丢给他。

题目：
${question.content}

标准答案（仅供你参考，不要整段照搬给学生）：
${question.standardAnswer}

学生写的内容（AI 识别）：
${result.recognized_content}

批改结论：${result.is_correct ? "正确" : "错误"}${
    result.error_step ? `\n出错的地方：${result.error_step}` : ""
  }
学生已经看过的反馈：
${result.feedback}

每次回复的规则：
- 用中文回复。
- 简短：2-4 句话，通常以一个引导性问题结尾。
- 一次只给一个小提示或问一个问题，绝不一次性给出完整解法。
- 顺着学生刚说的话接。如果他答对了你的问题，先肯定，再引到下一步。
- 只有当学生明显卡了很多次（或直接要答案）时，才可以点出下一个具体步骤——而且也只点这一步。
- 数学公式用 LaTeX：行内 $...$，独立 $$...$$。
- 语气鼓励、像真人，不要居高临下。用自然的对话文字，不要 JSON、不要 markdown 标题。`;
}

// Deterministic mock tutor for when there's no API key. Escalates hints across
// turns so the conversation still feels responsive in a demo.
function mockTutor(
  question: Question,
  result: AiResult,
  history: TutorMessage[],
  locale: Locale
): string {
  // 0-based turn: the first user message (the implicit "I don't get it" opener)
  // maps to lines[0]. Clamp so extra turns keep returning the final nudge.
  const turn = Math.max(0, history.filter((m) => m.role === "user").length - 1);
  const en = locale === "en";
  const tag = result.concept_tags[0];

  if (en) {
    const opener = result.is_correct
      ? "Nice — this one's already correct, so let's make sure you could redo it from scratch. What's the very first thing you'd set up here?"
      : "Let's rebuild it together. Before any computing — what is the problem actually asking you to count or find?";
    const lines = [
      opener,
      `Good start. Think about the method${tag ? ` (${tagLabel(tag, locale)})` : ""}: is it easier to count what you want directly, or to count the opposite and subtract? Which side looks smaller?`,
      result.error_step
        ? `Right — that's the key. Look again at this step: ${result.error_step} Can you redo just that line?`
        : "Exactly. Now carry that idea one step further — what expression do you get?",
      "You're basically there. Put the pieces together and tell me the final number — I'll check it.",
    ];
    return lines[Math.min(turn, lines.length - 1)];
  }

  const opener = result.is_correct
    ? "这道其实已经做对了，那我们确认一下你能不能从头独立再做一遍。你觉得第一步该先设什么、先算什么？"
    : "我们一起把它重搭一遍。先别急着算——这道题到底要你求什么、数什么？用你自己的话说说。";
  const lines = [
    opener,
    `不错。想想方法${tag ? `（${tagLabel(tag, locale)}）` : ""}：是正面直接数容易，还是数反面再减更容易？哪一边的情况更少？`,
    result.error_step
      ? `对，就是这里。再看这一步：${result.error_step} 你能只把这一行重新算一遍吗？`
      : "对。那把这个想法再往下推一步——你会得到什么式子？",
    "基本就差临门一脚了。把各部分拼起来，把最后的数告诉我，我帮你核对。",
  ];
  return lines[Math.min(turn, lines.length - 1)];
}

// Generate the tutor's next reply given the grading context and chat history.
export async function tutorReply(
  question: Question,
  result: AiResult,
  history: TutorMessage[],
  locale: Locale
): Promise<{ reply: string; source: "claude" | "mock" }> {
  if (!hasApiKey()) {
    return { reply: mockTutor(question, result, history, locale), source: "mock" };
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 500,
      system: buildTutorPrompt(question, result, locale),
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });
    const textPart = message.content.find((c) => c.type === "text");
    const reply = textPart && textPart.type === "text" ? textPart.text.trim() : "";
    if (!reply) throw new Error("Empty tutor reply");
    return { reply, source: "claude" };
  } catch (err) {
    console.error("[tutorReply] Claude call failed, using mock:", err);
    return { reply: mockTutor(question, result, history, locale), source: "mock" };
  }
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
