import type { UserStats } from "./github";
import type { StreakInfo } from "./streak";

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

// Animated fire emoji for streak
function getStreakIcon(streak: number): string {
  if (streak >= 30) return "🔥";
  if (streak >= 7) return "⚡";
  if (streak >= 1) return "✨";
  return "💤";
}

export function renderStatsCard(stats: UserStats, streak: StreakInfo): string {
  const icon = getStreakIcon(streak.currentStreak);

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
    <linearGradient id="streakGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#f78166" />
      <stop offset="100%" style="stop-color:#ffa657" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
    </filter>
    <clipPath id="roundedBg">
      <rect x="0.5" y="0.5" width="494" height="194" rx="12" ry="12"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect x="0.5" y="0.5" width="494" height="194" rx="12" ry="12" fill="url(#bgGrad)" stroke="#30363d" stroke-width="1"/>
  
  <!-- Subtle top accent line -->
  <rect x="0.5" y="0.5" width="494" height="3" rx="12" ry="12" fill="url(#accentGrad)" clip-path="url(#roundedBg)"/>

  <!-- Title -->
  <g transform="translate(25, 35)">
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="18" font-weight="700" fill="url(#accentGrad)">
      Combined GitHub Stats
    </text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="11" fill="#8b949e" y="20">
      ekanshsaxena + esaxena-flexport
    </text>
  </g>

  <!-- Divider -->
  <line x1="25" y1="68" x2="470" y2="68" stroke="#21262d" stroke-width="1"/>

  <!-- Stats Grid - Left Column -->
  <g transform="translate(25, 90)">
    <!-- Commits -->
    <g>
      <svg viewBox="0 0 16 16" width="16" height="16" fill="#58a6ff">
        <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/>
      </svg>
      <text x="24" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" fill="#c9d1d9">
        Commits
      </text>
      <text x="200" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" font-weight="700" fill="#58a6ff" text-anchor="end">
        ${formatNumber(stats.totalCommits)}
      </text>
    </g>

    <!-- PRs -->
    <g transform="translate(0, 28)">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="#bc8cff">
        <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"/>
      </svg>
      <text x="24" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" fill="#c9d1d9">
        Pull Requests
      </text>
      <text x="200" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" font-weight="700" fill="#bc8cff" text-anchor="end">
        ${formatNumber(stats.totalPRs)}
      </text>
    </g>

    <!-- Issues -->
    <g transform="translate(0, 56)">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="#3fb950">
        <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/>
      </svg>
      <text x="24" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" fill="#c9d1d9">
        Issues
      </text>
      <text x="200" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" font-weight="700" fill="#3fb950" text-anchor="end">
        ${formatNumber(stats.totalIssues)}
      </text>
    </g>
  </g>

  <!-- Stats Grid - Right Column -->
  <g transform="translate(260, 90)">
    <!-- Repos -->
    <g>
      <svg viewBox="0 0 16 16" width="16" height="16" fill="#f0883e">
        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/>
      </svg>
      <text x="24" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" fill="#c9d1d9">
        Repos
      </text>
      <text x="200" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" font-weight="700" fill="#f0883e" text-anchor="end">
        ${formatNumber(stats.totalRepos)}
      </text>
    </g>

    <!-- Stars -->
    <g transform="translate(0, 28)">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="#e3b341">
        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
      </svg>
      <text x="24" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" fill="#c9d1d9">
        Stars
      </text>
      <text x="200" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" font-weight="700" fill="#e3b341" text-anchor="end">
        ${formatNumber(stats.totalStars)}
      </text>
    </g>

    <!-- Contributions -->
    <g transform="translate(0, 56)">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="#f778ba">
        <path d="M7.823.177 12.65 4.96a.25.25 0 0 1-.177.427H9.019l3.458 3.71a.25.25 0 0 1-.183.392H9.333l2.896 4.044a.25.25 0 0 1-.204.394H8.75v2.322a.25.25 0 0 1-.5 0v-2.322H4.979a.25.25 0 0 1-.204-.394l2.896-4.044H4.71a.25.25 0 0 1-.183-.392l3.458-3.71H4.527a.25.25 0 0 1-.177-.427L9.177.177a.25.25 0 0 1 .354 0l-.708.707Z"/>
      </svg>
      <text x="24" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" fill="#c9d1d9">
        Contributions
      </text>
      <text x="200" y="13" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="14" font-weight="700" fill="#f778ba" text-anchor="end">
        ${formatNumber(streak.totalContributions)}
      </text>
    </g>
  </g>

  <!-- Streak animation keyframes -->
  <style>
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .stat-row { animation: fadeIn 0.6s ease forwards; }
  </style>
</svg>`;
}

export function renderStreakCard(streak: StreakInfo): string {
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

  <!-- Background -->
  <rect x="0.5" y="0.5" width="494" height="164" rx="12" ry="12" fill="url(#bgGrad2)" stroke="#30363d" stroke-width="1"/>
  
  <!-- Top accent line -->
  <rect x="0.5" y="0.5" width="494" height="3" rx="12" ry="12" fill="url(#accentGrad2)" clip-path="url(#roundedBg2)"/>

  <!-- Title -->
  <g transform="translate(25, 35)">
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="18" font-weight="700" fill="url(#accentGrad2)">
      ${icon} Contribution Streak
    </text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="11" fill="#8b949e" y="20">
      ekanshsaxena + esaxena-flexport
    </text>
  </g>

  <!-- Divider -->
  <line x1="25" y1="68" x2="470" y2="68" stroke="#21262d" stroke-width="1"/>

  <!-- Streak Columns -->
  <!-- Current Streak -->
  <g transform="translate(60, 88)">
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="36" font-weight="800" fill="url(#fireGrad)" text-anchor="middle" x="55" y="30">
      ${streak.currentStreak}
    </text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="12" fill="#8b949e" text-anchor="middle" x="55" y="52">
      Current Streak
    </text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="11" fill="#484f58" text-anchor="middle" x="55" y="68">
      days
    </text>
  </g>

  <!-- Separator -->
  <line x1="195" y1="82" x2="195" y2="155" stroke="#21262d" stroke-width="1"/>

  <!-- Longest Streak -->
  <g transform="translate(208, 88)">
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="36" font-weight="800" fill="#bc8cff" text-anchor="middle" x="55" y="30">
      ${streak.longestStreak}
    </text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="12" fill="#8b949e" text-anchor="middle" x="55" y="52">
      Longest Streak
    </text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="11" fill="#484f58" text-anchor="middle" x="55" y="68">
      days
    </text>
  </g>

  <!-- Separator -->
  <line x1="340" y1="82" x2="340" y2="155" stroke="#21262d" stroke-width="1"/>

  <!-- Total Contributions -->
  <g transform="translate(353, 88)">
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="36" font-weight="800" fill="#58a6ff" text-anchor="middle" x="55" y="30">
      ${formatNumber(streak.totalContributions)}
    </text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="12" fill="#8b949e" text-anchor="middle" x="55" y="52">
      Total Contribs
    </text>
    <text font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif" font-size="11" fill="#484f58" text-anchor="middle" x="55" y="68">
      this year
    </text>
  </g>
</svg>`;
}
