export type HittingRow = {
  Season: number;
  Team: string;
  Name: string;
  Avg: number;
  "On-base %": number;
  "Slug %": number;
  OPS: number;
  H: number;
  AB: number;
  R: number;
  HR: number;
  RBI: number;
  "1B": number;
  "2B": number;
  "3B": number;
  BB: number;
  K: number;
  SB: number;
  CS: number;
  "Sac-Bunt": number;
  GIDP: number;
};

export type PlayerSummary = {
  name: string;
  latestTeam: string;
  seasons: number;
  latestSeason: number;
  latest: HittingRow;
  career: {
    HR: number;
    RBI: number;
    H: number;
    R: number;
    SB: number;
    AB: number;
    BB: number;
    K: number;
    avgOPS: number;
    avgAVG: number;
  };
};
