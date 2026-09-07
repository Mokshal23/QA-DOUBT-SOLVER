import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleDoubts = [
  {
    topic: "Arithmetic",
    subtopic: "Time, Speed & Distance",
    difficultyEstimate: "Moderate",
    questionText: "A train leaves station A at 6:00 AM and reaches station B at 10:00 AM. Another train leaves station B at 8:00 AM and reaches station A at 11:30 AM. At what time do the two trains cross each other?",
    options: JSON.stringify(["(A) 8:36 AM", "(B) 8:48 AM", "(C) 8:56 AM", "(D) 9:12 AM"]),
    traditionalSolution: `### Methodical Step-by-Step Solution

1. **Find time taken by each train:**
   - Train 1 (A to B): Leaves 6:00 AM, arrives 10:00 AM $\\rightarrow t_1 = 4$ hours.
   - Train 2 (B to A): Leaves 8:00 AM, arrives 11:30 AM $\\rightarrow t_2 = 3.5 = \\frac{7}{2}$ hours.

2. **Assume a convenient distance between A and B:**
   Let Distance $D = \\text{LCM}(4, 3.5) = \\text{LCM}(4, \\frac{7}{2}) = 28$ km.

3. **Calculate Speeds:**
   - Speed of Train 1: $S_1 = \\frac{28}{4} = 7$ km/hr.
   - Speed of Train 2: $S_2 = \\frac{28}{3.5} = 8$ km/hr.

4. **Distance covered by Train 1 before Train 2 starts (from 6:00 AM to 8:00 AM = 2 hours):**
   $$\\text{Distance covered} = 7 \\times 2 = 14\\text{ km}$$
   $$\\text{Remaining distance at 8:00 AM} = 28 - 14 = 14\\text{ km}$$

5. **Relative Speed after 8:00 AM:**
   $$S_{\\text{rel}} = S_1 + S_2 = 7 + 8 = 15\\text{ km/hr}$$

6. **Time to meet after 8:00 AM:**
   $$t = \\frac{14}{15}\\text{ hours} = \\frac{14}{15} \\times 60 = 56\\text{ minutes}$$

7. **Crossing Time:**
   $$8:00\\text{ AM} + 56\\text{ min} = \\mathbf{8:56\\text{ AM}}$$`,
    shortcuts: JSON.stringify([
      {
        technique: "Relative Distance Ratio Shortcut",
        worked_solution: `1. Train 1 takes 4 hrs; Train 2 takes 3.5 hrs (Ratio of speeds $S_1 : S_2 = 3.5 : 4 = 7 : 8$).
2. By 8:00 AM, Train 1 has completed half its journey (2 of 4 hrs), so exactly $\\frac{1}{2}$ distance remains.
3. The remaining half is covered in speed ratio $7:8$, so time taken $= \\frac{1}{2} \\times \\frac{\\text{Total distance equivalent in time}}{7+8} = \\frac{14}{15} \\times 60 = 56$ mins after 8:00 AM $\\rightarrow \\mathbf{8:56\\text{ AM}}$.`,
        est_seconds: 25,
        why_fast: "≈25 sec — No speed formulas needed, pure time fractions"
      },
      {
        technique: "Option Elimination by Speed Bounds",
        worked_solution: `1. At 8:00 AM, Train 1 is at the exact midpoint.
2. Train 2 is faster ($8$ km/h vs $7$ km/h), so they must meet slightly before Train 1 reaches the $\\frac{3}{4}$ mark (which would be 9:00 AM).
3. Since both speeds are nearly equal, they meet roughly in $\\frac{1}{2}$ of the remaining 2 hours $\\approx 56-58$ minutes after 8:00 AM.
4. Only **8:56 AM** fits the $(7:8)$ slight asymmetry.`,
        est_seconds: 18,
        why_fast: "≈18 sec — Visual bounding eliminates (A), (B), and (D)"
      }
    ]),
    selfCheckNote: "Recognizing that Train 1 is at midpoint at 8 AM reduces the problem to dividing remaining 50% distance in 7:8 ratio.",
    userStatus: "mastered",
    mistakeTag: null,
    userNotes: "Remember: when start times differ, normalize to the later start time first!",
    revisitCount: 3,
    similarQuestions: JSON.stringify([
      {
        question: "Train X leaves Station P at 7:00 AM reaching Q at 11:00 AM. Train Y leaves Station Q at 8:00 AM reaching P at 11:00 AM. At what time do they cross?",
        options: ["(A) 8:45 AM", "(B) 9:12 AM", "(C) 9:17 AM", "(D) 9:30 AM"],
        correct_answer: "(B) 9:12 AM",
        shortcut_hint: "At 8 AM, Train X covered 1/4 of distance. Remaining 3/4 is covered in speed ratio 3:4."
      }
    ])
  },
  {
    topic: "Algebra",
    subtopic: "Maxima & Minima",
    difficultyEstimate: "Hard",
    questionText: "If $x, y, z$ are positive real numbers such that $x + y + z = 18$, find the maximum value of $x^2 y^3 z$.",
    options: JSON.stringify(["(A) $2^6 \\cdot 3^8$", "(B) $2^7 \\cdot 3^9$", "(C) $2^8 \\cdot 3^9$", "(D) $2^{11} \\cdot 3^6$"]),
    traditionalSolution: `### Methodical Step-by-Step Solution (AM-GM Inequality)

1. We want to maximize $P = x^2 y^3 z^1$ subject to $x + y + z = 18$.
2. Note the powers: $x$ has power 2, $y$ has power 3, $z$ has power 1. Total power $= 2 + 3 + 1 = 6$.
3. By the **Weighted AM-GM Inequality**, split each variable into equal parts proportional to its exponent:
   - Split $x$ into 2 parts: $\\frac{x}{2} + \\frac{x}{2}$
   - Split $y$ into 3 parts: $\\frac{y}{3} + \\frac{y}{3} + \\frac{y}{3}$
   - Split $z$ into 1 part: $z$
4. Total sum of these 6 terms:
   $$2 \\left(\\frac{x}{2}\\right) + 3 \\left(\\frac{y}{3}\\right) + z = x + y + z = 18$$
5. Apply AM $\\ge$ GM on the 6 terms:
   $$\\frac{2(\\frac{x}{2}) + 3(\\frac{y}{3}) + z}{6} \\ge \\left[ \\left(\\frac{x}{2}\\right)^2 \\left(\\frac{y}{3}\\right)^3 z \\right]^{1/6}$$
   $$\\frac{18}{6} = 3 \\ge \\left[ \\frac{x^2 y^3 z}{2^2 \\cdot 3^3} \\right]^{1/6}$$
6. Raise both sides to power 6:
   $$3^6 \\ge \\frac{x^2 y^3 z}{4 \\cdot 27}$$
   $$x^2 y^3 z \\le 3^6 \\times 4 \\times 27 = 3^6 \\times 2^2 \\times 3^3 = 2^2 \\cdot 3^9$$
   *(Equality holds when $\\frac{x}{2} = \\frac{y}{3} = z = 3 \\implies x=6, y=9, z=3$)*.`,
    shortcuts: JSON.stringify([
      {
        technique: "Power Equi-Partition Rule (Topper Standard)",
        worked_solution: `1. In CAT, $\\max(x^a y^b z^c)$ with $x+y+z=S$ always occurs when variables are proportional to their powers:
   $$x : y : z = a : b : c = 2 : 3 : 1$$
2. Sum of ratio parts $= 2 + 3 + 1 = 6$ parts $= 18 \\implies 1\\text{ part} = 3$.
3. Directly plug:
   $$x = 2 \\times 3 = 6$$
   $$y = 3 \\times 3 = 9$$
   $$z = 1 \\times 3 = 3$$
4. Compute product:
   $$x^2 y^3 z = (6)^2 (9)^3 (3) = (2 \\cdot 3)^2 \\cdot (3^2)^3 \\cdot 3 = 2^2 \\cdot 3^2 \\cdot 3^6 \\cdot 3^1 = \\mathbf{2^2 \\cdot 3^9}$$`,
        est_seconds: 15,
        why_fast: "≈15 sec — Direct ratio assignment $x:y:z = 2:3:1$, no calculus or inequalities"
      }
    ]),
    selfCheckNote: "No need to write out the AM-GM theorem; toppers directly assign $x:y:z = a:b:c$ and compute.",
    userStatus: "understood",
    mistakeTag: "concept_gap",
    userNotes: "Remember: $x:y:z = a:b:c$ works for any positive linear sum constraint!",
    revisitCount: 1,
    similarQuestions: JSON.stringify([
      {
        question: "If $a, b > 0$ and $2a + 3b = 30$, find the maximum value of $a^3 b^2$.",
        options: ["(A) $3^5 \\cdot 2^6$", "(B) $3^6 \\cdot 2^5$", "(C) $9 \\times 6^4$", "(D) $3^7 \\cdot 2^4$"],
        correct_answer: "(A)",
        shortcut_hint: "Split parts equally: $2a/3 = 3b/2 = 30/(3+2) = 6$."
      }
    ])
  },
  {
    topic: "Number Systems",
    subtopic: "Remainders & Cyclicity",
    difficultyEstimate: "Moderate",
    questionText: "What is the remainder when $3^{2026} + 4^{2026}$ is divided by $25$?",
    options: JSON.stringify(["(A) 0", "(B) 2", "(C) 17", "(D) 24"]),
    traditionalSolution: `### Methodical Step-by-Step Solution (Euler's Totient Theorem)

1. We need to find $(3^{2026} + 4^{2026}) \\pmod{25}$.
2. **Euler's Totient function for 25:**
   $$\\phi(25) = 25 \\times \\left(1 - \\frac{1}{5}\\right) = 20$$
3. Since $\\gcd(3, 25) = 1$ and $\\gcd(4, 25) = 1$, by **Euler's Theorem**:
   $$a^{\\phi(n)} \\equiv 1 \\pmod n \\implies a^{20} \\equiv 1 \\pmod{25}$$
4. Reduce exponents modulo 20:
   $$2026 = 20 \\times 101 + 6 \\implies 2026 \\equiv 6 \\pmod{20}$$
5. Therefore:
   $$3^{2026} \\equiv 3^6 \\pmod{25}$$
   $$4^{2026} \\equiv 4^6 \\pmod{25}$$
6. Compute $3^6 \\pmod{25}$:
   $$3^3 = 27 \\equiv 2 \\pmod{25} \\implies 3^6 = (3^3)^2 \\equiv 2^2 = 4 \\pmod{25}$$
7. Compute $4^6 \\pmod{25}$:
   $$4^2 = 16 \\equiv -9 \\pmod{25}$$
   $$4^3 = 64 \\equiv 14 \\equiv -11 \\pmod{25}$$
   $$4^6 = (4^3)^2 \\equiv (-11)^2 = 121 \\equiv 21 \\equiv -4 \\pmod{25}$$
8. Sum them:
   $$3^{2026} + 4^{2026} \\equiv 4 + (-4) = 0 \\pmod{25}$$
9. The remainder is **0**.`,
    shortcuts: JSON.stringify([
      {
        technique: "Algebraic Factor Symmetry ($a^n + b^n$)",
        worked_solution: `1. Notice $3^2 = 9$ and $4^2 = 16$, and $9 + 16 = 25$.
2. Rewrite:
   $$3^{2026} + 4^{2026} = (3^2)^{1013} + (4^2)^{1013} = 9^{1013} + 16^{1013}$$
3. For odd power $n = 1013$, $(a^n + b^n)$ is **always exactly divisible by $(a + b)$**.
4. Since $a + b = 9 + 16 = 25$, the entire expression is a multiple of 25.
5. Remainder is instantly **0**.`,
        est_seconds: 10,
        why_fast: "≈10 sec — Spotting $3^2+4^2=25$ turns this into a 1-step mental identity"
      }
    ]),
    selfCheckNote: "Recognizing $3^2+4^2=25$ makes Euler totient completely unnecessary in an exam environment.",
    userStatus: "mastered",
    mistakeTag: null,
    userNotes: "Golden rule: Always look for $(a^2 + b^2)$ base transformations when divisor matches sum of squares!",
    revisitCount: 2,
    similarQuestions: JSON.stringify([
      {
        question: "What is the remainder when $2^{2025} + 3^{2025}$ is divided by 35?",
        options: ["(A) 0", "(B) 1", "(C) 5", "(D) 7"],
        correct_answer: "(A)",
        shortcut_hint: "Write as $(2^3)^{675} + (3^3)^{675} = 8^{675} + 27^{675}$, divisible by $8+27=35$."
      }
    ])
  },
  {
    topic: "Geometry & Mensuration",
    subtopic: "Triangles & Circles",
    difficultyEstimate: "Hard",
    questionText: "In a right-angled triangle $ABC$ with right angle at $B$, $AB = 6$ cm and $BC = 8$ cm. A circle is inscribed inside $\\triangle ABC$. Another smaller circle is drawn tangent to the inscribed circle and tangent to the sides $AB$ and $BC$. What is the radius of the smaller circle?",
    options: JSON.stringify(["(A) $3 - 2\\sqrt{2}$", "(B) $2(3 - 2\\sqrt{2})$", "(C) $2(\\sqrt{2} - 1)$", "(D) $4 - 2\\sqrt{2}$"]),
    traditionalSolution: `### Methodical Step-by-Step Solution

1. **Find Hypotenuse $AC$:**
   $$AC = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = 10\\text{ cm}$$

2. **Inradius $R$ of right $\\triangle ABC$:**
   $$R = \\frac{AB + BC - AC}{2} = \\frac{6 + 8 - 10}{2} = \\frac{4}{2} = 2\\text{ cm}$$

3. **Geometry of the Incenter $I$ relative to vertex $B(0,0)$:**
   Since $\\angle B = 90^\\circ$ and the inradius is $R=2$, the center of the incircle is at distance $d_1 = R\\sqrt{2} = 2\\sqrt{2}$ from vertex $B$.

4. **Let $r$ be the radius of the smaller corner circle:**
   - Its center lies along the angle bisector of $B$ at distance $r\\sqrt{2}$ from $B$.
   - The distance from vertex $B$ to center of large incircle is $r\\sqrt{2} + r + R = 2\\sqrt{2}$.

5. **Set up equation:**
   $$r\\sqrt{2} + r + 2 = 2\\sqrt{2}$$
   $$r(\\sqrt{2} + 1) = 2(\\sqrt{2} - 1)$$
   $$r = \\frac{2(\\sqrt{2} - 1)}{\\sqrt{2} + 1}$$

6. **Rationalize denominator:**
   $$r = 2(\\sqrt{2} - 1)(\\sqrt{2} - 1) = 2(2 - 2\\sqrt{2} + 1) = \\mathbf{2(3 - 2\\sqrt{2})}$$`,
    shortcuts: JSON.stringify([
      {
        technique: "Corner Circle Homothety Ratio $\\left(\\frac{\\sqrt{2}-1}{\\sqrt{2}+1}\\right)$",
        worked_solution: `1. Inradius $R = \\frac{6+8-10}{2} = 2$.
2. Any circle nestled in a $90^\\circ$ corner tangent to a circle of radius $R$ always satisfies:
   $$r = R \\left( \\frac{\\sqrt{2}-1}{\\sqrt{2}+1} \\right) = R (\\sqrt{2}-1)^2 = R (3 - 2\\sqrt{2})$$
3. Substitute $R = 2$:
   $$r = 2(3 - 2\\sqrt{2})$$`,
        est_seconds: 15,
        why_fast: "≈15 sec — Standard corner scaling factor $(\\sqrt{2}-1)^2$ applied instantly"
      },
      {
        technique: "Numerical Approximation & Option Spacing",
        worked_solution: `1. $\\sqrt{2} \\approx 1.414$.
2. $3 - 2(1.414) = 3 - 2.828 = 0.172$.
3. $r = 2 \\times 0.172 = 0.344$ cm.
4. Check options:
   - (A) $0.172$
   - (B) $2 \\times 0.172 = 0.344$
   - (C) $2 \\times 0.414 = 0.828$
   - (D) $4 - 2.828 = 1.172$
5. Clearly **(B)** is correct.`,
        est_seconds: 20,
        why_fast: "≈20 sec — Quick float approximation eliminates all distractor options"
      }
    ]),
    selfCheckNote: "Remember standard corner circle factor $k = (\\sqrt{2}-1)^2 = 3-2\\sqrt{2}$.",
    userStatus: "still_confused",
    mistakeTag: "calculation_slip",
    userNotes: "Need to memorize corner factor for $90^\\circ$ corner: $r/R = 3 - 2\\sqrt{2}$.",
    revisitCount: 4,
    similarQuestions: JSON.stringify([
      {
        question: "In a right triangle with legs 9 and 12, what is the radius of the corner circle tangent to the incircle in the right-angled corner?",
        options: ["(A) $3(3 - 2\\sqrt{2})$", "(B) $2(3 - 2\\sqrt{2})$", "(C) $1.5(\\sqrt{2}-1)$", "(D) $3(\\sqrt{2}-1)$"],
        correct_answer: "(A)",
        shortcut_hint: "$R = (9+12-15)/2 = 3$. Radius $= 3(3-2\\sqrt{2})$."
      }
    ])
  },
  {
    topic: "Modern Math",
    subtopic: "Permutations & Combinations",
    difficultyEstimate: "CAT 99+",
    questionText: "In how many ways can 5 distinct balls be distributed into 3 identical boxes such that no box remains empty?",
    options: JSON.stringify(["(A) 25", "(B) 50", "(C) 90", "(D) 150"]),
    traditionalSolution: `### Methodical Step-by-Step Solution (Stirling Numbers of Second Kind)

1. We are partitioning a set of $n = 5$ distinct items into $k = 3$ identical non-empty subsets: this is denoted by $S(5, 3)$ (Stirling numbers of the 2nd kind).
2. Possible partition structures of integer 5 into 3 positive parts:
   - **Case 1: (3, 1, 1)**
     - Choose 3 items for the group of 3: $\\binom{5}{3} = 10$.
     - Remaining 2 items go into single-item groups: $\\binom{2}{1} \\times \\binom{1}{1} / 2! = 1$.
     - Total for Case 1: $10 \\times 1 = 10$ ways.
   - **Case 2: (2, 2, 1)**
     - Choose 1 item for the single group: $\\binom{5}{1} = 5$.
     - Split remaining 4 items into two groups of 2: $\\frac{\\binom{4}{2}}{2!} = \\frac{6}{2} = 3$.
     - Total for Case 2: $5 \\times 3 = 15$ ways.
3. Total number of ways $= 10 + 15 = \\mathbf{25}$ ways.`,
    shortcuts: JSON.stringify([
      {
        technique: "Distinct-to-Identical Inclusion-Exclusion Division",
        worked_solution: `1. If boxes were **distinct**, total surjective distributions $= 3^5 - \\binom{3}{1}2^5 + \\binom{3}{2}1^5$
   $$= 243 - 3(32) + 3(1) = 243 - 96 + 3 = 150$$
2. Since the 3 boxes are **identical**, simply divide by $3! = 6$:
   $$\\text{Ways} = \\frac{150}{6} = \\mathbf{25}$$`,
        est_seconds: 20,
        why_fast: "≈20 sec — Standard formula $\\frac{\\text{onto functions}}{k!} = \\frac{150}{6} = 25$"
      }
    ]),
    selfCheckNote: "Topper recognizes $S(5,3) = \\text{Onto}(5,3) / 3! = 150 / 6 = 25$ without manual case listing.",
    userStatus: "mastered",
    mistakeTag: null,
    userNotes: "Identical boxes with non-empty condition = divide Onto functions by k!",
    revisitCount: 1,
    similarQuestions: JSON.stringify([
      {
        question: "Find the number of ways to distribute 4 distinct candies into 2 identical bowls such that no bowl is empty.",
        options: ["(A) 6", "(B) 7", "(C) 8", "(D) 14"],
        correct_answer: "(B) 7",
        shortcut_hint: "$(2^4 - 2) / 2! = (16-2)/2 = 7$."
      }
    ])
  }
];

async function main() {
  console.log("Seeding authentic CAT Quant doubts...");
  await prisma.doubt.deleteMany();
  for (const d of sampleDoubts) {
    await prisma.doubt.create({
      data: d
    });
  }
  console.log("Seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
