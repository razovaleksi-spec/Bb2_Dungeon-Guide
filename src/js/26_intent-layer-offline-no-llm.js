
/* ===== Intent layer (offline, no LLM) =====
   1) tokenize + mask known names  2) a small trained model (learned word weights) picks the intent
   3) slots (item, goal, slot, star) come from the guide's own names and a goal word list
   4) the question is rewritten into one the existing engine already answers, ONLY when the page would otherwise fail.
   Working answers are never touched. The model was trained from this guide's own tables (see train_intent.py). */
(function(){'use strict';
var W=window,I=document.getElementById('qaInput'),O=document.getElementById('qaOut'),ME=document.getElementById('qaIntentModel'),MS=document.getElementById('qaMechStatus');
if(!I||!O||!ME||W.__qaIntent)return;
var M=JSON.parse(ME.textContent),MST=MS?JSON.parse(MS.textContent):{},COMMON={};M.common.forEach(function(w){COMMON[w]=1;});
var prev=null,NAMES=null,SHORT={},BOSS={},MAXLEN=1,S=window.QA.state.intent,cache={key:'',res:''},pending=null,tm=0;
function toks(t){return String(t||'').toLowerCase().replace(/[\u2019']/g,'').replace(/\u2605/g,' \u2605 ').replace(/[^a-z0-9\u2605+]+/g,' ').trim().split(' ').filter(Boolean);}
function addName(n,perm,boss){var tk=toks(n);if(!tk.length)return;var key=tk.join(' ');
  if(tk.length===1&&(tk[0].length<5||COMMON[tk[0]])){if(perm&&tk[0].length>=3&&!COMMON[tk[0]])SHORT[key]=n;return;}
  NAMES[key]=n;if(boss)BOSS[key]=1;if(tk.length>MAXLEN)MAXLEN=tk.length;}
function build(){NAMES={};SHORT={};BOSS={};MAXLEN=1;
  try{JSON.parse(document.getElementById('qaKB').textContent).forEach(function(r){if(r&&r[1]&&r[0]!=='Term')addName(r[1],r[0]==='Race'||r[0]==='Job'||r[0]==='Origin');});}catch(e){}
  try{Object.keys(ITEM_DETAILS).forEach(function(k){addName(k);});}catch(e){}
  try{((W.__qaStrat&&W.__qaStrat.rows)||[]).forEach(function(r){addName(r&&r.n);});}catch(e){}
  try{[DATA,CONQUEST,CONQUEST2,SPECIAL].forEach(function(a){if(Array.isArray(a))a.forEach(function(r){if(r&&typeof r[0]==='string')addName(r[0],false,true);});});}catch(e){}}
function mask(tk){var out=[],ne=0,i=0;while(i<tk.length){var hit=0;
    for(var L=Math.min(MAXLEN,tk.length-i);L>0;L--){if(NAMES[tk.slice(i,i+L).join(' ')]){hit=L;break;}}
    if(hit){out.push('<e>');ne++;i+=hit;}else{var w=tk[i];if(/^\d+$/.test(w)&&w!=='6'&&w!=='7')w='<n>';out.push(w);i++;}}
  return {t:out,ne:ne};}
function feats(text){var m=mask(toks(text)),tk=m.t,f={},i;
  for(i=0;i<tk.length;i++)f['w:'+tk[i]]=1;
  for(i=0;i+1<tk.length;i++)f['b:'+tk[i]+'_'+tk[i+1]]=1;
  if(tk.length)f['f:'+tk[0]]=1;
  f['ne:'+Math.min(m.ne,2)]=1;f['len:'+Math.min(Math.floor(tk.length/4),3)]=1;
  if(/\?\s*$/.test(String(text)))f.q=1;
  return f;}
function classify(text){if(!NAMES)build();var f=feats(text),n=M.classes.length,s=M.bias.slice(),k,j,w,contrib=[];
  for(k in f){w=M.w[k];if(!w)continue;for(j=0;j<n;j++)s[j]+=w[j];}
  var mx=Math.max.apply(null,s),e=s.map(function(x){return Math.exp(x-mx);}),z=e.reduce(function(a,b){return a+b;},0),p=e.map(function(x){return x/z;});
  var o=0;for(j=1;j<n;j++)if(p[j]>p[o])o=j;
  for(k in f){w=M.w[k];if(w)contrib.push([k.replace(/^[a-z]+:/,''),w[o]]);}
  contrib.sort(function(a,b){return b[1]-a[1];});
  return {intent:M.classes[o],conf:p[o],focus:contrib.slice(0,3).map(function(c){return c[0];})};}
/* ---- slots ---- */
var GOALS=[['tank',['tank','tanky','tankier','tankiest','tanking','durable','durability','bulky','sturdy','sustain','survive','survival','survivability','alive','not die','stop dying','not dying','stay alive','keep me alive','tankiness']],
['healing',['heal','heals','healing','healer','regen','recover','recovery','restore']],['burn',['burn','burning','fire','ignite','scorch']],['frostbite',['ice','frost','freeze','frostbite','chill']],
['electrified',['lightning','shock','thunder','electric','electrified']],['poison',['poison','venom','toxic']],['curse',['curse','hex']],['explosion',['explosion','explode','blast']],
['critical',['crit','crits','critical']],['haste',['speed','haste','fast','faster','quick']],['evasion',['evasion','dodge','dodging','evade','dodges']],['gold',['gold','money','coins']],
['summons',['summon','summons','minion','minions','pet','pets']],['shield',['shield','barrier']],['parry',['parry','block','blocking']],['max hp',['hp','health','hitpoints','vitality']],
['damage',['damage','dps','nuke','kill faster','hit hard']]];
var SLOTS=[['weapons',['weapon','weapons','sword','swords','staff','staves','bow','wand']],['armor',['armor','armour','chestplate']],['accessories',['accessory','accessories','ring','rings','jewelry','jewel','jewels','amulet']],
['skills',['skill','skills','spell','spells','ability','abilities']],['gear',['gear','equipment','items','wear','equip','outfit','put on']]];
function firstIn(z,table,byPos){var best=null,bi=1e9;
  for(var a=0;a<table.length;a++)for(var b=0;b<table[a][1].length;b++){var i=z.indexOf(' '+table[a][1][b]+' ');if(i<0)continue;
    if(!byPos)return table[a][0];if(i<bi){bi=i;best=table[a][0];}}
  return best;}
function ents(text){if(!NAMES)build();var tk=toks(text),out=[],i=0;
  while(i<tk.length){var hit=0,nm=null;
    for(var L=Math.min(MAXLEN,tk.length-i);L>0;L--){var k=tk.slice(i,i+L).join(' ');if(NAMES[k]){hit=L;nm=NAMES[k];break;}}
    if(!hit&&SHORT[tk[i]]){hit=1;nm=SHORT[tk[i]];}
    if(hit){out.push(nm);i+=hit;}else i++;}
  return out;}
function slotsOf(text){var tk=toks(text),z=' '+tk.join(' ')+' ',s={},m;
  s.goal=firstIn(z,GOALS,true);s.slot=firstIn(z,SLOTS,false);
  m=/ ([67]) (?:\u2605|star|stars) /.exec(z);if(m)s.star=m[1]+'\u2605';else if(/ seven (star|\u2605) /.test(z))s.star='7\u2605';else if(/ six (star|\u2605) /.test(z))s.star='6\u2605';
  if(/ race /.test(z))s.kind='race';else if(/ (job|class|jobs|classes) /.test(z))s.kind='job';else if(/ origin /.test(z))s.kind='origin';
  if(/ cooldown | cd /.test(z))s.stat='cooldown';else if(/ (uses|use) /.test(z))s.stat='uses';else if(/ (damage|power) /.test(z))s.stat='damage';
  s.ents=ents(text);s.neg=/ (without|no|not|exclude|less) /.test(z);return s;}
/* ---- is the page already able to answer this? ---- */
function plain(h){return String(h||'').replace(/<[^>]*>/g,' ');}
function ans(q){try{return plain(W.__qaAnswer?W.__qaAnswer(q):'');}catch(e){return "I couldn't match";}}
function good(q){var a=ans(q);if(a.length>30&&!/I couldn.t match/.test(a)&&!/Tell me a bit more/.test(a))return true;
  try{var f=W.__qaStrat&&W.__qaStrat.fallback&&W.__qaStrat.fallback(q);if(f&&f.html)return true;}catch(e){}
  try{return !!(W.__qaUnderstood&&W.__qaUnderstood(q));}catch(e){return false;}}
function firstGood(l){for(var i=0;i<l.length;i++)if(l[i]&&good(l[i]))return l[i];return null;}
/* ---- direct replies (no rewrite possible) ---- */
function card(title,sub,line,chips){return '<div class="qa-card" data-intent="1"><div class="qa-title">'+title+'<span class="qa-sub">'+sub+'</span></div><div class="qa-line">'+line+'</div>'+
  (chips&&chips.length?'<div class="qa-ex">'+chips.map(function(c){return '<button type="button" class="qa-exbtn" data-ex="'+c[1]+'">'+c[0]+'</button>';}).join('')+'</div>':'')+'</div>';}
var CH=[['Best armor for a tank','best armor for tank'],['Where do I get Lemegeton','where do I farm Lemegeton'],['Which race for a beginner','which race is best for a beginner']];
var MECH=[[['crit chance','critical chance','crit rate'],'crit_chance','Crit chance'],[['crit','critical'],'crit_damage','Crit damage'],[['armor','armour','defense','defence','reduction'],'armor_reduction','Armor damage reduction'],
[['hit chance','accuracy','miss','hit chances'],'normal_hit_chance','Hit chance'],[['dot','burn','poison','bleed'],'dot_scaling','Damage over time'],[['turn order','move order','action order','goes first','speed order','initiative'],'turn_order','Turn order'],
[['enemy','boss stats','enemy stats'],'enemy_tables','Enemy stat tables'],[['starting stats','start stats','base stats'],'start_stat_total','Starting stat totals'],[['stat bonus','bonuses','stacking'],'stat_bonus_chain','Stat bonus stacking'],
[['damage','formula','math'],'final_damage','Final damage']];
var STX={verified:"checked and confirmed",hypothesis:"only a best guess so far, not confirmed",unknown:"not known yet"};
function mechReply(text){var mm=null;try{mm=W.__qaMech&&W.__qaMech.reply?W.__qaMech.reply(text):null;}catch(e){}if(mm)return mm;var z=' '+toks(text).join(' ')+' ',hit=null;
  for(var i=0;i<MECH.length&&!hit;i++)for(var j=0;j<MECH[i][0].length;j++)if(z.indexOf(' '+MECH[i][0][j]+' ')>=0){hit=MECH[i];break;}
  if(!hit)return card('Game math','what I can and cannot verify','Some rules are verified (stat bonuses, crit, armor, hit chances) and some are not known yet (enemy tables). Ask about one rule, or give me numbers (for example: 100 damage against 50% armor).',CH.slice(0,2));
  var st=MST[hit[1]]||'unknown',tail=st==='unknown'?'So I cannot answer this one yet, and I will not make something up.':st==='hypothesis'?'So any number I gave you would only be an estimate.':'Give me the numbers it needs and I will work it out.';
  return card(hit[2],'formula status',hit[2]+' is '+STX[st]+'. '+tail,CH.slice(0,2));}
var DIRECT={greeting:function(){return card('Hi','Buriedbornes 2 guide','Ask me about gear, skills, bosses, races, jobs or origins. For example: "best armor for tank" or "where do I get Lemegeton".',CH);},
 thanks:function(){return card('You are welcome','anything else?','You can follow up with things like "only 7\u2605", "what about fire instead" or "compare it with ...".',CH.slice(0,2));},
 about_bot:function(){return card('What I am','offline guide assistant','I read your question, work out what you are after (look up, compare, farm, build for a goal), then answer from this guide\u2019s own tables. I am not a chat AI: if the guide does not have it, I say so.',CH);},
 other:function(){return card('Outside this guide','I only know Buriedbornes 2','I can help with gear, skills, bosses, races, jobs and origins from this guide.',CH);}};
/* ---- counter finder: what does a threat do, and which gear text cancels it? (rules + the guide's own text) ---- */
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function skillRow(n){var r=(W.__qaStrat&&W.__qaStrat.rows)||[];for(var i=0;i<r.length;i++)if(r[i].n===n)return r[i];return null;}
function gearAbility(rx){var out=[];try{Object.keys(ITEM_DETAILS).forEach(function(k){var v=ITEM_DETAILS[k],ab=(v.ability?[v.ability]:[]).concat(v.abilities||[]);
  ab.forEach(function(a){if(a&&rx.test(a.description||''))out.push({item:k,stars:v.stars||0,name:a.name,text:String(a.description).replace(/\s+/g,' ').trim()});});});}catch(e){}return out;}
function gearStat(rx){var out=[];try{Object.keys(ITEM_DETAILS).forEach(function(k){var v=ITEM_DETAILS[k];(v.stats||[]).forEach(function(s){
  if(s&&rx.test(s.name||''))out.push({item:k,name:s.name,val:parseFloat(String(s.value).replace(/[^0-9.\-]/g,''))||0,shown:s.value,desc:String(s.description||'').replace(/\{\{([^}|]*)[^}]*\}\}/g,'$1').replace(/\s+/g,' ').trim()});});});}catch(e){}return out;}
function topStat(rx,n){var l=gearStat(rx).sort(function(a,b){return b.val-a.val;}),seen={},o=[];l.forEach(function(x){if(!seen[x.item]&&o.length<n){seen[x.item]=1;o.push(x);}});return o;}
var SURV=/\b(surviv(e|es|ing)|withstand\w*|counter\w*|protect(s|ion)? (me|myself|against|from)|prevent\w*|live through|not die|avoid dying|stop dying|resist(s|ing)?|defen[cs]e against|deal with|shrug off)\b/i;
function threatReply(raw,name){var row=skillRow(name);if(!row)return null;
  var t=String(row.t||'').replace(/\s+/g,' '),el=row.el||'',stackLoss=/lose\s*\d*\s*HP\s*stack/i.test(t),
      big=/one.?shot|instant|\bdies?\b|massive|huge|big hit|burst/i.test(raw)||(row.mult||0)>=1000,i;
  var what=(row.mult?Number(row.mult).toLocaleString('en-US')+'% ':'')+(el?el+' ':'')+'damage'+(stackLoss?', and then the target loses HP stacks':'');
  var L=['<b>What it does (guide text):</b> '+esc(name)+' = '+esc(what)+'.'],chips=[];
  if(stackLoss)L.push(name==='Lemegeton'?'<b>Player-reported (HYPOTHESIS, not in the guide text):</b> power runes raise how many stacks it removes, enough to wipe even a full 9-stack buffer (about 1 + 2 per extra 100% power).':'How many stacks this removes with power runes is not in the guide text, so I cannot say.');
  var strong=[];
  if(stackLoss)strong=strong.concat(gearAbility(/ignore\s+HP\s+stack\s+reduction/i));
  if(stackLoss||big)strong=strong.concat(gearAbility(/will not die even if your HP and HP stacks reach 0/i));
  if(strong.length){L.push('<b>Best answers (their unique abilities cancel it):</b>');
    strong.forEach(function(x){L.push('\u2022 <b>'+esc(x.item)+'</b> ('+x.stars+'\u2605), '+esc(x.name)+': \u201c'+esc(x.text)+'\u201d');chips.push([esc(x.item),esc('tell me about '+x.item)]);});}
  var part=[],s;
  if(el){s=topStat(new RegExp('^Resist: '+el+'$','i'),3);if(s.length)part.push('<b>Resist: '+esc(el)+'</b>, e.g. '+s.map(function(x){return esc(x.item)+' '+esc(x.shown);}).join(', ')+'. '+esc(s[0].desc));}
  if(big){s=topStat(/^Resist: Large Damage$/i,3);if(s.length)part.push('<b>Resist: Large Damage</b>, e.g. '+s.map(function(x){return esc(x.item)+' '+esc(x.shown);}).join(', ')+'. '+esc(s[0].desc));}
  if(stackLoss){s=topStat(/^Guts$/i,3);if(s.length)part.push('<b>Guts</b>, e.g. '+s.map(function(x){return esc(x.item)+' '+esc(x.shown);}).join(', ')+'. '+esc(s[0].desc));}
  if(part.length){L.push('<b>Helps, but not enough on its own:</b>');part.forEach(function(x){L.push('\u2022 '+x);});}
  if(!strong.length&&!part.length)L.push('I do not see gear text in the guide that cancels this.');
  if(stackLoss)L.push('<b>Will not help:</b> more Max HP Stacks or Stack Refill, because the skill removes the stacks first (HYPOTHESIS: follows from the text).');
  L.push('<i>This is an estimate from the guide\u2019s own text. I cannot compute the exact survive-or-die result: the hit-damage rule and enemy tables are not known yet.</i>');
  return card('Surviving '+esc(name),'counter finder \u00b7 from the guide\u2019s own text',L.join('<br><br>'),chips.slice(0,3));}
/* ---- routing ---- */
function cap(s){return s;}
function routeBuild(sl){if(!sl.goal)return null;var star=sl.star?sl.star+' ':'';
  if(sl.slot==='skills')return firstGood(['best skills for '+sl.goal,'skills for a '+sl.goal+' build']);
  var slot=sl.slot&&sl.slot!=='gear'?sl.slot:'gear';return firstGood(['best '+star+slot+' for '+sl.goal,slot+' for a '+sl.goal+' build','gear for a '+sl.goal+' build']);}
function route(c,sl,raw){var it=c.intent,e=sl.ents,r,note;
  if(it==='build_goal'||it==='skill_goal'||(it==='strategy_vague'&&sl.goal)){if(it==='skill_goal'&&!sl.slot)sl.slot='skills';r=routeBuild(sl);
    if(r){S.build={slot:sl.slot||'gear',goal:sl.goal,star:sl.star};return {q:r,note:'a build question, goal: '+sl.goal+(sl.slot?', slot: '+sl.slot:'')};}return null;}
  if(it==='refine'&&S.build&&!sl.neg){var m={slot:sl.slot||S.build.slot,goal:sl.goal||S.build.goal,star:sl.star||S.build.star};r=routeBuild(m);
    if(r){S.build=m;return {q:r,note:'a follow-up to your last build question ('+m.goal+', '+m.slot+(m.star?', '+m.star:'')+')'};}return null;}
  if(it==='beginner_pick'&&sl.kind){r=firstGood(['which '+sl.kind+' is best for a beginner','best '+sl.kind+' for beginners']);return r?{q:r,note:'a beginner pick, kind: '+sl.kind}:null;}
  if(it==='compare'&&e.length>=2){r=firstGood(['compare '+e[0]+' and '+e[1]]);return r?{q:r,note:'a comparison'}:null;}
  if(it==='farm'&&e.length){r=firstGood(['where do I farm '+e[0],'which boss drops '+e[0]]);return r?{q:r,note:'a where-to-get question'}:null;}
  if(it==='boss_loot'&&e.length){r=firstGood(['what does '+e[0]+' drop',e[0]+' drops','tell me about '+e[0]]);return r?{q:r,note:'a boss loot question'}:null;}
  if(it==='entity_stat'&&e.length&&sl.stat){r=firstGood([e[0]+' '+sl.stat,'what is the '+sl.stat+' of '+e[0]]);return r?{q:r,note:'a stat question about '+e[0]}:null;}
  if(it==='lookup'&&e.length){r=firstGood(['tell me about '+e[0],'how does '+e[0]+' work',e[0]]);return r?{q:r,note:'a look-up of '+e[0]}:null;}
  if(it==='simulate'&&e.length){r=firstGood(['tell me about '+e[e.length-1],'tell me about '+e[0]]);
    return r?{q:r,note:'a stats question. I can show the listed stats; name a race, a job and an origin together and I add them up'}:null;}
  return null;}
function decide(raw,base){var c=classify(raw),sl=slotsOf(raw),weak=!good(base),res=base;
  /* a skill named together with "survive / counter / withstand ...": match what it does against what the gear text cancels */
  if(SURV.test(raw)){for(var ti=0;ti<sl.ents.length;ti++){if(skillRow(sl.ents[ti])){var th=threatReply(raw,sl.ents[ti]);if(th){pending={html:th,t:Date.now()};S.last='survive_threat';return raw;}break;}}}
  try{var mh=W.__qaMech&&W.__qaMech.handle?W.__qaMech.handle(raw,c,sl):null;if(mh){var af=mh.indexOf('<!--after-->')===0;pending={html:af?mh.slice(12):mh,after:af,t:Date.now()};S.last=c.intent;return af?base:raw;}}catch(e){}
  if(c.intent==='build_goal'||c.intent==='skill_goal'){if(sl.goal&&!weak){S.build={slot:c.intent==='skill_goal'?'skills':(sl.slot||'gear'),goal:sl.goal,star:sl.star};}}
  /* the engine is known to answer these three confidently but wrongly ("start" read as skills, formulas answered with gear), so a sure intent wins */
  if(!weak&&c.conf>=0.8){
    if(c.intent==='mechanic'&&!sl.ents.length){pending={html:mechReply(raw),t:Date.now()};S.last=c.intent;return raw;}
    if((c.intent==='beginner_pick'&&sl.kind)||(c.intent==='simulate'&&sl.ents.length)){var ov=route(c,sl,raw);if(ov){pending={note:'I read this as '+ov.note+'.',t:Date.now()};S.last=c.intent;return ov.q;}}}
  if(!weak||c.conf<0.55){S.last=c.intent;return base;}
  if(DIRECT[c.intent]&&c.conf>=0.7&&!sl.ents.length&&!sl.goal){pending={html:DIRECT[c.intent](),t:Date.now()};S.last=c.intent;return raw;}
  if(c.intent==='mechanic'&&c.conf>=0.6){pending={html:mechReply(raw),t:Date.now()};S.last=c.intent;return raw;}
  var r=route(c,sl,raw);
  if(r){pending={note:'I read this as '+r.note+'.',t:Date.now()};res=r.q;}
  else if(c.intent==='other'&&c.conf>=0.7&&!sl.ents.length&&!sl.goal){pending={html:DIRECT.other(),t:Date.now()};res=raw;}
  S.last=c.intent;return res;}
function apply(){if(!pending)return;var p=pending;pending=null;if(Date.now()-p.t>2500)return;
  if(p.after&&p.html){O.insertAdjacentHTML('beforeend',p.html);}else if(p.html){O.innerHTML=p.html;}
  else if(p.note){var d=document.createElement('div');d.className='qa-line';d.setAttribute('data-intent-note','1');d.style.cssText='font-size:12px;opacity:.75;margin:0 0 6px';d.textContent=p.note;O.insertBefore(d,O.firstChild);}}
new MutationObserver(function(){if(!pending)return;clearTimeout(tm);tm=setTimeout(apply,70);}).observe(O,{childList:true,subtree:true});
W.QA.pre.add('intent',70,function(n){prev=n;return function(raw){var base=prev?prev(raw):raw;if(raw!==I.value)return base;
  var key=raw+'#'+O.textContent.length+':'+O.textContent.slice(0,60);if(cache.key===key){if(cache.pend)pending={html:cache.pend.html,note:cache.pend.note,after:cache.pend.after,t:Date.now()};return cache.res;}
  var out=base;pending=null;try{out=decide(raw,base);}catch(e){out=base;}
  cache={key:key,res:out,pend:pending?{html:pending.html,note:pending.note,after:pending.after}:null};return out;};});
W.__qaIntent={classify:classify,slots:slotsOf,state:S,toks:toks,feats:feats};
})();
