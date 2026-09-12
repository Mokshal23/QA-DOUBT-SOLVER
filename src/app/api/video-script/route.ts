import { NextRequest, NextResponse } from "next/server";
import { generateTeacherVideoScript } from "@/lib/llm/provider";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60; // Up to 60 seconds on Vercel Serverless

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      doubtId,
      questionText,
      topic,
      subtopic,
      coreIntuition,
      jugaadHack,
      traditionalSolution,
      shortcuts,
      optionTraps,
      calcVerdict,
    } = body;

    let qText = questionText;
    let t = topic;
    let st = subtopic;
    let ci = coreIntuition;
    let jh = jugaadHack;
    let ts = traditionalSolution;
    let sc = shortcuts;
    let ot = optionTraps;
    let cv = calcVerdict;

    // Optional database hydration if doubtId is provided without full payload
    if (doubtId && !qText) {
      try {
        const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
        if (doubt) {
          qText = doubt.questionText;
          t = doubt.topic;
          st = doubt.subtopic;
          ci = doubt.coreIntuition || undefined;
          jh = doubt.jugaadHack ? JSON.parse(doubt.jugaadHack) : undefined;
          ts = doubt.traditionalSolution;
          sc = doubt.shortcuts ? JSON.parse(doubt.shortcuts) : undefined;
          ot = doubt.optionTraps || undefined;
          cv = doubt.calcVerdict || undefined;
        }
      } catch (dbErr: any) {
        console.warn("DB query for video script fallback:", dbErr?.message);
      }
    }

    if (!qText) {
      return NextResponse.json({ error: "Missing question context" }, { status: 400 });
    }

    const script = await generateTeacherVideoScript({
      questionText: qText,
      topic: t || "Quantitative Ability",
      subtopic: st || "Concept",
      coreIntuition: ci,
      jugaadHack: jh,
      traditionalSolution: ts,
      shortcuts: sc,
      optionTraps: ot,
      calcVerdict: cv,
    });

    return NextResponse.json({
      success: true,
      script,
    });
  } catch (error: any) {
    console.error("Error in /api/video-script:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate teacher video script" },
      { status: 500 }
    );
  }
}
