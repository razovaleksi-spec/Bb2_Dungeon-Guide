
/* ===== Ask a question (offline, answers from the tables above) ===== */
(function(){
'use strict';
var SLOTS=['weapon','armor','accessory','skill'];
var SL={weapon:'Weapons',armor:'Armor',accessory:'Accessories',skill:'Skills'};
var qe=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
var L=function(s){return (s||'').split(',').map(function(x){return x.trim();}).filter(function(x){return x&&x!=='\u2014';});};
var norm=function(s){return String(s).toLowerCase().replace(/[\u2018\u2019']/g,'').replace(/[^a-z0-9]+/g,' ').trim();};
/* Items whose names differ only by letter case but are different items (the two Umbilical cords): keep them apart. */
var CASEDUP={};
(function(){if(typeof ITEM_DETAILS==='undefined')return;var g={};
  Object.keys(ITEM_DETAILS).forEach(function(k){var n=k.replace(/::(weapon|armor|accessory|skill)$/,''),z=norm(n);(g[z]=g[z]||{})[n]=1;});
  Object.keys(g).forEach(function(z){var ns=Object.keys(g[z]);if(ns.length>1)ns.forEach(function(n){CASEDUP[n]=1;});});})();
var ik=function(n){return CASEDUP[n]?norm(n)+'#'+n:norm(n);};
var cmp=function(a,b){return a.localeCompare(b,'en',{sensitivity:'base',ignorePunctuation:true});};
var GROUPS=[['Dungeon','Dungeons',DATA],['Disaster','Disasters',CONQUEST],['Conquest','Conquests',CONQUEST2],['Special','Special dungeons',SPECIAL]];
var PLURAL={Dungeon:'dungeons',Disaster:'disasters',Conquest:'conquests',Special:'special dungeons'};

var bosses=[];
GROUPS.forEach(function(g){g[2].forEach(function(r){
  var lists={};SLOTS.forEach(function(s,i){lists[s]=[L(r[1+i*2]),L(r[2+i*2])];});
  bosses.push({name:r[0],type:g[0],lists:lists});
});});
var real=bosses.filter(function(b){return b.type!=='Special';});
var items=new Map();
bosses.forEach(function(b){SLOTS.forEach(function(s){[0,1].forEach(function(k){b.lists[s][k].forEach(function(n){
  var key=ik(n)+'|'+s,it=items.get(key);
  if(!it){it={name:n,slot:s,stars:new Set(),bosses:[],special:false};items.set(key,it);}
  it.stars.add(k?7:6);
  if(b.type==='Special'){it.special=true;}else if(it.bosses.indexOf(b)<0){it.bosses.push(b);}
});});});});

var cands=[];
items.forEach(function(it){cands.push({n:norm(it.name).replace(/^the /,''),kind:'item',it:it});});
bosses.forEach(function(b){cands.push({n:norm(b.name).replace(/^the /,''),kind:'boss',b:b});});
cands.sort(function(a,b){return b.n.length-a.n.length;});

/* ---------- tooltip data (equipment, skills, stats, terms) ---------- */
var HAS_ITEM_DETAILS=(typeof ITEM_DETAILS!=='undefined'),HAS_SKILLS=(typeof SKILL_DETAILS!=='undefined'),HAS_TERMS=(typeof TERMS!=='undefined');
var byNorm={};
items.forEach(function(it){var k=norm(it.name);(byNorm[k]=byNorm[k]||[]).push(it);});
var EQ=[],EQN={};
if(HAS_ITEM_DETAILS){Object.keys(ITEM_DETAILS).forEach(function(key){
  var d=ITEM_DETAILS[key],name=key.replace(/::(weapon|armor|accessory|skill)$/,''),list=byNorm[norm(name)]||[];
  var abil=(d.abilities||(d.ability?[d.ability]:[])).map(function(a){return {n:a.name,c:a.color||'#ffa63d',d:a.description||'',kind:'ability',v:''};});
  var sts=(d.stats||[]).map(function(s){return {n:s.name,c:s.color||'#5fd0ff',d:s.description||'',kind:'stat',v:(s.masked||s.value||'')};});
  var e={key:key,name:name,d:d,it:(list.filter(function(x){return x.name===name;})[0]||list[0]||null),stars:d.stars||0,abil:abil,stats:sts,all:abil.concat(sts)};
  EQ.push(e);EQN[ik(name)]=e;
});}
var SKD={};
if(HAS_SKILLS){Object.keys(SKILL_DETAILS).forEach(function(k){SKD[norm(k)]=k;});}
var STAT={};
EQ.forEach(function(e){e.all.forEach(function(s){
  var k=norm(s.n),o=STAT[k];
  if(!o){o=STAT[k]={key:k,n:s.n,kind:s.kind,c:s.c,d:s.d,eq:[]};}
  if(o.eq.indexOf(e)<0)o.eq.push(e);
});});
var STATKEYS=Object.keys(STAT);
var TERMK={};
if(HAS_TERMS){Object.keys(TERMS).forEach(function(k){TERMK[norm(k)]=k;});}

/* Common short forms people type for stats (only used when the target stat exists). */
var STAT_ALIAS={'hp':'max hp','health':'max hp','hit points':'max hp','str':'strength','int':'intelligence','dex':'dexterity','pie':'piety','crit':'critical','crits':'critical','critical hit':'critical','dodge':'evasion','evade':'evasion','evasive':'evasion',
  'magic resist':'resist magical','magic resistance':'resist magical','magical resistance':'resist magical','magical resist':'resist magical','resist magic':'resist magical',
  'physical resistance':'resist physical','phys resist':'resist physical','physical resist':'resist physical','resist phys':'resist physical',
  'void resistance':'resist void','void resist':'resist void','ailment resistance':'resist ailments','status resistance':'resist ailments',
  'shields':'shield','barrier':'shield','healing':'healing power','heal power':'healing power','sure hit':'sure hit','rune slots':'rune slot','soulstones':'soulstone looting'};
var scands=[];
STATKEYS.forEach(function(k){scands.push({n:k,kind:'stat',s:STAT[k]});});
Object.keys(STAT_ALIAS).forEach(function(a){var t=STAT_ALIAS[a];if(STAT[t]&&!STAT[a])scands.push({n:a,kind:'stat',s:STAT[t],alias:true});});
scands.sort(function(a,b){return b.n.length-a.n.length;});
var tcands=[];
Object.keys(TERMK).forEach(function(k){if(!STAT[k])tcands.push({n:k,kind:'term',t:TERMK[k]});});
tcands.sort(function(a,b){return b.n.length-a.n.length;});

/* ---------- words that never name anything ---------- */
var STOP={the:1,of:1,a:1,an:1,and:1,in:1,to:1,for:1};
var FILL={};
('the of a an and in to for is are was were be been it its i me my we you your do does did can could will would should has have had with without from at on by as or if so but not no yes '+
 'what whats which who whom where when why how many much most least fewest more less than then there their they them this that these those here '+
 'drop drops dropped dropping farm farmed farming get gets got find found obtain obtained acquire loot looted source sources located location locations '+
 'show list display give gives giving tell name names all every each any some only just also both same other another between versus vs compare comparison difference differences differ '+
 'item items thing things stuff gear equipment equip equips weapon weapons armor armour armors armours accessory accessories skill skills book books rarity rare rarest star stars tier '+
 'boss bosses dungeon dungeons disaster disasters conquest conquests special enemy enemies monster monsters '+
 'best good bad strong top high highest low lowest better worse great '+
 'count total number amount common popular frequent '+
 'effect effects ability abilities stat stats bonus bonuses perk perks status describe description explain tooltip detail details info information about '+
 'missing incomplete inconsistent incorrect missed lacking short empty mismatch wrong pattern consistent standard usual normal structure '+
 'boost boosts increase increases raise raises improve improves reduce reduces decrease decreases provide provides buff buffs enhance enhances grant grants '+
 'please thanks thank hello hey').split(' ').forEach(function(x){if(x)FILL[x]=1;});
var sig=function(n){return n.split(' ').filter(function(x){return x&&!STOP[x];});};

/* ---------- small helpers: edit distance, plain text, clipping ---------- */
function ed(a,b,max){
  var la=a.length,lb=b.length;
  if(Math.abs(la-lb)>max)return max+1;
  var prev2=null,prev=[],cur,i,j;
  for(j=0;j<=lb;j++)prev[j]=j;
  for(i=1;i<=la;i++){
    cur=[i];var rowMin=i;
    for(j=1;j<=lb;j++){
      var cost=a.charCodeAt(i-1)===b.charCodeAt(j-1)?0:1;
      var v=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+cost);
      if(i>1&&j>1&&a.charCodeAt(i-1)===b.charCodeAt(j-2)&&a.charCodeAt(i-2)===b.charCodeAt(j-1))v=Math.min(v,prev2[j-2]+1);
      cur[j]=v;if(v<rowMin)rowMin=v;
    }
    if(rowMin>max)return max+1;
    prev2=prev;prev=cur;
  }
  return prev[lb];
}
function tolFor(len){return len<6?0:len<9?1:len<14?2:3;}
function plain(s){
  return String(s||'')
    .replace(/\{\{([^}]*)\}\}/g,function(m,inner){var p=inner.split('|');return p[1]||p[0];})
    .replace(/\[\[(.+?)\]\]/g,'$1').replace(/%%(.+?)%%/g,'$1').replace(/~~(.+?)~~/g,'$1').replace(/@@(.+?)@@/g,'$1')
    .replace(/\^\^(.+?)\^\^/g,'$1').replace(/\$\$/g,'').replace(/##(.+?)##/g,'$1');
}
function clip(s,n){s=String(s);if(s.length<=n)return s;var cut=s.lastIndexOf('\n',n);if(cut<n*0.5)cut=n;return s.slice(0,cut).replace(/\s+$/,'')+'\u2026';}
function fmt(s){return qe(s).replace(/\n/g,'<br>');}

/* ---------- reading the question: names (exact, then typo-tolerant) ---------- */
function matchPool(w,pool,out,accept){
  pool.forEach(function(c){
    if(!c.n)return;
    var i=w.indexOf(' '+c.n+' ');
    if(i<0)return;
    if(accept&&!accept(c))return;
    out.push({c:c,pos:i});
    w=w.slice(0,i+1)+Array(c.n.length+1).join('#')+w.slice(i+1+c.n.length);
  });
  return w;
}
function fuzzyPool(w,pool,out,accept){
  var toks=w.trim().split(' ');
  for(var n=6;n>=1;n--){
    for(var i=0;i+n<=toks.length;i++){
      var g=toks.slice(i,i+n),bad=false,k;
      for(k=0;k<n;k++){if(!g[k]||g[k].indexOf('#')>=0){bad=true;break;}}
      if(bad)continue;
      if(g.every(function(t){return FILL[t]||/^\d+$/.test(t);}))continue;
      var gs=g.join(' ');
      if(gs.length<6)continue;
      var best=99,hit=null,tie=false;
      for(var j=0;j<pool.length;j++){
        var c=pool[j],cl=c.n.length,tl=tolFor(cl);
        if(!tl||Math.abs(cl-gs.length)>tl)continue;
        if(accept&&!accept(c))continue;
        var d=ed(gs,c.n,tl);
        if(d>tl)continue;
        if(c.n.charAt(0)!==gs.charAt(0)&&d>1)continue;
        if(d<best){best=d;hit=c;tie=false;}
        else if(d===best&&hit&&c.n!==hit.n){tie=true;}
      }
      if(hit&&!tie){
        var pos=1;for(k=0;k<i;k++)pos+=toks[k].length+1;
        out.push({c:hit,pos:pos,typo:true});
        for(k=i;k<i+n;k++)toks[k]=Array(toks[k].length+1).join('#');
      }
    }
  }
  return ' '+toks.join(' ')+' ';
}
var STATQ=/\b(give|gives|giving|grant|grants|have|has|having|with|stat|stats|ability|abilities|effect|effects|bonus|bonuses|boost|boosts|increase|increases|raise|raises|improve|improves|reduce|reduces|decrease|decreases|provide|provides|buff|buffs|perk|perks|enhance|enhances|define|definition|meaning|mean|means|what is|whats|which items|which equipment|which gear|what items|what equipment|what does|what do|how does|explain|describe|tell me about)\b/;
function twins(list,text){
  var done={};
  list.slice().forEach(function(a){
    if(!CASEDUP[a.name])return;
    var gk=a.slot+'|'+norm(a.name);if(done[gk])return;done[gk]=1;
    var g=[];items.forEach(function(o){if(o.slot===a.slot&&norm(o.name)===norm(a.name))g.push(o);});
    var ex=g.filter(function(o){return String(text).indexOf(o.name)>=0;});
    var pick=(ex.length&&ex.length<g.length)?ex:g,at=list.indexOf(a);
    list=list.filter(function(o){return g.indexOf(o)<0;});
    pick.forEach(function(o,i){list.splice(Math.min(at,list.length)+i,0,o);});
  });
  return list;
}
function parseAll(text){
  var w0=' '+norm(text)+' ',w=w0,found=[],sf=[],tf=[];
  var short=w0.trim().split(' ').length<=3,statOK=STATQ.test(w0)||short;
  var acceptStat=function(c){return c.n.indexOf(' ')>=0||statOK;};
  w=matchPool(w,cands,found);
  w=matchPool(w,scands,sf,acceptStat);
  w=matchPool(w,tcands,tf,function(c){return c.n.indexOf(' ')>=0||statOK||/\bwhat (is|are|does)\b/.test(w0);});
  w=fuzzyPool(w,cands,found);
  w=fuzzyPool(w,scands,sf,function(c){return (c.n.length>=7||c.n.indexOf(' ')>=0)&&statOK;});
  found.sort(function(a,b){return a.pos-b.pos;});sf.sort(function(a,b){return a.pos-b.pos;});tf.sort(function(a,b){return a.pos-b.pos;});
  var itemsF=[],bossF=[],bposF=[],statsF=[],termsF=[];
  found.forEach(function(f){if(f.c.kind==='item'){if(itemsF.indexOf(f.c.it)<0)itemsF.push(f.c.it);}else if(bossF.indexOf(f.c.b)<0){bossF.push(f.c.b);bposF.push(f.pos);}});
  itemsF=twins(itemsF,text);
  sf.forEach(function(f){if(statsF.indexOf(f.c.s)<0)statsF.push(f.c.s);});
  tf.forEach(function(f){if(termsF.indexOf(f.c.t)<0)termsF.push(f.c.t);});
  return {w:w,w0:w0,items:itemsF,bosses:bossF,bpos:bposF,stats:statsF,terms:termsF,statQ:STATQ.test(w0)};
}

/* Query words vs. item names that share most (but not all) words, e.g. "kenzo costume" -> Kenzo's Costume. */
var hasTok=function(qs,t){return qs[t]||(t.length>3&&t.charAt(t.length-1)==='s'&&qs[t.slice(0,-1)])||qs[t+'s'];};
function fuzzyItems(text,allowUnique){
  var qt=sig(norm(text)),qs={};qt.forEach(function(x){qs[x]=1;});
  var hits=[];
  items.forEach(function(it){
    var t=sig(norm(it.name));
    if(t.length>=2&&t.every(function(x){return hasTok(qs,x);}))hits.push({it:it,n:t.length});
  });
  if(hits.length){hits.sort(function(a,b){return b.n-a.n;});var top=hits[0].n;return hits.filter(function(h){return h.n===top;}).map(function(h){return h.it;});}
  if(!allowUnique)return [];
  var res=[];
  qt.forEach(function(x){
    if(x.length<5||FILL[x])return;
    var m=[];items.forEach(function(it){if(sig(norm(it.name)).indexOf(x)>=0)m.push(it);});
    if(m.length===1&&res.indexOf(m[0])<0)res.push(m[0]);
  });
  return res;
}
/* Last resort: one distinctive word (or its start) that points to exactly one item or boss. */
function partialEntity(text){
  var all=sig(norm(text)).filter(function(x){return x.length>=3&&!FILL[x]&&!/^\d+$/.test(x);});
  var qt=all.filter(function(x){return x.length>=4;});
  var hit=[],matched=0;
  qt.forEach(function(x){
    var m=[];
    cands.forEach(function(c){
      var toks=sig(c.n);
      if(toks.some(function(t){return t===x||(x.length>=5&&x.slice(-1)==='s'&&t===x.slice(0,-1))||(x.length>=5&&t.indexOf(x)===0)||(x.length>=5&&t.length>=5&&ed(x,t,1)<=1&&!(window.__qaKnown&&window.__qaKnown(x)));}))m.push(c);
    });
    var uniq=[];m.forEach(function(c){var nm=norm(c.kind==='item'?c.it.name:c.b.name);if(!uniq.some(function(u){return norm(u.kind==='item'?u.it.name:u.b.name)===nm;}))uniq.push(c);});
    if(uniq.length===1){matched++;if(hit.indexOf(uniq[0])<0)hit.push(uniq[0]);}
  });
  return matched*2>=all.length?hit:[];
}

/* ---------- plain-English words -> the words the engine understands ---------- */
var SYNS=[
  [/\b(swords?|greatswords?|staffs?|staves|wands?|guns?|blades?|daggers?|scepters?|bows?|spears?|cannons?|fans?)\b/g,' weapon '],
  [/\b(robes?|clothes|clothing|outfits?|costumes?|suits?|vests?|coats?|dress(?:es)?)\b/g,' armor '],
  [/\b(helm(?:et)?s?|hats?|crowns?|shoes?|boots?|rings?|amulets?|jewel(?:ry|s)?|trinkets?|charms?|necklaces?|cloaks?|masks?|turbans?)\b/g,' accessory '],
  [/\b(skill ?books?|spells?|techniques?)\b/g,' skill '],
  [/\b(legendary|highest rarity|top rarity|max rarity|maximum rarity|top tier|best rarity)\b/g,' 7 '],
  [/\b(farm(?:ed|ing|s)?|obtain(?:ed|s)?|acquire[sd]?|acquiring|loot(?:ed|s)?|spawn(?:s|ed)?|come from|comes from|coming from)\b/g,' drop '],
  [/\b(enem(?:y|ies)|monsters?)\b/g,' boss ']
];
function syn(w){SYNS.forEach(function(r){w=w.replace(r[0],r[1]);});return w;}

var FACTS=[
  {title:'6\u2605 and 7\u2605 rerolls',text:'6\u2605 and 7\u2605 equipment and skills do not appear in rerolls unless you reach Savage mode in your dungeon run.'},
  {title:'Savage Mode',text:'Risky actions, such as avoiding camping and defeating many enemies, will trigger "Savage Mode" when the flame at the top of the screen lights up.<br>In this mode, more enemies will appear than usual.<br>Additionally, there are items that can only be found in this extreme situation.'}
];
var RULE=FACTS[0].text;
function factCard(f){return card('<div class="qa-title">'+f.title+'</div><div>'+f.text+'</div>');}
function factMatch(w,hasThing){
  if(/\bsavage\b/.test(w)){if(/\b(reroll|rerolls|rerolled|6|7|six|seven|star|stars)\b/.test(w))return FACTS[0];return FACTS[1];}
  if(/\bflame\b/.test(w)&&/\b(top|screen|light|lights|lit)\b/.test(w))return FACTS[1];
  if(hasThing)return null;
  var star=/\b(6|7|six|seven)\b/.test(w);
  if(star&&/\b(reroll|rerolls|rerolled|appear|appears|show|shows|see|unlock|unlocked|available|start|starts|begin|when|why|cant|cannot|how)\b/.test(w)&&!/\b(how many|count|total|list)\b/.test(w))return FACTS[0];
  if(/\breroll/.test(w)&&/\b(star|stars|high|rare|rarity|rarer)\b/.test(w))return FACTS[0];
  return null;
}

/* ---------- small renderers ---------- */
function itemChip(it,name){
  var s=it.stars.has(7)?7:6;
  return '<span class="item qa-chip s'+s+'" data-item="'+qe(name||it.name)+'" data-slot="'+it.slot+'">'+qe(name||it.name)+'</span>';
}
function nameChip(name,slot,star){
  return '<span class="item qa-chip s'+star+'" data-item="'+qe(name)+'" data-slot="'+slot+'">'+qe(name)+'</span>';
}
function eqChip(e){
  if(e.it)return itemChip(e.it);
  return '<span class="item qa-chip s'+(e.stars>=7?7:6)+'" data-item="'+qe(e.name)+'" data-slot="">'+qe(e.name)+'</span>';
}
function bossChip(b){return '<a href="#" class="idx-link qa-chip qa-boss" data-q="'+qe(b.name)+'">'+qe(b.name)+'</a>';}
function grid(cols,rows){
  var tpl=cols.map(function(c){return c.w||'1fr';}).join(' ');
  return '<div class="qa-grid" style="grid-template-columns:'+tpl+'">'+
    cols.map(function(c){return '<div class="qa-gh">'+c.h+'</div>';}).join('')+
    rows.map(function(r){return r.map(function(c){return '<div>'+c+'</div>';}).join('');}).join('')+'</div>';
}
function card(html){return '<div class="qa-card">'+html+'</div>';}
function mode(a){var m={},best=a[0],bc=0;a.forEach(function(x){m[x]=(m[x]||0)+1;if(m[x]>bc){bc=m[x];best=x;}});return best;}
function dupNote(lists){
  var seen={},notes=[];
  lists.forEach(function(l){l.forEach(function(n){if(CASEDUP[n])return;var k=n.toLowerCase();(seen[k]=seen[k]||new Set()).add(n);});});
  Object.keys(seen).forEach(function(k){if(seen[k].size>1)notes.push('"'+Array.from(seen[k]).join('" and "')+'"');});
  return notes.length?'<div class="qa-note">Note: '+notes.map(qe).join('; ')+' appear as separate entries (likely the same item), and both are counted.</div>':'';
}
var STAR=function(n){return '<span class="qa-star s'+n+'">'+n+'\u2605</span>';};
var starTxt=function(it){return Array.from(it.stars).sort().map(function(s){return s+'\u2605';}).join('/');};
var QA_SUPER=false;
function cap1(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function foldBox(sum,inner,open){return '<details class="qa-more qa-fold"'+(open?' open':'')+'><summary>'+sum+'</summary>'+inner+'</details>';}
function capChips(arr,fn,max,keep){
  var vis=keep?(max||40):8;
  if(arr.length<=vis+1)return arr.map(fn).join('');
  return arr.slice(0,vis).map(fn).join('')+foldBox('+'+(arr.length-vis)+' more',arr.slice(vis).map(fn).join(''));
}
function bossHas(b,it){var k=ik(it.name);return [0,1].some(function(x){return b.lists[it.slot][x].some(function(n){return ik(n)===k;});});}
function starIn(b,it){var k=ik(it.name),r=[];[0,1].forEach(function(x){if(b.lists[it.slot][x].some(function(n){return ik(n)===k;}))r.push(x?7:6);});return r;}
function byStarName(a,b){var sa=a.it&&a.it.stars.has(7)?1:0,sb=b.it&&b.it.stars.has(7)?1:0;return (sb-sa)||cmp(a.name,b.name);}

/* ---------- answer types ---------- */
function countCard(b,stars,slots){
  var cols=[{h:'Category',w:'1.3fr'}];
  stars.forEach(function(s){cols.push({h:s+'\u2605'});});
  cols.push({h:'Total'});
  var rows=[],sum=stars.map(function(){return 0;}),all=0,used=[];
  slots.forEach(function(sl){
    var r=[SL[sl]],t=0;
    stars.forEach(function(s,i){var l=b.lists[sl][s===7?1:0];r.push(String(l.length));t+=l.length;sum[i]+=l.length;used.push(l);});
    r.push('<b>'+t+'</b>');all+=t;rows.push(r);
  });
  if(slots.length>1){rows.push(['<b>All</b>'].concat(sum.map(function(x){return '<b>'+x+'</b>';})).concat(['<b>'+all+'</b>']));}
  var lead='';
  if(slots.length===1&&stars.length===1){lead='<div>'+bossChip(b)+(b.type==='Special'?' lists ':' has ')+'<b>'+all+'</b> '+stars[0]+'\u2605 '+SL[slots[0]].toLowerCase()+'.</div>';}
  return card('<div class="qa-title">'+bossChip(b)+'<span class="qa-sub">'+qe(b.type==='Special'?'special dungeon':b.type.toLowerCase())+'</span></div>'+lead+grid(cols,rows)+dupNote(used)+(b.type==='Special'?spNote([b]):''));
}
/* v128: the Loot entries (BOSS_LOOT: Crystal Beach, Trial) are part of the wiki's loot system, so the Ask box reads them too. */
var LOOT=[];
(function(){
  if(typeof BOSS_LOOT==='undefined')return;
  Object.keys(BOSS_LOOT).forEach(function(bn){
    (BOSS_LOOT[bn]||[]).forEach(function(it){
      var m=/\[\[(.+?)\]\]/.exec(it.desc||''),sk=m?m[1]:'',book=/^book of /i.test(it.name)&&!!sk;
      var keys=[norm(it.name)];
      if(book){keys.push(norm(sk)+' book');keys.push(norm(sk)+' skill book');}
      else if(/^tag of /i.test(it.name)){keys.push(norm(it.name).replace(/^tag of (.+)$/,'$1 tag'));}
      LOOT.push({name:it.name,boss:bn,cat:it.category||'',desc:it.desc||'',skill:sk,keys:keys});
    });
  });
})();
function spBoss(name){var n=norm(name);return bosses.filter(function(b){return b.type==='Special'&&norm(b.name)===n;})[0];}
function lootFor(b){var n=norm(b.name);return LOOT.filter(function(L){return norm(L.boss)===n;});}
function lootChip(L){return '<span class="qa-chip s7">'+qe(L.name)+'</span>';}
function lootBlock(b){
  var l=lootFor(b);if(!l.length)return '';
  return '<div class="qa-slot"><b>Loot</b><div class="qa-line">'+l.map(lootChip).join('')+'</div><div class="qa-line"><a href="#" class="qa-chip qa-boss" data-lootopen="'+qe(l[0].boss)+'">Open its Loot</a></div></div>';
}
function lootDesc(L){
  return qe(L.desc).replace(/\[\[(.+?)\]\]/g,function(m,x){return (HAS_SKILLS&&SKD[norm(x)])?nameChip(x,'skill',7):qe(x);}).replace(/\n/g,'<br>');
}
function lootRoute(raw){
  if(!LOOT.length)return '';
  var w=' '+norm(raw)+' ',wt=w.trim(),hits=[],seen={};
  var sp=bosses.filter(function(b){return b.type==='Special'&&w.indexOf(' '+norm(b.name).replace(/^the /,'')+' ')>=0;});
  var yn=/^(does|do|did|can|could|will|would|is|are|has|have)\b/.test(wt);
  LOOT.forEach(function(L){
    var k=norm(L.name)+'|'+L.boss;if(seen[k])return;
    var m=L.keys.some(function(x){return w.indexOf(' '+x+' ')>=0;});
    /* "does the Trial drop Evil Eye": a skill name next to a special dungeon also finds that skill's book in the Loot */
    if(!m&&yn&&sp.length&&L.skill&&w.indexOf(' '+norm(L.skill)+' ')>=0)m=true;
    if(m){seen[k]=1;hits.push(L);}
  });
  /* v129: a plain skill name + a where / drop / loot / get word finds that skill's Loot book, only when no dungeon, disaster or conquest table lists the skill */
  var rb=bosses.filter(function(b){return b.type!=='Special'&&w.indexOf(' '+norm(b.name).replace(/^the /,'')+' ')>=0;});
  if(!hits.length&&(/\b(where|drops?|dropped|dropping|loot|looted|obtain|obtained|acquire|acquired|farm|farming|find|get|gets|getting|source|sources|comes? from)\b/.test(wt)||(yn&&rb.length&&/\b(have|has|list|lists|give|gives|carry|carries)\b/.test(wt)))&&!/\b(should|worth|vs|versus|compare|better)\b/.test(wt)){
    LOOT.forEach(function(L){
      var k=norm(L.name)+'|'+L.boss;if(seen[k]||!L.skill)return;
      if(w.indexOf(' '+norm(L.skill)+' ')<0)return;
      var si=items.get(ik(L.skill)+'|skill');if(si&&si.bosses.length)return;
      seen[k]=1;hits.push(L);
    });
  }
  if(hits.length&&sp.length&&yn){
    var s0=sp[0];
    return card('<div class="qa-title">Loot check<span class="qa-sub">special dungeon</span></div>'+hits.slice(0,4).map(function(L){
      var ok=norm(L.boss)===norm(s0.name),ob=spBoss(L.boss);
      return '<div class="qa-line"><b>'+(ok?'Yes.':'No.')+'</b> '+lootChip(L)+(ok?' is in the Loot of ':' is not in the Loot of ')+bossChip(s0)+(ok?'.':'. It is in the Loot of '+(ob?bossChip(ob):qe(L.boss))+'.')+'</div>';
    }).join(''));
  }
  /* v130: "does Fenrir drop Restart": a dungeon, disaster or conquest boss + a Loot-only item -> No, and where it really is */
  if(hits.length&&rb.length&&!sp.length&&(yn||/\b(from|by)\b/.test(wt))){
    var bl=[];
    rb.slice(0,3).forEach(function(b){hits.slice(0,3).forEach(function(L){
      var si=L.skill?items.get(ik(L.skill)+'|skill'):null;
      if(si&&bossHas(b,si))return;
      var ob=spBoss(L.boss);
      bl.push('<div class="qa-line"><b>No.</b> '+bossChip(b)+' does not list '+lootChip(L)+'. It is in the Loot of '+(ob?bossChip(ob):qe(L.boss))+'.</div>');
    });});
    if(bl.length)return docMark(card('<div class="qa-title">Loot check<span class="qa-sub">boss</span></div>'+bl.join('')));
  }
  if(hits.length){
    return docMark(hits.slice(0,3).map(function(L){
      var b=spBoss(L.boss);
      return card('<div class="qa-title">'+lootChip(L)+'<span class="qa-sub">loot \u00B7 '+qe((L.cat||'item').toLowerCase())+'</span></div>'+
        '<div class="qa-line">Found in the Loot of '+(b?bossChip(b)+' (special dungeon)':qe(L.boss))+'.</div>'+
        '<div>'+lootDesc(L)+'</div>');
    }).join(''));
  }
  if(sp.length&&/\b(loot|rewards?|treasure boxe?s?|inventory items?|rare items?)\b/.test(w)&&!/\b(6|7|six|seven)\b/.test(w)){
    if(isCB(sp[0]))return specialCard(sp[0]);
    var lb=lootBlock(sp[0]);
    if(lb)return card('<div class="qa-title">'+bossChip(sp[0])+'<span class="qa-sub">special dungeon</span></div>'+lb);
  }
  return '';
}
function isCB(b){return /crystal beach/i.test(b.name);}
function specialCard(b){
  if(!isCB(b)){
    var c7=SLOTS.map(function(sl){return '<b>'+b.lists[sl][1].length+'</b> '+SL[sl].toLowerCase();}).join(', ');
    return card('<div class="qa-title">'+bossChip(b)+'<span class="qa-sub">special dungeon</span></div><div>'+qe(b.name)+' drops 7\u2605 equipment and skills. Its row lists '+c7+' at 7\u2605.</div>'+lootBlock(b));
  }
  var lbx=lootBlock(b);
  return card('<div class="qa-title">'+bossChip(b)+'<span class="qa-sub">special dungeon</span></div><div>'+qe(b.name)+' does not drop 6\u2605 or 7\u2605 equipment or skill books. It only drops rare items in the 6\u2605/7\u2605 category'+(lbx?', and those are in its Loot.':'.')+'</div>'+lbx);
}
function spNote(bs){
  var t='';
  if(bs.some(function(b){return b.type==='Special'&&isCB(b);}))t+='Crystal Beach does not drop 6\u2605 or 7\u2605 equipment or skill books. ';
  if(bs.some(function(b){return b.type==='Special'&&!isCB(b);}))t+='The Trial drops 7\u2605 equipment and skills. ';
  return t?'<div class="qa-note">'+t+'These numbers only count what is listed in its row of the table.</div>':'';
}
function bossCard(b,stars,slots){
  if(b.type==='Special'&&isCB(b))return specialCard(b);
  var h='<div class="qa-title">'+bossChip(b)+'<span class="qa-sub">'+qe(b.type==='Special'?'special dungeon':b.type.toLowerCase())+'</span></div>';
  var cnt=function(sl,s){return b.lists[sl][s===7?1:0].length;};
  var total=0;slots.forEach(function(sl){stars.forEach(function(s){total+=cnt(sl,s);});});
  var small=total<=8;
  if(!small){
    var per=stars.map(function(s){var c=0;slots.forEach(function(sl){c+=cnt(sl,s);});return '<b>'+c+'</b> at '+s+'\u2605';}).join(' and ');
    h+='<div class="qa-lead">Drops '+per+'. Tap a category:</div>';
  }
  slots.forEach(function(sl){
    var inner='';
    stars.forEach(function(s){
      var l=b.lists[sl][s===7?1:0].slice().sort(cmp);
      inner+='<div class="qa-line">'+STAR(s)+' '+(l.length?l.map(function(n){return nameChip(n,sl,s);}).join(''):'<span class="qa-none">none listed</span>')+'</div>';
    });
    if(small)h+='<div class="qa-slot"><b>'+SL[sl]+'</b>'+inner+'</div>';
    else h+=foldBox('<b>'+SL[sl]+'</b> \u00B7 '+stars.map(function(s){return s+'\u2605: '+cnt(sl,s);}).join(' \u00B7 '),inner);
  });
  return card(h+(b.type==='Special'?lootBlock(b)+spNote([b]):''));
}
function twinTag(it){
  if(!CASEDUP[it.name])return '';
  var e=EQN[ik(it.name)],a=e&&e.abil[0];
  return a?' \u00B7 '+qe(a.n):'';
}
function itemCard(it,lead){
  var stars=starTxt(it);
  var h='<div class="qa-title">'+itemChip(it)+'<span class="qa-sub">'+stars+' '+it.slot+twinTag(it)+'</span></div>'+(lead||'');
  if(!it.bosses.length){
    return card(h+'<div>'+(it.special?'Only listed under a special dungeon ('+qe(bosses.filter(function(b){return b.type==='Special'&&b.lists[it.slot][0].concat(b.lists[it.slot][1]).some(function(n){return ik(n)===ik(it.name);});}).map(function(b){return b.name;}).join(', '))+').':'No dungeon, disaster or conquest lists it.')+'</div>');
  }
  var parts=['Dungeon','Disaster','Conquest'].map(function(t){return {t:t,l:it.bosses.filter(function(b){return b.type===t;}).sort(function(a,b){return cmp(a.name,b.name);})};}).filter(function(p){return p.l.length;});
  var n=it.bosses.length;
  if(!lead){
    var bd=(n>6&&parts.length>1)?': '+parts.map(function(p){return p.l.length+' '+(p.l.length===1?PLURAL[p.t].replace(/s$/,''):PLURAL[p.t]);}).join(', '):'';
    h+='<div class="qa-lead">Drops from <b>'+n+'</b> boss'+(n===1?'':'es')+bd+'.</div>';
  }
  parts.forEach(function(p){
    var chips=p.l.map(bossChip).join('');
    if(p.l.length<=6)h+='<div class="qa-line"><span class="qa-lab">'+cap1(PLURAL[p.t])+' ('+p.l.length+')</span> '+chips+'</div>';
    else h+=foldBox(cap1(PLURAL[p.t])+' ('+p.l.length+')','<div class="qa-line">'+chips+'</div>');
  });
  return card(h+'<div class="qa-note">'+RULE+'</div>');
}
function commonCard(its){
  var grp={},gl=[];
  its.forEach(function(i){var k=i.slot+'|'+norm(i.name);if(!grp[k]){grp[k]=[];gl.push(grp[k]);}grp[k].push(i);});
  var common=[];
  gl[0].forEach(function(i){i.bosses.forEach(function(b){if(common.indexOf(b)<0&&gl.every(function(g){return g.some(function(x){return x.bosses.indexOf(b)>=0;});}))common.push(b);});});
  var h='<div class="qa-title">Bosses that drop '+gl.map(function(g){return g.map(function(i){return itemChip(i);}).join(' / ');}).join(' and ')+'</div>';
  h+=common.length?'<div>'+common.length+' boss'+(common.length===1?'':'es')+':</div><div class="qa-line">'+common.sort(function(a,b){return cmp(a.name,b.name);}).map(bossChip).join('')+'</div>':'<div>No boss lists all of them.</div>';
  return card(h);
}
function groupCard(types,stars,slots,listing){
  var sets=types.length?types.map(function(t){return [PLURAL[t],bosses.filter(function(b){return b.type===t;})];}):[['all dungeons, disasters and conquests',real]];
  return sets.map(function(set){
    if(set[1].length&&set[1][0].type==='Special')return set[1].map(specialCard).join('');
    var bs=set[1],h='<div class="qa-title">'+qe(set[0].charAt(0).toUpperCase()+set[0].slice(1))+'<span class="qa-sub">'+bs.length+' boss'+(bs.length===1?'':'es')+'</span></div>';
    if(listing){
      slots.forEach(function(sl){
        h+='<div class="qa-slot"><b>'+SL[sl]+'</b>';
        stars.forEach(function(s){
          var seen={},names=[];
          bs.forEach(function(b){b.lists[sl][s===7?1:0].forEach(function(n){var k=ik(n);if(!seen[k]){seen[k]=1;names.push(n);}});});
          names.sort(cmp);
          h+='<div class="qa-line">'+STAR(s)+' <span class="qa-lab">'+names.length+'</span> '+names.map(function(n){return nameChip(n,sl,s);}).join('')+'</div>';
        });
        h+='</div>';
      });
      return card(h);
    }
    var cols=[{h:'Category',w:'1.2fr'}];
    stars.forEach(function(s){cols.push({h:s+'\u2605 per boss'});cols.push({h:s+'\u2605 different'});});
    var rows=slots.map(function(sl){
      var r=[SL[sl]];
      stars.forEach(function(s){
        var k=s===7?1:0,counts=bs.map(function(b){return b.lists[sl][k].length;}),seen={};
        bs.forEach(function(b){b.lists[sl][k].forEach(function(n){seen[ik(n)]=1;});});
        r.push(String(bs.length>1?mode(counts):counts[0]));r.push(String(Object.keys(seen).length));
      });
      return r;
    });
    return card(h+grid(cols,rows)+'<div class="qa-note">"per boss" is the usual number in each boss row; "different" is how many distinct items appear across them.</div>');
  }).join('');
}
function patternCard(){
  var h='<div class="qa-title">The standard pattern</div><div>Each dungeon, disaster boss and conquest boss lists <b>6 six-star</b> and <b>1 seven-star</b> item in each of weapons, armor, accessories and skills: 7 per category, 28 per row.</div>';
  var rows=['Dungeon','Disaster','Conquest'].map(function(t){
    var bs=bosses.filter(function(b){return b.type===t;});
    var ok=bs.filter(function(b){return SLOTS.every(function(s){return b.lists[s][0].length===6&&b.lists[s][1].length===1;});}).length;
    return [PLURAL[t].charAt(0).toUpperCase()+PLURAL[t].slice(1),String(bs.length),String(ok),String(bs.length-ok)];
  });
  h+=grid([{h:'Type',w:'1.4fr'},{h:'Bosses'},{h:'Match'},{h:'Off pattern'}],rows);
  h+='<div class="qa-note">Ask "which bosses are missing items" to see the off-pattern rows. The special entries (the Trial and the Crystal Beach location) use a larger combined list instead.</div>';
  return card(h);
}
function missingCard(only,types){
  var out={6:[],7:[]},extra=[];
  (only&&only.length?only:real.filter(function(b){return !types||!types.length||types.indexOf(b.type)>=0;})).forEach(function(b){
    if(b.type==='Special')return;
    [6,7].forEach(function(st){
      var exp=st===6?6:1,miss=[];
      SLOTS.forEach(function(sl){
        var n=b.lists[sl][st===7?1:0].length;
        if(n<exp)miss.push([sl,exp-n]);else if(n>exp)extra.push(b.name+' '+SL[sl].toLowerCase()+' '+st+'\u2605 (+'+(n-exp)+')');
      });
      if(!miss.length)return;
      var same=miss.length>1&&miss.every(function(m){return m[1]===miss[0][1];});
      if(same)out[st].push([b.type,b,miss.map(function(m){return SL[m[0]];}).join(', '),miss[0][1]+' each']);
      else miss.forEach(function(m){out[st].push([b.type,b,SL[m[0]],String(m[1])]);});
    });
  });
  var h='<div class="qa-title">Missing items</div>';
  if(!out[6].length&&!out[7].length&&!extra.length)return card(h+'<div>Nothing is missing'+(only&&only.length?' for that boss':'')+'.</div>');
  [6,7].forEach(function(st){
    if(!out[st].length)return;
    h+='<div class="qa-slot"><b>'+st+'\u2605 missing</b></div>'+grid([{h:'Type',w:'.8fr'},{h:'Boss',w:'1.3fr'},{h:'Category',w:'1.6fr'},{h:'Missing',w:'.7fr'}],
      out[st].map(function(r){return [r[0],bossChip(r[1]),r[2],r[3]];}));
  });
  if(extra.length)h+='<div class="qa-note">More than expected: '+extra.map(qe).join('; ')+'</div>';
  h+='<div class="qa-note">This shows how many are missing and in which slot, not which item.</div>';
  return card(h);
}

/* ---------- documentation gaps: names listed in the tables that have no card or images yet ---------- */
var CARDK={},IMGK={};
function slotKey(k){var m=k.match(/^(.*)::(weapon|armor|accessory|skill)$/);return m?[m[1],m[2]]:[k,'*'];}
if(typeof ITEM_DETAILS!=='undefined')Object.keys(ITEM_DETAILS).forEach(function(k){var p=slotKey(k);CARDK[ik(p[0])+'|'+p[1]]=1;});
if(typeof ITEM_IMAGES!=='undefined')Object.keys(ITEM_IMAGES).forEach(function(k){var a=ITEM_IMAGES[k];if(!a||!a.length)return;var p=slotKey(k);IMGK[ik(p[0])+'|'+p[1]]=a.length;});
/* equipment: card (ITEM_DETAILS) + reroll sample images (ITEM_IMAGES). skills: card (SKILL_DETAILS) only, they have no image slot */
function docOf(it){
  var k=ik(it.name),sk=it.slot==='skill';
  return {card:sk?!!SKD[norm(it.name)]:!!(CARDK[k+'|'+it.slot]||CARDK[k+'|*']),img:sk?0:(IMGK[k+'|'+it.slot]||IMGK[k+'|*']||0),need:!sk};
}
function docKeySets(bs,slots){
  var s={};
  slots.forEach(function(sl){var st=new Set();s[sl]=st;bs.forEach(function(b){var L=b.lists[sl];if(!L)return;[0,1].forEach(function(x){(L[x]||[]).forEach(function(n){st.add(ik(n));});});});});
  return s;
}
function docRows(bs,slots,stars,hasStar){
  var rows=[],ks=bs?docKeySets(bs,slots):null;
  items.forEach(function(it){
    if(slots.indexOf(it.slot)<0)return;
    if(hasStar&&!stars.some(function(s){return it.stars.has(s);}))return;
    if(ks&&!ks[it.slot].has(ik(it.name)))return;
    var d=docOf(it);rows.push({it:it,card:d.card,img:d.img,need:d.need});
  });
  return rows.sort(function(a,b){return cmp(a.it.name,b.it.name);});
}
function docGrid(rows,slots){
  var r=[];
  slots.forEach(function(sl){
    var l=rows.filter(function(x){return x.it.slot===sl;});if(!l.length)return;
    r.push([SL[sl],String(l.length),l.filter(function(x){return x.card;}).length+' / '+l.length,sl==='skill'?'n/a':l.filter(function(x){return x.img;}).length+' / '+l.length]);
  });
  return grid([{h:'Category',w:'1.2fr'},{h:'Listed'},{h:'Written info'},{h:'Images'}],r);
}
function docMark(h){return h.replace('<div class="qa-card">','<div class="qa-card" data-doc="1">');}
function docCard(o){
  var bs=o.bs&&o.bs.length?o.bs:null,ty=o.types||[],pool=bs||(ty.length?bosses.filter(function(b){return ty.indexOf(b.type)>=0;}):null);
  var rows=docRows(pool,o.slots,o.stars,o.hasStar),nc=rows.filter(function(x){return !x.card;}),ni=rows.filter(function(x){return x.need&&!x.img;});
  var cap=o.compact?24:40,chip=function(x){return itemChip(x.it);};
  var what=o.info&&o.img?'card or images':o.img?'images':'card';
  var scope=bs?bs.map(function(b){return b.name;}).join(' / '):ty.length?ty.map(function(t){return PLURAL[t];}).join(', '):'all tables';
  var h='<div class="qa-title">Listed, but no entry yet<span class="qa-sub">'+qe(scope)+'</span></div>';
  if(!rows.length)return docMark(card(h+'<div>No listed items match that.</div>'));
  h+='<div>These names are in the drop tables, so their text exists, but they have no '+what+' in the wiki yet.</div>'+docGrid(rows,o.slots);
  var grp=function(lab,a){return a.length?'<div class="qa-line"><span class="qa-lab">'+lab+' ('+a.length+')</span> '+capChips(a,chip,cap,true)+'</div>':'';};
  var g=o.info&&o.img?grp('No card and no images',nc.filter(function(x){return x.need&&!x.img;}))+grp('No card yet',nc.filter(function(x){return !x.need||x.img;}))+grp('Card, but no images',ni.filter(function(x){return x.card;})):o.info?grp('No card yet',nc):grp('No images yet',ni);
  h+=g||'<div class="qa-line"><b>Nothing here.</b> Every listed item in this scope already has '+(o.info&&o.img?'a card and images':o.img?'images':'a card')+'.</div>';
  var bp=pool||bosses;
  var rb=bp.filter(function(b){return b.type!=='Special'||ty.indexOf('Special')>=0||bs;});
  if(!o.compact&&rb.length>3){
    var allR=docRows(null,o.slots,o.stars,o.hasStar),allK=allR.map(function(x){return ik(x.it.name);});
    var rk=rb.map(function(b){var ks=docKeySets([b],o.slots),r=allR.filter(function(x,j){return ks[x.it.slot].has(allK[j]);});return {b:b,c:o.info?r.filter(function(x){return !x.card;}).length:0,i:o.img?r.filter(function(x){return x.need&&!x.img;}).length:0};}).filter(function(x){return x.c+x.i>0;}).sort(function(a,b){return (b.c+b.i)-(a.c+a.i)||cmp(a.b.name,b.b.name);});
    if(rk.length){
      var cols=[{h:'Boss',w:'1.6fr'}];if(o.info)cols.push({h:'No card'});if(o.img)cols.push({h:'No images'});
      h+='<div class="qa-slot"><b>Bosses with the most gaps</b>'+grid(cols,rk.slice(0,8).map(function(x){var r=[bossChip(x.b)];if(o.info)r.push(String(x.c));if(o.img)r.push(String(x.i));return r;}))+(rk.length>8?'<div class="qa-note">+'+(rk.length-8)+' more bosses have at least one gap.</div>':'')+'</div>';
    }
  }
  h+='<div class="qa-note">Tap a name to open it. A name with no card opens as \"No item data yet\". Skills only have a card (icon and description), so reroll sample images apply to equipment only.</div>';
  var q=[];
  SLOTS.forEach(function(sl){if(rows.some(function(x){return x.it.slot===sl&&(!x.card||(x.need&&!x.img));}))q.push(sl==='skill'?'Which skills have no card yet?':'Which '+QA_SLOTPL[sl]+' have no images yet?');});
  ['Dungeon','Disaster','Conquest'].forEach(function(t){if(ty.indexOf(t)<0&&!bs)q.push('What is undocumented in '+QA_TYPEPL[t]+'?');});
  if(q.length)h+='<div class="qa-ex">'+q.slice(0,5).map(function(x){return '<button type="button" class="qa-exbtn" data-ex="'+qe(x)+'">'+qe(x.replace(/\?$/,''))+'</button>';}).join('')+'</div>';
  return docMark(card(h));
}
function docItemCard(its){
  return its.slice(0,4).map(function(it){
    var d=docOf(it),h='<div class="qa-title">'+itemChip(it)+'<span class="qa-sub">'+starTxt(it)+' '+it.slot+twinTag(it)+'</span></div>';
    h+='<div class="qa-line"><span class="qa-lab">Written info</span> '+(d.card?'<b>Yes.</b> It has '+(it.slot==='skill'?'a skill':'an item')+' card.':'<b>Not yet.</b> It is listed in the tables but has no card.')+'</div>';
    h+='<div class="qa-line"><span class="qa-lab">Images</span> '+(!d.need?'Skills use a card (icon and description). Reroll sample images are for equipment only.':d.img?'<b>Yes.</b> '+d.img+' reroll sample image'+(d.img===1?'':'s')+'.':'<b>Not yet.</b> No reroll sample image has been added.')+'</div>';
    h+='<div class="qa-note">Listed under '+it.bosses.length+' boss'+(it.bosses.length===1?'':'es')+(it.special?' and a special dungeon':'')+'. Tap the name to open it.</div>';
    return docMark(card(h));
  }).join('');
}
var D_GAP=/\b(missing|miss|lack|lacks|lacking|without|no|not|yet|need|needs|needed|still|incomplete|undone|unfinished|left|remaining|uncovered|empty|absent|blank|havent|hasnt|dont|doesnt|isnt|arent|cant|none|nothing|never|todo|unadded)\b/;
var D_COV=/\b(coverage|documented|undocumented|documentation|completeness|completion|todo|progress)\b|\bto do\b|\bleft to (add|do|write|fill)\b|\bwhats left\b/;
var D_IMG=/\b(images?|pictures?|pics?|photos?|screenshots?|samples?|artwork)\b/;
var D_INF=/\b(tooltips?|cards?|written|writing|descriptions?|flavou?rs?|entry|entries|write ?ups?|pages?)\b/;
var D_GEN=/\b(text|texts|info|information|data|details?)\b/;
/* questions about what has no card / images yet; a plain \"what is missing\" still gets the table gaps too */
function docIntent(w0){
  if(/\b(rac(e|es)|jobs?|class(es)?|origins?|contracts?|runes?)\b/.test(w0))return null;
  var gap=D_GAP.test(w0),cov=D_COV.test(w0),img=D_IMG.test(w0),inf=D_INF.test(w0),gen=D_GEN.test(w0);
  if(!cov&&!(gap&&(img||inf||gen))){
    if((img||inf)&&/^(does|do|did|is|are|has|have|can)\b/.test(w0.trim()))return {img:img,info:inf,chk:true};
    return null;
  }
  var both=(img&&inf)||(!img&&!inf);
  return {img:img||both,info:inf||both,tbl:!img&&!inf&&/\b(missing|incomplete|inconsistent|incorrect|missed|lacking|short|empty|mismatch|wrong)\b/.test(w0)};
}
function docRoute(o,dg){
  if(o.its.length)return docItemCard(o.its);
  var c=docCard({img:dg.img,info:dg.info,bs:o.bs,types:o.types,slots:o.slots,hasSlot:o.hasSlot,stars:o.stars,hasStar:o.hasStar,boss:o.boss});
  return dg.tbl?missingCard(o.bs,o.types)+c:c;
}

/* ---------- new answer types ---------- */
function statLine(s){
  return '<span style="color:'+qe(s.c)+'">'+qe(s.n)+(s.v?' '+qe(s.v):'')+'</span>';
}
function effectCard(it){
  var h='<div class="qa-title">'+itemChip(it)+'<span class="qa-sub">'+starTxt(it)+' '+it.slot+twinTag(it)+'</span></div>';
  var e=EQN[ik(it.name)];
  if(it.slot==='skill'){
    var sk=SKD[norm(it.name)];
    if(sk){h+='<div class="qa-line">'+fmt(clip(plain(SKILL_DETAILS[sk].description),900))+'</div>';}
    else h+='<div>No tooltip has been added for this skill yet.</div>';
  }else if(e){
    e.abil.forEach(function(a){h+='<div class="qa-line"><b style="color:'+qe(a.c)+'">'+qe(a.n)+'</b>'+(a.d?' \u2014 '+fmt(clip(plain(a.d),320)):'')+'</div>';});
    if(e.stats.length)h+='<div class="qa-line">'+e.stats.map(statLine).join('<span class="qa-none"> \u00B7 </span>')+'</div>';
    if(!e.abil.length&&!e.stats.length)h+='<div>This item has no ability or visible stats listed.</div>';
  }else h+='<div>No tooltip has been added for this item yet.</div>';
  h+='<div class="qa-note">'+(it.bosses.length?'Found in '+it.bosses.length+' boss'+(it.bosses.length===1?'':'es')+'. Tap the name for the full tooltip.':'Tap the name for the full tooltip.')+'</div>';
  return card(h);
}
function termCard(key){
  var t=TERMS[key]||{};
  return card('<div class="qa-title">'+qe(key)+'<span class="qa-sub">term</span></div><div class="qa-line">'+fmt(plain(t.description||'No description yet.'))+'</div>');
}
function eqStars(e){return e.it?Array.from(e.it.stars):[e.stars];}
function eqFilter(list,stars,slots,hasStar,hasSlot,bs){
  return list.filter(function(e){
    if(hasSlot&&(!e.it||slots.indexOf(e.it.slot)<0))return false;
    if(hasStar&&!eqStars(e).some(function(s){return stars.indexOf(s)>=0;}))return false;
    if(bs&&bs.length&&!(e.it&&bs.some(function(b){return bossHas(b,e.it);})))return false;
    return true;
  });
}
function filterText(stars,slots,hasStar,hasSlot){
  return (hasStar?(stars.length===1?stars[0]+'\u2605 ':'6\u2605/7\u2605 '):'')+(hasSlot?slots.map(function(x){return SL[x].toLowerCase();}).join('/'):'items');
}
function relatedStats(s){
  var k=s.key,out=[];
  STATKEYS.forEach(function(o){
    if(o===k)return;
    if((' '+o+' ').indexOf(' '+k+' ')>=0||(' '+k+' ').indexOf(' '+o+' ')>=0)out.push(STAT[o]);
  });
  return out.slice(0,6);
}
function statCard(sfs,bs,stars,slots,hasStar,hasSlot){
  sfs=sfs.slice(0,3);
  var list=EQ.filter(function(e){return sfs.every(function(s){return s.eq.indexOf(e)>=0;})}),note='';
  if(!list.length&&sfs.length>1){
    list=EQ.filter(function(e){return sfs.some(function(s){return s.eq.indexOf(e)>=0;});});
    note='<div class="qa-note">No equipment has all of these, so this shows equipment with any of them.</div>';
  }
  var total=list.length;
  var skillAsk=hasSlot&&slots.length===1&&slots[0]==='skill';
  list=eqFilter(list,stars,slots,hasStar,hasSlot,bs).sort(byStarName);
  var hid=false;
  if(QA_SUPER&&list.length&&sfs.length===1&&sfs[0].kind==='stat'){
    hid=list.every(function(e){var xs=e.stats.filter(function(x){return norm(x.n)===sfs[0].key;});return xs.length&&xs.every(function(x){return /\?\?/.test(x.v);});});
  }
  var h='<div class="qa-title">'+sfs.map(function(s){return '<span style="color:'+qe(s.c)+'">'+qe(s.n)+'</span>';}).join(' + ')+'<span class="qa-sub">'+(sfs.length===1?(sfs[0].kind==='ability'?'ability':'stat'):'stats')+'</span></div>';
  sfs.slice(0,2).forEach(function(s){
    var t=TERMK[s.key],desc=t?TERMS[t].description:s.d;
    if(desc&&!hid)h+='<div class="qa-line">'+fmt(clip(plain(desc),360))+'</div>';
  });
  if(hid)h+='<div class="qa-lead"><b>Cannot rank by '+qe(sfs[0].n)+'.</b> The guide hides equipment stat values (shown as ??), so no piece can be called the highest or lowest.</div>';
  var scope=[];
  if(hasStar||hasSlot)scope.push(filterText(stars,slots,hasStar,hasSlot));
  if(bs&&bs.length)scope.push('in '+bs.map(function(b){return b.name;}).join(' / '));
  if(skillAsk)h+='<div class="qa-line">Stats like this are only found on equipment, not skills.</div>';
  else if(!list.length)h+='<div class="qa-line">No equipment'+(scope.length?' ('+qe(scope.join(', '))+')':'')+' has '+(sfs.length===1?'it':'these')+' in the wiki'+(total?' (it exists on '+total+' other piece'+(total===1?'':'s')+' of equipment)':'')+'.</div>';
  else h+='<div class="qa-line"><span class="qa-lab">'+list.length+' equipment'+(scope.length?' \u00B7 '+qe(scope.join(', ')):'')+'</span> '+capChips(list,eqChip,8)+'</div>';
  h+=note;
  if(sfs.length===1){
    var rel=relatedStats(sfs[0]);
    if(rel.length)h+='<div class="qa-note">Related:</div><div class="qa-ex">'+rel.map(function(r){return '<button type="button" class="qa-exbtn" data-ex="'+qe('Which items give '+r.n+'?')+'">'+qe(r.n)+'</button>';}).join('')+'</div>';
  }
  return card(h);
}
/* A word like "burn" or "resistance" that appears inside several stat names. */
var stem=function(t){return t.length>5?t.replace(/(ances?|ing|ed|es|s)$/,''):t.replace(/s$/,'');};
function familyStats(w0){
  var toks=norm(w0).split(' ').filter(function(t){return t.length>=4&&!FILL[t]&&!/^\d+$/.test(t);}).map(stem).filter(function(t){return t.length>=3;});
  if(!toks.length)return [];
  var res=[];
  STATKEYS.forEach(function(k){
    var kt=k.split(' ').map(stem);
    if(toks.every(function(t){return kt.some(function(x){return x===t||(t.length>=4&&x.indexOf(t)===0);});}))res.push(STAT[k]);
  });
  return res;
}
function familyCard(fam,bs,stars,slots,hasStar,hasSlot){
  var seen=[],byEq=[];
  fam.forEach(function(s){s.eq.forEach(function(e){if(byEq.indexOf(e)<0)byEq.push(e);});});
  var list=eqFilter(byEq,stars,slots,hasStar,hasSlot,bs).sort(byStarName);
  var h='<div class="qa-title">Related stats and abilities<span class="qa-sub">'+fam.length+' match'+(fam.length===1?'':'es')+'</span></div>';
  fam.slice(0,12).forEach(function(s){
    var l=eqFilter(s.eq,stars,slots,hasStar,hasSlot,bs).sort(byStarName);
    if(!l.length)return;
    h+='<div class="qa-line"><span class="qa-lab" style="color:'+qe(s.c)+'">'+qe(s.n)+' ('+l.length+')</span> '+capChips(l,eqChip,12)+'</div>';
  });
  if(!list.length)h+='<div class="qa-line">No equipment matches those filters.</div>';
  if(fam.length>12)h+='<div class="qa-note">+'+(fam.length-12)+' more related stats not shown. Ask about one by name.</div>';
  return card(h);
}
function hasStatCard(its,sfs){
  var h='';
  its.slice(0,3).forEach(function(it){
    var e=EQN[ik(it.name)];
    sfs.slice(0,3).forEach(function(s){
      if(!e){h+='<div class="qa-line">'+itemChip(it)+' has no tooltip in the wiki yet, so I can\'t check '+qe(s.n)+'.</div>';return;}
      var f=e.all.filter(function(x){return norm(x.n)===s.key;})[0];
      h+='<div class="qa-line"><b>'+(f?'Yes.':'No.')+'</b> '+itemChip(it)+(f?' has <span style="color:'+qe(f.c)+'">'+qe(f.n)+(f.v?' '+qe(f.v):'')+'</span>.':' does not list '+qe(s.n)+'.')+'</div>';
    });
  });
  return card(h);
}
function typeCard(its,asked){
  return card(its.slice(0,3).map(function(it){
    var ok=asked&&asked.length?asked.indexOf(it.slot)>=0:null;
    return '<div class="qa-line">'+(ok===null?'':'<b>'+(ok?'Yes.':'No.')+'</b> ')+itemChip(it)+' is a <b>'+starTxt(it)+' '+it.slot+'</b>.</div>';
  }).join(''));
}
function elsewhere(it,skip){
  var l=it.bosses.filter(function(b){return skip.indexOf(b)<0;}).sort(function(a,b){return cmp(a.name,b.name);});
  if(!l.length)return '';
  return '<div class="qa-line"><span class="qa-lab">'+qe(it.name)+' is found in ('+l.length+')</span> '+capChips(l,bossChip,12)+'</div>';
}
function yesNoCard(its,bs,types){
  var h='';
  its=its.slice(0,3);
  if(bs.length){
    its.forEach(function(it){
      var anyNo=false;
      bs.slice(0,3).forEach(function(b){
        var st=starIn(b,it),yes=st.length>0;if(!yes)anyNo=true;
        h+='<div class="qa-line"><b>'+(yes?'Yes.':'No.')+'</b> '+bossChip(b)+(yes?' lists ':' does not list ')+itemChip(it)+(yes?' ('+st.map(function(s){return s+'\u2605';}).join('/')+' '+it.slot+').':'.')+'</div>';
      });
      if(anyNo)h+=elsewhere(it,bs);
    });
    h+=spNote(bs);
  }else{
    its.forEach(function(it){
      types.forEach(function(t){
        var l=t==='Special'?bosses.filter(function(b){return b.type==='Special'&&bossHas(b,it);}):it.bosses.filter(function(b){return b.type===t;});
        l=l.slice().sort(function(a,b){return cmp(a.name,b.name);});
        h+='<div class="qa-line"><b>'+(l.length?'Yes.':'No.')+'</b> '+(l.length?l.length+' '+(l.length===1?PLURAL[t].replace(/s$/,''):PLURAL[t])+' list ':'No '+PLURAL[t].replace(/s$/,'')+' lists ')+itemChip(it)+(l.length?': '+capChips(l,bossChip,14):'.')+'</div>';
      });
    });
  }
  return card(h);
}
function withoutCard(its,types){
  its=its.slice(0,3);
  var pool=real.filter(function(b){return !types.length||types.indexOf(b.type)>=0;});
  if(!pool.length)pool=real;
  var miss=pool.filter(function(b){return its.every(function(it){return !bossHas(b,it);});});
  var h='<div class="qa-title">Bosses without '+its.map(function(i){return itemChip(i);}).join(' or ')+'<span class="qa-sub">'+miss.length+' of '+pool.length+'</span></div>';
  if(!miss.length)return card(h+'<div>Every boss in that group lists it.</div>');
  ['Dungeon','Disaster','Conquest'].forEach(function(t){
    var l=miss.filter(function(b){return b.type===t;}).sort(function(a,b){return cmp(a.name,b.name);});
    if(l.length)h+='<div class="qa-line"><span class="qa-lab">'+PLURAL[t]+' ('+l.length+')</span> '+l.map(bossChip).join('')+'</div>';
  });
  return card(h);
}
function bossCount(b,stars,slots){var n=0;slots.forEach(function(sl){stars.forEach(function(s){n+=b.lists[sl][s===7?1:0].length;});});return n;}
function rankBosses(types,stars,slots,hasStar,hasSlot,asc){
  var pool=real.filter(function(b){return !types.length||types.indexOf(b.type)>=0;});
  if(!pool.length)pool=real;
  var rows=pool.map(function(b){return {b:b,n:bossCount(b,stars,slots)};});
  rows.sort(function(a,b){return (asc?a.n-b.n:b.n-a.n)||cmp(a.b.name,b.b.name);});
  var what=filterText(stars,slots,hasStar,hasSlot),h='<div class="qa-title">'+(asc?'Fewest ':'Most ')+qe(what)+' per boss</div>';
  if(rows[0].n===rows[rows.length-1].n)return card(h+'<div>Every one of the '+rows.length+' bosses lists the same number: <b>'+rows[0].n+'</b>. There is no single '+(asc?'fewest':'most')+'.</div><div class="qa-note">That is the standard pattern. Ask "which bosses are missing items" to see the exceptions.</div>');
  var ties=rows.filter(function(r){return r.n===rows[0].n;});
  h+='<div>'+(ties.length===1?'The answer is ':'Tied at ')+'<b>'+rows[0].n+'</b>: '+capChips(ties.map(function(r){return r.b;}),bossChip,15)+'</div>';
  h+=grid([{h:'Boss',w:'1.6fr'},{h:qe(what)}],rows.slice(0,6).map(function(r){return [bossChip(r.b),String(r.n)];}));
  if(rows.some(function(r){return r.n===0;}))h+='<div class="qa-note">A count of 0 usually means that boss\'s items have not been added to the table yet.</div>';
  return card(h);
}
function rankItems(types,stars,slots,hasStar,hasSlot,asc){
  var arr=[];
  items.forEach(function(it){
    if(slots.indexOf(it.slot)<0)return;
    if(hasStar&&!stars.some(function(s){return it.stars.has(s);}))return;
    var bs=it.bosses.filter(function(b){return !types.length||types.indexOf(b.type)>=0;});
    if(bs.length)arr.push({it:it,n:bs.length});
  });
  var what=filterText(stars,slots,hasStar,hasSlot),h='<div class="qa-title">'+(asc?'Rarest ':'Most common ')+qe(what)+'<span class="qa-sub">by number of bosses</span></div>';
  if(!arr.length)return card(h+'<div>Nothing matches that.</div>');
  var lv={};arr.forEach(function(r){(lv[r.n]=lv[r.n]||[]).push(r.it);});
  var keys=Object.keys(lv).map(Number).sort(function(a,b){return asc?a-b:b-a;}).slice(0,3);
  keys.forEach(function(k){
    var l=lv[k].sort(function(a,b){var sa=a.stars.has(7)?1:0,sb=b.stars.has(7)?1:0;return (sb-sa)||cmp(a.name,b.name);});
    h+='<div class="qa-line"><span class="qa-lab">'+k+' boss'+(k===1?'':'es')+'</span> '+capChips(l,function(x){return itemChip(x);},14)+'</div>';
  });
  return card(h);
}
function namesOf(b,sl,st){return b.lists[sl][st===7?1:0];}
/* ---------- compare bosses: what differs first, then what they share ----------
   Modes (set by the router):  diff   "compare X and Y"            -> only in X, only in Y, then both
                               dir    "what is in X but not in Y"  -> only what X has that Y lacks
                               common "what do X and Y share"      -> only the shared items
   Works on 2 or 3 bosses and on any mix of categories (weapon, armor, accessory, skill) and stars (6, 7).
   The card carries data-cmp / data-bosses / data-base so a follow-up such as "only armor" can redo the same comparison. */
var SLN={weapon:['weapon','weapons'],armor:['armor','armor'],accessory:['accessory','accessories'],skill:['skill','skills']};
function cmpNoun(n,slots,stars){return (stars.length===1?stars[0]+'★ ':'')+(slots.length===1?SLN[slots[0]][n===1?0:1]:(n===1?'item':'items'));}
function cmpSets(bs,stars,slots){
  var srt=function(a){return a.sort(function(x,y){return (y.st-x.st)||cmp(x.n,y.n);});};
  return slots.map(function(sl){
    var pools=bs.map(function(b){
      var m={},ord=[];
      stars.forEach(function(st){namesOf(b,sl,st).forEach(function(n){var k=ik(n);if(!m[k]){m[k]={n:n,st:st};ord.push(k);}else if(st>m[k].st)m[k].st=st;});});
      return {m:m,ord:ord};
    });
    var only=bs.map(function(){return [];}),all=[],mid=0,seen={};
    pools.forEach(function(p){p.ord.forEach(function(k){
      if(seen[k])return;seen[k]=1;
      var has=[],top=0,nm='';
      pools.forEach(function(q,i){if(q.m[k]){has.push(i);if(!nm)nm=q.m[k].n;if(q.m[k].st>top)top=q.m[k].st;}});
      var r={n:nm,st:top};
      if(has.length===pools.length)all.push(r);else if(has.length===1)only[has[0]].push(r);else mid++;
    });});
    return {sl:sl,only:only.map(srt),all:srt(all),mid:mid};
  });
}
function cmpChips(arr,sl){return arr.map(function(r){return nameChip(r.n,sl,r.st);}).join('');}
/* "but not" questions: which boss is left out (ex) and which one is listed (base). Cue words are read from the question
   with every known name already blanked out, so a name can never act as a cue. */
var CUE_A=/\b(?:but not|and not|not in|not on|not from|not found in|not part of|isnt in|isnt on|isnt found in|arent in|arent on|except for|except|excluding|without|minus|other than|apart from|aside from|missing from|absent from)\b/;
var CUE_B=/\b(?:doesnt|does not|dont|do not|didnt|hasnt|havent|has not|have not|not have|not has|not get|not drop|not drops|not list|not lists|not contain|not include|lacks|lack|lacking|missing|never has|never have)\b/;
var CUE_C=/\b(?:extra|additional|exclusive|exclusively|unique|uniquely|only in|only has|only have)\b/;
function cmpDirection(w,pos,n,compareQ){
  if(n<2||!pos)return null;
  var a=CUE_A.exec(w),b=CUE_B.exec(w),c=compareQ?null:CUE_C.exec(w),ex=-1,i;
  if(a&&(!b||a.index<=b.index)){for(i=0;i<n;i++){if(pos[i]>=a.index){ex=i;break;}}}
  else if(b){for(i=0;i<n;i++){if(pos[i]<b.index)ex=i;}}
  else if(c)ex=-2;
  if(ex===-1)return null;
  var base=0;if(ex>=0){while(base===ex)base++;}
  return base<n?{base:base}:null;
}
/* the comparison shown by the previous answer, so "only armor" or "7 only" can redo it */
function cmpPrev(){
  try{
    var cs=out&&out.querySelectorAll?out.querySelectorAll('.qa-card[data-cmp]'):null;
    if(!cs||!cs.length)return null;
    var c=cs[cs.length-1],bs=(c.getAttribute('data-bosses')||'').split('|').map(function(nm){return bosses.filter(function(b){return b.name===nm;})[0];});
    if(bs.length<2||bs.some(function(b){return !b;}))return null;
    return {bs:bs,mode:c.getAttribute('data-cmp'),base:+c.getAttribute('data-base')||0};
  }catch(e){return null;}
}
var FOL_FILL={and:1,now:1,then:1,ok:1,okay:1,only:1,just:1,what:1,whats:1,about:1,how:1,show:1,me:1,same:1,'for':1,'with':1,but:1,'try':1,the:1,too:1,instead:1,please:1,also:1,'in':1,those:1,them:1,it:1,list:1,filter:1,to:1,by:1,give:1,these:1,all:1,of:1};
function followCat(w){
  var t=w.trim().split(' ').filter(Boolean),hit=0;
  if(!t.length)return false;
  for(var i=0;i<t.length;i++){
    if(/^(weapons?|armou?rs?|accessor(?:y|ies)|skills?|equipments?|6|7|six|seven|stars?)$/.test(t[i]))hit++;
    else if(!FOL_FILL[t[i]])return false;
  }
  return hit>0;
}
function bossDiff(bs,stars,slots,o){
  o=o||{};
  var mode=o.mode||'diff',n=bs.length,base=Math.min(Math.max(o.base||0,0),n-1),sets=cmpSets(bs,stars,slots);
  var B=function(b){return '<b>'+qe(b.name)+'</b>';};
  var join=function(a,w){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' '+w+' '+a[a.length-1];};
  var nm=bs.map(function(b){return b.name;});
  var onlyN=bs.map(function(b,i){var t=0;sets.forEach(function(s){t+=s.only[i].length;});return t;});
  var allN=0,midN=0;sets.forEach(function(s){allN+=s.all.length;midN+=s.mid;});
  var noun=function(k){return cmpNoun(k,slots,stars);};
  var btn=function(label,text){return '<button type="button" class="qa-exbtn" data-ex="'+qe(text)+'">'+qe(label)+'</button>';};
  var ask=function(m,sl,bi){
    var tail=sl?': '+SLN[sl][1]+' only':'';
    if(m==='dir'){bi=bi==null?base:bi;return 'What is in '+nm[bi]+' but not in '+join(nm.filter(function(_,j){return j!==bi;}),'or')+tail+'?';}
    if(m==='common')return 'What do '+join(nm,'and')+' have in common'+tail+'?';
    return 'Compare '+join(nm,'and')+tail+'.';
  };
  /* "A has 4 items that B does not." */
  var hasLine=function(i){
    var oth=bs.filter(function(_,j){return j!==i;}),ob=join(oth.map(B),'and'),vb=oth.length>1?'do':'does';
    return '<div class="qa-line">'+B(bs[i])+' has '+(onlyN[i]?'<b>'+onlyN[i]+'</b> '+noun(onlyN[i]):'nothing')+' that '+ob+' '+vb+' not.</div>';
  };
  var catBtns=function(m,withItems){
    var bt='';
    if(slots.length>1)sets.forEach(function(s){
      if(withItems&&!withItems(s))return;
      bt+=btn(SL[s.sl]+' only',ask(m,s.sl));
    });
    else bt+=btn('All categories',ask(m));
    return bt;
  };
  var h='',btns='';
  if(mode==='dir'){
    var ex=bs.filter(function(_,j){return j!==base;});
    h+='<div class="qa-title">In '+bossChip(bs[base])+' but not in '+join(ex.map(bossChip),'or')+'</div>';
    h+=hasLine(base);
    sets.forEach(function(s){
      var l=s.only[base];if(!l.length)return;
      h+='<div class="qa-slot"><b>'+SL[s.sl]+'</b><span class="qa-sub">'+l.length+'</span><div class="qa-line">'+cmpChips(l,s.sl)+'</div></div>';
    });
    if(n===2){
      var r=1-base;
      h+='<div class="qa-note">'+qe(nm[r])+' has '+(onlyN[r]||'no')+' '+noun(onlyN[r])+' that '+qe(nm[base])+' does not, and both list '+allN+' '+noun(allN)+' in common.</div>';
      btns+=btn('Only in '+nm[r],ask('dir',slots.length===1?slots[0]:null,r))+btn('Compare both ways',ask('diff',slots.length===1?slots[0]:null));
    }
    btns+=catBtns('dir',function(s){return s.only[base].length>0;});
  }else if(mode==='common'){
    h+='<div class="qa-title">'+bs.map(bossChip).join(' and ')+'<span class="qa-sub">in common</span></div>';
    h+='<div class="qa-line">'+(allN?(n===2?'Both':'All '+n)+' have <b>'+allN+'</b> '+noun(allN)+' in common.':'They have no '+noun(2)+' in common.')+'</div>';
    sets.forEach(function(s){
      if(!s.all.length)return;
      h+='<div class="qa-slot"><b>'+SL[s.sl]+'</b><span class="qa-sub">'+s.all.length+'</span><div class="qa-line">'+cmpChips(s.all,s.sl)+'</div></div>';
    });
    h+='<div class="qa-note">Not shared: '+bs.map(function(b,i){return qe(b.name)+' has '+onlyN[i]+' '+noun(onlyN[i])+' that '+(n===2?'the other lacks':'the others lack');}).join('; ')+'.</div>';
    btns+=btn('What differs?',ask('diff',slots.length===1?slots[0]:null))+catBtns('common',function(s){return s.all.length>0;});
  }else{
    h+='<div class="qa-title">'+bs.map(bossChip).join(' vs ')+'<span class="qa-sub">what differs</span></div>';
    if(n===2&&!onlyN[0]&&!onlyN[1]&&allN)h+='<div class="qa-line">Both list exactly the same <b>'+allN+'</b> '+noun(allN)+'.</div>';
    else{
      bs.forEach(function(_,i){h+=hasLine(i);});
      h+='<div class="qa-line">'+(allN?(n===2?'Both':'All '+n)+' have <b>'+allN+'</b> '+noun(allN)+' in common.':'They have no '+noun(2)+' in common.')+(n>2&&midN?' '+midN+' more '+(midN===1?'appears':'appear')+' in two of the '+n+'.':'')+'</div>';
    }
    sets.forEach(function(s){
      var body='',any=false;
      bs.forEach(function(b,i){
        var l=s.only[i];if(l.length)any=true;
        body+='<div class="qa-line"><span class="qa-lab">Only in '+qe(b.name)+' ('+l.length+')</span>'+(l.length?cmpChips(l,s.sl):'<span class="qa-none">none</span>')+'</div>';
      });
      if(!any)body='<div class="qa-line"><span class="qa-none">'+(s.all.length?'No difference. Both list the same '+s.all.length+'.':'none listed')+'</span></div>';
      h+='<div class="qa-slot"><b>'+SL[s.sl]+'</b>'+body+'</div>';
    });
    if(allN){
      var sh=sets.filter(function(s){return s.all.length;}).map(function(s){return '<div class="qa-line"><span class="qa-lab">'+SL[s.sl]+' ('+s.all.length+')</span>'+cmpChips(s.all,s.sl)+'</div>';}).join('');
      h+='<div class="qa-slot"><b>'+(n===2?'Both have':'All '+n+' have')+'</b><span class="qa-sub">'+allN+'</span>'+(allN>12?'<details class="qa-more"><summary>Show the '+allN+' they share</summary>'+sh+'</details>':sh)+'</div>';
    }
    if(n===2)nm.forEach(function(x,i){btns+=btn('Only in '+x,ask('dir',slots.length===1?slots[0]:null,i));});
    btns+=catBtns('diff',function(s){return s.only.some(function(l){return l.length;});});
  }
  h+=spNote(bs);
  if(o.cut)h+='<div class="qa-note">More than three bosses were named, so only the first three are compared.</div>';
  if(btns)h+='<div class="qa-ex">'+btns+'</div>';
  return card(h).replace('<div class="qa-card">','<div class="qa-card" data-cmp="'+mode+'" data-bosses="'+qe(nm.join('|'))+'" data-base="'+base+'">');
}
function compareBosses(bs,stars,slots){return bossDiff(bs,stars,slots,{mode:'diff'});}
function eqSummary(it){
  var e=EQN[ik(it.name)];
  if(!e)return '<span class="qa-none">no tooltip yet</span>';
  return e.abil.map(function(a){return '<b style="color:'+qe(a.c)+'">'+qe(a.n)+'</b>';}).concat(e.stats.map(statLine)).join('<span class="qa-none"> \u00B7 </span>')||'<span class="qa-none">no ability or stats</span>';
}
function compareItems(its,askBetter){
  var html=compareItemsBase(its),x='';
  its.slice(0,3).forEach(function(it){var e=it.slot==='skill'?null:EQN[ik(it.name)];if(!e)return;
    e.abil.forEach(function(a){if(a.d)x+='<div class="qa-line">'+itemChip(it)+' <b style="color:'+qe(a.c)+'">'+qe(a.n)+'</b> \u2014 '+fmt(clip(plain(a.d),240))+'</div>';});});
  if(x)x='<div class="qa-slot"><b>What the abilities do</b>'+x+'</div>';
  if(askBetter&&its.some(function(i){return i.slot!=='skill';})){
    var su={};its.slice(0,3).forEach(function(i){su[i.slot]=1;});
    var mixed=Object.keys(su).length>1;
    html=html.replace('</div>','</div><div class="qa-lead"><b>No ranking.</b> The guide does not say which is better'+(mixed?', and these are different kinds of item ('+its.slice(0,3).map(function(i){return i.slot;}).join(' vs ')+')':'')+'. Below: what each does and where it drops. Values shown as ?? are not fixed: they rise as the item levels up and are random each time you get or reroll it.</div>');
  }
  return x?html.replace(/<\/div>$/,x+'</div>'):html;
}
function compareItemsBase(its){
  its=its.slice(0,3);
  var h='<div class="qa-title">'+its.map(function(i){return itemChip(i);}).join(' vs ')+'</div>';
  its.forEach(function(it){
    h+='<div class="qa-slot">'+itemChip(it)+'<span class="qa-sub">'+starTxt(it)+' '+it.slot+' \u00B7 '+it.bosses.length+' boss'+(it.bosses.length===1?'':'es')+'</span><div class="qa-line">'+(it.slot==='skill'?'<span class="qa-none">Tap the name for the skill tooltip.</span>':eqSummary(it))+'</div></div>';
  });
  var common=its[0].bosses.filter(function(b){return its.every(function(i){return i.bosses.indexOf(b)>=0;});});
  h+='<div class="qa-slot"><b>Dropped by both</b>'+(common.length?'<div class="qa-line"><span class="qa-lab">'+common.length+'</span>'+capChips(common.sort(function(a,b){return cmp(a.name,b.name);}),bossChip,14)+'</div>':'<div class="qa-line"><span class="qa-none">No boss lists all of them.</span></div>')+'</div>';
  return card(h);
}
/* ---------- random suggestions: built from the real tables, and each one is test-run through answer() before it is shown ---------- */
var QA_GEN_BUSY=false,QA_POOL=null;
var QA_SLOTPL={weapon:'weapons',armor:'armor',accessory:'accessories',skill:'skills'};
var QA_TYPEPL={Dungeon:'dungeons',Disaster:'disasters',Conquest:'conquests'};
function qaRand(n){return Math.floor(Math.random()*n);}
function qaPick(a){return a[qaRand(a.length)];}
function qaShuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=qaRand(i+1),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function qaStar(){return qaPick([6,7])+'\u2605';}
function qaPools(){
  if(QA_POOL)return QA_POOL;
  var P={drop:[],eq:[],sk:[],bosses:real.slice(),stats:[],terms:[]};
  items.forEach(function(it){
    if(!it.bosses.length||CASEDUP[it.name])return;
    P.drop.push(it);
    if(it.slot==='skill')P.sk.push(it);
    else{var e=EQN[ik(it.name)];if(e&&e.all.length)P.eq.push(it);}
  });
  STATKEYS.forEach(function(k){var s=STAT[k];if(s.eq.length>=2&&s.eq.some(function(e){return e.it&&e.it.bosses.length;}))P.stats.push(s);});
  Object.keys(TERMK).forEach(function(k){if(!STAT[k])P.terms.push(TERMK[k]);});
  return QA_POOL=P;
}
function qaOther(arr,x){var r=arr.filter(function(y){return y!==x;});return r.length?qaPick(r):null;}
/* ---------- strategy questions: one-shot hits, best skill, getting more skill uses, early survival (built from the skill data) ---------- */
var STR=(function(){
  var KBJ=[];try{KBJ=JSON.parse(document.getElementById('qaKB').textContent);}catch(e){}
  var plainT=function(s){return String(s||'').replace(/\{\{([^}]*)\}\}/g,function(m,i){var p=i.split('|');return p[1]||p[0];}).replace(/\[\[(.+?)\]\]/g,'$1').replace(/%%(.+?)%%/g,'$1').replace(/~~(.+?)~~/g,'$1').replace(/@@(.+?)@@/g,'$1').replace(/\^\^(.+?)\^\^/g,'$1').replace(/\$\$/g,'').replace(/##(.+?)##/g,'$1').replace(/\s+/g,' ').trim();};
  var rows=[],seenN={};
  function add(n,t,st){
    var k=norm(n);if(!k||seenN[k])return;seenN[k]=1;
    var best=0,bh=1,bform='',m,bel='',bacc='',re=/(?:\(x(\d+)\)\s*)?Direct attack your opponent\.?\s*(\d[\d,]*)%\s*of\s+your\s+(?:STR|DEX|INT|PIE)/gi;
    while((m=re.exec(t))){var pm=+m[2].replace(/,/g,''),ph=m[1]?+m[1]:1;if(pm*ph>best){best=pm*ph;bh=ph;bform='';var seg=t.slice(m.index,m.index+420),em=seg.match(/Element: (\w+)/),am=seg.match(/(\d+)% (Normal hit|Pure hit|Ailment hit)/);bel=em?em[1]:'';bacc=am?am[1]+'% '+am[2]:'';var fm=t.slice(0,m.index).match(/\/ ([^\/]{2,40}) \/ \[On Use\]\s*$/);if(fm)bform=fm[1];}}
    var ms=best?[best/bh]:[];
    var hx=best?[0,bh]:null,us=t.match(/Remaining Uses: -?(\d+)\/(\d+)/),sc=t.match(/Enhance power by (\d+)% per your Total Remaining Uses of all skills/),rf=t.match(/Increase (\d+) Remaining of yourself all skills/),sm=t.match(/^(\d)\u2605/);
    var head=t.slice(0,110);
    var ss=0;t.split(/ \/ [^\/]{2,40} \/ \[On Use\]/)[0].split(/(?=Grant )/).slice(1).forEach(function(sg){var gm=sg.slice(0,160).match(/^Grant (.+?) to (?:yourself|you)\b(?! and your opponent)(.*)/);if(gm&&/Lasts \d+/.test(gm[2].split(/(?=Grant |Cause |Direct |Remove |Increase |Reduce )/)[0]))ss++;});
    rows.push({n:n,t:t,ss:ss,st:st||(sm?+sm[1]:0),mult:ms.length?ms[0]:0,hits:hx?+hx[1]:1,form:bform,el:bel,acc:bacc,max:us?+us[2]:0,cost:us?+us[1]:0,casts:us&&+us[1]>0?Math.max(1,Math.floor(+us[2]/+us[1])):0,
      stack:/Cause your opponent to lose\s*(\d+\s*)?HP stack/i.test(t),direct:best>0,scale:sc?+sc[1]:0,refill:(rf&&!/Reduce \d+ Remaining uses of yourself/i.test(t))?+rf[1]:0,quick:/\bQuick\b/.test(t),
      surv:!/\[On Use\] (\(x\d+\) )?Direct attack/.test(head)&&/(Heal yourself|shield|Evasion|Shielding|Ironclad|Escape from combat|cure ailment|Invincible)/i.test(head)});
  }
  if(typeof SKILL_DETAILS!=='undefined')Object.keys(SKILL_DETAILS).forEach(function(k){var d=SKILL_DETAILS[k];add(k,plainT(d.description),d.stars);});
  KBJ.forEach(function(e){if(e[0]==='Skill')add(e[1],e[2]);});
  var byN={};rows.forEach(function(r){byN[norm(r.n)]=r;});
  function dmg(r){return r.mult*r.hits;}
  function top(f,sortf,n){return rows.filter(f).sort(sortf).slice(0,n);}
  var PT=['Lemegeton','Catastrophe','Devastating Blow','Cruel Strike'],ptRows=PT.map(function(n){return byN[norm(n)];}).filter(Boolean),
      burst=ptRows.concat(top(function(r){return r.direct&&!r.form&&r.mult>=300&&PT.indexOf(r.n)<0;},function(a,b){return (b.el==='Void')-(a.el==='Void')||dmg(b)-dmg(a);},4)),
      stackers=rows.filter(function(r){return r.stack&&r.st>=6;}).sort(function(a,b){return dmg(b)-dmg(a);}),
      refillers=rows.filter(function(r){return r.refill;}),scalers=rows.filter(function(r){return r.scale;}),
      early=rows.filter(function(r){return r.st>0&&r.st<=3&&r.surv;}),
      statGivers=rows.filter(function(r){return r.ss>=3&&!r.refill;}).sort(function(a,b){return b.st-a.st;});
  var btn=function(r){return '<button type="button" class="qa-exbtn" data-ex="'+qe('Tell me about '+r.n)+'">'+qe(r.n)+'</button>';};
  var chips=function(a){return '<div class="qa-ex">'+a.map(btn).join('')+'</div>';};
  var line=function(l,t){return '<div class="qa-line"><span class="qa-lab">'+qe(l)+'</span> '+t+'</div>';};
  /* skill name -> tappable chip (opens its card) when the skill has a card; otherwise the same plain text as before */
  var skN=function(r,bold){var n=r.n;if(typeof SKILL_DETAILS!=='undefined'&&SKILL_DETAILS[n])return nameChip(n,'skill',r.st>=7?7:6);return bold===false?qe(n):'<b>'+qe(n)+'</b>';};
  var lineH=function(l,t){return '<div class="qa-line"><span class="qa-lab">'+l+'</span> '+t+'</div>';};
  var title=function(t,s){return '<div class="qa-title">'+qe(t)+'<span class="qa-sub">'+qe(s)+'</span></div>';};
  var hit=function(r){return (r.form?'('+r.form+' form) ':'')+(r.mult?r.mult.toLocaleString('en-US')+'%'+(r.hits>1?' x'+r.hits:''):'')+(r.el?' \u00b7 '+r.el:'')+(r.acc?' \u00b7 '+r.acc:'')+(r.stack?' \u00b7 removes HP stacks if it hits':'')+(r.st?' \u00b7 '+r.st+'\u2605':'')+(r.max?' \u00b7 '+r.max+' uses':'');};
  function burstHtml(){
    var h=title('Biggest single hits','from the skill data and player testing');
    var skL=function(n){var r=byN[norm(n)];return r?skN(r,false):qe(n);};
    h+=line('Player-tested order',PT.map(skL).join(', ')+'. The last two are close. '+skL('Lemegeton')+' works best when an Auto rune activates it rather than a direct cast.');
    ptRows.forEach(function(r){h+='<div class="qa-line">'+skN(r)+' '+qe(hit(r))+'</div>';});
    h+='<div class="qa-line">Void damage is rarely resisted, while Physical and Magical damage are commonly resisted by enemy defence. A listed percentage therefore does less damage as Physical or Magical than the same percentage as Void.</div>';
    var oth=burst.filter(function(r){return PT.indexOf(r.n)<0;});
    if(oth.length){h+=line('Other high listed multipliers (main form only)','');oth.forEach(function(r){h+='<div class="qa-line">'+skN(r)+' '+qe(hit(r))+'</div>';});}
    h+=line('Skills that can remove enemy HP stacks',qe(stackers.length+' skills'))+chips(stackers.slice(0,8));
    return h+'<div class="qa-note">Percentages are the listed multipliers of your stats. The guide has no enemy resistance values, so real damage depends on your build and the enemy. Some effects have a hit chance, and a boss can have many HP stacks, so none of these is a guaranteed one-shot.</div>';
  }
  function usesHtml(){
    var h=title('Getting more out of your skill uses','from the skill data');
    refillers.forEach(function(r){h+=lineH(skN(r,false),qe('adds '+r.refill+' remaining use'+(r.refill===1?'':'s')+' to all your skills'+(r.quick?' (Quick)':'')+(r.max?', max '+r.max+' uses':'')));});
    scalers.forEach(function(r){h+=lineH(skN(r,false),qe('+'+r.scale+'% power per Total Remaining Uses of all your skills'+(r.casts===1?' \u00b7 '+oneCast(r):(r.max?' \u00b7 max '+r.max+' uses':''))+(r.mult?' \u00b7 '+r.mult.toLocaleString('en-US')+'%'+(r.hits>1?' x'+r.hits:''):'')));});
    h+='<div class="qa-line">So refilling uses does two jobs: you can cast the strong skills again, and the more uses you hold, the harder skills like these hit.</div>'+chips(refillers.concat(scalers));
    if(refillers.length&&statGivers.length){h+=line('Disenchant synergy','Disenchant restores 1 remaining use to all of your skills, and the amount rises by 100% for each temporary status effect you carry when you cast it. It then removes all of your status effects. It therefore combines well with skills that apply several temporary statuses to you in a single cast, and with skill power runes such as Pure Power (Strong) (Skill Power +3) and Special (Strong) (Skill power +400%), which increase the refill further. Special runes also reduce the Remaining of all skills by 1 (Weak) or 2 (Strong) each time the skill is used or auto-used.')+line('Skill power runes','')+runeChips(POWERS)+line('Skills that grant you three temporary statuses in one cast','')+chips(statGivers);h+='<div class="qa-note">Status counts are read from the skill text. Rune effects are from the game\'s rune screens.</div>';}
    return h;
  }
  function bestHtml(){
    var h=title('Skills by role','from the skill data');
    h+='<div class="qa-line">The guide does not rank skills overall. These are the highest entries for each role, by the listed numbers and effects:</div>';
    h+=line('Biggest hit','')+chips(burst.slice(0,3));
    h+=line('Removes enemy HP stacks','')+chips(stackers.slice(0,4));
    h+=line('Use engine (refill and scale)','')+chips(refillers.concat(scalers).slice(0,4));
    h+=line('Early survival','')+chips(early.slice(0,5));
    return h+'<div class="qa-note">Chosen from the listed numbers and effects. The guide holds no win-rate data.</div>';
  }
  function surviveHtml(){
    var h=title('Surviving the early game','from the guide data');
    h+=line('Cheap skills that heal, shield, dodge or escape','')+chips(early.slice(0,10));
    h+='<div class="qa-line"><span class="qa-lab">Contracts</span> Contracts are permanent items that are never lost when you die in a dungeon run, so bring them if you have them. Unions such as the Sworn Solidarity Society offer them.</div>';
    h+='<div class="qa-ex"><button type="button" class="qa-exbtn" data-ex="Show contracts">Browse contracts</button><button type="button" class="qa-exbtn" data-ex="What is the best early game race?">Best early game race</button></div>';
    return h;
  }
  function names(a){return a.map(function(r){return r.n;}).join(', ');}
  function ctx(kind){
    var pre='You are helping with Buriedbornes 2. The CONTEXT is computed from the guide\'s skill data. Answer the question in under 130 words using only the CONTEXT, in a neutral factual register with no hedging or opinion phrases. Do not invent numbers, say when something is not listed, and do not present an opinion as a game fact. Explain how the skills connect.\n',t='';
    if(kind==='burst'){t+='Player-tested order of hardest hits: Lemegeton, Catastrophe, Devastating Blow, Cruel Strike (the last two are close). Lemegeton works best when an Auto rune activates it rather than a direct cast: it then consumes 1 remaining use and 1 cooldown instead of 99. Void damage is rarely resisted by enemies, while Physical and Magical damage are commonly resisted by enemy defence, so a listed percentage does less damage as Physical or Magical than as Void. The guide has no enemy resistance values.\n';burst.forEach(function(r){t+=r.n+' ('+hit(r)+'): '+r.t.slice(0,230)+'\n';});}
    else if(kind==='uses'){t+='Disenchant synergy: Disenchant restores 1 remaining use to all of your skills, and the amount rises by 100% for each temporary status effect you carry when you cast it. It then removes all of your status effects. It combines well with skills that apply several temporary statuses to you in a single cast ('+names(statGivers)+'), and with skill power runes such as Pure Power (Strong) (Skill Power +3) and Special (Strong) (Skill power +400%), which increase the refill further; Special runes also reduce the Remaining of all skills by 1 (Weak) or 2 (Strong) each time the skill is used or auto-used. Disenchant is Quick.\n';refillers.concat(scalers).forEach(function(r){t+=r.n+(r.casts===1?' ['+oneCast(r)+']':'')+': '+r.t.slice(0,300)+'\n';});}
    else if(kind==='best'){burst.slice(0,3).concat(refillers,scalers.slice(0,2)).forEach(function(r){t+=r.n+': '+r.t.slice(0,200)+'\n';});}
    else t='Cheap early skills that heal, shield, dodge or escape: '+names(early)+'\nContracts are permanent items that are never lost when you die in a dungeon run. Unions such as the Sworn Solidarity Society offer them.\nRule: 6* and 7* equipment and skills do not appear in rerolls unless you reach Savage mode.\n'+early.slice(0,6).map(function(r){return r.n+': '+r.t.slice(0,160);}).join('\n');
    return (pre+t).slice(0,5800);
  }
  function wb(s,n){return new RegExp('\\b'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(s);}
  function detectOld(q,unmatched){
    var s=String(q||'').toLowerCase().replace(/[\u2018\u2019]/g,"'");if(!s.trim()||/\b(rac(e|es)|jobs?|class(es)?|origins?)\b/.test(s))return null;
    var named=rows.filter(function(r){return r.n.length>=4&&wb(s,r.n);}),kind=null;
    if(/\b(spam|more than once|again and again|refill\w*|restor\w*|extra uses|remaining uses|keep using|infinite|pairs? (well )?with|combos?|synerg\w*|work(s)? well with|go(es)? well with|good with|more uses)\b/.test(s)||/stronger.*(uses|remaining)|(uses|remaining).*(stronger|power)/.test(s))kind='uses';
    else if(/\b(one ?shot\w*|single hit|one hit|in one (hit|cast|turn)|insta ?kill|instant(ly)? kill\w*|hardest|most damage|wipe out|burst)\b/.test(s))kind='burst';
    else if(/\bskills?\b/.test(s)&&/\b(best|strongest|top|greatest|overpowered|op)\b/.test(s)&&!named.length)kind='best';
    else if(/\b(surviv\w*|stay alive|not die|keep from dying|dying)\b/.test(s)&&/\b(early|beginner|start\w*|first|new|run|dungeons?)\b/.test(s))kind='survive';
    else if(unmatched&&named.length&&/^(tell me about|what does|what is|how does|explain)\b/.test(s)){var r=named[0];return {kind:'skill',html:title(r.n,'skill')+'<div class="qa-line">'+qe(r.t.length>520?r.t.slice(0,520)+'\u2026':r.t)+'</div>',ctx:null,names:[r.n]};}
    if(!kind)return null;
    var html=kind==='burst'?burstHtml():kind==='uses'?usesHtml():kind==='best'?bestHtml():surviveHtml();
    return {kind:kind,html:card(html),ctx:ctx(kind),names:[]};
  }
  /* ---------- extra intelligence: skill facts, effect search, comparisons, rankings, power boosts, typo tolerance ---------- */
  var PTN={
    'lemegeton':{auto:true,fact:'Works best when an Auto rune activates it instead of a direct cast: it then consumes 1 remaining use and 1 cooldown instead of 99.',boost:'Activate it through an Auto rune. An Auto-rune activation consumes 1 remaining use and 1 cooldown, while a direct cast consumes 99 remaining uses.'},
    'high healing':{fact:'Its Resurrection form restores 1 HP stack. Pure Power (Strong) (Skill Power +3) raises that to 4 stacks, and adding Special (Strong) (Skill power +400%) raises it to 13 stacks (1 + 3 \u00d7 4).',boost:'Pure Power (Strong) (Skill Power +3) raises the Resurrection form from 1 to 4 HP stacks. Adding Special (Strong) (Skill power +400%) raises it to 13 stacks (1 + 3 \u00d7 4). Special (Strong) also reduces the Remaining of all skills by 2 whenever the skill is used or auto-used.'}
  };
  function ptOf(r){return PTN[norm(r.n)]||null;}
  function oneCast(r){var n=ptOf(r);return 'cast directly, it consumes '+r.cost+' of its '+r.max+' uses (one cast per run)'+(n&&n.auto?'; when an Auto rune activates it, it consumes 1 remaining use and 1 cooldown':'');}
  var ENT=[];
  KBJ.forEach(function(e){if(e[0]==='Race'||e[0]==='Job'||e[0]==='Origin'){var f={},parts=String(e[2]).split(/; (?=[A-Z][A-Za-z ]*: )/);parts.forEach(function(p){var i=p.indexOf(': ');if(i>0)f[p.slice(0,i)]=p.slice(i+2);else f.Stats=p;});ENT.push({n:e[1],kind:e[0],f:f,t:String(e[2])});}});
  var entByN={};ENT.forEach(function(en){entByN[norm(en.n)]=en;});
  var FORMSEP=/ \/ [^\/]{2,40} \/ \[On Use\]/;
  function X(r){
    if(r._x)return r._x;
    var main=r.t.split(FORMSEP)[0],x={},m;
    m=main.match(/Cooldown: (\d+)/i);x.cd=m?+m[1]:null;
    m=main.match(/Element: (\w+)/);x.el=m?m[1]:'';
    x.quick=/\bQuick\b/.test(main);x.free=/Free Skill/i.test(main);
    x.forms=[];var fre=/ \/ ([^\/]{2,40}) \/ \[On Use\]/g;while((m=fre.exec(r.t)))x.forms.push(m[1]);
    x.scales=[];var seen={},sre=/Enhance power by (\d+)% per ((?:your |target's )?[A-Za-z' ]+?)(?= \+?\d| \d|\s+(?:Normal|Pure|Ailment|Previous|Lasts|Cooldown|If|Remove|Grant|Cause|Direct|Increase|Reduce|Remaining Uses:|Quick|\[)|$)/g;
    while((m=sre.exec(main))){var lab=m[2].replace(/^your /,'').trim();if(!seen[lab.toLowerCase()]){seen[lab.toLowerCase()]=1;x.scales.push([+m[1],lab]);}}
    return r._x=x;
  }
  function lev(a,b){var m=a.length,n=b.length,d=[],i,j;for(i=0;i<=m;i++){d[i]=[i];}for(j=1;j<=n;j++)d[0][j]=j;for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a.charAt(i-1)===b.charAt(j-1)?0:1));return d[m][n];}
  var fmt=function(n){return n.toLocaleString('en-US');};
  function usesTxt(r){if(!r.max)return 'not listed';var s='max '+r.max+' uses';if(r.cost){s+=', each cast uses '+r.cost;if(r.casts===1&&r.cost>=r.max){var pn=ptOf(r);s+=' (one cast per run when cast directly'+(pn&&pn.auto?'; an Auto-rune activation uses 1 use and 1 cooldown':'')+')';}}return s;}
  function dmgTxt(r){return r.direct?fmt(r.mult)+'%'+(r.hits>1?' \u00d7'+r.hits:'')+(r.el?' \u00b7 '+r.el:'')+(r.acc?' \u00b7 '+r.acc:''):'no direct attack listed';}
  function factsLines(r){
    var x=X(r),h='';
    h+=line('Damage',qe(dmgTxt(r)));
    h+=line('Cooldown',qe(x.cd===null?'not listed':x.cd+' turn'+(x.cd===1?'':'s')));
    h+=line('Uses',qe(usesTxt(r)));
    if(x.quick||x.free)h+=line('Type',qe(x.quick?'Quick skill (does not end your turn)':'Free skill'));
    if(r.stack)h+=line('HP stacks','Removes enemy HP stacks if it hits.');
    x.scales.forEach(function(s){h+=line('Scales with',qe('+'+s[0]+'% power per '+s[1]));});
    if(x.forms.length)h+=line('Other forms',qe(x.forms.join(', ')));
    return h;
  }
  function factsCard(r,lead){
    var h=title(r.n,(r.st?r.st+'\u2605 ':'')+'skill');
    if(lead)h+='<div class="qa-line">'+qe(lead)+'</div>';
    h+=factsLines(r);
    if(ptOf(r))h+=line('Player-tested',qe(ptOf(r).fact));
    h+=line('Full text',qe(r.t.length>480?r.t.slice(0,480)+'\u2026':r.t));
    return h;
  }
  var PRE2='You are helping with Buriedbornes 2. The CONTEXT is computed from the guide\'s data. Answer the question in under 130 words using only the CONTEXT, in a neutral factual register with no hedging or opinion phrases. Do not invent numbers, say when something is not listed, and do not present an opinion as a game fact.\n';
  function ctxRow(r){var x=X(r);return r.n+' ('+(r.st?r.st+'\u2605':'?')+'; damage: '+dmgTxt(r)+'; cooldown: '+(x.cd===null?'n/a':x.cd)+'; uses: '+usesTxt(r)+(x.scales.length?'; scales: '+x.scales.map(function(s){return '+'+s[0]+'% per '+s[1];}).join(', '):'')+(ptOf(r)?'; player-tested: '+ptOf(r).fact:'')+'): '+r.t.slice(0,300);}
  function entLines(en){var f=en.f,h='';['Stats','Shield','HP Stacks','Other Stats','Racial Ability','Job Ability','Origin Ability','Other Abilities','Skills'].forEach(function(k){if(f[k])h+=line(k,qe(plainT(f[k])));});return h;}
  function entCard(en,lead){return title(en.n,en.kind.toLowerCase())+(lead?'<div class="qa-line">'+qe(lead)+'</div>':'')+entLines(en);}
  /* named entities */
  function namedSkills(s){return rows.filter(function(r){return r.n.length>=4&&wb(s,r.n);}).sort(function(a,b){return b.n.length-a.n.length;});}
  function namedEnts(s){var ms=window.__qaMask?window.__qaMask(s):s;return ENT.filter(function(en){return en.n.length>=3&&wb(ms,en.n);}).sort(function(a,b){return b.n.length-a.n.length;});}
  function cleanNamed(arr,s){var out=[];arr.forEach(function(r){var dup=out.some(function(o){return o.n.toLowerCase().indexOf(r.n.toLowerCase())>=0;});if(!dup)out.push(r);});return out;}
  /* comparisons */
  window.__qaMixRows=function(fs){
    var G=[['Stats'],['HP Stacks','Shield'],['Other Stats'],['Racial Ability','Job Ability','Origin Ability'],['Other Abilities'],['Skills'],['Where to Obtain']],used={},rows=[];
    G.forEach(function(g){g.forEach(function(k){used[k]=1;});
      var ks=g.filter(function(k){return fs.some(function(f){return f[k];});});if(!ks.length)return;
      var lab=ks.length>1&&ks.every(function(k){return /Ability$/.test(k);})?ks.map(function(k){return k.replace(/ Ability$/,'');}).join(' / ')+' Ability':ks.join(' / ');
      rows.push({lab:lab,vals:fs.map(function(f){var h=ks.filter(function(k){return f[k];});return !h.length?null:h.length>1?h.map(function(k){return k+' '+f[k];}).join(' \u00b7 '):f[h[0]];})});});
    var more=[];fs.forEach(function(f){Object.keys(f).forEach(function(k){if(!used[k]&&more.indexOf(k)<0)more.push(k);});});
    more.forEach(function(k){rows.push({lab:k,vals:fs.map(function(f){return f[k]||null;})});});
    return rows;
  };
  function compareHtml(list){
    var h=title('Comparison','from the guide data');
    if(list.every(function(o){return o.t&&o.max!==undefined;})){
      var cols=[['Rarity',function(r){return r.st?r.st+'\u2605':'not listed';}],['Damage',dmgTxt],['Cooldown',function(r){var x=X(r);return x.cd===null?'not listed':x.cd+' turn(s)';}],['Uses',usesTxt],['Scales with',function(r){var x=X(r);return x.scales.length?x.scales.map(function(s){return '+'+s[0]+'% per '+s[1];}).join(', '):'no scaling listed';}],['Removes HP stacks',function(r){return r.stack?'yes':'no';}]];
      cols.forEach(function(c){h+=line(c[0],list.map(function(r){return skN(r)+' '+qe(c[1](r));}).join(' \u00b7 '));});
    }else{
      if(window.__qaMixRows&&list.length>=2&&list.every(function(o){return o.f;})&&!list.every(function(o){return o.kind===list[0].kind;})){
        var ku=[];list.forEach(function(o){if(ku.indexOf(o.kind)<0)ku.push(o.kind);});
        var pu=ku.map(function(k){return ({Race:'races',Job:'jobs',Origin:'origins'})[k]||k.toLowerCase()+'s';}),plm=pu.length>2?pu.slice(0,-1).join(', ')+' and '+pu[pu.length-1]:pu.join(' and ');
        var gm='<div class="qa-grid qa-vs" style="grid-template-columns:84px '+list.map(function(){return 'minmax(0,1fr)';}).join(' ')+'"><div class="qa-gh"></div>'+list.map(function(o){return '<div class="qa-gh" data-kind="'+o.kind+'" data-n="'+qe(o.n)+'">'+qe(o.n)+' ('+o.kind.toLowerCase()+')</div>';}).join('');
        window.__qaMixRows(list.map(function(o){return o.f;})).forEach(function(r){gm+='<div class="qa-lab">'+qe(r.lab)+'</div>'+r.vals.map(function(v){return '<div>'+(v?qe(plainT(v)):'\u2013')+'</div>';}).join('');});
        return '<div data-vs="1">'+title(list.map(function(o){return o.n;}).join(' vs '),ku.map(function(k){return k.toLowerCase();}).join(' vs '))+'<div class="qa-lead">The guide does not rank '+plm+'.</div>'+gm+'</div></div>';
      }
      if(list.length>=2&&list.every(function(o){return o.f&&o.kind===list[0].kind;})){
        var pref=['Stats','Shield','HP Stacks','Other Stats','Racial Ability','Job Ability','Origin Ability','Other Abilities','Skills'],pl=({Race:'races',Job:'jobs',Origin:'origins'})[list[0].kind]||list[0].kind.toLowerCase()+'s';
        var g='<div class="qa-grid qa-vs" style="grid-template-columns:84px '+list.map(function(){return 'minmax(0,1fr)';}).join(' ')+'"><div class="qa-gh"></div>'+list.map(function(o){return '<div class="qa-gh">'+qe(o.n)+'</div>';}).join('');
        pref.forEach(function(k){if(!list.some(function(o){return o.f[k];}))return;g+='<div class="qa-lab">'+qe(k)+'</div>'+list.map(function(o){return '<div>'+(o.f[k]?qe(plainT(o.f[k])):'\u2013')+'</div>';}).join('');});
        return '<div data-vs="1">'+title(list.map(function(o){return o.n;}).join(' vs '),pl)+'<div class="qa-lead">The guide does not rank '+pl+'.</div>'+g+'</div></div>';
      }
      list.forEach(function(o){if(o.f)h+='<div class="qa-line"><b>'+qe(o.n)+'</b> ('+o.kind.toLowerCase()+')</div>'+entLines(o);else h+='<div class="qa-line">'+skN(o)+' (skill)</div>'+factsLines(o);});
    }
    return h;
  }
  function compareCtx(list){return PRE2+list.map(function(o){return o.f?o.n+' ('+o.kind+'): '+o.t.slice(0,300):ctxRow(o);}).join('\n');}
  /* rankings of races, jobs and origins */
  var RSTAT=[[/\bhp stacks?\b|\bstacks\b/,'HP Stacks',function(en){return +(en.f['HP Stacks']||0);}],[/\b(hp|health|hit points?)\b/,'HP',function(en){var m=(en.f.Stats||'').match(/\bHP (\d+)/);return m?+m[1]:0;}],[/\bshields?\b/,'Shield',function(en){return +(en.f.Shield||0);}],[/\b(str|strength)\b/,'STR',function(en){var m=(en.f.Stats||'').match(/\bSTR (\d+)/);return m?+m[1]:0;}],[/\b(dex|dexterity)\b/,'DEX',function(en){var m=(en.f.Stats||'').match(/\bDEX (\d+)/);return m?+m[1]:0;}],[/\b(int|intelligence)\b/,'INT',function(en){var m=(en.f.Stats||'').match(/\bINT (\d+)/);return m?+m[1]:0;}],[/\b(pie|piety)\b/,'PIE',function(en){var m=(en.f.Stats||'').match(/\bPIE (\d+)/);return m?+m[1]:0;}]];
  function rankDetect(s){
    var km=s.match(/\b(rac(?:e|es)|jobs?|class(?:es)?|origins?)\b/);if(!km)return null;
    var up=/\b(most|highest|largest|biggest|greatest|best|strongest|top|max\w*|more)\b/.test(s),down=/\b(lowest|least|fewest|smallest|weakest|worst|min\w*|less)\b/.test(s);
    if(!up&&!down)return null;
    var st=null;RSTAT.forEach(function(x){if(!st&&x[0].test(s))st=x;});if(!st)return null;
    var kind=/^rac/.test(km[1])?'Race':/^origin/.test(km[1])?'Origin':'Job';
    var list=ENT.filter(function(en){return en.kind===kind;}).map(function(en){return {en:en,v:st[2](en)};}).filter(function(x){return x.v>0;});
    if(!list.length)return null;
    list.sort(function(a,b){return down&&!up?a.v-b.v:b.v-a.v;});
    var top=list.slice(0,6),lab=(down&&!up?'Lowest':'Highest')+' starting '+st[1];
    var h=title(lab+' ('+kind.toLowerCase()+')','from the guide data');
    top.forEach(function(x,i){h+='<div class="qa-line"><b>'+(i+1)+'. '+qe(x.en.n)+'</b> '+qe(st[1]+' '+x.v)+'</div>';});
    var tied=list.filter(function(x){return x.v===list[0].v;}).length;if(tied>1)h+='<div class="qa-line">'+tied+' '+kind.toLowerCase()+'s share the '+(down&&!up?'lowest':'highest')+' value of <b>'+list[0].v+'</b>, so the order within that group is arbitrary.</div>';
    h+='<div class="qa-note">Starting values from the guide. '+list.length+' '+kind.toLowerCase()+'s list this stat. Abilities and growth are not part of this ranking.</div>'+chips(top.map(function(x){return {n:x.en.n};}));
    var ctx=PRE2+lab+' among '+kind.toLowerCase()+'s:\n'+top.map(function(x,i){return (i+1)+'. '+x.en.n+' '+st[1]+' '+x.v+' | '+plainT(x.en.f[kind==='Race'?'Racial Ability':kind==='Job'?'Job Ability':'Origin Ability']||'').slice(0,160);}).join('\n');
    return {kind:'rank',html:card(h),ctx:ctx,names:[]};
  }
  /* ---------- skill runes (transcribed from the game's rune screens) ---------- */
  var RUNES=[
    {n:'Aim (Weak)',st:1,fx:'Skill Accuracy +10%'},
    {n:'Auto: Levelup',st:1,auto:'Whenever your level is increased'},
    {n:'Auto: Run',st:1,auto:'Whenever you run away'},
    {n:'Boost (Weak)',st:1,fx:'Skill Boost Rate +10%'},
    {n:'Copy (Weak)',st:1,fx:'Appearance rate of this skill +8%'},
    {n:'Critical (Weak)',st:1,fx:'Skill Critical Rate +10%'},
    {n:'Evil (Weak)',st:1,fx:'Whenever you use this skill directly, Grant Void Enhancement +5% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Fighter (Weak)',st:1,fx:'Whenever you use this skill directly, Grant Physical Enhancement +5% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Flat',st:1,fx:'Will no longer enter Burst state'},
    {n:'Healing',st:1,fx:'Whenever you use this skill directly, Heal yourself\n2% of your Maximum HP\n100% hit'},
    {n:'Heavy',st:1,fx:'Cooldown x2'},
    {n:'Ignore',st:1,fx:'When uncontrollable, avoid using this skill if possible (this effect also applies to auto-combat)'},
    {n:'Inspect (Weak)',st:1,fx:'Whenever you use this skill directly, Grant Accuracy +25% to yourself\n100% hit\nLasts 2 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Limit',st:1,fx:'Maximum remaining uses of this skill is set to 1',nofree:true},
    {n:'Mage (Weak)',st:1,fx:'Whenever you use this skill directly, Grant Magical Enhancement +5% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Mutation (Weak)',st:1,fx:'Whenever you use this skill directly, Grant Mutation +10% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Observer',st:1,fx:'Whenever you use this skill directly, Grant Scouting to yourself\n100% hit\nLasts 1 Room(s)\n(Target inversion not possible)'},
    {n:'Persist',st:1,fx:'This skill is not affected by stuns'},
    {n:'Power (Weak)',st:1,fx:'Skill Power +10%',power:true},
    {n:'Refill (Weak)',st:1,fx:'Remaining Uses +5',nofree:true},
    {n:'Sacred (Weak)',st:1,fx:'Whenever you use this skill directly, Grant Sanctuary +10% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Shielding',st:1,fx:'Whenever you use this skill directly, Give yourself shield\n2% of your Maximum HP\n100% hit'},
    {n:'Vain',st:1,fx:'Whenever you use this skill directly, Grant Skill Lock to yourself\n100% hit\nLasts 1 Turn(s)\n(Target inversion not possible)'},
    {n:'Wall (Weak)',st:1,fx:'Whenever you use this skill directly, Grant Ironclad +10% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Weak',st:1,fx:'Skill Power is set to 2\n(Applies only to effects used directly, not to passive effects, etc.)'},
    {n:'Auto: Confuse',st:2,auto:'At the start of your turn (when confused)'},
    {n:'Auto: Delayed',st:2,auto:'Whenever you deal Delayed damage'},
    {n:'Auto: Kill',st:2,auto:'Whenever you defeat an enemy'},
    {n:'Auto: Move',st:2,auto:'Whenever you move between rooms'},
    {n:'Auto: Over Time',st:2,auto:'Whenever you deal Damage over Time'},
    {n:'Auto: Pursuit',st:2,auto:'Whenever you deal Pursuit damage'},
    {n:'Auto: Reflect',st:2,auto:'Whenever you deal Reflect damage'},
    {n:'Auto: Rise',st:2,auto:'Whenever you move between floors'},
    {n:'Calm',st:2,fx:'Whenever you use this skill directly, Cause yourself to lose 3 Bravery'},
    {n:'Chemistry (Weak)',st:2,fx:'Whenever you use this skill directly, Grant Medication to yourself\n100% hit\nLasts 1 Turn(s)\n(Target inversion not possible)'},
    {n:'Cost (Weak)',st:2,fx:'Consumption when using this skill -1 (will not be less than 1)',nofree:true},
    {n:'Exhaust',st:2,fx:'Whenever you use this skill directly, Reduce 1 Remaining uses of your opponent all skills\n100% hit\n(Target inversion not possible)'},
    {n:'Inspect (Medium)',st:2,fx:'Whenever you use this skill directly, Grant Accuracy +50% to yourself\n100% hit\nLasts 2 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Neutral',st:2,fx:'Whenever you use this skill directly, Switch yourself current skill(s) to Default mode\n(Target inversion not possible)',nofree:true},
    {n:'Parry',st:2,fx:'Whenever you use this skill directly, Grant Parry +10% to yourself\n100% hit\nLasts 1 Turn(s)\n(Target inversion not possible)'},
    {n:'Remind',st:2,fx:'When uncontrollable, prioritize using this skill (this effect also applies during auto battle)'},
    {n:'Speed (Weak)',st:2,fx:'Cooldown -1',nofree:true},
    {n:'Spending (Weak)',st:2,fx:'Ignore remaining uses consumption +15% (maximum 95%)',nofree:true},
    {n:'Stable',st:2,fx:'This skill is not affected by effects that change its base cooldown, such as Slow or Haste',nofree:true},
    {n:'Stain',st:2,fx:'Whenever you use this skill directly, Grant Pollution 10% to your opponent\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Supply (Weak)',st:2,fx:'Remaining Uses +25%',nofree:true},
    {n:'Auto: Ailment',st:3,auto:'Whenever you receive a status ailment'},
    {n:'Auto: Damage',st:3,auto:'Whenever you receive direct damage'},
    {n:'Auto: Life',st:3,auto:'Whenever you lose an HP stack'},
    {n:'Auto: Miss',st:3,auto:'Whenever an attack misses'},
    {n:'Auto: Stun',st:3,auto:'Whenever you receive a stun'},
    {n:'Bash',st:3,fx:'Whenever you use this skill directly, Grant Serious injury to your opponent\n150% Ailment hit\nLasts 2 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Blind',st:3,fx:'The base hit rate of this skill is reduced to 0%+'},
    {n:'Boost (Medium)',st:3,fx:'Skill boost rate +25%'},
    {n:'Break (Weak)',st:3,fx:'Whenever you use this skill directly, Cause your opponent to lose 1 Bravery'},
    {n:'Capture (Weak)',st:3,fx:'Whenever you use this skill directly, Grant Capture to your opponent\n150% Ailment hit\nLasts 1 Turn(s)\n(Target inversion not possible)'},
    {n:'Convert (Weak)',st:3,fx:'Whenever you use this skill directly, Increase 1 Remaining of yourself a random skills.\n100% hit\n(Target inversion not possible)\nReduce 1 Remaining uses of yourself a random skills\n100% hit\n(Target inversion not possible)',nofree:true},
    {n:'Critical (Medium)',st:3,fx:'Skill Critical Rate +15%'},
    {n:'Demand: Dexterity',st:3,fx:'This skill is treated as a DEXterity-based skill.\nThe skill power of this skill refers to DEXterity instead of other basic parameters.'},
    {n:'Demand: Intelligence',st:3,fx:'This skill is treated as a INTelligence-based skill.\nThe skill power of this skill refers to INTelligence instead of other basic parameters.'},
    {n:'Demand: Piety',st:3,fx:'This skill is treated as a PIEty-based skill.\nThe skill power of this skill refers to PIEty instead of other basic parameters.'},
    {n:'Demand: Strength',st:3,fx:'This skill is treated as a STRength-based skill.\nThe skill power of this skill refers to STRength instead of other basic parameters.'},
    {n:'Enchant',st:3,fx:'The physical damage of this skill is converted to magical damage'},
    {n:'Enlighten',st:3,fx:'When this rune is newly set, the rune slot for this skill is expanded to 3\n(Not activated by moving the rune)'},
    {n:'Evil Eye (Weak)',st:3,fx:'Whenever you use this skill directly, Grant Evil Eye 1 to yourself\n100% hit\nLasts 1 Turn(s) or 1 Room(s)\n(Target inversion not possible)',nofree:true},
    {n:'Focus (Weak)',st:3,fx:'Whenever you use this skill directly, Grant Focus +5% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Hold',st:3,fx:'This skill will no longer switch to alt mode',nofree:true},
    {n:'Iron Will',st:3,fx:'Whenever you use this skill directly, Grant Steel body to yourself\n100% hit\nLasts 1 Turn(s)\n(Target inversion not possible)'},
    {n:'Mild (Weak)',st:3,fx:'Cooldown -2\nNumber of times consumed when using skills -1 (cannot be less than 1)\nSkill power -50%'},
    {n:'Power (Medium)',st:3,fx:'Skill Power +30%\n(Applies only to effects used directly, not to passive effects, etc.)',power:true},
    {n:'Prayer (Weak)',st:3,fx:'Whenever you use this skill directly, Grant Prayer +5% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Quicker',st:3,fx:'This skill is considered Quick',nofree:true},
    {n:'Rage (Weak)',st:3,fx:'Whenever you use this skill directly, Grant Rage +5% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Tempo (Weak)',st:3,fx:'Whenever you use this skill directly, Grant Skill Boost +25% to yourself\n100% hit\nLasts 2 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Trick (Weak)',st:3,fx:'Whenever you use this skill directly, Grant Trick +5% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Assist: Focus',st:4,fx:'The power of this skill is enhanced by 100% of Focus',power:true},
    {n:'Assist: Prayer',st:4,fx:'The power of this skill is enhanced by 100% of Prayer',power:true},
    {n:'Assist: Rage',st:4,fx:'The power of this skill is enhanced by 100% of Rage',power:true},
    {n:'Assist: Trick',st:4,fx:'The power of this skill is enhanced by 100% of Trick',power:true},
    {n:'Auto: Boost',st:4,auto:'When skill boost is activated'},
    {n:'Auto: Burst',st:4,auto:'Whenever you use a burst skill'},
    {n:'Auto: Critical',st:4,auto:'Whenever there is a critical hit'},
    {n:'Auto: Evade',st:4,auto:'Whenever you evade'},
    {n:'Auto: Free',st:4,auto:'Whenever you use a free skill'},
    {n:'Auto: Heal',st:4,auto:'Whenever you recover HP'},
    {n:'Auto: Parry',st:4,auto:'Whenever you parry'},
    {n:'Auto: Summon',st:4,auto:'When you summon a minion'},
    {n:'Burden',st:4,fx:'Whenever you use this skill directly, Grant Slow +1 to your opponent\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Daze',st:4,fx:'Whenever you use this skill directly, Grant Dim to your opponent\n150% Ailment hit\nLasts 2 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Eldritch',st:4,fx:'The magical damage of this skill is converted to void damage'},
    {n:'Evil (Strong)',st:4,fx:'Whenever you use this skill directly, Grant Void Enhancement +15% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Fighter (Strong)',st:4,fx:'Whenever you use this skill directly, Grant Physical Enhancement +15% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Invert',st:4,fx:'The target of this skill is swapped between you and the enemy (This applies only to actions of the skill itself)'},
    {n:'Lift',st:4,fx:'Whenever you use this skill directly, Remove all yourself\'s status effects\n100% hit\n(Target inversion not possible)'},
    {n:'Mage (Strong)',st:4,fx:'Whenever you use this skill directly, Grant Magical Enhancement +15% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Massive',st:4,fx:'The power of this skill is increased by cumulative cooldown (+1%/1 cumulative cooldown)',power:true},
    {n:'Mutation (Strong)',st:4,fx:'Whenever you use this skill directly, Grant Mutation +25% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Sacred (Strong)',st:4,fx:'Whenever you use this skill directly, Grant Sanctuary +25% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Shift',st:4,fx:'Whenever you use this skill directly, Switch yourself current skill(s) to Alt mode\n(Target inversion not possible)',nofree:true},
    {n:'Special (Weak)',st:4,fx:'Skill power +200%\nWhenever this skill is used or auto-used, the Remaining of all skills is reduced by 1',nofree:true,power:true},
    {n:'Speed (Medium)',st:4,fx:'Cooldown -2',nofree:true},
    {n:'Spending (Medium)',st:4,fx:'Ignore remaining uses consumption +20% (maximum 95%)',nofree:true},
    {n:'Supplement (Weak)',st:4,fx:'Whenever you defeat an enemy, add +1 to the number of uses of this skill.',nofree:true},
    {n:'Supply (Medium)',st:4,fx:'Remaining Uses +50%',nofree:true},
    {n:'Tempo (Medium)',st:4,fx:'Whenever you use this skill directly, Grant Skill Boost +50% to yourself\n100% hit\nLasts 2 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Transfer',st:4,fx:'When exchanging a skill with this rune for another skill, transfer all other runes to the new skill as much as possible.'},
    {n:'Unopposed',st:4,fx:'All Ailment Hit rolls present on this skill and its runes are turned into a corresponding amount of Pure Hit.'},
    {n:'Vigor',st:4,fx:'Whenever you use this skill directly, Grant Vigor to yourself\n100% hit\nLasts 1 Turn(s)\n(Target inversion not possible)'},
    {n:'Wall (Strong)',st:4,fx:'Whenever you use this skill directly, Grant Ironclad +25% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Aim (Strong)',st:5,fx:'Skill Accuracy +100%'},
    {n:'Auto: Combat',st:5,auto:'At the start of combat'},
    {n:'Auto: Intelligence',st:5,auto:'Whenever you use an INTelligence-based skill'},
    {n:'Auto: Piety',st:5,auto:'Whenever you use a PIEty-based skill'},
    {n:'Auto: React',st:5,auto:'Whenever the enemy\'s HP stack is reduced'},
    {n:'Auto: Strength',st:5,auto:'Whenever you use a STRength-based skill'},
    {n:'Barrier',st:5,fx:'Whenever you use this skill directly, Grant Barrier to yourself\n100% hit\nLasts 1 Combat(s)\n(Target inversion not possible)'},
    {n:'Blink',st:5,fx:'Whenever you use this skill directly, Grant Substitute to yourself\n100% hit\nLasts 1 Combat(s)\n(Target inversion not possible)'},
    {n:'Break (Strong)',st:5,fx:'Whenever you use this skill directly, Cause your opponent to lose 3 Bravery'},
    {n:'Capture (strong)',st:5,fx:'Whenever you use this skill directly, Grant Capture to your opponent\n150% Ailment hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Chemistry (Strong)',st:5,fx:'Whenever you use this skill directly, Grant Medication to yourself\n100% hit\nLasts 1 Combat(s)\n(Target inversion not possible)'},
    {n:'Critical (Strong)',st:5,fx:'Skill Critical Rate +25%'},
    {n:'Focus (Strong)',st:5,fx:'Whenever you use this skill directly, Grant Focus +15% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Power (Strong)',st:5,fx:'Skill Power +50%\n(Applies only to effects used directly, not to passive effects, etc.)',power:true},
    {n:'Prayer (Strong)',st:5,fx:'Whenever you use this skill directly, Grant Prayer +15% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Pure Power (Weak)',st:5,fx:'Skill Power +1\n(Applies only to effects used directly, not to passive effects, etc.)',power:true},
    {n:'Recall',st:5,fx:'Whenever you use this skill directly, Banish your opponent\'s minions\n150% Ailment hit'},
    {n:'Trick (Strong)',st:5,fx:'Whenever you use this skill directly, Grant Trick +15% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Absolute',st:6,fx:'This skill is always in burst state'},
    {n:'Auto: Dexterity',st:6,auto:'Whenever you use a DEXterity-based skill'},
    {n:'Auto: Focus',st:6,auto:'Whenever you gain Focus'},
    {n:'Auto: Mutation',st:6,auto:'Whenever you gain Mutation'},
    {n:'Auto: Prayer',st:6,auto:'Whenever you gain Prayer'},
    {n:'Auto: Rage',st:6,auto:'Whenever you gain Rage'},
    {n:'Auto: Recall',st:6,auto:'Whenever your minion is recalled'},
    {n:'Auto: Sacred',st:6,auto:'Whenever you gain Sanctuary'},
    {n:'Auto: Trick',st:6,auto:'Whenever you gain Trick'},
    {n:'Auto: Wall',st:6,auto:'Whenever you gain Ironclad'},
    {n:'Boost (Strong)',st:6,fx:'Skill Boost Rate +50%'},
    {n:'Braver',st:6,fx:'Whenever you use this skill directly, Grant Valor to yourself\n100% hit\nLasts 2 Turn(s) or 1 Room(s)\n(Target inversion not possible)',nofree:true},
    {n:'Cheer (Weak)',st:6,fx:'Whenever you use this skill directly, Cause yourself to gain 1 Bravery'},
    {n:'Convert (Strong)',st:6,fx:'Whenever you use this skill directly, Increase 3 Remaining of yourself a random skills.\n100% hit\n(Target inversion not possible)\nReduce 3 Remaining uses of yourself a random skills\n100% hit\n(Target inversion not possible)',nofree:true},
    {n:'Cost (Extreme)',st:6,fx:'Consumption is set at 1',nofree:true},
    {n:'Cost (Strong)',st:6,fx:'Consumption when using this skill -2 (will not be less than 1)',nofree:true},
    {n:'Danceable',st:6,fx:'Remaining Uses of this skill will be reset whenever you level up',nofree:true},
    {n:'Eagle Eye',st:6,fx:'Whenever you use this skill directly, Grant Sure Hit to yourself\n100% hit\nLasts 2 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Evil Eye (Strong)',st:6,fx:'Whenever you use this skill directly, Grant Evil Eye 2 to yourself\n100% hit\nLasts 1 Turn(s) or 1 Room(s)\n(Target inversion not possible)',nofree:true},
    {n:'Expel',st:6,fx:'Whenever you use this skill directly, Remove all your opponent\'s status effects\n100% hit\n(Target inversion not possible)'},
    {n:'Inspect (Strong)',st:6,fx:'Whenever you use this skill directly, Grant Accuracy +150% to yourself\n100% hit\nLasts 2 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Metal',st:6,fx:'Cooldown +99',nofree:true},
    {n:'Mild (strong)',st:6,fx:'Cooldown -5\nNumber of times consumed when using skills -2 (cannot be less than 1)\nSkill power -50%'},
    {n:'Ogre',st:6,fx:'Whenever you use this skill directly, Grant Fear to your opponent\n150% Ailment hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Penetrate (Magical)',st:6,fx:'This skill ignores the target\'s Resist: Magical.',nofree:true},
    {n:'Penetrate (Physical)',st:6,fx:'This skill ignores the target\'s Resist: Physical.',nofree:true},
    {n:'Penetrate (Void)',st:6,fx:'This skill ignores the target\'s Resist: Void.',nofree:true},
    {n:'Rage (Strong)',st:6,fx:'Whenever you use this skill directly, Grant Rage +15% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Rough Aim',st:6,fx:'The base hit rate of this skill is now 50%.'},
    {n:'Special (Strong)',st:6,fx:'Skill power +400%\nWhenever this skill is used or auto-used, the Remaining of all skills is reduced by 2',nofree:true,power:true},
    {n:'Speed (Strong)',st:6,fx:'Cooldown -5',nofree:true},
    {n:'Spending (Strong)',st:6,fx:'Ignore remaining uses consumption +40% (maximum 95%)',nofree:true},
    {n:'Steel',st:6,fx:'Whenever you use this skill directly and in burst state, gain Invincible /1 turn',nofree:true},
    {n:'Stone',st:6,fx:'Whenever you use this skill directly, Grant Petrification +1 to your opponent\n150% Ailment hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)',nofree:true},
    {n:'Supply (Strong)',st:6,fx:'Remaining Uses +80%',nofree:true},
    {n:'Switcher',st:6,fx:'At the start of the turn, switch this skill to Alt Mode if possible',nofree:true},
    {n:'Tempo (Strong)',st:6,fx:'Whenever you use this skill directly, Grant Skill Boost +100% to yourself\n100% hit\nLasts 2 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Auto: Turn',st:7,auto:'At the start of your turn'},
    {n:'Awaken',st:7,fx:'When this rune is newly set, the rune slot for this skill is expanded to 5\n(Not activated by moving the rune)'},
    {n:'Boost (Extreme)',st:7,fx:'Skill Boost Rate +100%'},
    {n:'Cataclysm',st:7,fx:'Whenever you use this skill directly, Switch yourself all skill(s) to Alt mode\n(Target inversion not possible)'},
    {n:'Cheer (Strong)',st:7,fx:'Whenever you use this skill directly, Cause yourself to gain 3 Bravery'},
    {n:'Copy (Strong)',st:7,fx:'Appearance rate of this skill +50%'},
    {n:'Critical (Extreme)',st:7,fx:'This skill will always critically hit if possible'},
    {n:'Focus (Extreme)',st:7,fx:'Whenever you use this skill directly, Grant Focus +30% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Power (Extreme)',st:7,fx:'Skill Power +100%\n(Applies only to effects used directly, not to passive effects, etc.)',power:true},
    {n:'Prayer (Extreme)',st:7,fx:'Whenever you use this skill directly, Grant Prayer +30% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Pure Power (Strong)',st:7,fx:'Skill Power +3\n(Applies only to effects used directly, not to passive effects, etc.)',power:true},
    {n:'Rage (Extreme)',st:7,fx:'Whenever you use this skill directly, Grant Rage +30% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Refill (Extreme)',st:7,fx:'Remaining Uses +20',nofree:true},
    {n:'Slayer',st:7,fx:'Whenever you use this skill directly, Cause your opponent to lose 1 HP stack(s)\n50% hit'},
    {n:'Speed (Extreme)',st:7,fx:'Cooldown -99',nofree:true},
    {n:'Spending (Extreme)',st:7,fx:'Ignore remaining uses consumption +75% (maximum 95%)',nofree:true},
    {n:'Stalemate',st:7,fx:'Whenever you use this skill directly, Grant Skill Lock to your opponent\n150% Ailment hit\nLasts 2 Act(s) or 1 Combat(s)\n(Target inversion not possible)',nofree:true},
    {n:'Supplement (Strong)',st:7,fx:'Whenever you defeat an enemy, replenish the number of uses of this skill by +3.',nofree:true},
    {n:'Supply (Extreme)',st:7,fx:'Remaining Uses +100%',nofree:true},
    {n:'Trick (Extreme)',st:7,fx:'Whenever you use this skill directly, Grant Trick +30% to yourself\n100% hit\nLasts 5 Turn(s) or 1 Room(s)\n(Target inversion not possible)'},
    {n:'Wealth',st:7,fx:'Whenever you use this skill directly, Gain 1 soulstone(s)'}
  ];
  RUNES.forEach(function(r){r.k=norm(r.n);r.base=norm(r.n.replace(/\s*\(.*\)/,''));if(r.auto)r.nofree=true;});
  var RUNE_GEN='Skill runes are auxiliary items that add effects to the skills they are set in. A skill has a random number of rune slots when obtained, one rune fits in each slot, and a rune cannot be removed once it is set.';
  var AUTOSEEN={};
  KBJ.forEach(function(e){if(e[0]==='Contract'){var re=/Auto: ([A-Za-z ]+?)(?=,| Enhanced| Rune| Equipment| Skill|$)/g,m;while((m=re.exec(String(e[2])))){var k=m[1].trim();(AUTOSEEN[k]=AUTOSEEN[k]||[]).push(e[1]);}}});
  var RUNEBYN={};RUNES.forEach(function(r){RUNEBYN[r.k]=r;});
  function fxFlat(r){return r.auto?'Auto-use: '+r.auto:String(r.fx).split('\n').map(function(x){return x.replace(/\.$/,'');}).join('. ');}
  function qBtn(t){return '<button type="button" class="qa-exbtn" data-ex="'+qe(t)+'">'+qe(t.replace(/\.$/,''))+'</button>';}
  function runeNav(){return line('Browse runes','')+'<div class="qa-ex">'+['List all runes.','What are Auto runes?','Which runes raise skill power?','List the 7★ runes.'].map(qBtn).join('')+'</div>';}
  function runeBtn(r){return '<button type="button" class="qa-exbtn" data-ex="'+qe('What does '+r.n+' do?')+'">'+qe(r.n)+'</button>';}
  function runeChips(a){return '<div class="qa-ex">'+a.map(runeBtn).join('')+'</div>';}
  function runeCard(r){
    var h=title(r.n,r.st+'★ skill rune');
    h+=r.auto?line('Auto-use',qe(r.auto)):line('Effect',qe(r.fx).replace(/\n/g,'<br>'));
    if(r.nofree)h+=line('Restriction','Cannot be set in Free Skills.');
    h+='<div class="qa-note">'+qe(RUNE_GEN)+'</div>';
    return h;
  }
  var AUTOS=RUNES.filter(function(r){return r.auto;}),POWERS=RUNES.filter(function(r){return r.power;}),HHPOW=RUNES.filter(function(r){return /^(Pure Power \(Strong\)|Special \((Strong|Weak)\))$/.test(r.n);});
  function otherAutos(){return Object.keys(AUTOSEEN).filter(function(k){return !RUNEBYN[norm('Auto: '+k)];}).sort();}
  function autoListHtml(){
    var h=title('Auto runes','from the game\'s rune screens');
    h+='<div class="qa-line">An Auto rune activates the skill it is set in whenever its condition happens. Auto runes cannot be set in Free Skills.</div>';
    AUTOS.forEach(function(r){h+='<div class="qa-line"><b>'+qe(r.n)+'</b> '+r.st+'★ · '+qe(r.auto)+'</div>';});
    var o=otherAutos();if(o.length)h+=line('Other Auto runes listed in contracts',qe(o.join(', ')+'. Their triggers are not recorded yet.'));
    return h+'<div class="qa-note">'+qe(RUNE_GEN)+'</div>';
  }
  function powerListHtml(){
    var h=title('Runes that raise skill power','from the game\'s rune screens');
    POWERS.forEach(function(r){h+='<div class="qa-line"><b>'+qe(r.n)+'</b> '+r.st+'★ · '+qe(fxFlat(r))+'</div>';});
    h+='<div class="qa-note">'+qe(RUNE_GEN)+'</div>';
    return h;
  }
  /* runes that contracts name in their rune lists ("Runes: ..."; a few contracts label the same kind of list "Skills:", so those are read as runes too, minus real skills).
     Only the rune names are read; the contracts themselves are never listed. A mentioned rune has a description only if it is in RUNES. */
  var MENTION=null;
  function runeMentions(){
    if(MENTION)return MENTION;
    var seen={},keys=[];
    KBJ.forEach(function(e){
      if(e[0]!=='Contract')return;
      var p=String(e[2]).split(' | ');if(p.length<3)return;
      var m=/^(Runes|Skills): (.*)$/.exec(p[1]);if(!m)return;
      var isRunes=m[1]==='Runes';
      if(!isRunes&&!/\bRune\b/.test(p[2]))return;
      m[2].split(/\s+(?:Enhanced|Ennhanced|Rune Slot Release|Rune Release Slot|Equipment:|Equipment Parts:|Skill:)/)[0].split(',').forEach(function(x){
        var n=x.replace(/\s+/g,' ').trim();if(!n)return;
        var k=norm(n);if(!k||(!isRunes&&byN[k]))return;
        if(!seen[k]){seen[k]={k:k,v:{}};keys.push(k);}
        seen[k].v[n]=(seen[k].v[n]||0)+1;
      });
    });
    function pen(n){var c=0;n.split(/(?=[ (])/).forEach(function(w){var t=w.replace(/^[ (]+/,'');if(!t)return;if(/^[a-z]/.test(t))c++;c+=(t.slice(1).match(/[A-Z]/g)||[]).length;});return c;}
    var all=keys.map(function(k){var best=null;Object.keys(seen[k].v).forEach(function(n){if(best===null||seen[k].v[n]>seen[k].v[best]||(seen[k].v[n]===seen[k].v[best]&&pen(n)<pen(best)))best=n;});return {k:k,n:best};});
    var cmp=function(a,b){return a.n.localeCompare(b.n);};
    var nod=all.filter(function(r){return !RUNEBYN[r.k];});
    MENTION={all:all,nodesc:nod,autos:nod.filter(function(r){return /^auto /.test(r.k);}).sort(cmp),others:nod.filter(function(r){return !/^auto /.test(r.k);}).sort(cmp)};
    return MENTION;
  }
  function noDescHtml(){
    var M=runeMentions(),h=title('Runes without a description yet','named in contracts, names only');
    h+='<div class="qa-line">'+M.nodesc.length+' runes are named in contracts but have no description recorded yet. The guide has a description for '+RUNES.length+' runes.</div>';
    h+=line('Auto runes ('+M.autos.length+')',qe(M.autos.map(function(r){return r.n;}).join(', ')));
    h+=line('Other runes ('+M.others.length+')',qe(M.others.map(function(r){return r.n;}).join(', ')));
    h+='<div class="qa-note">Names are read from the rune lists of the contracts. Their effects are not recorded yet.</div>';
    h+='<div class="qa-ex"><button type="button" class="qa-exbtn" data-ex="'+qe('List all runes.')+'">List the runes that have a description</button></div>';
    return h;
  }
  function noDescCtx(){var M=runeMentions();return PRE2+'Runes named in contracts that have no description recorded in the guide ('+M.nodesc.length+'). Auto runes: '+M.autos.map(function(r){return r.n;}).join(', ')+'. Other runes: '+M.others.map(function(r){return r.n;}).join(', ')+'. Runes that do have a description: '+RUNES.map(function(r){return r.n;}).join(', ')+'.';}
  /* every rune the guide has recorded from the game's rune screens (the RUNES array only; contracts that mention runes are never part of this list) */
  function allRunesHtml(){
    var h=title('All known runes','from the game\'s rune screens');
    h+='<div class="qa-line">'+RUNES.length+' runes are recorded in the guide, '+AUTOS.length+' of them Auto runes. They are sorted by rarity, then by name.</div>';
    for(var st=1;st<=7;st++){var g=RUNES.filter(function(r){return r.st===st;});if(g.length)h+=line(st+'★ ('+g.length+')',qe(g.map(function(r){return r.n;}).join(', ')));}
    h+='<div class="qa-note">Ask about a rune by name to see its effect, or ask for a rarity such as "List the 6★ runes". '+qe(RUNE_GEN)+'</div>';
    h+='<div class="qa-line">'+runeMentions().nodesc.length+' more runes are named in contracts but have no description yet.</div><div class="qa-ex">'+qBtn('Which runes have no description yet?')+'</div>';
    return h;
  }
  function starListHtml(n){
    var g=RUNES.filter(function(r){return r.st===n;}),h=title(n+'★ runes','from the game\'s rune screens');
    h+='<div class="qa-line">'+g.length+' runes have a rarity of '+n+'★.</div>';
    g.forEach(function(r){h+='<div class="qa-line"><b>'+qe(r.n)+'</b> · '+qe(fxFlat(r))+(r.nofree&&!r.auto?'. Cannot be set in Free Skills':'')+'</div>';});
    return h+'<div class="qa-note">Auto runes cannot be set in Free Skills.</div>';
  }
  function runeCtx(list){return PRE2+'Skill runes (from the game\'s rune screens):\n'+list.map(function(r){return r.n+' ('+r.st+'★): '+fxFlat(r)+(r.nofree?'. Cannot be set in Free Skills':'');}).join('\n')+'\n'+RUNE_GEN;}
  /* ---------- rune keyword search: lists EVERY rune whose name or effect text contains the typed words (like the in-game rune search).
     Runes only: it runs for questions that mention runes (and, as a last resort, for a short keyword the guide could not match at all). ---------- */
  var KW_STOP={which:1,what:1,whats:1,list:1,show:1,all:1,every:1,each:1,any:1,rune:1,runes:1,'do':1,does:1,did:1,have:1,has:1,having:1,that:1,'with':1,give:1,gives:1,giving:1,the:1,are:1,is:1,of:1,'for':1,me:1,can:1,could:1,ability:1,abilities:1,effect:1,effects:1,mention:1,mentions:1,contain:1,contains:1,containing:1,include:1,includes:1,including:1,there:1,how:1,many:1,tell:1,about:1,find:1,search:1,name:1,named:1,get:1,its:1,and:1,or:1,you:1,your:1,my:1,'this':1,these:1,those:1,by:1,'in':1,on:1,at:1,it:1,a:1,an:1,to:1,i:1,so:1,such:1,like:1,related:1,something:1,anything:1};
  var KW_GENERIC={skill:1,skills:1,directly:1,whenever:1,use:1,used:1,hit:1,room:1,rooms:1,turn:1,turns:1,yourself:1,opponent:1};
  var RUNE_TXT=null;
  function runeTexts(){
    if(RUNE_TXT)return RUNE_TXT;
    RUNE_TXT=RUNES.map(function(r){return norm(r.n+' '+(r.auto?'auto use '+r.auto:r.fx)+(r.nofree?' this rune cannot be set in free skills':''));});
    return RUNE_TXT;
  }
  function kwWords(q){
    var w=norm(q).split(' ').filter(Boolean);
    while(w.length&&KW_STOP[w[0]])w.shift();
    while(w.length&&KW_STOP[w[w.length-1]])w.pop();
    return w;
  }
  function kwEsc(x){return x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
  function kwFind(phrase,words,useAnd){
    var T=runeTexts(),out=[],re=null,res=null;
    if(useAnd)res=words.filter(function(x){return !KW_STOP[x];}).map(function(x){return new RegExp('(^| )'+kwEsc(x));});
    else re=new RegExp('(^| )'+kwEsc(phrase));
    RUNES.forEach(function(r,i){
      var ok=useAnd?(res.length>0&&res.every(function(e){return e.test(T[i]);})):re.test(T[i]);
      if(ok)out.push(r);
    });
    return out;
  }
  function kwSearch(q,allowAnd){
    var words=kwWords(q);
    if(!words.length)return null;
    var phrase=words.join(' ');
    if(phrase.length<3)return null;
    if(words.every(function(x){return KW_GENERIC[x]||KW_STOP[x];}))return null;
    var res=kwFind(phrase,words,false);
    if(!res.length&&/[a-z]{4,}s$/.test(phrase)&&!/ss$/.test(phrase)){phrase=phrase.slice(0,-1);words=phrase.split(' ');res=kwFind(phrase,words,false);}
    var mode='phrase',sig=words.filter(function(x){return !KW_STOP[x];});
    if(allowAnd&&sig.length>=2){var all=kwFind(phrase,words,true);if(all.length>res.length){res=all;mode='and';phrase=sig.join(' ');}}
    if(!res.length||res.length>100)return null;
    return {phrase:phrase,list:res,mode:mode};
  }
  function kwHtml(k){
    var n=k.list.length,hasAuto=false;
    var h=title('Runes matching "'+k.phrase+'"','from the game\'s rune screens');
    h+='<div class="qa-line">'+(k.mode==='and'?n+' rune'+(n===1?' mentions':'s mention')+' all of these words ('+qe(k.phrase.split(' ').join(', '))+') in '+(n===1?'its':'their')+' name or effect.':n+' rune'+(n===1?' has':'s have')+' "'+qe(k.phrase)+'" in '+(n===1?'its':'their')+' name or effect.')+' Sorted by rarity, then by name.</div>';
    k.list.forEach(function(r){if(r.auto)hasAuto=true;h+='<div class="qa-line"><b>'+qe(r.n)+'</b> '+r.st+'\u2605 \u00b7 '+qe(fxFlat(r))+(r.nofree&&!r.auto?'. Cannot be set in Free Skills':'')+'</div>';});
    if(hasAuto)h+='<div class="qa-note">Auto runes cannot be set in Free Skills.</div>';
    return h+'<div class="qa-note">'+qe(RUNE_GEN)+'</div>';
  }
  function runeKwQuery(s,q,wantsRune){
    if(!wantsRune)return null;
    if(/\bauto\b/.test(q)||/\bslots?\b/.test(q))return null;
    if(/\b(remov\w*|swap\w*|replac\w*|unset|unequip\w*|permanent\w*|irreversible|explain|how (do|does) runes? work)\b/.test(q))return null;
    var powerQ=/\b(raise|increase|stronger|more damage|power)\b/.test(q);
    var k=kwSearch(s,!powerQ);
    if(!k)return null;
    return {kind:'rune',html:card(kwHtml(k)),ctx:runeCtx(k.list),names:[]};
  }
  function runeKwFallback(s){
    var q=norm(s);
    if(/\bauto\b/.test(q))return null;
    var words=kwWords(s);
    if(!words.length||words.length>3||words.join(' ').length<4)return null;
    var k=kwSearch(s,false);
    if(!k||k.list.length>40)return null;
    return {kind:'rune',html:card(kwHtml(k)),ctx:runeCtx(k.list),names:[]};
  }
  function runeDetect(s,ns){
    var q=norm(s),wantsRune=/\brunes?\b/.test(q),fromBase=false;
    var listish=/\b(which|all|every|each|list|most|best|highest|lowest|how many|compare)\b/.test(q);
    /* longest names first, so "Pure Power (Weak)" is not also read as "Power (Weak)"; bare names such as Heavy, Weak or Lift are ordinary words and only count when the question says "rune" and is not a list question */
    var named=[],rest=' '+q+' ';
    RUNES.slice().sort(function(a,b){return b.k.length-a.k.length;}).forEach(function(r){
      if(!/[(:]/.test(r.n)&&(!wantsRune||listish))return;
      var re=new RegExp('\\b'+r.k+'\\b');
      if(re.test(rest)){named.push(r);rest=rest.replace(re,' ');}
    });
    named.sort(function(a,b){return q.indexOf(a.k)-q.indexOf(b.k);});
    if(!named.length&&!listish){
      var BASEFREE={'special':1,'pure power':1},bases={};
      RUNES.forEach(function(r){if(/\(/.test(r.n)&&new RegExp('\\b'+r.base+'\\b').test(q)&&!RUNEBYN[r.base]&&BASEFREE[r.base])bases[r.base]=1;});
      RUNES.forEach(function(r){if(bases[r.base]&&named.indexOf(r)<0&&/\b(rune|runes|tier|strong|weak|extreme|medium|do|does|power|mean|effect)\b/.test(q)){named.push(r);fromBase=true;}});
    }
    /* "Which weapons give Add Rune Slot?" is a question about a stat, not about skill runes: leave it to the stat answer */
    if(!named.length&&(/\badd rune slots?\b|\brune rarity\b/.test(q)||(/\brune slots?\b/.test(q)&&/\b(weapons?|armou?r|accessor(y|ies)|equipment|gear|items?)\b/.test(q))))return null;
    if(!named.length&&!wantsRune){
      var seenAuto=Object.keys(AUTOSEEN).filter(function(k){return new RegExp('\\bauto '+norm(k)+'\\b').test(q);});
      if(!seenAuto.length)return null;
    }
    var lemHH=ns&&ns.some(function(r){return r.n==='Lemegeton'||r.n==='High Healing';});
    if(lemHH&&!named.length)return null;
    if(named.length){
      var list=named.slice(0,fromBase?4:3);
      return {kind:'rune',html:card(list.map(runeCard).join('')),ctx:runeCtx(list),names:[]};
    }
    var seen=Object.keys(AUTOSEEN).filter(function(k){return new RegExp('\\bauto '+norm(k)+'\\b').test(q);});
    if(seen.length&&!wantsRune){
      var k0=seen[0],cs=AUTOSEEN[k0].filter(function(x,i,a){return a.indexOf(x)===i;});
      var hh=title('Auto: '+k0,'skill rune')+'<div class="qa-line">The trigger of this Auto rune is not recorded in the guide yet.</div>'+line('Contracts that list it',qe(cs.join(', ')))+'<div class="qa-note">'+qe(RUNE_GEN)+'</div>';
      return {kind:'rune',html:card(hh),ctx:PRE2+'Auto: '+k0+' is listed in contracts: '+cs.join(', ')+'. Its trigger is not recorded.',names:[]};
    }
    /* "Can a rune be removed?" has a plain answer, so lead with it */
    var rmQ=wantsRune&&!/\bslots?\b/.test(q)&&/\b(remov\w*|take out|taken out|taking out|undo|delet\w*|unset|unequip\w*|extract\w*|get rid of)\b/.test(q);
    var pmQ=wantsRune&&!rmQ&&!/\bslots?\b/.test(q)&&/\b(permanent\w*|irreversible|forever|locked in)\b/.test(q);
    if(rmQ||pmQ){
      var noQ=/^(can|could|may)\b|^(is|are) (it|there) (possible|a way|any way)\b|^am i able\b/.test(q),yesQ=/^(is|are|do|does|will)\b/.test(q);
      var lead=pmQ?(yesQ?'Yes. ':'')+'Once a rune is set it cannot be removed from the skill.':(noQ?'No. ':'')+'A rune cannot be removed from a skill once it is set.';
      return {kind:'rune',html:card(title('Skill runes','from the game\'s rune screens')+'<div class="qa-line"><b>'+lead+'</b></div>'+'<div class="qa-line">'+qe(RUNE_GEN.replace(/, one rune fits in each slot, and a rune cannot be removed once it is set\./,', and one rune fits in each slot.'))+'</div>'+runeNav()),ctx:PRE2+RUNE_GEN+'\nKnown runes: '+RUNES.map(function(r){return r.n;}).join(', ')+'.',names:[]};
    }
    /* "List the 6★ runes" */
    var sm=wantsRune?/\b(one|two|three|four|five|six|seven|[1-7])\s*-?\s*(?:★|stars?\b)/i.exec(s):null;
    if(sm){var NW={one:1,two:2,three:3,four:4,five:5,six:6,seven:7},sn=NW[sm[1].toLowerCase()]||parseInt(sm[1],10);
      return {kind:'rune',html:card(starListHtml(sn)),ctx:runeCtx(RUNES.filter(function(r){return r.st===sn;})),names:[]};}
    /* "Which runes have no description yet?": runes named in contracts that the guide has no description for */
    var noDescQ=wantsRune&&!/\bslots?\b/.test(q)&&(/\b(undescribed|undocumented|unrecorded|undefined)\b/.test(q)||(/\b(no|without|missing|lack\w*|undescribed|undocumented|unrecorded|unknown|incomplete|not|dont|doesnt|didnt|havent|hasnt|isnt|arent)\b/.test(q)&&/\b(descriptions?|described|describe|info|information|effects?|triggers?|documented|recorded|details?|know|known|yet)\b/.test(q)));
    if(noDescQ)return {kind:'rune',html:card(noDescHtml()),ctx:noDescCtx(),names:[]};
    var kwr=runeKwQuery(s,q,wantsRune);if(kwr)return kwr;
    /* "List all runes" / "What runes exist?": the full list of recorded runes, nothing else */
    var listQ=wantsRune&&!/\bslots?\b/.test(q)&&!/\bauto\b/.test(q)&&!/\b(skill power|raise|boost|increase|enhanc\w*|stronger|more damage)\b/.test(q)&&(
      /\b(all|every|each|entire|complete|full|whole)\b.*\brunes?\b/.test(q)||
      /\brunes?\b.*\b(exist|exists|known|know|available|listed|recorded|there|have you|do you have)\b/.test(q)||
      /^(list|show|name|give|tell)\b.*\brunes?\b/.test(q)||
      /\b(how many|which|what)\b.*\brunes?\b.*\b(are there|exist|do you|have)\b/.test(q));
    if(listQ)return {kind:'rune',html:card(allRunesHtml()),ctx:runeCtx(RUNES),names:[]};
    /* generic rune questions */
    if(/\b(skill power|raise|boost|increase|enhanc\w*|stronger|more damage|power)\b/.test(q))return {kind:'rune',html:card(powerListHtml()),ctx:runeCtx(POWERS),names:[]};
    if(/\bauto\b/.test(q)){
      var stop={which:1,what:1,rune:1,runes:1,auto:1,trigger:1,triggers:1,triggered:1,when:1,whenever:1,activate:1,activates:1,activated:1,does:1,that:1,with:1,have:1,there:1,skill:1,skills:1,the:1,and:1,for:1,are:1,how:1,can:1,you:1,use:1,used:1,get:1,gain:1};
      var toks=q.split(' ').filter(function(w){return w.length>=3&&!stop[w];});
      var best=0,sc=AUTOS.map(function(r){var tt=norm(r.auto),n=0;toks.forEach(function(w){var st=w.replace(/(ned|ed|ing|es|s)$/,'');if(st.length>=3&&(tt.indexOf(st)>=0||tt.indexOf(w)>=0))n++;});if(n>best)best=n;return {r:r,n:n};});
      if(best>0){var hit=sc.filter(function(x){return x.n===best;}).map(function(x){return x.r;});
        return {kind:'rune',html:card(title('Auto runes that match','from the game\'s rune screens')+hit.map(function(r){return '<div class="qa-line"><b>'+qe(r.n)+'</b> '+r.st+'★ · '+qe(r.auto)+'</div>';}).join('')+'<div class="qa-note">'+qe(RUNE_GEN)+'</div>'),ctx:runeCtx(hit),names:[]};}
      return {kind:'rune',html:card(autoListHtml()),ctx:runeCtx(AUTOS),names:[]};
    }
    if(/\b(remov\w*|swap\w*|replac\w*|chang\w*|switch\w*|slots?|how (do|does) runes? work|what (is|are) (a )?(skill )?runes?|explain)\b/.test(q)||/^(what|whats|what's)\s+(is|are)\b/.test(s))
      return {kind:'rune',html:card(title('Skill runes','from the game\'s rune screens')+'<div class="qa-line">'+qe(RUNE_GEN)+'</div>'+runeNav()),ctx:PRE2+RUNE_GEN+'\nKnown runes: '+RUNES.map(function(r){return r.n;}).join(', ')+'.',names:[]};
    return null;
  }

  /* ---------- player-tested setups: Lemegeton on Auto runes, High Healing stack restore ---------- */
  var PRUNE=['Medical Care','Waste Sorting','Pure Heart','Resonance'],SPRUNE=['Inheritance'],ARUNE=['Medical Care','Great Famine','Temple Reconstruction','Resentment'];
  function cbtn(n){return {n:n};}
  function lemSection(){
    var h=title('Lemegeton on Auto runes','player-tested');
    h+=line('Use','Lemegeton works best when an Auto rune activates it instead of a direct cast.');
    h+=line('Cost','A direct cast consumes 99 remaining uses (its maximum is 10) and starts a cooldown of 99, so it can be cast once. An Auto-rune activation consumes only 1 remaining use and 1 cooldown, which allows repeated activations.');
    h+=line('Role','Used this way it serves as a survivability tool. High Healing is the recommended partner.')+chips([byN[norm('High Healing')]].filter(Boolean));
    h+=line('Auto runes (game text)','Tap one to see when it activates the skill.')+runeChips(AUTOS);
    h+=line('Contracts that list Auto runes include','')+'<div class="qa-ex">'+ARUNE.map(function(n){return '<button type="button" class="qa-exbtn" data-ex="'+qe('Tell me about '+n)+'">'+qe(n)+'</button>';}).join('')+'</div>';
    return h;
  }
  function hhSection(){
    var r=byN[norm('High Healing')],h=title('High Healing setup','guide data, rune text and player testing');
    if(r)h+=line('Heal',qe('Heals 60% of Maximum HP · cooldown 1 · each cast uses 2 of its 30 uses'))+line('Resurrection form (burst state)',qe('Gains 1 HP stack · cooldown 5 · each cast uses 15 of its 30 uses'));
    h+=line('HP stacks restored per cast','');
    h+='<div class="qa-line">Base: <b>1</b> HP stack.</div><div class="qa-line">With Pure Power (Strong) (Skill Power +3): <b>4</b> HP stacks (1 + 3).</div><div class="qa-line">With Pure Power (Strong) and Special (Strong) (Skill power +400%): <b>13</b> HP stacks (1 + 3 × 4).</div>';
    h+=line('Rune cost','Special (Strong) also reduces the Remaining of all skills by 2 whenever the skill is used or auto-used.')+runeChips(HHPOW);
    h+=line('Where the guide lists these runes','Contracts list Pure Power (Weak) in')+'<div class="qa-ex">'+PRUNE.map(function(n){return '<button type="button" class="qa-exbtn" data-ex="'+qe('Tell me about '+n)+'">'+qe(n)+'</button>';}).join('')+'</div>'+line('','and Special (Strong) in')+'<div class="qa-ex">'+SPRUNE.map(function(n){return '<button type="button" class="qa-exbtn" data-ex="'+qe('Tell me about '+n)+'">'+qe(n)+'</button>';}).join('')+'</div>'+line('','Pure Power (Strong) is a 7★ rune and is not listed in the guide\'s contracts.');
    h+=line('Pairing','Lemegeton on Auto runes is the partner setup.')+chips([byN[norm('Lemegeton')]].filter(Boolean));
    return h;
  }
  var PTCTX='Player-tested setup: Lemegeton works best when an Auto rune activates it instead of a direct cast. A direct cast consumes 99 remaining uses (max 10) with a cooldown of 99; an Auto-rune activation consumes 1 remaining use and 1 cooldown (player-tested). It is used for survivability, with High Healing as the recommended partner. High Healing heals 60% of Maximum HP; its Resurrection form (burst state) restores 1 HP stack (cooldown 5, 15 uses per cast). Rune text from the game: Pure Power (Strong) = Skill Power +3 (direct effects only), 7 stars; Special (Strong) = Skill power +400% and, whenever the skill is used or auto-used, the Remaining of all skills is reduced by 2, 6 stars; Special (Weak) = Skill power +200% and Remaining of all skills reduced by 1. Player-tested stack counts for the Resurrection form: 1 base, 4 with Pure Power (Strong) (1 + 3), 13 with Pure Power (Strong) and Special (Strong) (1 + 3 x 4). Auto runes from the game: '+AUTOS.map(function(r){return r.n+' ('+r.auto+')';}).join('; ')+'.\n';
  var PTNOTE='<div class="qa-note">Rune effects are from the game\'s rune screens. The HP stack counts and the Auto-rune cost on Lemegeton (1 remaining use and 1 cooldown) come from player testing.</div>';
  function ptDetect(s,ns){
    var hasLem=ns.some(function(r){return r.n==='Lemegeton';}),hasHH=ns.some(function(r){return r.n==='High Healing';});
    var dropQ=/\b(drop|drops|dropped|where)\b/.test(s);
    var auto=/\bauto(matic)?[ -]?runes?\b|\bauto:/.test(s);
    var stk=/\bhp stacks?\b/.test(s)&&/\b(restor\w*|regain\w*|recover\w*|refill\w*|get back|gain\w*|resurrect\w*|more)\b/.test(s)&&/\b(how|which|what|best|any)\b/.test(s)&&!/^(what|whats|what's)\s+(is|are)\b/.test(s);
    var surv=/\b(survivab\w*|survival|sustain\w*|stay alive|tank\w*)\b/.test(s)&&/\b(build|setup|set up|combo|late ?game|endgame|strategy|synerg\w*|rune)\b/.test(s)&&!/\b(early|beginner|first|new)\b/.test(s);
    var lemQ=hasLem&&(auto||/\b(runes?|survival|surviv\w*|best way|how (do|should|can) i use|setup|set up|build|combo|more than once|again|spam|keep casting|repeatedly|multiple times|once)\b/.test(s));
    if(dropQ&&!auto)return null;
    if(hasLem&&hasHH)return {kind:'combo',html:card(lemSection()+'<div class="qa-line"></div>'+hhSection()+PTNOTE),ctx:PRE2+PTCTX,names:[]};
    if(lemQ&&!hasHH)return {kind:'combo',html:card(lemSection()+PTNOTE),ctx:PRE2+PTCTX,names:[]};
    if(hasHH||stk&&!hasLem){var h=hhSection();
      if(stk){var hs=rows.filter(function(r){return /gain \d+ HP stack/i.test(r.t)&&r.n!=='High Healing';});if(hs.length)h+=line('Other skills that add HP stacks','')+chips(hs);}
      return {kind:'combo',html:card(h+PTNOTE),ctx:PRE2+PTCTX,names:[]};}
    if(surv)return {kind:'combo',html:card(lemSection()+'<div class="qa-line"></div>'+hhSection()+PTNOTE),ctx:PRE2+PTCTX,names:[]};
    return null;
  }
  /* effect search */
  var CON=[
    {lab:'heal you',q:/\b(heal\w*|recover\w*|regenerat\w*|regen|restor\w* (your )?hp|sustain\w*|hp recovery|lifesteal)\b/,re:/\bHeal yourself\b|Natural Recovery|gain \d+ HP stack/i},
    {lab:'give you a shield',q:/\b(shield\w*|barrier)\b/,re:/Give yourself shield|Shield Amplification|Shielding to yourself|Steel body|Grant Shielding/i},
    {lab:'remove ailments and status effects',q:/\b(cleans\w*|cure\w*|dispel\w*|purg\w*|debuffs?|ailments?|remove\w* (a |all |your )?(status|debuff|ailment|negative)\w*)\b/,re:/cure (a random )?ai.ment|Remove all yourself.s status|Grant Immunity/i},
    {lab:'let you escape combat',q:/\b(escap\w*|flee\w*|run away|retreat\w*)\b/,re:/Escape from combat/i},
    {lab:'add HP stacks',q:/\b(reviv\w*|resurrect\w*|extra li(?:fe|ves)|hp stacks?)\b/,re:/gain \d+ HP stack/i},
    {lab:'summon allies',q:/\b(summon\w*|minions?|pets?|companions?)\b/,re:/\bSummon\b/},
    {lab:'stun the opponent\'s skills',q:/\b(stun\w*|disabl\w*|silenc\w*)\b/,re:/Stun your opponent/i},
    {lab:'make you invincible',q:/\b(invincib\w*|immun\w*|invulnerab\w*)\b/,re:/Grant Invincible|Grant Immunity/i}
  ];
  var STATD={};
  rows.forEach(function(r){var re=/Grant ([A-Z][A-Za-z' :\-]{2,30}?)(?: [+\-]?\d+%?)? to (your opponent|yourself|gourself|you and your opponent|you)\b/g,m;while((m=re.exec(r.t))){var k=m[1].trim().toLowerCase();if(k.length<4)continue;(STATD[k]=STATD[k]||{name:m[1].trim(),hits:[]}).hits.push({r:r,self:/^(yourself|gourself|you)$/.test(m[2]),both:/and your opponent/.test(m[2]),idx:m.index});}});
  var SCD={};rows.forEach(function(r){X(r).scales.forEach(function(s){var k=s[1].toLowerCase().replace(/^target's /,'');if(k.length<4||/remaining uses|number of temporary/.test(k))return;(SCD[k]=SCD[k]||{name:s[1].replace(/^target's /,''),hits:[]}).hits.push({r:r,pct:s[0]});});});
  function snip(r,re,idx,exact){
    var t=r.t,i=idx===undefined?t.search(re):idx;if(i<0)i=0;
    var form='',fre=/ \/ ([^\/]{2,40}) \/ \[On Use\]/g,m;while((m=fre.exec(t))&&m.index<i)form=m[1];
    var a=Math.max(t.lastIndexOf('[On Use]',i),t.lastIndexOf('/ ',i)),st=(a>=0&&i-a<160)?a:Math.max(0,i-30);if(!exact)st=Math.max(st,i-45);else st=i;
    var s=t.slice(st,st+130).replace(/^\/\s*/,'').replace(/^\[On [Uu]se\]\s*/,'').replace(/\s+/g,' ').trim();
    var cut=s.search(/ (Cooldown|Remaining)/);if(cut>20)s=s.slice(0,cut);
    return (form?'('+form+') ':'')+(s.length>110?s.slice(0,110).replace(/\s+\S*$/,'')+'\u2026':s);
  }
  function searchCard(title1,sub,items,note){
    var h=title(title1,sub);
    items.slice(0,10).forEach(function(it){h+='<div class="qa-line">'+skN(it.r)+' '+(it.r.st?it.r.st+'\u2605 ':'')+'\u00b7 '+qe(it.sn)+'</div>';});
    if(items.length>10){h+=line('More matches','');h+=chips(items.slice(10,22).map(function(it){return it.r;}));}
    if(note)h+='<div class="qa-note">'+qe(note)+'</div>';
    return h;
  }
  function searchResult(title1,items,note,intro){
    items.sort(function(a,b){return (a.r.st||9)-(b.r.st||9);});
    var ctx=PRE2+(intro||title1)+'\n'+items.slice(0,24).map(function(it){return it.r.n+' ('+(it.r.st?it.r.st+'\u2605':'?')+'): '+it.sn;}).join('\n');
    return {kind:'search',html:card(searchCard(title1,items.length+' skills \u00b7 from the skill data',items,note)),ctx:ctx.slice(0,5800),names:[]};
  }
  function effectDetect(s){
    var hasSkill=/\bskills?\b/.test(s),hasGear=/\b(weapons?|armou?rs?|accessor(?:y|ies)|equipment|gear|items?|bosses|boss|dungeons?|drops?|dropped)\b/.test(s);
    if(hasGear)return null;
    var how=/^(how (do|can|could|should|to) i|how to|what (gives|gave|can|skills?|gives me)|which (gives|grants|has|have|ones)|what.s (a )?way|ways to|any way)\b/.test(s)||/\b(skills? (that|which|to|for|with)|which skills?|what skills?|any skills?)\b/.test(s);
    var named=namedSkills(s),ent=namedEnts(s);
    if(!hasSkill&&!how)return null;
    if(named.length&&!/\b(which|what) skills?\b|\bskills? (that|which)\b/.test(s)&&!how)return null;
    /* scaling sources */
    if(/\b(scal\w*|benefit\w*|stronger|enhanc\w*|boost\w*|synerg\w*|power(ed)?)\b/.test(s)){
      var sk=Object.keys(SCD).filter(function(k){return s.indexOf(k)>=0;}).sort(function(a,b){return b.length-a.length;})[0];
      if(sk){var d=SCD[sk],its=d.hits.map(function(h){return {r:h.r,sn:'+'+h.pct+'% power per '+d.name};});
        return searchResult('Skills that gain power from '+d.name,its,'Read from each skill\'s "Enhance power by" lines.','Skills whose power increases per '+d.name+':');}
    }
    if(/\b(heal\w*|recover\w*)\b/.test(s)&&/\b(most|best|strongest|biggest|highest|largest|greatest|top)\b/.test(s)){
      var hl=[];rows.forEach(function(r){var re=/Heal yourself (\d+)% of your (Maximum|Current) HP/gi,m,bst=null;while((m=re.exec(r.t))){if(!bst||+m[1]>bst.p)bst={p:+m[1],k:m[2].toLowerCase(),i:m.index};}if(bst)hl.push({r:r,p:bst.p,sn:'Heals '+bst.p+'% of your '+bst.k+' HP'+(/Quick/.test(r.t.split(FORMSEP)[0])?' · Quick':''),i:bst.i});});
      if(hl.length){hl.sort(function(a,b){return b.p-a.p||(a.r.st||9)-(b.r.st||9);});
        var h2=title('Skills by healing amount','from the skill data');
        hl.slice(0,8).forEach(function(x){h2+='<div class="qa-line">'+skN(x.r)+' '+(x.r.st?x.r.st+'★ ':'')+'· '+qe(x.sn)+'</div>';});
        h2+='<div class="qa-note">Direct heals only, as a percentage of Maximum or Current HP. Healing over time, HP stacks and Healing Power scaling are listed separately under "Skills that heal you".</div>';
        return {kind:'search',html:card(h2),ctx:PRE2+'Skills ranked by direct healing percentage:\n'+hl.slice(0,12).map(function(x){return x.r.n+' ('+x.r.st+'★): '+x.sn;}).join('\n'),names:[]};}
    }
    for(var i=0;i<CON.length;i++){var c=CON[i];if(c.q.test(s)){
      var its2=rows.filter(function(r){return c.re.test(r.t);}).map(function(r){var m=c.re.exec(r.t);return {r:r,sn:snip(r,c.re,m?m.index:undefined)};});
      if(its2.length){var sr=searchResult('Skills that '+c.lab,its2,'Matched from the skill text. The guide lists no rankings between them.','Skills that '+c.lab+':');if(c.lab==='add HP stacks'){sr.html=sr.html.replace(/<\/div>\s*$/,'<div class="qa-line"><span class="qa-lab">Player-tested</span> High Healing\'s Resurrection form restores 1 HP stack; Pure Power (Strong) (Skill Power +3) makes it 4, and adding Special (Strong) (Skill power +400%) makes it 13 (1 + 3 \u00d7 4).</div></div>');sr.ctx+='\n'+PTCTX;}return sr;}
    }}
    var keys=Object.keys(STATD).sort(function(a,b){return b.length-a.length;});
    for(var j=0;j<keys.length;j++){var k=keys[j];if(wb(s,k)&&(hasSkill||/\b(grant\w*|apply|applies|inflict\w*|cause\w*|give\w*)\b/.test(s))){
      var d2=STATD[k],seen={},its3=[];d2.hits.forEach(function(h){if(seen[h.r.n])return;seen[h.r.n]=1;its3.push({r:h.r,sn:(h.self?'on you: ':h.both?'on you and the opponent: ':'on the opponent: ')+snip(h.r,null,h.idx,true)});});
      if(!its3.length)continue;
      var self=its3.filter(function(x){return /^on you/.test(x.sn);}).length;
      return searchResult('Skills that grant '+d2.name,its3,self&&self<its3.length?'Each line says whether the status goes on you or on the opponent.':'','Skills that grant '+d2.name+' ('+self+' on you, '+(its3.length-self)+' on the opponent):');
    }}
    return null;
  }
  function skillRankDetect(s){
    if(!/\bskills?\b/.test(s))return null;
    var asc=/\b(lowest|shortest|fastest|least|fewest|smallest|quickest|min\w*)\b/.test(s),desc=/\b(highest|longest|most|largest|biggest|max\w*|greatest)\b/.test(s);
    if(!asc&&!desc)return null;
    var cd=/\bcool ?downs?\b/.test(s),us=/\b(uses|casts)\b/.test(s);if(!cd&&!us)return null;
    var key=cd?function(r){return X(r).cd;}:function(r){return r.max||null;},lab=cd?'cooldown':'maximum uses';
    var list=rows.filter(function(r){var v=key(r);return v!==null&&v!==undefined;});if(!list.length)return null;
    var up=desc&&!asc;list.sort(function(a,b){return (up?key(b)-key(a):key(a)-key(b))||(b.st-a.st);});
    var best=key(list[0]),ties=list.filter(function(r){return key(r)===best;}).length;
    var h=title((up?'Highest ':'Lowest ')+lab+' among skills','from the skill data');
    h+='<div class="qa-line">'+(ties>1?ties+' skills share the '+(up?'highest':'lowest')+' listed '+lab+' of <b>'+best+'</b>':skN(list[0])+' has the '+(up?'highest':'lowest')+' listed '+lab+' of <b>'+best+'</b>')+'.</div>';
    list.slice(0,8).forEach(function(r){h+='<div class="qa-line">'+skN(r)+' '+(r.st?r.st+'★ ':'')+'· '+qe(lab+' '+key(r))+'</div>';});
    h+='<div class="qa-note">Main form of each skill, as listed in the guide. Ties are ordered by star rating.</div>';
    return {kind:'skillrank',html:card(h),ctx:PRE2+'Skills with the '+(up?'highest':'lowest')+' '+lab+':\n'+list.slice(0,12).map(function(r){return r.n+' ('+r.st+'★) '+lab+' '+key(r);}).join('\n'),names:[]};
  }
  /* attribute questions about a named skill */
  var ATTR=[
    ['cooldown',/\b(cool ?downs?|how (often|soon)|how long (until|before)|recharge)\b/,function(r){var x=X(r);return x.cd===null?r.n+' lists no cooldown.':r.n+' has a cooldown of '+x.cd+' turn'+(x.cd===1?'':'s')+'.';}],
    ['uses',/\b(how many (uses|times|casts)|remaining uses|number of uses|max(imum)? uses|uses (does|do|has|have)|how many time)\b/,function(r){return r.n+': '+usesTxt(r)+'.';}],
    ['element',/\b(elements?|elemental|physical or magical|magical or physical|damage type|what type of damage)\b/,function(r){var x=X(r);return x.el?r.n+' deals '+x.el+' damage.':r.n+' lists no damage element.';}],
    ['stars',/\b(how many stars|what star|rarity|what rarity|how rare|which tier|what tier)\b/,function(r){return r.st?r.n+' is a '+r.st+'\u2605 skill.':r.n+' lists no star rating.';}],
    ['damage',/\b(how much damage|damage does|how (hard|strong)|multiplier|how powerful|what.s the damage|power does)\b/,function(r){return r.direct?r.n+' deals '+dmgTxt(r)+'.':r.n+' lists no direct attack in its main form.';}],
    ['quick',/\b(is it quick|quick skill|free skill|end(s)? (my |the |your )?turn)\b/,function(r){var x=X(r);return x.quick?r.n+' is a Quick skill, so it does not end your turn.':x.free?r.n+' is a Free skill.':r.n+' is not listed as a Quick or Free skill.';}]
  ];
  function attrDetect(s){
    var ns=cleanNamed(namedSkills(s),s);if(ns.length!==1)return null;
    var r=ns[0],hit=null;ATTR.forEach(function(a){if(!hit&&a[1].test(s))hit=a;});
    if(!hit)return null;
    var lead=hit[2](r);
    return {kind:'attr',html:card(factsCard(r,lead)),ctx:PRE2+ctxRow(r),names:[r.n]};
  }
  /* ways to make a named skill stronger */
  var BOOST=/\b(stronger|strengthen\w*|boost\w*|improve\w*|buff\w*|increas\w*|power (it )?up|more damage|hit harder|hits harder|scal\w*|enhanc\w*|optimi[sz]\w*|get the most|maximi[sz]\w*|upgrad\w*|amplif\w*)\b/;
  function boostDetect(s){
    var ns=cleanNamed(namedSkills(s),s);if(ns.length!==1||!BOOST.test(s))return null;
    var r=ns[0],x=X(r),h=title(r.n,'ways to increase its power'),ctx=PRE2+ctxRow(r)+'\n';
    if(x.scales.length){x.scales.forEach(function(sc){h+=line('Scales with',qe('+'+sc[0]+'% power per '+sc[1]));});}
    else h+='<div class="qa-line">'+qe(r.n)+' lists no power scaling of its own.</div>';
    if(x.scales.some(function(sc){return /remaining uses/i.test(sc[1]);})){
      h+='<div class="qa-line">Its power rises with your Total Remaining Uses of all skills, so keeping that total high strengthens it. Refilling effects add to it:</div>'+chips(refillers);
      ctx+='It scales with Total Remaining Uses of all skills; refilling skills: '+names(refillers)+'.\n';}
    if(ptOf(r)){h+=line('Player-tested',qe(ptOf(r).boost));ctx+='Player-tested: '+ptOf(r).boost+'\n';}
    if(x.el==='Void'){h+=line('Void damage','Void Penetration reduces the target\'s void resistance when attacking.');ctx+='Void Penetration reduces the target\'s void resistance when attacking.\n';}
    var spj=ENT.filter(function(en){return en.kind==='Job'&&/skill power/i.test((en.f['Job Ability']||'')+' '+(en.f['Other Stats']||''));});
    if(spj.length){h+='<div class="qa-line">Jobs with a skill power bonus in the guide:</div>'+chips(spj);ctx+='Jobs with skill power: '+spj.map(function(j){return j.n+' ('+plainT(j.f['Job Ability']||'')+')';}).join('; ')+'\n';}
    h+='<div class="qa-note">Read from the skill data and job abilities. The guide does not give final damage numbers.</div>';
    return {kind:'boost',html:card(h),ctx:ctx.slice(0,5800),names:[r.n]};
  }
  function entBtn(a){return '<button type="button" class="qa-exbtn" data-ex="'+qe('Tell me about '+a.n)+'">'+qe(a.n)+'</button>';}
  /* typo tolerance */
  var STOP={what:1,which:1,tell:1,about:1,does:1,show:1,skill:1,skills:1,there:1,these:1,those:1,their:1,would:1,could:1,should:1,where:1,boss:1,bosses:1,drop:1,drops:1,after:1,other:1,first:1,early:1,stack:1,stacks:1,power:1,magic:1,damage:1,speed:1,range:1};
  function correct(q){
    var toks=String(q).toLowerCase().replace(/[^a-z0-9' ]+/g,' ').split(/\s+/).filter(Boolean),best=null;
    var cands=rows.map(function(r){return {n:r.n,k:norm(r.n),sk:r};}).concat(ENT.map(function(en){return {n:en.n,k:norm(en.n),en:en};})).filter(function(c){return c.k.length>=5;});
    for(var len=3;len>=1;len--)for(var i=0;i+len<=toks.length;i++){
      var span=toks.slice(i,i+len).join(' ');if(span.length<5||(len===1&&(STOP[span]||(window.__qaKnown&&window.__qaKnown(span)))))continue;
      cands.forEach(function(c){if(c.k.split(' ').length!==len)return;var d=lev(span,c.k),lim=c.k.length<=7?1:2;if(d>0&&d<=lim&&(!best||d<best.d||(d===best.d&&c.k.length>best.c.k.length)))best={d:d,c:c,span:span};});
    }
    return best;
  }
  function detect(q,unmatched){
    var s=String(q||'').toLowerCase().replace(/[\u2018\u2019]/g,"'");if(!s.trim())return null;
    var rk=rankDetect(s)||skillRankDetect(s);if(rk)return rk;
    var ns=cleanNamed(namedSkills(s),s),ne=cleanNamed(namedEnts(s),s),both=ns.concat(ne);
    if(/\b(compare|comparison|vs\.?|versus|differences?|differ\w*|better|or)\b/.test(s)&&both.length>=2&&!/\bdrops?\b|\bwhere\b/.test(s)){var ms0=s.toLowerCase(),cl=both.slice(0,3).sort(function(a,b){var ia=ms0.indexOf(a.n.toLowerCase()),ib=ms0.indexOf(b.n.toLowerCase());return (ia<0?1e9:ia)-(ib<0?1e9:ib);});return {kind:'compare',html:card(compareHtml(cl)),ctx:compareCtx(cl),names:[]};}
    var rn=runeDetect(s,ns);if(rn)return rn;
    var pt=ptDetect(s,ns);if(pt)return pt;
    if(/\b(which|what|any) skills?\b|\bskills? (that|which)\b/.test(s)){var ef0=effectDetect(s);if(ef0)return ef0;}
    var bs=boostDetect(s);if(bs)return bs;
    var at=attrDetect(s);if(at)return at;
    if(ns.length===1&&/\b(good|worth\w*|useful|usable|viable|decent|any good|bad|weak|strong)\b/.test(s)&&!/\b(drop|drops|dropped|where|which|best|strongest)\b/.test(s)){
      var r2=ns[0];return {kind:'skillfacts',html:card(factsCard(r2,'The guide lists these numbers for '+r2.n+'. It does not rate skills.')+'<div class="qa-ex"><button type="button" class="qa-exbtn" data-ex="'+qe('How do I make '+r2.n+' stronger?')+'">Ways to make it stronger</button></div>'),ctx:PRE2+ctxRow(r2),names:[r2.n]};}
    if(ns.length===1&&/^(what|whats|what's)\s+(does|do|is|are)\b|^(tell me about|explain|describe|info on|information on)\b/.test(s)&&!STATD[ns[0].n.toLowerCase()]&&!/\b(drop|drops|dropped|where)\b/.test(s)){
      var r1=ns[0];return {kind:'skillfacts',html:card(factsCard(r1)+'<div class="qa-ex"><button type="button" class="qa-exbtn" data-ex="'+qe('Where does '+r1.n+' drop?')+'">Where does it drop?</button></div>'),ctx:PRE2+ctxRow(r1),names:[r1.n]};}
    var ef=effectDetect(s);if(ef)return ef;
    var old=detectOld(q,unmatched);if(old)return old;
    if(unmatched){var rkf=runeKwFallback(s);if(rkf)return rkf;}
    return null;
  }

  function fallback(q){
    var s=String(q||'').toLowerCase().replace(/[\u2018\u2019]/g,"'");
    var ns=cleanNamed(namedSkills(s),s),ne=cleanNamed(namedEnts(s),s);
    if(ns.length)return {kind:'skill',html:card(factsCard(ns[0])),ctx:PRE2+ns.slice(0,2).map(ctxRow).join('\n'),names:[ns[0].n]};
    if(ne.length)return {kind:'skill',html:card(entCard(ne[0])),ctx:PRE2+ne[0].n+' ('+ne[0].kind+'): '+ne[0].t.slice(0,600),names:[ne[0].n]};
    return null;
  }
  function corrected(q){
    var cr=correct(q);if(!cr)return null;
    return {fixed:String(q).toLowerCase().replace(cr.span,cr.c.n.toLowerCase()),name:cr.c.n};
  }
  return {rows:rows,X:X,detect:detect,fallback:fallback,corrected:corrected,burst:burst,stackers:stackers,refillers:refillers,scalers:scalers,early:early,byN:byN};
})();
window.__qaStrat=STR;
window.__qaSuggest=function(x){return suggestFor(x);};

var QA_KINDS=[
  /* Challenge/trivia prompts: multi-constraint questions grounded in the actual local tables. */
  {w:5,f:function(P){
    var pool=P.eq.filter(function(it){var e=EQN[ik(it.name)];return e&&e.all.length>=3;});
    var it=qaPick(pool);if(!it)return null;var e=EQN[ik(it.name)];
    var stats=uniq(e.all.map(function(x){return x.n;}).filter(function(n){return STAT[norm(n)]&&STAT[norm(n)].eq.length>=2;}));
    if(stats.length<2)return null;var a=qaPick(stats),b=qaOther(stats,a);if(!b)return null;
    var q=qaPick(['Which '+QA_SLOTPL[it.slot]+' have both '+a+' and '+b+'?','Find gear that combines '+a+' with '+b+'.','Which gear pieces give me both '+a+' and '+b+'?']);
    return {q:q,must:[a,b]};
  }},
  {w:5,f:function(P){
    var a=qaPick(P.bosses),s=qaPick(SLOTS),k=qaRand(2),st=(k?7:6)+'★';
    var list=a.lists[s][k];if(!list||!list.length)return null;
    var it=qaPick(list),others=P.bosses.filter(function(b){return b!==a&&b.lists[s][k].indexOf(it)>=0;});
    if(!others.length)return null;var b=qaPick(others);
    return {q:qaPick(['Which other bosses share '+it+' with '+a.name+'?','Is '+it+' exclusive to '+a.name+' or does another boss drop it too?','Where else can I farm '+it+' besides '+a.name+'?']),must:[it]};
  }},
  {w:4,f:function(P){
    var a=qaPick(P.bosses),b=qaOther(P.bosses,a);if(!b)return null;
    var s=qaPick(SLOTS),k=qaRand(2),st=(k?7:6)+'★';
    var common=a.lists[s][k].filter(function(n){return b.lists[s][k].indexOf(n)>=0;});
    if(!common.length)return null;
    return {q:qaPick(['What '+st+' '+QA_SLOTPL[s]+' can I farm from either '+a.name+' or '+b.name+'?','Which '+st+' '+QA_SLOTPL[s]+' overlap between '+a.name+' and '+b.name+'?','If I can farm '+a.name+' or '+b.name+', what shared '+st+' '+QA_SLOTPL[s]+' are available?']),must:[a.name,b.name,common[0]]};
  }},
  {w:4,f:function(P){
    var stats=P.stats.filter(function(st){return st.eq&&st.eq.length>=2;});if(stats.length<2)return null;
    var a=qaPick(stats),b=qaOther(stats,a);if(!b)return null;
    return {q:qaPick(['Which gear stats can support both '+a.n+' and '+b.n+' goals?','Find equipment with both '+a.n+' and '+b.n+'.','What gear combines '+a.n+' with '+b.n+'?']),must:[a.n,b.n]};
  }},
  /* strategy questions (answered from the skill and codex data, plus the online AI) */
  {w:6,strat:'subj',f:function(P){var t=qaPick(['race','job','origin']);return {q:qaPick(['What is the best early game '+t+'?','Which '+t+' is best for a beginner?','Which '+t+' should a new player start with?']),must:[],strat:'subj'};}},
  {w:5,f:function(P){return {q:qaPick(['What skill is the best?','Which skill is the strongest?','What is the best skill in the game?','Which skill is the most powerful?','What skill should every veteran player use?']),must:[],strat:'best'};}},
  {w:6,f:function(P){return {q:qaPick(['What skill can one shot enemies in a single hit?','Which skill deals the most damage in one hit?','Which skills can wipe out an enemy HP stack in one cast?','What is the hardest hitting skill?','Which skill can kill a boss in one turn?','What skill hits for the most damage in a single cast?']),must:[],strat:'burst'};}},
  {w:7,f:function(P){var sc=qaPick(STR.scalers),rf=qaPick(STR.refillers),one=qaPick(STR.scalers.filter(function(r){return r.casts===1;}));if(!sc||!rf)return null;
    var qs=['What works well with '+rf.n+'?','Does '+rf.n+' work well with '+sc.n+'?','Which skills get stronger the more uses I have left?','Which skills give me extra uses of my other skills?','What combo makes '+sc.n+' hit harder?','What synergy does '+rf.n+' have with my other skills?','Which skills pair well with '+rf.n+'?','How do I get a bigger refill from '+rf.n+'?'];
    var qk=qs.map(function(x){return [x,'uses'];});
    if(one)['How do I use '+one.n+' more than once?','How can I spam '+one.n+'?','How do I keep casting '+one.n+' after I run out of uses?'].forEach(function(x){qk.push([x,'combo']);});
    ['How do I use Lemegeton with Auto runes?','What works well with High Healing?','How do I restore HP stacks?','What is the best survivability setup?','How many HP stacks can High Healing restore?'].forEach(function(x){qk.push([x,'combo']);});
    ['Which runes raise skill power?','List all runes.','What runes exist?','Which runes have no description yet?','List the 7★ runes.','What are Auto runes?','What does '+qaPick(['Auto: Combat','Auto: Parry','Auto: Evade','Auto: React','Special (Strong)','Pure Power (Strong)'])+' do?','Which Auto rune activates at the start of combat?','Which Auto rune triggers when I evade?','Can runes be removed from a skill?','Can a rune be removed from a skill?','Can you take a rune out of a skill?'].forEach(function(x){qk.push([x,'rune']);});
    var pk2=qaPick(qk);return {q:pk2[0],must:[],strat:pk2[1]};}},
  {w:9,f:function(P){
    var big=STR.rows.filter(function(r){return r.st>=3&&r.direct;}),a=qaPick(big),b=qaPick(big),tries=0;
    while(a&&b&&a.n===b.n&&tries++<8)b=qaPick(big);
    var sc=qaPick(STR.rows.filter(function(r){return r.st>=3&&STR.X(r).scales.length&&!/remaining uses/i.test(STR.X(r).scales[0][1]);}))||a;
    if(!a||!b)return null;
    var T=[['Which skills '+qaPick(['heal me','give a shield','stun the enemy','summon minions','cure ailments','grant haste','inflict poison','give extra HP stacks'])+'?','search'],
      ['What is the cooldown of '+a.n+'?','attr'],['How many uses does '+a.n+' have?','attr'],['What element is '+a.n+'?','attr'],
      ['Compare '+a.n+' and '+b.n+'.','compare'],
      ['Which race has the most '+qaPick(['HP','shield','HP stacks'])+'?','rank'],['Which job has the highest '+qaPick(['STR','DEX','INT','PIE'])+'?','rank'],
      ['How do I make '+sc.n+' stronger?','boost'],['Which skills have the lowest cooldown?','skillrank'],['Which skill has the most uses?','skillrank'],
      ['Which skills scale with '+qaPick(['Critical','Healing Power'])+'?','search']];
    var pk=qaPick(T);return {q:pk[0],must:[],strat:pk[1]};}},
  {w:6,f:function(P){return {q:qaPick(['How can I survive an early game dungeon run?','How do I survive the first dungeons?','How do I stay alive early in a run?','What helps a beginner survive early dungeons?','How do I not die in my first dungeon runs?','What skills keep me alive in the early game?']),must:[],strat:'survive'};}},
  {w:4,f:function(P){return {q:qaPick(['Which items have no images yet?','What is undocumented in '+qaPick(['dungeons','disasters','conquests'])+'?','Which skills have no card yet?','Which '+qaPick(['weapons','armor','accessories'])+' have no images yet?','What is missing a card or image?']),must:[],trust:1};}},
  /* a few harder lookups, kept rare */
  {lk:1,w:1,f:function(P){var q0=qaPick(P.eq),e=EQN[ik(q0.name)];if(!e)return null;var xs=e.all.filter(function(x){var s=STAT[norm(x.n)];return s&&s.eq.length>=2&&x.n.indexOf('+')<0;});if(xs.length<2)return null;
    var x=qaPick(xs),y=qaOther(xs.filter(function(z){return z.n!==x.n;}),x);if(!y)return null;
    var st=qaPick(Array.from(q0.stars))+'\u2605',sl=QA_SLOTPL[q0.slot];
    return {q:qaPick(['Which '+st+' '+sl+' give '+x.n+' and '+y.n+'?','Which '+st+' '+sl+' have both '+x.n+' and '+y.n+'?']),must:[x.n,y.n,e.name]};}},
  {lk:1,w:1,f:function(P){var a=qaPick(P.bosses),b=qaOther(P.bosses,a);if(!b)return null;
    return {q:qaPick(['What is in '+a.name+' but not in '+b.name+'?','Compare '+a.name+' and '+b.name+'.','What do '+a.name+' and '+b.name+' have in common?','Compare '+a.name+' and '+b.name+': '+QA_SLOTPL[qaPick(SLOTS)]+' only']),must:[a.name,b.name]};}},
  {lk:1,w:1,f:function(P){var a=qaPick(P.bosses),b=qaOther(P.bosses,a),s=qaPick(SLOTS),k=qaRand(2),st=(k?7:6)+'\u2605',only=a.lists[s][k].filter(function(n){return b.lists[s][k].indexOf(n)<0;});
    if(!only.length)return null;
    return {q:'Compare '+a.name+' and '+b.name+' by '+st+' '+QA_SLOTPL[s],must:[a.name,b.name,only[0]]};}},
  {lk:1,w:1,f:function(P){var a=qaPick(P.drop),pool=P.drop.filter(function(x){return x!==a&&x.bosses.some(function(b){return a.bosses.indexOf(b)>=0;});}),b=pool.length?qaPick(pool):null;if(!b)return null;
    return {q:'Which bosses drop both '+a.name+' and '+b.name+'?',must:[a.name,b.name]};}},
  {lk:1,w:1,f:function(P){var a=qaPick(P.eq),b=qaOther(P.eq.filter(function(x){return x.slot===a.slot;}),a);if(!b)return null;return {q:qaPick(['Compare '+a.name+' and '+b.name,'Which is better, '+a.name+' or '+b.name+'?']),must:[a.name,b.name]};}}
];
function qaOK(c){
  /* a suggestion must go through the whole pipeline untouched: no "Understood as" rewrite */
  try{if(window.__qaPre&&window.__qaPre(c.q)!==c.q)return false;}catch(e){}
  if(c.strat==='subj')return /\b(best|beginner|new player|start with)\b/i.test(c.q)&&/\b(race|job|origin)\b/.test(c.q)&&!STR.detect(c.q,false);
  if(c.strat){var d=STR.detect(c.q,false);return !!d&&d.kind===c.strat&&d.html.replace(/<[^>]*>/g,' ').length>200;}
  if(c.trust)return true; /* v98: kinds that always pass skip the slow answerer test */
  var h;try{h=answer(c.q);}catch(e){return false;}
  var t=String(h).replace(/<[^>]*>/g,' ').replace(/&#39;|&apos;/g,"'").toLowerCase();
  if(t.length<30||/couldn.t match|no single most|every one of the|type a question|rerolls|no equipment|no boss lists|no bosses/.test(t))return false;
  for(var i=0;i<c.must.length;i++)if(t.indexOf(String(c.must[i]).toLowerCase())<0)return false;
  return true;
}
function qaIdeaState(){return {res:[],P:qaPools(),seen:{},used:{},bag:[],tries:0,lk:0};}
function qaIdeaIter(st){ /* one try of the old loop (v98: split out so the sliced version shares it) */
  st.tries++;
  if(!st.bag.length){QA_KINDS.forEach(function(k,i){for(var j=0;j<k.w;j++)st.bag.push(i);});st.bag=qaShuffle(st.bag);}
  var ki=st.bag.pop();
  if(QA_KINDS[ki].lk&&st.lk>=1)return;
  if(st.used[ki]&&Object.keys(st.used).length<QA_KINDS.filter(function(k){return !k.lk;}).length+1)return;
  var c=null;try{c=QA_KINDS[ki].f(st.P);}catch(e){c=null;}
  if(!c||st.seen[c.q]||!qaOK(c))return;
  st.seen[c.q]=1;st.used[ki]=1;if(QA_KINDS[ki].lk)st.lk++;st.res.push(c.q);
}
function qaIdeas(n){
  if(QA_GEN_BUSY)return [];
  QA_GEN_BUSY=true;
  var st=null;
  try{
    st=qaIdeaState();
    while(st.res.length<n&&st.tries<150)qaIdeaIter(st);
  }catch(e){}
  QA_GEN_BUSY=false;
  return st?st.res:[];
}
/* v98: the same generator in small time slices, so the page never freezes (cb gets the list; alive() = false stops early) */
function qaIdeasAsync(n,cb,alive){
  var st=null;
  function slice(){
    if(alive&&!alive())return;
    if(QA_GEN_BUSY){setTimeout(slice,25);return;}
    QA_GEN_BUSY=true;
    var t0=performance.now();
    try{
      if(!st)st=qaIdeaState();
      while(st.res.length<n&&st.tries<150&&performance.now()-t0<12)qaIdeaIter(st);
    }catch(e){if(st)st.tries=150;else st={res:[],tries:150};}
    QA_GEN_BUSY=false;
    if(st.res.length<n&&st.tries<150)setTimeout(slice,0);
    else{try{cb(st.res);}catch(e){}}
  }
  setTimeout(slice,0);
}
/* v98: fill the empty 'Try one of these' boxes that fallback() leaves, only if they are still on the page a moment after the answer was shown */
var QA_LAZY_T=0;
function qaFillLazy(){
  QA_LAZY_T=0;
  Array.prototype.forEach.call(document.querySelectorAll('[data-qa-lazy]'),function(el){
    var n=parseInt(el.getAttribute('data-qa-lazy'),10)||6;
    el.removeAttribute('data-qa-lazy');
    qaIdeasAsync(n,function(list){
      if(!el.isConnected)return;
      el.innerHTML=list.map(function(e){return '<button type="button" class="qa-exbtn" data-ex="'+qe(e)+'">'+qe(e)+'</button>';}).join('');
    },function(){return el.isConnected;});
  });
}
function qaLazyWatch(){
  try{
    new MutationObserver(function(){
      if(QA_LAZY_T||!document.querySelector('[data-qa-lazy]'))return;
      QA_LAZY_T=setTimeout(qaFillLazy,60);
    }).observe(document.body,{childList:true,subtree:true});
  }catch(e){}
}
window.__qaIdeas=qaIdeas;
function sigToks(s){return norm(s).split(' ').filter(function(t){return t.length>=3&&!FILL[t]&&!/^\d+$/.test(t);});}
function suggestFor(text){
  var qt=sigToks(text);
  if(!qt.length)return [];
  var out=[];
  var pool=[];
  cands.forEach(function(c){pool.push(c.kind==='item'?{n:c.n,label:c.it.name,q:'Where does '+c.it.name+' drop?'}:{n:c.n,label:c.b.name,q:'What does '+c.b.name+' drop?'});});
  scands.forEach(function(c){if(!c.alias)pool.push({n:c.n,label:c.s.n,q:'Which items give '+c.s.n+'?'});});
  pool.forEach(function(p){
    var ct=p.n.split(' '),sc=0,hits=0;
    qt.forEach(function(q){
      var best=0;
      ct.forEach(function(t){
        if(t===q)best=Math.max(best,3);
        else if(q.length>=5&&t.length>=4&&(t.indexOf(q)===0||(t.length>=5&&q.indexOf(t)===0)))best=Math.max(best,2.5);
        else if(q.length>=5&&t.length>=5&&ed(q,t,q.length>=8?2:1)<=(q.length>=8?2:1)&&!(window.__qaKnown&&window.__qaKnown(q)))best=Math.max(best,2);
      });
      if(best){sc+=best;hits++;}
    });
    if(hits)out.push({p:p,sc:sc+hits});
  });
  out.sort(function(a,b){return (b.sc-a.sc)||(a.p.n.length-b.p.n.length);});
  var seen={},res=[];
  out.forEach(function(o){if(res.length<4&&!seen[o.p.label]){seen[o.p.label]=1;res.push(o.p);}});
  return res;
}
function fallback(text){
  var sg=suggestFor(text),h='<div>I couldn\'t match "'+qe(text)+'" to an item, boss, stat or count.</div>';
  if(sg.length)h+='<div class="qa-note">Did you mean:</div><div class="qa-ex">'+sg.map(function(p){return '<button type="button" class="qa-exbtn" data-ex="'+qe(p.q)+'">'+qe(p.label)+'</button>';}).join('')+'</div>';
  h+='<div class="qa-note">I can answer where things drop, what they do, which gear has a stat, yes/no checks, comparisons, rankings and counts. Try one of these:</div><div class="qa-ex" data-qa-lazy="6"></div>';
  return card(h);
}

/* ---------- router ---------- */
var RE={weapon:/\bweapons?\b/,armor:/\barmou?rs?\b/,accessory:/\baccessor(y|ies)\b/,skill:/\bskills?\b/};
function answer(text){
  if(!text||!text.trim())return card('Type a question, for example: <i>How many 7\u2605 weapons in Crystal Beach?</i>');
  var raw=String(text).replace(/(?:\u2605|\u2606|\*){7}/g,' 7 ').replace(/(?:\u2605|\u2606|\*){6}/g,' 6 ');
  var LH=lootRoute(raw);if(LH)return LH;
  var P=parseAll(raw);
  var itemsF=P.items,bossF=P.bosses,statsF=P.stats,termsF=P.terms;
  var dg=docIntent(P.w0);
  if(dg&&dg.chk&&!itemsF.length&&!bossF.length)dg=null;
  if(dg&&statsF.length&&!itemsF.length&&!bossF.length)dg=null;
  var fm=dg?null:factMatch(P.w,itemsF.length||bossF.length);
  if(fm)return factCard(fm);
  if(!dg&&!itemsF.length&&!statsF.length&&!termsF.length)itemsF=fuzzyItems(raw,!bossF.length);
  if(!dg&&!itemsF.length&&!bossF.length&&!statsF.length&&!termsF.length){
    partialEntity(raw).forEach(function(c){if(c.kind==='item')itemsF.push(c.it);else bossF.push(c.b);});itemsF=twins(itemsF,raw);
  }
  var w=syn(P.w),w0=P.w0.trim();
  QA_SUPER=/\b(most|highest|best|biggest|largest|strongest|greatest|lowest|least|weakest|smallest|top)\b/.test(w);
  var six=/\b(6|six)\b/.test(w),seven=/\b(7|seven)\b/.test(w);
  var stars=six&&!seven?[6]:(seven&&!six?[7]:[6,7]);
  var slots=SLOTS.filter(function(s){return RE[s].test(w);});
  if(/\bequipments?\b/.test(w)&&!slots.length)slots=['weapon','armor','accessory'];
  var hasSlot=slots.length>0;if(!hasSlot)slots=SLOTS.slice();
  var types=[];
  if(/\bdungeons?\b/.test(w.replace(/\bspecial dungeons?\b/g,' ')))types.push('Dungeon');
  if(/\bdisasters?\b/.test(w))types.push('Disaster');
  if(/\bconquests?\b/.test(w))types.push('Conquest');
  if(/\bspecial\b/.test(w))types.push('Special');
  var countQ=/\b(how many|count|total|number|amount)\b/.test(w);
  var listQ=/\b(list|show|display|all|every|what are|which)\b/.test(w);
  var hasStar=six||seven;

  var yn=/^(does|do|did|can|could|will|would|is|are|has|have|should)\b/.test(w0);
  var negQ=/\b(dont|doesnt|didnt|do not|does not|did not|not|never|without|except|excluding|lack|lacks|lacking|missing|isnt|arent|cant|cannot|wont|none)\b/.test(w);
  var cmpDiffQ=/\b(compare|compares|comparing|comparison|compared|versus|vs|against|difference|differences|differ|differs|differing|different|differently)\b/.test(w);
  var cmpCommonQ=/\b(in common|common|share|shares|shared|sharing|overlap|overlaps|same|alike|similar|similarity|similarities)\b/.test(w);
  var cmpBossQ=cmpDiffQ||cmpCommonQ;
  var exSl=[],exM=/\b(?:without|excluding|except(?: for)?|minus|ignoring|skipping)\s+(?:the\s+)?(weapons?|armou?rs?|accessor(?:y|ies)|skills?|equipments?)\b/.exec(w);
  if(exM){var xt=exM[1];exSl=/^weapon/.test(xt)?['weapon']:/^armou?r/.test(xt)?['armor']:/^accessor/.test(xt)?['accessory']:/^skill/.test(xt)?['skill']:['weapon','armor','accessory'];}
  var cmpItemQ=/\b(compare|comparison|compared|versus|vs|difference|differences|differ|differs|better)\b/.test(w);
  var effectQ=/\b(effect|effects|ability|abilities|stat|stats|bonus|bonuses|perk|perks|describe|description|explain|explains|tooltip|details?|info|information|about)\b/.test(w)||
    /\bwhat (does|do|is|are|s)\b.*\b(do|does|give|gives|grant|grants|provide|provides|have|has|offer|offers|boost|boosts|increase|increases|mean|means)\b/.test(w)||
    /\b(what is|whats|tell me)\b/.test(w);
  var whereQ=/\b(where|drop|drops|dropped|dropping|bosses|boss|dungeon|dungeons|disaster|disasters|conquest|conquests)\b/.test(w);
  var orQ=/\b(weapon|armor|accessory|skill)\s+or\s+/.test(w);
  var typeQ=/\b(what type|what kind|what category|which category|what slot|which slot|what rarity|which rarity|how many stars|what star|which star|what tier)\b/.test(w)||orQ||(/^(is|are)\b/.test(w0)&&hasSlot&&!bossF.length&&!types.length);
  var rankQ=/\b(most|fewest|least|rarest|commonest|common|popular|frequent|frequently|widespread|exclusive)\b/.test(w);
  var rankAsc=/\b(fewest|least|rarest|lowest|smallest|minimum|exclusive)\b/.test(w);
  var itemSubj=/\b(which|what)\s+(weapon|armor|accessory|skill|item|equipment)\b/.test(w)||/\b(rarest|commonest|common|popular|widespread|exclusive|frequent|frequently)\b/.test(w)||/\b(most|fewest|least)\s+(bosses|dungeons|places)\b/.test(w);

  /* a bare category or star after a comparison ("only armor", "7 only") redoes that comparison */
  var cmpPv=cmpPrev();
  if(cmpPv&&!P.items.length&&!bossF.length&&!statsF.length&&!termsF.length&&followCat(w))return bossDiff(cmpPv.bs,stars,hasSlot?slots:SLOTS.slice(),{mode:cmpPv.mode,base:cmpPv.base});
  if(dg)return docRoute({its:itemsF,bs:bossF,types:types,slots:slots,hasSlot:hasSlot,stars:stars,hasStar:hasStar,boss:/\b(boss|bosses)\b/.test(w0)},dg);
  if(bossF.length>=2&&!P.items.length){
    var cb=bossF.slice(0,3),cdir=cmpDirection(P.w,P.bpos,cb.length,cmpBossQ);
    if(cdir||cmpBossQ){
      var cmpSl=exSl.length?SLOTS.filter(function(s){return exSl.indexOf(s)<0;}):(hasSlot?slots:SLOTS.slice());
      return bossDiff(cb,stars,cmpSl,{mode:cdir?'dir':(cmpCommonQ&&!cmpDiffQ?'common':'diff'),base:cdir?cdir.base:0,cut:bossF.length>3?1:0});
    }
  }
  if(cmpItemQ&&itemsF.length>=2)return compareItems(itemsF,/\b(better|best|stronger|strongest|worse|worth)\b/.test(w));
  if(itemsF.length&&statsF.length)return hasStatCard(itemsF,statsF);
  if(yn&&itemsF.length&&(bossF.length||types.length))return yesNoCard(itemsF,bossF,types);
  if(negQ&&itemsF.length&&!yn)return withoutCard(itemsF,types);
  if(/\b(missing|incomplete|inconsistent|incorrect|missed|lacking|short|empty|mismatch|wrong)\b/.test(w)&&!itemsF.length&&!statsF.length)return missingCard(bossF,types)+docCard({img:true,info:true,compact:true,bs:bossF,types:types,slots:slots,hasSlot:hasSlot,stars:stars,hasStar:hasStar});
  if(/\b(pattern|consistent|standard|usual|normal|structure)\b/.test(w)&&!statsF.length)return patternCard();
  if(statsF.length)return statCard(statsF,bossF,stars,slots,hasStar,hasSlot);
  if(!itemsF.length&&P.statQ&&!termsF.length){
    var fam=familyStats(P.w);
    if(fam.length&&fam.length<=40)return familyCard(fam,bossF,stars,slots,hasStar,hasSlot);
  }
  if(termsF.length&&!itemsF.length&&!bossF.length)return termsF.slice(0,3).map(termCard).join('');
  if(itemsF.length&&typeQ)return typeCard(itemsF,orQ||!/^(is|are)\b/.test(w0)?null:SLOTS.filter(function(s){return RE[s].test(w);}));
  if(itemsF.length&&effectQ)return itemsF.slice(0,3).map(effectCard).join('');
  if(itemsF.length>=2&&/\b(and|both|together|same|also)\b/.test(w))return commonCard(itemsF.slice(0,4));
  if(itemsF.length){
    var lead=countQ&&itemsF.length===1&&itemsF[0].bosses.length?'<div>Drops from <b>'+itemsF[0].bosses.length+'</b> boss'+(itemsF[0].bosses.length===1?'':'es')+': '+['Dungeon','Disaster','Conquest'].map(function(t){var n=itemsF[0].bosses.filter(function(b){return b.type===t;}).length;return n?n+' '+(n===1?PLURAL[t].replace(/s$/,''):PLURAL[t]):'';}).filter(Boolean).join(', ')+'.</div>':'';
    return itemsF.slice(0,4).map(function(it){return itemCard(it,lead);}).join('');
  }
  if(rankQ&&!bossF.length){
    return itemSubj?rankItems(types.filter(function(t){return t!=='Special';}),stars,slots,hasStar,hasSlot,rankAsc):rankBosses(types.filter(function(t){return t!=='Special';}),stars,slots,hasStar,hasSlot,rankAsc);
  }
  if(bossF.length)return bossF.slice(0,3).map(function(b){return countQ?countCard(b,stars,slots):bossCard(b,stars,slots);}).join('');
  if(types.length||countQ||((listQ||(hasStar&&hasSlot))&&(hasStar||hasSlot)))return groupCard(types,stars,slots,(listQ||(hasStar&&hasSlot))&&!countQ);
  return fallback(text);
}
window.__qaAnswer=answer;

var inp=document.getElementById('qaInput'),out=document.getElementById('qaOut'),go=document.getElementById('qaGo'),ex=document.getElementById('qaEx');
if(inp&&out){
  var run=function(){
    var raw=inp.value,q=window.__qaPre?window.__qaPre(raw):raw;
    var mh=window.__qaMulti&&window.__qaMulti(q,answer);
    out.innerHTML=mh||answer(q);
    if(window.__qaOnline&&!mh)window.__qaOnline(q,out);else if(mh&&window.__qaMultiAfter){try{window.__qaMultiAfter(q,out);}catch(err){}}
    if(q!==raw)out.insertAdjacentHTML('afterbegin','<div class="qa-note">Understood as: <b>'+qe(q)+'</b></div>');
    try{if(window.__qaShape)window.__qaShape(out);}catch(err){}
    try{
      if(window.matchMedia&&matchMedia('(pointer:coarse)').matches&&document.activeElement===inp)inp.blur();
      out.scrollIntoView({block:'nearest',behavior:'smooth'});
    }catch(err){}
  };
  window.QA.run=run; /* v46: click + Enter are wired by the core handler 'page_ask' (part 077a) */
  var fill=function(e){var b=e.target.closest('.qa-exbtn');if(!b)return;inp.value=b.dataset.ex;run();};
  var QA_IDEAS_BUSY=false;
  var showIdeas=function(){
    if(QA_IDEAS_BUSY)return;
    QA_IDEAS_BUSY=true;ex.style.opacity='.5';
    qaIdeasAsync(7,function(ideas){
      QA_IDEAS_BUSY=false;ex.style.opacity='';
      if(ideas.length>1)inp.placeholder=ideas.pop();
      ex.innerHTML=ideas.map(function(e){return '<button type="button" class="qa-exbtn" data-ex="'+qe(e)+'">'+qe(e)+'</button>';}).join('')+'<button type="button" class="qa-exbtn qa-shuffle" title="Show different questions" aria-label="Show different questions">\u21BB New ideas</button>';
    });
  };
  /* v98: while the page is still loading, the DOMContentLoaded call (part 7340) shows the ideas once, with the full question pipeline */
  if(document.readyState!=='loading')showIdeas();
  window.__qaShowIdeas=showIdeas;
  qaLazyWatch();
  ex.addEventListener('click',function(e){if(e.target.closest('.qa-shuffle')){showIdeas();return;}fill(e);});
  out.addEventListener('click',fill);
  out.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-lootopen]');if(!a)return;e.preventDefault();try{window.openLoot(a.getAttribute('data-lootopen'));}catch(x){}});
}
})();
