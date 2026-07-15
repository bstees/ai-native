import { useEffect, useMemo, useState } from "react";

const stageOrder = ["signals", "decisions", "assets", "pilots"];
const reviewStatuses = ["draft", "pending-human-review", "approved", "superseded"];

function formatStage(stage) {
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

function getAssetKind(record) {
  if (!record.path.startsWith("assets/")) {
    return "";
  }

  if (record.path.includes("/workflows/")) {
    return "workflow";
  }

  if (record.path.includes("/quality/")) {
    return "quality";
  }

  if (record.path.includes("/repo-rules/")) {
    return "rules";
  }

  return "asset";
}

function StageCard({ record, onSave }) {
  const [status, setStatus] = useState(record.status || "");
  const [reviewStatus, setReviewStatus] = useState(record.reviewStatus || "draft");
  const [nextAction, setNextAction] = useState(record.nextAction || "");
  const assetKind = getAssetKind(record);
  const isPlanMode = String(record.status || "").includes("plan-mode");

  useEffect(() => {
    setStatus(record.status || "");
    setReviewStatus(record.reviewStatus || "draft");
    setNextAction(record.nextAction || "");
  }, [record]);

  return (
    <article className="card">
      <div className="card-topline">
        <div className="pill-cluster">
          <span className={`pill stage-${record.stage}`}>{formatStage(record.stage)}</span>
          {assetKind ? <span className={`pill asset-${assetKind}`}>{assetKind}</span> : null}
          {isPlanMode ? <span className="pill mode-pill">plan mode</span> : null}
        </div>
        <span className={`pill review-${reviewStatus}`}>{reviewStatus}</span>
      </div>
      <h3>{record.title}</h3>
      <p className="card-summary">{record.summary}</p>
      <dl className="meta-list">
        <div>
          <dt>Owner</dt>
          <dd>{record.owner || "Unassigned"}</dd>
        </div>
        <div>
          <dt>Path</dt>
          <dd>{record.path}</dd>
        </div>
      </dl>
      <label>
        Status
        <input value={status} onChange={(event) => setStatus(event.target.value)} />
      </label>
      <label>
        Review
        <select value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value)}>
          {reviewStatuses.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label>
        Next action
        <textarea
          rows="3"
          value={nextAction}
          onChange={(event) => setNextAction(event.target.value)}
        />
      </label>
      <button
        className="primary-button"
        onClick={() => onSave(record.id, { status, reviewStatus, nextAction })}
      >
        Save state
      </button>
    </article>
  );
}

function StandardCard({ record }) {
  const assetKind = getAssetKind(record);
  const isPlanMode = String(record.status || "").includes("plan-mode");

  return (
    <article className="mini-card">
      <div className="card-topline">
        <div className="pill-cluster">
          <span className={`pill asset-${assetKind}`}>{assetKind}</span>
          {isPlanMode ? <span className="pill mode-pill">plan mode</span> : null}
        </div>
      </div>
      <h3>{record.title}</h3>
      <p className="card-summary">{record.summary}</p>
      <p className="mini-meta">{record.path}</p>
    </article>
  );
}

function QueueItem({ approval, onDecision }) {
  const [reviewer, setReviewer] = useState("");
  const [note, setNote] = useState("");

  return (
    <article className="queue-item">
      <div className="queue-header">
        <div>
          <p className="eyebrow">{approval.gateType}</p>
          <h3>{approval.recordTitle}</h3>
        </div>
        <span className="pill queue-pill">{approval.status}</span>
      </div>
      <p>{approval.prompt}</p>
      <p className="queue-meta">
        Reviewer role: <strong>{approval.reviewerRole}</strong>
      </p>
      <div className="queue-controls">
        <input
          placeholder="Reviewer name"
          value={reviewer}
          onChange={(event) => setReviewer(event.target.value)}
        />
        <textarea
          rows="2"
          placeholder="Approval note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <div className="button-row">
          <button
            className="primary-button"
            onClick={() => onDecision(approval.id, "approved", reviewer, note)}
          >
            Approve
          </button>
          <button
            className="secondary-button"
            onClick={() => onDecision(approval.id, "deferred", reviewer, note)}
          >
            Defer
          </button>
        </div>
      </div>
    </article>
  );
}

