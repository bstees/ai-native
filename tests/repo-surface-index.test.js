const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const {
  buildSurfaceIndex,
  defaultIndexPath,
  ensureIndex,
  queryIndex,
  serializeIndex
} = require("../scripts/repo-surface-index");

function write(root, relativePath, contents) {
  const targetPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, contents);
}

function findRecord(index, kind, name) {
  return index.records.find((record) => record.kind === kind && record.name === name);
}

function run() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "repo-surface-index-test-"));
  const nonGitRoot = fs.mkdtempSync(path.join(os.tmpdir(), "repo-surface-index-non-git-test-"));
  const toolPath = path.join(__dirname, "..", "scripts", "repo-surface-index.js");

  try {
    write(
      tempRoot,
      "package.json",
      JSON.stringify(
        {
          name: "surface-fixture",
          scripts: {
            "private-command-value": "node scripts/private-body-secret.js",
            test: "node tests/run.js"
          }
        },
        null,
        2
      )
    );
    write(
      tempRoot,
      "src/access.js",
      [
        "function internalOrganizationKey(user) {",
        '  return `PRIVATE_BODY_SECRET:${user.organizationId}`;',
        "}",
        "",
        "/** Decide whether a user may open a document. */",
        "function canAccess(user, document) {",
        "  return internalOrganizationKey(user) === document.organizationKey;",
        "}",
        "",
        "class MemoryStore {",
        "  save() {}",
        "}",
        "",
        "/*",
        "export function commentedOutSurface(secret) { return secret; }",
        "module.exports = { commentedOutSurface };",
        "*/",
        "const stringExample = 'module.exports = { stringOnlySurface };';",
        "",
        "module.exports = { nested: { enabled: true }, canAccess };",
        ""
      ].join("\n")
    );
    write(
      tempRoot,
      "src/direct.js",
      [
        "module.exports = function parseDocument(input, options = {}) {",
        "  return { input, options };",
        "};",
        ""
      ].join("\n")
    );
    write(tempRoot, "src/a.js", 'export const markerA=1;\nexport const API_KEY="super-secret-export";\n');
    write(tempRoot, "src/z.js", "export const markerZ=1;\n");
    write(tempRoot, "src/ä.js", "export const markerUnicode=1;\n");
    write(
      tempRoot,
      "src/documents.tsx",
      [
        "type Document = { id: string };",
        "type User = { organizationId: string };",
        "type DocumentCardProps = { document: Document };",
        "",
        "function localHelper() {",
        "  return 'PRIVATE_TS_BODY';",
        "}",
        "",
        "export function filterDocuments(documents: Document[], user: User): Document[] {",
        "  localHelper();",
        "  return documents;",
        "}",
        "",
        "export const DocumentCard = (props: DocumentCardProps): JSX.Element => {",
        "  return <article>{props.document.id}</article>;",
        "};",
        ""
      ].join("\n")
    );
    write(
      tempRoot,
      "server/routes.js",
      [
        'const express = require("express");',
        "const app = express();",
        'app.get("/api/documents", (_request, response) => response.json([]));',
        "module.exports = { app };",
        ""
      ].join("\n")
    );
    write(
      tempRoot,
      "docs/access.md",
      [
        "# Access Contracts",
        "",
        "Public guidance for authorization boundaries.",
        "",
        "## Reuse Rule",
        "",
        "Reuse the exported access predicate before creating another policy check.",
        "",
        "## Metadata",
        "",
        "- `status`: `active`",
        ""
      ].join("\n")
    );
    write(
      tempRoot,
      "contracts/document.schema.json",
      JSON.stringify(
        {
          $schema: "https://json-schema.org/draft/2020-12/schema",
          $id: "https://example.test/document.schema.json",
          title: "Document Contract",
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" }, title: { type: "string" } },
          $defs: { identifier: { type: "string" } }
        },
        null,
        2
      )
    );
    write(
      tempRoot,
      "docker-compose.yml",
      [
        "services:",
        "  api:",
        "    image: example/api",
        "    environment:",
        "      DB_PASSWORD: super-secret-config-value",
        "  database:",
        "    image: mysql",
        "volumes:",
        "  data:",
        ""
      ].join("\n")
    );
    write(
      tempRoot,
      "src/public_api.py",
      [
        "def visible(value: str) -> str:",
        "    return value",
        "",
        "def _private(value):",
        "    return value",
        ""
      ].join("\n")
    );
    write(tempRoot, "src/public.go", "package public\n\nfunc Visible(value string) string { return value }\n\nfunc hidden() {}\n");
    write(tempRoot, "src/public.rs", "pub fn visible(value: &str) -> &str { value }\nfn hidden() {}\n");
    write(tempRoot, "broken.json", "{ not valid json\n");
    write(tempRoot, "tests/ignored.test.js", "module.exports = { shouldNeverAppear: 'TEST_SECRET' };\n");
    write(tempRoot, "assets/instruction-evaluation/pilot/ignored.md", "# PILOT_SECRET\n");
    write(
      tempRoot,
      ".ai-native/tools/managed.js",
      "export function installedToolSurface() { return 'AI_NATIVE_INTERNAL'; }\n"
    );
    write(tempRoot, ".gitignore", "generated/\n");
    write(
      tempRoot,
      "generated/ignored-contract.js",
      "export function ignoredTrackedSurface() { return 'IGNORED_TRACKED_INTERNAL'; }\n"
    );
    write(
      tempRoot,
      "site-packages/example/installed.js",
      "export function installedDependencySurface() { return 'INSTALLED_DEPENDENCY_INTERNAL'; }\n"
    );
    write(
      tempRoot,
      "packages/product/index.js",
      "export function workspacePackageSurface(input) { return input; }\n"
    );
    write(
      tempRoot,
      "bin/first-party-cli.js",
      "export function firstPartyCliSurface(argv) { return argv; }\n"
    );
    fs.symlinkSync(path.join(tempRoot, "src", "access.js"), path.join(tempRoot, "src", "access-alias.js"));

    execFileSync("git", ["init"], { cwd: tempRoot, stdio: "ignore" });
    execFileSync("git", ["add", "."], { cwd: tempRoot, stdio: "ignore" });
    execFileSync("git", ["add", "-f", "generated/ignored-contract.js"], {
      cwd: tempRoot,
      stdio: "ignore"
    });

    const first = buildSurfaceIndex(tempRoot);
    const second = buildSurfaceIndex(tempRoot);
    assert.strictEqual(first.schemaVersion, 1);
    assert.strictEqual(first.indexKind, "repository-surface-contracts");
    assert.strictEqual(serializeIndex(first), serializeIndex(second));
    assert.ok(first.summary.records > 10);

    const canAccess = findRecord(first, "function", "canAccess");
    assert.ok(canAccess, "CommonJS named exports should be indexed");
    assert.deepStrictEqual(canAccess.contract.inputs, ["user", "document"]);
    assert.strictEqual(canAccess.summary, "Decide whether a user may open a document.");
    assert.ok(!first.records.some((record) => record.name === "internalOrganizationKey"));
    assert.ok(!first.records.some((record) => record.name === "MemoryStore"));
    assert.ok(!first.records.some((record) => record.name === "localHelper"));
    assert.ok(!first.records.some((record) => record.name === "commentedOutSurface"));
    assert.ok(!first.records.some((record) => record.name === "stringOnlySurface"));
    assert.ok(!first.records.some((record) => record.name === "ignoredTrackedSurface"));
    assert.ok(!first.records.some((record) => record.name === "installedDependencySurface"));
    assert.ok(findRecord(first, "function", "workspacePackageSurface"));
    assert.ok(findRecord(first, "function", "firstPartyCliSurface"));

    const filterDocuments = findRecord(first, "function", "filterDocuments");
    assert.ok(filterDocuments, "ESM functions should be indexed");
    assert.deepStrictEqual(filterDocuments.contract.inputs, ["documents: Document[]", "user: User"]);
    assert.strictEqual(filterDocuments.contract.output, "Document[]");
    assert.ok(findRecord(first, "component", "DocumentCard"));
    assert.ok(findRecord(first, "http-route", "GET /api/documents"));
    assert.ok(findRecord(first, "guidance", "Reuse Rule"));
    assert.ok(findRecord(first, "json-schema", "Document Contract"));
    assert.ok(findRecord(first, "command", "npm run test"));
    assert.ok(findRecord(first, "service", "api"));
    assert.ok(first.diagnostics.some((diagnostic) => diagnostic.code === "invalid-json"));
    assert.deepStrictEqual(
      first.diagnostics
        .filter((diagnostic) => diagnostic.code === "unsupported-language")
        .map((diagnostic) => diagnostic.path),
      ["src/public.go", "src/public.rs", "src/public_api.py"]
    );
    assert.ok(findRecord(first, "function", "parseDocument"));
    assert.ok(findRecord(first, "constant", "API_KEY"));
    assert.strictEqual(findRecord(first, "constant", "API_KEY").signature, "const API_KEY");

    const serialized = serializeIndex(first);
    for (const forbidden of [
      tempRoot,
      "PRIVATE_BODY_SECRET",
      "PRIVATE_TS_BODY",
      "super-secret-config-value",
      "private-body-secret.js",
      "super-secret-export",
      "TEST_SECRET",
      "PILOT_SECRET",
      "AI_NATIVE_INTERNAL",
      "IGNORED_TRACKED_INTERNAL",
      "INSTALLED_DEPENDENCY_INTERNAL"
    ]) {
      assert.ok(!serialized.includes(forbidden), `index must omit ${forbidden}`);
    }
    assert.ok(first.records.every((record) => !path.isAbsolute(record.path)));
    assert.strictEqual(
      first.records.filter((record) => record.path === "src/access.js" && record.name === "canAccess").length,
      1,
      "symlink aliases must not duplicate contracts"
    );
    const markerPaths = first.records
      .filter((record) => record.name.startsWith("marker"))
      .map((record) => record.path);
    assert.deepStrictEqual(markerPaths, ["src/a.js", "src/z.js", "src/ä.js"]);

    const queryResults = queryIndex(first, "filter documents", { limit: 3 });
    assert.strictEqual(queryResults[0].name, "filterDocuments");
    assert.ok(queryResults.length <= 3);
    assert.ok(queryIndex(first, "access", { kinds: ["guidance"] }).every((record) => record.kind === "guidance"));

    const cachePath = defaultIndexPath(tempRoot);
    assert.ok(cachePath.includes(path.join(".git", "ai-native")));
    const created = ensureIndex(tempRoot);
    assert.strictEqual(created.state, "created");
    assert.ok(fs.existsSync(cachePath));
    assert.strictEqual(ensureIndex(tempRoot).state, "current");
    fs.writeFileSync(cachePath, "not valid json\n");
    assert.strictEqual(ensureIndex(tempRoot).state, "created", "a corrupt cache should rebuild safely");

    const accessPath = path.join(tempRoot, "src", "access.js");
    fs.writeFileSync(
      accessPath,
      fs.readFileSync(accessPath, "utf8").replace("PRIVATE_BODY_SECRET", "PRIVATE_BODY_CHANGED")
    );
    assert.strictEqual(
      ensureIndex(tempRoot).state,
      "current",
      "private body-only changes must not invalidate the surface index"
    );

    const documentsPath = path.join(tempRoot, "src", "documents.tsx");
    fs.writeFileSync(
      documentsPath,
      fs.readFileSync(documentsPath, "utf8").replace("user: User): Document[]", "actor: User): Document[]")
    );
    const refreshed = ensureIndex(tempRoot);
    assert.strictEqual(refreshed.state, "refreshed");
    assert.deepStrictEqual(
      findRecord(refreshed.index, "function", "filterDocuments").contract.inputs,
      ["documents: Document[]", "actor: User"]
    );

    const cliQuery = spawnSync(
      process.execPath,
      [toolPath, "query", "Document", "Contract", "--root", tempRoot, "--limit", "2", "--json"],
      { encoding: "utf8" }
    );
    assert.strictEqual(cliQuery.status, 0, cliQuery.stderr);
    const cliResult = JSON.parse(cliQuery.stdout);
    assert.ok(cliResult.count <= 2);
    assert.ok(cliResult.results.some((record) => record.name === "Document Contract"));

    const cliHelp = spawnSync(process.execPath, [toolPath, "--help"], { encoding: "utf8" });
    assert.strictEqual(cliHelp.status, 0, cliHelp.stderr);
    assert.ok(cliHelp.stdout.includes("Repository Surface Index"));
    assert.ok(cliHelp.stdout.includes("REPO_SURFACE_INDEX_TOOL"));
    assert.ok(!cliHelp.stdout.includes("node scripts/repo-surface-index.js"));

    write(nonGitRoot, "src/public.js", "export function visibleSurface(input) { return input; }\n");
    write(nonGitRoot, ".gitignore", "ignored-before-init/\n");
    write(
      nonGitRoot,
      "ignored-before-init/contract.js",
      "export function ignoredBeforeGitInit() { return 'IGNORED_BEFORE_INIT'; }\n"
    );
    write(nonGitRoot, "nested/.gitignore", "*.generated.js\n!keep.generated.js\n");
    write(
      nonGitRoot,
      "nested/drop.generated.js",
      "export function nestedIgnoredSurface() { return 'NESTED_IGNORED'; }\n"
    );
    write(
      nonGitRoot,
      "nested/keep.generated.js",
      "export function nestedNegatedSurface(input) { return input; }\n"
    );
    write(
      nonGitRoot,
      ".ai-native/tools/managed.js",
      "export function nonGitInstalledTool() { return 'NON_GIT_INTERNAL'; }\n"
    );
    const nonGitIndex = buildSurfaceIndex(nonGitRoot);
    assert.ok(findRecord(nonGitIndex, "function", "visibleSurface"));
    assert.ok(!nonGitIndex.records.some((record) => record.name === "nonGitInstalledTool"));
    assert.ok(!nonGitIndex.records.some((record) => record.name === "ignoredBeforeGitInit"));
    assert.ok(!nonGitIndex.records.some((record) => record.name === "nestedIgnoredSurface"));
    assert.ok(findRecord(nonGitIndex, "function", "nestedNegatedSurface"));
    assert.strictEqual(
      defaultIndexPath(nonGitRoot),
      path.join(nonGitRoot, ".ai-native", "cache", "repo-surface-index.json")
    );

    console.log("Repository surface index tests passed.");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    fs.rmSync(nonGitRoot, { recursive: true, force: true });
  }
}

run();
