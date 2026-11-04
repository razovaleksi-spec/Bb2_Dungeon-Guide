
/* ===== Ask-box fix: names like "Rainabel's Dark Elf" (a weapon) contain the race name "Dark Elf".
   window.__qaMask(text) blanks out any known item, skill, boss or term name that contains a race, job or
   origin name, so the race/job/origin lookups only see race/job/origin words the person really typed. ===== */
(function(){
'use strict';
var norm=function(s){return String(s).toLowerCase().replace(/[\u2018\u2019']/g,'').replace(/[^a-z0-9]+/g,' ').trim();};
var pats=null;
function build(){
  if(pats)return pats;
  pats=[];
  var kb=[];try{kb=JSON.parse(document.getElementById('qaKB').textContent);}catch(e){}
  var base={};
  kb.forEach(function(e){if((e[0]==='Race'||e[0]==='Job'||e[0]==='Origin')&&norm(e[1]).length>=3)base[norm(e[1])]=1;});
  var baseKeys=Object.keys(base),names={};
  function add(n){if(!n)return;var z=norm(n);if(z.length<5||base[z])return;if(!names[z])names[z]=String(n);}
  [].forEach.call(document.querySelectorAll('.idx-link[data-q]'),function(a){add(a.getAttribute('data-q'));});
  try{if(typeof ITEM_DETAILS!=='undefined')Object.keys(ITEM_DETAILS).forEach(function(k){add(k.replace(/::(weapon|armor|accessory|skill)$/,''));});}catch(e){}
  try{if(typeof SKILL_DETAILS!=='undefined')Object.keys(SKILL_DETAILS).forEach(add);}catch(e){}
  try{if(typeof TERMS!=='undefined')Object.keys(TERMS).forEach(add);}catch(e){}
  var list=[];
  Object.keys(names).forEach(function(z){var pad=' '+z+' ';
    if(baseKeys.some(function(b){return pad.indexOf(' '+b+' ')>=0;}))list.push(names[z]);});
  list.sort(function(a,b){return b.length-a.length;});
  list.forEach(function(n){
    var words=n.split(/[^A-Za-z0-9\u2018\u2019']+/).filter(Boolean);
    var parts=words.map(function(w){
      var poss=/^(.+?)['\u2018\u2019]s$/i.exec(w),core=poss?poss[1]:w;
      core=core.replace(/['\u2018\u2019]/g,'');
      var p=core.split('').map(function(c){return c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join("['\u2018\u2019]?");
      return poss?p+"(?:['\u2018\u2019]?s)?":p;});
    try{pats.push(new RegExp('(^|[^A-Za-z0-9])'+parts.join("[^A-Za-z0-9]+")+'(?![A-Za-z0-9])','gi'));}catch(e){}
  });
  return pats;
}
window.__qaMask=function(q){
  var s=String(q==null?'':q);
  try{build().forEach(function(re){re.lastIndex=0;s=s.replace(re,'$1 \u00A7 ');});}catch(e){}
  return s;
};

/* ---- spelled-correctly words ----
   window.__qaKnown(word) is true for any word that appears in the guide's own text (index, codex, tooltips, terms, skills,
   equipment) or is an everyday question word, including plurals and -ed/-ing forms of them. The typo fixers must never "correct"
   such a word (e.g. "runes" must not become "rules", and "remove" must not become "remote"). Built on first use. */
var KNOWN=null;
var EVERYDAY=('remove removed removes removing removal replace replaced replaces replacing swap swapped swaps change changed changes changing switch switched possible permanent permanently delete deleted deleting undo undone unset extract extracted equip equipped unequip unequipped upgrade upgraded upgrades level levels leveled sell sold selling trade traded rules rule explain explained happens happen stack stacks stacked works working worth worthy farming reroll rerolled rerolls rerolling whether without within before after because should would could might every anything something everything another between during already always never often sometimes usually really actually mostly mainly simply exactly instead rather enough almost around against through beyond across toward towards tower towers power powers permanent').split(' ');
function buildKnown(){
  if(KNOWN)return KNOWN;
  KNOWN={};
  var add=function(t){(String(t==null?'':t).toLowerCase().match(/[a-z]{3,}/g)||[]).forEach(function(w){KNOWN[w]=1;});};
  var walk=function(o,d){
    if(o==null||d>6)return;
    if(typeof o==='string'){if(o.length<4000&&o.slice(0,5)!=='data:')add(o);return;}
    if(Array.isArray(o)){o.forEach(function(x){walk(x,d+1);});return;}
    if(typeof o==='object'){Object.keys(o).forEach(function(k){if(k==='icon'||k==='img'||k==='image'||k==='src')return;walk(o[k],d+1);});}
  };
  EVERYDAY.forEach(function(w){if(w)KNOWN[w]=1;});
  try{add((document.getElementById('index')||document.body).textContent);}catch(e){}
  ['qaKB','qaOpinions'].forEach(function(id){try{walk(JSON.parse(document.getElementById(id).textContent),0);}catch(e){}});
  var srcs=[];
  try{if(typeof TERMS!=='undefined')srcs.push(TERMS);}catch(e){}
  try{if(typeof SKILL_DETAILS!=='undefined')srcs.push(SKILL_DETAILS);}catch(e){}
  try{if(typeof ITEM_DETAILS!=='undefined')srcs.push(ITEM_DETAILS);}catch(e){}
  srcs.forEach(function(o){try{Object.keys(o).forEach(function(k){add(k.replace(/::(weapon|armor|accessory|skill)$/,''));walk(o[k],1);});}catch(e){}});
  return KNOWN;
}
window.__qaKnown=function(w){
  w=String(w==null?'':w).toLowerCase();
  var K=buildKnown();
  if(K[w])return true;
  var v=[w.replace(/ies$/,'y'),w.replace(/es$/,''),w.replace(/s$/,''),w.replace(/ed$/,''),w.replace(/ed$/,'e'),w.replace(/d$/,''),w.replace(/ing$/,''),w.replace(/ing$/,'e')];
  for(var i=0;i<v.length;i++)if(v[i]!==w&&v[i].length>=3&&K[v[i]])return true;
  return false;
};
})();
