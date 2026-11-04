
/* ===== Q&A upgrade v7: autocomplete, follow-ups, codex knowledge, Ask-AI ===== */
(function(){
'use strict';
/* Online AI is opt-in. Offline answers never need this endpoint. */
var QA_PROXY_URL='';
var QA_PROXY='';
var inp=document.getElementById('qaInput'),out=document.getElementById('qaOut');
if(!inp||!out)return;
var onlineToggle=document.getElementById('qaOnlineToggle'),modeStatus=document.getElementById('qaModeStatus');
function setOnlineAI(enabled){
  QA_PROXY=enabled?QA_PROXY_URL:'';
  if(onlineToggle){onlineToggle.setAttribute('aria-pressed',enabled?'true':'false');onlineToggle.textContent='Online AI: '+(enabled?'On':'Off');onlineToggle.title=enabled?'Online AI is enabled. Questions and selected guide context may be sent to a remote service. Tap to turn it off.':'Online AI is off. Tap to explicitly allow remote AI requests.';}
  if(modeStatus)modeStatus.innerHTML=enabled?'<span class="net-on"><strong>Online AI enabled</strong></span> · Some questions and selected guide context may be sent to a remote service.':'<strong>Offline mode</strong> · Answers are generated on this device. Online AI is off.';
  if(!enabled&&cur){try{cur.abort();}catch(e){}}
}
/* Always start offline for this version; the user must switch it on in this session. */
setOnlineAI(false);
if(onlineToggle)onlineToggle.addEventListener('click',function(){setOnlineAI(!QA_PROXY);});
var esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
var nz=function(s){return String(s).toLowerCase().replace(/[\u2018\u2019']/g,'').replace(/[^a-z0-9]+/g,' ').trim();};
var plain=function(s){return String(s||'').replace(/\{\{([^}]*)\}\}/g,function(m,i){var p=i.split('|');return p[1]||p[0];}).replace(/\[\[(.+?)\]\]/g,'$1').replace(/%%(.+?)%%/g,'$1').replace(/~~(.+?)~~/g,'$1').replace(/@@(.+?)@@/g,'$1').replace(/\^\^(.+?)\^\^/g,'$1').replace(/\$\$/g,'').replace(/##(.+?)##/g,'$1');};
var g=function(n){try{return (0,eval)('typeof '+n+'!=="undefined"?'+n+':null');}catch(e){return null;}};
var KB=[];try{KB=JSON.parse(document.getElementById('qaKB').textContent);}catch(e){}

/* ---- names for autocomplete ---- */
var NAMES=[],seen={};
function add(n,k){var z=nz(n);if(!z||seen[z+k])return;seen[z+k]=1;NAMES.push({n:n,z:z,k:k});}
['DATA','CONQUEST','CONQUEST2','SPECIAL'].forEach(function(v){var a=g(v);if(a)a.forEach(function(r){add(r[0],'boss');});});
var ID=g('ITEM_DETAILS'),SD=g('SKILL_DETAILS'),TM=g('TERMS');
if(ID)Object.keys(ID).forEach(function(k){add(k.replace(/::(weapon|armor|accessory|skill)$/,''),'item');});
if(SD)Object.keys(SD).forEach(function(k){add(k,'item');});
if(TM)Object.keys(TM).forEach(function(k){add(k,'term');});
KB.forEach(function(e){if(e[0]==='Race'||e[0]==='Job'||e[0]==='Origin')add(e[1],'kb');});

var box=document.createElement('div');box.className='qa-ex';box.id='qaSug';
var qaRow=inp.closest('.qa-row');if(qaRow)qaRow.insertAdjacentElement('afterend',box);else if(inp.parentNode)inp.parentNode.appendChild(box);
function sugg(){
  var v=nz(inp.value);box.innerHTML='';
  if(v.length<2)return;
  var toks=v.split(' '),tail=toks.slice(-3).join(' '),lt=toks[toks.length-1],sc=[],seenZ={};
  for(var i=0;i<NAMES.length;i++){
    var z=NAMES[i].z,r=99;
    if(z===v||z===tail)r=0;
    else if(z.indexOf(tail)===0)r=1;
    else if((' '+z).indexOf(' '+tail)>=0)r=2;
    else if(lt.length>=3&&z.indexOf(lt)===0)r=3;
    else if(lt.length>=3&&(' '+z).indexOf(' '+lt)>=0)r=4;
    else if(lt.length>=3&&z.indexOf(lt)>=0)r=5;
    if(r<99)sc.push({r:r,l:z.length,i:i,n:NAMES[i]});
  }
  sc.sort(function(a,b){return a.r-b.r||a.l-b.l||a.i-b.i;});
  var res=[];sc.forEach(function(x){if(res.length<5&&!seenZ[x.n.z]){seenZ[x.n.z]=1;res.push(x.n);}});
  box.innerHTML=res.map(function(r){
    var q=r.k==='boss'?'What does '+r.n+' drop?':r.k==='term'?'What is '+r.n+'?':r.k==='kb'?'Tell me about '+r.n:'Where does '+r.n+' drop?';
    return '<button type="button" class="qa-exbtn" data-ex="'+esc(q)+'">'+esc(r.n)+'</button>';}).join('');
}
inp.addEventListener('input',sugg);
box.setAttribute('role','group');box.setAttribute('aria-label','Suggestions');
box.addEventListener('click',function(e){
  var b=e.target.closest('.qa-exbtn');if(!b)return;
  inp.value=b.dataset.ex;box.innerHTML='';
  var go=document.getElementById('qaGo');if(go)go.click();
});
inp.addEventListener('input',function(){if(!inp.value.trim())window.QA.state.item='';});
inp.addEventListener('keydown',function(e){
  if(e.key==='Escape'){box.innerHTML='';return;}
  if(e.key==='ArrowDown'){var f=box.querySelector('.qa-exbtn');if(f){e.preventDefault();f.focus();}}
});
box.addEventListener('keydown',function(e){
  var bs=[].slice.call(box.querySelectorAll('.qa-exbtn')),i=bs.indexOf(document.activeElement);
  if(i<0)return;
  if(e.key==='ArrowDown'){e.preventDefault();bs[Math.min(i+1,bs.length-1)].focus();}
  else if(e.key==='ArrowUp'){e.preventDefault();if(i===0)inp.focus();else bs[i-1].focus();}
  else if(e.key==='Escape'){e.preventDefault();box.innerHTML='';inp.focus();}
});

/* ---- follow-up memory ---- */
var BOSSZ={};NAMES.forEach(function(n){if(n.k==='boss')BOSSZ[n.z]=1;});
window.QA.pre.add('follow_memory',10,function(){return function(q){
  var rf=window.QA.ref(),R=rf?rf.name:'';
  if(!R||!/\b(it|its|that|this one|this item|that one|this boss|that boss)\b/i.test(q))return q;
  if(/\b(is|was|are|be)\s+it\s+(possible|allowed|necessary|required|true|legal|needed)\b|\bdoes(n'?t)?\s+it\s+matter\b/i.test(q))return q;
  /* leave the question alone if something in it is already recognised */
  var a='';try{a=window.__qaAnswer?window.__qaAnswer(q):'';}catch(e){}
  if(!/I couldn.t match/.test(a))return q;
  /* a capitalised word after the first looks like a name or title (e.g. "Wait for it"), not a follow-up */
  if(/\s[A-Z][a-z]/.test(' '+q.replace(/^\S+/,'')))return q;
  if(/\b(this|that) boss\b/i.test(q)&&!BOSSZ[nz(R)])return q;
  return q.replace(/\b(its)\b/i,R+"'s").replace(/\b(it|that one|this one|this item|that item|this boss|that boss)\b/i,R);
};});

/* ---- knowledge for the AI: guide tables + codex ---- */
var ents=[];
function build(){
  if(ents.length)return;
  KB.forEach(function(e){ents.push({type:e[0],name:e[1],z:nz(e[1]),t:e[0]+' '+e[1]+': '+e[2],lo:(e[1]+' '+e[2]).toLowerCase()});});
  if(ID)Object.keys(ID).forEach(function(k){var d=ID[k],name=k.replace(/::(weapon|armor|accessory|skill)$/,'');
    var ab=(d.abilities||(d.ability?[d.ability]:[])).map(function(a){return a.name+': '+plain(a.description);});
    var st=(d.stats||[]).map(function(s){return s.name+' '+(s.masked||s.value||'');});
    var t='Equipment '+name+' ('+(d.stars||'?')+'*) '+ab.join(' | ')+' '+st.join(', ');
    ents.push({type:'Equipment',name:name,z:nz(name),t:t,lo:t.toLowerCase()});});
  if(SD)Object.keys(SD).forEach(function(k){var t='Skill '+k+': '+plain(SD[k].description);ents.push({type:'Skill',name:k,z:nz(k),t:t,lo:t.toLowerCase()});});
  if(TM)Object.keys(TM).forEach(function(k){var t='Term '+k+': '+plain(TM[k].description);ents.push({type:'Term',name:k,z:nz(k),t:t,lo:t.toLowerCase()});});
  [['Dungeon','DATA'],['Disaster','CONQUEST'],['Conquest','CONQUEST2'],['Special','SPECIAL']].forEach(function(p){
    var a=g(p[1]);if(a)a.forEach(function(r){var t='Boss '+r[0]+' ('+p[0]+') drops 6* weapons: '+r[1]+'; 7* weapons: '+r[2]+'; 6* armor: '+r[3]+'; 7* armor: '+r[4]+'; 6* accessories: '+r[5]+'; 7* accessories: '+r[6]+'; 6* skills: '+r[7]+'; 7* skills: '+r[8];
      ents.push({type:'Boss',name:r[0],z:nz(r[0]),t:t,lo:t.toLowerCase()});});});
}
var STOPW={the:1,what:1,whats:1,does:1,how:1,which:1,where:1,drop:1,drops:1,with:1,from:1,this:1,that:1,have:1,about:1,tell:1,give:1,gives:1,best:1,good:1,should:1,would:1,could:1,use:1,pick:1,game:1,for:1,and:1,are:1,you:1,can:1,get:1,make:1,build:1,great:1,better:1,most:1,any:1,has:1,had:1,having:1,who:1,all:1,every:1};
var SYN={evade:'evasion',dodge:'evasion',dodging:'evasion',heal:'healing',heals:'healing',crit:'critical',crits:'critical',tank:'shield',tanky:'shield',tanking:'shield',damage:'enhancement',dmg:'enhancement',farm:'soulstone',farming:'soulstone',loot:'rarity',survive:'shield',survivability:'shield',magic:'magical',mage:'magical',caster:'magical',physical:'physical',melee:'strength',archer:'dexterity',poison:'poison',burn:'burn'};
var TYPEW=[[/\brac(e|es)\b/,'Race'],[/\b(job|jobs|class|classes)\b/,'Job'],[/\borigins?\b/,'Origin'],[/\b(skill|skills|spell|spells)\b/,'Skill'],[/\bcontracts?\b/,'Contract'],[/\b(weapon|weapons|armor|armour|accessor(y|ies)|gear|equipment)\b/,'Equipment']];
var PREFIX='You are helping with Buriedbornes 2. The CONTEXT lists races, jobs, origins, skills, contracts, equipment and boss drops from a community guide. For questions like best/recommend, compare only the stats and abilities listed, write in a neutral factual register with no hedging or opinion phrases, and do not present an opinion as a game fact. Contract entries read: rarity | contents | category | where to obtain, and you should always say where to obtain. Use only the CONTEXT for facts.\n';
function retrieve(q){
  build();
  var mq=window.__qaMask?window.__qaMask(q):q;
  var ql=mq.toLowerCase(),want=null;
  TYPEW.forEach(function(p){if(!want&&p[0].test(ql))want=p[1];});
  var qt=nz(mq).split(' ').map(function(t){return SYN[t]||t;}).filter(function(t){return t.length>=3&&!STOPW[t];});
  var scored=ents.map(function(e){
    var s=0,kbT=(e.type==='Race'||e.type==='Job'||e.type==='Origin');if(nz(kbT?mq:q).indexOf(e.z)>=0&&e.z.length>=3)s+=12;
    qt.forEach(function(t){if((' '+e.z+' ').indexOf(' '+t+' ')>=0)s+=4;else if(e.lo.indexOf(t)>=0)s+=1;});
    if(want&&e.type===want&&s>0)s+=3;
    return {e:e,s:s};
  }).filter(function(x){return x.s>0;});
  if(want){var f=scored.filter(function(x){return x.e.type===want;});if(f.length)scored=f;}
  scored.sort(function(a,b){return b.s-a.s;});
  var txt='',n=0;
  for(var i=0;i<scored.length&&n<10;i++){
    var t=scored[i].e.t.replace(/\+?\?\?%?/g,'').replace(/\s{2,}/g,' ');if(t.length>520)t=t.slice(0,520)+'...';
    if(txt.length+t.length>4700)break;
    txt+=t+'\n';n++;
  }
  var eqN=ents.filter(function(e){return e.type==='Equipment'&&e.z.length>=3&&nz(q).indexOf(e.z)>=0;}).map(function(e){return e.name;}),cmpG='';
  if(eqN.length>=2&&/\b(better|best|stronger|versus|vs|compare|comparison|or)\b/i.test(q))cmpG='The question compares equipment ('+eqN.slice(0,3).join(', ')+'). The guide does not rank equipment. Describe what each one\'s listed abilities and stats do and where each drops, say plainly when a value is not fixed (shown as ??: it rises with item level and is random on each reroll) or not listed, and only call one better if its listed effects clearly include or exceed the other\'s, saying why. Do not use race, job or origin entries for this question.\n';
  return PREFIX+cmpG+txt+'Rule: 6* and 7* equipment and skills do not appear in rerolls unless you reach Savage mode in your dungeon run.';
}

/* ---- online call ---- */
var cur=null,NOAI=false;
function callAI(q,el,top,hideOld,sj,cx){
  if(NOAI)return;
  if(!navigator.onLine){el.insertAdjacentHTML('beforeend','<div class="qa-card"><div class="qa-note">You\'re offline, so the smart answer is unavailable.</div></div>');return;}
  var slot=document.createElement('div');slot.className='qa-card';
  slot.innerHTML='<div class="qa-title">Smart answer<span class="qa-sub">online</span></div><div class="qa-note">Thinking\u2026</div>';
  el.appendChild(slot);
  if(cur)cur.abort();
  var ctl=new AbortController(),timedOut=false,to=setTimeout(function(){timedOut=true;ctl.abort();},25000);cur=ctl;
  fetch(QA_PROXY,{method:'POST',headers:{'Content-Type':'application/json'},signal:ctl.signal,
    body:JSON.stringify({question:q.slice(0,800),context:(cx||(sj?subjCtx(sj,q):retrieve(q))).slice(0,5900)})})
  .then(function(r){if(!r.ok)throw new Error(r.status);return r.json();})
  .then(function(d){
    var a=esc(d.answer||'').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
    if(hideOld){var cs=el.querySelectorAll('.qa-card');for(var i=0;i<cs.length;i++){if(cs[i]!==slot&&/I couldn.t match/.test(cs[i].textContent))cs[i].style.display='none';}}
    slot.innerHTML='<div class="qa-title">Smart answer<span class="qa-sub">online</span></div><div>'+a+'</div><div class="qa-note">AI-generated from this guide\'s data. Double-check important details.</div>';})
  .catch(function(e){
    if(ctl!==cur||(e&&e.name==='AbortError'&&!timedOut))return; /* replaced by a newer question */
    var m=String(e&&e.message||e),why=timedOut?'It took too long to answer.':/^429$/.test(m)?'The service is busy right now.':/^(5\d\d)$/.test(m)?'The service had a problem.':'The connection failed.';
    slot.innerHTML='<div class="qa-note">Couldn\'t get the smart answer. '+why+' The offline answers still work.</div>';
    var rb=document.createElement('button');rb.type='button';rb.textContent='Try again';
    rb.setAttribute('style','margin:8px 0 0;padding:8px 14px;border-radius:999px;border:1px solid var(--accent);background:transparent;color:var(--accent);font:inherit;cursor:pointer');
    rb.addEventListener('click',function(ev){ev.stopPropagation();slot.remove();callAI(q,el,top,hideOld,sj,cx);});
    slot.appendChild(rb);})
  .then(function(){clearTimeout(to);if(cur===ctl)cur=null;});
}
/* ---- offline codex answers (races, jobs, origins, contracts) ---- */
function fieldsOf(t){var o={},parts=t.split(/; (?=[A-Z][A-Za-z ]*: )/);parts.forEach(function(p){var i=p.indexOf(': ');if(i>0)o[p.slice(0,i)]=p.slice(i+2);else o.Stats=p;});return o;}
var UNI={};(function(){var c={};KB.forEach(function(e){if(e[0]==='Contract'){var l=e[2].split(' | ')[3].trim();c[l]=(c[l]||0)+1;}});Object.keys(c).forEach(function(l){if(c[l]>=5)UNI[l]=1;});})();
function cloc(e){return (e[2].split(' | ')[3]||'').trim();}
function cf(e){
  if(e[0]!=='Contract')return fieldsOf(e[2]);
  var p=e[2].split(' | '),l=cloc(e);
  return {'Rarity':p[0],'Where to obtain':l+(UNI[l]?' (Union)':''),'Category':p[2],'Contents':p[1]};
}
function contractBrowse(list){
  var g={},o=[],dg=[];
  list.forEach(function(e){var l=cloc(e);if(UNI[l]){if(!g[l]){g[l]=[];o.push(l);}g[l].push(e);}else dg.push(e);});
  var btn=function(e,t){return '<button type="button" class="qa-exbtn" data-ex="'+esc('Tell me about the '+e[1]+' contract')+'">'+esc(t||e[1])+'</button>';};
  var h='<div class="qa-card"><div class="qa-title">Contracts<span class="qa-sub">'+list.length+' \u00b7 by where to obtain \u00b7 tap one</span></div>';
  o.forEach(function(l){h+='<div class="qa-line"><span class="qa-lab">'+esc(l)+' (Union)</span></div><div class="qa-ex">'+g[l].map(function(e){return btn(e);}).join('')+'</div>';});
  if(dg.length)h+='<div class="qa-line"><span class="qa-lab">Other locations</span></div><div class="qa-ex">'+dg.map(function(e){var l=cloc(e);return btn(e,e[1]+' \u00b7 '+(l.length>28?l.slice(0,28)+'\u2026':l));}).join('')+'</div>';
  return h+'</div>';
}
function cxCard(e){
  var f=cf(e),h='<div class="qa-title">'+esc(e[1])+'<span class="qa-sub">'+esc(e[0].toLowerCase())+'</span></div>';
  Object.keys(f).forEach(function(k){h+='<div class="qa-line"><span class="qa-lab">'+esc(k)+'</span> '+esc(f[k])+'</div>';});
  return '<div class="qa-card">'+h+'</div>';
}
var CXSTAT={strength:'STR',str:'STR',dexterity:'DEX',dex:'DEX',intelligence:'INT',int:'INT',piety:'PIE',pie:'PIE',hp:'HP',health:'HP'};
function wm(t,k){return new RegExp('\\b'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i').test(t);}
function cxRank(type,q){
  var plural={Race:'Races',Job:'Jobs',Origin:'Origins',Contract:'Contracts'}[type];
  var kws=nz(q).split(' ').map(function(t){return SYN[t]||t;}).filter(function(t){return t.length>=3&&!STOPW[t]&&!/^(rac|races?|jobs?|class(es)?|origins?|contracts?|rank|list|show|top|please|tell)$/.test(t);});
  var list=KB.filter(function(e){return e[0]===type;});
  if(!kws.length&&type==='Contract')return contractBrowse(list);
  if(!kws.length){
    return '<div class="qa-card"><div class="qa-title">All '+plural.toLowerCase()+'<span class="qa-sub">'+list.length+' · tap one</span></div><div class="qa-ex">'+list.map(function(e){return '<button type="button" class="qa-exbtn" data-ex="'+esc('Tell me about '+e[1])+'">'+esc(e[1])+'</button>';}).join('')+'</div></div>';
  }
  var sc=list.map(function(e){
    var f=cf(e),s=0,lo=e[2].toLowerCase(),hit=[];
    kws.forEach(function(k){
      var strong=0;Object.keys(f).forEach(function(n){if(n!=='Stats'&&wm(f[n],k)){strong=1;if(hit.indexOf(n+': '+f[n])<0)hit.push(n+': '+f[n]);}});
      s+=strong*3;
      var sk=CXSTAT[k];if(sk){var m=(f.Stats||'').match(new RegExp(sk+' (\\d+)'));if(m)s+=parseInt(m[1],10)*0.8;}
    });
    return {e:e,f:f,s:s,hit:hit};
  }).filter(function(x){return x.s>0;}).sort(function(a,b){return b.s-a.s;}).slice(0,5);
  if(!sc.length)return '<div class="qa-card"><div>No '+plural.toLowerCase()+' in the codex mention "'+esc(kws.join(' '))+'".</div></div>';
  var h='<div class="qa-card"><div class="qa-title">'+plural+' for: '+esc(kws.join(', '))+'<span class="qa-sub">top '+sc.length+' · codex</span></div>';
  sc.forEach(function(x,i){
    h+='<div class="qa-slot"><b>'+(i+1)+'. <span class="qa-chip" style="cursor:default">'+esc(x.e[1])+'</span></b><div class="qa-line">'+esc(x.f.Stats||(x.f.Rarity+' \u00b7 '+x.f.Category))+'</div>'+(x.f['Where to obtain']?'<div class="qa-line"><span class="qa-lab">Where to obtain</span> '+esc(x.f['Where to obtain'])+'</div>':'');
    x.hit.filter(function(t){return t.indexOf('Where to obtain')!==0;}).slice(0,2).forEach(function(t){h+='<div class="qa-line">'+esc(t.length>170?t.slice(0,170)+'\u2026':t)+'</div>';});
    h+='</div>';
  });
  return h+'<div class="qa-note">Ranked by matches in abilities and stats. Tap a name in the list to see its full entry by asking "Tell me about \u2026".</div></div>';
}
function cxCompareCard(list){
  var mix=!list.every(function(e){return e[0]===list[0][0];}),type=list[0][0],pl=({Race:'races',Job:'jobs',Origin:'origins'})[type]||type.toLowerCase()+'s',sub=pl;
  if(mix){var ku=[];list.forEach(function(e){if(ku.indexOf(e[0])<0)ku.push(e[0]);});var pu=ku.map(function(k){return ({Race:'races',Job:'jobs',Origin:'origins'})[k]||k.toLowerCase()+'s';});pl=pu.length>2?pu.slice(0,-1).join(', ')+' and '+pu[pu.length-1]:pu.join(' and ');sub=ku.map(function(k){return k.toLowerCase();}).join(' vs ');}
  var fs=list.map(cf),names=list.map(function(e){return e[1];});
  var ops=list.map(function(e){return (OP.items&&OP.items[e[0]]&&OP.items[e[0]][e[1]])||null;});
  var pref=['Stats','HP Stacks','Shield','Other Stats','Racial Ability','Job Ability','Origin Ability','Other Abilities','Skills','Where to Obtain'],keys=[];
  fs.forEach(function(f){Object.keys(f).forEach(function(k){if(keys.indexOf(k)<0)keys.push(k);});});
  keys.sort(function(a,b){var ia=pref.indexOf(a),ib=pref.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib);});
  var rated=[];ops.forEach(function(o,i){if(o)rated.push('<b>'+esc(names[i])+'</b>: '+esc((OPTIER[o.tier]||'').toLowerCase()));});
  var h='<div class="qa-card" data-vs="op"><div class="qa-title">'+names.map(esc).join(' vs ')+'<span class="qa-sub">'+sub+'</span></div>'+
    '<div class="qa-lead">The guide does not rank '+pl+'.'+(rated.length?' Community codex: '+rated.join(' \u00B7 ')+'.':'')+'</div>';
  var cols='84px '+names.map(function(){return 'minmax(0,1fr)';}).join(' ');
  var g='<div class="qa-grid qa-vs" style="grid-template-columns:'+cols+'"><div class="qa-gh"></div>'+names.map(function(n,i){return '<div class="qa-gh">'+esc(n)+(mix?' ('+list[i][0].toLowerCase()+')':'')+'</div>';}).join('');
  if(mix&&window.__qaMixRows)window.__qaMixRows(fs).forEach(function(r){g+='<div class="qa-lab">'+esc(r.lab)+'</div>'+r.vals.map(function(v){return '<div>'+esc(v||'\u2013')+'</div>';}).join('');});
  else keys.forEach(function(k){g+='<div class="qa-lab">'+esc(k)+'</div>'+fs.map(function(f){return '<div>'+esc(f[k]||'\u2013')+'</div>';}).join('');});
  if(ops.some(Boolean))g+='<div class="qa-lab">Players say</div>'+ops.map(function(o){return '<div>'+(o?opBold(o.s):'\u2013')+'</div>';}).join('');
  return h+g+'</div></div>';
}
function codexAnswer(q){
  var mq=window.__qaMask?window.__qaMask(q):q,qn=' '+nz(mq)+' ',ql=mq.toLowerCase(),want=null,hits=[];
  [[/\brac(e|es)\b/,'Race'],[/\b(job|jobs|class|classes)\b/,'Job'],[/\borigins?\b/,'Origin'],[/\bcontracts?\b/,'Contract']].forEach(function(p){if(!want&&p[0].test(ql))want=p[1];});
  KB.forEach(function(e){var z=nz(e[1]);if(z.length<3||qn.indexOf(' '+z+' ')<0)return;
    if(e[0]==='Race'||e[0]==='Job'||e[0]==='Origin'||(e[0]==='Contract'&&want==='Contract'))hits.push(e);});
  if(hits.length>1)hits=hits.filter(function(s){var zs=' '+nz(s[1])+' ';return !hits.some(function(L){var zl=' '+nz(L[1])+' ';if(zl===zs||zl.length<=zs.length||zl.indexOf(zs)<0)return false;return qn.split(zs).length<=qn.split(zl).length;});});
  if(hits.length){hits.sort(function(a,b){return qn.indexOf(' '+nz(a[1])+' ')-qn.indexOf(' '+nz(b[1])+' ');});window.QA.state.item=hits[0][1];if(hits.length>=2&&hits[0][0]!=='Contract'&&(hits.every(function(e){return e[0]===hits[0][0];})||(window.__qaMixRows&&hits.every(function(e){return e[0]!=='Contract'&&hits.filter(function(x){return nz(x[1])===nz(e[1]);}).length===1;}))))return cxCompareCard(hits.slice(0,3));var h3=hits.slice(0,3);return h3.map(function(e){return opEntryCard(e)+cxCard(e);}).join('');}
  if(want){return cxRank(want,q);}
  return null;
}
/* ---- subjective questions (best / beginner / recommend): depends on the player ---- */
var SK={};KB.forEach(function(e){if(e[0]==='Skill')SK[e[1].toLowerCase()]=e[2];});
var SUBJ=/\b(best|better|recommend\w*|should i|worth it|strongest|weakest|tier|beginner|newbie|early game|early-game|start with|good for starters)\b/i;
var LEV=[['HP stacks',/hp stack/i],['Shield and invincibility',/shield|\bbarrier|\bcover\b|invincib/i],['Evasion',/evasion|evade/i],['Healing and recovery',/heal|\brecover/i],['Escaping combat',/escape|flee/i],['Ailment defence',/ailment|\bcure|resist/i]];
function subjType(q){
  if(!SUBJ.test(q))return null;
  var m=q.toLowerCase().match(/\b(rac(?:e|es)|jobs?|class(?:es)?|origins?)\b/);if(!m)return null;
  var t=/^rac/.test(m[1])?'Race':/^origin/.test(m[1])?'Origin':'Job',qn=' '+nz(window.__qaMask?window.__qaMask(q):q)+' ';
  var named=KB.some(function(e){return (e[0]==='Race'||e[0]==='Job'||e[0]==='Origin')&&nz(e[1]).length>=3&&qn.indexOf(' '+nz(e[1])+' ')>=0;});
  return named?null:t;
}
function facts(e){var f=fieldsOf(e[2]),t=(f['Racial Ability']||f['Job Ability']||f['Origin Ability']||'')+' '+(f['Other Abilities']||'');(f.Skills||'').split(',').forEach(function(k){t+=' '+(SK[k.trim().toLowerCase()]||'');});return t;}
/* ---- community opinion layer: separate data (qaOpinions), separate cards ---- */
var OP={};try{OP=JSON.parse(document.getElementById('qaOpinions').textContent);}catch(e){}
var OPI=(OP.items&&OP.items.Origin)||{};
var OPTIER={top:'Highly rated',good:'Well regarded',mid:'Mixed or situational',weak:'Poorly rated'};
var OPRANK={top:0,good:1,mid:2,weak:3};
function opBold(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');}
function opNote(){return '<div class="qa-note">'+esc(OP.note||'Player opinions from the community codex, not game rules or guide data.')+'</div>';}
function opHead(sub){return '<div class="qa-title"><span class="qa-optag">Community opinion</span><span class="qa-sub">'+esc(sub||'from the codex')+'</span></div>';}
function opBtn(n){return '<button type="button" class="qa-exbtn" data-ex="'+esc('Tell me about '+n)+'">'+esc(n)+'</button>';}
function opChips(a){return a&&a.length?'<div class="qa-ex">'+a.map(opBtn).join('')+'</div>':'';}
function opRow(n,full){var o=OPI[n];if(!o)return '';return '<div class="qa-slot">'+opBtn(n)+'<span class="qa-lab"> '+esc(OPTIER[o.tier]||'')+'</span><div class="qa-line">'+opBold(full?o.t:o.s)+'</div></div>';}
function opSubjCard(kind){
  var a=OP.subj&&OP.subj.Origin;if(!a)return '';
  var paras=a[kind]||a.general||[],h='<div class="qa-card qa-op">'+opHead();
  paras.forEach(function(p){h+='<div class="qa-line">'+opBold(p)+'</div>';});
  return h+opChips(a[kind+'_chips'])+opNote()+'</div>';
}
function opPoorCard(){
  var a=OP.subj&&OP.subj.Origin;if(!a)return '';
  var h='<div class="qa-card qa-op">'+opHead()+'<div class="qa-line">'+opBold(a.poor_lead||'')+'</div>';
  (a.poor_order||[]).forEach(function(n){h+=opRow(n);});
  if(a.poor_extra)h+='<div class="qa-line">'+opBold(a.poor_extra)+'</div>';
  return h+opNote()+'</div>';
}
function opTopics(nq){
  var pad=' '+nq+' ',hits=[];
  Object.keys(OP.topics||{}).forEach(function(k){var t=OP.topics[k];
    if((t.words||[]).some(function(w){return pad.indexOf(' '+nz(w)+' ')>=0;}))hits.push(t);});
  return hits;
}
function opTopicCard(hits){
  var names=[];hits.forEach(function(t){(t.origins||[]).forEach(function(n){if(OPI[n]&&names.indexOf(n)<0)names.push(n);});});
  names.sort(function(a,b){return OPRANK[OPI[a].tier]-OPRANK[OPI[b].tier];});
  names=names.slice(0,6);
  var lead=hits.length===1?hits[0].lead:'On '+hits.map(function(t){return t.label;}).join(' and ')+', players mention:';
  var h='<div class="qa-card qa-op">'+opHead()+'<div class="qa-line">'+esc(lead)+'</div>';
  names.forEach(function(n){h+=opRow(n);});
  return h+opNote()+'</div>';
}
function opEntryCard(e){
  var o=OP.items&&OP.items[e[0]]&&OP.items[e[0]][e[1]];if(!o)return '';
  return '<div class="qa-card qa-op">'+opHead(OPTIER[o.tier]||'')+'<div class="qa-line">'+opBold(o.t)+'</div>'+opNote()+'</div>';
}
function opNamedCard(names){
  var h='<div class="qa-card qa-op">'+opHead('player views on '+names.join(' and '));
  names.slice(0,3).forEach(function(n){h+=opRow(n,true);});
  return h+opNote()+'</div>';
}
function opNamed(q){
  var pad=' '+nz(q)+' ',out=[];
  Object.keys(OPI).forEach(function(n){if(pad.indexOf(' '+nz(n)+' ')>=0&&out.indexOf(n)<0)out.push(n);});
  var al=OP.alias||{};Object.keys(al).forEach(function(k){if(pad.indexOf(' '+nz(k)+' ')>=0&&out.indexOf(al[k])<0)out.push(al[k]);});
  return out;
}
var OP_POOR=/\b(worst|weakest|bad|terrible|awful|poor|useless|trash|avoid|skip|waste|trap|garbage|weak|underwhelming|rubbish|not worth|dont pick|dont take|dont choose|never pick|least useful|least popular)\b/;
var OP_BEG=/\b(beginners?|newbies?|noobs?|new players?|new to the game|first time|first run|first runs|starters?|start with|starting out|just started|just starting|early game|easy|easiest|simple|casual)\b/;
var OP_BEST=/\b(best|top|strongest|recommended?|recommend|recommendation|tier|tiers|rank|ranking|ranked|overpowered|op|favou?rite|ideal|optimal|consensus|popular|opinions?|community|players?|people|think|better|pick|choose|should i|go with)\b/;
var OP_OPIN=/\b(good|bad|great|fun|worth|useful|viable|recommend\w*|think|opinions?|better|best|worst|safe|safest|risky|easy|hard|difficult|pair\w*|synerg\w*|combo|work|works|working|match|fit|suit\w*|pick|choose|play|should|avoid|enjoy\w*|strong|weak)\b/;
var OP_STAT=/\b(hp|str|dex|int|pie|stats?|shield|strength|dexterity|intelligence|piety|obtain|where|union|highest|lowest)\b/;
var OP_RDJ=/\b(rac(e|es)|jobs?|class(es)?)\b/;
function opIntent(nq){
  if(OP_POOR.test(nq))return opPoorCard();
  var rdj=OP_RDJ.test(nq);
  if(!rdj&&OP_BEG.test(nq))return opSubjCard('beginner');
  var tp=opTopics(nq);
  if(tp.length&&(OP_OPIN.test(nq)||OP_BEST.test(nq)||/ for /.test(' '+nq+' ')))return opTopicCard(tp);
  if(!rdj&&OP_BEST.test(nq)&&!OP_STAT.test(nq))return opSubjCard('general');
  return '';
}
var KIND_RE={Race:/\brac(?:e|es)\b/,Job:/\b(?:jobs?|class(?:es)?)\b/,Origin:/\borigins?\b/};
var KIND_PL={Race:'races',Job:'jobs',Origin:'origins'};
var OP_STOPK=/^(which|what|whats|best|good|great|worst|bad|race|races|job|jobs|class|classes|origin|origins|think|thinks|player|players|should|pick|choose|about|that|this|with|have|does|they|than|really|there|their|from|your|into|most|more|some|very|just|like|also|better|opinion|opinions|community|codex|tier|list|recommend|recommended|early|game|play|using|when|where|will|would|could|want|need|make|build|builds|the|and|for|are|can|any|too|its|not|you|but|get|who|how|why|all|use|one|vs|worth)$/;
function opI(k){return (OP.items&&OP.items[k])||{};}
function opKindOf(nq){var best=null,bi=1e9;Object.keys(KIND_RE).forEach(function(k){var m=nq.match(KIND_RE[k]);if(m&&m.index<bi){bi=m.index;best=k;}});return best;}
function opRowK(k,n,full){var o=opI(k)[n];if(!o)return '';return '<div class="qa-slot">'+opBtn(n)+'<span class="qa-lab"> '+esc(OPTIER[o.tier]||'')+'</span><div class="qa-line">'+opBold(full?o.t:o.s)+'</div></div>';}
function opListCard(k,lead,names,sub,extra){var h='<div class="qa-card qa-op">'+opHead(sub)+'<div class="qa-line">'+esc(lead)+'</div>';names.forEach(function(n){h+=opRowK(k,n);});return h+(extra||'')+opNote()+'</div>';}
function opNamedCardK(k,names){var h='<div class="qa-card qa-op">'+opHead('player views on '+names.join(' and '));names.slice(0,3).forEach(function(n){h+=opRowK(k,n,true);});return h+opNote()+'</div>';}
function opNamedK(k,q){var pad=' '+nz(q)+' ',I=opI(k),out=[];Object.keys(I).forEach(function(n){if(nz(n).length>=3&&pad.indexOf(' '+nz(n)+' ')>=0)out.push(n);});return out;}
function opTop(k,tiers,max){var I=opI(k);return Object.keys(I).filter(function(n){return tiers.indexOf(I[n].tier)>=0;}).sort(function(a,b){return OPRANK[I[a].tier]-OPRANK[I[b].tier];}).slice(0,max||8);}
function opSearchK(k,nq){
  var I=opI(k),toks=nq.split(' ').filter(function(w){return w.length>=3&&!OP_STOPK.test(w);});
  if(!toks.length)return [];
  var sc={};
  Object.keys(I).forEach(function(n){var t=' '+nz(I[n].t)+' ',c=0;
    toks.forEach(function(w){var st=w.length>4?w.replace(/(ing|ed|es|s)$/,''):w;if(st.length>=3&&t.indexOf(' '+st)>=0)c++;});
    if(c)sc[n]=c;});
  return Object.keys(sc).sort(function(a,b){return sc[b]-sc[a]||OPRANK[I[a].tier]-OPRANK[I[b].tier];}).slice(0,6);
}
function opHasIntent(nq){return OP_OPIN.test(nq)||OP_BEST.test(nq)||OP_POOR.test(nq)||OP_BEG.test(nq);}
function opIntentK(k,nq){
  var I=opI(k),pl=KIND_PL[k];if(!Object.keys(I).length)return '';
  if(k==='Origin'){var h0=opIntent(nq);if(h0)return h0;}
  else if(opHasIntent(nq)){
    if(OP_POOR.test(nq)){var w=opTop(k,['weak'],10);if(w.length)return opListCard(k,'In the community codex, players rate these '+pl+' poorly:',w);}
    if(OP_BEG.test(nq)){var b=Object.keys(I).filter(function(n){return I[n].b;});if(b.length)return opListCard(k,'Players call these '+pl+' friendly for newer players:',b.slice(0,6));}
    if(OP_BEST.test(nq)&&!OP_STAT.test(nq)){
      var t=opTop(k,['top','good'],8),w2=opTop(k,['weak'],12);
      if(t.length)return opListCard(k,'The guide does not rank '+pl+'. In the community codex, players most often praise:',t,'',w2.length?'<div class="qa-line">Rated poorly:</div>'+opChips(w2.slice(0,6)):'');
    }
  }
  if(opHasIntent(nq)&&!OP_STAT.test(nq)){var s=opSearchK(k,nq);if(s.length)return opListCard(k,'Players mention these '+pl+':',s);}
  return '';
}
function opDropNoMatch(el){[].slice.call(el.querySelectorAll('.qa-card')).forEach(function(c){if(/^No [a-z ]+ in the codex mention/i.test(c.textContent.trim()))c.remove();});}
/* order on screen: community opinion, then guide facts, then the AI smart answer last */
function opPlace(el,html){opDropNoMatch(el);el.insertAdjacentHTML('afterbegin',html);}
function vsOpinions(vs,kk){
  var I=opI(kk),gh=[].slice.call(vs.querySelectorAll('.qa-grid>.qa-gh')).slice(1),hs=gh.map(function(x){return x.getAttribute('data-n')||x.textContent.trim();});
  var ops=hs.map(function(n,i){var kd=gh[i].getAttribute('data-kind');return (kd?opI(kd):I)[n]||null;});
  if(!ops.some(Boolean))return;
  var rated=[];ops.forEach(function(o,i){if(o)rated.push('<b>'+esc(hs[i])+'</b>: '+esc((OPTIER[o.tier]||'').toLowerCase()));});
  var lead=vs.querySelector('.qa-lead');
  if(lead)lead.insertAdjacentHTML('beforeend',' Community codex: '+rated.join(' \u00B7 ')+'.');
  var g=vs.querySelector('.qa-grid');
  if(g)g.insertAdjacentHTML('beforeend','<div class="qa-lab">Players say</div>'+ops.map(function(o){return '<div>'+(o?opBold(o.s):'\u2013')+'</div>';}).join(''));
  vs.setAttribute('data-vs','op');
}
function opDecorate(q,el){
  if(!q||!q.trim()||!OP.items)return;
  q=window.__qaMask?window.__qaMask(q):q;
  var nq=nz(q),k=opKindOf(nq),pad=' '+nq+' ',named=[];
  Object.keys(OP.items).forEach(function(kk){opNamedK(kk,q).forEach(function(n){named.push([kk,n]);});});
  var al=OP.alias||{};Object.keys(al).forEach(function(a){if(pad.indexOf(' '+nz(a)+' ')>=0&&!named.some(function(x){return x[1]===al[a];}))named.push(['Origin',al[a]]);});
  var ofK=k?named.filter(function(x){return x[0]===k;}):[];
  if(named.length&&(ofK.length||!k)){
    var kk=k||named[0][0],names=[];
    var vsEl=el.querySelector('[data-vs]');
    if(vsEl){if(vsEl.getAttribute('data-vs')==='1')vsOpinions(vsEl,kk);return;}
    named.forEach(function(x){if(x[0]===kk&&names.indexOf(x[1])<0)names.push(x[1]);});
    if(el.querySelector('.qa-op,[data-vs]')||!(names.length>1||k===kk))return;
    names.sort(function(a,b){var ia=pad.indexOf(' '+nz(a)+' '),ib=pad.indexOf(' '+nz(b)+' ');return (ia<0?1e9:ia)-(ib<0?1e9:ib);});
    var pairs='';names.slice(0,3).forEach(function(n){var f='';if(el.textContent.indexOf(n)<0){var e=KB.filter(function(x){return x[0]===kk&&x[1]===n;})[0];if(e)f=cxCard(e);}pairs+=opNamedCardK(kk,[n])+f;});
    opPlace(el,pairs);
    return;
  }
  if(!k)return;
  var html=opIntentK(k,nq);
  if(html)opPlace(el,html);
}
function foldBox(sum,inner,open){return '<details class="qa-more qa-fold"'+(open?' open':'')+'><summary>'+sum+'</summary>'+inner+'</details>';}
function depCard(t){
  var list=KB.filter(function(e){return e[0]===t;}),n=t.toLowerCase();
  var stat=function(e,k){var f=fieldsOf(e[2]),m=String(k==='HP'?(f.Stats||''):(f[k]||'')).match(k==='HP'?/\bHP (\d+)/:/\d+/);return m?+(m[1]||m[0]):0;};
  var btns=function(a){return '<div class="qa-ex">'+a.map(function(e){return '<button type="button" class="qa-exbtn" data-ex="'+esc('Tell me about '+e[1])+'">'+esc(e[1])+'</button>';}).join('')+'</div>';};
  var h='<div class="qa-card"><div class="qa-title">'+n.charAt(0).toUpperCase()+n.slice(1)+' comparison<span class="qa-sub">from the guide data</span></div><div class="qa-lead">The guide lists '+list.length+' '+n+'s and does not rank them. They differ in starting stats and survival tools.</div>';
  [['HP stacks','HP Stacks'],['Shield','Shield'],['HP','HP']].forEach(function(p){
    var v=list.map(function(e){return {e:e,v:stat(e,p[1])};}).filter(function(x){return x.v>0;});if(!v.length)return;
    var mx=Math.max.apply(null,v.map(function(x){return x.v;})),w=v.filter(function(x){return x.v===mx;}).map(function(x){return x.e;});
    h+='<div class="qa-line"><span class="qa-lab">Highest starting '+p[0]+'</span> '+mx+(w.length>6?' ('+w.length+' '+n+'s share it)':'')+'</div>'+btns(w.slice(0,6))+(t==='Origin'&&w.length<=2?w.map(function(e){return '<div class="qa-line"><span class="qa-lab">'+esc(e[1])+' ability</span> '+esc(fieldsOf(e[2])['Origin Ability']||'')+'</div>';}).join(''):'');});
  var f='<div class="qa-line">Abilities and skills that involve each survival tool:</div>';
  LEV.forEach(function(l){var m=list.filter(function(e){return l[1].test(facts(e));});if(!m.length)return;
    f+='<div class="qa-line"><span class="qa-lab">'+l[0]+'</span></div>'+btns(m.slice(0,12));});
  f+='<div class="qa-line"><span class="qa-lab">Early-game tool</span> Contracts are permanent items that are never lost when you die in a dungeon run. Unions such as the Sworn Solidarity Society offer them.</div><div class="qa-ex"><button type="button" class="qa-exbtn" data-ex="Show contracts">Browse contracts</button></div>';
  h+=foldBox('Survival tools by '+n+' ('+LEV.length+' groups)',f);
  return h+'</div>';
}
function subjCtx(t,q){
  var pre='You are helping with Buriedbornes 2. The CONTEXT lists every '+t.toLowerCase()+' from the guide (stk = HP stacks, sh = shield). The guide does not rank them, so do not name one best option. Write in a neutral, factual register: state what the data lists, with no hedging or opinion phrases such as \"it depends\", \"I think\", \"you might like\" or \"great for\", and no playstyle advice. Compare 2 to 4 options by their listed stats and by how their own ability and skills provide survival tools (HP stacks, shield, evasion, healing, escaping), and state the condition or cost each one lists. Entries starting with FULL have complete ability and skill text. They were shortlisted only because their text touches the most survival tools for this question, which does not make them the best. The other entries are short summaries. Use only facts from the CONTEXT, invent no numbers, and say when something is not listed. Keep it under 150 words. Game tip: if the player seems to struggle early, also mention that Contracts are permanent items that are never lost when you die in a dungeon run, and that Unions such as the Sworn Solidarity Society offer them. Rule: 6* and 7* equipment and skills do not appear in rerolls unless you reach Savage mode.\n';
  var list=KB.filter(function(e){return e[0]===t;});
  var ql=' '+nz(q||'').split(' ').map(function(w){return SYN[w]||w;}).join(' ')+' ';
  var focus=LEV.filter(function(l){return l[1].test(ql);});
  var sc=list.map(function(e){var tx=facts(e),n=0,fo=0;LEV.forEach(function(l){if(l[1].test(tx)){n++;if(focus.indexOf(l)>=0)fo++;}});return {e:e,s:fo*3+n};});
  var top=sc.slice().sort(function(a,b){return b.s-a.s;}).slice(0,list.length>30?2:3).filter(function(x){return x.s>0;}).map(function(x){return x.e;});
  var sk=function(k){var d=SK[k.toLowerCase()];return d?d.split(/ \/ [A-Z][^\/]{1,40} \/ /)[0].replace(/^\d\u2605\s*\[On [Uu]se\]\s*/,''):'';};
  var head=function(e,f){return e[1]+' '+(f.Stats||'').replace(/(STR|DEX|INT|PIE|HP) /g,'$1').replace(/ +/g,' ')+(f['HP Stacks']?' stk'+f['HP Stacks']:'')+(f.Shield?' sh'+f.Shield:'');};
  var abil=function(f){return f['Racial Ability']||f['Job Ability']||f['Origin Ability']||'-';};
  var txt='';
  top.forEach(function(e){var f=fieldsOf(e[2]);txt+='FULL '+head(e,f)+': '+abil(f).slice(0,220);
    if(f['Other Abilities'])txt+=' | Other abilities: '+f['Other Abilities'];
    (f.Skills||'').split(',').forEach(function(k){k=k.trim();var d=sk(k);if(d)txt+=' | Skill '+k+': '+d.slice(0,200);});
    txt+='\n';});
  var rest=list.filter(function(e){return top.indexOf(e)<0;});
  var cap=Math.max(15,Math.min(75,Math.floor((5850-pre.length-txt.length)/Math.max(rest.length,1))-48));
  rest.forEach(function(e){var f=fieldsOf(e[2]),l=head(e,f)+': '+abil(f).slice(0,cap)+'\n';if(pre.length+txt.length+l.length<5850)txt+=l;});
  return pre+txt;
}
function cxNameFirst(q){
  var m=String(q).toLowerCase().replace(/\s+/g,' ').replace(/[\s?!.,;:]+$/,'').replace(/^\s+/,'').match(/^(?:please )?(?:(?:tell me about|what is|what's|whats|explain|describe|show me) )?(?:the )?(.+?)(?: (?:race|job|class|origin))?$/);
  if(!m)return null;var z=nz(m[1]),es=KB.filter(function(e){return (e[0]==='Race'||e[0]==='Job'||e[0]==='Origin')&&nz(e[1])===z;});
  if(es.length!==1)return null;
  window.QA.state.item=es[0][1];return opEntryCard(es[0])+cxCard(es[0]);
}
var __qaOnlineBase=function(q,el){
  if(el.querySelector('[data-doc],[data-cmp]')){box.innerHTML='';return;}
  var cxn=(q&&q.trim())?cxNameFirst(q):null;
  var st=(!cxn&&q&&q.trim()&&window.__qaStrat)?window.__qaStrat.detect(q,/I couldn.t match/.test(el.textContent)):null;
  if(st){el.innerHTML=st.html;box.innerHTML='';if(QA_PROXY&&st.ctx)callAI(q,el,false,false,null,st.ctx);return;}
  var sj=(q&&q.trim())?subjType(q):null;
  if(sj){el.innerHTML=depCard(sj);box.innerHTML='';if(QA_PROXY)callAI(q,el,true,false,sj);return;}
  var cxh=cxn||((q&&q.trim())?codexAnswer(q):null);
  if(cxh){
    el.innerHTML=cxh;box.innerHTML='';
    if(QA_PROXY){var bb=document.createElement('button');bb.type='button';bb.textContent='Ask the AI to explain';
      bb.setAttribute('style','margin:8px 0 0;padding:8px 14px;border-radius:999px;border:1px solid var(--accent);background:transparent;color:var(--accent);font:inherit;cursor:pointer');
      bb.addEventListener('click',function(ev){ev.stopPropagation();bb.remove();callAI(q,el,true);});el.appendChild(bb);}
    return;
  }
  var unm=/I couldn.t match/.test(el.textContent);
  if(unm&&q&&q.trim()&&window.__qaStrat){
    var S=window.__qaStrat,fb=S.fallback(q),note='';
    if(!fb){var cz=S.corrected(q);
      if(cz){var inn=S.detect(cz.fixed,false),ah=null;
        if(!inn){ah=window.__qaAnswer?window.__qaAnswer(cz.fixed):'';if(!ah||/I couldn.t match/.test(ah))ah=null;}
        if(inn||ah){fb={html:inn?inn.html:ah,ctx:inn?inn.ctx:null};note='<div class="qa-note">Showing results for <b>'+esc(cz.name)+'</b>.</div>';}
        else{fb=S.fallback(cz.fixed);if(fb)note='<div class="qa-note">Showing results for <b>'+esc(cz.name)+'</b>.</div>';}}}
    if(!fb&&/^(what|whats|what's)\s+(is|are)\b|^(explain|define)\b/i.test(q.trim())){
      var sg0=window.__qaSuggest?window.__qaSuggest(q):[];
      if(sg0.length){var ah2=window.__qaAnswer('What is '+sg0[0].label+'?');if(!/I couldn.t match/.test(ah2)){fb={html:ah2,ctx:null};note='<div class="qa-note">Closest match: <b>'+esc(sg0[0].label)+'</b>.</div>';}}}
    if(fb){el.innerHTML=note+fb.html;box.innerHTML='';if(QA_PROXY&&fb.ctx)callAI(q,el,false,false,null,fb.ctx);return;}
  }
  var c=el.querySelector('.qa-chip');
  if(c)window.QA.state.item=c.getAttribute('data-item')||c.getAttribute('data-q')||window.QA.state.item;
  box.innerHTML='';
  if(!QA_PROXY||!q||!q.trim())return;
  var ADV=/\b(best|better|recommend|recommended|should i|worth|good for|good at|strongest|strong|weakest|tier|useful|useless|which (race|job|origin|contract)|what (race|job|origin|contract)|build|beginner|start with)\b/i;
  var CODEX=/\b(race|races|job|jobs|class|classes|origin|origins|contract|contracts)\b/i;
  if(/I couldn.t match/.test(el.textContent)){callAI(q,el,true,true);return;}
  if(ADV.test(q)||CODEX.test(q)){callAI(q,el,true);return;}
  var b=document.createElement('button');b.type='button';b.textContent='Not right? Ask the AI';
  b.setAttribute('style','margin:8px 0 0;padding:8px 14px;border-radius:999px;border:1px solid var(--accent);background:var(--accent);color:#0d0f14;font:inherit;font-weight:600;cursor:pointer');
  b.addEventListener('click',function(ev){ev.stopPropagation();b.remove();callAI(q,el,true);});
  el.appendChild(b);
};
/* the whole offline answer for one question (community opinion, then guide facts) as html, without the smart answer */
window.__qaOffline=function(q){
  var tmp=document.createElement('div');
  NOAI=true;
  try{tmp.innerHTML=window.__qaAnswer?window.__qaAnswer(q):'';__qaOnlineBase(q,tmp);try{opDecorate(q,tmp);}catch(err){}}
  finally{NOAI=false;}
  [].slice.call(tmp.children).forEach(function(c){if(c.tagName==='BUTTON')c.remove();});
  return tmp.innerHTML;
};
/* multi-part questions: the smart answer comes once, after every part */
window.__qaMultiAfter=function(q,el){box.innerHTML='';if(QA_PROXY&&el.querySelector('.qa-op'))callAI(q,el,true);};
window.__qaUnderstood=function(q){var keep=window.QA.state.item;try{return !!((window.__qaStrat&&window.__qaStrat.detect(q,true))||subjType(q)||codexAnswer(q));}catch(e){return false;}finally{window.QA.state.item=keep;}};
window.QA.online.add('online_base',10,function(){return function(q,el){__qaOnlineBase(q,el);try{opDecorate(q,el);}catch(err){}};});
})();
