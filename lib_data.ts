import rawData from "@/data/hitting-stats.json";
import type { HittingRow, PlayerSummary } from "@/lib_types";

export const hittingRows: HittingRow[] = rawData as HittingRow[];

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
