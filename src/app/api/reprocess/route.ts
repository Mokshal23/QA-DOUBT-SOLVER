import { NextRequest, NextResponse } from "next/server";
import { reSolveQuestion } from "@/lib/llm/provider";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60; // Up to 60 seconds on Vercel Serverless

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doubtId, questionText, sourceImage, userCorrectionHint } = body;

    let targetImage = sourceImage;
    let targetPrompt = questionText;
    let existingDoubt: any = null;

    if (doubtId) {
      try {
        existingDoubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
        if (existingDoubt) {
          if (!targetImage && existingDoubt.sourceImage) {
            targetImage = existingDoubt.sourceImage;
          }
          if (!targetPrompt && existingDoubt.questionText) {
            targetPrompt = existingDoubt.questionText;
          }
        }
      } catch (dbErr: any) {
        console.warn("Could not query existing doubt:", dbErr?.message);
      }
    }

    if (!targetImage && !targetPrompt) {
      return NextResponse.json(
        { error: "No question text or image found to re-solve." },
        { status: 400 }
      );
    }

    // Call dedicated Re-Solve pass with 4-Step Truth Verification Protocol
    const result = await reSolveQuestion({
      imageBase64: targetImage || undefined,
      textPrompt: targetPrompt || undefined,
      userCorrectionHint: userCorrectionHint || undefined,
    });

    let updatedDoubt = null;

    if (doubtId && existingDoubt) {
      try {
        updatedDoubt = await prisma.doubt.update({
          where: { id: doubtId },
          data: {
            questionText: result.question_text || targetPrompt || existingDoubt.questionText,
            options: JSON.stringify(result.options || []),
            topic: result.topic || existingDoubt.topic,
            subtopic: result.subtopic || existingDoubt.subtopic,
            difficultyEstimate: result.difficulty_estimate || existingDoubt.difficultyEstimate,
            coreIntuition: result.core_intuition || null,
            jugaadHack: result.jugaad_hack ? JSON.stringify(result.jugaad_hack) : null,
            patternTrigger: result.pattern_trigger || null,
            generalizableFramework: result.generalizable_framework || null,
            traditionalSolution: result.traditional_solution || existingDoubt.traditionalSolution,
            shortcuts: JSON.stringify(result.shortcuts || []),
            optionTraps: result.option_traps || null,
            calcVerdict: result.calc_verdict || null,
            selfCheckNote: result.self_check_note || null,
            similarQuestions: result.similar_questions ? JSON.stringify(result.similar_questions) : null,
          },
        });
      } catch (dbErr: any) {
        console.warn("Could not persist updated doubt:", dbErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      doubt: updatedDoubt,
      result,
    });
  } catch (error: any) {
    console.error("Error in /api/reprocess:", error);
    return NextResponse.json(
      { error: error.message || "Failed to re-solve question" },
      { status: 500 }
    );
  }
}
