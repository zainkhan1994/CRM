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
w.URL.createObjectURL = () => 'blob:test';
w.URL.revokeObjectURL = () => {};

for (const s of w.document.querySelectorAll('script[src]')) {
  const scriptPath = path.join(root, s.getAttribute('src').split('?')[0]);
  if (fs.existsSync(scriptPath)) {
    vm.runInContext(fs.readFileSync(scriptPath, 'utf8'), dom.getInternalVMContext());
  }
}

const pause = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  await pause(300);
  assert(w.document.querySelector('.cleanup-item'), 'Expected .cleanup-item button to exist');
  w.document.querySelector('.cleanup-item').click();
  let boxes = w.document.querySelectorAll('#cleanup-dialog input');
  assert.equal(boxes.length, 2, 'Expected 2 checkboxes (Unsubscribe and Archive) in dialog');
  boxes[0].click();
  boxes[1].click();
  const saved = JSON.parse(w.localStorage.getItem('crm-cleanup-v1'));
  assert.equal(Object.keys(saved).length, 1, 'Expected 1 item saved in localStorage');
  assert(Object.values(saved)[0].archive && Object.values(saved)[0].unsubscribe, 'Expected both archive and unsubscribe to be true');
  w.document.querySelector('[data-cleanup-close]').click();

  for (const view of ['companies', 'network', 'history']) {
    w.document.querySelector(`[data-go="${view}"]`).click();
    await pause(150);
    assert(w.document.querySelector('.cleanup-review'), `Expected .cleanup-review in ${view}`);
    w.document.querySelector('.cleanup-review').click();
    assert.equal(w.document.querySelectorAll('#cleanup-dialog input:checked').length, 2);
    w.document.querySelector('[data-cleanup-close]').click();
  }

  w.document.querySelector('[data-go="people"]').click();
  await pause(100);
  w.document.querySelector('[data-cleanup-category="h"]').click();
  await pause(100);
  assert(vm.runInContext('filtered().every(c=>cleanupCategories(c).includes("h"))', dom.getInternalVMContext()));
  assert.equal(w.document.querySelectorAll('[data-cleanup-category="h"][aria-pressed="true"]').length, 1);

  w.document.querySelector('[data-go="network"]').click();
  await pause(100);
  assert(w.document.querySelectorAll('.cleanup-account-line').length > 0, 'Expected .cleanup-account-line in network view');

  console.log('PASS: queue persistence across People/Companies/Network/History, both actions, category filtering, network controls');
  dom.window.close();
})().catch(e => {
  console.error(e);
  dom.window.close();
  process.exitCode = 1;
});
