const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { validateRequirementLedger } = require("../scripts/validate-requirement-ledger");
const example = require("../assets/workflows/examples/requirement-ledger.json");
const cli = path.resolve(__dirname, "../scripts/validate-requirement-ledger.js");

const directory = fs.mkdtempSync(path.join(os.tmpdir(), "requirement-ledger-"));
const fixture = path.join(directory, "ledger.json");
const conflict = {
  id: "CONFLICT-001",
  requirementIds: ["REQ-001"],
  sources: [
    ...example.requirements[0].sources,
    { authority: "owner_decision", reference: "decisions/records/example.md" }
  ],
  status: "open",
  resolutionRef: null
};

function checkFixture(label, mutate, exitCode, message) {
  const ledger = structuredClone(example);
  mutate(ledger);
  const result = validateRequirementLedger(ledger);
  assert.equal(result.valid, exitCode === 0, label);
  fs.writeFileSync(fixture, JSON.stringify(ledger));
  const processResult = spawnSync(process.execPath, [cli, fixture], { encoding: "utf8" });
  assert.ifError(processResult.error);
  assert.equal(processResult.status, exitCode, `${label}: ${processResult.stderr}`);
  if (message) assert.match(processResult.stderr, message);
  console.log(`${label}: exit ${processResult.status}`);
}

try {
  checkFixture("Verified ready ledger", () => {}, 0);
  checkFixture("Unverified required requirement", (ledger) => {
    ledger.requirements[0].disposition = "pending";
  }, 1, /must be verified/);
  checkFixture("Unresolved conflict", (ledger) => {
    ledger.conflicts.push(conflict);
  }, 1, /unresolved conflict/);
  checkFixture("Missing evidence", (ledger) => {
    ledger.requirements[0].evidence = [];
  }, 1, /independently checkable evidence/);
  checkFixture("Agent claim only", (ledger) => {
    ledger.requirements[0].evidence[0].kind = "agent_claim";
  }, 1, /independently checkable evidence/);
  checkFixture("Prose mislabeled as evidence", (ledger) => {
    ledger.requirements[0].evidence[0].reference = "I finished it.";
  }, 1, /reference/);
  checkFixture("HTTPS evidence reference", (ledger) => {
    ledger.requirements[0].evidence[0] = {
      kind: "ci_run",
      reference: "https://github.com/example/repo/actions/runs/123"
    };
  }, 0);
  checkFixture("Missing source provenance", (ledger) => {
    ledger.requirements[0].sources = [];
  }, 1, /sources/);
  checkFixture("Verified requirement with open blocker", (ledger) => {
    ledger.requirements[0].blockers.push("Review required");
  }, 1, /open blockers/);
  checkFixture("Resolved conflict with source references", (ledger) => {
    ledger.conflicts.push({ ...conflict, status: "resolved", resolutionRef: "decisions/records/example.md" });
  }, 0);
  checkFixture("Draft with unresolved conflict", (ledger) => {
    ledger.readiness = "draft";
    ledger.conflicts.push(conflict);
  }, 0);
  checkFixture("Duplicate requirement", (ledger) => {
    ledger.requirements.push(ledger.requirements[0]);
  }, 1, /Duplicate requirement/);
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
