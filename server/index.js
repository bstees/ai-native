const express = require("express");
const path = require("path");
const { createPool, initializeDatabase } = require("./db");

async function start() {
  const app = express();
  app.use(express.json());

  const pool = await createPool();
  await initializeDatabase(pool);

  app.get("/api/dashboard", async (_request, response) => {
    const [records] = await pool.query(
      `
        SELECT id, stage, title, summary, status, review_status AS reviewStatus,
               owner, path, next_action AS nextAction, updated_at AS updatedAt
        FROM records
        ORDER BY FIELD(stage, 'signals', 'decisions', 'assets', 'pilots'), updated_at DESC
      `
    );

    const [pendingApprovals] = await pool.query(
      `
        SELECT id, record_title AS recordTitle, gate_type AS gateType,
               reviewer_role AS reviewerRole, status, prompt, reviewer,
               decision_note AS decisionNote, approved_on AS approvedOn
        FROM approvals
        WHERE status = 'pending-human-review'
        ORDER BY created_at ASC
      `
    );

    const summary = {
      recordCount: records.length,
      pendingApprovalCount: pendingApprovals.length,
      assetCount: records.filter((record) => record.stage === "assets").length
    };

    response.json({ records, pendingApprovals, summary });
  });

  app.patch("/api/records/:id", async (request, response) => {
    const { id } = request.params;
    const { status, reviewStatus, nextAction } = request.body;

    await pool.query(
      `
        UPDATE records
        SET status = ?, review_status = ?, next_action = ?
        WHERE id = ?
      `,
      [status, reviewStatus, nextAction, id]
    );

    response.json({ ok: true });
  });

  app.post("/api/approvals/:id/decision", async (request, response) => {
    const { id } = request.params;
    const { status, reviewer, note } = request.body;
    const approvedOn = status === "approved" ? new Date() : null;

    const [approvalRows] = await pool.query("SELECT record_id AS recordId FROM approvals WHERE id = ?", [
      id
    ]);

    if (!approvalRows.length) {
      response.status(404).json({ error: "Approval not found." });
      return;
    }

    await pool.query(
      `
        UPDATE approvals
        SET status = ?, reviewer = ?, decision_note = ?, approved_on = ?
        WHERE id = ?
      `,
      [status, reviewer || "", note || "", approvedOn, id]
    );

    const reviewStatus = status === "approved" ? "approved" : "draft";
    const nextAction =
      status === "approved"
        ? "Pilot approved. Apply the asset in the consumer repo and capture feedback."
        : "Pilot deferred. Review concerns and update the rollout record before retrying.";

    await pool.query(
      `
        UPDATE records
        SET review_status = ?, next_action = ?
        WHERE id = ?
      `,
      [reviewStatus, nextAction, approvalRows[0].recordId]
    );

    response.json({ ok: true });
  });

  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));

  app.get("*", (_request, response) => {
    response.sendFile(path.join(distPath, "index.html"));
  });

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`AI Native Studio listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start AI Native Studio", error);
  process.exit(1);
});
