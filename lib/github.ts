const USERS = ["ekanshsaxena", "esaxena-flexport"];

function getHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "merged-github-stats",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export interface UserStats {
  totalPRs: number;
  totalRepos: number;
  totalStars: number;
  totalIssues: number;
}

export async function getUserStats(): Promise<UserStats> {
  let totalPRs = 0,
    totalRepos = 0,
    totalStars = 0,
    totalIssues = 0;
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
          (s: number, r: any) => s + (r.stargazers_count || 0),
          0,
        );
      }

      const prRes = await fetch(
        `https://api.github.com/search/issues?q=author:${user}+type:pr`,
        { headers },
      );
      if (prRes.ok) {
        const d: any = await prRes.json();
        totalPRs += d.total_count || 0;
      }

      const issRes = await fetch(
        `https://api.github.com/search/issues?q=author:${user}+type:issue`,
        { headers },
      );
      if (issRes.ok) {
        const d: any = await issRes.json();
        totalIssues += d.total_count || 0;
      }
    } catch (err) {
      console.error(`Error fetching stats for ${user}:`, err);
    }
  }

  return { totalPRs, totalRepos, totalStars, totalIssues };
}
