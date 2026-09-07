import { NextRequest, NextResponse } from "next/server";
import { deepRethinkQuestion } from "@/lib/llm/provider";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doubtId, questionText, options, traditionalSolution, existingShortcuts } = body;

    let qText = questionText;
    let opts = options;
    let trad = traditionalSolution;
    let shortcuts = existingShortcuts;

    if (doubtId && (!qText || !opts || !trad)) {
      const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
      if (doubt) {
        qText = doubt.questionText;
        opts = JSON.parse(doubt.options || "[]");
        trad = doubt.traditionalSolution;
        shortcuts = JSON.parse(doubt.shortcuts || "[]");
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
      await prisma.doubt.update({
        where: { id: doubtId },
        data: {
          deepRethinkSolution: JSON.stringify(rethinkResult),
        },
      });
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
