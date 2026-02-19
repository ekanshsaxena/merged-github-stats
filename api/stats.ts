import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUserStats } from "../lib/github";
import { getMergedStreak } from "../lib/streak";
import { renderStatsCard, renderStreakCard } from "../lib/card";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { type } = req.query;

    const [stats, streak] = await Promise.all([
      getUserStats(),
      getMergedStreak(),
    ]);

    let svg: string;

    if (type === "streak") {
      svg = renderStreakCard(streak);
    } else {
      svg = renderStatsCard(stats, streak);
    }

    // Cache for 30 min, stale-while-revalidate for 1 hour
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=1800, stale-while-revalidate=3600",
    );
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
  } catch (error) {
    console.error("Error generating stats card:", error);

    // Return a graceful error SVG
    const errorSvg = `
<svg width="495" height="100" viewBox="0 0 495 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="494" height="99" rx="12" ry="12" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  <text x="247.5" y="45" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="#f85149" text-anchor="middle">
    ⚠️ Error fetching GitHub stats
  </text>
  <text x="247.5" y="70" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="12" fill="#8b949e" text-anchor="middle">
    Please check your GITHUB_TOKEN configuration
  </text>
</svg>`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(errorSvg);
  }
}
