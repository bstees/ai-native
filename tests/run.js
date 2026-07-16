const { execFileSync } = require("child_process");
const path = require("path");

const testFiles = ["api.test.js", "agent-routing.test.js", "sync.test.js"];

for (const file of testFiles) {
  execFileSync(process.execPath, [path.join(__dirname, file)], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit"
  });
}
