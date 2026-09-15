const vm = require('vm');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '../v2');
const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
  url: 'https://crm.test/v2/',
  runScripts: 'outside-only',
  pretendToBeVisual: true
});
const w = dom.window;
w.alert = () => {};
w.matchMedia = () => ({ matches: false, addEventListener() {} });
w.HTMLDialogElement.prototype.showModal = function() { this.open = true; };
w.HTMLDialogElement.prototype.close = function() { this.open = false; };
w.fetch = async url => {
  const p = path.join(root, String(url).split('?')[0]);
  return {
    ok: fs.existsSync(p),
    json: async () => JSON.parse(fs.readFileSync(p, 'utf8'))
  };
};

for (const s of w.document.querySelectorAll('script[src]')) {
  const scriptPath = path.join(root, s.getAttribute('src').split('?')[0]);
  if (fs.existsSync(scriptPath)) {
    vm.runInContext(fs.readFileSync(scriptPath, 'utf8'), dom.getInternalVMContext());
  }
}

const pause = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  await pause(300);
  w.document.querySelector('[data-go="network"]').click();
  await pause(300);

  // 1. Verify w-employers node exists
  const empNode = w.document.querySelector('[data-blueprint-id="w-employers"]');
  assert(empNode, 'w-employers node should exist');

  // 2. Verify duplicate nodes do NOT exist
  assert(!w.document.querySelector('[data-blueprint-id="w-employers-1"]'), 'w-employers-1 must not exist');
  assert(!w.document.querySelector('[data-blueprint-id="removed-602"]'), 'removed-602 must not exist in network');

  // 3. Verify exactly the 11 past employers are direct children of w-employers
  const expectedEmployers = [
    'w-emp-rcubed',
    'w-emp-redriver',
    'w-emp-trulo',
    'w-emp-roserock',
    'w-emp-minaret',
    'w-emp-ashford',
    'w-emp-census',
    'w-emp-isgh',
    'w-emp-amazonflex',
    'w-emp-gitwit',
    'w-emp-tulsaremote'
  ];

  const children = [...empNode.querySelectorAll(':scope > .blueprint-body > .blueprint-node')];
  const childIds = children.map(c => c.dataset.blueprintId);
  assert.equal(childIds.length, expectedEmployers.length, `Expected exactly ${expectedEmployers.length} employers under w-employers, found ${childIds.length}: ${childIds.join(', ')}`);
  for (const id of expectedEmployers) {
    assert(childIds.includes(id), `Expected ${id} to be a child of w-employers`);
  }

  // 4. Verify Lionbridge is NOT under w-employers and is under p-jobs
  const lionbridgeGroups = [...w.document.querySelectorAll('.account-group')].filter(el => el.textContent.includes('Lionbridge'));
  assert(lionbridgeGroups.length > 0, 'Lionbridge group must exist');
  for (const lg of lionbridgeGroups) {
    const parentNode = lg.closest('.blueprint-node');
    assert.notEqual(parentNode?.dataset?.blueprintId, 'w-employers', 'Lionbridge must NOT be in w-employers');
    assert.equal(parentNode?.dataset?.blueprintId, 'p-jobs', 'Lionbridge must be in p-jobs');
  }

  console.log('PASS: Employers contains strictly the 11 actual past employers, Lionbridge is routed to Jobs, removed-602 eliminated');
  dom.window.close();
})().catch(e => {
  console.error(e);
  dom.window.close();
  process.exitCode = 1;
});
