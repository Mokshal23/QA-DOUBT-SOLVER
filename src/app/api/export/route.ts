import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic");
    const status = searchParams.get("status");

    const where: any = {};
    if (topic && topic !== "all") where.topic = topic;
    if (status && status !== "all") where.userStatus = status;

    let doubts: any[] = [];
    try {
      doubts = await prisma.doubt.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    } catch (dbErr: any) {
      console.warn("Export DB query failed:", dbErr?.message);
    }

    let markdown = `# CAT Quantitative Ability - Personal Revision Pack\n\n`;
    markdown += `*Generated on: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}*\n`;
    markdown += `*Total Doubts: ${doubts.length}*\n\n---\n\n`;

    doubts.forEach((d, idx) => {
      const options = JSON.parse(d.options || "[]");
      const shortcuts = JSON.parse(d.shortcuts || "[]");

      markdown += `## Question ${idx + 1}: [${d.topic} - ${d.subtopic}] (${d.difficultyEstimate})\n\n`;
      markdown += `**Status:** ${d.userStatus.toUpperCase()} ${d.mistakeTag ? `| **Mistake Tag:** ${d.mistakeTag}` : ''}\n\n`;
      markdown += `### Question:\n${d.questionText}\n\n`;

      if (options.length > 0) {
        markdown += `**Options:**\n`;
        options.forEach((opt: string) => {
          markdown += `- ${opt}\n`;
        });
        markdown += `\n`;
      }

      markdown += `### ⚡ Topper Shortcut Solutions:\n`;
      shortcuts.forEach((sc: any, scIdx: number) => {
        markdown += `#### Shortcut ${scIdx + 1}: ${sc.technique} (${sc.est_seconds}s)\n`;
        markdown += `*${sc.why_fast}*\n\n`;
        markdown += `${sc.worked_solution}\n\n`;
      });

      markdown += `### 📐 Traditional Methodical Solution:\n`;
      markdown += `${d.traditionalSolution}\n\n`;

      if (d.userNotes) {
        markdown += `> **My Personal Notes:** ${d.userNotes}\n\n`;
      }

      markdown += `---\n\n`;
    });

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="CAT_Quant_Revision_Pack_${Date.now()}.md"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating revision export:", error);
    return NextResponse.json({ error: "Failed to export revision pack" }, { status: 500 });
  }
}