export default function RepoDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Unable to load dashboard.");
      }

      const payload = await response.json();
      setDashboard(payload);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function saveRecord(id, updates) {
    const response = await fetch(`/api/records/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      setError("Unable to save record state.");
      return;
    }

    await loadDashboard();
  }

  async function handleDecision(approvalId, status, reviewer, note) {
    const response = await fetch(`/api/approvals/${approvalId}/decision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status, reviewer, note })
    });

    if (!response.ok) {
      setError("Unable to update approval.");
      return;
    }

    await loadDashboard();
  }

  const groupedRecords = useMemo(() => {
    if (!dashboard) {
      return {};
    }

    return dashboard.records.reduce((groups, record) => {
      groups[record.stage] = groups[record.stage] || [];
      groups[record.stage].push(record);
      return groups;
    }, {});
  }, [dashboard]);

  const standards = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return dashboard.records.filter((record) => record.path.startsWith("assets/workflows/"));
  }, [dashboard]);

  const qualityStandards = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return dashboard.records.filter((record) => record.path.startsWith("assets/quality/"));
  }, [dashboard]);

  const pilotValidation = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return dashboard.records.filter((record) =>
      record.path.includes("pilots/interest-lens/usability/")
    );
  }, [dashboard]);

  if (loading) {
    return <div className="state-screen">Loading AI Native Studio...</div>;
  }

  if (error) {
    return (
      <div className="state-screen">
        <p>{error}</p>
        <button className="primary-button" onClick={loadDashboard}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">AI Native Studio</p>
          <h1>Signals become decisions. Decisions become shared tools.</h1>
          <p className="hero-text">
            A portable control surface for tracking industry signals, approving changes, and
            shipping reusable native-AI assets to consumer repositories like Interest Lens.
          </p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <span>Tracked records</span>
            <strong>{dashboard.summary.recordCount}</strong>
          </div>
          <div className="stat-card">
            <span>Pending reviews</span>
            <strong>{dashboard.summary.pendingApprovalCount}</strong>
          </div>
          <div className="stat-card">
            <span>Published assets</span>
            <strong>{dashboard.summary.assetCount}</strong>
          </div>
          <div className="stat-card">
            <span>Plan-mode assets</span>
            <strong>
              {
                dashboard.records.filter((record) =>
                  String(record.status || "").includes("plan-mode")
                ).length
              }
            </strong>
          </div>
        </div>
      </section>

      <section className="standards-board">
        <div className="section-header">
          <h2>Core Standards</h2>
          <p>Reusable workflow and quality assets that now define how work should be done.</p>
        </div>
        <div className="standard-columns">
          <div className="standard-group">
            <h3>Workflows</h3>
            <div className="mini-grid">
              {standards.map((record) => (
                <StandardCard key={record.id} record={record} />
              ))}
            </div>
          </div>
          <div className="standard-group">
            <h3>Quality</h3>
            <div className="mini-grid">
              {qualityStandards.map((record) => (
                <StandardCard key={record.id} record={record} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pipeline">
        {stageOrder.map((stage) => (
          <div className="stage-column" key={stage}>
            <div className="stage-header">
              <h2>{formatStage(stage)}</h2>
              <span>{(groupedRecords[stage] || []).length}</span>
            </div>
            <div className="stage-stack">
              {(groupedRecords[stage] || []).map((record) => (
                <StageCard key={record.id} record={record} onSave={saveRecord} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="review-board">
        <div className="section-header">
          <h2>Human Gates</h2>
          <p>Approve or defer the moments where this repo affects real consumer repos.</p>
        </div>
        <div className="queue-grid">
          {dashboard.pendingApprovals.length ? (
            dashboard.pendingApprovals.map((approval) => (
              <QueueItem key={approval.id} approval={approval} onDecision={handleDecision} />
            ))
          ) : (
            <article className="queue-item empty-state">
              <h3>No pending approvals</h3>
              <p>The current queue is clear.</p>
            </article>
          )}
        </div>
      </section>

      <section className="review-board">
        <div className="section-header">
          <h2>Interest Lens Usability Loop</h2>
          <p>Critical flows and human feedback that should tighten the UI bar over time.</p>
        </div>
        <div className="mini-grid">
          {pilotValidation.map((record) => (
            <StandardCard key={record.id} record={record} />
          ))}
        </div>
      </section>
    </main>
  );
}
