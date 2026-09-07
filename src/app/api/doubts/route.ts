import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const topic = searchParams.get("topic") || "";
    const subtopic = searchParams.get("subtopic") || "";
    const userStatus = searchParams.get("userStatus") || "";
    const mistakeTag = searchParams.get("mistakeTag") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
    const dueReview = searchParams.get("dueReview") === "true";

    const where: any = {};

    if (search) {
      where.OR = [
        { questionText: { contains: search } },
        { subtopic: { contains: search } },
        { userNotes: { contains: search } },
        { shortcuts: { contains: search } },
      ];
    }

    if (topic && topic !== "all") where.topic = topic;
    if (subtopic && subtopic !== "all") where.subtopic = subtopic;
    if (userStatus && userStatus !== "all") where.userStatus = userStatus;
    if (mistakeTag && mistakeTag !== "all") where.mistakeTag = mistakeTag;
    if (difficulty && difficulty !== "all") where.difficultyEstimate = difficulty;

    if (dueReview) {
      where.OR = [
        { nextReviewAt: { lte: new Date() } },
        { userStatus: { in: ["still_confused", "understood"] } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === "revisitCount") {
      orderBy.revisitCount = sortOrder;
    } else if (sortBy === "updatedAt") {
      orderBy.updatedAt = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const doubts = await prisma.doubt.findMany({
      where,
      orderBy,
    });

    return NextResponse.json({
      success: true,
      doubts: doubts.map((d) => ({
        ...d,
        options: JSON.parse(d.options || "[]"),
        shortcuts: JSON.parse(d.shortcuts || "[]"),
        jugaadHack: d.jugaadHack ? JSON.parse(d.jugaadHack) : null,
        deepRethinkSolution: d.deepRethinkSolution ? JSON.parse(d.deepRethinkSolution) : null,
        similarQuestions: d.similarQuestions ? JSON.parse(d.similarQuestions) : [],
      })),
    });
  } catch (error: any) {
    console.error("Error fetching doubts:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch doubts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      questionText,
      options = [],
      topic = "Arithmetic",
      subtopic = "General Quant",
      difficultyEstimate = "Moderate",
      traditionalSolution,
      shortcuts = [],
      selfCheckNote,
      userStatus = "still_confused",
    } = body;

    const doubt = await prisma.doubt.create({
      data: {
        questionText,
        options: JSON.stringify(options),
        topic,
        subtopic,
        difficultyEstimate,
        traditionalSolution: traditionalSolution || "",
        shortcuts: JSON.stringify(shortcuts),
        selfCheckNote,
        userStatus,
      },
    });

    return NextResponse.json({ success: true, doubt });
  } catch (error: any) {
    console.error("Error creating doubt:", error);
    return NextResponse.json({ error: error.message || "Failed to create doubt" }, { status: 500 });
  }
}
