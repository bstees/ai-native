const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const defaultDataPath = path.join(__dirname, "..", "data", "token-usage.json");
const defaultCodexStatePath = path.join(
  process.env.HOME || "",
  ".codex",
  "state_5.sqlite"
);
const liveTrackerState = {
  initialized: false,
  nextSequence: 1,
  snapshots: new Map(),
  events: [],
  priceDataAvailable: false
};

function truncateLabel(value, maxLength = 72) {
  if (!value) {
    return "";
  }

  const normalized = String(value).replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
}

function safeBasename(targetPath) {
  return targetPath ? path.basename(targetPath) : "";
}

function readTokenUsageFile() {
  const targetPath = process.env.TOKEN_USAGE_FILE
    ? path.resolve(process.env.TOKEN_USAGE_FILE)
    : defaultDataPath;
  const raw = fs.readFileSync(targetPath, "utf8");
  return JSON.parse(raw);
}

function readLiveThreads() {
  const statePath = process.env.CODEX_STATE_DB || defaultCodexStatePath;
  if (!statePath || !fs.existsSync(statePath)) {
    return [];
  }

  const sql = `
    SELECT
      id,
      title,
      cwd,
      tokens_used,
      updated_at_ms,
      model,
      agent_role,
      agent_nickname,
      thread_source
    FROM threads
    WHERE archived = 0
      AND tokens_used > 0
    ORDER BY updated_at_ms ASC, id ASC
    LIMIT 200
  `;

  const output = execFileSync("sqlite3", ["-json", statePath, sql], {
    encoding: "utf8"
  });

  return JSON.parse(output || "[]");
}

function buildLiveMetadata() {
  const threads = readLiveThreads();
  if (!threads.length) {
    return null;
  }

  for (const thread of threads) {
    const currentTokens = toNumber(thread.tokens_used);
    const existing = liveTrackerState.snapshots.get(thread.id);

    if (!existing) {
      liveTrackerState.snapshots.set(thread.id, {
        tokensUsed: currentTokens,
        updatedAtMs: toNumber(thread.updated_at_ms)
      });
      continue;
    }

    const delta = currentTokens - existing.tokensUsed;
    if (delta <= 0) {
      existing.tokensUsed = currentTokens;
      existing.updatedAtMs = toNumber(thread.updated_at_ms);
      continue;
    }

    const label = truncateLabel(thread.title || thread.id);
    const model = truncateLabel(thread.model || thread.agent_role || thread.thread_source || "session");
    const cwdLabel = safeBasename(thread.cwd) || "workspace";

    liveTrackerState.events.push({
      eventId: `live-${thread.id}-${liveTrackerState.nextSequence}`,
      sequence: liveTrackerState.nextSequence,
      runId: thread.id,
      parentRunId: "",
      agentName: label,
      agentType: "thread",
      skillName: model,
      activity: `Token increase in ${cwdLabel}`,
      toolName: "",
      taskId: thread.id,
      status: "completed",
      timestamp: new Date(toNumber(thread.updated_at_ms)).toISOString(),
      promptTokens: null,
      completionTokens: null,
      totalTokens: delta,
      cost: null,
      metadata: {
        cwd: thread.cwd,
        model: thread.model || "",
        agentRole: thread.agent_role || "",
        agentNickname: thread.agent_nickname || "",
        live: true
      }
    });

    liveTrackerState.nextSequence += 1;
    existing.tokensUsed = currentTokens;
    existing.updatedAtMs = toNumber(thread.updated_at_ms);
  }

  if (!liveTrackerState.initialized) {
    for (const thread of threads) {
      liveTrackerState.snapshots.set(thread.id, {
        tokensUsed: toNumber(thread.tokens_used),
        updatedAtMs: toNumber(thread.updated_at_ms)
      });
    }

    liveTrackerState.initialized = true;
  }

  return {
    title: "Live Codex Token Usage",
    description: "Live token deltas derived from local Codex thread totals since this dashboard started.",
    events: [...liveTrackerState.events],
    versionMarkers: [],
    source: "live-codex",
    metadata: {
      priceDataAvailable: liveTrackerState.priceDataAvailable
    }
  };
}

