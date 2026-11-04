
(function(){'use strict';var D=document,go=D.getElementById('qaGo'),inp=D.getElementById('qaInput'),out=D.getElementById('qaOut');if(!go||!inp||!out)return;
function card(note,lines){return '<div class="qa-card"><div class="qa-note">'+note+'</div>'+lines.map(function(x){return '<div class="qa-line">'+x+'</div>';}).join('')+'</div>';}
var C=[
{t:function(q){return /\bguts\b/.test(q);},
 h:card('Guts · verified rules',[
 '<b>Guts chance:</b> your Guts stat, limited to 0 to 95%. The game rolls a random number from 0 to 99 and you keep the stack if it is below your chance. So a stack is never 100% safe.',
 '<b>When it matters:</b> when you would spend an HP stack at 0 HP. A successful Guts roll keeps the stack. Otherwise one stack is spent. Either way your HP is refilled to max.',
 '<b>Where Guts comes from:</b> gear (15 to 30), a few states, one enemy type and elites.',
 '<b>Not known yet:</b> your exact Guts number in a run depends on your gear and states, so check them in the game.'])},
{t:function(q){return /\bcrit\w*/.test(q)&&/(worth|stack|invest|should|better|good|focus|priorit|raise|increase|boost)/.test(q);},
 h:card('Crit: is it worth stacking? · rules verified, advice is an estimate',[
 '<b>Chance:</b> (your Crit Rate + skill crit bonus) x the skill\'s own crit multiplier, then crit modifiers, minus the target\'s Avoid Crit, then limited to 5 to 95%. Extra chance past 95% is wasted.',
 '<b>Damage:</b> a crit multiplies damage by 1.5, then crit-damage modifiers apply on top.',
 '<b>Armor:</b> a crit ignores POSITIVE armor. Armor is a percent cut limited to 75, so against a 75% armor enemy a crit does about 6 times a normal hit (1.5 divided by 0.25).',
 '<b>Crit runes:</b> weak / mid / strong add +10 / +15 / +25 chance. Extreme is a guaranteed crit.',
 '~ estimate: without armor, each +10% crit chance adds about +5% average damage (10% of hits get the extra 0.5). It is worth more the higher the enemy armor and the more crit-damage modifiers you have. If your chance is already near 95, add crit damage instead.'])},
{t:function(q){return /\bre-?roll\w*/.test(q)&&(/(should|worth|or take|better|keep|use|when|take)/.test(q)||/^(?:(?:what|how)(?:'s|\s+is|\s+are|\s+does|\s+do)?|explain|tell me about|describe)\s+(?:(?:a|an|the|my|about|how|what)\s+)*re-?rolls?(?:ing)?(?:\s+(?:do|does|work|works|mean|means|actually|even|exactly))*(?:\s+in\s+(?:the|this)\s+game)?$/.test(q.replace(/[\s?!.]+$/,'')));},
 h:card('Reroll or take the pick? · rules verified, advice is an estimate',[
 '<b>What a reroll does:</b> rarity rolls use your run Progress and Risk. The upper limit is 5 stars (7 in risk mode, where 6 and 7 stars need risk mode).',
 '<b>Reroll power N:</b> gives N extra tries for +1 star. Sources: the enhanced-reroll state, three origins, and buying a shop reroll contract (levels 1 / 3 / 5 / 7), which overwrites your current power.',
 '<b>Minimum rarity:</b> some pick screens require a minimum rarity, set by the effect that made them.',
 '~ estimate: reroll when the pick is below the 5-star limit (7 in risk mode) and you have reroll power to spend. If the pick is already at the limit, extra tries cannot raise it, so take it.',
 '<b>Not known yet:</b> the full cost of a plain reroll is not in this guide.'])},
{t:function(q){return /\bskills?\b/.test(q)&&/(more|get|gain|find|many|early|faster|unlock)/.test(q)&&/(early|more|many|get)/.test(q)&&!/(use|uses|cooldown|cool down)/.test(q);},
 h:card('Getting more and better skills · verified rules, advice is an estimate',[
 '<b>Where skills come from:</b> pick screens. Their rarity is rolled from your run Progress and Risk, up to 5 stars (7 in risk mode).',
 '<b>Better picks:</b> reroll power gives extra tries for +1 star (see the reroll answer). Some effects set a minimum rarity on a pick screen.',
 '~ estimate: the surest way to see higher-rarity skills is to push Progress and, if you can survive it, risk mode. For cheap early skills that heal, shield or escape, ask: How do I survive a long run with low HP?',
 '<b>Not known yet:</b> how many pick screens a run gives, and which rooms give a skill pick.'])},
{t:function(q){return /\btank\w*/.test(q);},
 h:card('Tanky build · verified rules, advice is an estimate',[
 '<b>HP stacks:</b> not scaled by the 0.85 step. A spent stack refills your HP to max, and Guts (up to 95%) can keep the stack. Reset HP stack effects (Camp, a gear effect, Call Miracle) fill stacks to max.',
 '<b>Armor:</b> a percent cut limited to 75 for each damage type (physical, magic, void). States such as Iron wall, Sanctuary and Mutation lift the limit to 95.',
 '<b>Parry:</b> chance limited to 0 to 95% and only works on direct attacks, never on buffs. Sources: shields and the parry gear effect (15 per gear rarity), a few runes and skills.',
 '~ estimate: a stack-based tank (many HP stacks plus Guts) beats raw max HP when enemies hit hard, because every stack is a full refill. Armor past the cap does nothing.',
 'For actual gear and skill picks from the guide, ask: How do I stop dying so fast?'])}
];
function find(q){q=q.toLowerCase();for(var i=0;i<C.length;i++){if(C[i].t(q))return C[i];}return null;}
QA.on('cards_v39',function(q){var c=find(q);if(!c)return false;QA.show(c.h);return true;});
})();
