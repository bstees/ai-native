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

function run() {
  const valid = JSON.parse(fs.readFileSync(examplePath, "utf8"));
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
    committedEvidence.review.disposition = "verified";
    committedEvidence.review.unresolvedRisks = [];
    assert.deepStrictEqual(
      validateTaskEvidence(committedEvidence, { baseDirectory: committedRoot }),
      { valid: true, errors: [] }
    );
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
