const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  validateWeeklyDigestManifest
} = require("../scripts/validate-weekly-digest-delivery-manifest");

const manifestPath = path.join(
  __dirname,
  "..",
  "planning",
  "weekly-digest-delivery-manifest.json"
);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectInvalid(manifest, fragment) {
  const result = validateWeeklyDigestManifest(manifest);
  assert.strictEqual(result.valid, false);
  assert.ok(
    result.errors.some((error) => error.includes(fragment)),
    `Expected an error containing ${fragment}; received ${result.errors.join("; ")}`
  );
}

function run() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert.deepStrictEqual(validateWeeklyDigestManifest(manifest), { valid: true, errors: [] });
  assert.strictEqual(manifest.digests.filter((digest) => digest.publicationDate).length, 13);
  assert.strictEqual(manifest.findings.length, 61);
  assert.strictEqual(manifest.backlogItems.length, 10);

  const duplicate = clone(manifest);
  duplicate.findings.push(clone(duplicate.findings[0]));
  expectInvalid(duplicate, "duplicate findingId");

  const orphanFinding = clone(manifest);
  orphanFinding.findings[0].digestId = "digest-2099-01-01";
  expectInvalid(orphanFinding, "missing digest");

  const inventedDate = clone(manifest);
  const undated = inventedDate.digests.find((digest) => digest.publicationDate === null);
  undated.publicationDate = "2026-08-07";
  expectInvalid(inventedDate, "siteSlug");

  const missingBacklog = clone(manifest);
  missingBacklog.findings[0].primaryBacklogId = "AF-999";
  expectInvalid(missingBacklog, "missing backlog item");

  const mismatchedPublication = clone(manifest);
  mismatchedPublication.findings[0].publishedStatus = "published";
  expectInvalid(mismatchedPublication, "publicationStatus");

  const brokenVerification = clone(manifest);
  const verifiedImplementation = brokenVerification.implementations.find(
    (implementation) => implementation.status === "verified"
  );
  assert.ok(verifiedImplementation, "fixture should contain at least one verified implementation");
  verifiedImplementation.verificationRunIds.push("VR-MISSING");
  expectInvalid(brokenVerification, "missing verification run");

  console.log("Weekly digest delivery manifest validation passed.");
}

run();
