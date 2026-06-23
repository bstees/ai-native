const fs = require("fs");
const path = require("path");

const sourceRoot = path.join(__dirname, "..");
const targetRoot = "/Users/bstees/work/my-interest";
const sourceAsset = path.join(
  sourceRoot,
  "assets",
  "repo-rules",
  "ai-native-core-operating-rules.md"
);
const targetDir = path.join(targetRoot, ".ai-native");
const targetAsset = path.join(targetDir, "core-operating-rules.md");
const targetReadme = path.join(targetDir, "README.md");

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function install() {
  if (!fs.existsSync(targetRoot)) {
    throw new Error(`Interest Lens repo not found at ${targetRoot}`);
  }

  ensureDir(targetDir);
  fs.copyFileSync(sourceAsset, targetAsset);
  fs.writeFileSync(
    targetReadme,
    [
      "# AI Native Assets",
      "",
      "This directory contains assets installed from the `AI Native` repository.",
      "",
      "- `core-operating-rules.md` is the current shared baseline for AI-agent behavior.",
      "- Local additions should stay minimal and repo-specific."
    ].join("\n")
  );

  console.log(`Installed AI Native assets into ${targetDir}`);
}

install();
