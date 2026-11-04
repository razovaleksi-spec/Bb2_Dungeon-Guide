/* Test bank for the wiki html (runs a real Chrome, phone size 390x844, no internet needed).

   node tests/ask_test.js record Bb2dungeon-ESv4v148.html   -> saves today's behaviour to tests/golden.json
   node tests/ask_test.js check  Bb2dungeon-ESv4v149.html   -> compares a new html with tests/golden.json

   What it checks:
   1. the page loads with 0 errors, and the 4 tables keep their row counts
   2. every guide name (gear, skills, stats, terms, table names) asked 3 ways: how the Ask box READS it (__qaPre)
   3. every typed question in tests/questions.json: the ANSWER TEXT the player sees (same random numbers every run)
   A difference is not always a bug: after an intended fix, look at the list, then record a new golden file. */
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path');
const [mode, file] = process.argv.slice(2);
if (!['record', 'check'].includes(mode) || !file) { console.log('usage: node tests/ask_test.js record|check <html>'); process.exit(2); }
const GOLDEN = path.join(__dirname, 'golden.json');
const QUESTIONS = JSON.parse(fs.readFileSync(path.join(__dirname, 'questions.json'), 'utf8'));
const SEED = '(()=>{let s=12345;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})()';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}});
  await ctx.addInitScript(SEED);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('request', r => { const u = r.url(); if (!/^(file|data|about|blob):/.test(u)) errors.push('internet request: ' + u); });
  await page.goto('file://' + path.resolve(file), {waitUntil: 'load', timeout: 180000});
  await page.waitForTimeout(1500);

  const tables = await page.evaluate(() => [...document.querySelectorAll('table')].map(t => t.querySelectorAll('tbody tr').length));
  const names = await page.evaluate(() => {
    const L = [], add = n => { n = String(n || '').replace(/::(weapon|armor|accessory|skill)$/, '').trim(); if (n && n !== '—') L.push(n); };
    Object.keys(ITEM_DETAILS).forEach(add); Object.keys(SKILL_DETAILS).forEach(add);
    [DATA, CONQUEST, CONQUEST2, SPECIAL].forEach(T => T.forEach(r => { add(r[0]); r.slice(1).forEach(c => String(c).split(',').forEach(add)); }));
    Object.keys(STATS).forEach(add); Object.keys(TERMS).forEach(add);
    return [...new Set(L)].sort();
  });
  const forms = []; names.forEach(n => forms.push(n, 'where does ' + n + ' drop', 'what does ' + n.toLowerCase() + ' do'));
  const read = await page.evaluate(qs => qs.map(q => { try { return window.__qaPre(q); } catch (e) { return 'ERROR ' + e; } }), forms);

  const answers = [];
  for (const q of QUESTIONS) {
    await page.fill('#qaInput', q);
    await page.click('#qaGo');
    await page.waitForTimeout(450);
    answers.push((await page.innerText('#qaOut')).replace(/\s+\n/g, '\n').trim());
  }
  await browser.close();

  const now = {html: path.basename(file), tables, names: names.length,
               reading: Object.fromEntries(forms.map((q, i) => [q, read[i]])),
               answers: QUESTIONS.map((q, i) => ({q, a: answers[i]}))};
  console.log(`page errors: ${errors.length}   tables: ${tables.join(' / ')}   names: ${names.length}   questions: ${QUESTIONS.length}`);
  errors.slice(0, 5).forEach(e => console.log('  ERROR', e));

  if (mode === 'record') {
    fs.writeFileSync(GOLDEN, JSON.stringify(now, null, 1) + '\n');
    console.log('recorded tests/golden.json from', now.html);
    process.exit(errors.length ? 1 : 0);
  }
  const old = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
  let bad = errors.length;
  if (String(old.tables) !== String(tables)) { bad++; console.log(`TABLES changed: ${old.tables} -> ${tables}`); }
  if (old.names !== names.length) console.log(`NAMES: ${old.names} -> ${names.length} (new entries are fine)`);
  const rd = Object.keys(old.reading).filter(q => q in now.reading && old.reading[q] !== now.reading[q]);
  const gone = Object.keys(old.reading).filter(q => !(q in now.reading));
  console.log(`name reading: ${rd.length} changed, ${gone.length} names missing`);
  rd.slice(0, 20).forEach(q => console.log(`  "${q}"\n     was: ${old.reading[q]}\n     now: ${now.reading[q]}`));
  gone.slice(0, 10).forEach(q => console.log('  MISSING', q));
  const ad = [];
  old.answers.forEach((o, i) => { const n = now.answers[i]; if (!n || n.q !== o.q || n.a !== o.a) ad.push([o, n]); });
  console.log(`typed questions: ${ad.length} of ${old.answers.length} answers changed`);
  ad.slice(0, 20).forEach(([o, n]) => console.log(`  Q: ${o.q}\n     was: ${o.a.slice(0, 160).replace(/\n/g, ' | ')}\n     now: ${(n ? n.a : '(missing)').slice(0, 160).replace(/\n/g, ' | ')}`));
  bad += rd.length + gone.length + ad.length;
  console.log(bad ? `RESULT: ${bad} difference(s) - look at them before handing over` : 'RESULT: identical to golden');
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(3); });
