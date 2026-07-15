const fs = require("fs");
const path = require("path");
const readline = require("readline");

const managedMarker = "<!-- ai-native-managed: instructions -->";
const appendStartMarker = "<!-- ai-native-shared-guidance:start -->";
const appendEndMarker = "<!-- ai-native-shared-guidance:end -->";

const instructionFiles = [
  {
    id: "agents",
    target: "AGENTS.md",
    type: "managed-file"
  },
  {
    id: "claude",
    target: "CLAUDE.md",
    type: "symlink",
    linkTarget: "AGENTS.md"
  },
  {
    id: "copilot",
    target: ".github/copilot-instructions.md",
    type: "symlink",
    linkTarget: "../AGENTS.md"
  }
];

function ensureDir(directory, dryRun) {
  if (!dryRun) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function relativeTargetPath(targetRoot, relativePath) {
  return path.join(targetRoot, relativePath);
}

function buildManagedAgentsContents(targetRoot) {
  const repoName = path.basename(targetRoot);
  return [
    managedMarker,
    "# AI Native Consumer Repo Guidance",
    "",
    `This repository (${repoName}) uses \`AI Native\` as its shared standards source.`,
    "",
    "## Shared Standards",
    "",
    "Always include and follow these synced assets in `.ai-native/`:",
    "",
    "- `core-operating-rules.md`",
    "- `goal-and-plan-mode.md`",
    "- `engineering-quality.md`",
    "- `repo-onboarding-audit.md`",
    "- `feedback/feedback-ingestion-standard.md`",
    "",
    "## Operating Model",
    "",
    "- `AI Native` is the source repo for shared standards.",
    "- This consumer repo is `managed` unless `.ai-native/repo-config.json` explicitly marks it as `forked`.",
    "- Repo-local feedback belongs under `.ai-native/feedback/` and `.ai-native/audits/`.",
    "- Repo-specific implementation details should stay in local docs; shared standards should flow from `AI Native`.",
    "",
    "## Local Notes",
    "",
    "Add repo-specific guidance below this section if needed."
  ].join("\n") + "\n";
}

function buildAppendBlock() {
  return [
    appendStartMarker,
    "## AI Native Shared Guidance",
    "",
    "Also include the shared standards synced into `.ai-native/`, especially:",
    "",
    "- `.ai-native/core-operating-rules.md`",
    "- `.ai-native/goal-and-plan-mode.md`",
    "- `.ai-native/engineering-quality.md`",
    "- `.ai-native/repo-onboarding-audit.md`",
    "- `.ai-native/feedback/feedback-ingestion-standard.md`",
    "",
    "Treat `AI Native` as the source repo for shared standards. Use repo-local files for feedback and local adaptation only.",
    appendEndMarker
  ].join("\n");
}

function fileState(targetRoot, spec) {
  const absolutePath = relativeTargetPath(targetRoot, spec.target);

  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  try {
    const stats = fs.lstatSync(absolutePath);

    if (stats.isSymbolicLink()) {
      const actualTarget = fs.readlinkSync(absolutePath);
      return {
        kind: actualTarget === spec.linkTarget ? "managed-symlink" : "custom-symlink",
        actualTarget
      };
    }

    const contents = fs.readFileSync(absolutePath, "utf8");
    if (contents.includes(managedMarker)) {
      return {
        kind: "managed-file",
        contents
      };
    }

    if (contents.includes(appendStartMarker) && contents.includes(appendEndMarker)) {
      return {
        kind: "appended-file",
        contents
      };
    }

    return {
      kind: "custom-file",
      contents
    };
  } catch (_error) {
    return {
      kind: "missing"
    };
  }
}

function inspectInstructionFiles(targetRoot) {
  const files = instructionFiles.map((spec) => {
    const absolutePath = relativeTargetPath(targetRoot, spec.target);
    let state = { kind: "missing" };

    if (fs.existsSync(absolutePath) || fs.existsSync(path.dirname(absolutePath))) {
      state = fileState(targetRoot, spec) || { kind: "missing" };
    }

    return {
      ...spec,
      absolutePath,
      state
    };
  });

  const conflicts = files.filter((entry) =>
    ["custom-file", "custom-symlink"].includes(entry.state.kind)
  );
  const safeToAutoApply = conflicts.length === 0;

  return {
    files,
    conflicts,
    safeToAutoApply
  };
}

function updateAppendedContents(existingContents) {
  const block = buildAppendBlock();

  if (existingContents.includes(appendStartMarker) && existingContents.includes(appendEndMarker)) {
    return existingContents.replace(
      new RegExp(`${appendStartMarker}[\\s\\S]*${appendEndMarker}`),
      block
    );
  }

  const suffix = existingContents.endsWith("\n") ? "" : "\n";
  return `${existingContents}${suffix}\n${block}\n`;
}

function writeFile(targetPath, contents, dryRun, logs, action) {
  ensureDir(path.dirname(targetPath), dryRun);
  logs.push(`${action} ${targetPath}`);
  if (!dryRun) {
    fs.writeFileSync(targetPath, contents);
  }
}

function ensureSymlink(targetPath, linkTarget, dryRun, logs) {
  ensureDir(path.dirname(targetPath), dryRun);
  logs.push(`SYMLINK ${targetPath} -> ${linkTarget}`);
  if (!dryRun) {
    try {
      fs.rmSync(targetPath, { force: true });
    } catch (_error) {}
    fs.symlinkSync(linkTarget, targetPath);
  }
}

function ensureManagedFile(targetPath, desiredContents, currentState, dryRun, logs, action) {
  if (currentState.kind === "managed-file" && currentState.contents === desiredContents) {
    logs.push(`OK    ${targetPath}`);
    return;
  }

  writeFile(targetPath, desiredContents, dryRun, logs, action);
}

function formatConflictCommands(targetRoot) {
  return [
    `npm run sync -- ${JSON.stringify(targetRoot)} --instructions-mode=replace`,
    `npm run sync -- ${JSON.stringify(targetRoot)} --instructions-mode=append`,
    `npm run sync -- ${JSON.stringify(targetRoot)} --instructions-mode=skip`
  ];
}

async function promptForConflictResolution(targetRoot, conflicts) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const prompt = [
    "Instruction file conflicts detected:",
    ...conflicts.map((entry, index) => `${index + 1}. ${entry.target}: ${entry.state.kind}`),
    "Choose one action:",
    "1. Replace conflicting instruction files with AI Native-managed files and symlinks",
    "2. Append AI Native guidance to conflicting markdown files and create safe missing adapters",
    "3. Skip instruction-file changes",
    "4. Show exact commands and exit",
    "Enter 1-4: "
  ].join("\n");

  const answer = await new Promise((resolve) => rl.question(prompt, resolve));
  rl.close();

  return {
    "1": "replace",
    "2": "append",
    "3": "skip",
    "4": "commands"
  }[answer.trim()] || "commands";
}

