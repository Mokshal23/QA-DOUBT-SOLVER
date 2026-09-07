import { NextRequest, NextResponse } from "next/server";
import { deepRethinkQuestion } from "@/lib/llm/provider";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60; // Up to 60 seconds on Vercel Serverless

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doubtId, questionText, options, traditionalSolution, existingShortcuts } = body;

    let qText = questionText;
    let opts = options;
    let trad = traditionalSolution;
    let shortcuts = existingShortcuts;

    if (doubtId && (!qText || !opts || !trad)) {
      try {
        const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
        if (doubt) {
          qText = doubt.questionText;
          opts = JSON.parse(doubt.options || "[]");
          trad = doubt.traditionalSolution;
          shortcuts = JSON.parse(doubt.shortcuts || "[]");
        }
      } catch (dbErr: any) {
        console.warn("Could not query doubt for rethink:", dbErr?.message);
      }
    }

    if (!qText) {
      return NextResponse.json({ error: "Missing question context" }, { status: 400 });
    }

    const rethinkResult = await deepRethinkQuestion({
      questionText: qText,
      options: Array.isArray(opts) ? opts : [],
      traditionalSolution: trad || "",
      existingShortcuts: Array.isArray(shortcuts) ? shortcuts : [],
    });

    if (doubtId) {
      try {
        await prisma.doubt.update({
          where: { id: doubtId },
          data: {
            deepRethinkSolution: JSON.stringify(rethinkResult),
          },
        });
      } catch (dbErr: any) {
        console.warn("Could not update doubt with rethink solution:", dbErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      result: rethinkResult,
    });
  } catch (error: any) {
    console.error("Error in /api/rethink:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform deep re-think" },
      { status: 500 }
    );
  }
}
