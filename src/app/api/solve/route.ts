import { NextRequest, NextResponse } from "next/server";
import { solveQuestion } from "@/lib/llm/provider";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60; // Up to 60 seconds on Vercel Serverless

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, imageMimeType, textPrompt, saveToDb = true } = body;

    if (!imageBase64 && !textPrompt) {
      return NextResponse.json(
        { error: "Please provide an image or question text" },
        { status: 400 }
      );
    }

    const result = await solveQuestion({
      imageBase64,
      imageMimeType,
      textPrompt,
    });

    let savedDoubt = null;
    if (saveToDb) {
      try {
        savedDoubt = await prisma.doubt.create({
          data: {
            sourceImage: imageBase64 ? imageBase64.slice(0, 500000) : null,
            questionText: result.question_text || textPrompt || "Unknown Question",
            options: JSON.stringify(result.options || []),
            topic: result.topic || "Arithmetic",
            subtopic: result.subtopic || "General Quant",
            difficultyEstimate: result.difficulty_estimate || "Moderate",
            coreIntuition: result.core_intuition || null,
            jugaadHack: result.jugaad_hack ? JSON.stringify(result.jugaad_hack) : null,
            patternTrigger: result.pattern_trigger || null,
            generalizableFramework: result.generalizable_framework || null,
            traditionalSolution: result.traditional_solution || "No traditional solution provided.",
            shortcuts: JSON.stringify(result.shortcuts || []),
            optionTraps: result.option_traps || null,
            calcVerdict: result.calc_verdict || null,
            selfCheckNote: result.self_check_note || null,
            userStatus: "still_confused",
            similarQuestions: result.similar_questions ? JSON.stringify(result.similar_questions) : null,
          },
        });
      } catch (dbErr: any) {
        console.warn("DB write skipped or failed (common in read-only serverless environment):", dbErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      doubt: savedDoubt,
      result,
    });
  } catch (error: any) {
    console.error("Error in /api/solve:", error);
    return NextResponse.json(
      { error: error.message || "Failed to solve doubt" },
      { status: 500 }
    );
  }
}
