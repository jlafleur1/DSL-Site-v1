import rawData from "@/data/hitting-stats.json";
import type { HittingRow, PlayerSummary, StandingsRow, TeamSeasonSummary } from "@/lib_types";

export const hittingRows: HittingRow[] = rawData as HittingRow[];

export const latestSeasonStandings: StandingsRow[] = [
  {
    league: "Tesla League",
    team: "Mexico City",
    wins: 15,
    losses: 10,
    gb: "—",
    pf: 122,
    pa: 97,
    divisionRecord: "11-5",
    intraleagueRecord: "4-5",
  },
  {
    league: "Tesla League",
    team: "Sparks",
    wins: 15,
    losses: 11,
    gb: "0.5",
    pf: 119,
    pa: 93,
    divisionRecord: "9-7",
    intraleagueRecord: "6-4",
  },
  {
    league: "Tesla League",
    team: "Ojai",
    wins: 14,
    losses: 12,
    gb: "1.5",
    pf: 121,
    pa: 86,
    divisionRecord: "8-8",
    intraleagueRecord: "6-4",
  },
  {
    league: "Tesla League",
    team: "Alameda",
    wins: 13,
    losses: 13,
    gb: "2.5",
    pf: 146,
    pa: 140,
    divisionRecord: "8-8",
    intraleagueRecord: "5-5",
  },
  {
    league: "Tesla League",
    team: "San Mateo",
    wins: 8,
    losses: 18,
    gb: "7.5",
    pf: 121,
    pa: 156,
    divisionRecord: "4-12",
    intraleagueRecord: "4-6",
  },
  {
    league: "PG&E League",
    team: "Reno",
    wins: 15,
    losses: 11,
    gb: "—",
    pf: 134,
    pa: 118,
    divisionRecord: "12-4",
    intraleagueRecord: "3-7",
  },
  {
    league: "PG&E League",
    team: "Fresno",
    wins: 15,
    losses: 11,
    gb: "—",
    pf: 126,
    pa: 112,
    divisionRecord: "7-9",
    intraleagueRecord: "8-2",
  },
  {
    league: "PG&E League",
    team: "Shasta",
    wins: 12,
    losses: 13,
    gb: "2.5",
    pf: 87,
    pa: 115,
    divisionRecord: "6-9",
    intraleagueRecord: "6-4",
  },
  {
    league: "PG&E League",
    team: "Berkeley",
    wins: 11,
    losses: 14,
    gb: "3.5",
    pf: 99,
    pa: 127,
    divisionRecord: "—",
    intraleagueRecord: "—",
  },
];

export function formatRate(value: number, digits = 3) {
  return value.toFixed(digits).replace(/^0(?=\.)/, "");
}

export function buildPlayerSummary(name: string, rows: HittingRow[]): PlayerSummary {
  const sorted = [...rows].sort((a, b) => a.Season - b.Season);
  const latest = sorted[sorted.length - 1];

  const career = sorted.reduce(
    (acc, row) => {
      acc.HR += row.HR;
      acc.RBI += row.RBI;
      acc.H += row.H;
      acc.R += row.R;
      acc.SB += row.SB;
      acc.AB += row.AB;
      acc.BB += row.BB;
      acc.K += row.K;
      acc.avgOPS += row.OPS;
      acc.avgAVG += row.Avg;
      return acc;
    },
    {
      HR: 0,
      RBI: 0,
      H: 0,
      R: 0,
      SB: 0,
      AB: 0,
      BB: 0,
      K: 0,
      avgOPS: 0,
      avgAVG: 0,
    }
  );

  career.avgOPS = career.avgOPS / sorted.length;
  career.avgAVG = career.avgAVG / sorted.length;

  return {
    name,
    latestTeam: latest.Team,
    seasons: sorted.length,
    latestSeason: latest.Season,
    latest,
    career,
  };
}

export function getPlayerNames(rows: HittingRow[] = hittingRows) {
  return [...new Set(rows.map((row) => row.Name))].sort((a, b) => a.localeCompare(b));
}

export function getTeams(rows: HittingRow[] = hittingRows) {
  return [...new Set(rows.map((row) => row.Team).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getSeasons(rows: HittingRow[] = hittingRows) {
  return [...new Set(rows.map((row) => row.Season))].sort((a, b) => a - b);
}

export function buildTeamSeasonSummaries(rows: HittingRow[] = hittingRows): TeamSeasonSummary[] {
  const map = new Map<string, HittingRow[]>();
  for (const row of rows) {
    const key = `${row.Season}-${row.Team}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }

  return [...map.entries()]
    .map(([key, teamRows]) => {
      const [season, team] = key.split("-");
      const totals = teamRows.reduce(
        (acc, row) => {
          acc.players += 1;
          acc.avgAVG += row.Avg;
          acc.avgOBP += row["On-base %"];
          acc.avgSLG += row["Slug %"];
          acc.avgOPS += row.OPS;
          acc.totalH += row.H;
          acc.totalAB += row.AB;
          acc.totalR += row.R;
          acc.totalHR += row.HR;
          acc.totalRBI += row.RBI;
          acc.totalSB += row.SB;
          return acc;
        },
        {
          players: 0,
          avgAVG: 0,
          avgOBP: 0,
          avgSLG: 0,
          avgOPS: 0,
          totalH: 0,
          totalAB: 0,
          totalR: 0,
          totalHR: 0,
          totalRBI: 0,
          totalSB: 0,
        }
      );

      return {
        season: Number(season),
        team,
        players: totals.players,
        avgAVG: totals.avgAVG / totals.players,
        avgOBP: totals.avgOBP / totals.players,
        avgSLG: totals.avgSLG / totals.players,
        avgOPS: totals.avgOPS / totals.players,
        totalH: totals.totalH,
        totalAB: totals.totalAB,
        totalR: totals.totalR,
        totalHR: totals.totalHR,
        totalRBI: totals.totalRBI,
        totalSB: totals.totalSB,
      } satisfies TeamSeasonSummary;
    })
    .sort((a, b) => (a.team === b.team ? a.season - b.season : a.team.localeCompare(b.team)));
}
