#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const Ajv2020 = require("ajv/dist/2020");

const {
  contractFingerprint,
  validateTaskContract
} = require("./validate-task-contract");

const defaultSchemaPath = path.join(
  __dirname,
  "..",
  "assets",
  "quality",
  "contracts",
  "task-evidence-bundle.schema.json"
);

function formatSchemaErrors(errors) {
  return (errors || []).map(({ instancePath, message }) =>
    `${instancePath || "/"} ${message}`
  );
}

function resolveRepositoryPath(baseDirectory, relativePath) {
  if (typeof relativePath !== "string" || path.isAbsolute(relativePath)) return null;
  const base = path.resolve(baseDirectory);
  const resolved = path.resolve(base, relativePath);
  return resolved.startsWith(`${base}${path.sep}`) ? resolved : null;
}

function changedPathsFingerprint(baseDirectory, changedPaths) {
  const hash = crypto.createHash("sha256");
  for (const relativePath of [...changedPaths].sort()) {
    const resolved = resolveRepositoryPath(baseDirectory, relativePath);
    if (!resolved || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      throw new Error(`Changed path is not a current repository file: ${relativePath}`);
    }
    hash.update(relativePath.split(path.sep).join("/"));
    hash.update("\0");
    hash.update(fs.readFileSync(resolved));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function commitPathsFingerprint(baseDirectory, commit, changedPaths) {
  const hash = crypto.createHash("sha256");
  for (const relativePath of [...changedPaths].sort()) {
    hash.update(relativePath.split(path.sep).join("/"));
    hash.update("\0");
    try {
      hash.update(
        execFileSync("git", ["-C", baseDirectory, "show", `${commit}:${relativePath}`], {
          maxBuffer: 256 * 1024 * 1024,
          stdio: ["ignore", "pipe", "ignore"]
        })
      );
    } catch (error) {
      hash.update("DELETED");
    }
    hash.update("\0");
  }
  return hash.digest("hex");
}

function commitChangedPaths(baseDirectory, baseRevision, commit) {
  const output = execFileSync(
    "git",
    ["-C", baseDirectory, "diff", "--name-only", "-z", baseRevision, commit, "--"],
    {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"]
    }
  );
  return output.split("\0").filter(Boolean).sort();
}

function sameMembers(left, right) {
  return left.length === right.length && left.every((value) => right.includes(value));
}

function validateTaskEvidence(
  bundle,
  {
    schemaPath = defaultSchemaPath,
    baseDirectory = path.join(__dirname, "..")
  } = {}
) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  const schemaValid = validate(bundle);
  const errors = schemaValid ? [] : formatSchemaErrors(validate.errors);
  if (!schemaValid) return { valid: false, errors };
  const review = bundle.review && typeof bundle.review === "object" ? bundle.review : {};
  const implementation =
    bundle.implementation && typeof bundle.implementation === "object"
      ? bundle.implementation
      : {};

  let contract = null;
  const contractPath = resolveRepositoryPath(baseDirectory, bundle.task?.contractPath);
  if (!contractPath || !fs.existsSync(contractPath)) {
    errors.push("/task/contractPath must reference an existing repository-relative contract");
  } else {
    try {
      contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
      const contractResult = validateTaskContract(contract);
      if (!contractResult.valid) {
        errors.push(
          ...contractResult.errors.map((error) => `/task/contractPath referenced contract ${error}`)
        );
      }
      if (contract.status !== "approved" || !contract.approval) {
        errors.push("/task/contractPath must reference an approved task contract");
      }
      if (bundle.task?.taskId !== contract.taskId) {
        errors.push("/task/taskId does not match the referenced contract");
      }
      if (bundle.task?.revision !== contract.revision) {
        errors.push("/task/revision does not match the referenced contract");
      }
      if (implementation.branch !== contract.repository?.branch) {
        errors.push("/implementation/branch does not match the approved contract branch");
      }
      if (
        Array.isArray(implementation.changedPaths) &&
        Array.isArray(contract.scope?.expectedChangedPaths) &&
        !sameMembers(
          [...implementation.changedPaths].sort(),
          [...contract.scope.expectedChangedPaths].sort()
        )
      ) {
        errors.push("/implementation/changedPaths must equal the approved expected changed-path set");
      }
      const fingerprint = contractFingerprint(contract);
      if (
        bundle.task?.contractFingerprint !== fingerprint ||
        contract.approval?.contractFingerprint !== fingerprint
      ) {
        errors.push("/task/contractFingerprint does not match the approved contract");
      }
      if (Array.isArray(bundle.criterionEvidence) && Array.isArray(contract.acceptanceCriteria)) {
        const evidenceIds = bundle.criterionEvidence.map((item) => item.criterionId);
        const contractIds = contract.acceptanceCriteria.map((item) => item.id);
        if (!sameMembers(evidenceIds, contractIds)) {
          errors.push("/criterionEvidence must cover the exact approved acceptance-criterion set");
        }
      }
    } catch (error) {
      errors.push(`/task/contractPath could not be validated: ${error.message}`);
    }
  }

  if (Array.isArray(implementation.changedPaths)) {
    for (const changedPath of implementation.changedPaths) {
      if (!resolveRepositoryPath(baseDirectory, changedPath)) {
        errors.push(`/implementation/changedPaths contains an unsafe path: ${changedPath}`);
      }
    }
    if (implementation.commit === null) {
      try {
        const fingerprint = changedPathsFingerprint(baseDirectory, implementation.changedPaths);
        if (implementation.changeFingerprint !== fingerprint) {
          errors.push("/implementation/changeFingerprint does not match the current changed paths");
        }
      } catch (error) {
        errors.push(`/implementation/changedPaths ${error.message}`);
      }
    }
  }

  if (typeof implementation.commit === "string") {
    try {
      execFileSync(
        "git",
        ["-C", baseDirectory, "cat-file", "-e", `${implementation.commit}^{commit}`],
        { stdio: "ignore" }
      );
      execFileSync(
        "git",
        [
          "-C",
          baseDirectory,
          "merge-base",
          "--is-ancestor",
          contract.repository.revision,
          implementation.commit
        ],
        { stdio: "ignore" }
      );
      const committedPaths = commitChangedPaths(
        baseDirectory,
        contract.repository.revision,
        implementation.commit
      );
      if (!sameMembers(committedPaths, [...implementation.changedPaths].sort())) {
        errors.push("/implementation/changedPaths do not match the approved base-to-commit diff");
      }
      if (
        implementation.changeFingerprint !==
        commitPathsFingerprint(baseDirectory, implementation.commit, implementation.changedPaths)
      ) {
        errors.push("/implementation/changeFingerprint does not match the committed path contents");
      }
    } catch (error) {
      errors.push(
        "/implementation/commit must descend from the approved base and resolve in the evidence repository"
      );
    }
  }

  if (review.independent && review.reviewerId === implementation.actorId) {
    errors.push("/review/reviewerId must differ from the implementation actor for independent review");
  }

  const criterionIds = new Set();
  for (const evidence of Array.isArray(bundle.criterionEvidence) ? bundle.criterionEvidence : []) {
    if (criterionIds.has(evidence.criterionId)) {
      errors.push(`/criterionEvidence contains duplicate criterion ${evidence.criterionId}`);
    }
    criterionIds.add(evidence.criterionId);
  }

  if (review.disposition === "verified") {
    if (
      contract?.authority?.level === "consequential_changes" &&
      !(
        Array.isArray(contract.humanGates) &&
        contract.humanGates.some((gate) => gate.status === "approved")
      )
    ) {
      errors.push("/review verified consequential work requires an approved human gate");
    }
    if (!review.independent || !review.readOnly) {
      errors.push("/review verified disposition requires an independent, read-only reviewer");
    }
    if (
      Array.isArray(bundle.commandEvidence) &&
      bundle.commandEvidence.some((item) => item.result !== "passed" || item.exitCode !== 0)
    ) {
      errors.push("/commandEvidence every command must pass with exitCode 0 for verified disposition");
    }
    if (
      Array.isArray(bundle.criterionEvidence) &&
      bundle.criterionEvidence.some((item) => item.status !== "passed")
    ) {
      errors.push("/criterionEvidence every acceptance criterion must pass for verified disposition");
    }
    if (
      Array.isArray(review.findings) &&
      review.findings.some((item) => item.severity === "blocking" && item.status === "open")
    ) {
      errors.push("/review/findings unresolved blocking findings prevent verified disposition");
    }
    if (Array.isArray(review.unresolvedRisks) && review.unresolvedRisks.length) {
      errors.push("/review/unresolvedRisks must be empty for verified disposition");
    }
  }

  for (const item of Array.isArray(bundle.commandEvidence) ? bundle.commandEvidence : []) {
    if ((item.result === "passed") !== (item.exitCode === 0)) {
      errors.push(`/commandEvidence result and exitCode disagree for ${item.command}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    process.stderr.write("Usage: validate-task-evidence <task-evidence-bundle.json>\n");
    process.exitCode = 1;
  } else {
    try {
      const bundle = JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
      const result = validateTaskEvidence(bundle);
      if (!result.valid) {
        process.stderr.write(`${result.errors.join("\n")}\n`);
        process.exitCode = 1;
      } else {
        process.stdout.write("Task evidence validation passed.\n");
      }
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}

module.exports = {
  changedPathsFingerprint,
  commitChangedPaths,
  commitPathsFingerprint,
  validateTaskEvidence
};
