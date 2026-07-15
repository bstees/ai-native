import { useEffect, useMemo, useState } from "react";
import { area, line, max, scaleBand, scaleLinear } from "d3";

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Math.round(value || 0));
}

function formatCost(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(value || 0);
}

function formatOptionalCost(value) {
  return value == null ? "Unavailable" : formatCost(value);
}

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function useTokenUsage(filters, refreshKey) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTokenUsage() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.set(key, value);
          }
        });

        const target = params.toString() ? `/api/token-usage?${params}` : "/api/token-usage";
        const response = await fetch(target);
        if (!response.ok) {
          throw new Error("Unable to load token usage.");
        }

        const nextPayload = await response.json();
        if (isMounted) {
          setPayload(nextPayload);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTokenUsage();
    const intervalId = window.setInterval(loadTokenUsage, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [filters.agent, filters.skill, filters.runId, refreshKey]);

  return { payload, loading, error };
}

function StatCard({ label, value, detail }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}

function FilterPill({ active, children, onClick }) {
  return (
    <button className={`filter-pill ${active ? "is-active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <section className="analytics-card">
      <div className="section-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

function SignalCard({ label, value, detail }) {
  return (
    <article className="signal-card">
      <p>{label}</p>
      <strong>{value}</strong>
      {detail ? <span>{detail}</span> : null}
    </article>
  );
}

function TokenUsageChart({ series, markers }) {
  const [activeMarkerId, setActiveMarkerId] = useState("");

  const width = 860;
  const height = 320;
  const margin = { top: 20, right: 24, bottom: 42, left: 68 };

  if (!series.length) {
    return <div className="empty-chart">No usage events match the current filters.</div>;
  }

  const xScale = scaleLinear()
    .domain([series[0].sequence, series[series.length - 1].sequence])
    .range([margin.left, width - margin.right]);

  const yScale = scaleLinear()
    .domain([0, max(series, (event) => event.cumulativeTokens) || 0])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const linePath = line()
    .x((event) => xScale(event.sequence))
    .y((event) => yScale(event.cumulativeTokens))(series);

  const areaPath = area()
    .x((event) => xScale(event.sequence))
    .y0(height - margin.bottom)
    .y1((event) => yScale(event.cumulativeTokens))(series);

  const yTicks = yScale.ticks(5);
  const activeMarker = markers.find((marker) => marker.markerId === activeMarkerId) || markers[0] || null;

  return (
    <div className="chart-stack">
      <svg viewBox={`0 0 ${width} ${height}`} className="usage-chart" role="img">
        <defs>
          <linearGradient id="usageFill" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(245, 181, 68, 0.42)" />
            <stop offset="100%" stopColor="rgba(245, 181, 68, 0.02)" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={yScale(tick)}
              y2={yScale(tick)}
              className="chart-gridline"
            />
            <text x={margin.left - 12} y={yScale(tick) + 4} className="chart-label chart-label-left">
              {formatNumber(tick)}
            </text>
          </g>
        ))}

        <path d={areaPath || ""} fill="url(#usageFill)" />
        <path d={linePath || ""} className="chart-line" />

        {series.map((event) => (
          <circle
            key={event.eventId}
            cx={xScale(event.sequence)}
            cy={yScale(event.cumulativeTokens)}
            r="4"
            className="chart-point"
          />
        ))}

        {markers.map((marker) => (
          <g key={marker.markerId}>
            <line
              x1={xScale(marker.sequence)}
              x2={xScale(marker.sequence)}
              y1={margin.top}
              y2={height - margin.bottom}
              className={`marker-line ${activeMarker?.markerId === marker.markerId ? "is-active" : ""}`}
              onMouseEnter={() => setActiveMarkerId(marker.markerId)}
            />
            <circle
              cx={xScale(marker.sequence)}
              cy={height - margin.bottom}
              r="6"
              className={`marker-dot ${activeMarker?.markerId === marker.markerId ? "is-active" : ""}`}
              onMouseEnter={() => setActiveMarkerId(marker.markerId)}
            />
          </g>
        ))}

        <text x={width / 2} y={height - 8} className="chart-axis-title">
          Usage event sequence
        </text>
      </svg>

      {activeMarker ? (
        <div className="marker-sidebar">
          <div className="marker-tooltip">
            <p className="eyebrow">Version marker</p>
            <h3>{activeMarker.version}</h3>
            <p>{activeMarker.notes || "No release note captured."}</p>
            <p>
              Event <strong>{activeMarker.sequence}</strong>
            </p>
            <p>
              Agents: <strong>{activeMarker.updatedAgents.join(", ") || "None listed"}</strong>
            </p>
            <p>
              Skills: <strong>{activeMarker.updatedSkills.join(", ") || "None listed"}</strong>
            </p>
          </div>
          <div className="marker-list" aria-label="Version marker list">
            {markers.map((marker) => (
              <button
                key={marker.markerId}
                className={`marker-list-button ${activeMarker.markerId === marker.markerId ? "is-active" : ""}`}
                onClick={() => setActiveMarkerId(marker.markerId)}
              >
                <strong>{marker.version}</strong>
                <span>Event {marker.sequence}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RollupBarChart({ title, data, selectedValue, onSelect, kind }) {
  const width = 420;
  const height = 280;
  const margin = { top: 20, right: 16, bottom: 28, left: 136 };
  const chartData = data.slice(0, 6);

  if (!chartData.length) {
    return <div className="empty-chart">No rollups available for this filter set.</div>;
  }

  const xScale = scaleLinear()
    .domain([0, max(chartData, (entry) => entry.totalTokens) || 0])
    .nice()
    .range([margin.left, width - margin.right]);

  const yScale = scaleBand()
    .domain(chartData.map((entry) => entry.name))
    .range([margin.top, height - margin.bottom])
    .padding(0.22);

  return (
    <div className="mini-chart-card">
      <h3>{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="rollup-chart">
        {chartData.map((entry) => (
          <g key={entry.name}>
            <text
              x={margin.left - 10}
              y={(yScale(entry.name) || 0) + yScale.bandwidth() / 2 + 4}
              className="chart-label chart-label-left"
            >
              {entry.name}
            </text>
            <rect
              x={margin.left}
              y={yScale(entry.name)}
              width={xScale(entry.totalTokens) - margin.left}
              height={yScale.bandwidth()}
              rx="12"
              className={`rollup-bar ${selectedValue === entry.name ? "is-active" : ""}`}
              onClick={() => onSelect(entry.name)}
            />
            <text
              x={xScale(entry.totalTokens) + 8}
              y={(yScale(entry.name) || 0) + yScale.bandwidth() / 2 + 4}
              className="chart-label"
            >
              {formatNumber(entry.totalTokens)}
            </text>
          </g>
        ))}
      </svg>
      <div className="rollup-list" aria-label={`${title} list`}>
        {chartData.map((entry) => (
          <button
            key={entry.name}
            className={`rollup-list-button ${selectedValue === entry.name ? "is-active" : ""}`}
            aria-label={`Filter ${kind} ${entry.name}`}
            aria-pressed={selectedValue === entry.name}
            onClick={() => onSelect(entry.name)}
          >
            <span>{entry.name}</span>
            <strong>{formatNumber(entry.totalTokens)}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function RunTree({ runs, selectedRunId, onSelect }) {
  if (!runs.length) {
    return <div className="empty-chart">No sub-agent runs are available for this filter set.</div>;
  }

  return (
    <div className="run-tree">
      {runs.map((run) => (
        <button
          key={run.runId}
          className={`run-node ${selectedRunId === run.runId ? "is-active" : ""}`}
          aria-label={`Filter run ${run.runId} for ${run.agentName}`}
          onClick={() => onSelect(run.runId)}
        >
          <div className="run-node-topline">
            <strong>{run.agentName}</strong>
            <span>{formatNumber(run.totalTokens)} tokens</span>
          </div>
          <p>
            {run.skills.join(", ")} · {run.eventCount} events · seq {run.firstSequence}-{run.lastSequence}
          </p>
        </button>
      ))}
    </div>
  );
}

function EventTable({ events }) {
  if (!events.length) {
    return <div className="empty-chart">No events match the current drill-down.</div>;
  }

  return (
    <div className="event-table-wrap">
      <table className="event-table">
        <thead>
          <tr>
            <th>Seq</th>
            <th>Agent</th>
            <th>Skill</th>
            <th>Activity</th>
            <th>Tokens</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.eventId}>
              <td>{event.sequence}</td>
              <td>{event.agentName}</td>
              <td>{event.skillName}</td>
              <td>{event.activity}</td>
              <td>{formatNumber(event.totalTokens)}</td>
              <td>{formatOptionalCost(event.cost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FocusAreas({ focusAreas }) {
  const items = [
    focusAreas.heaviestAgent
      ? {
          label: "Heaviest agent",
          value: focusAreas.heaviestAgent.name,
          detail: `${formatNumber(focusAreas.heaviestAgent.totalTokens)} tokens`
        }
      : null,
    focusAreas.heaviestSkill
      ? {
          label: "Heaviest skill",
          value: focusAreas.heaviestSkill.name,
          detail: `${formatNumber(focusAreas.heaviestSkill.totalTokens)} tokens`
        }
      : null,
    focusAreas.highestAverageAgent
      ? {
          label: "Highest avg agent",
          value: focusAreas.highestAverageAgent.name,
          detail: `${formatNumber(focusAreas.highestAverageAgent.avgTokensPerEvent)} per event`
        }
      : null,
    focusAreas.topEvent
      ? {
          label: "Largest event",
          value: `#${focusAreas.topEvent.sequence}`,
          detail: `${focusAreas.topEvent.activity} · ${formatNumber(focusAreas.topEvent.totalTokens)} tokens`
        }
      : null
  ].filter(Boolean);

  return (
    <div className="signal-grid">
      {items.map((item) => (
        <SignalCard key={item.label} label={item.label} value={item.value} detail={item.detail} />
      ))}
    </div>
  );
}

