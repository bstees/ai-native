const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { validateAgentOrchestration } = require("../scripts/validate-agent-orchestration");

const root = path.join(__dirname, "..", "assets", "agent-orchestration");

function run() {
  const current = validateAgentOrchestration(root);
  assert.deepStrictEqual(current, { valid: true, errors: [] });

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agent-contract-test-"));
  fs.cpSync(root, tempRoot, { recursive: true });
  const profilePath = path.join(tempRoot, "profiles", "delivery.json");
  const invalidProfile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
  delete invalidProfile.governance.actionAuthority;
  fs.writeFileSync(profilePath, `${JSON.stringify(invalidProfile, null, 2)}\n`);

  const invalid = validateAgentOrchestration(tempRoot);
  assert.strictEqual(invalid.valid, false);
  assert.ok(
    invalid.errors.some(
      (message) => message.includes("delivery.json/governance") && message.includes("actionAuthority")
    ),
    `Expected an actionable actionAuthority error, received: ${invalid.errors.join("; ")}`
  );

  console.log("Agent orchestration contract validation passed.");
}

run();
