#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const Ajv2020 = require("ajv/dist/2020");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function jsonFiles(directory) {
  return fs
    .readdirSync(directory)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => path.join(directory, name));
}

function formatErrors(filePath, errors) {
  return (errors || []).map(({ instancePath, message }) =>
    `${path.basename(filePath)}${instancePath || "/"} ${message}`
  );
}

function validateAgentOrchestration(root = path.join(__dirname, "..", "assets", "agent-orchestration")) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validateProfile = ajv.compile(
    readJson(path.join(root, "contracts", "agent-profile.schema.json"))
  );
  const validateAdapter = ajv.compile(
    readJson(path.join(root, "contracts", "provider-adapter.schema.json"))
  );
  const errors = [];

  for (const filePath of jsonFiles(path.join(root, "profiles"))) {
    const profile = readJson(filePath);
    if (!validateProfile(profile)) errors.push(...formatErrors(filePath, validateProfile.errors));
  }

  for (const filePath of jsonFiles(path.join(root, "adapters"))) {
    const adapter = readJson(filePath);
    if (!validateAdapter(adapter)) errors.push(...formatErrors(filePath, validateAdapter.errors));
  }

  return { valid: errors.length === 0, errors };
}

if (require.main === module) {
  try {
    const result = validateAgentOrchestration(process.argv[2]);
    if (!result.valid) {
      process.stderr.write(`${result.errors.join("\n")}\n`);
      process.exitCode = 1;
    } else {
      process.stdout.write("Agent orchestration contract validation passed.\n");
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { validateAgentOrchestration };
