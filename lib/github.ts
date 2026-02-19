const USERS = ["ekanshsaxena", "esaxena-flexport"];

function getHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "merged-github-stats",
  };
  const t = process.env.GITHUB_TOKEN;
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export interface UserStats {
  totalPRs: number;
  totalIssues: number;
  totalRepos: number;
  totalStars: number;
}

export async function getUserStats(): Promise<UserStats> {
  let totalPRs = 0,
    totalIssues = 0,
    totalRepos = 0,
    totalStars = 0;
  const headers = getHeaders();
  for (const user of USERS) {
    try {
      const [repoRes, prRes, issRes] = await Promise.all([
        fetch(
          `https://api.github.com/users/${user}/repos?per_page=100&type=all`,
          { headers },
        ),
        fetch(`https://api.github.com/search/issues?q=author:${user}+type:pr`, {
          headers,
        }),
        fetch(
          `https://api.github.com/search/issues?q=author:${user}+type:issue`,
          { headers },
        ),
      ]);
      if (repoRes.ok) {
        const r: any[] = await repoRes.json();
        totalRepos += r.filter((x: any) => !x.fork).length;
        totalStars += r.reduce(
          (s: number, x: any) => s + (x.stargazers_count || 0),
          0,
        );
      }
      if (prRes.ok) {
        const d: any = await prRes.json();
        totalPRs += d.total_count || 0;
      }
      if (issRes.ok) {
        const d: any = await issRes.json();
        totalIssues += d.total_count || 0;
      }
    } catch (err) {
      console.error(`Error for ${user}:`, err);
    }
  }
  return { totalPRs, totalIssues, totalRepos, totalStars };
}
