#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { isDeepStrictEqual } = require("util");
const Ajv2020 = require("ajv/dist/2020");

const DEFAULT_ROOT = path.join(__dirname, "..", "assets", "instruction-evaluation");

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

function formatSchemaErrors(filePath, errors) {
  return (errors || []).map(
    ({ instancePath, message }) => `${path.basename(filePath)}${instancePath || "/"} ${message}`
  );
}

function loadCases(root = DEFAULT_ROOT) {
  const schema = readJson(path.join(root, "contracts", "evaluation-case.schema.json"));
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
  const cases = new Map();
  const errors = [];

  for (const filePath of jsonFiles(path.join(root, "cases"))) {
    const value = readJson(filePath);
    if (!validate(value)) errors.push(...formatSchemaErrors(filePath, validate.errors));
    if (cases.has(value.id)) errors.push(`${path.basename(filePath)}/id duplicates ${value.id}`);
    cases.set(value.id, value);
  }

  if (cases.size === 0) errors.push("No evaluation cases were found.");
  return { cases, errors };
}

function loadRun(filePath, root = DEFAULT_ROOT) {
  const schema = readJson(path.join(root, "contracts", "evaluation-run.schema.json"));
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
  const run = readJson(filePath);
  const errors = validate(run) ? [] : formatSchemaErrors(filePath, validate.errors);
  return { run, errors };
}

function validateRunAgainstCases(run, runFile, cases) {
  const errors = [];
  const seen = new Set();

  for (const result of run.results) {
    const evaluationCase = cases.get(result.caseId);
    if (!evaluationCase) {
      errors.push(`${path.basename(runFile)} references unknown case ${result.caseId}`);
      continue;
    }
    if (seen.has(result.caseId)) errors.push(`${path.basename(runFile)} repeats case ${result.caseId}`);
    seen.add(result.caseId);

    const rubricKeys = Object.keys(evaluationCase.rubric).sort();
    for (const [index, attempt] of result.attempts.entries()) {
      const scoreKeys = Object.keys(attempt.qualityScores).sort();
      if (JSON.stringify(scoreKeys) !== JSON.stringify(rubricKeys)) {
        errors.push(
          `${path.basename(runFile)} ${result.caseId} attempt ${index + 1} must score: ${rubricKeys.join(", ")}`
        );
        continue;
      }
      for (const key of rubricKeys) {
        if (attempt.qualityScores[key] > evaluationCase.rubric[key].maxScore) {
          errors.push(
            `${path.basename(runFile)} ${result.caseId} attempt ${index + 1} ${key} exceeds max score ${evaluationCase.rubric[key].maxScore}`
          );
        }
      }
    }
  }

  return errors;
}

function instructionFootprint(run, runFile) {
  const base = path.dirname(path.resolve(runFile));
  let characters = 0;
  let words = 0;
  for (const relativeFile of run.instructionFiles) {
    const content = fs.readFileSync(path.resolve(base, relativeFile), "utf8");
    characters += content.length;
    words += content.trim() ? content.trim().split(/\s+/).length : 0;
  }
  return { characters, words, estimatedTokens: Math.ceil(characters / 4) };
}

function summarize(run, runFile, cases) {
  const attempts = run.results.flatMap((result) =>
    result.attempts.map((attempt) => ({ ...attempt, caseId: result.caseId }))
  );
  const successes = attempts.filter((attempt) => attempt.success).length;
  const totalTokens = attempts.reduce(
    (sum, attempt) => sum + attempt.inputTokens + attempt.outputTokens,
    0
  );
  const totalQuality = attempts.reduce((sum, attempt) => {
    const earned = Object.values(attempt.qualityScores).reduce((value, score) => value + score, 0);
    const possible = Object.values(cases.get(attempt.caseId).rubric).reduce(
      (value, dimension) => value + dimension.maxScore,
      0
    );
    return sum + earned / possible;
  }, 0);

  return {
    variant: run.variant,
    model: run.model,
    modelSettings: run.modelSettings || {},
    attempts: attempts.length,
    successRate: successes / attempts.length,
    qualityRate: totalQuality / attempts.length,
    violations: attempts.reduce((sum, attempt) => sum + attempt.violations.length, 0),
    totalTokens,
    tokensPerSuccess: successes === 0 ? null : totalTokens / successes,
    toolCalls: attempts.reduce((sum, attempt) => sum + (attempt.toolCalls || 0), 0),
    retries: attempts.reduce((sum, attempt) => sum + (attempt.retries || 0), 0),
    humanCorrections: attempts.reduce((sum, attempt) => sum + (attempt.humanCorrections || 0), 0),
    instructionFootprint: instructionFootprint(run, runFile)
  };
}

