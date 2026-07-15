const fs = require("fs");
const path = require("path");

const sourceConfigFile = "ai-native.config.json";
const repoConfigFile = ".ai-native/repo-config.json";

function readJsonIfPresent(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(targetPath, "utf8"));
}

function getSourceConfig(repoRoot) {
  return readJsonIfPresent(path.join(repoRoot, sourceConfigFile));
}

function getRepoConfig(targetRoot) {
  return readJsonIfPresent(path.join(targetRoot, repoConfigFile));
}

function buildManagedRepoConfig({ repoName = "Consumer Repo" } = {}) {
  return {
    repoName,
    repoRole: "consumer",
    standardsMode: "managed",
    sourceRepo: "AI Native"
  };
}

module.exports = {
  repoConfigFile,
  sourceConfigFile,
  getSourceConfig,
  getRepoConfig,
  buildManagedRepoConfig
};
