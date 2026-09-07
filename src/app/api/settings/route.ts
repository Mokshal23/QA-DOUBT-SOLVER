import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const map: Record<string, string> = {};
    try {
      const settings = await prisma.setting.findMany();
      for (const s of settings) {
        map[s.key] = s.value;
      }
    } catch (dbErr: any) {
      console.warn("Settings DB not accessible, using process.env:", dbErr?.message);
    }

    const maskKey = (key?: string) => {
      if (!key) return "";
      if (key.length <= 8) return "••••••••";
      return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
    };

    const envGemini = process.env.GEMINI_API_KEY || "";
    const envGroq = process.env.GROQ_API_KEY || "";
    const envOpenRouter = process.env.OPENROUTER_API_KEY || "";
    const envOpenAI = process.env.OPENAI_API_KEY || "";

    return NextResponse.json({
      success: true,
      settings: {
        hasGeminiKey: Boolean(map.GEMINI_API_KEY || envGemini),
        hasGroqKey: Boolean(map.GROQ_API_KEY || envGroq),
        hasOpenRouterKey: Boolean(map.OPENROUTER_API_KEY || envOpenRouter),
        hasOpenAIKey: Boolean(map.OPENAI_API_KEY || envOpenAI),
        maskedGeminiKey: maskKey(map.GEMINI_API_KEY || envGemini),
        maskedGroqKey: maskKey(map.GROQ_API_KEY || envGroq),
        maskedOpenRouterKey: maskKey(map.OPENROUTER_API_KEY || envOpenRouter),
        maskedOpenAIKey: maskKey(map.OPENAI_API_KEY || envOpenAI),
        preferredProvider: map.PREFERRED_PROVIDER || "auto",
        timerDuration: map.TIMER_DURATION || "45",
      },
    });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: error.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      geminiApiKey,
      groqApiKey,
      openrouterApiKey,
      openaiApiKey,
      preferredProvider,
      timerDuration,
    } = body;

    const upsertKey = async (key: string, value?: string) => {
      if (value !== undefined) {
        await prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    };

    if (geminiApiKey !== undefined) await upsertKey("GEMINI_API_KEY", geminiApiKey.trim());
    if (groqApiKey !== undefined) await upsertKey("GROQ_API_KEY", groqApiKey.trim());
    if (openrouterApiKey !== undefined) await upsertKey("OPENROUTER_API_KEY", openrouterApiKey.trim());
    if (openaiApiKey !== undefined) await upsertKey("OPENAI_API_KEY", openaiApiKey.trim());
    if (preferredProvider !== undefined) await upsertKey("PREFERRED_PROVIDER", preferredProvider);
    if (timerDuration !== undefined) await upsertKey("TIMER_DURATION", String(timerDuration));

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Could not persist settings to database. If running on Vercel serverless, please set your API keys directly in Vercel Project Settings > Environment Variables." },
      { status: 500 }
    );
  }
}
