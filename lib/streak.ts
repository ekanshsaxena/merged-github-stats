const USERS = ["ekanshsaxena", "esaxena-flexport"];

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  dailyContributions: Record<string, number>;
}

function fmtDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getMergedStreak(): Promise<StreakInfo> {
  const dateMap: Record<string, number> = {};

  for (const user of USERS) {
    try {
      const res = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${user}`,
      );
      if (!res.ok) continue;
      const data: any = await res.json();
      if (data.contributions) {
        for (const day of data.contributions) {
          dateMap[day.date] = (dateMap[day.date] || 0) + day.count;
        }
      }
    } catch (err) {
      console.error(`Error fetching contributions for ${user}:`, err);
    }
  }

  let totalContributions = 0;
  for (const count of Object.values(dateMap)) {
    totalContributions += count;
  }

  const activeDateSet = new Set(
    Object.entries(dateMap)
      .filter(([, c]) => c > 0)
      .map(([d]) => d),
  );

  // Current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(today);
  if (!activeDateSet.has(fmtDate(today))) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  while (activeDateSet.has(fmtDate(checkDate))) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Longest streak
  const sortedDates = [...activeDateSet].sort();
  let longestStreak = 0,
    tempStreak = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  return {
    currentStreak,
    longestStreak,
    totalContributions,
    dailyContributions: dateMap,
  };
}
