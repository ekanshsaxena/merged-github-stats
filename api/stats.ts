import type { IncomingMessage, ServerResponse } from "http";
import { getUserStats } from "../lib/github";
import { getMergedStreak } from "../lib/streak";
import { renderStatsCard, renderStreakCard } from "../lib/card";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const url = new URL(
      req.url || "/",
      `http://${req.headers.host || "localhost"}`,
    );
    const type = url.searchParams.get("type");
    const yearParam = url.searchParams.get("year");
    const year = yearParam ? parseInt(yearParam, 10) : undefined;

    const [stats, streak] = await Promise.all([
      getUserStats().catch((err: unknown) => {
        console.error("getUserStats failed:", err);
        return { totalPRs: 0, totalIssues: 0, totalRepos: 0, totalStars: 0 };
      }),
      getMergedStreak(year).catch((err: unknown) => {
        console.error("getMergedStreak failed:", err);
        return {
          currentStreak: 0,
          longestStreak: 0,
          totalContributions: 0,
          dailyContributions: {} as Record<string, number>,
        };
      }),
    ]);

    const svg =
      type === "streak"
        ? renderStreakCard(streak, year)
        : renderStatsCard(stats, streak);

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=1800, stale-while-revalidate=3600",
    );
    res.setHeader("Content-Type", "image/svg+xml");
    res.statusCode = 200;
    res.end(svg);
  } catch (error: unknown) {
    console.error("Handler error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.setHeader("Content-Type", "image/svg+xml");
    res.statusCode = 200;
    res.end(
      `<svg width="495" height="80" viewBox="0 0 495 80" xmlns="http://www.w3.org/2000/svg"><rect x=".5" y=".5" width="494" height="79" rx="12" fill="#0d1117" stroke="#30363d"/><text x="247" y="45" font-family="sans-serif" font-size="14" fill="#f85149" text-anchor="middle">${msg.substring(0, 80)}</text></svg>`,
    );
  }
}
