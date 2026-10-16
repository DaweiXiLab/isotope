'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the actual website script, with no DOM or duplicate model implementation.
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const context = {module:{exports:{}}};
vm.runInNewContext(script, context);
const {calculate, DEFAULTS, csvRows, factorFromLog} = context.module.exports;
function close(actual, expected, relative=2e-13) {
  assert.ok(Math.abs(actual-expected) <= relative*Math.abs(expected), `${actual} != ${expected}`);
}

test('agrees with an independent 60-digit decimal reference calculation', () => {
  const r = calculate(DEFAULTS);
  close(r.ML, 9.96323440304307998274022409267e-27);
  close(r.MH, 1.16237734702169266465302614414e-26);
  close(r.ddg, -97.7479039310919285149903645955);
  close(r.lnAlpha, 0.0394310602256668286345091384965);
  close(r.alpha, 1.04021878396475749852793176749);
  close(r.reciprocal, 0.961336226008662321329762490546);
  const reference = [3181.24336431318123458,2945.25904894919672830,4498.95751102111386556,4165.22529172603743077];
  r.energies.forEach((e,i)=>close(e.molarZpe, reference[i]));
});

test('equal masses or equal force constants give unit fractionation', () => {
  assert.equal(calculate({...DEFAULTS,mH:6}).alpha, 1);
  assert.equal(calculate({...DEFAULTS,FB:100}).alpha, 1);
});

test('swapping states reverses exchange energy and reciprocates the factor', () => {
  const a = calculate(DEFAULTS), b = calculate({...DEFAULTS,FA:200,FB:100});
  close(b.ddg, -a.ddg); close(a.alpha*b.alpha, 1);
  assert.ok(a.alpha>1); assert.ok(b.alpha<1);
});

test('doubling T halves ln(alpha) while leaving ZPE exchange energy unchanged', () => {
  const a=calculate(DEFAULTS), b=calculate({...DEFAULTS,T:2*DEFAULTS.T});
  close(b.lnAlpha, a.lnAlpha/2); close(b.alpha,Math.sqrt(a.alpha));
  assert.equal(a.ddg,b.ddg);
});

test('invalid, empty, non-finite and reversed mass inputs are rejected', () => {
  for(const key of Object.keys(DEFAULTS)) {
    for(const value of [0,-1,NaN,Infinity,'',null,undefined]) {
      assert.throws(()=>calculate({...DEFAULTS,[key]:value}), /finite number greater than zero/);
    }
  }
  assert.throws(()=>calculate({...DEFAULTS,mH:5}), /Heavy effective mass/);
  assert.throws(()=>calculate({...DEFAULTS,mL:Number.MIN_VALUE}), /numerical range/);
});

test('near-identical input pairs retain the sign of a small isotope effect', () => {
  const r=calculate({...DEFAULTS,mL:6,mH:6.000000000001,FA:100,FB:100.000000000001});
  assert.ok(r.lnAlpha>0); assert.ok(r.ddg<0);
});

test('extreme factors retain finite log values and have a nonzero scientific display', () => {
  const r=calculate({...DEFAULTS,T:0.001});
  assert.ok(Number.isFinite(r.lnAlpha));
  assert.match(factorFromLog(r.lnAlpha), /10\^/);
  assert.match(factorFromLog(-r.lnAlpha), /10\^-/);
});

test('CSV contains units, convention, inputs and all four isotope/state rows', () => {
  const csv=csvRows(calculate(DEFAULTS));
  assert.match(csv,/alpha_B\/A = \(H\/L\)_B \/ \(H\/L\)_A/);
  assert.match(csv,/"Temperature","298.15","K"/);
  assert.match(csv,/"DeltaDeltaG_ZPE"/);
  for (const state of ['A','B']) for (const isotope of ['L','H']) {
    assert.ok(csv.includes(`"${isotope}","${state}"`));
  }
});
