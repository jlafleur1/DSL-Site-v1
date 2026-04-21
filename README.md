# Baseball Stats Studio

A deployable Next.js app built from your uploaded baseball hitting dataset.

## What is included

- local dataset in `data/hitting-stats.json`
- searchable player explorer
- player detail charts
- player comparison view
- leaderboard and scatterplot section
- no backend required

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Deploy to Vercel

1. Create a new GitHub repo and upload this folder.
2. Import the repo into Vercel.
3. Use the default Next.js settings.
4. Deploy.

## Update the data later

Replace `data/hitting-stats.json` with refreshed data in the same shape and redeploy.

If you want to re-generate the JSON from a CSV, the easiest path is:
- clean the CSV in Google Sheets
- export as CSV
- convert to JSON
- overwrite `data/hitting-stats.json`

## Notes about this dataset

The source CSV contained spreadsheet error values like `#REF!` and `#DIV/0!` in some cells. For this version, those were normalized to `0` so the app can render consistently.

## Good next upgrades

- add pitching stats as a second dataset
- create team pages and standings
- move to dynamic routes for individual player pages
- add advanced filters by season and stat thresholds
- add league branding and custom colors
