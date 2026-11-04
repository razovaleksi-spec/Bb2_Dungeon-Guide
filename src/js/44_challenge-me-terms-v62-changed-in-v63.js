
/* ===== Challenge me terms (v62, changed in v63) =====
   v63: (1) the card is marked data-keep, and the chat layer (Free talk) leaves a data-keep card alone: before, it judged the card "probably not about this"
   when every typed word was unknown to the guide (drop weight, freq, effective, noquick) and folded it away behind a chat reply; (2) the Drop weight term also
   answers the bare words "freq", "drop weight", "drop weights", "freq drop weight", "drop weight freq", "drop weight (Freq)" and "how do drop weights work";
   (3) brackets in a question are ignored, and "... in drops" may follow "what is Freq". Everything else in this script is unchanged from v62.
   Before (v61): "what is X" for many words that Challenge me uses (drop weight, Freq, Risk, free skill, buff ...) found nothing, a wrong card or only a
   loose match, and "how are enemy skills chosen" showed the enemy stat tables note instead of the enemy skill-choice rule.
   Now: ONE handler, placed before the page's own Ask handler, answers "what is / what does ... mean / explain / define X" for 34 terms with a short
   card written in plain words from the guide's own verified rules. A part nobody has proved yet says "unverified" and is
   left open (no guess). ONE extra question stage sends "how are enemy skills chosen" (and a few ways to say it) to the existing rules card
   "How enemies choose skills". Nothing else is changed: all other questions go on exactly as before.
   Test hook: window.__qaTerms62.match(question). */
