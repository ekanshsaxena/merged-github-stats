import fetch from "node-fetch";

const USERS = ["ekanshsaxena", "esaxena-flexport"];

export async function getMergedStreak() {
  const dates = new Set<string>();

  for (const user of USERS) {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${user}`
    );
    const data = await res.json();

    data.contributions.forEach((day: any) => {
      if (day.count > 0) dates.add(day.date);
    });
  }

  const sorted = [...dates].sort().reverse();

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < sorted.length; i++) {
    const d = new Date(sorted[i]);
    const diff =
      (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

    if (diff <= streak + 1) streak++;
    else break;
  }

  return streak;
}
