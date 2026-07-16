const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { resolveAgentPlan } = require("../assets/agent-orchestration/resolve");

const root = path.join(__dirname, "..", "assets", "agent-orchestration");

function run() {
  const documentation = resolveAgentPlan({ root, provider: "codex", profile: "documentation" });
  assert.strictEqual(documentation.status, "ready");
  assert.strictEqual(documentation.routing.modelAlias, "efficient-current");
  assert.strictEqual(documentation.context.providerInheritance, "none");
  assert.strictEqual(documentation.execution.readOnly, true);
  assert.ok(documentation.controls.every(({ enforcement }) => enforcement !== "unsupported"));

  const genericDelivery = resolveAgentPlan({ root, provider: "generic", profile: "delivery" });
  assert.strictEqual(genericDelivery.status, "ready");
  assert.strictEqual(genericDelivery.routing.capabilityTier, "balanced");
  assert.ok(genericDelivery.controls.some(({ enforcement }) => enforcement === "prompt"));

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agent-routing-test-"));
  fs.cpSync(root, tempRoot, { recursive: true });
  const adapterPath = path.join(tempRoot, "adapters", "generic.json");
  const adapter = JSON.parse(fs.readFileSync(adapterPath, "utf8"));
  adapter.enforcement.contextInheritance = "unsupported";
  fs.writeFileSync(adapterPath, `${JSON.stringify(adapter, null, 2)}\n`);

  const blocked = resolveAgentPlan({ root: tempRoot, provider: "generic", profile: "documentation" });
  assert.strictEqual(blocked.status, "blocked");
  assert.deepStrictEqual(blocked.blockers.map(({ control }) => control), ["contextInheritance"]);

  console.log("Agent routing verification passed.");
}

run();