(function(){'use strict';var W=window,D=document,QA=W.QA;if(!QA||typeof QA.on!=='function'||W.__qaTerms62)return;
var out=QA.out||D.getElementById('qaOut');if(!out)return;
var C_DROP=['How drops and rarity work','how does rarity work'],C_DMG=['How damage is worked out','how is damage calculated'],C_ARM=['How armor works','how does armor work'],
C_AIL=['Try: skill 80, Effective 20, Resist 30','ailment chance skill 80 effective 20 resist 30'],C_CRIT=['How crits work','how does crit work'],
C_HP=['How HP stacks work','how do hp stacks work'],C_TURN=['How turn order works','how does turn order work'],C_AI=['How enemies choose skills','how does the enemy choose skills'],
C_MAXHP=['How max HP is worked out','how is max hp calculated'],C_PARRY=['How parry works','how does parry work'];
var T=[
{t:'Drop chance',k:['drop chance','drop chances','drop weight','drop weights','freq','freq drop weight','drop weight freq'],w:1,s:['Each enemy drop has a drop chance, written as a number out of 10,000. You get the drop when a random number from 0 to 9,999 is below that number (at the normal rate of 100). So 100 = 1%. An enemy gives only one reward.'],src:'Rule R50',c:C_DROP},
{t:'Drop rate',k:['drop rate','drop rates'],s:["A drop's chance is multiplied by a rate that starts at 100, which changes nothing. Nothing known raises or lowers it, so it is 100 for everyone."],src:'Rule R50 and guide check',c:C_DROP},
{t:'Rarity',k:['rarity','rarities'],s:['The star level of a drop. Normal runs reach 5 stars at most. 6 and 7 stars need risk mode.'],src:'Rule R52',c:C_DROP},
{t:'Progress',k:['progress','run progress'],s:['A counter for how far your run has gone. It sets the highest rarity a chest can give: 2 stars under 20, 3 under 80, 4 under 140, then 5. Where the gains per room come from is not known yet.'],src:'Rules R52, R69',c:C_DROP},
{t:'Risk',k:['risk','run risk'],s:['A run counter, written as a % in the game text (Risk 100 = 100%). At 100% or more you are in risk mode, where 6 and 7 stars can appear (6 from Progress 200, 7 from Progress 500).','The limit is 999%. A special effect that lifts the limit allows up to 9999%, and only then can Risk reach 1000% or more, which gives a roll +1 star.','It goes up by 3% after every won fight, by 3% more if the enemy was an elite, and by 2% when you enter a dark room. Going from under 100% to 100% or more adds a one-time +50%. Lost fights give no Risk.','It goes down by 2% for each new room, and by 2% for each new floor and 15% at a camp.','Part of this is unverified: the 3% per won fight is likely on the Android version but not proved, and when the floor and camp changes run was not traced. Some events and effects add or remove Risk too.'],src:'Rules R52, R69 and a guide check',u:1,w:1,c:C_DROP},
{t:'Reroll power',k:['reroll power'],s:['Reroll power N = N extra tries to get +1 star on a rarity roll.'],src:'Rule R53',c:C_DROP},
{t:'Enhanced reroll',k:['enhanced reroll','enhanced rerolls'],s:["A state that gives +1 reroll power to gear, rune and skill picks, and raises the reroll cost by 5. It comes from a random tier-4 gear effect. Nothing else gives it. The odds are not known."],src:'Guide check',c:C_DROP},
{t:'Reroll contract',k:['reroll contract','reroll contracts'],s:['A shop item. Levels 1, 3, 5 or 7 give reroll power, and buying one overwrites the enhanced-reroll state.'],src:'Rule R53',c:C_DROP},
{t:'Damage chain',k:['damage chain','damage chains'],s:['The order one damage number is worked out in: base power plus stat bonus, then many percent modifiers that multiply, then source bonuses, crit, armor, element/type handling, damage-dealt and damage-taken modifiers, the Persistence cap, parry, and a final limit of 0 to 9,999,999.'],src:'Rule R19',c:C_DMG},
{t:'Damage bonus',k:['damage bonus','damage bonuses'],s:['A percent modifier on damage. Bonuses multiply each other, they never add: every step is value x (100 + n) / 100.'],src:'Rules R19, R20',c:C_DMG},
{t:'Normal armor',k:['normal armor','normal armors'],s:['The ordinary armor for one damage type (physical, magic or void). It is a percent cut limited to 75, or 95 with Iron wall (physical), Sanctuary (magic) or Mutation (void). Source armor is a separate cut that multiplies with it.'],src:'Rules R24, R25, R28',c:C_ARM},
{t:'Source armor',k:['source armor','source armors'],s:['Extra armor that only cuts damage coming from one source: damage over time, delayed, reflect or pursuit damage. Limited to 75 (never 95). It multiplies with normal armor.'],src:'Rule R28',c:C_ARM},
{t:'Armor penetration',k:['armor penetration','armor pen'],s:["Ignoring part of the target's armor. Penetrate runes (P / M / V) ignore armor of that type, and penetration is subtracted from the target's armor. A crit ignores positive armor."],src:'Rule R26',c:C_ARM},
{t:'Iron wall',k:['iron wall'],s:['A state that raises the physical armor limit from 75 to 95. Sanctuary does the same for magic and Mutation for void.'],src:'Rule R25 and guide check',c:C_ARM},
{t:'Effective',k:['effective','effective stat'],s:['Your stat for landing ailments. Ailment chance = skill value + your Effective - target Resist Ailment, limited to 5 to 95.'],src:'Rule R15',c:C_AIL},
{t:'Skill value',k:['skill value','skill values'],s:["The skill's own number in the ailment chance formula: ailment chance = skill value + your Effective - target Resist Ailment, limited to 5 to 95."],src:'Rule R15',lb:'likely',c:C_AIL},
{t:'Avoid Crit',k:['avoid crit'],s:["The target's stat that lowers your crit chance. It is subtracted after your crit modifiers, and the final crit chance is limited to 5 to 95."],src:'Rule R16',c:C_CRIT},
{t:'HP stack',k:['hp stack','hp stacks'],s:['An extra life. Every fight starts with full stacks. When a hit leaves you at 0 HP, one stack is spent (a Guts roll can keep it) and HP refills to max. You are dead at 0 HP with no stacks. Stacks are not scaled by 0.85.'],src:'Rules R04, R34 to R36',c:C_HP},
{t:'Reset effect',k:['reset effect','reset effects','reset hp stack'],s:['Short for the Reset HP stack effect. It sets your HP stacks to the maximum and does not change HP or shield. It needs a hit on a living target. Camp, one gear effect and Call Miracle do it, and Call Miracle affects both sides.'],src:'Rule R40 and guide check',c:C_HP},
{t:'Camp effect',k:['camp effect','camp effects','camp','camps'],s:['The camp has its own Reset HP stack effect: it sets your HP stacks to the maximum. When the camp runs it is unverified.'],src:'Guide check',u:1,c:C_HP},
{t:'Remaining uses',k:['remaining use','remaining uses'],s:['How many more times a skill can be used. A unit is dead when the total remaining uses of all its non-free skills is below 1.'],src:'Rule R35',c:C_HP},
{t:'Free skill',k:['free skill','free skills'],s:['A skill flagged free. It stays usable with no uses left, it counts as 0 in the death check, and it is never a quick action.'],src:'Guide check (rules R35, R45, R47)',c:C_HP},
{t:'Non-free skills',k:['non free skill','non free skills','nonfree skill','nonfree skills'],s:['Every skill that is not free. Their remaining uses are what the death check adds up.'],src:'Rule R35',c:C_HP},
{t:'Who goes first',k:['who goes first','first turn','opening turn','goes first','go first','going first','who acts first','acts first','who moves first','moves first','who attacks first','attacks first'],s:["Turn order is not speed. The player usually acts first; the enemy opens about 1 fight in 3."],src:'Rules R42, R43',c:C_TURN},
{t:'Taking turns',k:['taking turns','turn taking'],s:['After every turn the other side acts, so sides alternate. Whether a quick action gives the same side another turn is unverified.'],src:'Rule R42',u:1,c:C_TURN},
{t:'Quick action',k:['quick action','quick actions'],s:["An extra action (+1 Action!). Free skills are never quick, and a No-Quick state blocks it. Otherwise it comes from a skill's own quick flag, a forced-quick effect, a chance from 'add action' effects, or the Additional Action state. What it does to the turn order is unverified."],src:'Rule R45 and guide check',u:1,c:C_TURN},
{t:'No-quick flag',k:['no quick flag','no quick flags','no quick','noquick','no quick state'],s:['A state on a unit (called No-Quick) that stops all of its skills from being quick actions.'],src:'Guide check',c:C_TURN},
{t:'Usable skills',k:['usable skill','usable skills'],s:['The skills the enemy can pick right now: not on cooldown, and with uses left (or free).'],src:'Rule R47',c:C_AI},
{t:'Priority runes',k:['priority rune','priority runes','prior rune','prior runes'],s:["Runes that steer which skill the game picks when it chooses for you (confused or auto). Force adds 1 to a skill's priority, Away subtracts 1, and each of the 27 'Prior:' runes adds 1 when its condition is true. Enemy skills carry none of these, so an enemy picks uniformly at random among its usable skills."],src:'Rules R47, R48 and guide check',lb:'formula proved, direction likely',c:C_AI},
{t:'Raw base',k:['raw base','raw base value'],s:['The base number before the 0.85 step. In-game max HP and max shield = round( round(raw base x 0.85) x (1 + extra% / 100) ).'],src:'Rule R03',c:C_MAXHP},
{t:'Buff',k:['buff','buffs'],s:['A good state. Every state is flagged good or bad, and a good one is a buff. Parry can never stop a buff.'],src:'Guide check (rule R31)',c:C_PARRY},
{t:'Debuff',k:['debuff','debuffs'],s:['A bad state, which includes ailments. Parry can stop it when a status node applies it.'],src:'Guide check (rule R31)',c:C_PARRY},
{t:'Status node',k:['status node','status nodes'],s:['A step of a skill that applies a state to someone, as opposed to a direct attack step that deals damage. A parry can stop it only if the state is bad.'],src:'Guide check (rule R31)',c:C_PARRY},
{t:'Status effects',k:['status effect','status effects'],s:["The game's own Parry text uses it for states that a status node applies to you, good (buffs) or bad (debuffs). A state lasts for a number of acts, turns, combats, rooms or floors, and a state trigger rolls base chance x linked value / 100."],src:'Rules R31, R67, R68',lb:'likely',c:C_PARRY}
];
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function norm(q){return String(q==null?'':q).toLowerCase().replace(/[\u2018\u2019`]/g,"'").replace(/[\u201c\u201d"]/g,'').replace(/armour/g,'armor').replace(/[-_]+/g,' ').replace(/[()\[\]]+/g,' ').replace(/\s+/g,' ').replace(/[\s?!.,;:]+$/,'').replace(/^\s+/,'');}
function rx(a){return a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
var MAP={},ALL=[];T.forEach(function(e){e.k.forEach(function(k){MAP[k]=e;ALL.push(k);});});
ALL.sort(function(a,b){return b.length-a.length;});
var TERM='('+ALL.map(rx).join('|')+')';
var LEAD="(?:please\\s+)?(?:what(?:'s|s)?(?:\\s+(?:is|are|was|does|do|exactly))*|whats|define|explain(?:\\s+to\\s+me)?|tell\\s+me\\s+about|describe|(?:can|could)\\s+you\\s+explain|(?:the\\s+)?meaning\\s+of|what\\s+is\\s+meant\\s+by|what\\s+do\\s+you\\s+mean\\s+by)";
var R1=new RegExp('^'+LEAD+'\\s+(?:an?\\s+|the\\s+)?'+TERM+"(?:\\s+(?:mean|means|do|does|actually\\s+mean|exactly\\s+mean|even\\s+mean|stand\\s+for))?(?:\\s+in\\s+(?:this\\s+game|the\\s+game|bb2|buriedbornes\\s+2|challenge\\s+me|(?:the\\s+)?(?:enemy\\s+)?drops?(?:\\s+(?:table|tables|rows?))?))?$");
var R2=new RegExp('^'+TERM+'\\s+(?:meaning|definition|explained|explanation)$');
var WALL=[];T.forEach(function(e){if(e.w)e.k.forEach(function(k){WALL.push(k);});});WALL.sort(function(a,b){return b.length-a.length;});
var TERMW='('+WALL.map(rx).join('|')+')';
var R3=new RegExp('^(?:the\\s+)?'+TERMW+'$');
var R4=new RegExp('^how\\s+(?:do|does|is|are)\\s+(?:the\\s+|a\\s+)?'+TERMW+'\\s+(?:work|works|used|calculated|decided|determined|rolled)$');
function match(q){var n=norm(q),m=R1.exec(n)||R2.exec(n)||R3.exec(n)||R4.exec(n);return m?MAP[m[1]]:null;}
function fmt(x){return esc(x).replace(/\bunverified\b/g,'<i>unverified</i>');}
function label(e){return 'game term \u00b7 '+(e.lb||(e.u?'part unverified':'verified'));}
function why(e){return 'I answered from the guide\u2019s own checked rules: '+e.t+', labelled \u201c'+label(e)+'\u201d.'+(e.u?' One part is marked unverified, so I left it open instead of guessing.':'')+(e.lb?' The evidence points this way, but it is not fully proven, so I did not call it verified.':'');}
function card(e){var h='<div class="qa-card" data-t62="1" data-keep="1"><div class="qa-title">'+esc(e.t)+'<span class="qa-sub">'+label(e)+'</span></div>';
  e.s.forEach(function(x){h+='<div class="qa-line">'+fmt(x)+'</div>';});
  h+='<div class="qa-line"><span class="qa-lab">Source</span> '+esc(e.src)+' \u00b7 '+(e.lb||'verified')+(e.u?'; one part unverified':'')+'</div>';
  if(e.c)h+='<div class="qa-ex"><button type="button" class="qa-exbtn" data-ex="'+esc(e.c[1])+'">'+esc(e.c[0])+'</button></div>';
  return h+'</div>';}
QA.on('terms_v62',function(q){var e=match(q);if(!e)return false;QA.show(card(e));return true;});
/* the record for "why?" and follow-ups: runs after the page's own answer snapshot and before the v61 reason filler, so this reason is kept */
QA.watch('terms_v62',function(){var A=QA.state&&QA.state.answer,c=out.querySelector('[data-t62]');if(!A||!c)return;
  var t=c.querySelector('.qa-title'),n=T.filter(function(e){return t&&t.firstChild&&t.firstChild.textContent===e.t;})[0];if(!n)return;
  if(A.name!==n.t||A.why!==why(n)||A.kind!=='other'){A.topic=n.t;A.name=n.t;A.kind='other';A.why=why(n);}});
/* ONE extra question stage: how are enemy skills chosen -> the existing rules card */
var ROUTE='how does the enemy choose skills',E='(?:the\\s+)?(?:enemy|enemies|monsters?|enemy\\s+ai)(?:\x27s)?\\s+';
var ENEMY=new RegExp('^(?:(?:how|what)(?:\x27s)?\\s+(?:is|are|do|does|did|will|would|can)?\\s*'+E+'(?:ai\\s+)?(?:skills?|attacks?)\\s+(?:chosen|picked|selected|decided|determined|choice|selection|pick|choose)|(?:how|what)\\s+(?:does|do|will|would)\\s+'+E+'(?:decide|determine)\\s+(?:which|what)\\s+skills?(?:\\s+to\\s+use)?|(?:enemy|monster)\\s+skill\\s+(?:choice|selection|picking))$');
if(QA.pre&&typeof QA.pre.add==='function')QA.pre.add('enemy_skill_route',100,function(P0){return function(raw){var r=P0?P0(raw):raw;try{if(ENEMY.test(norm(raw)))return ROUTE;}catch(x){}return r;};});
/* v69: the Intent layer builds the "Enemy stat tables" card from the typed words before the stage above can rewrite them, so for these wordings the stage never won.
   Now the same wordings are answered here, before the page's own Ask handler: the box is asked the wording that already works, then the typed words are put back. */
QA.on('enemy_skill_card',function(q,e){var inp=QA.inp||D.getElementById('qaInput');if(!inp||typeof QA.run!=='function')return false;
  try{if(!ENEMY.test(norm(q)))return false;}catch(x){return false;}
  var keep=inp.value;try{inp.value=ROUTE;QA.run();}catch(err){setTimeout(function(){throw err;},0);}finally{inp.value=keep;}
  return true;});
/* v77: "topic first". A question that is only a topic the guide has a card for (armor, reroll) but starts with a lead the page's own Ask handler does not know
   (what is armor, what does armor do, explain armor, tell me about armor, how do armors work, bare reroll) used to get the chat fallback although the card exists.
   Same method as the enemy skill handler above: only these exact whole-question forms are taken; the box is asked the wording that already shows the card, then the typed words are put back.
   Wordings that already work (bare armor, how does armor work, how do armor work, spelled as typed) are left alone. Everything else goes on to the next handler as before.
   ev: the Reroll card is an earlier handler of the same dispatcher, not part of the page's own Ask handler, so for reroll the working wording is sent as a real Enter key event (the same path as typing it).
   keep: the chat layer judged a lone unknown word (reroll) as "probably not about this" and swapped the card for a chat reply, so the card is marked data-keep, as the term cards are. */
var TF_ARM=/^(?:please )?(?:(?:what(?:'s| is| are| does| do)(?: exactly)?|whats|explain(?: to me)?|tell me about|describe|(?:can|could) you (?:explain|tell me about)) (?:the |an? )?armors?(?: (?:do|mean|means|actually do|actually mean))?|(?:explain )?how (?:do|does) (?:the )?armors? work|explain how (?:the )?armors? works?)$/;
var TF_RRL=/^(?:(?:the|an?) )?re ?rolls?$/;
var TF=[{re:TF_ARM,to:'how does armor work',skip:['armor','how does armor work','how do armor work'],keep:false,ev:false},{re:TF_RRL,to:'what does reroll do',skip:[],keep:true,ev:true}];
QA.on('topic_first_card',function(q,e){var inp=QA.inp||D.getElementById('qaInput');if(!inp||typeof QA.run!=='function')return false;
  var n,raw,hit=null;try{n=norm(q);raw=String(q).toLowerCase().replace(/\s+/g,' ').replace(/[\s?!.,;:]+$/,'').replace(/^\s+/,'');for(var i=0;i<TF.length;i++){if(TF[i].re.test(n)&&TF[i].skip.indexOf(raw)<0){hit=TF[i];break;}}}catch(x){return false;}
  if(!hit)return false;
  var keep=inp.value;try{inp.value=hit.to;if(hit.ev)inp.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));else QA.run();}catch(err){setTimeout(function(){throw err;},0);}finally{inp.value=keep;}
  if(hit.keep){try{var c=out.querySelector('.qa-card');if(c)c.setAttribute('data-keep','1');}catch(x){}}
  return true;});
/* v75: wordings of a term the guide does not hold now get a short "not in the guide" card (instead of an unrelated search match) with a button to the turn order card. */
var HID_T='(?:an?\\s+|the\\s+)?hidden\\s+(?:turn\\s+)?order(?:\\s+(?:value|values|number|numbers|counter|counters))?';
var HIDQ=new RegExp('^(?:'+LEAD+'\\s+)?'+HID_T+'(?:\\s+(?:mean|means|do|does))?$');
var HIDW=new RegExp('^how\\s+(?:do|does|is|are)\\s+'+HID_T+'\\s+(?:work|works|used|calculated|decided|determined)$');
QA.on('hidden_order_none',function(q){try{var n=norm(q);if(!HIDQ.test(n)&&!HIDW.test(n))return false;}catch(x){return false;}
  QA.show('<div class="qa-card" data-keep="1" data-hon="1"><div class="qa-title">Not in the guide<span class="qa-sub">no entry</span></div><div class="qa-line">I do not have that term in the guide, so I will not guess what it means.</div><div class="qa-line">To see who acts first in a fight, ask this:</div><div class="qa-ex"><button type="button" class="qa-exbtn" data-ex="how does turn order work">How turn order works</button></div></div>');return true;});
/* the record for "why?": this card is a "no entry" reply, not an answer from a guide card */
QA.watch('hidden_order_none',function(){var A=QA.state&&QA.state.answer,c=out.querySelector('[data-hon]');if(!A||!c)return;
  var w='I did not find that term in the guide, so I did not answer it and did not guess a meaning.';
  if(A.why!==w||A.kind!=='other'){A.topic='hidden order value';A.name='Not in the guide';A.kind='other';A.why=w;}});
/* v78: "connected topics get the card". When the Ask box found no real answer (it would show the generic menu, the "Outside this guide" card or end in a chat reply)
   but the sentence contains a term the guide holds a card for (risk, progress, quick action, who goes first, iron wall, buff ...), the term card is shown instead of the chat reply.
   Before (v77): 76 of 287 test wordings of these 34 terms (how does X work, how do I get X, why does X matter, bare iron wall / source armor / buff / free skill ...) got a chat reply although the card exists.
   The chat layer (Free talk) now only answers what is left: sentences with no connection to any of these terms. Same trigger conditions as the chat layer itself (menu or outside-the-guide card, no real answer), so a real answer is never replaced.
   The card says which words it matched on, and "why?" says the same. Test hook: window.__qaTermsIn(question). */
function inside(q){var n=' '+norm(q).replace(/[^a-z0-9' ]+/g,' ').replace(/\s+/g,' ').trim()+' ';for(var i=0;i<ALL.length;i++){if(n.indexOf(' '+ALL[i]+' ')>=0)return {e:MAP[ALL[i]],k:ALL[i]};}return null;}
QA.watch('connected_term',function(){
  try{if(out.querySelector('[data-ft],[data-bare],[data-keep],[data-t62],[data-redirect]'))return;
    /* B: the awareness layer said "not in the guide data" and hid a "Built for: ..." gear list (the guide found a goal in the words, e.g. luck = critical hits) under "Suggestions the Ask box also found": that list is the answer */
    var aw=out.querySelector(':scope > [data-aw]'),fold=null;
    [].forEach.call(out.querySelectorAll(':scope > details'),function(d){var s=d.querySelector(':scope > summary');if(s&&/^Suggestions the Ask box also found/.test(s.textContent))fold=d;});
    var rc=fold&&fold.querySelector(':scope > [data-rc]'),rt=rc&&rc.querySelector('.qa-title');
    if(aw&&rc&&rt&&/^Built for/.test(rt.textContent)){var cl=rc.cloneNode(true);cl.setAttribute('data-keep','1');cl.setAttribute('data-redirect','goal');
      QA.show(cl.outerHTML.replace('</div>','</div><div class="qa-line"><span class="qa-lab">Matched on</span> a build goal the guide read in your message. If this is not what you meant, ask it another way.</div>'));return;}
    var txt=out.textContent||'',menu=/Tell me a bit more/.test(txt)||/I couldn.t match/.test(txt),oc=false;
    [].forEach.call(out.querySelectorAll('[data-intent] .qa-title'),function(t){if(/^Outside this guide/.test(t.textContent))oc=true;});
    var real=[].some.call(out.querySelectorAll('.qa-title'),function(t){return !/Tell me a bit more|Outside this guide|What I understood|I couldn.t match/.test(t.textContent);});
    if(!(menu||oc)||real)return;
    var inp=QA.inp||D.getElementById('qaInput'),q=((inp&&inp.value)||'').trim()||String((QA.state&&QA.state.orig)||'').trim();if(!q)return;
    var f=inside(q);if(!f)return;
    var h=card(f.e).replace('data-keep="1">','data-keep="1" data-redirect="'+esc(f.k)+'">').replace('</div>','</div><div class="qa-line"><span class="qa-lab">Matched on</span> \u201c'+esc(f.k)+'\u201d in your message. If this is not what you meant, ask it another way.</div>');
    QA.show(h);
  }catch(x){try{console.error('connected_term',x);}catch(y){}}});
/* the record for "why?": this card was found by a word in the sentence, not by the whole question */
QA.watch('connected_term_why',function(){var A=QA.state&&QA.state.answer,c=out.querySelector('[data-redirect]');if(!A||!c)return;
  var k=c.getAttribute('data-redirect'),w=k==='goal'?'Your message pointed at a build goal in the guide, and the Ask box had no direct answer, so I showed the gear list for that goal instead of saying it is not in the guide. I matched the goal only. I did not check that the list answers your whole sentence.':'Your message contained \u201c'+k+'\u201d, which has a card in the guide, and the Ask box had no other answer, so I showed that card instead of replying in chat. I matched the term only. I did not check that the card answers your whole sentence.';
  if(A.why!==w){A.why=w;}});
W.__qaTermsIn=function(q){var f=inside(q);return f?f.e.t:null;};
/* v80: "connected rules topics get the card" (replaces the flawed v79: v79 also fired during the 70 ms menu the Intent layer shows before its real card and added a Matched-on line to questions that already worked).
   The watcher now waits 200 ms (the Intent layer swaps in its card after 70 ms; timers run in order) and then checks again: only if the screen is STILL the menu / could-not-match / chat reply with no real answer,
   and the sentence contains armor / reroll / crit / parry / max hp / turn order as whole words, the box is asked the wording that already shows that rules card (real Enter key event), the typed words are put back,
   and the card says which word it matched on ("why?" says the same, also for Armor). Sentences that already get an answer are never touched. The same sentence is handled once. The label is only added to a real answer card (never the menu), and only while the typed sentence is still in the box. */
var C80=[{k:'armor',re:/ armou?rs? /,to:'how does armor work'},{k:'reroll',re:/ (?:re ?rolls?|re ?rolling|re ?rolled) /,to:'what does reroll do'},{k:'crit',re:/ (?:crits?|critical|critically) /,to:'how does crit work'},{k:'parry',re:/ (?:parry|parries|parrying|parried) /,to:'how does parry work'},{k:'max hp',re:/ max(?:imum)? (?:hp|health) /,to:'how is max hp calculated'},{k:'turn order',re:/ turn order /,to:'how does turn order work'},{k:'move order',re:/ move order /,to:'how does turn order work'},{k:'action order',re:/ action order /,to:'how does turn order work'}];
var c80={busy:false,pend:false,last:'',t:0};
function why80(k){return 'Your message contained \u201c'+k+'\u201d, which has a card in the guide, and the Ask box had no other answer, so I showed that card instead of replying in chat. I matched the term only. I did not check that the card answers your whole sentence.';}
function fin80(k,keep){try{var inp=QA.inp||D.getElementById('qaInput');if(inp&&inp.value!==keep)return;var c=out.querySelector('.qa-card');if(!c)return;var t=c.querySelector('.qa-title');if(t&&/Tell me a bit more|Outside this guide|What I understood|I couldn.t match/.test(t.textContent))return;if(!c.querySelector('[data-matched80]')){c.setAttribute('data-keep','1');c.setAttribute('data-redirect',k);c.insertAdjacentHTML('beforeend','<div class="qa-line" data-matched80="1"><span class="qa-lab">Matched on</span> \u201c'+esc(k)+'\u201d in your message. If this is not what you meant, ask it another way.</div>');}var A=QA.state&&QA.state.answer,w=why80(k);if(A&&A.why!==w)A.why=w;}catch(x){}}
function go80(){
  try{if(c80.busy)return;if(out.querySelector('[data-bare],[data-keep],[data-t62],[data-redirect]'))return;
    var txt=out.textContent||'',menu=/Tell me a bit more/.test(txt)||/I couldn.t match/.test(txt)||!!out.querySelector('[data-ft]'),oc=false;
    [].forEach.call(out.querySelectorAll('[data-intent] .qa-title'),function(t){if(/^Outside this guide/.test(t.textContent))oc=true;});
    var real=[].some.call(out.querySelectorAll('.qa-title'),function(t){return !/Tell me a bit more|Outside this guide|What I understood|I couldn.t match/.test(t.textContent);});
    if(!(menu||oc)||real)return;
    var inp=QA.inp||D.getElementById('qaInput'),q=((inp&&inp.value)||'').trim()||String((QA.state&&QA.state.orig)||'').trim();if(!q||!inp)return;
    var n=' '+norm(q).replace(/[^a-z0-9' ]+/g,' ').replace(/\s+/g,' ').trim()+' ',hit=null;
    for(var i=0;i<C80.length;i++){if(C80[i].re.test(n)){hit=C80[i];break;}}
    if(!hit)return;
    var now=Date.now();if(c80.last===q&&now-c80.t<2500)return;c80.last=q;c80.t=now;
    c80.busy=true;var keep=inp.value;
    try{inp.value=hit.to;inp.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));}finally{inp.value=keep;c80.busy=false;}
    setTimeout(function(){fin80(hit.k,keep);},80);setTimeout(function(){fin80(hit.k,keep);},200);setTimeout(function(){fin80(hit.k,keep);},400);
  }catch(x){c80.busy=false;try{console.error('connected_rules_v80',x);}catch(y){}}}
QA.watch('connected_rules_v80',function(){if(c80.busy||c80.pend)return;c80.pend=true;setTimeout(function(){c80.pend=false;go80();},200);});
W.__qaTerms62={version:1,count:T.length,match:function(q){var e=match(q);return e?e.t:null;},route:function(q){return ENEMY.test(norm(q));}};
})();