function compare(control, candidate) {
  const comparableModel =
    control.model === candidate.model &&
    isDeepStrictEqual(control.modelSettings, candidate.modelSettings);
  const safetyPassed = candidate.violations === 0;
  const qualityPassed = candidate.qualityRate >= control.qualityRate;
  const successPassed = candidate.successRate >= control.successRate;
  const tokenEfficiencyImproved =
    candidate.tokensPerSuccess !== null &&
    (control.tokensPerSuccess === null || candidate.tokensPerSuccess < control.tokensPerSuccess);
  const qualityImproved = candidate.qualityRate > control.qualityRate;
  const tokenCostDidNotIncrease =
    candidate.tokensPerSuccess !== null &&
    control.tokensPerSuccess !== null &&
    candidate.tokensPerSuccess <= control.tokensPerSuccess;

  return {
    comparableModel,
    safetyPassed,
    qualityPassed,
    successPassed,
    tokenEfficiencyImproved,
    accepted:
      comparableModel &&
      safetyPassed &&
      qualityPassed &&
      successPassed &&
      (tokenEfficiencyImproved || (qualityImproved && tokenCostDidNotIncrease))
  };
}

function percent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function printComparison(control, candidate, decision) {
  const rows = [
    ["Success rate", percent(control.successRate), percent(candidate.successRate)],
    ["Quality score", percent(control.qualityRate), percent(candidate.qualityRate)],
    ["Violations", control.violations, candidate.violations],
    ["Tokens / success", control.tokensPerSuccess?.toFixed(0) ?? "n/a", candidate.tokensPerSuccess?.toFixed(0) ?? "n/a"],
    ["Human corrections", control.humanCorrections, candidate.humanCorrections],
    ["Instruction token estimate", control.instructionFootprint.estimatedTokens, candidate.instructionFootprint.estimatedTokens]
  ];
  process.stdout.write(`Metric\t${control.variant}\t${candidate.variant}\n`);
  for (const row of rows) process.stdout.write(`${row.join("\t")}\n`);
  process.stdout.write(`Decision\t${decision.accepted ? "ACCEPT" : "REJECT"}\n`);
  if (!decision.comparableModel) process.stdout.write("Reason\tModel identifiers or settings differ; rerun with the same configuration.\n");
}

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) throw new Error(`Unexpected argument: ${key}`);
    if (key === "--json") values.json = true;
    else {
      if (!argv[index + 1]) throw new Error(`Missing value for ${key}`);
      values[key.slice(2)] = argv[index + 1];
      index += 1;
    }
  }
  return values;
}

function runCli(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const root = args.root ? path.resolve(args.root) : DEFAULT_ROOT;
  const loadedCases = loadCases(root);
  if (loadedCases.errors.length) throw new Error(loadedCases.errors.join("\n"));

  if (!args.control && !args.candidate) {
    process.stdout.write(`Validated ${loadedCases.cases.size} instruction evaluation cases.\n`);
    return;
  }
  if (!args.control || !args.candidate) throw new Error("Both --control and --candidate are required.");

  const runFiles = [path.resolve(args.control), path.resolve(args.candidate)];
  const summaries = runFiles.map((filePath) => {
    const loaded = loadRun(filePath, root);
    const errors = [
      ...loaded.errors,
      ...(loaded.errors.length ? [] : validateRunAgainstCases(loaded.run, filePath, loadedCases.cases))
    ];
    if (errors.length) throw new Error(errors.join("\n"));
    return summarize(loaded.run, filePath, loadedCases.cases);
  });
  const decision = compare(summaries[0], summaries[1]);
  if (args.json) process.stdout.write(`${JSON.stringify({ control: summaries[0], candidate: summaries[1], decision }, null, 2)}\n`);
  else printComparison(summaries[0], summaries[1], decision);
  if (!decision.accepted) process.exitCode = 1;
}

if (require.main === module) {
  try {
    runCli();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  compare,
  instructionFootprint,
  loadCases,
  loadRun,
  summarize,
  validateRunAgainstCases
};
