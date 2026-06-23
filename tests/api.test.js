const assert = require("assert");
const { EventEmitter } = require("events");
const { Readable, Writable } = require("stream");
const { createApp } = require("../server/index");

function invoke(app, { method, url, body }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";
    const request = new Readable({
      read() {
        if (payload) {
          this.push(payload);
        }
        this.push(null);
      }
    });

    request.method = method;
    request.url = url;
    request.headers = payload
      ? {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(payload)
        }
      : {};
    const socket = new EventEmitter();
    socket.destroy = () => {};
    request.connection = socket;
    request.socket = socket;

    const chunks = [];
    const response = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      }
    });

    response.statusCode = 200;
    response.headers = {};
    response.setHeader = (key, value) => {
      response.headers[key.toLowerCase()] = value;
    };
    response.getHeader = (key) => response.headers[key.toLowerCase()];
    response.removeHeader = (key) => {
      delete response.headers[key.toLowerCase()];
    };
    response.writeHead = (statusCode, headers) => {
      response.statusCode = statusCode;
      if (headers) {
        Object.entries(headers).forEach(([key, value]) => response.setHeader(key, value));
      }
    };
    response.end = (chunk) => {
      if (chunk) {
        chunks.push(Buffer.from(chunk));
      }
      const text = Buffer.concat(chunks).toString("utf8");
      resolve({
        status: response.statusCode,
        text,
        body: text ? JSON.parse(text) : null
      });
    };

    response.on("error", reject);

    app.handle(request, response, reject);
  });
}

async function run() {
  process.env.DB_MODE = "memory";
  const app = await createApp();

  const dashboardResponse = await invoke(app, { method: "GET", url: "/api/dashboard" });
  assert.strictEqual(dashboardResponse.status, 200);
  assert.ok(dashboardResponse.body.summary.recordCount >= 8);
  assert.ok(
    dashboardResponse.body.records.some(
      (record) => record.path === "assets/repo-rules/ai-native-core-operating-rules.md"
    )
  );
  assert.ok(dashboardResponse.body.pendingApprovals.length >= 1);

  const pilotRecord = dashboardResponse.body.records.find(
    (record) => record.path === "pilots/interest-lens/adoptions/2026-06-23-core-operating-rules.md"
  );
  assert.ok(pilotRecord);

  const updateResponse = await invoke(app, {
    method: "PATCH",
    url: `/api/records/${pilotRecord.id}`,
    body: {
      status: "piloting",
      reviewStatus: "pending-human-review",
      nextAction: "Validate the pilot against real Interest Lens usage."
    }
  });
  assert.strictEqual(updateResponse.status, 200);

  const updatedDashboard = await invoke(app, { method: "GET", url: "/api/dashboard" });
  const updatedPilotRecord = updatedDashboard.body.records.find(
    (record) => record.id === pilotRecord.id
  );
  assert.strictEqual(updatedPilotRecord.status, "piloting");
  assert.strictEqual(
    updatedPilotRecord.nextAction,
    "Validate the pilot against real Interest Lens usage."
  );

  const approval = updatedDashboard.body.pendingApprovals[0];
  const approvalResponse = await invoke(app, {
    method: "POST",
    url: `/api/approvals/${approval.id}/decision`,
    body: {
      status: "approved",
      reviewer: "Test Reviewer",
      note: "Pilot cleared for Interest Lens."
    }
  });
  assert.strictEqual(approvalResponse.status, 200);

  const postApprovalDashboard = await invoke(app, { method: "GET", url: "/api/dashboard" });
  const approvedPilotRecord = postApprovalDashboard.body.records.find(
    (record) => record.id === pilotRecord.id
  );
  assert.strictEqual(approvedPilotRecord.reviewStatus, "approved");
  assert.strictEqual(postApprovalDashboard.body.pendingApprovals.length, 0);

  console.log("API verification passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
