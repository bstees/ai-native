#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const Ajv2020 = require("ajv/dist/2020");

const defaultManifestPath = path.join(
  __dirname,
  "..",
  "planning",
  "weekly-digest-delivery-manifest.json"
);
const defaultSchemaPath = path.join(
  __dirname,
  "..",
  "schemas",
  "weekly-digest-delivery-manifest.schema.json"
);

function formatSchemaErrors(errors) {
  return (errors || []).map(({ instancePath, message }) =>
    `${instancePath || "/"} ${message}`
  );
}

function indexUnique(items, key, collectionName, errors) {
  const index = new Map();
  for (const item of items || []) {
    const value = item[key];
    if (index.has(value)) errors.push(`/${collectionName} contains duplicate ${key} ${value}`);
    index.set(value, item);
  }
  return index;
}

function sameMembers(left, right) {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((value) => rightSet.has(value));
}

function validateWeeklyDigestManifest(
  manifest,
  { schemaPath = defaultSchemaPath } = {}
) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  const schemaValid = validate(manifest);
  const errors = schemaValid ? [] : formatSchemaErrors(validate.errors);
  if (!schemaValid) return { valid: false, errors };

  const digests = indexUnique(manifest.digests, "digestId", "digests", errors);
  const findings = indexUnique(manifest.findings, "findingId", "findings", errors);
  const backlogItems = indexUnique(manifest.backlogItems, "backlogId", "backlogItems", errors);
  const implementations = indexUnique(
    manifest.implementations,
    "implementationId",
    "implementations",
    errors
  );
  const verificationRuns = indexUnique(
    manifest.verificationRuns,
    "verificationRunId",
    "verificationRuns",
    errors
  );

  const digestFindingRefs = new Set();
  for (const digest of manifest.digests || []) {
    if (digest.publicationDate === null) {
      if (
        digest.publicationStatus !== "blocked_missing_explicit_date" ||
        digest.siteSlug !== null ||
        digest.siteContentPath !== null ||
        digest.findingIds.length !== 0
      ) {
        errors.push(`/${digest.digestId} undated output must remain blocked and unpublished`);
      }
    } else if (digest.siteSlug !== digest.publicationDate) {
      errors.push(`/${digest.digestId}/siteSlug must equal its explicit publicationDate`);
    }

    for (const findingId of digest.findingIds || []) {
      if (digestFindingRefs.has(findingId)) {
        errors.push(`/digests reference finding ${findingId} more than once`);
      }
      digestFindingRefs.add(findingId);
      const finding = findings.get(findingId);
      if (!finding) errors.push(`/${digest.digestId} references missing finding ${findingId}`);
      else if (finding.digestId !== digest.digestId) {
        errors.push(`/${findingId}/digestId does not match ${digest.digestId}`);
      } else if (
        ["content_ready", "published"].includes(digest.publicationStatus) &&
        finding.publishedStatus !== digest.publicationStatus
      ) {
        errors.push(
          `/${findingId}/publishedStatus must match ${digest.digestId} publicationStatus`
        );
      }
    }
  }

  for (const finding of manifest.findings || []) {
    if (!digests.has(finding.digestId)) {
      errors.push(`/${finding.findingId} references missing digest ${finding.digestId}`);
    }
    if (!digestFindingRefs.has(finding.findingId)) {
      errors.push(`/${finding.findingId} is not referenced by its digest`);
    }
    const mappedBacklogIds = [finding.primaryBacklogId, ...(finding.secondaryBacklogIds || [])];
    if (new Set(mappedBacklogIds).size !== mappedBacklogIds.length) {
      errors.push(`/${finding.findingId} contains duplicate backlog mappings`);
    }
    for (const backlogId of mappedBacklogIds) {
      if (!backlogItems.has(backlogId)) {
        errors.push(`/${finding.findingId} references missing backlog item ${backlogId}`);
      }
    }
  }

  for (const backlog of manifest.backlogItems || []) {
    const expectedFindingIds = (manifest.findings || [])
      .filter(
        (finding) =>
          finding.primaryBacklogId === backlog.backlogId ||
          finding.secondaryBacklogIds.includes(backlog.backlogId)
      )
      .map((finding) => finding.findingId);
    if (!sameMembers(backlog.findingIds, expectedFindingIds)) {
      errors.push(`/${backlog.backlogId}/findingIds must be the complete reverse mapping`);
    }

    const backlogImplementations = (manifest.implementations || []).filter(
      (implementation) => implementation.backlogId === backlog.backlogId
    );
    if (backlog.status === "implemented" && backlogImplementations.length === 0) {
      errors.push(`/${backlog.backlogId} is implemented but has no implementation record`);
    }
  }

  for (const implementation of manifest.implementations || []) {
    const backlog = backlogItems.get(implementation.backlogId);
    if (!backlog) {
      errors.push(`/${implementation.implementationId} references missing backlog ${implementation.backlogId}`);
    }
    for (const findingId of implementation.findingIds || []) {
      const finding = findings.get(findingId);
      if (!finding) {
        errors.push(`/${implementation.implementationId} references missing finding ${findingId}`);
      } else if (
        finding.primaryBacklogId !== implementation.backlogId &&
        !finding.secondaryBacklogIds.includes(implementation.backlogId)
      ) {
        errors.push(`/${implementation.implementationId} finding ${findingId} is not mapped to its backlog`);
      }
    }
    for (const runId of implementation.verificationRunIds || []) {
      const run = verificationRuns.get(runId);
      if (!run) errors.push(`/${implementation.implementationId} references missing verification run ${runId}`);
      else if (run.implementationId !== implementation.implementationId) {
        errors.push(`/${runId}/implementationId does not match ${implementation.implementationId}`);
      }
    }
    if (implementation.status === "verified") {
      if (!implementation.commit) {
        errors.push(`/${implementation.implementationId} verified status requires an implementation commit`);
      }
      if (!(implementation.verificationRunIds || []).length) {
        errors.push(`/${implementation.implementationId} verified status requires verification runs`);
      }
      for (const runId of implementation.verificationRunIds || []) {
        const run = verificationRuns.get(runId);
        if (run && (run.result !== "passed" || run.exitCode !== 0)) {
          errors.push(`/${implementation.implementationId} verified status requires passing runs`);
        }
      }
    }
  }

  for (const run of manifest.verificationRuns || []) {
    if (!implementations.has(run.implementationId)) {
      errors.push(`/${run.verificationRunId} references missing implementation ${run.implementationId}`);
    }
    if ((run.result === "passed") !== (run.exitCode === 0)) {
      errors.push(`/${run.verificationRunId} result and exitCode disagree`);
    }
  }

  return { valid: errors.length === 0, errors };
}

if (require.main === module) {
  const manifestPath = path.resolve(process.argv[2] || defaultManifestPath);
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const result = validateWeeklyDigestManifest(manifest);
    if (!result.valid) {
      process.stderr.write(`${result.errors.join("\n")}\n`);
      process.exitCode = 1;
    } else {
      process.stdout.write(
        `Weekly digest manifest validation passed: ${manifest.digests.length - 1} dated digests, ${manifest.findings.length} findings, ${manifest.backlogItems.length} backlog items.\n`
      );
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { validateWeeklyDigestManifest };
