
/* ===== DEVELOPER NOTE (invisible on the page) =====
   Online LLM requests are optional and disabled by default (see QA_PROXY and callAI in the "Q&A upgrade v7" script).
   Offline improvements must NOT break that. Keep stable: window.__qaAnswer(text)->HTML; the exact failure text "I couldn't match"
   (callAI/__qaOnline detect it by regex); window.__qaStrat {detect,fallback,corrected}; window.__qaSuggest; window.__qaPre;
   window.__qaOnline(q,el); callAI(q,el,top,hideOld,sj,cx) and the retrieve()/PREFIX context format; JSON ids qaKB and qaOpinions;
   the .qa-card / .qa-chip / data-doc markup. This block only ADDS: window.__qaMulti (multi-part questions; run() skips
   __qaOnline for those) and a wrapper around __qaPre (synonyms + typo fixes, used only when the engine then matches).
   To make the LLM answer first later, flip it in run()/__qaOnlineBase, not in these helpers.
   Boss comparisons: bossDiff() in the Ask script (modes diff / dir / common) renders a .qa-card[data-cmp]; __qaOnlineBase skips the
   smart-answer button for it, and cmpPrev() reads it back so a bare "only armor" follow-up redoes the comparison. ===== */
/* ===== TERMINOLOGY NOTE (invisible on the page) =====
   - Dungeon status (not "boss traits"): the icon rows under names in the tables. Code names: DUNGEON_STATUS, dungeonStatus(), .dungeon-status*.
   - Table rows: Dungeons = dungeon names; Disasters and Conquests = boss names; Special = a mode/trial (Trial) and a location (Crystal Beach).
   - Equipment "stats" (shown with ?? values) have their own numeric values: they vary with item level, rise as it levels up, and are random each
     time you get or reroll the same equipment. Extra stats that roll on rerolls are "random stats" (randomStats), never "hidden stats". ===== */
