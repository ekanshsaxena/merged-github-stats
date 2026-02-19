const USERS = ["ekanshsaxena", "esaxena-flexport"];

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  dailyContributions: Record<string, number>;
}

function fd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getMergedStreak(year?: number): Promise<StreakInfo> {
  const dateMap: Record<string, number> = {};
  const yearParam = year ? `?year=${year}` : "";

  for (const user of USERS) {
    try {
      const res = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${user}${yearParam}`,
      );
      if (!res.ok) continue;
      const data: any = await res.json();
      if (data.contributions) {
        for (const day of data.contributions) {
          dateMap[day.date] = (dateMap[day.date] || 0) + day.count;
        }
      }
    } catch (err) {
      console.error(`Contributions error ${user}:`, err);
    }
  }

  let totalContributions = 0;
  for (const c of Object.values(dateMap)) totalContributions += c;

  const active = new Set(
    Object.entries(dateMap)
      .filter(([, c]) => c > 0)
      .map(([d]) => d),
  );

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const check = new Date(today);
  if (!active.has(fd(today))) check.setDate(check.getDate() - 1);
  while (active.has(fd(check))) {
    currentStreak++;
    check.setDate(check.getDate() - 1);
  }

  const sorted = [...active].sort();
  let longestStreak = 0,
    temp = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      temp = 1;
    } else {
      const p = new Date(sorted[i - 1]);
      const c = new Date(sorted[i]);
      temp =
        Math.round((c.getTime() - p.getTime()) / 864e5) === 1 ? temp + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, temp);
  }

  return {
    currentStreak,
    longestStreak,
    totalContributions,
    dailyContributions: dateMap,
  };
}
