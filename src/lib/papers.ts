import type { Locale } from "./types";

// Curated archive of REAL past competition papers.
//
// Design decision: we do NOT re-host copyrighted PDFs and we do NOT reproduce
// official problems from memory (a single wrong number ruins a contest problem).
// Instead we link directly to the official, freely published sources:
//   - CEMC (University of Waterloo) for Euclid / CSMC / CIMC
//   - imo-official.org for the IMO
// Every link below was verified to resolve (HTTP 200) at build time.

const CEMC = "https://cemc.uwaterloo.ca/sites/default/files/documents";

export interface PaperLink {
  year: number;
  problemsUrl: string;
  solutionsUrl?: string;
}

export interface Competition {
  id: string;
  name: { zh: string; en: string };
  org: { zh: string; en: string };
  blurb: { zh: string; en: string };
  level: { zh: string; en: string };
  officialUrl: string; // landing page for the whole archive
  papers: PaperLink[];
}

// Helper builders for the CEMC filename conventions.
// Euclid: YYYYEuclidContest.pdf / YYYYEuclidSolution.pdf
function euclid(year: number): PaperLink {
  return {
    year,
    problemsUrl: `${CEMC}/${year}/${year}EuclidContest.pdf`,
    // 2020 solutions were not published in the usual path; omit to avoid a dead link.
    solutionsUrl: year === 2020 ? undefined : `${CEMC}/${year}/${year}EuclidSolution.pdf`,
  };
}
// CSMC / CIMC: problems file drops the "Contest" suffix (YYYYCSMC.pdf),
// solutions keep it (YYYYCSMCSolution.pdf).
function cemcSenior(kind: "CSMC" | "CIMC", year: number): PaperLink {
  return {
    year,
    problemsUrl: `${CEMC}/${year}/${year}${kind}.pdf`,
    solutionsUrl: `${CEMC}/${year}/${year}${kind}Solution.pdf`,
  };
}

const EUCLID_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014];
const SENIOR_YEARS = [2024, 2023, 2022, 2021, 2020, 2019];
const IMO_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

// CMO (Canadian Mathematical Olympiad) files have no consistent naming pattern
// across years, so each URL is listed explicitly. All verified to resolve (200).
const CMS = "https://cms.math.ca/wp-content/uploads";
const CMO_PAPERS: PaperLink[] = [
  { year: 2025, problemsUrl: `${CMS}/2025/03/CMO2025-problems.pdf`, solutionsUrl: `${CMS}/2025/04/CMO2025-solutions.pdf` },
  { year: 2024, problemsUrl: `${CMS}/2024/03/CMO2024-problems.pdf`, solutionsUrl: `${CMS}/2024/04/cmo2024-solutions-en.pdf` },
  { year: 2023, problemsUrl: `${CMS}/2023/03/2023CMO-exam-en.pdf`, solutionsUrl: `${CMS}/2023/05/cmo2023-solutions-en.pdf` },
  { year: 2022, problemsUrl: `${CMS}/2022/03/2022CMO-exam-en.pdf`, solutionsUrl: `${CMS}/2022/04/cmo2022-solutions-en.pdf` },
  { year: 2021, problemsUrl: `${CMS}/2021/04/CMO-2021-questions-en-4.pdf`, solutionsUrl: `${CMS}/2021/04/2021CMO_solutions_en-1.pdf` },
  { year: 2020, problemsUrl: `${CMS}/2024/03/exam2020.pdf`, solutionsUrl: `${CMS}/2024/03/sol2020.pdf` },
  { year: 2019, problemsUrl: `${CMS}/2024/03/exam2019.pdf`, solutionsUrl: `${CMS}/2024/03/sol2019.pdf` },
  { year: 2018, problemsUrl: `${CMS}/2024/03/exam2018.pdf`, solutionsUrl: `${CMS}/2024/03/sol2018.pdf` },
];

export const COMPETITIONS: Competition[] = [
  {
    id: "euclid",
    name: { zh: "Euclid 欧几里得数学竞赛", en: "Euclid Mathematics Contest" },
    org: { zh: "滑铁卢大学 CEMC", en: "CEMC · University of Waterloo" },
    blurb: {
      zh: "面向高中毕业年级的旗舰竞赛，10 道大题，考察代数、几何、数论与组合，是北美大学理工申请的重要参考。",
      en: "Waterloo's flagship contest for senior high-school students: 10 problems across algebra, geometry, number theory and combinatorics.",
    },
    level: { zh: "高中 · 中高难度", en: "Grade 12 · Advanced" },
    officialUrl: "https://www.cemc.uwaterloo.ca/contests/past_contests.html",
    papers: EUCLID_YEARS.map(euclid),
  },
  {
    id: "csmc",
    name: { zh: "CSMC 加拿大高中数学竞赛", en: "Canadian Senior Mathematics Contest" },
    org: { zh: "滑铁卢大学 CEMC", en: "CEMC · University of Waterloo" },
    blurb: {
      zh: "高年级学生的进阶竞赛，包含需要完整书写过程的解答题，适合冲刺 Euclid 之外的深度训练。",
      en: "A senior contest featuring full-solution problems — good depth training beyond the Euclid.",
    },
    level: { zh: "高中高年级 · 进阶", en: "Senior · Advanced" },
    officialUrl: "https://www.cemc.uwaterloo.ca/contests/past_contests.html",
    papers: SENIOR_YEARS.map((y) => cemcSenior("CSMC", y)),
  },
  {
    id: "cmo",
    name: { zh: "CMO 加拿大数学奥林匹克", en: "Canadian Mathematical Olympiad" },
    org: { zh: "加拿大数学学会 CMS", en: "Canadian Mathematical Society" },
    blurb: {
      zh: "加拿大最高级别的中学生数学奥赛，全部为证明题，是入选加拿大 IMO 国家队的关键选拔赛，难度极高。",
      en: "Canada's premier olympiad for secondary students — all proof problems, and the key selection contest for Canada's IMO team.",
    },
    level: { zh: "奥赛级别 · 极难", en: "Olympiad · Very hard" },
    officialUrl: "https://cms.math.ca/competitions/cmo/",
    papers: CMO_PAPERS,
  },
  {
    id: "imo",
    name: { zh: "IMO 国际数学奥林匹克", en: "International Mathematical Olympiad" },
    org: { zh: "IMO 官方", en: "IMO Foundation" },
    blurb: {
      zh: "全球最高级别的中学生数学竞赛，每年 6 题、两天完成，全部为证明题。以下链接指向官方每年的题目与结果页面。",
      en: "The world's premier pre-university competition: 6 proof problems over two days. Links go to the official per-year pages.",
    },
    level: { zh: "国家集训队级别 · 极难", en: "Olympiad · Very hard" },
    officialUrl: "https://www.imo-official.org/problems.aspx",
    // IMO problems live on per-year info pages (with problem PDFs + shortlists linked there).
    papers: IMO_YEARS.map((year) => ({
      year,
      problemsUrl: `https://www.imo-official.org/year_info.aspx?year=${year}`,
    })),
  },
];

export function localized<T extends { zh: string; en: string }>(v: T, locale: Locale): string {
  return locale === "en" ? v.en : v.zh;
}
