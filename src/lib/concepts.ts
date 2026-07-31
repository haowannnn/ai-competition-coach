import type { ConceptTag, ConceptDomain, Locale } from "./types";

// Fine-grained concept tags used across the question bank and grading.
export const CONCEPT_TAGS: ConceptTag[] = [
  // Number theory
  { id: "modular_arithmetic", label: "同余与模运算", labelEn: "Modular arithmetic", domain: "number_theory" },
  { id: "divisibility", label: "整除性质", labelEn: "Divisibility", domain: "number_theory" },
  { id: "prime_factorization", label: "质因数分解", labelEn: "Prime factorization", domain: "number_theory" },
  { id: "gcd_lcm", label: "最大公约数与最小公倍数", labelEn: "GCD & LCM", domain: "number_theory" },
  // Combinatorics
  { id: "complementary_counting", label: "补集计数", labelEn: "Complementary counting", domain: "combinatorics" },
  { id: "pigeonhole", label: "鸽笼原理", labelEn: "Pigeonhole principle", domain: "combinatorics" },
  { id: "casework", label: "分类讨论计数", labelEn: "Casework", domain: "combinatorics" },
  { id: "combinations", label: "组合与排列", labelEn: "Combinations & permutations", domain: "combinatorics" },
  { id: "inclusion_exclusion", label: "容斥原理", labelEn: "Inclusion–exclusion", domain: "combinatorics" },
  // Algebra
  { id: "quadratic", label: "二次方程与判别式", labelEn: "Quadratics & discriminant", domain: "algebra" },
  { id: "vieta", label: "韦达定理", labelEn: "Vieta's formulas", domain: "algebra" },
  { id: "inequalities", label: "不等式（AM-GM 等）", labelEn: "Inequalities (AM–GM)", domain: "algebra" },
  { id: "functional_equations", label: "函数方程", labelEn: "Functional equations", domain: "algebra" },
  { id: "sequences", label: "数列与求和", labelEn: "Sequences & series", domain: "algebra" },
  // Geometry
  { id: "similar_triangles", label: "相似三角形", labelEn: "Similar triangles", domain: "geometry" },
  { id: "circle_theorems", label: "圆的定理", labelEn: "Circle theorems", domain: "geometry" },
  { id: "coordinate_geometry", label: "解析几何", labelEn: "Coordinate geometry", domain: "geometry" },
  { id: "area_ratios", label: "面积比", labelEn: "Area ratios", domain: "geometry" },
];

export const DOMAIN_LABELS: Record<ConceptDomain, { zh: string; en: string }> = {
  number_theory: { zh: "数论", en: "Number theory" },
  combinatorics: { zh: "组合", en: "Combinatorics" },
  algebra: { zh: "代数", en: "Algebra" },
  geometry: { zh: "几何", en: "Geometry" },
};

export function domainLabel(domain: ConceptDomain, locale: Locale): string {
  return DOMAIN_LABELS[domain][locale];
}

const TAG_BY_ID = new Map(CONCEPT_TAGS.map((t) => [t.id, t]));

export function tagLabel(id: string, locale: Locale = "zh"): string {
  const tag = TAG_BY_ID.get(id);
  if (!tag) return id;
  return locale === "en" ? tag.labelEn : tag.label;
}

export function tagDomain(id: string): ConceptDomain | undefined {
  return TAG_BY_ID.get(id)?.domain;
}
