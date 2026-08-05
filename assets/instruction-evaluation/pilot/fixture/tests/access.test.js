const assert = require("assert");
const { canAccess } = require("../src/access");

assert.strictEqual(
  canAccess({ organizationId: "alpha", role: "editor" }, { organizationId: "alpha" }),
  true
);
