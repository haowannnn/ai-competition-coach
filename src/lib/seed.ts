import type { Question } from "./types";

// Fixed single user for this 1:1 tutoring demo (no student switching).
// Kept as a constant so a real auth/user id can replace it later.
export const CURRENT_USER_ID = "me";

// 18 original Euclid/CSMC-style problems (self-authored to avoid copyright).
// Each has a final answer + rubric to hand to the grading model, bilingual.
export const SEED_QUESTIONS: Question[] = [
  {
    id: "q01",
    title: "三位数被 7 整除计数",
    titleEn: "Three-digit multiples of 7",
    content: "有多少个三位正整数（100 到 999）能被 7 整除？",
    contentEn: "How many three-digit positive integers (100 to 999) are divisible by 7?",
    standardAnswer:
      "最终答案：128。最小的是 105 = 7×15，最大的是 994 = 7×142，因此共有 142 − 15 + 1 = 128 个。",
    standardAnswerEn:
      "Answer: 128. The smallest is 105 = 7×15 and the largest is 994 = 7×142, so there are 142 − 15 + 1 = 128.",
    rubric:
      "关键步骤：找到范围内 7 的最小倍数(105)与最大倍数(994)，用 142−15+1 计数。常见错误：区间计数忘记 +1；端点判断错误。",
    conceptTags: ["divisibility"],
    domain: "number_theory",
    difficulty: "easy",
  },
  {
    id: "q02",
    title: "至少一个偶数的排列",
    titleEn: "At least one even digit in odd positions",
    content:
      "从数字 1,2,3,4,5 中不重复地排成一个五位数，其中至少包含一个偶数在奇数位（第1,3,5位）的排列有多少个？请用补集思想求解。",
    contentEn:
      "Arrange the digits 1,2,3,4,5 (no repeats) into a five-digit number. How many arrangements have at least one even digit in an odd position (positions 1, 3, 5)? Use complementary counting.",
    standardAnswer:
      "最终答案：108。总排列 5! = 120。奇数位全为奇数的情况：把 3 个奇数放到 3 个奇数位有 3! 种，2 个偶数放到 2 个偶数位有 2! 种，共 3!×2! = 12。故至少一个偶数在奇数位 = 120 − 12 = 108。",
    standardAnswerEn:
      "Answer: 108. Total arrangements 5! = 120. Complement (all odd positions hold odd digits): 3! ways for the odd digits × 2! for the even digits = 12. So 120 − 12 = 108.",
    rubric:
      "关键步骤：识别用补集（总数 − 反面）。反面是‘奇数位全为奇数’。常见错误：忘记减补集、或直接正面硬算导致重复计数。",
    conceptTags: ["complementary_counting", "combinations"],
    domain: "combinatorics",
    difficulty: "medium",
  },
  {
    id: "q03",
    title: "鸽笼：同余配对",
    titleEn: "Pigeonhole: congruent pairs",
    content: "任取 7 个整数，证明其中必有两个数之差能被 6 整除，并说明最少需要几个数才能保证。",
    contentEn:
      "Given any 7 integers, prove two of them differ by a multiple of 6, and state the minimum count needed to guarantee this.",
    standardAnswer:
      "最终答案：7。按模 6 的余数分成 6 类（鸽笼）。取 7 个数必有两个同余，差被 6 整除。6 个数可能余数各不同，故至少 7 个。",
    standardAnswerEn:
      "Answer: 7. Group by residue mod 6 (6 pigeonholes). Among 7 numbers two must share a residue, so their difference is divisible by 6. Six numbers could all differ, so 7 are needed.",
    rubric:
      "关键步骤：以模 6 余数作为 6 个鸽笼，7 个数触发鸽笼原理。常见错误：鸽笼数量数错（写成 6 个数即可）；未说明下界。",
    conceptTags: ["pigeonhole", "modular_arithmetic"],
    domain: "combinatorics",
    difficulty: "medium",
  },
  {
    id: "q04",
    title: "二次方程根之和",
    titleEn: "Sum of roots of a quadratic",
    content: "已知二次方程 x² − (k+2)x + (2k−1) = 0 的两根之和等于两根之积，求 k 的值。",
    contentEn:
      "The quadratic x² − (k+2)x + (2k−1) = 0 has the sum of its roots equal to the product of its roots. Find k.",
    standardAnswer:
      "最终答案：k = 3。由韦达定理，根之和 = k+2，根之积 = 2k−1。令 k+2 = 2k−1，解得 k = 3。",
    standardAnswerEn:
      "Answer: k = 3. By Vieta's, sum = k+2 and product = 2k−1. Setting k+2 = 2k−1 gives k = 3.",
    rubric:
      "关键步骤：用韦达定理写出和与积，建立方程 k+2 = 2k−1。常见错误：韦达定理符号写错（根之和应为 +(k+2)）。",
    conceptTags: ["vieta", "quadratic"],
    domain: "algebra",
    difficulty: "easy",
  },
  {
    id: "q05",
    title: "相似三角形求线段",
    titleEn: "Similar triangles: find a segment",
    content:
      "在三角形 ABC 中，DE 平行于 BC，D 在 AB 上，E 在 AC 上。已知 AD = 4，DB = 6，AE = 5，求 EC。",
    contentEn:
      "In triangle ABC, DE ∥ BC with D on AB and E on AC. Given AD = 4, DB = 6, AE = 5, find EC.",
    standardAnswer:
      "最终答案：EC = 7.5。由 DE∥BC 得 AD/DB = AE/EC，即 4/6 = 5/EC，解得 EC = 30/4 = 7.5。",
    standardAnswerEn:
      "Answer: EC = 7.5. Since DE ∥ BC, AD/DB = AE/EC, so 4/6 = 5/EC, giving EC = 7.5.",
    rubric:
      "关键步骤：识别平行导致的相似/成比例线段 AD/DB = AE/EC。常见错误：比例写反（写成 AD/AB = AE/EC 但代入 DB）。",
    conceptTags: ["similar_triangles"],
    domain: "geometry",
    difficulty: "easy",
  },
  {
    id: "q06",
    title: "容斥：3 或 5 的倍数",
    titleEn: "Inclusion–exclusion: multiples of 3 or 5",
    content: "在 1 到 200 的整数中，有多少个数是 3 的倍数或 5 的倍数？",
    contentEn: "Among the integers 1 to 200, how many are multiples of 3 or 5?",
    standardAnswer:
      "最终答案：93。3 的倍数有 ⌊200/3⌋ = 66 个，5 的倍数有 40 个，15 的倍数有 13 个。由容斥 66 + 40 − 13 = 93。",
    standardAnswerEn:
      "Answer: 93. Multiples of 3: ⌊200/3⌋ = 66; of 5: 40; of 15: 13. By inclusion–exclusion 66 + 40 − 13 = 93.",
    rubric:
      "关键步骤：容斥原理 |A∪B| = |A| + |B| − |A∩B|，其中交集为 15 的倍数。常见错误：忘记减去 15 的倍数（重复计数）。",
    conceptTags: ["inclusion_exclusion", "divisibility"],
    domain: "combinatorics",
    difficulty: "medium",
  },
  {
    id: "q07",
    title: "AM-GM 最小值",
    titleEn: "AM–GM minimum",
    content: "设 x > 0，求 x + 9/x 的最小值，并指出取得最小值时的 x。",
    contentEn: "For x > 0, find the minimum of x + 9/x and the x at which it occurs.",
    standardAnswer:
      "最终答案：最小值为 6，在 x = 3 时取得。由 AM-GM，x + 9/x ≥ 2√(x·9/x) = 6，等号当 x = 9/x 即 x = 3。",
    standardAnswerEn:
      "Answer: minimum 6 at x = 3. By AM–GM, x + 9/x ≥ 2√9 = 6, with equality when x = 9/x, i.e. x = 3.",
    rubric:
      "关键步骤：应用 AM-GM 得下界 6，并验证等号成立条件 x = 3。常见错误：忘记验证等号条件；或误用不等式方向。",
    conceptTags: ["inequalities"],
    domain: "algebra",
    difficulty: "medium",
  },
  {
    id: "q08",
    title: "质因数分解与约数个数",
    titleEn: "Number of divisors",
    content: "求 360 的正约数个数。",
    contentEn: "How many positive divisors does 360 have?",
    standardAnswer:
      "最终答案：24。360 = 2³ × 3² × 5¹，约数个数 = (3+1)(2+1)(1+1) = 24。",
    standardAnswerEn:
      "Answer: 24. 360 = 2³ × 3² × 5¹, so the divisor count is (3+1)(2+1)(1+1) = 24.",
    rubric:
      "关键步骤：正确分解 360 = 2³·3²·5，用指数加一相乘。常见错误：分解错误；或忘记每个指数 +1。",
    conceptTags: ["prime_factorization", "divisibility"],
    domain: "number_theory",
    difficulty: "easy",
  },
  {
    id: "q09",
    title: "等差数列求和",
    titleEn: "Arithmetic series sum",
    content: "一个等差数列首项为 7，公差为 4，求前 20 项之和。",
    contentEn:
      "An arithmetic sequence has first term 7 and common difference 4. Find the sum of the first 20 terms.",
    standardAnswer:
      "最终答案：900。S₂₀ = 20/2 × (2×7 + 19×4) = 10 × (14 + 76) = 10 × 90 = 900。",
    standardAnswerEn:
      "Answer: 900. S₂₀ = 20/2 × (2×7 + 19×4) = 10 × 90 = 900.",
    rubric:
      "关键步骤：用求和公式 Sₙ = n/2(2a₁ + (n−1)d)。常见错误：把 (n−1) 写成 n；算术错误。",
    conceptTags: ["sequences"],
    domain: "algebra",
    difficulty: "easy",
  },
  {
    id: "q10",
    title: "圆内接四边形对角",
    titleEn: "Cyclic quadrilateral opposite angle",
    content: "圆内接四边形 ABCD 中，角 A = 95°，求角 C 的度数。",
    contentEn: "In cyclic quadrilateral ABCD, angle A = 95°. Find angle C.",
    standardAnswer: "最终答案：85°。圆内接四边形对角互补，A + C = 180°，故 C = 85°。",
    standardAnswerEn:
      "Answer: 85°. Opposite angles of a cyclic quadrilateral are supplementary, so C = 180° − 95° = 85°.",
    rubric:
      "关键步骤：应用圆内接四边形对角互补定理。常见错误：误以为对角相等而非互补。",
    conceptTags: ["circle_theorems"],
    domain: "geometry",
    difficulty: "easy",
  },
  {
    id: "q11",
    title: "补集计数：不含重复数字",
    titleEn: "Complementary counting: repeated digits",
    content:
      "四位数（1000 到 9999）中，至少有两个数字相同的有多少个？请用补集求解。",
    contentEn:
      "Among four-digit numbers (1000 to 9999), how many have at least two equal digits? Use complementary counting.",
    standardAnswer:
      "最终答案：4464。总数 9000。各位数字都不同的四位数：首位 9 种(1-9)，之后 9×8×7。9×9×8×7 = 4536。故至少两位相同 = 9000 − 4536 = 4464。",
    standardAnswerEn:
      "Answer: 4464. Total 9000. All-distinct digits: 9×9×8×7 = 4536 (first digit ≠ 0). So 9000 − 4536 = 4464.",
    rubric:
      "关键步骤：补集 = 总数 − ‘所有数字都不同’。注意首位不能为 0。常见错误：首位算成 10 种；或忘记用补集直接硬算。",
    conceptTags: ["complementary_counting", "casework"],
    domain: "combinatorics",
    difficulty: "hard",
  },
  {
    id: "q12",
    title: "模运算求末位",
    titleEn: "Units digit via modular arithmetic",
    content: "求 7^2024 的个位数字。",
    contentEn: "Find the units digit of 7^2024.",
    standardAnswer:
      "最终答案：1。7 的个位以 7,9,3,1 循环，周期 4。2024 ÷ 4 余 0，对应循环末位 1。",
    standardAnswerEn:
      "Answer: 1. Units digits of powers of 7 cycle 7,9,3,1 (period 4). 2024 ≡ 0 mod 4, matching the last in the cycle, 1.",
    rubric:
      "关键步骤：找个位数循环周期 4，用 2024 mod 4 = 0 定位。常见错误：余 0 时错取第一个而非第四个；周期数错。",
    conceptTags: ["modular_arithmetic"],
    domain: "number_theory",
    difficulty: "medium",
  },
  {
    id: "q13",
    title: "解析几何：两点距离与中点",
    titleEn: "Coordinate geometry: midpoint & distance",
    content: "点 A(2, −3) 和 B(8, 5)。求线段 AB 中点坐标以及 AB 的长度。",
    contentEn: "Points A(2, −3) and B(8, 5). Find the midpoint of AB and the length AB.",
    standardAnswer:
      "最终答案：中点 (5, 1)，长度 10。中点 = ((2+8)/2, (−3+5)/2) = (5,1)。长度 = √((8−2)² + (5−(−3))²) = √(36+64) = √100 = 10。",
    standardAnswerEn:
      "Answer: midpoint (5, 1), length 10. Midpoint = (5, 1); length = √(6² + 8²) = √100 = 10.",
    rubric:
      "关键步骤：中点公式与距离公式。常见错误：处理负号出错（5−(−3) 应为 8）。",
    conceptTags: ["coordinate_geometry"],
    domain: "geometry",
    difficulty: "easy",
  },
  {
    id: "q14",
    title: "组合：握手问题",
    titleEn: "Combinations: handshakes",
    content: "一个聚会上每两个人握手一次，共握手 45 次，问有多少人参加？",
    contentEn:
      "At a party each pair of people shakes hands once, for 45 handshakes total. How many people attended?",
    standardAnswer:
      "最终答案：10 人。C(n,2) = n(n−1)/2 = 45，解 n(n−1) = 90，n = 10。",
    standardAnswerEn:
      "Answer: 10. C(n,2) = n(n−1)/2 = 45, so n(n−1) = 90 and n = 10.",
    rubric:
      "关键步骤：建立组合方程 C(n,2)=45 并解二次。常见错误：忘记除以 2（当成排列）。",
    conceptTags: ["combinations"],
    domain: "combinatorics",
    difficulty: "medium",
  },
  {
    id: "q15",
    title: "面积比：中线分割",
    titleEn: "Area ratios: median split",
    content:
      "三角形 ABC 中，D 是 BC 中点，E 是 AD 中点，连接 BE。求三角形 BEC 与三角形 ABC 的面积比。",
    contentEn:
      "In triangle ABC, D is the midpoint of BC and E is the midpoint of AD. Connect BE. Find the ratio of the area of triangle BEC to triangle ABC.",
    standardAnswer:
      "最终答案：1/2。D 为 BC 中点，△ABD 与 △ACD 面积相等（各占 1/2）。E 为 AD 中点，可用面积分割得 △BEC = 1/2 △ABC。",
    standardAnswerEn:
      "Answer: 1/2. Since D is the midpoint of BC, and E the midpoint of AD, splitting areas by these midpoints gives [BEC] = 1/2 [ABC].",
    rubric:
      "关键步骤：利用中点将面积二等分，逐步推面积比。常见错误：面积比与线段比混淆；分割关系搞错。",
    conceptTags: ["area_ratios", "similar_triangles"],
    domain: "geometry",
    difficulty: "hard",
  },
  {
    id: "q16",
    title: "最大公约数与最小公倍数",
    titleEn: "GCD and LCM relation",
    content:
      "两个正整数的最大公约数是 12，最小公倍数是 180，其中一个数是 36，求另一个数。",
    contentEn:
      "Two positive integers have GCD 12 and LCM 180. One of them is 36. Find the other.",
    standardAnswer:
      "最终答案：60。gcd×lcm = 两数之积，12×180 = 36×x，x = 2160/36 = 60。",
    standardAnswerEn:
      "Answer: 60. gcd × lcm = product of the two numbers, so 12×180 = 36×x, giving x = 60.",
    rubric:
      "关键步骤：用 gcd(a,b)×lcm(a,b) = a×b。常见错误：记错该恒等式；算术出错。",
    conceptTags: ["gcd_lcm", "prime_factorization"],
    domain: "number_theory",
    difficulty: "medium",
  },
  {
    id: "q17",
    title: "分类讨论：绝对值方程",
    titleEn: "Casework: absolute value equation",
    content: "解方程 |2x − 3| = x + 4。",
    contentEn: "Solve the equation |2x − 3| = x + 4.",
    standardAnswer:
      "最终答案：x = 7 或 x = −1/3。情况一：2x−3 = x+4 → x = 7（需 x+4≥0，成立）。情况二：2x−3 = −(x+4) → 3x = −1 → x = −1/3（成立）。两解均验证有效。",
    standardAnswerEn:
      "Answer: x = 7 or x = −1/3. Case 1: 2x−3 = x+4 → x = 7. Case 2: 2x−3 = −(x+4) → x = −1/3. Both check out.",
    rubric:
      "关键步骤：按绝对值分两种情况，并检验右边非负/代回验证。常见错误：漏掉一种情况；不检验增根。",
    conceptTags: ["casework", "quadratic"],
    domain: "algebra",
    difficulty: "medium",
  },
  {
    id: "q18",
    title: "函数方程求值",
    titleEn: "Functional equation evaluation",
    content: "函数 f 满足对所有实数 x 有 f(x) + 2f(1 − x) = 3x。求 f(2)。",
    contentEn: "A function f satisfies f(x) + 2f(1 − x) = 3x for all real x. Find f(2).",
    standardAnswer:
      "最终答案：f(2) = −4。代 x=2 得 f(2)+2f(−1)=6；代 x=−1 得 f(−1)+2f(2)=−3。由第一式 f(2)=6−2f(−1)，代入第二式：f(−1)+2(6−2f(−1))=−3 → −3f(−1)+12=−3 → f(−1)=5，故 f(2)=6−2×5=−4。",
    standardAnswerEn:
      "Answer: f(2) = −4. Put x=2: f(2)+2f(−1)=6. Put x=−1: f(−1)+2f(2)=−3. Solving the system gives f(−1)=5 and f(2) = −4.",
    rubric:
      "关键步骤：代入 x 与 1−x 得到二元一次方程组并求解。常见错误：只代一次无法解出；方程组联立算错。",
    conceptTags: ["functional_equations"],
    domain: "algebra",
    difficulty: "hard",
  },
];