function toNumber(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeEvent(event, index) {
  const promptTokens = event.promptTokens == null ? null : toNumber(event.promptTokens);
  const completionTokens = event.completionTokens == null ? null : toNumber(event.completionTokens);
  const totalTokens = event.totalTokens == null ? promptTokens + completionTokens : toNumber(event.totalTokens);
  const normalizedCost = event.cost == null ? null : toNumber(event.cost);

  return {
    eventId: event.eventId || `event-${index + 1}`,
    sequence: event.sequence == null ? index + 1 : toNumber(event.sequence),
    runId: event.runId || "root",
    parentRunId: event.parentRunId || "",
    agentName: event.agentName || "Unknown agent",
    agentType: event.agentType || "agent",
    skillName: event.skillName || "Unscoped",
    activity: event.activity || "unspecified",
    toolName: event.toolName || "",
    taskId: event.taskId || "",
    status: event.status || "completed",
    timestamp: event.timestamp || "",
    promptTokens,
    completionTokens,
    totalTokens,
    cost: normalizedCost,
    metadata: event.metadata || {}
  };
}

function normalizeMarker(marker, events, index) {
  const matchingEvent = marker.eventId
    ? events.find((event) => event.eventId === marker.eventId)
    : null;

  return {
    markerId: marker.markerId || `marker-${index + 1}`,
    version: marker.version || marker.label || `v${index + 1}`,
    label: marker.label || marker.version || `v${index + 1}`,
    timestamp: marker.timestamp || matchingEvent?.timestamp || "",
    sequence:
      marker.sequence == null
        ? matchingEvent?.sequence || index + 1
        : toNumber(marker.sequence),
    eventId: marker.eventId || matchingEvent?.eventId || "",
    notes: marker.notes || "",
    updatedAgents: Array.isArray(marker.updatedAgents) ? marker.updatedAgents : [],
    updatedSkills: Array.isArray(marker.updatedSkills) ? marker.updatedSkills : []
  };
}

function buildRollupMap(events, key) {
  const rollups = new Map();

  for (const event of events) {
    const entryKey = event[key] || "Unscoped";
    const current = rollups.get(entryKey) || {
      name: entryKey,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      hasSplitData: true,
      cost: 0,
      eventCount: 0,
      latestSequence: 0
    };

    current.totalTokens += event.totalTokens;
    current.promptTokens += toNumber(event.promptTokens);
    current.completionTokens += toNumber(event.completionTokens);
    current.hasSplitData = current.hasSplitData && event.promptTokens != null && event.completionTokens != null;
    current.cost += toNumber(event.cost);
    current.eventCount += 1;
    current.latestSequence = Math.max(current.latestSequence, event.sequence);

    rollups.set(entryKey, current);
  }

  return Array.from(rollups.values())
    .map((entry) => ({
      ...entry,
      avgTokensPerEvent: entry.eventCount ? Math.round(entry.totalTokens / entry.eventCount) : 0,
      completionShare: entry.hasSplitData && entry.totalTokens ? entry.completionTokens / entry.totalTokens : null,
      promptShare: entry.hasSplitData && entry.totalTokens ? entry.promptTokens / entry.totalTokens : null
    }))
    .sort((left, right) => right.totalTokens - left.totalTokens);
}

function buildRunTree(events) {
  const runs = new Map();

  for (const event of events) {
    const current = runs.get(event.runId) || {
      runId: event.runId,
      parentRunId: event.parentRunId || "",
      agentName: event.agentName,
      agentType: event.agentType,
      skills: new Set(),
      activities: new Set(),
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      hasSplitData: true,
      cost: 0,
      eventCount: 0,
      firstSequence: event.sequence,
      lastSequence: event.sequence
    };

    current.parentRunId = current.parentRunId || event.parentRunId || "";
    current.agentName = current.agentName || event.agentName;
    current.agentType = current.agentType || event.agentType;
    current.skills.add(event.skillName);
    current.activities.add(event.activity);
    current.totalTokens += event.totalTokens;
    current.promptTokens += toNumber(event.promptTokens);
    current.completionTokens += toNumber(event.completionTokens);
    current.hasSplitData = current.hasSplitData && event.promptTokens != null && event.completionTokens != null;
    current.cost += toNumber(event.cost);
    current.eventCount += 1;
    current.firstSequence = Math.min(current.firstSequence, event.sequence);
    current.lastSequence = Math.max(current.lastSequence, event.sequence);

    runs.set(event.runId, current);
  }

  const tree = Array.from(runs.values()).map((run) => ({
    runId: run.runId,
    parentRunId: run.parentRunId,
    agentName: run.agentName,
    agentType: run.agentType,
    skills: Array.from(run.skills).sort(),
    activities: Array.from(run.activities).sort(),
    totalTokens: run.totalTokens,
    promptTokens: run.promptTokens,
    completionTokens: run.completionTokens,
    hasSplitData: run.hasSplitData,
    cost: run.cost,
    eventCount: run.eventCount,
    avgTokensPerEvent: run.eventCount ? Math.round(run.totalTokens / run.eventCount) : 0,
    firstSequence: run.firstSequence,
    lastSequence: run.lastSequence
  }));

  return tree.sort((left, right) => left.firstSequence - right.firstSequence);
}

function buildCumulativeSeries(events) {
  let cumulativeTokens = 0;
  let cumulativeCost = 0;

  return events.map((event) => {
    cumulativeTokens += event.totalTokens;
    cumulativeCost += event.cost;

    return {
      eventId: event.eventId,
      sequence: event.sequence,
      timestamp: event.timestamp,
      agentName: event.agentName,
      skillName: event.skillName,
      activity: event.activity,
      totalTokens: event.totalTokens,
      cumulativeTokens,
      cost: event.cost,
      cumulativeCost
    };
  });
}

function filterEvents(events, filters) {
  return events.filter((event) => {
    if (filters.agent && event.agentName !== filters.agent) {
      return false;
    }

    if (filters.skill && event.skillName !== filters.skill) {
      return false;
    }

    if (filters.runId && event.runId !== filters.runId) {
      return false;
    }

    return true;
  });
}

function buildSummary(events, markers) {
  const totalTokens = events.reduce((sum, event) => sum + event.totalTokens, 0);
  const costEvents = events.filter((event) => event.cost != null);
  const totalCost = costEvents.reduce((sum, event) => sum + event.cost, 0);
  const hasSplitData = events.every((event) => event.promptTokens != null && event.completionTokens != null);
  const promptTokens = events.reduce((sum, event) => sum + toNumber(event.promptTokens), 0);
  const completionTokens = events.reduce((sum, event) => sum + toNumber(event.completionTokens), 0);
  const agentCount = new Set(events.map((event) => event.agentName)).size;
  const skillCount = new Set(events.map((event) => event.skillName)).size;

  return {
    eventCount: events.length,
    totalTokens,
    promptTokens,
    completionTokens,
    totalCost,
    hasCostData: costEvents.length > 0,
    hasSplitData,
    avgTokensPerEvent: events.length ? Math.round(totalTokens / events.length) : 0,
    completionShare: hasSplitData && totalTokens ? completionTokens / totalTokens : null,
    promptShare: hasSplitData && totalTokens ? promptTokens / totalTokens : null,
    completionToPromptRatio: hasSplitData && promptTokens ? completionTokens / promptTokens : null,
    agentCount,
    skillCount,
    versionCount: markers.length
  };
}

function buildTopEvents(events) {
  return [...events]
    .sort((left, right) => right.totalTokens - left.totalTokens)
    .slice(0, 5)
    .map((event) => ({
      eventId: event.eventId,
      sequence: event.sequence,
      agentName: event.agentName,
      skillName: event.skillName,
      activity: event.activity,
      totalTokens: event.totalTokens,
      cost: event.cost
    }));
}

function findHighestAverage(rollups) {
  const candidates = rollups.filter((entry) => entry.eventCount > 0);
  if (!candidates.length) {
    return null;
  }

  return [...candidates].sort((left, right) => right.avgTokensPerEvent - left.avgTokensPerEvent)[0];
}

function buildFocusAreas(events, agentRollups, skillRollups, activityRollups, runTree) {
  const topEvent = buildTopEvents(events)[0] || null;
  const heaviestRun = [...runTree].sort((left, right) => right.totalTokens - left.totalTokens)[0] || null;

  return {
    topEvent,
    heaviestAgent: agentRollups[0] || null,
    heaviestSkill: skillRollups[0] || null,
    heaviestActivity: activityRollups[0] || null,
    highestAverageAgent: findHighestAverage(agentRollups),
    highestAverageSkill: findHighestAverage(skillRollups),
    heaviestRun
  };
}

function buildTokenUsagePayload(filters = {}) {
  let raw;
  try {
    raw = filters.source === "sample" ? readTokenUsageFile() : buildLiveMetadata() || readTokenUsageFile();
  } catch (_error) {
    raw = readTokenUsageFile();
  }
  const events = (raw.events || []).map(normalizeEvent).sort((left, right) => left.sequence - right.sequence);
  const markers = (raw.versionMarkers || [])
    .map((marker, index) => normalizeMarker(marker, events, index))
    .sort((left, right) => left.sequence - right.sequence);
  const filteredEvents = filterEvents(events, filters);
  const filteredMarkers = markers.filter((marker) => {
    if (!filters.agent && !filters.skill && !filters.runId) {
      return true;
    }

    const matchingEvent = filteredEvents.find((event) => event.eventId === marker.eventId);
    if (matchingEvent) {
      return true;
    }

    if (filters.agent && marker.updatedAgents.includes(filters.agent)) {
      return true;
    }

    if (filters.skill && marker.updatedSkills.includes(filters.skill)) {
      return true;
    }

    return false;
  });

  const agentRollups = buildRollupMap(filteredEvents, "agentName");
  const skillRollups = buildRollupMap(filteredEvents, "skillName");
  const activityRollups = buildRollupMap(filteredEvents, "activity");
  const runTree = buildRunTree(filteredEvents);
  const topEvents = buildTopEvents(filteredEvents);

  return {
    title: raw.title || "Token usage dashboard",
    description: raw.description || "",
    source: raw.source || "json-fixture",
    metadata: raw.metadata || {},
    generatedAt: new Date().toISOString(),
    filters,
    summary: buildSummary(filteredEvents, filteredMarkers),
    events: filteredEvents,
    cumulativeSeries: buildCumulativeSeries(filteredEvents),
    agentRollups,
    skillRollups,
    activityRollups,
    runTree,
    topEvents,
    focusAreas: buildFocusAreas(filteredEvents, agentRollups, skillRollups, activityRollups, runTree),
    versionMarkers: filteredMarkers
  };
}

module.exports = {
  buildTokenUsagePayload
};
