#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const schemaVersion = 1;
const defaultLimit = 12;
const maxFileBytes = 1024 * 1024;

const indexedExtensions = new Set([
  ".cjs",
  ".cts",
  ".go",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".mdx",
  ".mjs",
  ".mts",
  ".py",
  ".rs",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml"
]);

const excludedDirectories = new Set([
  ".angular",
  ".build",
  ".cache",
  ".dart_tool",
  ".git",
  ".ai-native",
  ".gradle",
  ".mypy_cache",
  ".next",
  ".nox",
  ".nuxt",
  ".nx",
  ".output",
  ".parcel-cache",
  ".pnpm-store",
  ".pub-cache",
  ".pytest_cache",
  ".ruff_cache",
  ".serverless",
  ".svelte-kit",
  ".terraform",
  ".tox",
  ".turbo",
  ".venv",
  ".yarn",
  "__pycache__",
  "__generated__",
  "__tests__",
  "bower_components",
  "build",
  "carthage",
  "coverage",
  "deriveddata",
  "dist",
  "fixture",
  "fixtures",
  "generated",
  "jspm_packages",
  "mocks",
  "node_modules",
  "obj",
  "out",
  "pods",
  "site-packages",
  "snapshots",
  "target",
  "test",
  "tests",
  "third-party",
  "third_party",
  "venv",
  "vendor",
  "web_modules"
]);

const excludedPrefixes = ["assets/instruction-evaluation/pilot/"];

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value, length = 280) {
  const normalized = normalizeWhitespace(value);
  return normalized.length > length ? `${normalized.slice(0, length - 1)}…` : normalized;
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function lineNumberAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

function stableObject(value) {
  if (Array.isArray(value)) {
    return value.map(stableObject);
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableObject(value[key])])
  );
}

function shouldIndexPath(relativePath, outputPath, root) {
  const normalized = toPosix(relativePath).replace(/^\.\//, "");
  const lower = normalized.toLowerCase();
  const segments = lower.split("/");
  const basename = segments[segments.length - 1];

  if (!normalized || excludedPrefixes.some((prefix) => lower.startsWith(prefix))) {
    return false;
  }
  if (segments.slice(0, -1).some((segment) => excludedDirectories.has(segment))) {
    return false;
  }
  if (/\.(?:test|spec)\.[^.]+$/i.test(basename) || /-old\.md$/i.test(basename)) {
    return false;
  }
  if (
    basename === "package-lock.json" ||
    basename === "npm-shrinkwrap.json" ||
    basename === "yarn.lock" ||
    basename === "pnpm-lock.yaml" ||
    basename === "cargo.lock" ||
    basename.endsWith(".min.js") ||
    basename.endsWith(".map")
  ) {
    return false;
  }

  if (outputPath) {
    const absoluteCandidate = path.resolve(root, relativePath);
    if (absoluteCandidate === path.resolve(outputPath)) {
      return false;
    }
  }

  return indexedExtensions.has(path.extname(basename).toLowerCase());
}

function collectIgnoredGitPaths(root, candidates, { gitDir } = {}) {
  if (candidates.length === 0) return new Set();

  try {
    const repositoryArguments = gitDir
      ? [`--git-dir=${gitDir}`, `--work-tree=${root}`]
      : ["-C", root];
    const output = execFileSync(
      "git",
      [...repositoryArguments, "check-ignore", "--no-index", "-z", "--stdin"],
      {
        encoding: "utf8",
        input: `${candidates.join("\0")}\0`,
        maxBuffer: 64 * 1024 * 1024,
        stdio: ["pipe", "pipe", "ignore"]
      }
    );
    return new Set(output.split("\0").filter(Boolean).map(toPosix));
  } catch (error) {
    if (error.status === 1) return new Set();
    throw error;
  }
}

function collectIgnoredPathsBeforeGitInit(root, candidates) {
  if (candidates.length === 0) return new Set();
  const temporaryGitDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "repo-surface-index-ignore-")
  );
  try {
    execFileSync("git", ["init", "--bare", temporaryGitDir], {
      stdio: ["ignore", "ignore", "ignore"]
    });
    return collectIgnoredGitPaths(root, candidates, { gitDir: temporaryGitDir });
  } finally {
    fs.rmSync(temporaryGitDir, { recursive: true, force: true });
  }
}

