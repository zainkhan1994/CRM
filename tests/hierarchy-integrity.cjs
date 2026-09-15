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

  // 1. Credit One Bank integrity
  const c1Node = w.document.querySelector('[data-blueprint-id="p-accounts-creditone"]');
  assert(c1Node, 'Credit One Bank node must exist');
  const c1Text = c1Node.textContent;
  assert(!c1Text.includes('Tell Pizza Hut'), 'Credit One Bank must NOT contain Pizza Hut');
  assert(!c1Text.includes('Staples'), 'Credit One Bank must NOT contain Staples');
  assert(!c1Text.includes('PSO'), 'Credit One Bank must NOT contain PSO');

  // Verify Credit One accounts use real logo
  const c1Imgs = [...c1Node.querySelectorAll('img')];
  assert(c1Imgs.length > 0, 'Credit One must have logos');
  for (const img of c1Imgs) {
    assert(!img.src.includes('dom-express.sea1.medallia.com.svg'), 'Credit One must NOT use medallia placeholder SVG');
    assert(!img.src.includes('dom-emails.creditonebank.com.svg'), 'Credit One must NOT use letter placeholder SVG');
    assert(img.src.includes('credit-one.png') || img.src.includes('accounts-banking--credit-one.png'), );
  }

  // 2. Financial Tools (p-accounts-tools) integrity
  const toolsNode = w.document.querySelector('[data-blueprint-id="p-accounts-tools"]');
  assert(toolsNode, 'Financial Tools node must exist');
  const toolsText = toolsNode.textContent;
  assert(!toolsText.includes('Aflac'), 'Financial Tools must NOT contain Aflac');
  assert(!toolsText.includes('Paycom'), 'Financial Tools must NOT contain Paycom');
  assert(!toolsText.includes('ADP'), 'Financial Tools must NOT contain ADP');
  assert(!toolsText.includes('RCUBEDCONSULTINGLLC'), 'Financial Tools must NOT contain RCUBED');

  // 3. Aflac routing
  const aflacNode = w.document.querySelector('[data-blueprint-id="h-ins-aflac"]');
  assert(aflacNode, 'h-ins-aflac node must exist under Health > Insurance');
  const aflacText = aflacNode.textContent;
  assert(aflacText.includes('Nicole Hutchison') || aflacText.includes('MARCUS THOMAS'), 'Aflac must contain its contacts');
  const aflacImgs = [...aflacNode.querySelectorAll('img')];
  for (const img of aflacImgs) {
    assert(!img.src.includes('dom-us.aflac.com.svg'), 'Aflac must NOT use letter [U] SVG');
    assert(img.src.includes('aflac.png'), 'Aflac must use official duck logo');
  }

  // 4. R-Cubed HR routing
  const rcubedNode = w.document.querySelector('[data-blueprint-id="w-emp-rcubed"]');
  assert(rcubedNode, 'w-emp-rcubed must exist');
  assert(rcubedNode.textContent.includes('RCUBEDCONSULTINGLLC_HR_donotreply'), 'RCUBED HR must be in w-emp-rcubed');

  // 5. ADP & Paycom under Work Tools
  const adpNode = w.document.querySelector('[data-blueprint-id="w-tools-adp"]');
  assert(adpNode, 'w-tools-adp must exist in Work Tools');
  const paycomNode = w.document.querySelector('[data-blueprint-id="w-tools-paycom"]');
  assert(paycomNode, 'w-tools-paycom must exist in Work Tools');

  // 6. Restored Brands
  const staplesNode = w.document.querySelector('[data-blueprint-id="p-shop-staples"]');
  assert(staplesNode, 'p-shop-staples must exist');
  assert(staplesNode.textContent.includes('Staples, Inc.'), 'Staples contact must be in p-shop-staples');

  const pizzaNode = w.document.querySelector('[data-blueprint-id="p-shop-pizzahut"]');
  assert(pizzaNode, 'p-shop-pizzahut must exist');
  assert(pizzaNode.textContent.includes('Tell Pizza Hut'), 'Pizza Hut contact must be in p-shop-pizzahut');

  const psoNode = w.document.querySelector('[data-blueprint-id="p-bills-pso"]');
  assert(psoNode, 'p-bills-pso must exist');
  assert(psoNode.textContent.includes('pso@express.sea1.medallia.com'), 'PSO survey contact must be in p-bills-pso');

  // 7. Unassigned Contacts Category Sub-levels
  const unmatchedNode = w.document.querySelector('[data-blueprint-id="unmatched"]');
  assert(unmatchedNode, 'Unassigned contacts node must exist');
  const unmatchedBody = unmatchedNode.querySelector(':scope > .blueprint-body');
  assert(unmatchedBody, 'Unassigned contacts must have a blueprint-body');
  const subLevels = [...unmatchedBody.querySelectorAll(':scope > details.blueprint-node')];
  assert(subLevels.length > 0, 'Unassigned contacts must have category sub-levels');
  for (const sl of subLevels) {
    const bId = sl.dataset.blueprintId;
    assert(bId && bId.startsWith('unmatched-'), `Sub-level must have id starting with unmatched-, got ${bId}`);
    const slBody = sl.querySelector(':scope > .blueprint-body');
    assert(slBody, `Sub-level ${bId} must have a body`);
    assert(slBody.querySelectorAll('.account-group, .account-row').length > 0, `Sub-level ${bId} must contain nested accounts`);
  }
  const looseContacts = unmatchedBody.querySelectorAll(':scope > .account-row, :scope > button, :scope > .blueprint-contact');
  assert.equal(looseContacts.length, 0, 'Zero loose contacts allowed directly under Unassigned contacts');

  console.log('PASS: Credit One is clean, Financial Tools has no ADP/Aflac/Paycom, Aflac is in Health, R-Cubed HR in employer, all brand logos correct, and Unassigned contacts are 100% categorized into sub-levels!');
  dom.window.close();
})().catch(e => {
  console.error('FAIL:', e);
  dom.window.close();
  process.exitCode = 1;
});
