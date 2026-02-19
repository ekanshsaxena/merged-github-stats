import type { UserStats } from "./github";
import type { StreakInfo } from "./streak";

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

function streakIcon(s: number): string {
  if (s >= 30) return "🔥";
  if (s >= 7) return "⚡";
  if (s >= 1) return "✨";
  return "💤";
}

function fmtDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getColor(count: number, max: number): string {
  if (count === 0) return "#161b22";
  const r = count / max;
  if (r <= 0.25) return "#0e4429";
  if (r <= 0.5) return "#006d32";
  if (r <= 0.75) return "#26a641";
  return "#39d353";
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const FONT = "'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif";

function badge(x: number, y: number): string {
  return `<g transform="translate(${x},${y})">
    <rect width="108" height="22" rx="11" fill="rgba(31,111,235,0.15)" stroke="#1f6feb" stroke-width="0.5"/>
    <text x="54" y="15" text-anchor="middle" font-family="${FONT}" font-size="10" font-weight="600" fill="#58a6ff">🔀 Merged Stats</text>
  </g>`;
}

function heatmapSvg(daily: Record<string, number>): string {
  const cell = 10,
    gap = 2,
    step = cell + gap,
    weeks = 35;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const curSun = new Date(today);
  curSun.setDate(today.getDate() - dow);
  const startSun = new Date(curSun);
  startSun.setDate(curSun.getDate() - (weeks - 1) * 7);

  let maxC = 1;
  for (const c of Object.values(daily)) {
    if (c > maxC) maxC = c;
  }

  let cells = "",
    months = "";
  let lastM = -1;

  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const dt = new Date(startSun);
      dt.setDate(startSun.getDate() + w * 7 + d);
      if (dt > today) continue;

      const ds = fmtDate(dt);
      const count = daily[ds] || 0;
      const x = w * step,
        y = d * step;
      cells += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${getColor(count, maxC)}"><title>${ds}: ${count}</title></rect>`;

      const mo = dt.getMonth();
      if (d === 0 && mo !== lastM) {
        months += `<text x="${x}" y="${7 * step + 11}" font-family="${FONT}" font-size="9" fill="#484f58">${MONTHS[mo]}</text>`;
        lastM = mo;
      }
    }
  }

  const dayLabels =
    `<text x="-26" y="${1 * step + 9}" font-family="${FONT}" font-size="9" fill="#484f58">Mon</text>` +
    `<text x="-28" y="${3 * step + 9}" font-family="${FONT}" font-size="9" fill="#484f58">Wed</text>` +
    `<text x="-20" y="${5 * step + 9}" font-family="${FONT}" font-size="9" fill="#484f58">Fri</text>`;

  const lx = weeks * step - 115;
  const ly = 7 * step + 24;
  const legend =
    `<text x="${lx}" y="${ly}" font-family="${FONT}" font-size="9" fill="#484f58">Less</text>` +
    `<rect x="${lx + 24}" y="${ly - 9}" width="${cell}" height="${cell}" rx="2" fill="#161b22"/>` +
    `<rect x="${lx + 36}" y="${ly - 9}" width="${cell}" height="${cell}" rx="2" fill="#0e4429"/>` +
    `<rect x="${lx + 48}" y="${ly - 9}" width="${cell}" height="${cell}" rx="2" fill="#006d32"/>` +
    `<rect x="${lx + 60}" y="${ly - 9}" width="${cell}" height="${cell}" rx="2" fill="#26a641"/>` +
    `<rect x="${lx + 72}" y="${ly - 9}" width="${cell}" height="${cell}" rx="2" fill="#39d353"/>` +
    `<text x="${lx + 87}" y="${ly}" font-family="${FONT}" font-size="9" fill="#484f58">More</text>`;

  return dayLabels + cells + months + legend;
}

