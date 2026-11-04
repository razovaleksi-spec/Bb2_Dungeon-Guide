
(function(){'use strict';var D=document,go=D.getElementById('qaGo'),inp=D.getElementById('qaInput'),out=D.getElementById('qaOut');if(!go||!inp||!out)return;
var L=[
['<b>What it is:</b> Capture is a state you put on the enemy. If it is still on the enemy when you win the fight, the chance that the enemy drops its <b>capture item</b> rises from about 1% to about 10%. Its normal drops do not change. Without Capture the capture item stays at about 1%.'],
['✔ verified: Capture is the only thing that raises the capture item chance (1% to 10%). Disaster bosses have capture items, and so do dungeon bosses, conquest bosses and most special bosses.'],
['<b>Three ways to put Capture on a boss:</b>'],
['1. Skill <b>Spider Snare</b>, burst form (Capture Net): targets the enemy, hit value 100, lasts the whole combat, quick action, costs 4 Brave, cooldown 5.'],
['2. Job <b>Scholar</b>: its Arresting state puts Capture on the enemy when you land a crit (hit value 100, lasts 1 combat).'],
['3. Skill runes: <b>Capture (Weak)</b> (150% ailment hit, lasts 1 turn) and <b>Capture (Strong)</b> (150% ailment hit, lasts 5 turns or 1 room). They trigger when you use that skill directly.'],
['~ estimate: the state is still on the boss at the moment you win. This is not confirmed, so a source that lasts longer is safer: Capture (Strong) or the whole-combat Capture Net beat the 1-turn rune.'],
['~ estimate: Capture is an ailment, so the usual ailment rule applies: skill value + your Effective - the boss\'s Resist, limited to 5..95%. Even a hit value of 150 can miss, so raise your Effective.'],
['<b>Not known yet:</b> whether disaster bosses can resist Capture, and what the capture item actually does.']];
var H='<div class="qa-card"><div class="qa-note">Capture · verified and estimate parts are marked</div>'+L.map(function(x){return '<div class="qa-line">'+x[0]+'</div>';}).join('')+'</div>';
function hit(q){q=q.toLowerCase();return /\bcaptur\w*|\barresting\b/.test(q)||(/\bcatch\w*\b/.test(q)&&/\b(boss|bosses|enemy|enemies|disaster)\b/.test(q));}
QA.on('capture',function(q){if(!hit(q))return false;QA.show(H);return true;});
})();
