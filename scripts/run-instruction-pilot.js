#!/usr/bin/env node

const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.join(__dirname, "..", "assets", "instruction-evaluation", "pilot");
const casesRoot = path.join(__dirname, "..", "assets", "instruction-evaluation", "cases");
const model = "gpt-5.6-sol";
const reasoningEffort = "medium";

const caseIds = [
  "targeted-bug-fix",
  "diagnosis-without-mutation",
  "ambiguous-cross-cutting-change",
  "code-review-evidence"
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function runGit(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function initializeFixture(variant, caseId) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), `instruction-eval-${variant}-${caseId}-`));
  fs.cpSync(path.join(root, "fixture"), directory, { recursive: true });
  fs.copyFileSync(path.join(root, "variants", variant, "AGENTS.md"), path.join(directory, "AGENTS.md"));
  runGit(directory, ["init", "-q"]);
  runGit(directory, ["config", "user.email", "instruction-eval@example.invalid"]);
  runGit(directory, ["config", "user.name", "Instruction Eval"]);
  runGit(directory, ["add", "."]);
  runGit(directory, ["commit", "-qm", "Create evaluation fixture"]);

  if (caseId === "code-review-evidence") {
    fs.copyFileSync(
      path.join(root, "code-review-change", "src", "access.js"),
      path.join(directory, "src", "access.js")
    );
  }
  return directory;
}

function promptFor(evaluationCase) {
  return [
    evaluationCase.prompt,
    "",
    `Fixture context: ${evaluationCase.setup}`,
    "Work directly in this repository. Follow the repository instructions."
  ].join("\n");
}

function parseEvents(stdout) {
  return stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function executeAttempt(variant, evaluationCase) {
  const directory = initializeFixture(variant, evaluationCase.id);
  const beforeStatus = runGit(directory, ["status", "--porcelain"]);
  const result = spawnSync(
    "codex",
    [
      "exec",
      "--ephemeral",
      "--json",
      "--ignore-user-config",
      "--ignore-rules",
      "-s",
      "workspace-write",
      "-c",
      'approval_policy="never"',
      "-m",
      model,
      "-c",
      `model_reasoning_effort="${reasoningEffort}"`,
      "-C",
      directory,
      promptFor(evaluationCase)
    ],
    { encoding: "utf8", input: "", maxBuffer: 20 * 1024 * 1024 }
  );
  const events = parseEvents(result.stdout || "");
  const completed = [...events].reverse().find((event) => event.type === "turn.completed");
  const finalMessage = [...events]
    .reverse()
    .find((event) => event.type === "item.completed" && event.item?.type === "agent_message");
  const afterStatus = runGit(directory, ["status", "--porcelain"]);
  const diff = runGit(directory, ["diff", "--", "."]);

  return {
    exitCode: result.status,
    usage: completed?.usage || null,
    finalMessage: finalMessage?.item?.text || "",
    toolCalls: events.filter(
      (event) => event.type === "item.completed" && event.item?.type === "command_execution"
    ).length,
    beforeStatus,
    afterStatus,
    diff,
    stderr: result.stderr || "",
    stdout: result.stdout || ""
  };
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function main() {
  const attemptsArg = process.argv.find((argument) => argument.startsWith("--attempts="));
  const attempts = attemptsArg ? Number(attemptsArg.split("=")[1]) : 1;
  if (!Number.isInteger(attempts) || attempts < 1) throw new Error("--attempts must be a positive integer");

  const outputDirectory = path.join(root, "runs", timestamp());
  fs.mkdirSync(outputDirectory, { recursive: true });
  const manifest = { model, reasoningEffort, attempts, createdAt: new Date().toISOString(), results: [] };

  for (const [caseIndex, caseId] of caseIds.entries()) {
    const variants = caseIndex % 2 === 0 ? ["control", "candidate"] : ["candidate", "control"];
    for (const variant of variants) {
      const evaluationCase = readJson(path.join(casesRoot, `${caseId}.json`));
      for (let attempt = 1; attempt <= attempts; attempt += 1) {
        process.stdout.write(`Running ${variant} / ${caseId} / attempt ${attempt}\n`);
        const result = executeAttempt(variant, evaluationCase);
        const stem = `${variant}--${caseId}--${attempt}`;
        fs.writeFileSync(path.join(outputDirectory, `${stem}.jsonl`), result.stdout);
        fs.writeFileSync(path.join(outputDirectory, `${stem}.md`), `${result.finalMessage}\n`);
        fs.writeFileSync(path.join(outputDirectory, `${stem}.diff`), `${result.diff}\n`);
        manifest.results.push({
          variant,
          caseId,
          attempt,
          exitCode: result.exitCode,
          usage: result.usage,
          toolCalls: result.toolCalls,
          beforeStatus: result.beforeStatus,
          afterStatus: result.afterStatus,
          stderr: result.stderr
        });
        if (result.exitCode !== 0 || !result.usage) {
          fs.writeFileSync(path.join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
          throw new Error(`${stem} failed; inspect ${outputDirectory}`);
        }
      }
    }
  }

  fs.writeFileSync(path.join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(`Pilot results: ${outputDirectory}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