(function(){'use strict';
var BAD=/I couldn.t match/,D=null,PRO=null,KN=null;/* KN (typo vocabulary) is built lazily, only when a question did not match */
function ans(q){try{return window.__qaAnswer?window.__qaAnswer(q):'';}catch(e){return 'I couldn\'t match';}}
function E(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function init(){
  if(D)return;D={};PRO={};
  ('evasion:dodge dodges dodging dodgy evade evades evading;shield:tank tanks tanky tanking bulky sturdy durable;healing power:healer healers regen regenerate regeneration recover restore restoring;critical:crit crits;haste:speed speedy faster fast quicker;gold rush:gold money coins currency;rune slot:sockets socket;summon:pet pets familiar familiars companion companions;burn:fire fiery ignite ignites scorch;frostbite:ice icy frost freeze freezing chill;electrified:lightning shock thunder electric;poison:venom venomous toxic;curse:hex hexes;explosion:blast explode explosive;max hp:hitpoints hitpoint vitality;parry:block blocks blocking deflect;accuracy:aim precision').split(';').forEach(function(g){var p=g.split(':');p[1].split(' ').forEach(function(w){D[w]=p[0];});});
  [].forEach.call(document.querySelectorAll('.idx-link,[id^=tbody] td:first-child'),function(e){(e.getAttribute('data-q')||e.textContent).toLowerCase().replace(/[^a-z ]/g,' ').split(' ').forEach(function(w){if(w)PRO[w]=1;});});
}
function initKN(){KN={};((document.getElementById('index')||document.body).textContent.toLowerCase().match(/[a-z]{4,}/g)||[]).forEach(function(w){KN[w]=(KN[w]||0)+1;});try{if(D)Object.keys(D).forEach(function(w){if(w.length>=4&&!KN[w])KN[w]=1;});}catch(e){}
  'health defense defence resistance survival intelligence strength accessory accessories critical evasion healing shield weapons armour summons poison damage cooldown'.split(' ').forEach(function(w){if(!KN[w])KN[w]=1;});}
function dist(a,b){var p=[],i,j,c;for(j=0;j<=b.length;j++)p[j]=j;for(i=1;i<=a.length;i++){var d=p[0];p[0]=i;for(j=1;j<=b.length;j++){c=p[j];p[j]=Math.min(p[j]+1,p[j-1]+1,d+(a.charAt(i-1)===b.charAt(j-1)?0:1));d=c;}}return p[b.length];}
function syn(q){return q.replace(/[A-Za-z]+/g,function(m){var k=m.toLowerCase();return(D[k]&&!PRO[k])?D[k]:m;});}
function typo(q){if(!KN)initKN();return q.replace(/[A-Za-z]{5,}/g,function(m){
  var k=m.toLowerCase();if(KN[k]||D[k]||PRO[k]||(window.__qaKnown&&window.__qaKnown(k)))return m;
  var lim=k.length<=7?1:2,best=null,bd=9,w,d;
  for(w in KN){if(w.charAt(0)!==k.charAt(0)||Math.abs(w.length-k.length)>lim||w.length<5)continue;d=dist(k,w);
    if(d<=lim&&(d<bd||(d===bd&&KN[w]>KN[best]))){bd=d;best=w;}}
  return best||m;});}
/* a typo fix is only trusted when the answer it produces actually shows the word it changed the question to */
function backs(h,b,t){
  var A=b.match(/[A-Za-z]+/g)||[],B=t.match(/[A-Za-z]+/g)||[];
  if(A.length!==B.length)return false;
  var txt=String(h).replace(/<[^>]*>/g,' ').toLowerCase(),n=0;
  for(var i=0;i<A.length;i++)if(A[i].toLowerCase()!==B[i].toLowerCase()){n++;if(txt.indexOf(B[i].toLowerCase())<0)return false;}
  return n>0;
}
function understood(q){try{return !!(window.__qaUnderstood&&window.__qaUnderstood(q));}catch(e){return false;}}
function sem(q){
  init();var u=syn(q);
  if(u!==q&&!BAD.test(ans(u)))return u;
  if(BAD.test(ans(q))&&!understood(q)){var b=u!==q?u:q,t=typo(b);if(t!==b){var h=ans(t);if(!BAD.test(h)&&backs(h,b,t))return t;}}
  /* a typo fix is also trusted when the corrected question is one the page understands (e.g. helth -> health, answered as HP) */
  try{if(BAD.test(ans(q))&&!understood(q)){var b2=u!==q?u:q,t2=typo(b2);if(t2!==b2&&!BAD.test(ans(t2)||'')&&understood(t2))return t2;}}catch(e){}
  return q;}
window.QA.pre.add('synonyms_typos',20,function(P0){return function(raw){var q=P0?P0(raw):raw;try{return sem(q);}catch(e){return q;}};});
document.addEventListener('DOMContentLoaded',function(){try{if(window.__qaShowIdeas)window.__qaShowIdeas();}catch(e){}});
window.__qaMulti=function(q,a){
  try{init();
    var ps=q.split(/\s*(?:\?+\s+|;\s*|\band also\b|\bthen\b|,?\s*\band\b\s+(?=(?:what|where|which|how|who|does|do|is|are|can|list|show|compare|tell)\b))/i).filter(function(s){return s&&s.replace(/[?\s]/g,'').length>2;});
    if(ps.length<2||ps.length>3)return null;
    var h='',n=0,prev='';
    for(var i=0;i<ps.length;i++){var p=ps[i].trim();
      if(i&&prev){var t=document.createElement('div');t.innerHTML=prev;var c=t.querySelector('.qa-chip'),nm=c&&(c.getAttribute('data-item')||c.getAttribute('data-q'));
        if(nm)p=p.replace(/\b(it|its|that one)\b/i,nm);}
      p=sem(p);var r=window.__qaOffline?window.__qaOffline(p):a(p);if(BAD.test(r))continue;prev=r;n++;
      h+='<div class="qa-note" data-multi="1">'+(ps.length>1?'Part '+(i+1)+': ':'')+'<b>'+E(p)+'</b></div>'+r;}
    return n>=2?h:null;
  }catch(e){return null;}};
})();
