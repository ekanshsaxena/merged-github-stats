import type { UserStats } from "./github";
import type { StreakInfo } from "./streak";

const F = "'Segoe UI',Ubuntu,'Helvetica Neue',sans-serif";
const MS = [
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

function fmt(n: number): string {
  return n >= 1e6
    ? (n / 1e6).toFixed(1) + "M"
    : n >= 1e3
      ? (n / 1e3).toFixed(1) + "k"
      : String(n);
}
function fd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function gc(c: number, m: number): string {
  if (!c) return "#161b22";
  const r = c / m;
  return r <= 0.25
    ? "#0e4429"
    : r <= 0.5
      ? "#006d32"
      : r <= 0.75
        ? "#26a641"
        : "#39d353";
}

export function renderStatsCard(stats: UserStats, streak: StreakInfo): string {
  const mx = Math.max(
    stats.totalPRs,
    stats.totalIssues,
    stats.totalRepos,
    stats.totalStars,
    1,
  );
  const bw = 140;
  const bars = [
    { l: "Pull Requests", v: stats.totalPRs, c: "#bc8cff" },
    { l: "Issues", v: stats.totalIssues, c: "#f0883e" },
    { l: "Repositories", v: stats.totalRepos, c: "#58a6ff" },
    { l: "Stars Earned", v: stats.totalStars, c: "#e3b341" },
  ];
  const R = 35,
    C = 2 * Math.PI * R;
  const si =
    streak.currentStreak >= 30
      ? "🔥"
      : streak.currentStreak >= 7
        ? "⚡"
        : streak.currentStreak >= 1
          ? "✨"
          : "💤";

  let bsvg = "";
  bars.forEach((b, i) => {
    const w = Math.max((b.v / mx) * bw, 6);
    const y = 75 + i * 28;
    const dl = (0.4 + i * 0.15).toFixed(2);
    bsvg += `
    <text x="175" y="${y + 14}" font-family="${F}" font-size="12" fill="#8b949e" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".4s" begin="${dl}s" fill="freeze"/>${b.l}</text>
    <rect x="285" y="${y + 4}" width="${bw}" height="10" rx="5" fill="#21262d"/>
    <rect x="285" y="${y + 4}" width="0" height="10" rx="5" fill="${b.c}"><animate attributeName="width" from="0" to="${w}" dur=".8s" begin="${dl}s" fill="freeze"/></rect>
    <text x="${285 + bw + 12}" y="${y + 14}" font-family="${F}" font-size="13" font-weight="700" fill="${b.c}" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".3s" begin="${(parseFloat(dl) + 0.5).toFixed(2)}s" fill="freeze"/>${fmt(b.v)}</text>`;
  });

  return `<svg width="495" height="220" viewBox="0 0 495 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0d1117"/><stop offset="100%" stop-color="#161b22"/></linearGradient>
    <linearGradient id="ac" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#58a6ff"/><stop offset="50%" stop-color="#bc8cff"/><stop offset="100%" stop-color="#f778ba"/></linearGradient>
    <linearGradient id="rg" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#0e4429"/><stop offset="100%" stop-color="#39d353"/></linearGradient>
    <clipPath id="cl"><rect x=".5" y=".5" width="494" height="219" rx="12"/></clipPath>
  </defs>
  <rect x=".5" y=".5" width="494" height="219" rx="12" fill="url(#bg)" stroke="#30363d"/>
  <rect x=".5" y=".5" width="494" height="3" fill="url(#ac)" clip-path="url(#cl)"/>
  <text x="25" y="30" font-family="${F}" font-size="16" font-weight="700" fill="url(#ac)" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".5s" begin="0s" fill="freeze"/>GitHub Stats</text>
  <text x="25" y="47" font-family="${F}" font-size="11" fill="#484f58" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".5s" begin=".1s" fill="freeze"/>ekanshsaxena • esaxena-flexport</text>
  <line x1="25" y1="57" x2="470" y2="57" stroke="#21262d"/>

  <!-- Contribution Ring -->
  <g transform="translate(85,140)">
    <circle r="${R}" fill="none" stroke="#21262d" stroke-width="6"/>
    <circle r="${R}" fill="none" stroke="url(#rg)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" transform="rotate(-90)">
      <animate attributeName="stroke-dashoffset" from="${C.toFixed(1)}" to="${(C * 0.18).toFixed(1)}" dur="1.5s" begin=".3s" fill="freeze"/>
    </circle>
    <text y="0" text-anchor="middle" font-family="${F}" font-size="24" font-weight="800" fill="#e6edf3" opacity="0">
      <animate attributeName="opacity" from="0" to="1" dur=".5s" begin=".8s" fill="freeze"/>${fmt(streak.totalContributions)}</text>
    <text y="18" text-anchor="middle" font-family="${F}" font-size="10" fill="#8b949e" opacity="0">
      <animate attributeName="opacity" from="0" to="1" dur=".3s" begin="1s" fill="freeze"/>contributions</text>
  </g>

  <!-- Bar Chart -->
  ${bsvg}

  <!-- Streak -->
  <text x="25" y="210" font-family="${F}" font-size="10" fill="#484f58" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".4s" begin="1.2s" fill="freeze"/>${si} ${streak.currentStreak}d streak · ${streak.longestStreak}d best</text>
</svg>`;
}

// ===== HEATMAP =====
function buildHeatmap(daily: Record<string, number>, year: number): string {
  const cl = 7,
    gp = 1,
    st = cl + gp;
  const isCur = year === new Date().getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const j1 = new Date(year, 0, 1);
  const ss = new Date(j1);
  ss.setDate(j1.getDate() - j1.getDay());
  const d31 = new Date(year, 11, 31);
  const end = isCur && today < d31 ? today : d31;
  const tw = Math.ceil((end.getTime() - ss.getTime()) / 864e5 / 7) + 1;

  let mx = 1;
  for (const [d, c] of Object.entries(daily)) {
    if (d.startsWith(String(year)) && c > mx) mx = c;
  }

  let cells = "",
    mons = "";
  let lm = -1;
  for (let w = 0; w < tw; w++) {
    const dl = (w * 0.02).toFixed(2);
    for (let d = 0; d < 7; d++) {
      const dt = new Date(ss);
      dt.setDate(ss.getDate() + w * 7 + d);
      const x = w * st,
        y = d * st;
      if (dt > end || dt < j1) {
        cells += `<rect x="${x}" y="${y}" width="${cl}" height="${cl}" rx="1.5" fill="transparent"/>`;
        continue;
      }
      const ds = fd(dt),
        cnt = daily[ds] || 0;
      cells += `<rect x="${x}" y="${y}" width="${cl}" height="${cl}" rx="1.5" fill="${gc(cnt, mx)}" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".2s" begin="${dl}s" fill="freeze"/><title>${ds}: ${cnt}</title></rect>`;
      if (d === 0 && dt.getMonth() !== lm) {
        lm = dt.getMonth();
        mons += `<text x="${x}" y="${7 * st + 10}" font-family="${F}" font-size="8" fill="#484f58">${MS[lm]}</text>`;
      }
    }
  }

  const dl = `<text x="-20" y="${1 * st + 6}" font-family="${F}" font-size="8" fill="#484f58">Mon</text><text x="-22" y="${3 * st + 6}" font-family="${F}" font-size="8" fill="#484f58">Wed</text><text x="-16" y="${5 * st + 6}" font-family="${F}" font-size="8" fill="#484f58">Fri</text>`;
  const lx = (tw - 1) * st - 85,
    ly = 7 * st + 22;
  const leg =
    `<text x="${lx}" y="${ly}" font-family="${F}" font-size="8" fill="#484f58">Less</text>` +
    [0, 1, 2, 3, 4]
      .map(
        (i) =>
          `<rect x="${lx + 22 + i * 9}" y="${ly - 7}" width="7" height="7" rx="1.5" fill="${["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"][i]}"/>`,
      )
      .join("") +
    `<text x="${lx + 70}" y="${ly}" font-family="${F}" font-size="8" fill="#484f58">More</text>`;

  return dl + cells + mons + leg;
}

// ===== STREAK + HEATMAP CARD =====
export function renderStreakCard(streak: StreakInfo, year?: number): string {
  const yr = year || new Date().getFullYear();
  const hm = buildHeatmap(streak.dailyContributions, yr);
  const si =
    streak.currentStreak >= 30
      ? "🔥"
      : streak.currentStreak >= 7
        ? "⚡"
        : streak.currentStreak >= 1
          ? "✨"
          : "💤";

  return `<svg width="495" height="210" viewBox="0 0 495 210" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="b2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0d1117"/><stop offset="100%" stop-color="#161b22"/></linearGradient>
    <linearGradient id="a2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#58a6ff"/><stop offset="50%" stop-color="#bc8cff"/><stop offset="100%" stop-color="#f778ba"/></linearGradient>
    <clipPath id="c2"><rect x=".5" y=".5" width="494" height="209" rx="12"/></clipPath>
  </defs>
  <rect x=".5" y=".5" width="494" height="209" rx="12" fill="url(#b2)" stroke="#30363d"/>
  <rect x=".5" y=".5" width="494" height="3" fill="url(#a2)" clip-path="url(#c2)"/>
  <text x="25" y="30" font-family="${F}" font-size="16" font-weight="700" fill="url(#a2)" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".5s" begin="0s" fill="freeze"/>Contribution Activity</text>
  <text x="25" y="47" font-family="${F}" font-size="11" fill="#484f58" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".5s" begin=".1s" fill="freeze"/>ekanshsaxena • esaxena-flexport</text>
  <text x="470" y="30" text-anchor="end" font-family="${F}" font-size="14" font-weight="700" fill="#39d353" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".5s" begin=".2s" fill="freeze"/>${fmt(streak.totalContributions)} contributions</text>
  <text x="470" y="47" text-anchor="end" font-family="${F}" font-size="11" fill="#484f58" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".4s" begin=".3s" fill="freeze"/>in ${yr}</text>
  <line x1="25" y1="57" x2="470" y2="57" stroke="#21262d"/>
  <g transform="translate(48,68)">${hm}</g>
  <text x="25" y="202" font-family="${F}" font-size="10" fill="#484f58" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".4s" begin="1s" fill="freeze"/>${si} ${streak.currentStreak}d streak · ${streak.longestStreak}d longest · ?year=YYYY for other years</text>
</svg>`;
}
