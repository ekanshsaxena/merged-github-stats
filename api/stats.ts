import { getUserStats } from "../lib/github.js";
import { getMergedStreak } from "../lib/streak.js";

export default async function handler(req, res) {
  const stats = await getUserStats();
  const streak = await getMergedStreak();

  const svg = `
  <svg width="420" height="180" xmlns="http://www.w3.org/2000/svg">
    <style>
      .title { font: bold 18px sans-serif; fill: #333 }
      .stat { font: 14px sans-serif; fill: #555 }
    </style>

    <text x="20" y="30" class="title">Combined GitHub Stats</text>

    <text x="20" y="70" class="stat">Commits: ${stats.totalCommits}</text>
    <text x="20" y="95" class="stat">PRs: ${stats.totalPRs}</text>
    <text x="20" y="120" class="stat">Repos: ${stats.totalRepos}</text>
    <text x="20" y="145" class="stat">Streak: ${streak} days</text>
  </svg>
  `;

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(svg);
}
