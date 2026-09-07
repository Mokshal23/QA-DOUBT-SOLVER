import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attempts } = body;

    if (!Array.isArray(attempts) || attempts.length === 0) {
      return NextResponse.json(
        { error: "No practice attempts provided" },
        { status: 400 }
      );
    }

    try {
      for (const attempt of attempts) {
        if (!attempt.doubtId) continue;

        const doubt = await prisma.doubt.findUnique({
          where: { id: attempt.doubtId },
        });

        if (!doubt) continue;

        let newStatus = doubt.userStatus;
        if (attempt.isCorrect) {
          if (doubt.userStatus === "still_confused") {
            newStatus = "understood";
          } else if (attempt.timeSpentSeconds && attempt.timeSpentSeconds <= 35) {
            newStatus = "mastered";
          }
        } else {
          newStatus = "still_confused";
        }

        await prisma.doubt.update({
          where: { id: attempt.doubtId },
          data: {
            revisitCount: { increment: 1 },
            lastRevisitedAt: new Date(),
            userStatus: newStatus,
          },
        });
      }
    } catch (dbErr: any) {
      console.warn("Could not persist practice updates to DB:", dbErr?.message);
    }

    return NextResponse.json({ success: true, updatedCount: attempts.length });
  } catch (error: any) {
    console.error("Error in /api/practice/submit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record practice session" },
      { status: 500 }
    );
  }
}