async function applyInstructionFiles({
  targetRoot,
  mode,
  dryRun = false,
  interactive = false
}) {
  const inspection = inspectInstructionFiles(targetRoot);
  const logs = [];
  let effectiveMode = mode || "auto";

  if (!inspection.safeToAutoApply && effectiveMode === "auto") {
    if (interactive) {
      effectiveMode = await promptForConflictResolution(targetRoot, inspection.conflicts);
    } else {
      effectiveMode = "commands";
    }
  }

  if (effectiveMode === "commands") {
    logs.push("INSTRUCTION-CONFLICT existing custom instruction files require a choice");
    formatConflictCommands(targetRoot).forEach((command) => logs.push(`NEXT  ${command}`));
    return {
      action: "conflict",
      effectiveMode,
      inspection,
      logs
    };
  }

  if (effectiveMode === "skip") {
    logs.push("INSTRUCTION-SKIP instruction file changes were skipped");
    return {
      action: "skip",
      effectiveMode,
      inspection,
      logs
    };
  }

  const managedAgentsContents = buildManagedAgentsContents(targetRoot);

  for (const entry of inspection.files) {
    if (entry.id === "agents") {
      if (entry.state.kind === "missing" || entry.state.kind === "managed-file") {
        ensureManagedFile(
          entry.absolutePath,
          managedAgentsContents,
          entry.state,
          dryRun,
          logs,
          "WRITE"
        );
        continue;
      }

      if (effectiveMode === "replace") {
        writeFile(entry.absolutePath, managedAgentsContents, dryRun, logs, "REPLACE");
        continue;
      }

      if (effectiveMode === "append") {
        const existingContents = entry.state.contents || "";
        writeFile(
          entry.absolutePath,
          updateAppendedContents(existingContents),
          dryRun,
          logs,
          "APPEND"
        );
      }

      continue;
    }

    if (entry.state.kind === "managed-symlink") {
      logs.push(`OK    ${entry.absolutePath}`);
      continue;
    }

    if (entry.state.kind === "missing") {
      ensureSymlink(entry.absolutePath, entry.linkTarget, dryRun, logs);
      continue;
    }

    if (effectiveMode === "replace") {
      ensureSymlink(entry.absolutePath, entry.linkTarget, dryRun, logs);
      continue;
    }

    if (effectiveMode === "append") {
      if (entry.state.kind === "custom-file" || entry.state.kind === "appended-file") {
        const existingContents = entry.state.contents || "";
        writeFile(
          entry.absolutePath,
          updateAppendedContents(existingContents),
          dryRun,
          logs,
          "APPEND"
        );
      } else {
        logs.push(`SKIP  ${entry.absolutePath}`);
      }
      continue;
    }
  }

  logs.push(`INSTRUCTION-${effectiveMode.toUpperCase()} completed for ${targetRoot}`);

  return {
    action: effectiveMode === "auto" ? "apply" : effectiveMode,
    effectiveMode,
    inspection,
    logs
  };
}

module.exports = {
  instructionFiles,
  inspectInstructionFiles,
  applyInstructionFiles,
  formatConflictCommands,
  managedMarker,
  appendStartMarker,
  appendEndMarker
};
