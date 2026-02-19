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

// ===== STATS CARD =====
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

  let bsvg = "";
  bars.forEach((b, i) => {
    const w = Math.max((b.v / mx) * bw, 6);
    const y = i * 28,
      dl = (0.3 + i * 0.15).toFixed(2);
    bsvg += `<g style="animation:fu .5s ease ${dl}s forwards;opacity:0" transform="translate(0,${y})">
      <text x="0" y="14" font-family="${F}" font-size="12" fill="#8b949e">${b.l}</text>
      <rect x="110" y="4" width="${bw}" height="10" rx="5" fill="#21262d"/>
      <rect x="110" y="4" width="0" height="10" rx="5" fill="${b.c}"><animate attributeName="width" from="0" to="${w}" dur=".8s" begin="${dl}s" fill="freeze" calcMode="spline" keySplines=".33 0 .2 1"/></rect>
      <text x="${110 + bw + 12}" y="14" font-family="${F}" font-size="13" font-weight="700" fill="${b.c}">${fmt(b.v)}</text>
    </g>`;
  });

  const si =
    streak.currentStreak >= 30
      ? "🔥"
      : streak.currentStreak >= 7
        ? "⚡"
        : streak.currentStreak >= 1
          ? "✨"
          : "💤";

  return `<svg width="495" height="220" viewBox="0 0 495 220" xmlns="http://www.w3.org/2000/svg">
  <style>
    @keyframes fu{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
    @keyframes rd{from{stroke-dashoffset:${C}}to{stroke-dashoffset:${(C * 0.18).toFixed(1)}}}
    @keyframes np{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
    @keyframes gl{0%,100%{filter:drop-shadow(0 0 4px rgba(57,211,83,.3))}50%{filter:drop-shadow(0 0 12px rgba(57,211,83,.6))}}
  </style>
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0d1117"/><stop offset="100%" stop-color="#161b22"/></linearGradient>
    <linearGradient id="ac" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#58a6ff"/><stop offset="50%" stop-color="#bc8cff"/><stop offset="100%" stop-color="#f778ba"/></linearGradient>
    <linearGradient id="rg" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#0e4429"/><stop offset="100%" stop-color="#39d353"/></linearGradient>
    <clipPath id="cl"><rect x=".5" y=".5" width="494" height="219" rx="12"/></clipPath>
  </defs>
  <rect x=".5" y=".5" width="494" height="219" rx="12" fill="url(#bg)" stroke="#30363d"/>
  <rect x=".5" y=".5" width="494" height="3" fill="url(#ac)" clip-path="url(#cl)"/>
  <text x="25" y="30" font-family="${F}" font-size="16" font-weight="700" fill="url(#ac)" style="animation:fu .5s ease forwards;opacity:0">GitHub Stats</text>
  <text x="25" y="47" font-family="${F}" font-size="11" fill="#484f58" style="animation:fu .5s ease .1s forwards;opacity:0">ekanshsaxena • esaxena-flexport</text>
  <line x1="25" y1="57" x2="470" y2="57" stroke="#21262d"/>
  <g transform="translate(80,138)" style="animation:fu .6s ease .2s forwards;opacity:0">
    <circle r="${R}" fill="none" stroke="#21262d" stroke-width="6"/>
    <circle r="${R}" fill="none" stroke="url(#rg)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90)" style="animation:rd 1.5s ease-out .4s forwards"/>
    <text y="-2" text-anchor="middle" font-family="${F}" font-size="24" font-weight="800" fill="#e6edf3" style="animation:np .5s ease .8s forwards;opacity:0">${fmt(streak.totalContributions)}</text>
    <text y="16" text-anchor="middle" font-family="${F}" font-size="10" fill="#8b949e" style="animation:fu .3s ease 1s forwards;opacity:0">contributions</text>
  </g>
  <g transform="translate(175,75)">${bsvg}</g>
  <g style="animation:fu .4s ease 1.2s forwards;opacity:0">
    <text x="25" y="210" font-family="${F}" font-size="10" fill="#484f58">${si} ${streak.currentStreak}d streak · ${streak.longestStreak}d best</text>
  </g>
</svg>`;
}

// ===== HEATMAP BUILDER =====
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
    cells += `<g style="animation:fi .3s ease ${(w * 0.02).toFixed(2)}s forwards;opacity:0">`;
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
      cells += `<rect x="${x}" y="${y}" width="${cl}" height="${cl}" rx="1.5" fill="${gc(cnt, mx)}"><title>${ds}: ${cnt}</title></rect>`;
      if (d === 0 && dt.getMonth() !== lm) {
        lm = dt.getMonth();
        mons += `<text x="${x}" y="${7 * st + 10}" font-family="${F}" font-size="8" fill="#484f58">${MS[lm]}</text>`;
      }
    }
    cells += `</g>`;
  }

  const dl = [1, 3, 5]
    .map(
      (i) =>
        `<text x="-20" y="${i * st + 6}" font-family="${F}" font-size="8" fill="#484f58">${["", "Mon", "", "Wed", "", "Fri", ""][i]}</text>`,
    )
    .join("");
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
  <style>
    @keyframes fu{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fi{from{opacity:0}to{opacity:1}}
    @keyframes np{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
    @keyframes gl{0%,100%{filter:drop-shadow(0 0 3px rgba(57,211,83,.2))}50%{filter:drop-shadow(0 0 8px rgba(57,211,83,.5))}}
  </style>
  <defs>
    <linearGradient id="b2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0d1117"/><stop offset="100%" stop-color="#161b22"/></linearGradient>
    <linearGradient id="a2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#58a6ff"/><stop offset="50%" stop-color="#bc8cff"/><stop offset="100%" stop-color="#f778ba"/></linearGradient>
    <clipPath id="c2"><rect x=".5" y=".5" width="494" height="209" rx="12"/></clipPath>
  </defs>
  <rect x=".5" y=".5" width="494" height="209" rx="12" fill="url(#b2)" stroke="#30363d"/>
  <rect x=".5" y=".5" width="494" height="3" fill="url(#a2)" clip-path="url(#c2)"/>
  <text x="25" y="30" font-family="${F}" font-size="16" font-weight="700" fill="url(#a2)" style="animation:fu .5s ease forwards;opacity:0">Contribution Activity</text>
  <text x="25" y="47" font-family="${F}" font-size="11" fill="#484f58" style="animation:fu .5s ease .1s forwards;opacity:0">ekanshsaxena • esaxena-flexport</text>
  <text x="470" y="30" text-anchor="end" font-family="${F}" font-size="14" font-weight="700" fill="#39d353" style="animation:np .5s ease .2s forwards;opacity:0">${fmt(streak.totalContributions)} contributions</text>
  <text x="470" y="47" text-anchor="end" font-family="${F}" font-size="11" fill="#484f58" style="animation:fu .4s ease .3s forwards;opacity:0">in ${yr}</text>
  <line x1="25" y1="57" x2="470" y2="57" stroke="#21262d"/>
  <g transform="translate(48,68)">${hm}</g>
  <g style="animation:fu .4s ease 1s forwards;opacity:0">
    <text x="25" y="202" font-family="${F}" font-size="10" fill="#484f58">${si} ${streak.currentStreak}d streak · ${streak.longestStreak}d longest · Use ?year=YYYY to view other years</text>
  </g>
</svg>`;
}
