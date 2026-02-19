import fetch from "node-fetch";

const USERS = ["ekanshsaxena", "esaxena-flexport"];

const headers = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
};

export async function getUserStats() {
  let totalCommits = 0;
  let totalPRs = 0;
  let totalRepos = 0;

  for (const user of USERS) {
    // repos
    const repoRes = await fetch(
      `https://api.github.com/users/${user}/repos?per_page=100`,
      { headers }
    );
    const repos = await repoRes.json();
    totalRepos += repos.length;

    // PRs
    const prRes = await fetch(
      `https://api.github.com/search/issues?q=author:${user}+type:pr`,
      { headers }
    );
    const prData = await prRes.json();
    totalPRs += prData.total_count;

    // commits (approx via events)
    const eventRes = await fetch(
      `https://api.github.com/users/${user}/events`,
      { headers }
    );
    const events = await eventRes.json();

    const commits = events.filter(e => e.type === "PushEvent")
      .reduce((sum, e) => sum + e.payload.commits.length, 0);

    totalCommits += commits;
  }

  return { totalCommits, totalPRs, totalRepos };
}
