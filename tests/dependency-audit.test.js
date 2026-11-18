const assert = require('assert/strict');
const { checkAudit } = require('../scripts/check-dependency-audit');
const policy = require('../scripts/dependency-audit-exception.json');
const fixture = require('./fixtures/dependency-audit-known.json');
const clone = x => JSON.parse(JSON.stringify(x));
const now = new Date('2026-11-18T00:00:00Z');
const lock = {packages: Object.fromEntries(Object.entries(policy.packages).map(([name,p]) =>
  [`node_modules/${name}`, {version:p.version,dev:true}]))};
const check = (r=clone(fixture),s=1,l=lock,d=now) => checkAudit(r,s,l,d);
assert.match(check(), /Known unpatched/);
for (const severity of ['high','critical']) {
 const r=clone(fixture); r.vulnerabilities.picomatch.via[0].url='https://github.com/advisories/NEW';
 r.vulnerabilities.picomatch.via[0].severity=severity;
 assert.throws(()=>check(r), /Unapproved/);
}
const unknown=clone(fixture); unknown.vulnerabilities.newPackage={name:'newPackage',severity:'high',via:['picomatch'],nodes:['node_modules/newPackage']};
unknown.metadata.vulnerabilities.high++;unknown.metadata.vulnerabilities.total++;
assert.throws(()=>check(unknown), /graph changed/);
for (const r of [null,{}, {error:{message:'registry unavailable'}}, {...fixture,metadata:{}}, {...fixture,auditReportVersion:1}]) assert.throws(()=>check(r));
assert.throws(()=>check(fixture,2), /execution failed/);
assert.throws(()=>check(fixture,null), /execution failed/);
assert.throws(()=>check(fixture,1,lock,new Date('2026-12-18')), /expired/);
const prod=clone(lock); prod.packages['node_modules/picomatch'].dev=false;
assert.throws(()=>check(fixture,1,prod), /development-only/);
const version=clone(lock);version.packages['node_modules/picomatch'].version='4.0.8';
assert.throws(()=>check(fixture,1,version), /exact development-only/);
const malformed=clone(fixture);malformed.vulnerabilities.picomatch.via=[];
assert.throws(()=>check(malformed), /Malformed/);
const clean={auditReportVersion:2,vulnerabilities:{},metadata:{vulnerabilities:{info:0,low:0,moderate:0,high:0,critical:0,total:0}}};
assert.match(check(clean,0,lock,new Date('2027-01-01')), /Remove the obsolete/);
assert.throws(()=>check(clean,1), /contradicts/);
console.log('Dependency audit exception tests passed.');
