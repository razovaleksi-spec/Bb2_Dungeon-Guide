
/* ===== Follow-up resolver (one layer, offline) =====
   Sits OUTSIDE the existing question chain, so synonyms, typo fixes and the older follow-up memory still run first.
   It only acts on a question the person really typed, and only when the previous answer was an entity card
   (a skill, gear piece, race, job, origin, contract, boss) or a comparison. It never invents a topic from answer text. */
(function(){'use strict';
var W=window,I=document.getElementById('qaInput'),O=document.getElementById('qaOut');
if(!I||!O||W.__qaFollowUp)return;
var prev=null,names=null,cache={key:'',res:''},NS=window.QA.state.named;
function norm(s){return String(s||'').toLowerCase().replace(/[\u2019']/g,'').replace(/[^a-z0-9\u2605+ ]+/g,' ').replace(/\s+/g,' ').trim();}
function plain(h){return String(h||'').replace(/<[^>]*>/g,' ');}
function ans(q){try{return plain(W.__qaAnswer?W.__qaAnswer(q):'');}catch(e){return "I couldn't match";}}
function good(q){var a=ans(q);if(a.length>30&&!/I couldn.t match/.test(a)&&!/Tell me a bit more/.test(a))return true;
  try{var f=W.__qaStrat&&W.__qaStrat.fallback&&W.__qaStrat.fallback(q);return !!(f&&f.html);}catch(e){return false;}} /* the page answers named skills and gear through a second route too */
function buildNames(){var a={};function add(n){n=String(n||'').replace(/\s+/g,' ').trim();if(n.length>=3&&n.length<=45)a[norm(n)]=n;}
  try{JSON.parse(document.getElementById('qaKB').textContent||'[]').forEach(function(r){if(r&&r[1]&&r[0]!=='Term')add(r[1]);});}catch(e){}
  try{Object.keys(ITEM_DETAILS).forEach(function(k){add(k.replace(/::(weapon|armor|accessory|skill)$/,''));});}catch(e){}
  try{((W.__qaStrat&&W.__qaStrat.rows)||[]).forEach(function(r){add(r&&(r.n||r.name));});}catch(e){}   /* every skill the page knows */
  try{[].forEach.call(document.querySelectorAll('[id^=tbody] td:first-child'),function(td){add((td.getAttribute('data-q')||td.textContent||'').split('\n')[0]);});}catch(e){}
  return a;}
function find(text){if(!names)names=buildNames();var raw=String(text),z=' '+norm(raw)+' ',hits=[];
  Object.keys(names).forEach(function(k){var i=z.indexOf(' '+k+' ');if(i<0)return;var nm=names[k];
    if(!(k.indexOf(' ')>=0||k.length>=7)){var re=new RegExp('(^|[^A-Za-z])'+nm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^A-Za-z]|$)');if(!re.test(raw))return;} /* short one-word names count only when written with their capital letter */
    hits.push({n:nm,i:i,l:k.length});});
  hits.sort(function(a,b){return b.l-a.l;});var keep=[];
  hits.forEach(function(h){if(!keep.some(function(k){return k.i<=h.i&&h.i+h.l<=k.i+k.l;}))keep.push(h);});
  return keep.sort(function(a,b){return a.i-b.i;}).map(function(h){return h.n;});}
var KIND=/^(?:\d\u2605\s*)?(skill|weapon|armor|armour|accessory|race|job|origin|contract|disaster|conquest|dungeon|boss|rune|equipment)\b/i;
function shown(){var out=[],cards=O.querySelectorAll('.qa-card');
  for(var i=0;i<cards.length;i++){var t=cards[i].querySelector('.qa-title'),s=cards[i].querySelector('.qa-sub');if(!t||!s)continue;
    var full=t.textContent.trim(),sub=s.textContent.trim();if(!sub||full.slice(-sub.length)!==sub||!KIND.test(sub))continue;
    var nm=full.slice(0,full.length-sub.length).trim();if(nm)out.push(nm);}
  return out;}
function isCompare(){var t=O.querySelector('.qa-card .qa-title');return !!t&&/^Comparison/i.test(t.textContent.trim());}
function firstGood(list){for(var i=0;i<list.length;i++)if(good(list[i]))return list[i];return null;}
function resolve(raw){
  var q=raw.replace(/\s+/g,' ').trim(),words=q.split(' ').length,own=find(q);
  var ctx=(isCompare()&&NS.cur.length>=2)?NS.cur.slice(0,2):shown();if(!ctx.length){var rf=W.QA.ref(true);ctx=rf?[rf.name]:NS.cur.slice(0,2);}
  if(!ctx.length||words>14)return null;
  var T=ctx[0],P=ctx[1],z=q.toLowerCase().replace(/[?!.]+$/,'').trim(),r;
  /* 1. pair questions after a comparison */
  if(!own.length&&ctx.length>=2&&/^(which|who)( one)?( is| would be| should i use)?( better| stronger| best)?$|^(compare|versus|vs)( them| these| both| the two)?$|^(what.s|what is) the difference$/.test(z)){
    return firstGood(['compare '+T+' and '+P]);}
  /* 2. bare follow-ups: explain more about the entity just shown */
  if(!own.length&&/^(why|why is that|why is it good|how come|tell me more|more|more details|explain|explain more|elaborate|go on|what else)$/.test(z))
    return firstGood(['how does '+T+' work','tell me about '+T]);
  /* 3. pronouns: "its cooldown", "where do I get it", "what about its defense" */
  var pron=/\b(its|it's|their|it|this one|that one|they|them)\b/i;
  var cmp=/\b(compare|vs\.?|versus|better than|worse than|stronger than|weaker than|differ|difference)\b/i;
  if(pron.test(q)&&(!own.length||cmp.test(q))){
    r=q.replace(/^(what about|how about|and|also)\s+/i,'').replace(/\b(its|it's|their)\b/i,T).replace(/\b(it|this one|that one|they|them)\b/i,T).replace(/\?+$/,'');
    return firstGood([r]);}
  return null;}
W.__qaFollowUp=function(raw){return resolve(String(raw||''));};
W.__qaFollowUpState=function(){return {cur:NS.cur.slice(),prev:NS.prev.slice(),shown:shown(),cmp:isCompare()};};
W.QA.pre.add('followup_resolver',60,function(n){prev=n;return function(raw){
  var base=prev?prev(raw):raw;
  if(raw!==I.value)return base;                    /* only for what the person typed */
  var key=raw+'#'+O.textContent.length+':'+O.textContent.slice(0,60);
  if(cache.key===key)return cache.res;             /* same submission asked twice: same answer, no state change */
  try{if(!names)names=buildNames();shown().forEach(function(n){names[norm(n)]=n;});}catch(e){}   /* names the page itself showed count as known */
  var out=base,r=null;try{r=resolve(raw);}catch(e){}
  if(r)out=r;
  else if(base!==raw&&/\b(its|it's|their|it)\b/i.test(raw)){   /* dangling "its/it": an older topic must not be injected unless the previous question named it */
    var mine=find(raw),inj=find(base).filter(function(n){return mine.indexOf(n)<0&&NS.cur.indexOf(n)<0;});
    if(inj.length)out=raw;}
  NS.prev=NS.cur;try{NS.cur=find(out);}catch(e){NS.cur=[];}
  cache={key:key,res:out};return out;};});
})();
