/* ===== Ask core v2 (v149): ONE shared understanding of the question, used by every layer =====
   Problem (v148, tested): about 30 layers each split the question their own way and kept their own memory, so
   "what about 6 star" after an Okitsugu question went to an older summons question, "best gear for DEX build"
   found nothing, "which is better for a tank, A or B" got general tank rules, and a "1% drop chance" got a boss table.
   What this adds (nothing is removed; every other question still goes the old way, unchanged):
   1. QA.understand(text) -> ONE record: guide names found (with the v148 typo fixer), stars, slots, main stat,
      tank goal, "no / without", "A or B", a percent, a follow-up marker. QA.state.core2.last = the last REAL question.
   2. Plans, tried in order. A plan either REWRITES the question into one the old engine already answers well
      (follow-ups that change a filter), or builds its own card from the guide's data, often wrapped around the old
      engine's own answer (window.__qaAnswer), so the layers reinforce each other instead of competing.
   3. Hooks: the outermost __qaPre stage (order 1000) and window.__qaMulti (used by typed questions AND tapped chips).
      Own cards are marked data-keep, so the chat layer (Free talk) never swaps them for chat text.
   Test hooks: QA.understand(q), QA.core2.plan(q), QA.core2.last(). */
(function(){'use strict';
var W=window,D=document,QA=W.QA;if(!QA||!QA.pre||typeof ITEM_DETAILS==='undefined')return;
var S=QA.state.core2=QA.state.core2||{last:null,cur:null};
var SLOTS=['weapon','armor','accessory','skill'],SLN={weapon:'Weapons',armor:'Armor',accessory:'Accessories',skill:'Skills'};
var MAIN={STR:'STRength',DEX:'DEXterity',INT:'INTelligence',PIE:'PIEty'};
function N(s){return String(s||'').toLowerCase().replace(/[‘’']/g,'').replace(/[^a-z0-9★]+/g,' ').trim();}
function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function L(s){return String(s||'').split(',').map(function(x){return x.trim();}).filter(function(x){return x&&x!=='—';});}
function plain(s){return String(s||'').replace(/\{\{([^}|]+)(?:\|([^}|]+))?[^}]*\}\}/g,function(m,a,b){return b||a;}).replace(/\[\[|\]\]|%%|~~|@@|\^\^|\$\$|##/g,'');}
function ask(q){try{return W.__qaAnswer?W.__qaAnswer(q):'';}catch(e){return '';}}
/* the full offline answer a player would see for q: the engine card, then the add-on chain (build / strategy cards) */
function full(q){var h=ask(q);try{var tmp=D.createElement('div');tmp.innerHTML=h;if(W.__qaOnline)W.__qaOnline(q,tmp);return tmp.innerHTML;}catch(e){return h;}}
var FAIL=/I couldn.t match|could not pin down|cannot find this in the guide/i;
/* does the old engine (or its build / strategy add-on) already answer q? then the core leaves q alone */
function engineOK(q){if(!FAIL.test(ask(q)))return true;try{return !!(W.__qaStrat&&W.__qaStrat.detect&&W.__qaStrat.detect(q,true));}catch(e){return false;}}

/* ---------- one index of the guide (built once, on first use) ---------- */
var IX=null;
function index(){if(IX)return IX;
  var places=[],items={},names=[];
  [['Dungeon',DATA],['Disaster',CONQUEST],['Conquest',CONQUEST2],['Special',SPECIAL]].forEach(function(g){g[1].forEach(function(r){
    var p={name:r[0],type:g[0],cells:{}};places.push(p);
    SLOTS.forEach(function(s,i){p.cells[s]=[L(r[1+i*2]),L(r[2+i*2])];
      [0,1].forEach(function(k){p.cells[s][k].forEach(function(n){
        var key=N(n)+'|'+s,it=items[key];
        if(!it){it=items[key]={name:n,slot:s,stars:{},at:[]};}
        it.stars[k?7:6]=1;it.at.push({p:p,star:k?7:6});});});});});});
  function add(name,kind,ref){var n=N(name);if(n.length<3)return;names.push({n:n,name:name,kind:kind,ref:ref});}
  places.forEach(function(p){add(p.name,'place',p);});
  Object.keys(items).forEach(function(k){add(items[k].name,'item',items[k]);});
  Object.keys(ITEM_DETAILS).forEach(function(k){var n=k.replace(/::(weapon|armor|accessory|skill)$/,'');if(!names.some(function(x){return x.kind==='item'&&x.n===N(n);}))add(n,'item',{name:n,slot:'',stars:{},at:[]});});
  if(typeof SKILL_DETAILS!=='undefined')Object.keys(SKILL_DETAILS).forEach(function(k){if(!items[N(k)+'|skill'])add(k,'item',{name:k,slot:'skill',stars:{},at:[]});});
  Object.keys(STATS).forEach(function(k){add(k,'stat',STATS[k]);});
  Object.keys(TERMS).forEach(function(k){add(k,'term',TERMS[k]);});
  names.sort(function(a,b){return b.n.length-a.n.length;});
  IX={places:places,items:items,names:names};return IX;}
function detail(name){return ITEM_DETAILS[name]||ITEM_DETAILS[name+'::weapon']||ITEM_DETAILS[name+'::armor']||ITEM_DETAILS[name+'::accessory']||null;}
function lines(name){var d=detail(name);if(!d)return [];
  return (d.abilities||(d.ability?[d.ability]:[])).map(function(a){return {n:a.name,d:plain(a.description)};})
    .concat((d.stats||[]).map(function(s){return {n:s.name,d:''};}));}

/* ---------- 1. understanding: ONE record per question ---------- */
function scan(t){var pad=' '+t+' ',used=[],out=[];
  index().names.forEach(function(c){var i=pad.indexOf(' '+c.n+' ');
    while(i>=0){var a=i,b=i+c.n.length+1;
      if(!used.some(function(u){return a<u[1]&&b>u[0];})){used.push([a,b]);out.push({name:c.name,kind:c.kind,ref:c.ref,at:a});break;}
      i=pad.indexOf(' '+c.n+' ',i+1);}});
  return out.sort(function(x,y){return x.at-y.at;});}
function understand(raw){
  var fixed=raw;try{if(W.__qaNameTypo)fixed=W.__qaNameTypo(raw)||raw;}catch(e){}
  var t=N(fixed),low=String(fixed).toLowerCase(),u={raw:raw,fixed:fixed,t:t,names:scan(t),stars:[],slots:[],stat:null,goal:null};
  var m,re=/(?:^| )([67]) ?(?:★|stars?)(?= |$)|(?:^| )(six|seven) ?stars?(?= |$)/g;
  while((m=re.exec(t))){var s=m[1]?+m[1]:(m[2]==='six'?6:7);if(u.stars.indexOf(s)<0)u.stars.push(s);}
  if(/\b(weapons?)\b/.test(t))u.slots.push('weapon');if(/\b(armou?rs?)\b/.test(t))u.slots.push('armor');
  if(/\b(accessor(?:y|ies))\b/.test(t))u.slots.push('accessory');if(/\b(skills?|skill books?)\b/.test(t))u.slots.push('skill');
  if(!u.slots.length&&/\b(gear|equipment|equips?)\b/.test(t))u.slots=['weapon','armor','accessory'];
  m=/\b(str|strength|dex|dexterity|int|intelligence|pie|piety)\b/.exec(t);
  if(m)u.stat={s:'STR',t:'STR',d:'DEX',i:'INT',p:'PIE'}[m[1].charAt(0)];
  if(/\b(tank|tanky|tanking|defen[cs]e|defensive|survive|survival)\b/.test(t))u.goal='tank';
  u.neg=/\b(no|not|without|lacks?|lacking|missing|none|doesnt|dont|except|zero)\b/.test(t);
  u.cmp=/\b(or|vs|versus|better|which one)\b/.test(t);
  m=/(\d+(?:\.\d+)?)\s*(?:%|percent)/.exec(low);if(m)u.pct=+m[1];
  m=/\b1 in (\d+)\b/.exec(t);if(m&&!u.pct)u.pct=100/ +m[1];
  m=/\b(?:in|after|over|with) (\d+) (?:runs?|tries|attempts|kills|clears|times)\b/.exec(t);if(m)u.runs=+m[1];
  u.follow=/^(?:and |ok |okay |so |now )?(?:what|how) about\b|^(?:and|also|same for|now|only|just)\b/.test(t);
  u.kinds=function(k){return u.names.filter(function(x){return x.kind===k;});};
  return u;}

/* ---------- small card helpers (the page's own card markup) ---------- */
function card(title,sub,body,tag){return '<div class="qa-card" data-keep="1" data-core2="'+tag+'"><div class="qa-title">'+title+(sub?'<span class="qa-sub">'+E(sub)+'</span>':'')+'</div>'+body+'</div>';}
function line(h){return '<div class="qa-line">'+h+'</div>';}
function lead(h){return '<div class="qa-lead">'+h+'</div>';}
function note(h){return '<div class="qa-note">'+h+'</div>';}
function chips(list){return list.length?'<div class="qa-ex">'+list.map(function(c){return '<button type="button" class="qa-exbtn" data-ex="'+E(c[1])+'">'+E(c[0])+'</button>';}).join('')+'</div>':'';}
function itemChip(it,star){var s=star||(it.stars&&it.stars[7]?7:6);return '<span class="item qa-chip s'+s+'" data-item="'+E(it.name)+'" data-slot="'+E(it.slot||'')+'">'+E(it.name)+'</span>';}
function placeChip(p){return '<a href="#" class="idx-link qa-chip qa-boss" data-q="'+E(p.name)+'">'+E(p.name)+'</a>';}
function where(it){var real=it.at.filter(function(a){return a.p.type!=='Special';});
  if(!real.length)return it.at.length?'special dungeon only':'not in the drop tables';
  return real.slice(0,2).map(function(a){return E(a.p.name);}).join(', ')+(real.length>2?' +'+(real.length-2):'');}
function pctS(x){return x>=99.95?'over 99.9':x<0.05?'under 0.1':(Math.round(x*10)/10).toString();}

/* ---------- 2. plans ---------- */
/* a. drop-chance maths: how many runs for X % */
function runsCard(u){var p=u.pct/100;if(!(p>0&&p<1))return null;
  var need=function(c){return Math.ceil(Math.log(1-c)/Math.log(1-p));};
  var h=lead('With a <b>'+E(u.pct)+'%</b> chance per run, you need about:')+
    [50,90,95,99].map(function(c){return line('<b>'+need(c/100).toLocaleString('en-US')+'</b> runs for a '+c+'% chance of at least one drop');}).join('');
  var at=[u.runs||0,10,50,100,300].filter(function(n,i,a){return n>0&&a.indexOf(n)===i;}).slice(0,4);
  h+=line('<span class="qa-lab">Chance of at least one drop</span> '+at.map(function(n){return 'in '+n+' runs: <b>'+pctS(100*(1-Math.pow(1-p,n)))+'%</b>';}).join(' · '));
  h+=note('Each run is a new roll, so earlier dry runs do not raise the next chance. Maths: 1 − (1 − chance)<sup>runs</sup>.');
  return card('Runs for a '+E(u.pct)+'% drop','drop maths',h,'runs')+chips([['How do drops work?','How do drops work?'],['What is Capture?','What is Capture?']]);}
/* b. which places have NO 7-star skill (etc.) */
function noneCard(u){var ix=index(),types=[];
  if(/\bdungeons?\b/.test(u.t))types.push('Dungeon');if(/\bdisasters?\b/.test(u.t))types.push('Disaster');if(/\bconquests?\b/.test(u.t))types.push('Conquest');
  if(!types.length)types=['Dungeon','Disaster','Conquest'];
  var stars=u.stars.length?u.stars:[6,7],slots=u.slots,ps=ix.places.filter(function(p){return types.indexOf(p.type)>=0;});
  var miss=ps.filter(function(p){return slots.every(function(s){return stars.every(function(st){return !p.cells[s][st===7?1:0].length;});});});
  var what=stars.map(function(s){return s+'★';}).join(' or ')+' '+slots.map(function(s){return SLN[s].toLowerCase();}).join(' / ');
  var one=stars.map(function(s){return s+'★';}).join(' or ')+' '+slots.join(' / ');
  var grp=types.map(function(t){return t.toLowerCase()+'s';}).join(', ');
  var h=miss.length?lead('<b>'+miss.length+'</b> of '+ps.length+' '+grp+' list no '+E(what)+':')+line(miss.map(placeChip).join(''))
    :lead('<b>None.</b> All '+ps.length+' '+E(grp)+' list at least one '+E(one)+' in the tables.');
  return card('No '+E(what),'checked every row',h,'none');}
/* c. gear for a main stat (DEX build etc.) + where to farm it */
function statItems(st){var ix=index(),full=MAIN[st],re=new RegExp('^'+st+' Mastery$|'+full+'|Almighty','i'),out=[];
  Object.keys(ix.items).forEach(function(k){var it=ix.items[k];if(it.slot==='skill')return;
    var hit=lines(it.name).filter(function(l){return re.test(l.n);}).map(function(l){return l.n;});
    if(hit.length)out.push({it:it,hit:hit,s7:it.stars[7]?1:0});});
  return out.sort(function(a,b){return b.s7-a.s7||b.hit.length-a.hit.length||a.it.name.localeCompare(b.it.name);});}
function farmRank(list){var c={};list.forEach(function(x){x.it.at.forEach(function(a){if(a.p.type==='Special')return;var k=a.p.name;(c[k]=c[k]||{p:a.p,n:0,s7:0}).n++;if(a.star===7)c[k].s7++;});});
  return Object.keys(c).map(function(k){return c[k];}).sort(function(a,b){return b.n-a.n||b.s7-a.s7||a.p.name.localeCompare(b.p.name);});}
function statCard(u,farmFirst){var st=u.stat,list=statItems(st);if(!list.length)return null;
  var rank=farmRank(list).slice(0,6),h='';
  var farm=rank.length?'<div class="qa-slot"><b>Where to farm</b>'+rank.map(function(r){return line(placeChip(r.p)+' <span class="qa-sub">'+E(r.p.type.toLowerCase())+'</span> · '+r.n+' '+st+' piece'+(r.n===1?'':'s')+(r.s7?' ('+r.s7+' at 7★)':''));}).join('')+'</div>':'';
  if(farmFirst)h+=farm;
  ['weapon','armor','accessory'].forEach(function(s){var l=list.filter(function(x){return x.it.slot===s;}).slice(0,6);if(!l.length)return;
    h+='<div class="qa-slot"><b>'+SLN[s]+'</b>'+l.map(function(x){return line(itemChip(x.it)+' '+x.hit.map(E).join(', ')+' <span class="qa-sub">'+where(x.it)+'</span>');}).join('')+'</div>';});
  if(!farmFirst)h+=farm;
  h+=note('Pieces whose stats include '+E(MAIN[st])+', '+st+' Mastery or Almighty, 7★ first. "Where to farm" counts how many of them each boss row lists.');
  return card(E(st)+' build','gear from the guide’s own tables',lead(list.length+' pieces carry '+E(MAIN[st])+' or '+({STR:'an',DEX:'a',INT:'an',PIE:'a'}[st])+' '+st+' bonus.')+h,'stat');}
/* d. vague "what should I farm" -> ask which build, with tap choices */
function farmAsk(){return card('Where to farm','I read this as: where should I farm',
    lead('That depends on your build. Pick one and I will rank the bosses for it:')+
    chips([['STR build','Where should I farm for a STR build'],['DEX build','Where should I farm for a DEX build'],['INT build','Where should I farm for an INT build'],['PIE build','Where should I farm for a PIE build'],['Most 7★ drops','Which dungeon drops the most 7 star items']])+
    note('Or name an item: "where do I farm Bianca’s Staff".'),'farmask');}
/* e. A or B for a goal: the old compare card + what each one has for that goal */
var TANK=/shield|resist|max hp|hp stack|parry|guts|armor|barrier|protection|defen|evasion|toughness/i;
function cmpCard(u,its){var a=its[0].name,b=its[1].name,html=ask('compare '+a+' and '+b);if(!html||FAIL.test(html))return null;
  if(u.goal!=='tank')return html;
  var c=[a,b].map(function(n){return {n:n,h:lines(n).filter(function(l){return TANK.test(l.n)||TANK.test(l.d);}).map(function(l){return l.n;})};});
  var h=lead('Tank stats on each (from the guide’s tooltips):')+c.map(function(x){return line('<b>'+E(x.n)+'</b> · '+(x.h.length?x.h.map(E).join(', '):'none')+' <span class="qa-sub">('+x.h.length+')</span>');}).join('');
  h+=note(c[0].h.length===c[1].h.length?'Same number of tank stats; the values are hidden in the tooltips (+??), so pick by the stats you need.':
    E((c[0].h.length>c[1].h.length?c[0]:c[1]).n)+' has more tank stats. The values are hidden in the tooltips (+??), so this is a count, not a full verdict.');
  return card('For a tank: '+E(a)+' or '+E(b),'tank check',h,'cmp')+html;}
/* f. "is X good": what its stats point to + its card + where it drops */
var TAGS=[['tank',TANK],['physical damage',/^(?!.*resist).*physical/i],['magic damage',/^(?!.*resist).*magical/i],['STR build',/STRength|STR Mastery|Almighty/i],['DEX build',/DEXterity|DEX Mastery|Almighty/i],['INT build',/INTelligence|INT Mastery|Almighty/i],['PIE build',/PIEty|PIE Mastery|Almighty/i],['healing',/heal/i],
  ['crit',/crit/i],['burn',/burn/i],['frostbite',/frost/i],['electric',/electri|thunder|lightning/i],['poison',/poison/i],['bleed',/bleed/i],['summons',/summon|minion/i],
  ['loot',/looting|rarity|gold|soulstone|appraisal/i],['crafting',/craftsmanship|crafting/i],['speed / extra actions',/haste|additional action|quick|cooldown/i],['skill uses',/uses|replenish/i]];
function goodCard(u,it){var ls=lines(it.name);var tags=TAGS.filter(function(t){return ls.some(function(l){return t[1].test(l.n)||t[1].test(l.d);});}).map(function(t){return t[0];});
  var eff=ask('what does '+it.name+' do');if(FAIL.test(eff))eff='';
  var real=it.at.filter(function(a){return a.p.type!=='Special';}),sp=it.at.length&&!real.length;
  var h=lead(tags.length?'Its stats point to: <b>'+tags.slice(0,5).map(E).join(', ')+'</b>.':'Its stats do not point to one clear build.')+
    (it.at.length?line('<span class="qa-lab">Where</span> '+(sp?'only in a special dungeon (Crystal Beach, Trial)':real.slice(0,4).map(function(a){return placeChip(a.p);}).join('')+(real.length>4?' +'+(real.length-4)+' more':''))):'')+
    note('The guide has no ratings, so "good" depends on your build. This reading comes from its stats and abilities.');
  return card('Is '+E(it.name)+' good?','read from its stats',h,'good')+eff;}
/* g. "max / cap" of a stat: lead with the number from its own tooltip */
function maxCard(u){var cand=u.names.filter(function(x){return x.kind==='stat'||x.kind==='term';});
  if(/\bhp stacks?\b/.test(u.t)&&STATS['Max HP Stacks'])cand.unshift({name:'Max HP Stacks',ref:STATS['Max HP Stacks']});
  for(var i=0;i<cand.length;i++){var d=String(cand[i].ref&&cand[i].ref.description||''),m=/\(Max:?\s*([^)]+)\)/.exec(d);
    if(m){var v=plain(m[1]).trim(),rest=full(u.q||u.fixed);
      return card(E(cand[i].name)+': max <b>'+E(v)+'</b>','from its tooltip',lead('The highest value is <b>'+E(v)+'</b>, as its in-game tooltip says. Details below.'),'max')+(FAIL.test(rest)?'':rest);}}
  return null;}
/* h. crafting advice: be honest, then show what the guide does have */
function craftCard(u,q){var rest=full(q||u.fixed);
  return card('What to craft','not in the guide',lead('The guide has <b>no crafting recipes or costs</b>, so it cannot tell you what to craft.')+
    line('What it does have: gear for crafting and mods, listed below. Pieces with <b>Craftsmanship</b> get stronger each time you level up.'),'craft')+(FAIL.test(rest)?'':rest);}
/* i. a status term with a one-line text: add what boosts it and how to resist it */
function termCard(u,tm,q){var base=full(q||u.fixed);if(!base||FAIL.test(base))return null;var w=N(tm.name);
  var rel=Object.keys(STATS).filter(function(k){return (' '+N(k)+' ').indexOf(' '+w+' ')>=0;}).slice(0,6);
  if(!rel.length)return null;
  return base+card('More about '+E(tm.name),'related in the guide',lead('Stats that change '+E(tm.name)+':')+chips(rel.map(function(k){return [k,'Which items give '+k+'?'];}))+
    note('Want to avoid it instead?')+chips([['How do I resist '+tm.name+'?','How do I resist '+tm.name]]),'term');}
/* j. "what is good against <boss>": say what the guide cannot know, then what it has */
function againstCard(u,p){var base=full(p.name);
  return card('Against '+E(p.name),'what the guide knows',lead('The guide does not list how bosses fight (their skills, damage types or weaknesses), so it cannot say what works best against '+E(p.name)+'.')+
    line('What it has: the gear and skills '+E(p.name)+' drops (below), and general help:')+
    chips([['How do I survive longer?','How can I survive longer'],['How do I deal more damage?','How can I deal more damage']]),'against')+(FAIL.test(base)?'':base);}

function plan(raw,prev){var u=understand(raw),it=u.kinds('item'),pl=u.kinds('place'),t=u.t;
  var gearish=it.filter(function(x){return x.ref&&(x.ref.slot||detail(x.name));});
  if(u.pct&&!pl.length&&!it.length&&/\b(runs?|tries|attempts|kills|clears|times|farm|how many|how long|chance|odds)\b/.test(t))return {u:u,own:function(){return runsCard(u);}};
  if(u.neg&&u.slots.length&&!pl.length&&!it.length&&/\b(which|what|any|list|show)\b/.test(t)&&/\b(dungeons?|disasters?|conquests?|bosses?|places?|where)\b/.test(t))return {u:u,own:function(){return noneCard(u);}};
  /* a follow-up names no item or place; a bare slot word (armor, skills ...) is the slot, not the Armor rule */
  var named=u.names.filter(function(x){return !/^(armou?rs?|weapons?|accessor(?:y|ies)|skills?|gear|equipment)$/.test(N(x.name));});
  if(u.follow&&(u.stars.length||u.slots.length)&&!named.length&&!u.stat&&prev&&prev.u&&prev.u.kinds('place').length){
    var q=prev.q,st=u.stars[0];
    if(st){q=/(?:\b[67] ?(?:★|stars?)|\b[67]★|\b(?:six|seven) ?stars?)/i.test(q)?q.replace(/(?:\b[67] ?(?:★|stars?)|\b[67]★|\b(?:six|seven) ?stars?)/ig,st+' star'):q+' '+st+' star';}
    if(u.slots.length&&u.slots.length<3){var sw=u.slots.map(function(s){return {weapon:'weapons',armor:'armor',accessory:'accessories',skill:'skills'}[s];}).join(' and ');
      var SW=/\b(weapons?|armou?rs?|accessor(?:y|ies)|skills?|gear|equipment|stuff|items?)\b/i;
      q=SW.test(q)?q.replace(SW,sw):/\bdrops?\b/i.test(q)?q.replace(/\bdrops?\b/i,sw+' drop'):q+' '+sw;}
    return {u:u,rewrite:q};}
  if(u.stat&&!it.length&&!pl.length&&!/\b(what is|what does|whats|mean|means)\b/.test(t)){
    var farmQ=/\b(farm|farming|grind|dungeons?|where|which boss|bosses)\b/.test(t);
    if(farmQ)return {u:u,own:function(){return statCard(u,true);}};
    if(/\b(build|gear|weapons?|armou?rs?|accessor(?:y|ies)|equipment|items?)\b/.test(t)&&!engineOK(u.fixed))return {u:u,own:function(){return statCard(u,false);}};}
  if(/\b(farm|farming|grind|grinding)\b/.test(t)&&!u.names.length&&!u.stat&&!u.goal&&!u.stars.length&&!u.slots.length&&/\b(what|where|which|should)\b/.test(t))return {u:u,own:farmAsk};
  if(gearish.length>=2&&u.cmp&&!/\bcompare\b/.test(t))return {u:u,own:function(){return cmpCard(u,gearish);}};
  if(gearish.length===1&&it.length===1&&/^(is|are)\b/.test(t)&&/\b(good|worth|strong|useful|decent|bad|op|any good)\b/.test(t))return {u:u,own:function(){return goodCard(u,gearish[0].ref.slot?gearish[0].ref:{name:gearish[0].name,slot:'',stars:{},at:[]});}};
  if(/\b(max|maximum|cap|capped|limit|at most|upper limit|highest)\b/.test(t)&&(/\bhp stacks?\b/.test(t)||u.names.some(function(x){return x.kind==='stat'||x.kind==='term';}))&&!it.length)return {u:u,own:function(q){u.q=q;return maxCard(u);}};
  if(/\bcraft(?:ing|ed)?\b/.test(t)&&/\b(what|which)\b/.test(t)&&/\b(should|best|recommend|worth|first)\b/.test(t))return {u:u,own:function(q){return craftCard(u,q);}};
  var tm=u.kinds('term');
  if(tm.length===1&&u.names.length===1&&/\b(what (?:does|do|is|s)|whats|explain|mean)\b/.test(t)&&plain(tm[0].ref.description).length<60)return {u:u,own:function(q){return termCard(u,tm[0],q);}};
  if(pl.length===1&&!it.length&&/\b(good against|good vs|beat|beating|counter|kill|weak(?:ness|nesses)?|strategy|how to win)\b/.test(t))return {u:u,own:function(){return againstCard(u,pl[0].ref);}};
  return {u:u};}

/* ---------- 3. hooks ---------- */
var inp=D.getElementById('qaInput');
QA.pre.add('core2',1000,function(next){return function(raw){
  var real=!!(inp&&raw===inp.value),p;
  try{p=plan(raw,S.last);}catch(e){p={u:null};}
  var q=next(p.rewrite||raw);
  /* after a rewritten follow-up, remember the FULL question, so the next follow-up ("only skills") still knows the place */
  if(real){S.cur={raw:raw,q:q,plan:p};S.last={raw:raw,q:q,u:p.rewrite?understand(p.rewrite):p.u};}
  return q;};});
var prevMulti=W.__qaMulti;
W.__qaMulti=function(q,a){
  var c=S.cur;
  if(c&&c.q===q&&c.plan&&c.plan.own){S.cur=null;var h=null;try{h=c.plan.own(q);}catch(e){h=null;}if(h){S.shown={raw:c.raw,fixed:c.plan.u?c.plan.u.fixed:c.raw,at:Date.now()};return h;}}
  return prevMulti?prevMulti(q,a):null;};
if(QA.first)QA.first('core2',function(raw,e){
  var p;try{p=plan(raw,S.last);}catch(x){return false;}
  if(!p.own&&!p.rewrite)return false;
  if(e.type==='keydown'){if(e.isComposing||e.keyCode===229)return false;e.preventDefault();}
  QA.state.orig=raw;W.__qaOrig=raw;
  try{QA.run();}catch(err){setTimeout(function(){throw err;},0);}
  return true;},{ime:false});
/* an own card answers the question as the player typed it: drop the inner layers' "Understood as" rewrite
   (e.g. "gear for a durable build"); keep it only for a spelling fix */
QA.shape.add('core2_note',1000,function(next){return function(el){var r=next.apply(this,arguments);
  try{var sh=S.shown;S.shown=null;if(sh&&el&&el.querySelector('[data-core2]')){var n=el.firstElementChild;
    if(n&&n.classList.contains('qa-note')&&/^Understood as:/.test(n.textContent)){
      if(sh.fixed&&sh.fixed!==sh.raw)n.innerHTML='Understood as: <b>'+E(sh.fixed)+'</b>';else n.parentNode.removeChild(n);}}}catch(e){}
  return r;};});
QA.understand=understand;
QA.core2={plan:function(q){var p=plan(q,S.last);return {rewrite:p.rewrite||null,own:!!p.own,u:p.u};},last:function(){return S.last;},
  html:function(q){var p=plan(q,S.last);if(!p.own)return null;try{return p.own(W.__qaPre?W.__qaPre(q):q);}catch(e){return 'ERROR '+e;}}};
})();
