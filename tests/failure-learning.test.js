const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { validateFailureRecord } = require("../scripts/validate-failure-records");

const examplePath = path.join(
  __dirname,
  "..",
  "assets",
  "feedback",
  "examples",
  "failure-record.json"
);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectInvalid(record, fragment) {
  const result = validateFailureRecord(record);
  assert.strictEqual(result.valid, false);
  assert.ok(
    result.errors.some((error) => error.includes(fragment)),
    `Expected an error containing ${fragment}; received ${result.errors.join("; ")}`
  );
}

function run() {
  const valid = JSON.parse(fs.readFileSync(examplePath, "utf8"));
  assert.deepStrictEqual(validateFailureRecord(valid), { valid: true, errors: [] });

  const unknownClass = clone(valid);
  unknownClass.classification = "model_was_bad";
  expectInvalid(unknownClass, "classification");

  const noRegression = clone(valid);
  noRegression.regression.status = "planned";
  noRegression.regression.caseRefs = [];
  noRegression.regression.resultEvidenceRefs = [];
  expectInvalid(noRegression, "regression");

  const noApproval = clone(valid);
  noApproval.promotion.approvedBy = null;
  noApproval.promotion.approvedOn = null;
  expectInvalid(noApproval, "approval metadata");

  const oneOff = clone(valid);
  oneOff.generalizability.scope = "incident_specific";
  oneOff.generalizability.recurrenceCount = 1;
  oneOff.generalizability.occurrenceRefs = [oneOff.generalizability.occurrenceRefs[0]];
  expectInvalid(oneOff, "recurring repository");

  const inflatedRecurrence = clone(valid);
  inflatedRecurrence.generalizability.recurrenceCount = 999;
  inflatedRecurrence.generalizability.occurrenceRefs = [
    inflatedRecurrence.generalizability.occurrenceRefs[0]
  ];
  expectInvalid(inflatedRecurrence, "must equal the number of occurrenceRefs");

  const closedWithoutOutcome = clone(valid);
  closedWithoutOutcome.outcomeEvidenceRefs = [];
  expectInvalid(closedWithoutOutcome, "outcomeEvidenceRefs");

  const notReproducible = clone(valid);
  notReproducible.reproducible = false;
  expectInvalid(notReproducible, "reproducible");

  const closedCandidate = clone(valid);
  closedCandidate.promotion.decision = "candidate";
  closedCandidate.promotion.approvedBy = null;
  closedCandidate.promotion.approvedOn = null;
  expectInvalid(closedCandidate, "cannot be closed");

  console.log("Failure learning validation passed.");
}

run();
