import type { Submission } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Demo history. A pre-populated learner journey so a first-time visitor (e.g. a
// judge opening the deployed link) sees a *populated* dashboard — trajectory,
// mastery, spaced-repetition due items, error patterns — instead of empty
// states. Dates are computed relative to "now" at request time so the story
// never goes stale (there are always a couple of items due for review today).
//
// The narrative: the learner keeps forgetting complementary counting early on
// ("你又忘了用补集"), gradually masters it, and has one fresh number-theory slip
// from a few days ago that is now due for review.
//
// Real submissions always take precedence — see fileStore. As soon as the store
// has any real record, this demo history is hidden.
// ─────────────────────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

// A compact spec for one demo attempt; expanded into a full Submission below.
interface Spec {
  daysAgo: number;
  questionId: string;
  correct: boolean;
  tags: string[];
  errorType?: "knowledge" | "habitual";
  recognized: string;
  errorStep?: string;
  feedback: string;
}

// Oldest → newest. Rising accuracy, a complementary-counting mastery arc, and a
// recent number-theory mistake that surfaces as "due for review today".
const SPECS: Spec[] = [
  {
    daysAgo: 32,
    questionId: "q02",
    correct: false,
    tags: ["complementary_counting"],
    errorType: "habitual",
    recognized: "直接枚举奇数位放偶数的情况，算得 $96$。",
    errorStep: "没有用补集，漏掉了部分情形。应为 $5!-3!\\times 2!=120-12=108$。",
    feedback: "思路方向对，但这类“至少”的问题更适合用补集。记住：$\\text{至少}= \\text{总数}-\\text{反面}$。",
  },
  {
    daysAgo: 30,
    questionId: "q11",
    correct: false,
    tags: ["complementary_counting"],
    errorType: "knowledge",
    recognized: "试图直接数“至少两位相同”的四位数，分类混乱。",
    errorStep: "应先算全不同：$9\\times 9\\times 8\\times 7=4536$，再用 $9000-4536=4464$。",
    feedback: "补集计数还没完全掌握。凡是“至少……相同/存在”，先想能不能数反面。",
  },
  {
    daysAgo: 28,
    questionId: "q14",
    correct: true,
    tags: ["combinations"],
    recognized: "设人数 $n$，由 $\\binom{n}{2}=45$ 解得 $n=10$。",
    feedback: "很好，握手问题的组合建模很清楚。",
  },
  {
    daysAgo: 25,
    questionId: "p01",
    correct: false,
    tags: ["complementary_counting"],
    errorType: "habitual",
    recognized: "用捆绑法算 A、B 相邻 $=240$，但最后忘了拿总数去减。",
    errorStep: "结果应为 $6!-240=720-240=480$，你直接写了 $240$。",
    feedback: "又是补集的最后一步！捆绑算出的是“相邻”，别忘了 $\\text{总}-\\text{相邻}$。",
  },
  {
    daysAgo: 23,
    questionId: "a01",
    correct: true,
    tags: ["sequences"],
    recognized: "用等差数列通项 $a_n=a_1+(n-1)d$ 正确求出结果。",
    feedback: "等差数列基本功扎实。",
  },
  {
    daysAgo: 21,
    questionId: "q02",
    correct: false,
    tags: ["complementary_counting"],
    errorType: "habitual",
    recognized: "又用了直接枚举，得到 $100$。",
    errorStep: "仍未用补集：$120-12=108$。",
    feedback: "你又忘了用补集计数了。这是本月第 3 次同类失误，建议把“至少→补集”写在错题本首页。",
  },
  {
    daysAgo: 18,
    questionId: "p02",
    correct: true,
    tags: ["complementary_counting"],
    recognized: "$\\binom{9}{3}-\\binom{5}{3}=84-10=74$。",
    feedback: "这次主动用了补集，进步明显！",
  },
  {
    daysAgo: 16,
    questionId: "q11",
    correct: true,
    tags: ["complementary_counting"],
    recognized: "全不同 $=4536$，$9000-4536=4464$。",
    feedback: "补集思路已经顺了，继续保持。",
  },
  {
    daysAgo: 14,
    questionId: "a02",
    correct: true,
    tags: ["sequences"],
    recognized: "正确建立求和公式并代入。",
    feedback: "数列求和没问题。",
  },
  {
    daysAgo: 12,
    questionId: "p01",
    correct: true,
    tags: ["complementary_counting"],
    recognized: "$720-240=480$，这次没忘减。",
    feedback: "完美，补集的最后一步稳住了。",
  },
  {
    daysAgo: 10,
    questionId: "q02",
    correct: true,
    tags: ["complementary_counting"],
    recognized: "$5!-3!\\times2!=108$。",
    feedback: "第一次一次做对这道题，补集用得很自然。",
  },
  {
    daysAgo: 8,
    questionId: "g01",
    correct: false,
    tags: ["sequences"],
    errorType: "knowledge",
    recognized: "把等比数列当等差处理，公比与公差混淆。",
    errorStep: "等比应为 $a_n=a_1 q^{n-1}$，你用了 $a_1+(n-1)d$。",
    feedback: "等比数列的通项要用乘方，别和等差混。",
  },
  {
    daysAgo: 6,
    questionId: "q02",
    correct: true,
    tags: ["complementary_counting"],
    recognized: "$120-12=108$，一步到位。",
    feedback: "连续两次做对，这道题可以标记为已掌握了。",
  },
  {
    daysAgo: 5,
    questionId: "a01",
    correct: true,
    tags: ["sequences"],
    recognized: "通项与求和都正确。",
    feedback: "稳定发挥。",
  },
  {
    daysAgo: 4,
    questionId: "g01",
    correct: true,
    tags: ["sequences"],
    recognized: "这次用 $a_n=a_1 q^{n-1}$ 正确求解。",
    feedback: "等比通项纠正过来了，很好。",
  },
  {
    daysAgo: 3,
    questionId: "n01",
    correct: false,
    tags: ["modular_arithmetic"],
    errorType: "knowledge",
    recognized: "求余数时直接算大数，未使用同余化简，中途算错。",
    errorStep: "应先取模再运算：$a\\cdot b \\bmod m=((a\\bmod m)(b\\bmod m))\\bmod m$。",
    feedback: "模运算要边算边取模，别等算出大数再取余。这道题需要再复习。",
  },
  {
    daysAgo: 1,
    questionId: "q14",
    correct: true,
    tags: ["combinations"],
    recognized: "$\\binom{n}{2}=45\\Rightarrow n=10$。",
    feedback: "组合建模已经很熟练。",
  },
];

function specToSubmission(spec: Spec, i: number, now: number): Submission {
  const createdAt = new Date(now - spec.daysAgo * DAY_MS).toISOString();
  return {
    id: `demo-${String(i + 1).padStart(2, "0")}`,
    questionId: spec.questionId,
    imagePath: "/demo/solution.svg",
    createdAt,
    aiResult: {
      recognized_content: spec.recognized,
      is_correct: spec.correct,
      error_step: spec.correct ? null : spec.errorStep ?? null,
      error_type: spec.correct ? null : spec.errorType ?? null,
      concept_tags: spec.tags,
      feedback: spec.feedback,
      _source: "mock",
      _locale: "zh",
    },
  };
}

export function isDemoEnabled(): boolean {
  return process.env.DISABLE_DEMO !== "1";
}

// Built fresh each call so `daysAgo` is always relative to the current time.
export function demoSubmissions(): Submission[] {
  const now = Date.now();
  return SPECS.map((s, i) => specToSubmission(s, i, now));
}