function InsightList({ title, items, emptyText }) {
  if (!items.length) {
    return <div className="empty-chart">{emptyText}</div>;
  }

  return (
    <div className="insight-list-card">
      <h3>{title}</h3>
      <div className="insight-list">
        {items.map((item) => (
          <article key={item.key} className="insight-row">
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <span>{item.value}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function TokenUsageDashboard() {
  const [filters, setFilters] = useState({ agent: "", skill: "", runId: "" });
  const [refreshKey, setRefreshKey] = useState(0);
  const { payload, loading, error } = useTokenUsage(filters, refreshKey);

  const selectedAgent = filters.agent;
  const selectedSkill = filters.skill;
  const selectedRunId = filters.runId;
  const isLiveSource = payload?.source === "live-codex";

  const filteredEvents = useMemo(() => payload?.events || [], [payload]);

  if (loading && !payload) {
    return <div className="state-screen">Loading token usage dashboard...</div>;
  }

  if (error && !payload) {
    return (
      <div className="state-screen">
        <p>{error}</p>
        <button className="primary-button" onClick={() => setRefreshKey((value) => value + 1)}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero token-hero">
        <div className="hero-copy">
          <p className="eyebrow">Agent Efficiency Console</p>
          <h1>See where tokens go, which agents spend them, and what changed.</h1>
          <p className="hero-text">
            Track usage event by event, drill into sub-agent runs, and inspect version mile
            markers when skills or agents change behavior.
          </p>
          <p className="source-note">
            {isLiveSource
              ? "Live mode is reading local Codex thread token totals and turning increases observed since dashboard start into usage events."
              : "Sample mode is reading the fixture JSON file in data/token-usage.json."}
          </p>
          <div className="filter-row">
            <FilterPill
              active={!selectedAgent && !selectedSkill && !selectedRunId}
              onClick={() => setFilters({ agent: "", skill: "", runId: "" })}
            >
              All activity
            </FilterPill>
            {selectedAgent ? (
              <FilterPill active onClick={() => setFilters((current) => ({ ...current, agent: "", runId: "" }))}>
                Agent: {selectedAgent}
              </FilterPill>
            ) : null}
            {selectedSkill ? (
              <FilterPill active onClick={() => setFilters((current) => ({ ...current, skill: "", runId: "" }))}>
                Skill: {selectedSkill}
              </FilterPill>
            ) : null}
            {selectedRunId ? (
              <FilterPill active onClick={() => setFilters((current) => ({ ...current, runId: "" }))}>
                Run: {selectedRunId}
              </FilterPill>
            ) : null}
          </div>
        </div>
        <div className="stats-grid">
          <StatCard label="Usage events" value={formatNumber(payload.summary.eventCount)} />
          <StatCard label="Total tokens" value={formatNumber(payload.summary.totalTokens)} />
          <StatCard
            label="Average per event"
            value={formatNumber(payload.summary.avgTokensPerEvent)}
            detail={
              payload.summary.hasSplitData
                ? `${formatNumber(payload.summary.promptTokens)} prompt · ${formatNumber(
                    payload.summary.completionTokens
                  )} completion`
                : "Prompt/completion split unavailable in live mode"
            }
          />
          <StatCard
            label="Tracked spend"
            value={payload.summary.hasCostData ? formatCost(payload.summary.totalCost) : "Unavailable"}
            detail={
              payload.summary.hasCostData
                ? `${payload.summary.agentCount} agents · ${payload.summary.skillCount} skills`
                : "Live Codex mode does not expose price data"
            }
          />
          <StatCard
            label="Completion share"
            value={payload.summary.hasSplitData ? formatPercent(payload.summary.completionShare) : "Unknown"}
            detail={
              payload.summary.hasSplitData
                ? `${formatNumber(payload.summary.completionTokens)} completion`
                : "Split unavailable in live mode"
            }
          />
          <StatCard
            label="Prompt share"
            value={payload.summary.hasSplitData ? formatPercent(payload.summary.promptShare) : "Unknown"}
            detail={
              payload.summary.hasSplitData
                ? `${formatNumber(payload.summary.promptTokens)} prompt`
                : "Split unavailable in live mode"
            }
          />
          <StatCard
            label="Completion/prompt"
            value={payload.summary.hasSplitData ? Number(payload.summary.completionToPromptRatio || 0).toFixed(2) : "Unknown"}
            detail={
              payload.summary.hasSplitData
                ? "Higher means output dominates input"
                : "Ratio unavailable in live mode"
            }
          />
        </div>
      </section>

      <ChartCard
        title="Efficiency Signals"
        description="These summaries point to where the biggest token costs and likely efficiency issues are accumulating."
      >
        <FocusAreas focusAreas={payload.focusAreas} />
        <div className="insight-grid">
          <InsightList
            title="Activity hotspots"
            emptyText="No activity hotspots available."
            items={payload.activityRollups.slice(0, 4).map((entry) => ({
              key: entry.name,
              title: entry.name,
              detail: `${entry.eventCount} events · ${formatNumber(entry.avgTokensPerEvent)} avg per event`,
              value: formatNumber(entry.totalTokens)
            }))}
          />
          <InsightList
            title="Largest events"
            emptyText="No events available."
            items={payload.topEvents.map((event) => ({
              key: event.eventId,
              title: `#${event.sequence} · ${event.agentName}`,
              detail: `${event.skillName} · ${event.activity}`,
              value: formatNumber(event.totalTokens)
            }))}
          />
        </div>
      </ChartCard>

      <ChartCard
        title="Cumulative Token Usage"
        description="Vertical markers show version mile posts. Hover a marker line to see which skills and agents changed."
      >
        <TokenUsageChart series={payload.cumulativeSeries} markers={payload.versionMarkers} />
      </ChartCard>

      <section className="analytics-grid">
        <ChartCard
          title="Where tokens concentrate"
          description={
            isLiveSource
              ? "Use the lists to filter by active thread or model in the live Codex session data."
              : "Use the bars to filter the rest of the dashboard by agent or skill."
          }
        >
          <div className="dual-chart-grid">
            <RollupBarChart
              title={isLiveSource ? "By thread" : "By agent"}
              data={payload.agentRollups}
              selectedValue={selectedAgent}
              kind={isLiveSource ? "thread" : "agent"}
              onSelect={(agent) => setFilters((current) => ({ ...current, agent, runId: "" }))}
            />
            <RollupBarChart
              title={isLiveSource ? "By model" : "By skill"}
              data={payload.skillRollups}
              selectedValue={selectedSkill}
              kind={isLiveSource ? "model" : "skill"}
              onSelect={(skill) => setFilters((current) => ({ ...current, skill, runId: "" }))}
            />
          </div>
        </ChartCard>

        <ChartCard
          title="Run drill-down"
          description="Each node represents a parent or sub-agent execution run rolled up across its events."
        >
          <RunTree
            runs={payload.runTree}
            selectedRunId={selectedRunId}
            onSelect={(runId) => setFilters((current) => ({ ...current, runId }))}
          />
        </ChartCard>
      </section>

      <ChartCard
        title="Usage event ledger"
        description="Use this raw view to spot expensive activities and compare event-level efficiency over a run."
      >
        <EventTable events={filteredEvents} />
      </ChartCard>
    </main>
  );
}