function collectFiles(root, { outputPath } = {}) {
  const resolvedRoot = path.resolve(root);
  let candidates;
  let gitBacked = false;

  try {
    const output = execFileSync(
      "git",
      ["-C", resolvedRoot, "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
      {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
        stdio: ["ignore", "pipe", "ignore"]
      }
    );
    candidates = output.split("\0").filter(Boolean);
    gitBacked = true;
  } catch (error) {
    candidates = [];
    const visit = (directory) => {
      const entries = fs
        .readdirSync(directory, { withFileTypes: true })
        .sort((left, right) => compareText(left.name, right.name));
      for (const entry of entries) {
        const absolutePath = path.join(directory, entry.name);
        const relativePath = toPosix(path.relative(resolvedRoot, absolutePath));
        if (entry.isSymbolicLink()) {
          continue;
        }
        if (entry.isDirectory()) {
          if (!excludedDirectories.has(entry.name.toLowerCase())) {
            visit(absolutePath);
          }
          continue;
        }
        candidates.push(relativePath);
      }
    };
    visit(resolvedRoot);
  }

  candidates = [...new Set(candidates.map(toPosix))].filter((relativePath) =>
    shouldIndexPath(relativePath, outputPath, resolvedRoot)
  );

  const ignoredPaths = gitBacked
    ? collectIgnoredGitPaths(resolvedRoot, candidates)
    : collectIgnoredPathsBeforeGitInit(resolvedRoot, candidates);
  candidates = candidates.filter((candidate) => !ignoredPaths.has(toPosix(candidate)));

  const seenRealPaths = new Set();
  return candidates
    .filter((relativePath) => {
      const absolutePath = path.join(resolvedRoot, relativePath);
      if (!fs.existsSync(absolutePath)) {
        return false;
      }
      const stat = fs.lstatSync(absolutePath);
      if (!stat.isFile() || stat.isSymbolicLink()) {
        return false;
      }
      const realPath = fs.realpathSync(absolutePath);
      if (seenRealPaths.has(realPath)) {
        return false;
      }
      seenRealPaths.add(realPath);
      return true;
    })
    .sort(compareText);
}

function languageForPath(relativePath) {
  const extension = path.extname(relativePath).toLowerCase();
  if ([".js", ".jsx", ".mjs", ".cjs"].includes(extension)) return "javascript";
  if ([".ts", ".tsx", ".mts", ".cts"].includes(extension)) return "typescript";
  if ([".md", ".mdx"].includes(extension)) return "markdown";
  if (extension === ".json") return "json";
  if ([".yaml", ".yml"].includes(extension)) return "yaml";
  if (extension === ".py") return "python";
  if (extension === ".go") return "go";
  if (extension === ".rs") return "rust";
  return "unknown";
}

function splitTopLevel(value, delimiter = ",") {
  const parts = [];
  let current = "";
  let quote = "";
  let escaped = false;
  let round = 0;
  let square = 0;
  let curly = 0;
  let angle = 0;

  for (const character of value) {
    if (quote) {
      current += character;
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = "";
      }
      continue;
    }
    if (["\"", "'", "`"].includes(character)) {
      quote = character;
      current += character;
      continue;
    }
    if (character === "(") round += 1;
    if (character === ")") round -= 1;
    if (character === "[") square += 1;
    if (character === "]") square -= 1;
    if (character === "{") curly += 1;
    if (character === "}") curly -= 1;
    if (character === "<") angle += 1;
    if (character === ">" && angle > 0) angle -= 1;

    if (
      character === delimiter &&
      round === 0 &&
      square === 0 &&
      curly === 0 &&
      angle === 0
    ) {
      if (current.trim()) parts.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function findMatchingParenthesis(value, start) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = start; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (["\"", "'", "`"].includes(character)) {
      quote = character;
      continue;
    }
    if (character === "(") depth += 1;
    if (character === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function findMatchingBrace(value, start) {
  let depth = 0;
  for (let index = start; index < value.length; index += 1) {
    if (value[index] === "{") depth += 1;
    if (value[index] === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function findAssignment(value) {
  let quote = "";
  let escaped = false;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (["\"", "'", "`"].includes(character)) {
      quote = character;
      continue;
    }
    if (
      character === "=" &&
      !["=", "!", "<", ">"].includes(value[index - 1]) &&
      !["=", ">"].includes(value[index + 1])
    ) {
      return index;
    }
  }
  return -1;
}

function callableContract(signature) {
  const open = signature.indexOf("(");
  if (open < 0) return null;
  const close = findMatchingParenthesis(signature, open);
  if (close < 0) return null;
  const inputs = splitTopLevel(signature.slice(open + 1, close))
    .map((input) => truncate(input))
    .filter(Boolean);
  const remainder = signature.slice(close + 1).replace(/\s*=>\s*$/, "").trim();
  const outputMatch = remainder.match(/^(?::|->)\s*(.+)$/);
  const contract = {};
  if (inputs.length) contract.inputs = inputs;
  if (outputMatch) contract.output = truncate(outputMatch[1], 180);
  return Object.keys(contract).length ? contract : { inputs: [] };
}

function maskNonCode(source) {
  const output = source.split("");
  let state = "code";
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (state === "line-comment") {
      if (character === "\n") {
        state = "code";
      } else {
        output[index] = " ";
      }
      continue;
    }
    if (state === "block-comment") {
      if (character === "*" && next === "/") {
        output[index] = " ";
        output[index + 1] = " ";
        index += 1;
        state = "code";
      } else if (character !== "\n") {
        output[index] = " ";
      }
      continue;
    }
    if (["single-quote", "double-quote", "template"].includes(state)) {
      const closing = state === "single-quote" ? "'" : state === "double-quote" ? '"' : "`";
      if (character !== "\n") output[index] = " ";
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === closing) {
        state = "code";
      }
      continue;
    }

    if (character === "/" && next === "/") {
      output[index] = " ";
      output[index + 1] = " ";
      index += 1;
      state = "line-comment";
    } else if (character === "/" && next === "*") {
      output[index] = " ";
      output[index + 1] = " ";
      index += 1;
      state = "block-comment";
    } else if (character === "'") {
      output[index] = " ";
      state = "single-quote";
    } else if (character === '"') {
      output[index] = " ";
      state = "double-quote";
    } else if (character === "`") {
      output[index] = " ";
      state = "template";
    }
  }
  return output.join("");
}

function leadingSummary(lines, lineIndex) {
  let index = lineIndex - 1;
  while (index >= 0 && !lines[index].trim()) index -= 1;
  if (index < 0) return "";

  if (lines[index].trim().endsWith("*/")) {
    const collected = [];
    while (index >= 0) {
      collected.unshift(lines[index]);
      if (lines[index].includes("/**") || lines[index].includes("/*")) break;
      index -= 1;
    }
    return truncate(
      collected
        .join(" ")
        .replace(/^.*?\/\*\*?/, "")
        .replace(/\*\/$/, "")
        .replace(/\s*\*\s*/g, " ")
        .split(/\s+@(?:param|returns?|throws?)\b/)[0]
    );
  }

  if (lines[index].trim().startsWith("//")) {
    const collected = [];
    while (index >= 0 && lines[index].trim().startsWith("//")) {
      collected.unshift(lines[index].trim().replace(/^\/\/\s?/, ""));
      index -= 1;
    }
    return truncate(collected.join(" "));
  }
  return "";
}

function collectHeader(lines, startLine, mode) {
  let value = "";
  for (let offset = 0; offset < 30 && startLine + offset < lines.length; offset += 1) {
    value += `${value ? " " : ""}${lines[startLine + offset].trim()}`;
    const normalized = normalizeWhitespace(value);

    if (mode === "variable") {
      const arrow = normalized.indexOf("=>");
      if (arrow >= 0) return truncate(normalized.slice(0, arrow + 2), 500);
      const assignment = findAssignment(normalized);
      if (assignment >= 0) {
        const afterAssignment = normalized.slice(assignment + 1).trim();
        const openParentheses = (afterAssignment.match(/\(/g) || []).length;
        const closeParentheses = (afterAssignment.match(/\)/g) || []).length;
        const functionExpression = /^(?:async\s+)?function\b/.test(afterAssignment);
        if (!functionExpression && openParentheses <= closeParentheses) {
          return truncate(normalized.slice(0, assignment), 500);
        }
      }
    }

    let round = 0;
    let square = 0;
    let quote = "";
    let escaped = false;
    for (let index = 0; index < normalized.length; index += 1) {
      const character = normalized[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === quote) quote = "";
        continue;
      }
      if (["\"", "'", "`"].includes(character)) {
        quote = character;
        continue;
      }
      if (character === "(") round += 1;
      if (character === ")") round -= 1;
      if (character === "[") square += 1;
      if (character === "]") square -= 1;
      if (character === "{" && round === 0 && square === 0) {
        return truncate(normalized.slice(0, index), 500);
      }
      if (character === ";" && round === 0 && square === 0) {
        return truncate(normalized.slice(0, index), 500);
      }
    }
  }
  return truncate(value, 500);
}

function addRecord(records, record) {
  if (!record || !record.name || !record.path || !record.kind) return;
  records.push(record);
}

function cloneExport(declaration, exportedAs, exposure) {
  const record = {
    kind: declaration.kind,
    name: exportedAs,
    path: declaration.path,
    line: declaration.line,
    language: declaration.language,
    exposure,
    signature: declaration.signature
  };
  if (declaration.name !== exportedAs) record.declaredName = declaration.name;
  if (declaration.summary) record.summary = declaration.summary;
  if (declaration.contract) record.contract = declaration.contract;
  return record;
}

function extractJavaScript(relativePath, source, language) {
  const records = [];
  const declarations = new Map();
  const lines = source.split("\n");
  const maskedSource = maskNonCode(source);
  const maskedLines = maskedSource.split("\n");
  const extension = path.extname(relativePath).toLowerCase();
  const componentFile = [".jsx", ".tsx"].includes(extension);

  for (let index = 0; index < lines.length; index += 1) {
    const line = maskedLines[index];
    const directExport = /^\s*export\s+/.test(line);
    const defaultExport = /^\s*export\s+default\s+/.test(line);
    if (!directExport && /^\s{2,}\S/.test(line)) continue;

    let match = line.match(
      /^\s*(?:export\s+(?:default\s+)?)?(?:declare\s+)?(?:(async)\s+)?function\s+([A-Za-z_$][\w$]*)\s*/
    );
    if (match) {
      const name = match[2];
      const signature = collectHeader(lines, index, "callable")
        .replace(/^export\s+(?:default\s+)?/, "")
        .replace(/^declare\s+/, "");
      const declaration = {
        kind: componentFile && /^[A-Z]/.test(name) ? "component" : "function",
        name,
        path: relativePath,
        line: index + 1,
        language,
        signature,
        summary: leadingSummary(lines, index),
        contract: callableContract(signature)
      };
      declarations.set(name, declaration);
      if (directExport) {
        addRecord(records, cloneExport(declaration, name, defaultExport ? "esm-default" : "esm-named"));
      }
      continue;
    }

    match = line.match(
      /^\s*(?:export\s+(?:default\s+)?)?(?:declare\s+)?(class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/
    );
    if (match) {
      const name = match[2];
      const signature = collectHeader(lines, index, match[1] === "type" ? "type" : "block")
        .replace(/^export\s+(?:default\s+)?/, "")
        .replace(/^declare\s+/, "");
      const declaration = {
        kind: match[1] === "class" && componentFile && /^[A-Z]/.test(name) ? "component" : match[1],
        name,
        path: relativePath,
        line: index + 1,
        language,
        signature,
        summary: leadingSummary(lines, index)
      };
      declarations.set(name, declaration);
      if (directExport) {
        addRecord(records, cloneExport(declaration, name, defaultExport ? "esm-default" : "esm-named"));
      }
      continue;
    }

    match = line.match(
      /^\s*(?:export\s+)?(?:declare\s+)?(const|let|var)\s+([A-Za-z_$][\w$]*)\b/
    );
    if (match) {
      const name = match[2];
      const signature = collectHeader(lines, index, "variable")
        .replace(/^export\s+/, "")
        .replace(/^declare\s+/, "");
      const callable = signature.includes("=>") || /\bfunction\b/.test(signature);
      const declaration = {
        kind: callable
          ? componentFile && /^[A-Z]/.test(name)
            ? "component"
            : "function"
          : "constant",
        name,
        path: relativePath,
        line: index + 1,
        language,
        signature,
        summary: leadingSummary(lines, index)
      };
      if (callable) declaration.contract = callableContract(signature);
      declarations.set(name, declaration);
      if (directExport) addRecord(records, cloneExport(declaration, name, "esm-named"));
    }
  }

  const exportListPattern = /\bexport\s+(?:type\s+)?\{([\s\S]*?)\}\s*(?:from\b[^;\n]*)?\s*;?/g;
  let exportMatch;
  while ((exportMatch = exportListPattern.exec(maskedSource))) {
    const fromModule = /\bfrom\b/.test(exportMatch[0]);
    for (const rawPart of splitTopLevel(exportMatch[1])) {
      const cleaned = rawPart.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^type\s+/, "").trim();
      const aliasMatch = cleaned.match(/^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/);
      if (!aliasMatch) continue;
      const localName = aliasMatch[1];
      const exportedAs = aliasMatch[2] || localName;
      const declaration = declarations.get(localName);
      if (declaration && !fromModule) {
        addRecord(records, cloneExport(declaration, exportedAs, "esm-named"));
      } else {
        addRecord(records, {
          kind: "re-export",
          name: exportedAs,
          path: relativePath,
          line: lineNumberAt(source, exportMatch.index),
          language,
          exposure: "esm-re-export",
          signature: `export { ${cleaned} }`
        });
      }
    }
  }

  for (let index = 0; index < maskedLines.length; index += 1) {
    if (!/^\s*export\s+\*/.test(maskedLines[index]) || !/\bfrom\b/.test(maskedLines[index])) continue;
    const rawMatch = lines[index].match(
      /^\s*export\s+\*\s+(?:as\s+([A-Za-z_$][\w$]*)\s+)?from\s+["']([^"']+)["']/
    );
    if (!rawMatch) continue;
    addRecord(records, {
      kind: "re-export",
      name: rawMatch[1] || rawMatch[2],
      path: relativePath,
      line: index + 1,
      language,
      exposure: "esm-re-export",
      signature: normalizeWhitespace(rawMatch[0])
    });
  }

  const defaultIdentifierPattern = /^\s*export\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*$/gm;
  while ((exportMatch = defaultIdentifierPattern.exec(maskedSource))) {
    const declaration = declarations.get(exportMatch[1]);
    if (declaration) addRecord(records, cloneExport(declaration, exportMatch[1], "esm-default"));
  }

  const defaultCallPattern = /^\s*export\s+default\s+([A-Za-z_$][\w$]*)\s*\(/gm;
  while ((exportMatch = defaultCallPattern.exec(maskedSource))) {
    if (!declarations.has(exportMatch[1])) {
      addRecord(records, {
        kind: "default-export",
        name: exportMatch[1],
        path: relativePath,
        line: lineNumberAt(source, exportMatch.index),
        language,
        exposure: "esm-default",
        signature: `export default ${exportMatch[1]}(…)`
      });
    }
  }

  const commonJsObjectPattern = /\bmodule\.exports\s*=\s*\{/g;
  let commonJsMatch;
  while ((commonJsMatch = commonJsObjectPattern.exec(maskedSource))) {
    const openBrace = commonJsMatch.index + commonJsMatch[0].lastIndexOf("{");
    const closeBrace = findMatchingBrace(maskedSource, openBrace);
    if (closeBrace < 0) break;
    const exportedObject = maskedSource.slice(openBrace + 1, closeBrace);
    for (const rawPart of splitTopLevel(exportedObject)) {
      const cleaned = rawPart.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/g, "").trim();
      const propertyMatch = cleaned.match(
        /^([A-Za-z_$][\w$]*)(?:\s*:\s*([A-Za-z_$][\w$]*))?$/
      );
      if (!propertyMatch) continue;
      const exportedAs = propertyMatch[1];
      const localName = propertyMatch[2] || exportedAs;
      const declaration = declarations.get(localName);
      if (declaration) {
        addRecord(records, cloneExport(declaration, exportedAs, "commonjs-named"));
      } else {
        addRecord(records, {
          kind: "export",
          name: exportedAs,
          path: relativePath,
          line: lineNumberAt(source, commonJsMatch.index),
          language,
          exposure: "commonjs-named",
          signature: `module.exports.${exportedAs}`
        });
      }
    }
    commonJsObjectPattern.lastIndex = closeBrace + 1;
  }

  const commonJsFunctionPattern = /\bmodule\.exports\s*=\s*(async\s+)?function\s*([A-Za-z_$][\w$]*)?\s*\(/g;
  while ((commonJsMatch = commonJsFunctionPattern.exec(maskedSource))) {
    const line = lineNumberAt(source, commonJsMatch.index);
    const signature = collectHeader(lines, line - 1, "callable").replace(
      /^.*?module\.exports\s*=\s*/,
      ""
    );
    addRecord(records, {
      kind: "function",
      name: commonJsMatch[2] || "default",
      path: relativePath,
      line,
      language,
      exposure: "commonjs-default",
      signature,
      contract: callableContract(signature)
    });
  }

  const commonJsPropertyPattern = /\b(?:module\.exports|exports)\.([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)/g;
  while ((commonJsMatch = commonJsPropertyPattern.exec(maskedSource))) {
    const exportedAs = commonJsMatch[1];
    const localName = commonJsMatch[2];
    const declaration = declarations.get(localName);
    addRecord(
      records,
      declaration
        ? cloneExport(declaration, exportedAs, "commonjs-named")
        : {
            kind: "export",
            name: exportedAs,
            path: relativePath,
            line: lineNumberAt(source, commonJsMatch.index),
            language,
            exposure: "commonjs-named",
            signature: `module.exports.${exportedAs}`
          }
    );
  }

  const commonJsDefaultPattern = /\bmodule\.exports\s*=\s*([A-Za-z_$][\w$]*)\s*;?/g;
  while ((commonJsMatch = commonJsDefaultPattern.exec(maskedSource))) {
    const declaration = declarations.get(commonJsMatch[1]);
    if (declaration) addRecord(records, cloneExport(declaration, commonJsMatch[1], "commonjs-default"));
  }

  for (let index = 0; index < lines.length; index += 1) {
    const routeCodeMatch = maskedLines[index].match(
      /^\s*(?:app|router)\.(get|post|put|patch|delete|options|head)\s*\(/i
    );
    const routeMatch = routeCodeMatch && lines[index].match(
      /^\s*(?:app|router)\.(get|post|put|patch|delete|options|head)\s*\(\s*["'`]([^"'`]+)["'`]/i
    );
    if (routeMatch) {
      const method = routeMatch[1].toUpperCase();
      const routePath = routeMatch[2];
      addRecord(records, {
        kind: "http-route",
        name: `${method} ${routePath}`,
        path: relativePath,
        line: index + 1,
        language,
        exposure: "http",
        signature: `${method} ${routePath}`,
        contract: { inputs: ["HTTP request"], output: "HTTP response" }
      });
    }
  }

  const entryPointMatch = maskedSource.match(/\brequire\.main\s*===\s*module\b/);
  if (entryPointMatch) {
    addRecord(records, {
      kind: "entry-point",
      name: relativePath,
      path: relativePath,
      line: lineNumberAt(source, entryPointMatch.index),
      language,
      exposure: "executable",
      signature: "require.main === module"
    });
  }

  return records;
}

function stripMarkdown(value) {
  return truncate(
    value
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/^[-*+]\s+/, "")
      .replace(/^\d+\.\s+/, "")
      .replace(/[*_~]/g, "")
  );
}

function markdownSummary(lines, startLine, endLine) {
  const collected = [];
  let inFence = false;
  for (let index = startLine; index < endLine; index += 1) {
    const trimmed = lines[index].trim();
    if (/^```|^~~~/.test(trimmed)) {
      inFence = !inFence;
      continue;
    }
    if (inFence || !trimmed) {
      if (collected.length) break;
      continue;
    }
    if (/^#{1,6}\s+/.test(trimmed)) break;
    if (/^-\s+`[^`]+`:\s*/.test(trimmed)) continue;
    collected.push(stripMarkdown(trimmed));
    if (collected.join(" ").length >= 220 || collected.length >= 3) break;
  }
  return truncate(collected.join(" "), 240);
}

function extractMarkdown(relativePath, source) {
  const lines = source.split("\n");
  const headings = [];
  const metadata = {};
  let inFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();
    if (/^```|^~~~/.test(trimmed)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+?)\s*#*$/);
    if (headingMatch) {
      headings.push({ level: headingMatch[1].length, name: stripMarkdown(headingMatch[2]), line: index + 1 });
    }
    const metadataMatch = trimmed.match(/^-\s+`([^`]+)`:\s*(.+)$/);
    if (metadataMatch) metadata[metadataMatch[1]] = truncate(metadataMatch[2].replace(/^`|`$/g, ""), 160);
  }

  const records = [];
  const documentHeading = headings.find((heading) => heading.level === 1);
  const documentName = documentHeading?.name || path.basename(relativePath);
  const orderedMetadata = stableObject(metadata);

  if (headings.length === 0) {
    addRecord(records, {
      kind: "document",
      name: documentName,
      path: relativePath,
      line: 1,
      language: "markdown",
      exposure: "guidance",
      signature: documentName,
      summary: markdownSummary(lines, 0, lines.length),
      facets: orderedMetadata
    });
    return records;
  }

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const nextHeading = headings[index + 1];
    const summary = markdownSummary(
      lines,
      heading.line,
      nextHeading ? nextHeading.line - 1 : lines.length
    );
    const record = {
      kind: heading.level === 1 ? "document" : "guidance",
      name: heading.name,
      path: relativePath,
      line: heading.line,
      language: "markdown",
      exposure: "guidance",
      signature: `${"#".repeat(heading.level)} ${heading.name}`
    };
    if (heading.level > 1) record.container = documentName;
    if (summary) record.summary = summary;
    if (heading.level === 1 && Object.keys(orderedMetadata).length) record.facets = orderedMetadata;
    addRecord(records, record);
  }
  return records;
}

function extractJson(relativePath, source) {
  let value;
  try {
    value = JSON.parse(source);
  } catch (error) {
    return {
      records: [],
      diagnostics: [{ path: relativePath, code: "invalid-json", message: "JSON could not be parsed." }]
    };
  }

  const records = [];
  const basename = path.basename(relativePath);
  if (basename === "package.json" && value && typeof value === "object" && !Array.isArray(value)) {
    for (const commandName of Object.keys(value.scripts || {}).sort()) {
      addRecord(records, {
        kind: "command",
        name: `npm run ${commandName}`,
        path: relativePath,
        line: 1,
        language: "json",
        exposure: "package-script",
        signature: `npm run ${commandName}`
      });
    }
    const bins = typeof value.bin === "string" ? { [value.name || basename]: value.bin } : value.bin || {};
    for (const commandName of Object.keys(bins).sort()) {
      addRecord(records, {
        kind: "command",
        name: commandName,
        path: relativePath,
        line: 1,
        language: "json",
        exposure: "package-bin",
        signature: commandName
      });
    }
    if (value.exports) {
      const exportNames =
        typeof value.exports === "object" && !Array.isArray(value.exports)
          ? Object.keys(value.exports).sort()
          : ["."];
      for (const exportName of exportNames) {
        addRecord(records, {
          kind: "module-export",
          name: exportName,
          path: relativePath,
          line: 1,
          language: "json",
          exposure: "package-export",
          signature: `package export ${exportName}`
        });
      }
    }
  }

  const schemaLike =
    basename.endsWith(".schema.json") ||
    (value && typeof value === "object" && typeof value.$schema === "string");
  if (schemaLike && value && typeof value === "object" && !Array.isArray(value)) {
    const properties = Object.keys(value.properties || {}).sort();
    const required = Array.isArray(value.required) ? [...value.required].sort() : [];
    const definitions = Object.keys(value.$defs || value.definitions || {}).sort();
    const contract = { inputs: properties, output: "validated value" };
    if (required.length) contract.required = required;
    addRecord(records, {
      kind: "json-schema",
      name: value.title || value.$id || basename,
      path: relativePath,
      line: 1,
      language: "json",
      exposure: "schema",
      signature: `${value.title || basename} (${value.type || "schema"})`,
      contract,
      facets: stableObject({
        definitions,
        id: value.$id || ""
      })
    });
  } else if (value && typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value).sort();
    if (keys.length) {
      addRecord(records, {
        kind: "configuration",
        name: basename,
        path: relativePath,
        line: 1,
        language: "json",
        exposure: "configuration",
        signature: `JSON keys: ${keys.join(", ")}`
      });
    }
  }

  return { records, diagnostics: [] };
}

function extractYaml(relativePath, source) {
  const topLevelKeys = [];
  const serviceNames = [];
  const lines = source.split("\n");
  let servicesIndent = -1;
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const keyMatch = line.match(/^(\s*)([A-Za-z0-9_.-]+):(?:\s|$)/);
    if (!keyMatch) continue;
    const indent = keyMatch[1].replace(/\t/g, "  ").length;
    const key = keyMatch[2];
    if (indent === 0) {
      topLevelKeys.push(key);
      servicesIndent = key === "services" ? indent : -1;
    } else if (servicesIndent === 0 && indent === 2) {
      serviceNames.push(key);
    }
  }

  const records = [];
  const uniqueKeys = [...new Set(topLevelKeys)].sort();
  if (uniqueKeys.length) {
    addRecord(records, {
      kind: "configuration",
      name: path.basename(relativePath),
      path: relativePath,
      line: 1,
      language: "yaml",
      exposure: "configuration",
      signature: `YAML keys: ${uniqueKeys.join(", ")}`
    });
  }
  for (const serviceName of [...new Set(serviceNames)].sort()) {
    addRecord(records, {
      kind: "service",
      name: serviceName,
      path: relativePath,
      line: 1,
      language: "yaml",
      exposure: "compose-service",
      signature: `service ${serviceName}`
    });
  }
  return records;
}

function extractFile(relativePath, source) {
  const language = languageForPath(relativePath);
  if (language === "javascript" || language === "typescript") {
    return { records: extractJavaScript(relativePath, source, language), diagnostics: [] };
  }
  if (language === "markdown") {
    return { records: extractMarkdown(relativePath, source), diagnostics: [] };
  }
  if (language === "json") return extractJson(relativePath, source);
  if (language === "yaml") return { records: extractYaml(relativePath, source), diagnostics: [] };
  return {
    records: [],
    diagnostics: [{ path: relativePath, code: "unsupported-language", message: "No safe extractor is available." }]
  };
}

function normalizeRecord(record) {
  const normalized = {
    id: crypto
      .createHash("sha256")
      .update(JSON.stringify([record.path, record.line, record.kind, record.name, record.signature]))
      .digest("hex")
      .slice(0, 16),
    kind: record.kind,
    name: record.name,
    path: toPosix(record.path),
    line: record.line || 1,
    language: record.language,
    exposure: record.exposure,
    signature: truncate(record.signature, 500)
  };
  for (const key of ["declaredName", "container", "summary"]) {
    if (record[key]) normalized[key] = truncate(record[key], key === "summary" ? 280 : 160);
  }
  if (record.contract) normalized.contract = stableObject(record.contract);
  if (record.facets && Object.keys(record.facets).length) normalized.facets = stableObject(record.facets);
  return normalized;
}

function compareRecords(left, right) {
  return (
    compareText(left.path, right.path) ||
    left.line - right.line ||
    compareText(left.kind, right.kind) ||
    compareText(left.name, right.name) ||
    compareText(left.signature, right.signature)
  );
}

function buildSurfaceIndex(root, { outputPath } = {}) {
  const resolvedRoot = path.resolve(root);
  if (!fs.existsSync(resolvedRoot) || !fs.statSync(resolvedRoot).isDirectory()) {
    throw new Error(`Repository root not found: ${resolvedRoot}`);
  }

  const files = collectFiles(resolvedRoot, { outputPath });
  const records = [];
  const diagnostics = [];
  let filesIndexed = 0;

  for (const relativePath of files) {
    const absolutePath = path.join(resolvedRoot, relativePath);
    const stat = fs.statSync(absolutePath);
    if (stat.size > maxFileBytes) {
      diagnostics.push({ path: relativePath, code: "oversized-file", message: "File exceeds the 1 MiB indexing limit." });
      continue;
    }
    const buffer = fs.readFileSync(absolutePath);
    if (buffer.includes(0)) {
      diagnostics.push({ path: relativePath, code: "binary-file", message: "Binary content was skipped." });
      continue;
    }
    const result = extractFile(relativePath, buffer.toString("utf8"));
    records.push(...result.records);
    diagnostics.push(...result.diagnostics);
    filesIndexed += 1;
  }

  const uniqueRecords = [...new Map(records.map((record) => {
    const normalized = normalizeRecord(record);
    return [`${normalized.path}\0${normalized.line}\0${normalized.kind}\0${normalized.name}\0${normalized.signature}`, normalized];
  })).values()].sort(compareRecords);
  const sortedDiagnostics = diagnostics
    .map((diagnostic) => ({
      path: toPosix(diagnostic.path),
      code: diagnostic.code,
      message: diagnostic.message
    }))
    .sort((left, right) => compareText(left.path, right.path) || compareText(left.code, right.code));
  const byKind = {};
  for (const record of uniqueRecords) byKind[record.kind] = (byKind[record.kind] || 0) + 1;
  const fingerprint = crypto
    .createHash("sha256")
    .update(JSON.stringify({ records: uniqueRecords, diagnostics: sortedDiagnostics }))
    .digest("hex");

  return {
    schemaVersion,
    indexKind: "repository-surface-contracts",
    root: ".",
    fingerprint,
    summary: {
      filesConsidered: files.length,
      filesIndexed,
      records: uniqueRecords.length,
      diagnostics: sortedDiagnostics.length,
      byKind: stableObject(byKind)
    },
    records: uniqueRecords,
    diagnostics: sortedDiagnostics
  };
}

function serializeIndex(index) {
  return `${JSON.stringify(index, null, 2)}\n`;
}

function defaultIndexPath(root) {
  const resolvedRoot = path.resolve(root);
  try {
    const gitPath = execFileSync(
      "git",
      ["-C", resolvedRoot, "rev-parse", "--git-path", "ai-native/repo-surface-index.json"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
    return path.isAbsolute(gitPath) ? gitPath : path.resolve(resolvedRoot, gitPath);
  } catch (error) {
    return path.join(resolvedRoot, ".ai-native", "cache", "repo-surface-index.json");
  }
}

function writeIndex(targetPath, index) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const temporaryPath = path.join(
    path.dirname(targetPath),
    `.${path.basename(targetPath)}.${process.pid}.tmp`
  );
  fs.writeFileSync(temporaryPath, serializeIndex(index));
  fs.renameSync(temporaryPath, targetPath);
}

function readIndex(targetPath) {
  if (!fs.existsSync(targetPath)) return null;
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(targetPath, "utf8"));
  } catch (error) {
    return null;
  }
  if (parsed.schemaVersion !== schemaVersion || !Array.isArray(parsed.records)) return null;
  return parsed;
}

function ensureIndex(root, { outputPath } = {}) {
  const targetPath = outputPath ? path.resolve(root, outputPath) : defaultIndexPath(root);
  const existing = readIndex(targetPath);
  const current = buildSurfaceIndex(root, { outputPath: targetPath });
  const state = !existing ? "created" : existing.fingerprint === current.fingerprint ? "current" : "refreshed";
  if (state !== "current") writeIndex(targetPath, current);
  return { index: state === "current" ? existing : current, targetPath, state };
}

function tokenize(value) {
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9_.:/-]*/g) || [];
}

function scoreRecord(record, query) {
  const phrase = normalizeWhitespace(query).toLowerCase();
  const queryTokens = [...new Set(tokenize(query))];
  const name = record.name.toLowerCase();
  const signature = record.signature.toLowerCase();
  const recordTokens = {
    name: new Set(tokenize(record.name)),
    signature: new Set(tokenize(record.signature)),
    path: new Set(tokenize(record.path)),
    summary: new Set(tokenize(record.summary || "")),
    other: new Set(
      tokenize(
        JSON.stringify({
          kind: record.kind,
          exposure: record.exposure,
          contract: record.contract || {},
          facets: record.facets || {},
          container: record.container || ""
        })
      )
    )
  };
  let score = 0;
  if (name === phrase) score += 100;
  else if (phrase && name.includes(phrase)) score += 50;
  if (phrase && signature.includes(phrase)) score += 30;
  if (phrase && record.path.toLowerCase().includes(phrase)) score += 20;
  if (phrase && (record.summary || "").toLowerCase().includes(phrase)) score += 12;
  for (const token of queryTokens) {
    if (recordTokens.name.has(token)) score += 20;
    if (recordTokens.signature.has(token)) score += 12;
    if (recordTokens.path.has(token)) score += 8;
    if (recordTokens.summary.has(token)) score += 5;
    if (recordTokens.other.has(token)) score += 4;
  }
  return score;
}

function queryIndex(index, query, { limit = defaultLimit, kinds = [] } = {}) {
  const allowedKinds = new Set(kinds);
  return index.records
    .filter((record) => allowedKinds.size === 0 || allowedKinds.has(record.kind))
    .map((record) => ({ score: scoreRecord(record, query), ...record }))
    .filter((record) => record.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        compareText(left.path, right.path) ||
        left.line - right.line ||
        compareText(left.name, right.name)
    )
    .slice(0, limit);
}

function displayPath(root, targetPath) {
  const relative = toPosix(path.relative(path.resolve(root), targetPath));
  return relative && !relative.startsWith("../") ? relative : targetPath;
}

function parseArguments(argv) {
  const command = ["--help", "-h"].includes(argv[0]) ? "help" : argv[0] || "help";
  const options = { command, root: process.cwd(), outputPath: null, limit: defaultLimit, kinds: [], json: false, terms: [] };
  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    const next = argv[index + 1];
    if (argument === "--root" && next) {
      options.root = next;
      index += 1;
    } else if (argument.startsWith("--root=")) {
      options.root = argument.slice("--root=".length);
    } else if (argument === "--output" && next) {
      options.outputPath = next;
      index += 1;
    } else if (argument.startsWith("--output=")) {
      options.outputPath = argument.slice("--output=".length);
    } else if (argument === "--limit" && next) {
      options.limit = Number(next);
      index += 1;
    } else if (argument.startsWith("--limit=")) {
      options.limit = Number(argument.slice("--limit=".length));
    } else if (argument === "--kind" && next) {
      options.kinds.push(...next.split(",").filter(Boolean));
      index += 1;
    } else if (argument.startsWith("--kind=")) {
      options.kinds.push(...argument.slice("--kind=".length).split(",").filter(Boolean));
    } else if (argument === "--json") {
      options.json = true;
    } else if (argument === "--") {
      options.terms.push(...argv.slice(index + 1));
      break;
    } else if (argument === "--help" || argument === "-h") {
      options.command = "help";
    } else if (argument.startsWith("--")) {
      throw new Error(`Unknown option: ${argument}`);
    } else {
      options.terms.push(argument);
    }
  }
  if (!Number.isInteger(options.limit) || options.limit < 1 || options.limit > 100) {
    throw new Error("--limit must be an integer from 1 to 100.");
  }
  return options;
}

function printHelp() {
  console.log(`Repository Surface Index

Usage:
  node REPO_SURFACE_INDEX_TOOL build [--root PATH] [--output PATH] [--json]
  node REPO_SURFACE_INDEX_TOOL query TERM... [--root PATH] [--limit N] [--kind KIND] [--json]
  node REPO_SURFACE_INDEX_TOOL status [--root PATH] [--output PATH] [--json]

The deterministic local index contains JS/TS exported signatures, external
routes and commands, schema/config shapes, and concise documentation headings.
It intentionally omits implementation bodies and config values. Query creates
or refreshes the cache automatically. Git ignore rules and conventional
dependency, vendor, generated, test, and build trees are excluded. In Git
repositories the default cache is stored under Git's private metadata. Other
code languages remain a targeted-search fallback. In a non-Git directory the
cache stays under .ai-native/cache/.`);
}

function runCli(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  const root = path.resolve(options.root);
  const targetPath = options.outputPath
    ? path.resolve(root, options.outputPath)
    : defaultIndexPath(root);

  if (options.command === "help") {
    printHelp();
    return 0;
  }

  if (options.command === "build") {
    const index = buildSurfaceIndex(root, { outputPath: targetPath });
    writeIndex(targetPath, index);
    const result = {
      state: "built",
      indexPath: displayPath(root, targetPath),
      fingerprint: index.fingerprint,
      summary: index.summary
    };
    console.log(options.json ? JSON.stringify(result, null, 2) : `BUILT ${result.indexPath} records=${index.summary.records} files=${index.summary.filesIndexed}`);
    return 0;
  }

  if (options.command === "status") {
    const existing = readIndex(targetPath);
    const current = buildSurfaceIndex(root, { outputPath: targetPath });
    const state = !existing ? "missing" : existing.fingerprint === current.fingerprint ? "current" : "stale";
    const result = {
      state,
      indexPath: displayPath(root, targetPath),
      fingerprint: current.fingerprint,
      summary: current.summary
    };
    console.log(options.json ? JSON.stringify(result, null, 2) : `${state.toUpperCase()} ${result.indexPath} records=${current.summary.records}`);
    return state === "current" ? 0 : 2;
  }

  if (options.command === "query") {
    const query = normalizeWhitespace(options.terms.join(" "));
    if (!query) throw new Error("A query term is required.");
    const ensured = ensureIndex(root, { outputPath: options.outputPath });
    const results = queryIndex(ensured.index, query, { limit: options.limit, kinds: options.kinds });
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            query,
            state: ensured.state,
            indexPath: displayPath(root, ensured.targetPath),
            count: results.length,
            results
          },
          null,
          2
        )
      );
    } else {
      console.error(
        `INDEX ${ensured.state} ${displayPath(root, ensured.targetPath)} records=${ensured.index.summary.records}`
      );
      if (results.length === 0) {
        console.log(`NO MATCH query=${JSON.stringify(query)}`);
      }
      for (const result of results) {
        console.log(`[${result.score}] ${result.kind} ${result.name} — ${result.path}:${result.line}`);
        console.log(`  ${result.signature}`);
        if (result.summary) console.log(`  ${result.summary}`);
      }
    }
    return 0;
  }

  throw new Error(`Unknown command: ${options.command}`);
}

if (require.main === module) {
  try {
    process.exitCode = runCli();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  buildSurfaceIndex,
  callableContract,
  collectFiles,
  defaultIndexPath,
  ensureIndex,
  extractFile,
  parseArguments,
  queryIndex,
  readIndex,
  runCli,
  serializeIndex,
  writeIndex
};
