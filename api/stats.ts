import type { IncomingMessage, ServerResponse } from "http";

interface ParsedQuery {
  [key: string]: string | string[] | undefined;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    // Parse query string
    const url = new URL(
      req.url || "/",
      `http://${req.headers.host || "localhost"}`,
    );
    const type = url.searchParams.get("type");

    // Dynamic imports to catch any module-level errors
    const { getUserStats } = await import("../lib/github");
    const { getMergedStreak } = await import("../lib/streak");
    const { renderStatsCard, renderStreakCard } = await import("../lib/card");

    const [stats, streak] = await Promise.all([
      getUserStats().catch((err: unknown) => {
        console.error("getUserStats failed:", err);
        return {
          totalCommits: 0,
          totalPRs: 0,
          totalRepos: 0,
          totalStars: 0,
          totalIssues: 0,
        };
      }),
      getMergedStreak().catch((err: unknown) => {
        console.error("getMergedStreak failed:", err);
        return { currentStreak: 0, longestStreak: 0, totalContributions: 0 };
      }),
    ]);

    let svg: string;

    if (type === "streak") {
      svg = renderStreakCard(streak);
    } else {
      svg = renderStatsCard(stats, streak);
    }

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=1800, stale-while-revalidate=3600",
    );
    res.setHeader("Content-Type", "image/svg+xml");
    res.statusCode = 200;
    res.end(svg);
  } catch (error: unknown) {
    console.error("Handler top-level error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    const errorSvg = `
<svg width="495" height="100" viewBox="0 0 495 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="494" height="99" rx="12" ry="12" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  <text x="247.5" y="45" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="#f85149" text-anchor="middle">
    Error fetching GitHub stats
  </text>
  <text x="247.5" y="70" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="11" fill="#8b949e" text-anchor="middle">
    ${message.substring(0, 80)}
  </text>
</svg>`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.statusCode = 200;
    res.end(errorSvg);
  }
}
