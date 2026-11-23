const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  contractFingerprint,
  validateTaskContract
} = require("../scripts/validate-task-contract");

const examplePath = path.join(
  __dirname,
  "..",
  "assets",
  "workflows",
  "examples",
  "task-contract.json"
);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectInvalid(contract, fragment) {
  const result = validateTaskContract(contract);
  assert.strictEqual(result.valid, false);
  assert.ok(
    result.errors.some((error) => error.includes(fragment)),
    `Expected an error containing ${fragment}; received ${result.errors.join("; ")}`
  );
}

function run() {
  const draft = JSON.parse(fs.readFileSync(examplePath, "utf8"));
  assert.deepStrictEqual(validateTaskContract(draft), { valid: true, errors: [] });

  const idFixture = { ...draft, status: "draft", approval: null };
  for (const taskId of ["AIN-2026-11-20-01", "abc", "a1-", "0-legacy-id", "a".repeat(80)]) {
    assert.deepStrictEqual(validateTaskContract({ ...idFixture, taskId }), { valid: true, errors: [] });
  }
  for (const taskId of [
    "AIN-26-11-20-01", "AIN-2026-1-20-01", "AIN-2026-11-2-01",
    "AIN-2026-11-20-1", "AIN-2026-11-20-001", "AIN-2026-11-20-01-extra",
    "AIN-2026-11-20-01\n", "Ain-2026-11-20-01", "ABC", "-abc",
    "ab", "with_underscore", "a".repeat(81)
  ]) {
    expectInvalid({ ...idFixture, taskId }, "/taskId");
  }

  const missingGoal = clone(draft);
  delete missingGoal.goal;
  expectInvalid(missingGoal, "goal");

  const emptyScope = clone(draft);
  emptyScope.scope.included = [];
  expectInvalid(emptyScope, "included");

  const consequentialWithoutGate = clone(draft);
  consequentialWithoutGate.authority.level = "consequential_changes";
  consequentialWithoutGate.humanGates = [];
  expectInvalid(consequentialWithoutGate, "consequential_changes");

  const approved = clone(draft);
  approved.status = "approved";
  approved.acceptanceCriteria.forEach((criterion) => {
    criterion.frozen = true;
  });
  approved.approval = {
    approvedBy: "human-owner",
    approvedOn: "2026-11-12",
    contractFingerprint: contractFingerprint(approved)
  };
  assert.deepStrictEqual(validateTaskContract(approved), { valid: true, errors: [] });

  approved.acceptanceCriteria[0].statement = "Silently changed after approval.";
  expectInvalid(approved, "contractFingerprint");

  const changedScope = clone(draft);
  changedScope.scope.included.push("An unapproved new repository");
  expectInvalid(changedScope, "contractFingerprint");

  const rejectedGate = clone(draft);
  rejectedGate.authority.level = "consequential_changes";
  rejectedGate.humanGates[0].status = "rejected";
  expectInvalid(rejectedGate, "pending or approved");

  const unfrozen = clone(draft);
  unfrozen.status = "approved";
  unfrozen.acceptanceCriteria[0].frozen = false;
  unfrozen.approval = approved.approval;
  expectInvalid(unfrozen, "frozen");

  console.log("Task contract validation passed.");
}

run();
