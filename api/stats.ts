import type { IncomingMessage, ServerResponse } from "http";

// ============== INLINE: github.ts ==============
const USERS = ["ekanshsaxena", "esaxena-flexport"];

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "merged-github-stats",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

interface UserStats {
  totalCommits: number;
  totalPRs: number;
  totalRepos: number;
  totalStars: number;
  totalIssues: number;
}

async function getUserStats(): Promise<UserStats> {
  let totalCommits = 0;
  let totalPRs = 0;
  let totalRepos = 0;
  let totalStars = 0;
  let totalIssues = 0;
  const headers = getHeaders();

  for (const user of USERS) {
    try {
      const repoRes = await fetch(
        `https://api.github.com/users/${user}/repos?per_page=100&type=all`,
        { headers },
      );
      if (repoRes.ok) {
        const repos: any[] = await repoRes.json();
        totalRepos += repos.filter((r: any) => !r.fork).length;
        totalStars += repos.reduce(
          (sum: number, r: any) => sum + (r.stargazers_count || 0),
          0,
        );
      }

      const prRes = await fetch(
        `https://api.github.com/search/issues?q=author:${user}+type:pr`,
        { headers },
      );
      if (prRes.ok) {
        const prData: any = await prRes.json();
        totalPRs += prData.total_count || 0;
      }

      const issueRes = await fetch(
        `https://api.github.com/search/issues?q=author:${user}+type:issue`,
        { headers },
      );
      if (issueRes.ok) {
        const issueData: any = await issueRes.json();
        totalIssues += issueData.total_count || 0;
      }

      const eventRes = await fetch(
        `https://api.github.com/users/${user}/events?per_page=100`,
        { headers },
      );
      if (eventRes.ok) {
        const events: any[] = await eventRes.json();
        const commits = events
          .filter((e: any) => e.type === "PushEvent")
          .reduce(
            (sum: number, e: any) => sum + (e.payload?.commits?.length ?? 0),
            0,
          );
        totalCommits += commits;
      }
    } catch (err) {
      console.error(`Error fetching stats for ${user}:`, err);
    }
  }
  return { totalCommits, totalPRs, totalRepos, totalStars, totalIssues };
}

// ============== INLINE: streak.ts ==============
interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
}

