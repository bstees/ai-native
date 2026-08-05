const assert = require("assert");
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  compare,
  loadCases,
  loadRun,
  summarize,
  validateRunAgainstCases
} = require("../scripts/evaluate-instructions");

const root = path.join(__dirname, "..", "assets", "instruction-evaluation");

function writeRun(directory, name, overrides = {}) {
  const run = {
    variant: name,
    model: "fixed-test-model",
    modelSettings: { temperature: 0 },
    instructionFiles: ["instructions.md"],
    results: [
      {
        caseId: "targeted-bug-fix",
        attempts: [
          {
            success: true,
            inputTokens: 100,
            outputTokens: 50,
            toolCalls: 2,
            retries: 0,
            humanCorrections: 0,
            qualityScores: {
              correctness: 4,
              scopeControl: 2,
              validation: 2,
              maintainability: 2
            },
            violations: []
          }
        ]
      }
    ],
    ...overrides
  };
  const filePath = path.join(directory, `${name}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(run, null, 2)}\n`);
  return filePath;
}

function run() {
  const loadedCases = loadCases(root);
  assert.deepStrictEqual(loadedCases.errors, []);
  assert.strictEqual(loadedCases.cases.size, 4);

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "instruction-eval-test-"));
  fs.writeFileSync(path.join(directory, "instructions.md"), "Use the narrowest safe change.\n");
  const controlFile = writeRun(directory, "control");
  const candidateFile = writeRun(directory, "candidate", {
    results: [
      {
        caseId: "targeted-bug-fix",
        attempts: [
          {
            success: true,
            inputTokens: 80,
            outputTokens: 40,
            qualityScores: {
              correctness: 4,
              scopeControl: 2,
              validation: 2,
              maintainability: 2
            },
            violations: []
          }
        ]
      }
    ]
  });

  const controlRun = loadRun(controlFile, root);
  const candidateRun = loadRun(candidateFile, root);
  assert.deepStrictEqual(controlRun.errors, []);
  assert.deepStrictEqual(candidateRun.errors, []);
  assert.deepStrictEqual(
    validateRunAgainstCases(candidateRun.run, candidateFile, loadedCases.cases),
    []
  );

  const control = summarize(controlRun.run, controlFile, loadedCases.cases);
  const candidate = summarize(candidateRun.run, candidateFile, loadedCases.cases);
  assert.strictEqual(control.instructionFootprint.estimatedTokens, 8);
  assert.strictEqual(candidate.tokensPerSuccess, 120);
  assert.deepStrictEqual(compare(control, candidate), {
    comparableModel: true,
    safetyPassed: true,
    qualityPassed: true,
    successPassed: true,
    tokenEfficiencyImproved: true,
    accepted: true
  });

  const cliOutput = execFileSync(
    process.execPath,
    [
      path.join(__dirname, "..", "scripts", "evaluate-instructions.js"),
      "--control",
      controlFile,
      "--candidate",
      candidateFile
    ],
    { encoding: "utf8" }
  );
  assert.ok(cliOutput.includes("Decision\tACCEPT"));

  const invalid = JSON.parse(JSON.stringify(candidateRun.run));
  invalid.results[0].attempts[0].qualityScores.correctness = 5;
  assert.ok(
    validateRunAgainstCases(invalid, candidateFile, loadedCases.cases).some((message) =>
      message.includes("exceeds max score 4")
    )
  );

  console.log("Instruction evaluation validation passed.");
}

run();
