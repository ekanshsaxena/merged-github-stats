const USERS = ["ekanshsaxena", "esaxena-flexport"];

interface ContributionDay {
  date: string;
  count: number;
}

interface ContributionResponse {
  contributions: ContributionDay[];
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
}

export async function getMergedStreak(): Promise<StreakInfo> {
  const dateMap = new Map<string, number>();

  for (const user of USERS) {
    try {
      const res = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${user}`,
      );
      if (!res.ok) continue;

      const data: ContributionResponse = await res.json();

      for (const day of data.contributions) {
        const existing = dateMap.get(day.date) ?? 0;
        dateMap.set(day.date, existing + day.count);
      }
    } catch (err) {
      console.error(`Error fetching contributions for ${user}:`, err);
    }
  }

  // Sort dates descending
  const sorted = [...dateMap.entries()]
    .filter(([, count]) => count > 0)
    .map(([date]) => date)
    .sort()
    .reverse();

  // Calculate total contributions
  let totalContributions = 0;
  for (const [, count] of dateMap) {
    totalContributions += count;
  }

  // Current streak: consecutive days ending today or yesterday
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const d = new Date(sorted[i]);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= currentStreak + 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Longest streak
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
