
(function(){'use strict';var D=document,go=D.getElementById('qaGo'),inp=D.getElementById('qaInput'),out=D.getElementById('qaOut');if(!go||!inp||!out)return;
function card(note,lines){return '<div class="qa-card"><div class="qa-note">'+note+'</div>'+lines.map(function(x){return '<div class="qa-line">'+x+'</div>';}).join('')+'</div>';}
var STAR=/(?:[4-7]\s*(?:\u2605|\*|-?\s*stars?)|\b(?:six|seven)\s*stars?|\b6\s*(?:to|or|and|-)\s*7\b)/;
var NEED=/(percent|%|how (?:many|much)|needed|\bneed\b|unlock|start|require|minimum|threshold|enough|ceiling|\bcap\b|limit)/;
var BUILD=/(build|best|which|recommend|gear for|armor for|weapon for|survive|dying)/;
var C=[
{t:function(q){
  if(BUILD.test(q))return false;
  if(/\brisk\s*mode/.test(q)&&/(what is|what's|what does|how does|unlock|need|how do i (?:enter|reach|get into)|start)/.test(q))return true;
  return (STAR.test(q)||/rarit|rarer/.test(q))&&NEED.test(q);},
 h:card('Star rarity (6\u2605 and 7\u2605 drops) \u00b7 verified rules, odds are examples',[
 '<b>Short answer:</b> no Item Rarity amount unlocks 6\u2605 or 7\u2605. The ceiling comes from your run (Risk and Progress), not from the stat.',
 '<b>Skills, runes and equipment:</b> 6\u2605 and 7\u2605 only roll in risk mode (Risk 100 or more, called Savage mode in the guide). Without it the top is 5\u2605. Risk 1000 or more adds +1 star to the roll (Risk can only go past 999 with a special effect that lifts the limit).',
 '<b>Treasure chest items:</b> the top depends on Progress: 2\u2605 under 20, 3\u2605 under 80, 4\u2605 under 140, then 5\u2605. In risk mode: 6\u2605 from Progress 200 and 7\u2605 from Progress 500.',
 '<b>What Item Rarity does:</b> it only gives extra chances at +1 star on chest items, up to that ceiling. Equipment Rarity, Skill Rarity and Rune Rarity do the same for their own picks. Reroll power adds more tries (see the reroll answer).',
 '<b>Example odds</b> (chest, Progress 600, Risk 100): at an internal value of 0 / 20 / 50 about 3%, 4.5% and 13% for a 6\u2605 or 7\u2605. At Risk 1000: about 12%, 16% and 30%.',
 '<b>Not known yet:</b> how the in-game Item Rarity number (+1) matches the internal value used in the odds, and how much Progress each room or floor gives (the Risk gains are in the Risk answer). Risk and Progress are the names used here, so check the wording in the game.'])}
];
function find(q){q=q.toLowerCase();for(var i=0;i<C.length;i++){if(C[i].t(q))return C[i];}return null;}
QA.on('cards_star',function(q){var c=find(q);if(!c)return false;QA.show(c.h);return true;});
})();
