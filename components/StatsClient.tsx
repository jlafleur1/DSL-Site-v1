"use client";

import { useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  Search,
  Trophy,
  BarChart3,
  Users,
  Database,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts";
import type { HittingRow } from "@/lib_types";
import { buildPlayerSummary, formatRate, getPlayerNames, getTeams, getSeasons } from "@/lib_data";

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`soft-panel ${className}`}>{children}</div>;
}

function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <div className="stat-card p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {sublabel ? <div className="mt-1 text-xs text-slate-500">{sublabel}</div> : null}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle ? <p className="muted mt-1">{subtitle}</p> : null}
      </div>
    </div>
  );
}

type TabKey = "explore" | "player" | "compare";

export default function StatsClient({ rows }: { rows: HittingRow[] }) {
  const [tab, setTab] = useState<TabKey>("explore");
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const playerNames = useMemo(() => getPlayerNames(rows), [rows]);
  const teams = useMemo(() => getTeams(rows), [rows]);
  const seasons = useMemo(() => getSeasons(rows), [rows]);
  const [selectedPlayer, setSelectedPlayer] = useState(playerNames[0] ?? "");
  const [compareA, setCompareA] = useState(playerNames[0] ?? "");
  const [compareB, setCompareB] = useState(playerNames[1] ?? playerNames[0] ?? "");

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesName = row.Name.toLowerCase().includes(query.toLowerCase().trim());
      const matchesTeam = teamFilter === "all" || row.Team === teamFilter;
      return matchesName && matchesTeam;
    });
  }, [rows, query, teamFilter]);

  const playerSummaries = useMemo(() => {
    const map = new Map<string, HittingRow[]>();
    for (const row of filteredRows) {
      if (!map.has(row.Name)) map.set(row.Name, []);
      map.get(row.Name)!.push(row);
    }
    return [...map.entries()]
      .map(([name, playerRows]) => buildPlayerSummary(name, playerRows))
      .sort((a, b) => b.latest.OPS - a.latest.OPS);
  }, [filteredRows]);

  const leaderboard = useMemo(() => playerSummaries.slice(0, 10), [playerSummaries]);

  const selectedRows = useMemo(
    () => rows.filter((row) => row.Name === selectedPlayer).sort((a, b) => a.Season - b.Season),
    [rows, selectedPlayer]
  );

  const selectedSummary = useMemo(
    () => (selectedRows.length ? buildPlayerSummary(selectedPlayer, selectedRows) : null),
    [selectedPlayer, selectedRows]
  );

  const compareRowsA = useMemo(
    () => rows.filter((row) => row.Name === compareA).sort((a, b) => a.Season - b.Season),
    [rows, compareA]
  );

  const compareRowsB = useMemo(
    () => rows.filter((row) => row.Name === compareB).sort((a, b) => a.Season - b.Season),
    [rows, compareB]
  );

  const compareSummaryA = useMemo(
    () => (compareRowsA.length ? buildPlayerSummary(compareA, compareRowsA) : null),
    [compareA, compareRowsA]
  );

  const compareSummaryB = useMemo(
    () => (compareRowsB.length ? buildPlayerSummary(compareB, compareRowsB) : null),
    [compareB, compareRowsB]
  );

  const comparisonBars = useMemo(() => {
    if (!compareSummaryA || !compareSummaryB) return [];
    return [
      {
        stat: "Latest OPS",
        [compareSummaryA.name]: Number(compareSummaryA.latest.OPS.toFixed(3)),
        [compareSummaryB.name]: Number(compareSummaryB.latest.OPS.toFixed(3)),
      },
      {
        stat: "Latest AVG",
        [compareSummaryA.name]: Number(compareSummaryA.latest.Avg.toFixed(3)),
        [compareSummaryB.name]: Number(compareSummaryB.latest.Avg.toFixed(3)),
      },
      {
        stat: "Career HR",
        [compareSummaryA.name]: compareSummaryA.career.HR,
        [compareSummaryB.name]: compareSummaryB.career.HR,
      },
      {
        stat: "Career RBI",
        [compareSummaryA.name]: compareSummaryA.career.RBI,
        [compareSummaryB.name]: compareSummaryB.career.RBI,
      },
    ];
  }, [compareSummaryA, compareSummaryB]);

  const radarData = useMemo(() => {
    if (!compareSummaryA || !compareSummaryB) return [];
    const maxHR = Math.max(compareSummaryA.career.HR, compareSummaryB.career.HR, 1);
    const maxRBI = Math.max(compareSummaryA.career.RBI, compareSummaryB.career.RBI, 1);
    const maxSB = Math.max(compareSummaryA.career.SB, compareSummaryB.career.SB, 1);
    return [
      {
        metric: "OPS",
        [compareSummaryA.name]: Number((compareSummaryA.latest.OPS * 100).toFixed(1)),
        [compareSummaryB.name]: Number((compareSummaryB.latest.OPS * 100).toFixed(1)),
      },
      {
        metric: "AVG",
        [compareSummaryA.name]: Number((compareSummaryA.latest.Avg * 300).toFixed(1)),
        [compareSummaryB.name]: Number((compareSummaryB.latest.Avg * 300).toFixed(1)),
      },
      {
        metric: "HR",
        [compareSummaryA.name]: Number(((compareSummaryA.career.HR / maxHR) * 100).toFixed(1)),
        [compareSummaryB.name]: Number(((compareSummaryB.career.HR / maxHR) * 100).toFixed(1)),
      },
      {
        metric: "RBI",
        [compareSummaryA.name]: Number(((compareSummaryA.career.RBI / maxRBI) * 100).toFixed(1)),
        [compareSummaryB.name]: Number(((compareSummaryB.career.RBI / maxRBI) * 100).toFixed(1)),
      },
      {
        metric: "SB",
        [compareSummaryA.name]: Number(((compareSummaryA.career.SB / maxSB) * 100).toFixed(1)),
        [compareSummaryB.name]: Number(((compareSummaryB.career.SB / maxSB) * 100).toFixed(1)),
      },
    ];
  }, [compareSummaryA, compareSummaryB]);

  const scatterData = useMemo(() => {
    return playerSummaries.slice(0, 80).map((player) => ({
      x: player.latest["On-base %"],
      y: player.latest["Slug %"],
      z: player.latest.HR,
      name: player.name,
      team: player.latestTeam,
    }));
  }, [playerSummaries]);

  return (
    <main className="mx-auto max-w-7xl p-6 md:p-10">
      <Panel className="p-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Baseball Stats Studio
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              A real Next.js site for player visuals, comparisons, and leaderboards.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              This build uses your uploaded hitting dataset directly. It is ready for local dev or
              a Vercel deploy with no backend required.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Rows loaded" value={rows.length} sublabel="Player-season records" />
            <StatCard label="Players" value={playerNames.length} sublabel="Unique names" />
            <StatCard label="Teams" value={teams.length} sublabel="Available filters" />
            <StatCard
              label="Seasons"
              value={seasons.length}
              sublabel={seasons.length ? `${seasons[0]}–${seasons[seasons.length - 1]}` : "—"}
            />
          </div>
        </div>
      </Panel>

      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl bg-white p-2 shadow-sm">
        {[
          ["explore", "Explore"],
          ["player", "Player View"],
          ["compare", "Compare"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as TabKey)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "explore" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <Panel className="p-6">
            <SectionHeader
              icon={Search}
              title="Search players"
              subtitle="Filter by name and team, then jump into player pages."
            />
            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by player name"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none ring-0 transition focus:border-slate-400"
                />
              </div>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="all">All teams</option>
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 grid max-h-[700px] gap-3 overflow-auto pr-1">
              {playerSummaries.map((player) => (
                <button
                  key={player.name}
                  type="button"
                  onClick={() => {
                    setSelectedPlayer(player.name);
                    setTab("player");
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold tracking-tight">{player.name}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {player.latestTeam} · Latest season {player.latestSeason} · {player.seasons} season
                        {player.seasons === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      OPS {formatRate(player.latest.OPS)}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-slate-500">AVG</div>
                      <div className="font-medium">{formatRate(player.latest.Avg)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">HR</div>
                      <div className="font-medium">{player.latest.HR}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">RBI</div>
                      <div className="font-medium">{player.latest.RBI}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">SB</div>
                      <div className="font-medium">{player.latest.SB}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel className="p-6">
              <SectionHeader
                icon={Trophy}
                title="Latest OPS leaderboard"
                subtitle="Top recent seasons in the current filtered view."
              />
              <div className="mt-5 space-y-3">
                {leaderboard.map((player, index) => (
                  <div
                    key={player.name}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-xs text-slate-500">{player.latestTeam}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{formatRate(player.latest.OPS)}</div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="p-6">
              <SectionHeader
                icon={BarChart3}
                title="League shape"
                subtitle="On-base vs slugging for the current top player set."
              />
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name="OBP" />
                    <YAxis type="number" dataKey="y" name="SLG" />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      formatter={(value: number) => formatRate(value)}
                      labelFormatter={() => ""}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const point = payload[0]?.payload as {
                          name: string;
                          team: string;
                          x: number;
                          y: number;
                          z: number;
                        };
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-md">
                            <div className="font-semibold">{point.name}</div>
                            <div className="text-xs text-slate-500">{point.team}</div>
                            <div className="mt-2 text-sm">OBP {formatRate(point.x)}</div>
                            <div className="text-sm">SLG {formatRate(point.y)}</div>
                            <div className="text-sm">HR {point.z}</div>
                          </div>
                        );
                      }}
                    />
                    <Scatter data={scatterData} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel className="p-6">
              <SectionHeader
                icon={Database}
                title="Data note"
                subtitle="Your CSV included some spreadsheet error cells."
              />
              <p className="mt-4 text-sm leading-6 text-slate-600">
                In this build, broken spreadsheet values like #REF! and #DIV/0! were safely normalized to
                0 so the site can render cleanly. If you clean those source cells later, replacing the
                JSON file will update the site.
              </p>
            </Panel>
          </div>
        </div>
      ) : null}

      {tab === "player" && selectedSummary ? (
        <div className="mt-6 space-y-6">
          <Panel className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                icon={Users}
                title="Player view"
                subtitle="Season progression and a compact history table."
              />
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 md:w-80"
              >
                {playerNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <StatCard label="Latest team" value={selectedSummary.latestTeam || "—"} sublabel={`Season ${selectedSummary.latestSeason}`} />
              <StatCard label="Latest AVG" value={formatRate(selectedSummary.latest.Avg)} />
              <StatCard label="Latest OPS" value={formatRate(selectedSummary.latest.OPS)} />
              <StatCard label="Career HR" value={selectedSummary.career.HR} />
              <StatCard label="Career RBI" value={selectedSummary.career.RBI} />
              <StatCard label="Career SB" value={selectedSummary.career.SB} />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <div className="stat-card p-5">
                <div className="mb-4 text-lg font-semibold tracking-tight">OPS over time</div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedRows}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Season" />
                      <YAxis domain={[0, "auto"]} />
                      <Tooltip formatter={(value: number) => formatRate(value)} />
                      <Line type="monotone" dataKey="OPS" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="stat-card p-5">
                <div className="mb-4 text-lg font-semibold tracking-tight">Home runs by season</div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedRows}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Season" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="HR" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-6 stat-card overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-4 text-lg font-semibold tracking-tight">
                Season history
              </div>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="px-4 py-3 font-medium">Season</th>
                      <th className="px-4 py-3 font-medium">Team</th>
                      <th className="px-4 py-3 font-medium">AVG</th>
                      <th className="px-4 py-3 font-medium">OBP</th>
                      <th className="px-4 py-3 font-medium">SLG</th>
                      <th className="px-4 py-3 font-medium">OPS</th>
                      <th className="px-4 py-3 font-medium">HR</th>
                      <th className="px-4 py-3 font-medium">RBI</th>
                      <th className="px-4 py-3 font-medium">SB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRows.map((row) => (
                      <tr key={`${row.Name}-${row.Season}`} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3">{row.Season}</td>
                        <td className="px-4 py-3">{row.Team}</td>
                        <td className="px-4 py-3">{formatRate(row.Avg)}</td>
                        <td className="px-4 py-3">{formatRate(row["On-base %"])}</td>
                        <td className="px-4 py-3">{formatRate(row["Slug %"])}</td>
                        <td className="px-4 py-3 font-medium">{formatRate(row.OPS)}</td>
                        <td className="px-4 py-3">{row.HR}</td>
                        <td className="px-4 py-3">{row.RBI}</td>
                        <td className="px-4 py-3">{row.SB}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>
        </div>
      ) : null}

      {tab === "compare" && compareSummaryA && compareSummaryB ? (
        <div className="mt-6 space-y-6">
          <Panel className="p-6">
            <div className="grid gap-4 md:grid-cols-2 md:items-end">
              <SectionHeader
                icon={Users}
                title="Compare players"
                subtitle="Side-by-side snapshot plus a profile-style radar."
              />
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={compareA}
                  onChange={(e) => setCompareA(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                >
                  {playerNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  value={compareB}
                  onChange={(e) => setCompareB(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                >
                  {playerNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {[compareSummaryA, compareSummaryB].map((summary) => (
                <div key={summary.name} className="stat-card p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-2xl font-semibold tracking-tight">{summary.name}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {summary.latestTeam} · Latest season {summary.latestSeason}
                      </div>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {summary.seasons} season{summary.seasons === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard label="AVG" value={formatRate(summary.latest.Avg)} />
                    <StatCard label="OPS" value={formatRate(summary.latest.OPS)} />
                    <StatCard label="HR" value={summary.career.HR} sublabel="Career" />
                    <StatCard label="RBI" value={summary.career.RBI} sublabel="Career" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <div className="stat-card p-5">
                <div className="mb-4 text-lg font-semibold tracking-tight">Comparison bars</div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonBars}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stat" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey={compareSummaryA.name} radius={[8, 8, 0, 0]} />
                      <Bar dataKey={compareSummaryB.name} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="stat-card p-5">
                <div className="mb-4 text-lg font-semibold tracking-tight">Player profile radar</div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Tooltip />
                      <Radar dataKey={compareSummaryA.name} fillOpacity={0.15} />
                      <Radar dataKey={compareSummaryB.name} fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      ) : null}
    </main>
  );
}
