#!/usr/bin/env node

const fs = require("fs");
const Ajv2020 = require("ajv/dist/2020");
const schema = require("../assets/workflows/contracts/requirement-ledger.schema.json");

const validateSchema = new Ajv2020({ allErrors: true, strict: true }).compile(schema);

function validateRequirementLedger(ledger) {
  if (!validateSchema(ledger)) {
    return {
      valid: false,
      errors: validateSchema.errors.map(({ instancePath, message }) =>
        `${instancePath || "/"} ${message}`
      )
    };
  }

  const errors = [];
  const requirementIds = new Set();
  const conflictIds = new Set();
  const ready = ledger.readiness === "ready";

  for (const requirement of ledger.requirements) {
    const { id, required, disposition, blockers, evidence } = requirement;
    if (requirementIds.has(id)) errors.push(`Duplicate requirement ${id}`);
    requirementIds.add(id);

    if (disposition === "verified") {
      if (!evidence.some(({ kind }) => kind !== "agent_claim")) {
        errors.push(`${id} requires independently checkable evidence`);
      }
      if (blockers.length) errors.push(`${id} is verified but has open blockers`);
    }
    if (ready && required && disposition !== "verified") {
      errors.push(`${id} is required and must be verified before readiness`);
    }
  }

  for (const conflict of ledger.conflicts) {
    const { id, requirementIds: affectedIds, status, resolutionRef } = conflict;
    if (conflictIds.has(id)) errors.push(`Duplicate conflict ${id}`);
    conflictIds.add(id);
    for (const affectedId of affectedIds) {
      if (!requirementIds.has(affectedId)) errors.push(`${id} references unknown requirement ${affectedId}`);
    }
    if (status === "resolved" && resolutionRef === null) {
      errors.push(`${id} requires a resolution reference`);
    }
    if (ready && status === "open") errors.push(`${id} is an unresolved conflict`);
  }

  return { valid: errors.length === 0, errors };
}

if (require.main === module) {
  try {
    const [filePath, ...extra] = process.argv.slice(2);
    if (!filePath || extra.length) throw new Error("Usage: validate-requirement-ledger <ledger.json>");
    const result = validateRequirementLedger(JSON.parse(fs.readFileSync(filePath, "utf8")));
    if (!result.valid) throw new Error(result.errors.join("\n"));
    console.log("Requirement ledger validation passed.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { validateRequirementLedger };
