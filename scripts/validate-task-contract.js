#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const Ajv2020 = require("ajv/dist/2020");

const defaultSchemaPath = path.join(
  __dirname,
  "..",
  "assets",
  "workflows",
  "contracts",
  "task-contract.schema.json"
);

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .filter((key) => key !== "$schema")
      .sort()
      .map((key) => [key, stableObject(value[key])])
  );
}

function contractFingerprint(contract) {
  const approvalBasis = {
    taskId: contract.taskId,
    revision: contract.revision,
    goal: contract.goal,
    repository: contract.repository,
    scope: contract.scope,
    constraints: contract.constraints,
    assumptions: contract.assumptions,
    acceptanceCriteria: contract.acceptanceCriteria,
    authority: contract.authority,
    humanGates: Array.isArray(contract.humanGates)
      ? contract.humanGates.map(({ status, ...definition }) => definition)
      : contract.humanGates
  };
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(stableObject(approvalBasis)))
    .digest("hex");
}

function duplicateIds(items) {
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  return items
    .map((item) => item.id)
    .filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
}

function formatSchemaErrors(errors) {
  return (errors || []).map(({ instancePath, message }) =>
    `${instancePath || "/"} ${message}`
  );
}

function validateTaskContract(contract, { schemaPath = defaultSchemaPath } = {}) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  const schemaValid = validate(contract);
  const errors = schemaValid ? [] : formatSchemaErrors(validate.errors);
  if (!schemaValid) return { valid: false, errors };

  for (const [name, items] of [
    ["constraints", contract.constraints || []],
    ["assumptions", contract.assumptions || []],
    ["acceptanceCriteria", contract.acceptanceCriteria || []],
    ["humanGates", contract.humanGates || []]
  ]) {
    for (const id of duplicateIds(items)) errors.push(`/${name} contains duplicate id ${id}`);
  }

  if (
    contract.authority?.level === "consequential_changes" &&
    !(
      Array.isArray(contract.humanGates) &&
      contract.humanGates.some((gate) => gate.status === "pending" || gate.status === "approved")
    )
  ) {
    errors.push("/humanGates consequential_changes authority requires a pending or approved human gate");
  }

  if (contract.status === "approved") {
    if (!contract.approval) {
      errors.push("/approval is required when status is approved");
    }
    if (
      Array.isArray(contract.acceptanceCriteria) &&
      contract.acceptanceCriteria.some((criterion) => !criterion.frozen)
    ) {
      errors.push("/acceptanceCriteria every criterion must be frozen when status is approved");
    }
    if (
      contract.approval?.contractFingerprint &&
      contract.approval.contractFingerprint !== contractFingerprint(contract)
    ) {
      errors.push("/approval/contractFingerprint does not match the approved task boundaries");
    }
  }

  return { valid: errors.length === 0, errors };
}

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    process.stderr.write("Usage: validate-task-contract <task-contract.json>\n");
    process.exitCode = 1;
  } else {
    try {
      const contract = JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
      const result = validateTaskContract(contract);
      if (!result.valid) {
        process.stderr.write(`${result.errors.join("\n")}\n`);
        process.exitCode = 1;
      } else {
        process.stdout.write("Task contract validation passed.\n");
      }
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}

module.exports = { contractFingerprint, validateTaskContract };
