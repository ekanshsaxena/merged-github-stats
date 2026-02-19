const USERS = ["ekanshsaxena", "esaxena-flexport"];

const headers: Record<string, string> = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "merged-github-stats",
};

interface GitHubRepo {
  stargazers_count: number;
  fork: boolean;
}

interface GitHubSearchResult {
  total_count: number;
}

interface GitHubEvent {
  type: string;
  payload: {
    commits?: Array<unknown>;
  };
}

export interface UserStats {
  totalCommits: number;
  totalPRs: number;
  totalRepos: number;
  totalStars: number;
  totalIssues: number;
}

export async function getUserStats(): Promise<UserStats> {
  let totalCommits = 0;
  let totalPRs = 0;
  let totalRepos = 0;
  let totalStars = 0;
  let totalIssues = 0;

  for (const user of USERS) {
    try {
      // Repos & Stars
      const repoRes = await fetch(
        `https://api.github.com/users/${user}/repos?per_page=100&type=all`,
        { headers },
      );
      if (repoRes.ok) {
        const repos: GitHubRepo[] = await repoRes.json();
        totalRepos += repos.filter((r) => !r.fork).length;
        totalStars += repos.reduce((sum, r) => sum + r.stargazers_count, 0);
      }

      // PRs
      const prRes = await fetch(
        `https://api.github.com/search/issues?q=author:${user}+type:pr`,
        { headers },
      );
      if (prRes.ok) {
        const prData: GitHubSearchResult = await prRes.json();
        totalPRs += prData.total_count;
      }

      // Issues
      const issueRes = await fetch(
        `https://api.github.com/search/issues?q=author:${user}+type:issue`,
        { headers },
      );
      if (issueRes.ok) {
        const issueData: GitHubSearchResult = await issueRes.json();
        totalIssues += issueData.total_count;
      }

      // Commits (via events — approximate, last 90 days)
      const eventRes = await fetch(
        `https://api.github.com/users/${user}/events?per_page=100`,
        { headers },
      );
      if (eventRes.ok) {
        const events: GitHubEvent[] = await eventRes.json();
        const commits = events
          .filter((e) => e.type === "PushEvent")
          .reduce((sum, e) => sum + (e.payload.commits?.length ?? 0), 0);
        totalCommits += commits;
      }
    } catch (err) {
      console.error(`Error fetching stats for ${user}:`, err);
    }
  }

  return { totalCommits, totalPRs, totalRepos, totalStars, totalIssues };
}