// ===== STATS CARD =====
export function renderStatsCard(stats: UserStats, streak: StreakInfo): string {
  return `<svg width="495" height="195" viewBox="0 0 495 195" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d1117"/><stop offset="100%" stop-color="#161b22"/>
    </linearGradient>
    <linearGradient id="ac" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#58a6ff"/><stop offset="50%" stop-color="#bc8cff"/><stop offset="100%" stop-color="#f778ba"/>
    </linearGradient>
    <clipPath id="cl"><rect x="0.5" y="0.5" width="494" height="194" rx="12"/></clipPath>
  </defs>
  <rect x="0.5" y="0.5" width="494" height="194" rx="12" fill="url(#bg)" stroke="#30363d"/>
  <rect x="0.5" y="0.5" width="494" height="3" fill="url(#ac)" clip-path="url(#cl)"/>

  <text x="25" y="33" font-family="${FONT}" font-size="18" font-weight="700" fill="url(#ac)">Combined GitHub Stats</text>
  <text x="25" y="50" font-family="${FONT}" font-size="11" fill="#8b949e">@ekanshsaxena ∪ @esaxena-flexport</text>
  ${badge(362, 18)}
  <line x1="25" y1="63" x2="470" y2="63" stroke="#21262d"/>

  <g transform="translate(25,82)">
    <circle cx="8" cy="8" r="4" fill="#39d353"/>
    <text x="24" y="12" font-family="${FONT}" font-size="13" fill="#c9d1d9">Contributions</text>
    <text x="205" y="12" font-family="${FONT}" font-size="13" font-weight="700" fill="#39d353" text-anchor="end">${fmt(streak.totalContributions)}</text>

    <circle cx="8" cy="34" r="4" fill="#bc8cff"/>
    <text x="24" y="38" font-family="${FONT}" font-size="13" fill="#c9d1d9">Pull Requests</text>
    <text x="205" y="38" font-family="${FONT}" font-size="13" font-weight="700" fill="#bc8cff" text-anchor="end">${fmt(stats.totalPRs)}</text>

    <circle cx="8" cy="60" r="4" fill="#f0883e"/>
    <text x="24" y="64" font-family="${FONT}" font-size="13" fill="#c9d1d9">Issues</text>
    <text x="205" y="64" font-family="${FONT}" font-size="13" font-weight="700" fill="#f0883e" text-anchor="end">${fmt(stats.totalIssues)}</text>
  </g>

  <g transform="translate(260,82)">
    <circle cx="8" cy="8" r="4" fill="#58a6ff"/>
    <text x="24" y="12" font-family="${FONT}" font-size="13" fill="#c9d1d9">Repositories</text>
    <text x="205" y="12" font-family="${FONT}" font-size="13" font-weight="700" fill="#58a6ff" text-anchor="end">${fmt(stats.totalRepos)}</text>

    <circle cx="8" cy="34" r="4" fill="#e3b341"/>
    <text x="24" y="38" font-family="${FONT}" font-size="13" fill="#c9d1d9">Stars Earned</text>
    <text x="205" y="38" font-family="${FONT}" font-size="13" font-weight="700" fill="#e3b341" text-anchor="end">${fmt(stats.totalStars)}</text>

    <circle cx="8" cy="60" r="4" fill="#f97583"/>
    <text x="24" y="64" font-family="${FONT}" font-size="13" fill="#c9d1d9">Current Streak</text>
    <text x="205" y="64" font-family="${FONT}" font-size="13" font-weight="700" fill="#f97583" text-anchor="end">${streak.currentStreak} days</text>
  </g>
</svg>`;
}

// ===== STREAK + HEATMAP CARD =====
export function renderStreakCard(streak: StreakInfo): string {
  const icon = streakIcon(streak.currentStreak);
  const heatmap = heatmapSvg(streak.dailyContributions);

  return `<svg width="495" height="295" viewBox="0 0 495 295" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d1117"/><stop offset="100%" stop-color="#161b22"/>
    </linearGradient>
    <linearGradient id="ac2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#58a6ff"/><stop offset="50%" stop-color="#bc8cff"/><stop offset="100%" stop-color="#f778ba"/>
    </linearGradient>
    <linearGradient id="fire" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#f78166"/><stop offset="50%" stop-color="#ffa657"/><stop offset="100%" stop-color="#e3b341"/>
    </linearGradient>
    <clipPath id="cl2"><rect x="0.5" y="0.5" width="494" height="294" rx="12"/></clipPath>
  </defs>
  <rect x="0.5" y="0.5" width="494" height="294" rx="12" fill="url(#bg2)" stroke="#30363d"/>
  <rect x="0.5" y="0.5" width="494" height="3" fill="url(#ac2)" clip-path="url(#cl2)"/>

  <text x="25" y="33" font-family="${FONT}" font-size="18" font-weight="700" fill="url(#ac2)">${icon} Contribution Streak</text>
  <text x="25" y="50" font-family="${FONT}" font-size="11" fill="#8b949e">@ekanshsaxena ∪ @esaxena-flexport</text>
  ${badge(362, 18)}
  <line x1="25" y1="60" x2="470" y2="60" stroke="#21262d"/>

  <!-- Streak stats -->
  <g transform="translate(55,75)">
    <text font-family="${FONT}" font-size="36" font-weight="800" fill="url(#fire)" text-anchor="middle" x="55" y="28">${streak.currentStreak}</text>
    <text font-family="${FONT}" font-size="12" fill="#8b949e" text-anchor="middle" x="55" y="46">Current Streak</text>
    <text font-family="${FONT}" font-size="10" fill="#484f58" text-anchor="middle" x="55" y="60">days</text>
  </g>
  <line x1="180" y1="72" x2="180" y2="138" stroke="#21262d"/>
  <g transform="translate(195,75)">
    <text font-family="${FONT}" font-size="36" font-weight="800" fill="#bc8cff" text-anchor="middle" x="55" y="28">${streak.longestStreak}</text>
    <text font-family="${FONT}" font-size="12" fill="#8b949e" text-anchor="middle" x="55" y="46">Longest Streak</text>
    <text font-family="${FONT}" font-size="10" fill="#484f58" text-anchor="middle" x="55" y="60">days</text>
  </g>
  <line x1="320" y1="72" x2="320" y2="138" stroke="#21262d"/>
  <g transform="translate(335,75)">
    <text font-family="${FONT}" font-size="36" font-weight="800" fill="#58a6ff" text-anchor="middle" x="55" y="28">${fmt(streak.totalContributions)}</text>
    <text font-family="${FONT}" font-size="12" fill="#8b949e" text-anchor="middle" x="55" y="46">Total Contribs</text>
    <text font-family="${FONT}" font-size="10" fill="#484f58" text-anchor="middle" x="55" y="60">this year</text>
  </g>

  <line x1="25" y1="148" x2="470" y2="148" stroke="#21262d"/>

  <!-- Heatmap -->
  <g transform="translate(58,160)">
    ${heatmap}
  </g>
</svg>`;
}
