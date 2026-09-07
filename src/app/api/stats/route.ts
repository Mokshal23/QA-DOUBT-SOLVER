import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let doubts: any[] = [];
    try {
      doubts = await prisma.doubt.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (dbErr: any) {
      console.warn("Could not query doubts for stats:", dbErr?.message);
    }

    const total = doubts.length;

    // Topics list
    const predefinedTopics = [
      "Arithmetic",
      "Algebra",
      "Geometry & Mensuration",
      "Number Systems",
      "Modern Math",
    ];

    const topicCounts: Record<string, { total: number; still_confused: number; understood: number; mastered: number }> = {};
    for (const t of predefinedTopics) {
      topicCounts[t] = { total: 0, still_confused: 0, understood: 0, mastered: 0 };
    }

    const subtopicCounts: Record<string, number> = {};
    const statusCounts = { still_confused: 0, understood: 0, mastered: 0 };
    const mistakeCounts = {
      concept_gap: 0,
      calculation_slip: 0,
      ran_out_of_time: 0,
      option_misread: 0,
      none: 0,
    };

    for (const d of doubts) {
      // Topic
      const t = d.topic || "Arithmetic";
      if (!topicCounts[t]) {
        topicCounts[t] = { total: 0, still_confused: 0, understood: 0, mastered: 0 };
      }
      topicCounts[t].total++;
      if (d.userStatus === "mastered") topicCounts[t].mastered++;
      else if (d.userStatus === "understood") topicCounts[t].understood++;
      else topicCounts[t].still_confused++;

      // Subtopic
      const st = d.subtopic || "General";
      subtopicCounts[st] = (subtopicCounts[st] || 0) + 1;

      // Status
      if (d.userStatus === "mastered") statusCounts.mastered++;
      else if (d.userStatus === "understood") statusCounts.understood++;
      else statusCounts.still_confused++;

      // Mistake tag
      if (d.mistakeTag === "concept_gap") mistakeCounts.concept_gap++;
      else if (d.mistakeTag === "calculation_slip") mistakeCounts.calculation_slip++;
      else if (d.mistakeTag === "ran_out_of_time") mistakeCounts.ran_out_of_time++;
      else if (d.mistakeTag === "option_misread") mistakeCounts.option_misread++;
      else mistakeCounts.none++;
    }

    // Identify weak areas (ranked by highest count of 'still_confused' + 'understood' needing revision)
    const weakTopics = Object.entries(topicCounts)
      .map(([topic, data]) => {
        const weaknessScore = data.still_confused * 2 + data.understood * 1;
        const masteryPercentage = data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0;
        return {
          topic,
          ...data,
          weaknessScore,
          masteryPercentage,
        };
      })
      .sort((a, b) => b.weaknessScore - a.weaknessScore);

    // Top weak subtopics
    const topWeakSubtopics = Object.entries(subtopicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([subtopic, count]) => ({ subtopic, count }));

    return NextResponse.json({
      success: true,
      stats: {
        totalDoubts: total,
        statusCounts,
        topicCounts,
        mistakeCounts,
        weakTopics,
        topWeakSubtopics,
      },
    });
  } catch (error: any) {
    console.error("Error generating stats:", error);
    return NextResponse.json({ error: error.message || "Failed to generate stats" }, { status: 500 });
  }
}
