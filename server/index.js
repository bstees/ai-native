const express = require("express");
const path = require("path");
const { loadRepoRecords } = require("./content");
const { createStore } = require("./store");
const { buildTokenUsagePayload } = require("./token-usage");

async function createApp() {
  const app = express();
  app.use(express.json());

  const store = await createStore(loadRepoRecords());

  app.get("/api/dashboard", async (_request, response) => {
    await store.sync(loadRepoRecords());
    const records = await store.getRecords();
    const pendingApprovals = await store.getPendingApprovals();

    const summary = {
      recordCount: records.length,
      pendingApprovalCount: pendingApprovals.length,
      assetCount: records.filter((record) => record.stage === "assets").length
    };

    response.json({ records, pendingApprovals, summary });
  });

  app.get("/api/token-usage", (request, response) => {
    const filters = {
      agent: request.query.agent || "",
      skill: request.query.skill || "",
      runId: request.query.runId || "",
      source: request.query.source || ""
    };

    response.json(buildTokenUsagePayload(filters));
  });

  app.patch("/api/records/:id", async (request, response) => {
    const { id } = request.params;
    const { status, reviewStatus, nextAction } = request.body;

    await store.updateRecord(id, { status, reviewStatus, nextAction });

    response.json({ ok: true });
  });

  app.post("/api/approvals/:id/decision", async (request, response) => {
    const { id } = request.params;
    const { status, reviewer, note } = request.body;
    const result = await store.decideApproval(id, { status, reviewer, note });
    if (!result) {
      response.status(404).json({ error: "Approval not found." });
      return;
    }

    response.json({ ok: true });
  });

  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));

  app.get("*", (_request, response) => {
    response.sendFile(path.join(distPath, "index.html"));
  });

  return app;
}

async function start() {
  const app = await createApp();
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`AI Native Studio listening on port ${port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Failed to start AI Native Studio", error);
    process.exit(1);
  });
}

module.exports = {
  createApp,
  start
};
