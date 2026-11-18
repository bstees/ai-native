#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { isDeepStrictEqual } = require('util');
const policy = require('./dependency-audit-exception.json');

function checkAudit(report, status, lock, now = new Date(), exception = policy) {
  if (![0, 1].includes(status)) throw new Error('npm audit execution failed');
  if (!report || report.error || report.auditReportVersion !== 2 ||
      !report.vulnerabilities || Array.isArray(report.vulnerabilities) ||
      typeof report.vulnerabilities !== 'object') throw new Error('Invalid npm audit report');
  const findings = Object.entries(report.vulnerabilities);
  const counts = report.metadata?.vulnerabilities;
  const severities = ['info', 'low', 'moderate', 'high', 'critical'];
  if (!counts || counts.total !== findings.length || severities.some(s =>
      !Number.isInteger(counts[s]) || counts[s] < 0 ||
      counts[s] !== findings.filter(([, v]) => v?.severity === s).length) ||
      findings.some(([name,v]) => !v || v.name !== name || !severities.includes(v.severity) ||
        !Array.isArray(v.via) || !v.via.length || !Array.isArray(v.nodes) || !v.nodes.length)) {
    throw new Error('Malformed audit findings or counts');
  }
  if (!findings.length) {
    if (status !== 0) throw new Error('Audit exit status contradicts empty findings');
    return 'No known dependency findings. Remove the obsolete exception after review.';
  }
  const expiry = new Date(`${exception.expiresOn}T00:00:00Z`);
  if (!Number.isFinite(expiry.getTime()) || !Number.isFinite(now.getTime()) || now >= expiry) {
    throw new Error('Dependency audit exception expired; re-review or remove it');
  }
  if (!isDeepStrictEqual(findings.map(([n]) => n).sort(), Object.keys(exception.packages).sort())) {
    throw new Error('Audit graph changed; explicit review required');
  }
  for (const [name, finding] of findings) {
    const expected = exception.packages[name];
    const projected = Object.fromEntries(['name','severity','isDirect','via','nodes'].map(k => [k, finding[k]]));
    const { version, ...allowed } = expected;
    if (!isDeepStrictEqual(projected, allowed)) throw new Error(`Unapproved audit finding: ${name}`);
    for (const node of finding.nodes) {
      const installed = lock?.packages?.[node];
      if (!installed || installed.dev !== true || installed.version !== version) {
        throw new Error(`Exception requires exact development-only package: ${name}`);
      }
    }
  }
  return `Known unpatched advisory remains: ${exception.advisory}; exception expires ${exception.expiresOn}`;
}

if (require.main === module) {
  try {
    const run = spawnSync('npm', ['audit', '--json'], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    fs.writeFileSync('dependency-audit.json', run.stdout || '{}');
    if (run.error || run.signal) throw new Error('npm audit process could not complete');
    const report = JSON.parse(run.stdout);
    const lock = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package-lock.json'), 'utf8'));
    console.log(checkAudit(report, run.status, lock));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { checkAudit };
