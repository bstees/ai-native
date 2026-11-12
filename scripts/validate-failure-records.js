#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const Ajv2020 = require("ajv/dist/2020");

const defaultSchemaPath = path.join(
  __dirname,
  "..",
  "assets",
  "feedback",
  "contracts",
  "failure-record.schema.json"
);

function formatSchemaErrors(errors) {
  return (errors || []).map(({ instancePath, message }) =>
    `${instancePath || "/"} ${message}`
  );
}

function validateFailureRecord(record, { schemaPath = defaultSchemaPath } = {}) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  const schemaValid = validate(record);
  const errors = schemaValid ? [] : formatSchemaErrors(validate.errors);
  if (!schemaValid) return { valid: false, errors };
  const promotion = record.promotion || {};
  const regression = record.regression || {};
  const generalizability = record.generalizability || {};

  if (generalizability.recurrenceCount !== (generalizability.occurrenceRefs || []).length) {
    errors.push("/generalizability/recurrenceCount must equal the number of occurrenceRefs");
  }

  if (promotion.decision === "promoted") {
    if (!record.reproducible) {
      errors.push("/reproducible must be true before a guardrail is promoted");
    }
    if (record.remediation?.type === "no_change") {
      errors.push("/remediation/type cannot be no_change for a promoted guardrail");
    }
    if (
      generalizability.scope === "incident_specific" ||
      generalizability.recurrenceCount < 2
    ) {
      errors.push("/generalizability promotion requires a recurring repository or cross-repository pattern");
    }
    if (
      regression.status !== "passing" ||
      !(regression.caseRefs || []).length ||
      !(regression.resultEvidenceRefs || []).length
    ) {
      errors.push("/regression passing case and result evidence are required for promotion");
    }
    if (!(promotion.targetRefs || []).length || !promotion.approvedBy || !promotion.approvedOn) {
      errors.push("/promotion target references and approval metadata are required for promotion");
    }
  }

  if (record.status === "closed" && !(record.outcomeEvidenceRefs || []).length) {
    errors.push("/outcomeEvidenceRefs are required when a failure record is closed");
  }
  if (record.status === "closed" && promotion.decision === "candidate") {
    errors.push("/promotion a candidate cannot be closed before a promotion decision");
  }
  if (!record.reproducible && ["candidate", "promoted"].includes(promotion.decision)) {
    errors.push("/reproducible must be true for candidate or promoted learning");
  }

  return { valid: errors.length === 0, errors };
}

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    process.stderr.write("Usage: validate-failure-record <failure-record.json>\n");
    process.exitCode = 1;
  } else {
    try {
      const record = JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
      const result = validateFailureRecord(record);
      if (!result.valid) {
        process.stderr.write(`${result.errors.join("\n")}\n`);
        process.exitCode = 1;
      } else {
        process.stdout.write("Failure record validation passed.\n");
      }
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}

module.exports = { validateFailureRecord };
