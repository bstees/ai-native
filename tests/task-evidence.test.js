const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const {
  changedPathsFingerprint,
  commitPathsFingerprint,
  validateTaskEvidence
} = require("../scripts/validate-task-evidence");
const { contractFingerprint } = require("../scripts/validate-task-contract");

const examplePath = path.join(
  __dirname,
  "..",
  "assets",
  "quality",
  "examples",
  "task-evidence-bundle.json"
);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectInvalid(bundle, fragment) {
  const result = validateTaskEvidence(bundle);
  assert.strictEqual(result.valid, false);
  assert.ok(
    result.errors.some((error) => error.includes(fragment)),
    `Expected an error containing ${fragment}; received ${result.errors.join("; ")}`
  );
}

function testSeparateEvidenceCommit(root, legacyContract, legacyBundle, revision) {
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  const writeJson = (relativePath, value) => fs.writeFileSync(
    path.join(root, relativePath), JSON.stringify(value, null, 2) + "\n"
  );
  const contract = clone(legacyContract);
  const contractPath = `revision-${revision}.task-contract.json`;
  const evidencePath = `revision-${revision}.task-evidence-bundle.json`;
  const manifestPath = "planning/weekly-digest-delivery-manifest.json";
  const sourcePath = "src/example.js";
  const implementationPaths = [contractPath, sourcePath];
  contract.taskId = "AIN-2026-11-20-01";
  contract.revision = revision;
  contract.repository.revision = git("rev-parse", "HEAD");
  contract.scope.expectedChangedPaths = [...implementationPaths, evidencePath];
  if (revision === 3) contract.scope.expectedChangedPaths.push(manifestPath);
  contract.approval.contractFingerprint = contractFingerprint(contract);
  writeJson(contractPath, contract);
  fs.writeFileSync(path.join(root, sourcePath), `export const value = ${revision + 1};\n`);
  git("add", "--", contractPath, sourcePath);
  git("commit", "-m", `Implement revision ${revision}`);

  const bundle = clone(legacyBundle);
  bundle.task = {
    taskId: contract.taskId,
    revision: contract.revision,
    contractPath,
    contractFingerprint: contract.approval.contractFingerprint
  };
  const implementationCommit = git("rev-parse", "HEAD");
  bundle.implementation.commit = implementationCommit;
  bundle.implementation.changedPaths = implementationPaths;
  bundle.implementation.changeFingerprint = commitPathsFingerprint(
    root, implementationCommit, implementationPaths
  );
  bundle.differentialEvidence = { applicability: "not_applicable", rationale: "Fixture only.", records: [] };

  function checkEvidenceCommit(input, extraPath, message, includeManifest = revision === 3) {
    git("reset", "--hard", implementationCommit);
    writeJson(evidencePath, input);
    git("add", "--", evidencePath);
    if (includeManifest) {
      fs.mkdirSync(path.join(root, "planning"), { recursive: true });
      writeJson(manifestPath, { commit: implementationCommit });
      git("add", "--", manifestPath);
    }
    if (extraPath) {
      fs.writeFileSync(path.join(root, extraPath), "unexpected change\n");
      git("add", "--", extraPath);
    }
    git("commit", "-m", "Record evidence");
    const result = validateTaskEvidence(input, { baseDirectory: root });
    if (message) {
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((error) => error.includes(message)), result.errors.join("\n"));
    } else {
      assert.deepStrictEqual(result, { valid: true, errors: [] });
    }
  }

  checkEvidenceCommit(bundle, null);
  const unpublished = clone(bundle);
  unpublished.review.reviewerId = "different-reviewer";
  assert.ok(validateTaskEvidence(unpublished, { baseDirectory: root }).errors.some(
    (error) => error.includes("must contain the supplied evidence bundle")
  ));
  if (revision === 3) checkEvidenceCommit(bundle, null, "must change only", false);
  checkEvidenceCommit(bundle, "extra.txt", "must change only");
  checkEvidenceCommit(bundle, sourcePath, "must change only");
  const incorrectFingerprint = clone(bundle);
  incorrectFingerprint.implementation.changeFingerprint = "0".repeat(64);
  checkEvidenceCommit(incorrectFingerprint, null, "does not match the committed path contents");
}

