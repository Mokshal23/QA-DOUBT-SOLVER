# QuantSolver — 99+ Percentile CAT Quant Doubt Solver

**QuantSolver** is a personal, AI-powered CAT Quantitative Ability mentorship and doubt-solving platform. It moves beyond slow textbook derivations to train your mind on **street-smart ~25-second topper attack vectors**, option elimination hacks, and pattern triggers, alongside step-by-step mathematical proofs.

---

## ⚡ Core Features

### 1. 🚀 Dual-Speed Problem Solving
- **🔥 Street-Smart Jugaad Hacks**: 10–25s shortcuts used by actual 99+ percentilers (value substitution, parity symmetry, relative scale, option reverse-engineering).
- **⚡ Fastest Attack Vector**: The optimal, minimal rough-sheet rough work approach.
- **📐 Methodical Formula Proof**: Complete step-by-step mathematical derivation formatted in rich KaTeX LaTeX.
- **⚠️ Negative-Marking Guardrails**: Explicit callouts of distractor traps set by CAT question setters.

### 2. 📋 Clipboard & Multimodal OCR
- Paste screenshots (`Ctrl+V`) directly from your clipboard and press `Enter` to solve immediately.
- High-speed vision extraction using Gemini Flash with zero-hallucination guardrails.
- Re-Solve & Verify engine (`R` key) to re-evaluate from first principles with optional student hints.

### 3. ⏱️ Timed Vault Practice & Exam Simulator (`/practice`)
- Test your entire vault under realistic exam pressure.
- Real-time per-question stopwatch (Green $\le$30s, Amber 30–60s, Red $>$60s).
- CAT Marking Scheme: **+3 Marks** for correct answers, **-1 Mark** for wrong answers.
- Instant SolutionCard reveal with self-grading override.
- End-of-session performance analytics (Accuracy %, Score, Avg Speed, Review Table).

### 4. 🗄️ Doubt Vault & Knowledge Base (`/repository`)
- Searchable question repository filtered by Topic, Difficulty, and Mistake Tags (*Formula Forgot*, *Calculation Slip*, *Trap Fallen*).
- Spaced repetition recall queue.
- One-click Revision Pack markdown export.

### 5. 🎬 Zero-Cost Automated Video Explainer (`V` Key)
- Instant, interactive 16:9 animated chalkboard video player generated for any solved doubt at **$0.00 cost**.
- **Synchronized Voiceover**: Built-in browser neural speech synthesis narrating problem setups, mental models, 25-second shortcuts, and trap warnings.
- **Dynamic 5-Scene Breakdown**:
  1. *The Problem & Givens* (KaTeX equations + options breakdown)
  2. *Core Intuition & Mental Model* (Visual 'Aha!' concept)
  3. *The 25s Jugaad Shortcut* (Timed speed technique & zero-formula hacks)
  4. *Formal Step-by-Step Proof* (Textbook mathematical rigor)
  5. *Option Traps & Exam Takeaways* (Negative-marking warnings)
- **Interactive Lecture Controls**: Timeline scrubber, scene jump pills, variable speech rate (`0.8x` to `1.5x`), mute toggle, and full-screen theater mode.
- Hotkey: Press `V` on any solution card to launch the explainer immediately.

### 6. 🪟 Windows Silent Autostart
- Built-in Windows Startup hook (`WindowStyle 0`) that runs silently in the background on PC boot without popping up command windows.
- Pre-flight port resilience check preventing duplicate instances.
- Handy batch control scripts: `stop_server.bat`, `install_autostart.bat`, and `uninstall_autostart.bat`.

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm / yarn / pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Mokshal23/QA-DOUBT-SOLVER.git
cd QA-DOUBT-SOLVER

# Install dependencies
npm install

# Initialize the SQLite database
npx prisma db push
```

### 3. Configure API Keys
You can either create a `.env` file from `.env.example`:
```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your-gemini-api-key"
GROQ_API_KEY="your-groq-api-key"
```
Or simply launch the application and configure your API keys interactively inside the **Settings** modal in the top navigation bar.

### 4. Run the Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🚀 Deploying to Vercel

QuantSolver is optimized for deployment on **[Vercel](https://vercel.com)**:

### Step 1: Import to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New" > "Project"**.
2. Select and import **`Mokshal23/QA-DOUBT-SOLVER`**.
3. Framework Preset: **Next.js** (auto-detected).

### Step 2: Configure Environment Variables
Under **Environment Variables**, add:

| Variable | Value / Description | Required? |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Your Google Gemini API Key | **Recommended** (Free at Google AI Studio) |
| `GROQ_API_KEY` | Your Groq Cloud API Key | Optional |
| `OPENROUTER_API_KEY` | Your OpenRouter API Key | Optional |
| `OPENAI_API_KEY` | Your OpenAI API Key | Optional |
| `DATABASE_URL` | Connection URL (e.g., `file:/tmp/dev.db` or cloud DB) | Optional |

### ⚡ Vercel Optimizations Applied:
- **`maxDuration = 60`**: All AI solving routes allow up to 60-second execution times to accommodate deep multimodal image analysis and mathematical step derivations.
- **`postinstall: prisma generate`**: Automatically builds `@prisma/client` during Vercel's dependency installation phase so Next.js build never fails on missing client types.
- **Serverless Resilience**: Core AI solving routes are designed with defensive storage fallbacks, ensuring doubt solutions are always generated and delivered to the user even in ephemeral or read-only serverless environments.

---

## 💻 Tech Stack
- **Framework**: [Next.js 16 (App Router + Turbopack)](https://nextjs.org)
- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Math Rendering**: KaTeX, Remark-Math, Rehype-Katex
- **Database & ORM**: SQLite, Prisma ORM
- **LLM Gateway**: Google Gemini, Groq Cloud, OpenAI, OpenRouter