async function getMergedStreak(): Promise<StreakInfo> {
  const dateMap = new Map<string, number>();

  for (const user of USERS) {
    try {
      const res = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${user}`,
      );
      if (!res.ok) continue;
      const data: any = await res.json();
      if (data.contributions) {
        for (const day of data.contributions) {
          const existing = dateMap.get(day.date) ?? 0;
          dateMap.set(day.date, existing + day.count);
        }
      }
    } catch (err) {
      console.error(`Error fetching contributions for ${user}:`, err);
    }
  }

  const sorted = [...dateMap.entries()]
    .filter(([, count]) => count > 0)
    .map(([date]) => date)
    .sort()
    .reverse();

  let totalContributions = 0;
  for (const [, count] of dateMap) {
    totalContributions += count;
  }

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const d = new Date(sorted[i]);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays <= currentStreak + 1) currentStreak++;
    else break;
  }

  const allDates = [...dateMap.entries()]
    .filter(([, count]) => count > 0)
    .map(([date]) => date)
    .sort();

  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(allDates[i - 1]);
      const curr = new Date(allDates[i]);
      const diff = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
      );
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  return { currentStreak, longestStreak, totalContributions };
}

// ============== INLINE: card.ts ==============
function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

function getStreakIcon(streak: number): string {
  if (streak >= 30) return "🔥";
  if (streak >= 7) return "⚡";
  if (streak >= 1) return "✨";
  return "💤";
}

function renderStatsCard(stats: UserStats, streak: StreakInfo): string {
  return `
<svg width="495" height="195" viewBox="0 0 495 195" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#161b22;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#58a6ff" />
      <stop offset="50%" style="stop-color:#bc8cff" />
      <stop offset="100%" style="stop-color:#f778ba" />
    </linearGradient>
    <clipPath id="roundedBg">
      <rect x="0.5" y="0.5" width="494" height="194" rx="12" ry="12"/>
    </clipPath>
  </defs>
  <rect x="0.5" y="0.5" width="494" height="194" rx="12" ry="12" fill="url(#bgGrad)" stroke="#30363d" stroke-width="1"/>
  <rect x="0.5" y="0.5" width="494" height="3" rx="12" ry="12" fill="url(#accentGrad)" clip-path="url(#roundedBg)"/>
  <g transform="translate(25, 35)">
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="18" font-weight="700" fill="url(#accentGrad)">Combined GitHub Stats</text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="11" fill="#8b949e" y="20">ekanshsaxena + esaxena-flexport</text>
  </g>
  <line x1="25" y1="68" x2="470" y2="68" stroke="#21262d" stroke-width="1"/>

  <g transform="translate(25, 90)">
    <g>
      <circle cx="8" cy="8" r="4" fill="#58a6ff"/>
      <text x="24" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" fill="#c9d1d9">Commits</text>
      <text x="200" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" font-weight="700" fill="#58a6ff" text-anchor="end">${formatNumber(stats.totalCommits)}</text>
    </g>
    <g transform="translate(0, 28)">
      <circle cx="8" cy="8" r="4" fill="#bc8cff"/>
      <text x="24" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" fill="#c9d1d9">Pull Requests</text>
      <text x="200" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" font-weight="700" fill="#bc8cff" text-anchor="end">${formatNumber(stats.totalPRs)}</text>
    </g>
    <g transform="translate(0, 56)">
      <circle cx="8" cy="8" r="4" fill="#3fb950"/>
      <text x="24" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" fill="#c9d1d9">Issues</text>
      <text x="200" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" font-weight="700" fill="#3fb950" text-anchor="end">${formatNumber(stats.totalIssues)}</text>
    </g>
  </g>

  <g transform="translate(260, 90)">
    <g>
      <circle cx="8" cy="8" r="4" fill="#f0883e"/>
      <text x="24" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" fill="#c9d1d9">Repos</text>
      <text x="200" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" font-weight="700" fill="#f0883e" text-anchor="end">${formatNumber(stats.totalRepos)}</text>
    </g>
    <g transform="translate(0, 28)">
      <circle cx="8" cy="8" r="4" fill="#e3b341"/>
      <text x="24" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" fill="#c9d1d9">Stars</text>
      <text x="200" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" font-weight="700" fill="#e3b341" text-anchor="end">${formatNumber(stats.totalStars)}</text>
    </g>
    <g transform="translate(0, 56)">
      <circle cx="8" cy="8" r="4" fill="#f778ba"/>
      <text x="24" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" fill="#c9d1d9">Contributions</text>
      <text x="200" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" font-weight="700" fill="#f778ba" text-anchor="end">${formatNumber(streak.totalContributions)}</text>
    </g>
  </g>
</svg>`;
}

function renderStreakCard(streak: StreakInfo): string {
  const icon = getStreakIcon(streak.currentStreak);
  return `
<svg width="495" height="165" viewBox="0 0 495 165" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#161b22;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" style="stop-color:#f78166" />
      <stop offset="50%" style="stop-color:#ffa657" />
      <stop offset="100%" style="stop-color:#e3b341" />
    </linearGradient>
    <linearGradient id="accentGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#58a6ff" />
      <stop offset="50%" style="stop-color:#bc8cff" />
      <stop offset="100%" style="stop-color:#f778ba" />
    </linearGradient>
    <clipPath id="roundedBg2">
      <rect x="0.5" y="0.5" width="494" height="164" rx="12" ry="12"/>
    </clipPath>
  </defs>
  <rect x="0.5" y="0.5" width="494" height="164" rx="12" ry="12" fill="url(#bgGrad2)" stroke="#30363d" stroke-width="1"/>
  <rect x="0.5" y="0.5" width="494" height="3" rx="12" ry="12" fill="url(#accentGrad2)" clip-path="url(#roundedBg2)"/>
  <g transform="translate(25, 35)">
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="18" font-weight="700" fill="url(#accentGrad2)">${icon} Contribution Streak</text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="11" fill="#8b949e" y="20">ekanshsaxena + esaxena-flexport</text>
  </g>
  <line x1="25" y1="68" x2="470" y2="68" stroke="#21262d" stroke-width="1"/>

  <g transform="translate(60, 88)">
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="36" font-weight="800" fill="url(#fireGrad)" text-anchor="middle" x="55" y="30">${streak.currentStreak}</text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="12" fill="#8b949e" text-anchor="middle" x="55" y="52">Current Streak</text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="11" fill="#484f58" text-anchor="middle" x="55" y="68">days</text>
  </g>
  <line x1="195" y1="82" x2="195" y2="155" stroke="#21262d" stroke-width="1"/>
  <g transform="translate(208, 88)">
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="36" font-weight="800" fill="#bc8cff" text-anchor="middle" x="55" y="30">${streak.longestStreak}</text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="12" fill="#8b949e" text-anchor="middle" x="55" y="52">Longest Streak</text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="11" fill="#484f58" text-anchor="middle" x="55" y="68">days</text>
  </g>
  <line x1="340" y1="82" x2="340" y2="155" stroke="#21262d" stroke-width="1"/>
  <g transform="translate(353, 88)">
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="36" font-weight="800" fill="#58a6ff" text-anchor="middle" x="55" y="30">${formatNumber(streak.totalContributions)}</text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="12" fill="#8b949e" text-anchor="middle" x="55" y="52">Total Contribs</text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="11" fill="#484f58" text-anchor="middle" x="55" y="68">this year</text>
  </g>
</svg>`;
}

// ============== HANDLER ==============
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

    const svg =
      type === "streak"
        ? renderStreakCard(streak)
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
    const errorSvg = `<svg width="495" height="80" viewBox="0 0 495 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="494" height="79" rx="12" ry="12" fill="#0d1117" stroke="#30363d"/>
      <text x="247" y="45" font-family="sans-serif" font-size="14" fill="#f85149" text-anchor="middle">${msg.substring(0, 80)}</text>
    </svg>`;
    res.setHeader("Content-Type", "image/svg+xml");
    res.statusCode = 200;
    res.end(errorSvg);
  }
}