function run() {
  const valid = JSON.parse(fs.readFileSync(examplePath, "utf8"));
  assert.strictEqual(
    valid.implementation.changeFingerprint,
    commitPathsFingerprint(path.join(__dirname, ".."), "936bc227bb62fe59901d166d7ccd11bcaeef94c9",
      valid.implementation.changedPaths)
  );
  // The historical example includes the files changed by this task.
  valid.implementation.changeFingerprint = changedPathsFingerprint(
    path.join(__dirname, ".."), valid.implementation.changedPaths
  );
  assert.deepStrictEqual(validateTaskEvidence(valid), { valid: true, errors: [] });

  const uncommittedVerified = clone(valid);
  uncommittedVerified.review.disposition = "verified";
  uncommittedVerified.review.unresolvedRisks = [];
  expectInvalid(uncommittedVerified, "required for verified evidence");

  const missingContract = clone(valid);
  missingContract.task.contractPath = "assets/workflows/examples/does-not-exist.json";
  expectInvalid(missingContract, "existing repository-relative contract");

  const bogusFingerprint = clone(valid);
  bogusFingerprint.task.contractFingerprint = "f".repeat(64);
  expectInvalid(bogusFingerprint, "does not match");

  const incompleteCriteria = clone(valid);
  incompleteCriteria.criterionEvidence.pop();
  expectInvalid(incompleteCriteria, "exact approved");

  const omittedChange = clone(valid);
  omittedChange.implementation.changedPaths.pop();
  omittedChange.implementation.changeFingerprint = changedPathsFingerprint(
    path.join(__dirname, ".."),
    omittedChange.implementation.changedPaths
  );
  expectInvalid(omittedChange, "approved expected changed-path set");

  const arbitraryBranch = clone(valid);
  arbitraryBranch.implementation.branch = "unapproved/branch";
  expectInvalid(arbitraryBranch, "approved contract branch");

  const unrelatedCommit = clone(valid);
  unrelatedCommit.implementation.commit = "833c04d";
  unrelatedCommit.implementation.changeFingerprint = "0".repeat(64);
  expectInvalid(unrelatedCommit, "base-to-commit diff");

  const noRevision = clone(valid);
  delete noRevision.task.revision;
  expectInvalid(noRevision, "revision");

  const noCommandResult = clone(valid);
  delete noCommandResult.commandEvidence[0].exitCode;
  expectInvalid(noCommandResult, "exitCode");

  const nonexistentChange = clone(valid);
  nonexistentChange.implementation.changedPaths.push("does/not/exist.js");
  nonexistentChange.implementation.changeFingerprint = "0".repeat(64);
  expectInvalid(nonexistentChange, "not a current repository file");

  const selfReview = clone(valid);
  selfReview.review.reviewerId = selfReview.implementation.actorId;
  expectInvalid(selfReview, "must differ");

  const blocking = clone(valid);
  blocking.review.disposition = "verified";
  blocking.review.unresolvedRisks = [];
  blocking.review.findings.push({
    id: "REV-001",
    severity: "blocking",
    status: "open",
    summary: "Acceptance evidence does not cover the failure path.",
    evidenceRefs: ["tests/task-evidence.test.js"]
  });
  expectInvalid(blocking, "blocking");

  const failedCriterion = clone(valid);
  failedCriterion.review.disposition = "verified";
  failedCriterion.review.unresolvedRisks = [];
  failedCriterion.criterionEvidence[0].status = "insufficient";
  expectInvalid(failedCriterion, "every acceptance criterion");

  const inconsistentCommand = clone(valid);
  inconsistentCommand.review.disposition = "changes_required";
  inconsistentCommand.commandEvidence[0].result = "failed";
  expectInvalid(inconsistentCommand, "disagree");

  const malformedCriteria = clone(valid);
  malformedCriteria.criterionEvidence = {};
  assert.doesNotThrow(() => validateTaskEvidence(malformedCriteria));
  expectInvalid(malformedCriteria, "criterionEvidence");

  const unknownDeviationCriterion = clone(valid);
  unknownDeviationCriterion.requirementDeviations.push({
    id: "DEV-001",
    criterionIds: ["AC-999"],
    kind: "substitution",
    description: "Use a different validation seam.",
    rationale: "The requested seam is unavailable.",
    impact: "non_material",
    status: "disclosed",
    humanGateId: null,
    evidenceRefs: ["evidence:deviation"]
  });
  expectInvalid(unknownDeviationCriterion, "unknown criterion AC-999");

  const unapprovedMaterialDeviation = clone(valid);
  unapprovedMaterialDeviation.requirementDeviations.push({
    id: "DEV-001",
    criterionIds: ["AC-001"],
    kind: "compromise",
    description: "Skip one required validation mode.",
    rationale: "The implementation actor considered it too expensive.",
    impact: "material",
    status: "disclosed",
    humanGateId: null,
    evidenceRefs: ["evidence:deviation"]
  });
  unapprovedMaterialDeviation.review.disposition = "verified";
  unapprovedMaterialDeviation.review.unresolvedRisks = [];
  expectInvalid(unapprovedMaterialDeviation, "every deviation must be resolved");

  const unresolvedNonMaterialDeviation = clone(valid);
  unresolvedNonMaterialDeviation.requirementDeviations.push({
    id: "DEV-001",
    criterionIds: ["AC-001"],
    kind: "substitution",
    description: "Use a different evidence label without repairing the contract mismatch.",
    rationale: "The implementation actor considered the label equivalent.",
    impact: "non_material",
    status: "disclosed",
    humanGateId: null,
    evidenceRefs: ["evidence:deviation"]
  });
  unresolvedNonMaterialDeviation.review.disposition = "verified";
  unresolvedNonMaterialDeviation.review.unresolvedRisks = [];
  expectInvalid(unresolvedNonMaterialDeviation, "every deviation must be resolved");

  const approvedNonMaterialWithoutGate = clone(valid);
  approvedNonMaterialWithoutGate.requirementDeviations.push({
    id: "DEV-001",
    criterionIds: ["AC-001"],
    kind: "substitution",
    description: "Treat a non-material contract change as approved without its gate.",
    rationale: "The implementation actor considered the change minor.",
    impact: "non_material",
    status: "approved",
    humanGateId: "GATE-001",
    evidenceRefs: ["evidence:deviation"]
  });
  expectInvalid(approvedNonMaterialWithoutGate, "approved deviation requires");

  const requiredWithoutRecord = clone(valid);
  requiredWithoutRecord.differentialEvidence = {
    applicability: "required",
    rationale: null,
    records: []
  };
  expectInvalid(requiredWithoutRecord, "at least one record");

  const unexpectedDifferentialResult = clone(valid);
  unexpectedDifferentialResult.differentialEvidence = {
    applicability: "required",
    rationale: null,
    records: [
      {
        id: "DIFF-001",
        criterionIds: ["AC-001"],
        baseRevision: "140e3ff2706ef5a9873d8bf3e4eb716ee86c8ae9",
        patchedRevision: "WORKTREE",
        command: "node tests/task-contract.test.js",
        expectedBaseResult: "failed",
        observedBaseResult: "passed",
        baseExitCode: 0,
        expectedPatchedResult: "passed",
        observedPatchedResult: "passed",
        patchedExitCode: 0,
        evidenceRefs: ["evidence:differential"]
      }
    ]
  };
  expectInvalid(unexpectedDifferentialResult, "observed results do not match expectations");

  const validDifferential = clone(valid);
  validDifferential.differentialEvidence = {
    applicability: "required",
    rationale: null,
    records: [
      {
        id: "DIFF-001",
        criterionIds: ["AC-001"],
        baseRevision: "140e3ff2706ef5a9873d8bf3e4eb716ee86c8ae9",
        patchedRevision: "WORKTREE",
        command: "node tests/task-contract.test.js",
        expectedBaseResult: "failed",
        observedBaseResult: "failed",
        baseExitCode: 1,
        expectedPatchedResult: "passed",
        observedPatchedResult: "passed",
        patchedExitCode: 0,
        evidenceRefs: ["evidence:differential"]
      }
    ]
  };
  assert.deepStrictEqual(validateTaskEvidence(validDifferential), { valid: true, errors: [] });

  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "task-evidence-gate-test-"));
  try {
    for (const relativePath of valid.implementation.changedPaths) {
      const source = path.join(__dirname, "..", relativePath);
      const target = path.join(temporaryRoot, relativePath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(source, target);
    }
    const sourceContractPath = path.join(__dirname, "..", valid.task.contractPath);
    const consequentialContract = JSON.parse(fs.readFileSync(sourceContractPath, "utf8"));
    consequentialContract.authority.level = "consequential_changes";
    consequentialContract.humanGates[0].status = "pending";
    consequentialContract.verificationCommands = ["node tests/task-contract.test.js"];
    consequentialContract.approval.contractFingerprint = contractFingerprint(consequentialContract);
    const temporaryContractPath = path.join(temporaryRoot, valid.task.contractPath);
    fs.mkdirSync(path.dirname(temporaryContractPath), { recursive: true });
    fs.writeFileSync(
      temporaryContractPath,
      `${JSON.stringify(consequentialContract, null, 2)}\n`
    );
    const pendingGateEvidence = clone(valid);
    pendingGateEvidence.review.disposition = "verified";
    pendingGateEvidence.review.unresolvedRisks = [];
    pendingGateEvidence.task.contractFingerprint = consequentialContract.approval.contractFingerprint;
    pendingGateEvidence.implementation.changeFingerprint = changedPathsFingerprint(
      temporaryRoot,
      pendingGateEvidence.implementation.changedPaths
    );
    const pendingResult = validateTaskEvidence(pendingGateEvidence, {
      baseDirectory: temporaryRoot
    });
    assert.strictEqual(pendingResult.valid, false);
    assert.ok(pendingResult.errors.some((error) => error.includes("approved human gate")));

    consequentialContract.humanGates[0].status = "approved";
    consequentialContract.approval.contractFingerprint = contractFingerprint(consequentialContract);
    fs.writeFileSync(
      temporaryContractPath,
      `${JSON.stringify(consequentialContract, null, 2)}\n`
    );
    const approvedDeviationEvidence = clone(valid);
    approvedDeviationEvidence.task.contractFingerprint =
      consequentialContract.approval.contractFingerprint;
    approvedDeviationEvidence.implementation.changeFingerprint = changedPathsFingerprint(
      temporaryRoot,
      approvedDeviationEvidence.implementation.changedPaths
    );
    approvedDeviationEvidence.requirementDeviations.push({
      id: "DEV-001",
      criterionIds: ["AC-001"],
      kind: "substitution",
      description: "Use an approved equivalent validation seam.",
      rationale: "The original seam is unavailable in the target runtime.",
      impact: "material",
      status: "approved",
      humanGateId: "GATE-001",
      evidenceRefs: ["evidence:approved-deviation"]
    });
    assert.deepStrictEqual(
      validateTaskEvidence(approvedDeviationEvidence, { baseDirectory: temporaryRoot }),
      { valid: true, errors: [] }
    );
    const missingRequiredCommand = clone(approvedDeviationEvidence);
    missingRequiredCommand.commandEvidence[0].command = "true";
    const missingCommandResult = validateTaskEvidence(missingRequiredCommand, {
      baseDirectory: temporaryRoot
    });
    assert.strictEqual(missingCommandResult.valid, false);
    assert.ok(
      missingCommandResult.errors.some((error) =>
        error.includes("missing approved verification command")
      )
    );
    approvedDeviationEvidence.review.disposition = "verified";
    approvedDeviationEvidence.review.unresolvedRisks = [];
    const approvedDeviationResult = validateTaskEvidence(approvedDeviationEvidence, {
      baseDirectory: temporaryRoot
    });
    assert.strictEqual(approvedDeviationResult.valid, false);
    assert.ok(
      approvedDeviationResult.errors.some((error) =>
        error.includes("every deviation must be resolved")
      )
    );
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }

  const committedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "task-evidence-commit-test-"));
  try {
    const sourceContractPath = path.join(__dirname, "..", valid.task.contractPath);
    const committedContract = JSON.parse(fs.readFileSync(sourceContractPath, "utf8"));
    committedContract.repository.revision = "BASELINE";
    committedContract.repository.branch = "feature/committed-evidence";
    committedContract.scope.expectedChangedPaths = ["src/example.js"];
    committedContract.approval.contractFingerprint = contractFingerprint(committedContract);

    const committedContractPath = path.join(committedRoot, valid.task.contractPath);
    fs.mkdirSync(path.dirname(committedContractPath), { recursive: true });
    fs.writeFileSync(committedContractPath, `${JSON.stringify(committedContract, null, 2)}\n`);
    fs.mkdirSync(path.join(committedRoot, "src"), { recursive: true });
    fs.writeFileSync(path.join(committedRoot, "src", "example.js"), "export const value = 1;\n");

    execFileSync("git", ["init"], { cwd: committedRoot, stdio: "ignore" });
    execFileSync("git", ["config", "user.name", "Evidence Test"], {
      cwd: committedRoot,
      stdio: "ignore"
    });
    execFileSync("git", ["config", "user.email", "evidence@example.test"], {
      cwd: committedRoot,
      stdio: "ignore"
    });
    execFileSync("git", ["config", "commit.gpgsign", "false"], {
      cwd: committedRoot,
      stdio: "ignore"
    });
    execFileSync("git", ["add", "."], { cwd: committedRoot, stdio: "ignore" });
    execFileSync("git", ["commit", "-m", "baseline"], {
      cwd: committedRoot,
      stdio: "ignore"
    });
    execFileSync("git", ["tag", "BASELINE"], { cwd: committedRoot, stdio: "ignore" });
    execFileSync("git", ["checkout", "-b", "feature/committed-evidence"], {
      cwd: committedRoot,
      stdio: "ignore"
    });
    fs.writeFileSync(path.join(committedRoot, "src", "example.js"), "export const value = 2;\n");
    execFileSync("git", ["add", "src/example.js"], { cwd: committedRoot, stdio: "ignore" });
    execFileSync("git", ["commit", "-m", "implement example"], {
      cwd: committedRoot,
      stdio: "ignore"
    });
    const implementationCommit = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: committedRoot,
      encoding: "utf8"
    }).trim();

    const committedEvidence = clone(valid);
    committedEvidence.task.contractFingerprint = committedContract.approval.contractFingerprint;
    committedEvidence.implementation.branch = committedContract.repository.branch;
    committedEvidence.implementation.commit = implementationCommit;
    committedEvidence.implementation.changedPaths = ["src/example.js"];
    committedEvidence.implementation.changeFingerprint = commitPathsFingerprint(
      committedRoot,
      implementationCommit,
      committedEvidence.implementation.changedPaths
    );
    committedEvidence.differentialEvidence = {
      applicability: "required",
      rationale: null,
      records: [
        {
          id: "DIFF-001",
          criterionIds: ["AC-001"],
          baseRevision: "BASELINE",
          patchedRevision: implementationCommit,
          command: "node tests/example.test.js",
          expectedBaseResult: "failed",
          observedBaseResult: "failed",
          baseExitCode: 1,
          expectedPatchedResult: "passed",
          observedPatchedResult: "passed",
          patchedExitCode: 0,
          evidenceRefs: ["evidence:base-run", "evidence:patched-run"]
        }
      ]
    };
    committedEvidence.review.disposition = "verified";
    committedEvidence.review.unresolvedRisks = [];
    committedEvidence.requirementDeviations.push({
      id: "DEV-001",
      criterionIds: ["AC-001"],
      kind: "substitution",
      description: "An early implementation used the wrong source path.",
      rationale: "The approach was repaired before the final commit.",
      impact: "material",
      status: "resolved",
      humanGateId: null,
      evidenceRefs: ["evidence:repaired-diff"]
    });
    assert.deepStrictEqual(
      validateTaskEvidence(committedEvidence, { baseDirectory: committedRoot }),
      { valid: true, errors: [] }
    );
    testSeparateEvidenceCommit(committedRoot, committedContract, committedEvidence, 2);
    testSeparateEvidenceCommit(committedRoot, committedContract, committedEvidence, 3);
  } finally {
    fs.rmSync(committedRoot, { recursive: true, force: true });
  }

  assert.strictEqual(
    valid.implementation.changeFingerprint,
    changedPathsFingerprint(
      path.join(__dirname, ".."),
      valid.implementation.changedPaths
    )
  );

  console.log("Task evidence validation passed.");
}

run();
