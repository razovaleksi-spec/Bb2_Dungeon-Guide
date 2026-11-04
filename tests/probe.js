/* Ask several questions in a row (same page, like a player) and print each answer.
   node tests/probe.js Bb2dungeon-ESv4v148.html "where does tsukuyomi drop" "what stats does it have" */
const {chromium} = require('playwright'); const path = require('path');
const [file, ...qs] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  await ctx.addInitScript('(()=>{let s=12345;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})()');
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.resolve(file), {waitUntil: 'load', timeout: 180000}); await p.waitForTimeout(1500);
  for (const q of qs) {
    await p.fill('#qaInput', q); await p.click('#qaGo'); await p.waitForTimeout(450);
    const a = (await p.innerText('#qaOut')).replace(/\s+\n/g, '\n').trim();
    console.log('### ' + q + '\n' + a.slice(0, +(process.env.MAX || 700)) + '\n');
  }
  if (errs.length) console.log('PAGE ERRORS', errs);
  await b.close();
})();
