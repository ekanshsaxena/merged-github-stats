# 🔀 Merged GitHub Stats

Generate a single, beautiful stats card that combines contributions from **multiple GitHub accounts**. Perfect for showing merged stats from your personal and work accounts in your GitHub README.

## ✨ Features

- **Merged Stats** — Combines commits, PRs, issues, repos, stars, and contributions across accounts
- **Streak Tracking** — Current streak, longest streak, and total contributions (merged)
- **Premium Dark UI** — GitHub-themed dark mode design with gradient accents and Octicon-style icons
- **Two Card Types** — Stats overview card and dedicated streak card
- **Caching** — Built-in 30-minute caching to respect GitHub API rate limits
- **Error Handling** — Graceful error SVG fallback if something goes wrong

## 🚀 Setup

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ekanshsaxena/merged-github-stats)

### 2. Set Environment Variable

In your Vercel project settings, add:

| Variable       | Description                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN` | A [GitHub Personal Access Token](https://github.com/settings/tokens) with `read:user` and `repo` scopes |

### 3. Use in Your README

#### Stats Card

```markdown
![GitHub Stats](https://YOUR-VERCEL-URL.vercel.app/api/stats)
```

#### Streak Card

```markdown
![GitHub Streak](https://YOUR-VERCEL-URL.vercel.app/api/stats?type=streak)
```

## 🎨 Preview

### Stats Card

Shows combined commits, PRs, issues, repos, stars, and total contributions.

### Streak Card

Shows current streak, longest streak, and total contributions across both accounts.

## ⚙️ Configuration

Edit the `USERS` array in `lib/github.ts` and `lib/streak.ts` to add or change the GitHub usernames:

```typescript
const USERS = ["ekanshsaxena", "esaxena-flexport"];
```

## 📁 Project Structure

```
merged-github-stats/
├── api/
│   └── stats.ts        # Vercel serverless function (API endpoint)
├── lib/
│   ├── github.ts       # GitHub API data fetching
│   ├── streak.ts       # Contribution streak calculation
│   └── card.ts         # SVG card rendering
├── vercel.json         # Vercel configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies
```

## 📝 License

MIT
