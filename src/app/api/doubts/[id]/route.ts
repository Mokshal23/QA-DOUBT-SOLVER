import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doubt = await prisma.doubt.findUnique({
      where: { id },
    });

    if (!doubt) {
      return NextResponse.json({ error: "Doubt not found" }, { status: 400 });
    }

    // Auto-increment revisit count and update lastRevisitedAt
    let updated = doubt;
    try {
      updated = await prisma.doubt.update({
        where: { id },
        data: {
          revisitCount: { increment: 1 },
          lastRevisitedAt: new Date(),
        },
      });
    } catch (dbErr: any) {
      console.warn("Could not update revisit count on read-only DB:", dbErr?.message);
    }

    return NextResponse.json({
      success: true,
      doubt: {
        ...updated,
        options: JSON.parse(updated.options || "[]"),
        shortcuts: JSON.parse(updated.shortcuts || "[]"),
        jugaadHack: updated.jugaadHack ? JSON.parse(updated.jugaadHack) : null,
        deepRethinkSolution: updated.deepRethinkSolution ? JSON.parse(updated.deepRethinkSolution) : null,
        similarQuestions: updated.similarQuestions ? JSON.parse(updated.similarQuestions) : [],
      },
    });
  } catch (error: any) {
    console.error("Error getting doubt:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch doubt" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      userStatus,
      mistakeTag,
      userNotes,
      topic,
      subtopic,
      difficultyEstimate,
      nextReviewAt,
    } = body;

    const dataToUpdate: any = {};
    if (userStatus !== undefined) dataToUpdate.userStatus = userStatus;
    if (mistakeTag !== undefined) dataToUpdate.mistakeTag = mistakeTag;
    if (userNotes !== undefined) dataToUpdate.userNotes = userNotes;
    if (topic !== undefined) dataToUpdate.topic = topic;
    if (subtopic !== undefined) dataToUpdate.subtopic = subtopic;
    if (difficultyEstimate !== undefined) dataToUpdate.difficultyEstimate = difficultyEstimate;
    if (nextReviewAt !== undefined) dataToUpdate.nextReviewAt = nextReviewAt ? new Date(nextReviewAt) : null;

    const updated = await prisma.doubt.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      doubt: {
        ...updated,
        options: JSON.parse(updated.options || "[]"),
        shortcuts: JSON.parse(updated.shortcuts || "[]"),
        deepRethinkSolution: updated.deepRethinkSolution ? JSON.parse(updated.deepRethinkSolution) : null,
        similarQuestions: updated.similarQuestions ? JSON.parse(updated.similarQuestions) : [],
      },
    });
  } catch (error: any) {
    console.error("Error updating doubt:", error);
    return NextResponse.json({ error: error.message || "Failed to update doubt" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.doubt.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Doubt deleted" });
  } catch (error: any) {
    console.error("Error deleting doubt:", error);
    return NextResponse.json({ error: error.message || "Failed to delete doubt" }, { status: 500 });
  }
}
