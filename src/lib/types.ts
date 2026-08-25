// Core domain types for the AI Competition Coach demo.

export type Locale = "zh" | "en";

// High-level knowledge domains for competition math.
export type ConceptDomain = "number_theory" | "combinatorics" | "algebra" | "geometry";

export type Difficulty = "easy" | "medium" | "hard";

// Broad practice categories shown in the topic picker.
export type Category =
  | "permcomb"     // 排列与组合
  | "arithmetic"   // 等差数列
  | "geometric"    // 等比数列
  | "number_theory"// 数论
  | "geometry"     // 几何
  | "algebra"      // 代数与方程
  | "inequality"   // 不等式
  | "functions"    // 函数
  | "counting";    // 容斥与鸽笼

// A specific concept tag (fine-grained), e.g. "complementary_counting".
export interface ConceptTag {
  id: string; // machine id, e.g. "complementary_counting"
  label: string; // Chinese display label, e.g. "补集计数"
  labelEn: string; // English display label
  domain: ConceptDomain;
}

export interface Question {
  id: string;
  title: string; // short title for lists (zh)
  titleEn: string;
  content: string; // full problem statement (zh)
  contentEn: string;
  standardAnswer: string; // final answer + key rubric points (zh)
  standardAnswerEn: string;
  rubric: string; // grading guidance handed to the model (zh)
  conceptTags: string[]; // ConceptTag ids — used as method hints (hidden by default)
  domain: ConceptDomain;
  difficulty: Difficulty;
  category: Category;   // broad topic for the practice picker
}

// Structured result returned by the grading model (strict JSON contract).
export interface AiResult {
  recognized_content: string;
  is_correct: boolean;
  error_step: string | null;
  error_type: "knowledge" | "habitual" | null;
  concept_tags: string[]; // ConceptTag ids the error maps to
  feedback: string;
  // Non-model metadata added by the server.
  _source?: "gemini" | "mock";
  _model?: string;
  _locale?: Locale;
}

export interface Submission {
  id: string;
  questionId: string;
  imagePath: string; // public path e.g. /uploads/xxx.png
  aiResult: AiResult;
  createdAt: string; // ISO
}
