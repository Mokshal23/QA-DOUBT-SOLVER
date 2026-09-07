import { NextRequest, NextResponse } from "next/server";
import { generateSimilarQuestions } from "@/lib/llm/provider";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doubtId, questionText, topic, subtopic, technique } = body;

    let qText = questionText;
    let t = topic;
    let st = subtopic;
    let tech = technique;

    if (doubtId && !qText) {
      const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
      if (doubt) {
        qText = doubt.questionText;
        t = doubt.topic;
        st = doubt.subtopic;
        const shortcuts = JSON.parse(doubt.shortcuts || "[]");
        tech = shortcuts[0]?.technique || "Standard shortcut";
      }
    }

    if (!qText) {
      return NextResponse.json({ error: "Missing question context" }, { status: 400 });
    }

    const similar = await generateSimilarQuestions({
      questionText: qText,
      topic: t || "General Quant",
      subtopic: st || "Concept",
      technique: tech || "Shortcut Method",
    });

    if (doubtId) {
      await prisma.doubt.update({
        where: { id: doubtId },
        data: {
          similarQuestions: JSON.stringify(similar),
        },
      });
    }

    return NextResponse.json({
      success: true,
      similarQuestions: similar,
    });
  } catch (error: any) {
    console.error("Error in /api/similar:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate similar questions" },
      { status: 500 }
    );
  }
}
