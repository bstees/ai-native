const fs = require("fs");
const path = require("path");
const readline = require("readline");

const managedMarker = "<!-- ai-native-managed: instructions -->";
const appendStartMarker = "<!-- ai-native-shared-guidance:start -->";
const appendEndMarker = "<!-- ai-native-shared-guidance:end -->";
const referenceLine = "<!-- ai-native-managed: reference --> Read and follow the applicable local guidance under `.ai-native/`.";
const legacyIndexPath = ".ai-native/legacy-instructions.md";

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

function buildManagedAgentsContents() {
  return [
    managedMarker,
    "# AI Native Consumer Repo Guidance",
    "",
    "This repository uses `AI Native` as its shared standards source.",
    "",
    "## Shared Standards",
    "",
    "Always include and follow these synced assets in `.ai-native/`:",
    "",
    "- `core-operating-rules.md`",
    "- `goal-and-plan-mode.md`",
    "- `engineering-quality.md`",
    "- `repo-onboarding-audit.md`",
    "- `governance/ai-usage-governance-standard.md`",
    "- `feedback/feedback-ingestion-standard.md`",
    "",
    "## Operating Model",
    "",
    "- `AI Native` is the source repo for shared standards.",
    "- `.ai-native/` is a local, ignored installation refreshed from the AI Native source repo.",
    "- Local feedback belongs under `.ai-native/feedback/` and `.ai-native/audits/` until intentionally exported.",
    "- Repo-specific implementation details should stay in local docs; shared standards should flow from `AI Native`.",
    "",
    "## Legacy Guidance",
    "",
    "- If instruction files were replaced during migration, the previous versions were preserved as `*-old.md` files.",
    "- Those preserved files are not part of the always-on agent contract anymore.",
    `- Consult \`${legacyIndexPath}\` only when historical repo-specific guidance seems relevant.`,
    "",
    "## Local Notes",
    "",
    "Add repo-specific guidance below this section if needed."
  ].join("\n") + "\n";
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

    if (contents.includes(referenceLine)) {
      return {
        kind: "referenced-file",
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

function removeLegacyAppendBlock(existingContents) {
  return existingContents.replace(
    new RegExp(`(?:^|\\n)${appendStartMarker}[\\s\\S]*?${appendEndMarker}(?:\\n|$)`),
    "\n"
  );
}

function updateReferencedContents(existingContents) {
  const withoutLegacyBlock = removeLegacyAppendBlock(existingContents);
  const lines = withoutLegacyBlock
    .split("\n")
    .filter((line) => line.trim() !== referenceLine);
  const trimmed = lines.join("\n").trimEnd();
  return `${trimmed}${trimmed ? "\n\n" : ""}${referenceLine}\n`;
}

function writeFile(targetPath, contents, dryRun, logs, action) {
  ensureDir(path.dirname(targetPath), dryRun);
  logs.push(`${action} ${targetPath}`);
  if (!dryRun) {
    fs.writeFileSync(targetPath, contents);
  }
}

function buildLegacyPath(targetPath) {
  const parsed = path.parse(targetPath);
  return path.join(parsed.dir, `${parsed.name}-old${parsed.ext || ""}`);
}

function buildUniqueLegacyPath(targetPath) {
  const firstChoice = buildLegacyPath(targetPath);

  if (!fs.existsSync(firstChoice)) {
    return firstChoice;
  }

  const parsed = path.parse(targetPath);
  let attempt = 2;
  while (true) {
    const candidate = path.join(parsed.dir, `${parsed.name}-old-${attempt}${parsed.ext || ""}`);
    if (!fs.existsSync(candidate)) {
      return candidate;
    }
    attempt += 1;
  }
}

function preserveLegacyFile(targetPath, dryRun, logs) {
  const legacyPath = buildUniqueLegacyPath(targetPath);
  logs.push(`LEGACY ${targetPath} -> ${legacyPath}`);
  if (!dryRun) {
    fs.renameSync(targetPath, legacyPath);
  }
  return legacyPath;
}

function buildLegacyIndexContents(targetRoot, preservedEntries) {
  const repoName = path.basename(targetRoot);
  return [
    "# Legacy Instruction Files",
    "",
    `These instruction files were preserved during AI Native migration for ${repoName}.`,
    "",
    "- They are no longer part of the default always-on agent contract.",
    "- Review them only when historical repo-specific guidance is relevant.",
    "- Promote any still-useful repo-specific guidance into durable local docs or feedback instead of expanding `AGENTS.md`.",
    "",
    "## Preserved Files",
    "",
    ...preservedEntries.flatMap((entry) => [
      `- original: \`${entry.original}\``,
      `  preserved_as: \`${entry.legacy}\``
    ])
  ].join("\n") + "\n";
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
    `npm run sync -- ${JSON.stringify(targetRoot)} --instructions-mode=keep`,
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
    "1. Replace conflicting instruction files with AI Native-managed files and symlinks (old files are renamed to *-old.md, not deleted)",
    "2. Keep the existing AGENTS.md and add one AI Native reference line",
    "3. Skip instruction-file changes",
    "4. Show exact commands and exit",
    "Enter 1-4: "
  ].join("\n");

  const answer = await new Promise((resolve) => rl.question(prompt, resolve));
  rl.close();

  return {
    "1": "replace",
    "2": "keep",
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
  const preservedEntries = [];
  let effectiveMode = mode || "auto";
  if (effectiveMode === "append") {
    effectiveMode = "keep";
  }

  if (effectiveMode === "auto" && inspection.safeToAutoApply) {
    const agentsState = inspection.files.find(({ id }) => id === "agents")?.state.kind;
    effectiveMode = ["appended-file", "referenced-file"].includes(agentsState)
      ? "keep"
      : "replace";
  }

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

  const managedAgentsContents = buildManagedAgentsContents();

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
        const legacyPath = preserveLegacyFile(entry.absolutePath, dryRun, logs);
        preservedEntries.push({
          original: entry.target,
          legacy: path.relative(targetRoot, legacyPath)
        });
        writeFile(entry.absolutePath, managedAgentsContents, dryRun, logs, "REPLACE");
        continue;
      }

      if (effectiveMode === "keep") {
        if (entry.state.kind === "custom-symlink") {
          throw new Error(
            "Keep/reference mode requires AGENTS.md to be a regular file; use replace mode or update the symlink target manually."
          );
        }
        const existingContents = entry.state.contents || "";
        writeFile(
          entry.absolutePath,
          updateReferencedContents(existingContents),
          dryRun,
          logs,
          "REFERENCE"
        );
      }

      continue;
    }

    if (effectiveMode === "keep") {
      if (entry.state.kind === "managed-symlink") {
        logs.push(`REMOVE ${entry.absolutePath} (legacy AI Native-managed symlink)`);
        if (!dryRun) fs.rmSync(entry.absolutePath);
      } else if (entry.state.kind === "appended-file") {
        writeFile(
          entry.absolutePath,
          removeLegacyAppendBlock(entry.state.contents || "").trimEnd() + "\n",
          dryRun,
          logs,
          "CLEAN"
        );
      } else {
        logs.push(`KEEP  ${entry.absolutePath}`);
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
      const legacyPath = preserveLegacyFile(entry.absolutePath, dryRun, logs);
      preservedEntries.push({
        original: entry.target,
        legacy: path.relative(targetRoot, legacyPath)
      });
      ensureSymlink(entry.absolutePath, entry.linkTarget, dryRun, logs);
      continue;
    }

  }

  if (preservedEntries.length > 0) {
    writeFile(
      relativeTargetPath(targetRoot, legacyIndexPath),
      buildLegacyIndexContents(targetRoot, preservedEntries),
      dryRun,
      logs,
      "LEGACY-INDEX"
    );
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
  legacyIndexPath,
  managedMarker,
  appendStartMarker,
  appendEndMarker,
  referenceLine
};
