
/* ===== AUTO-LEARN v1 (offline, no AI model) =====
   WHAT THIS IS
   Removes the manual "type a question, type the answer, press Teach" routine from the Learning panel.
   It sits on top of window.QALearn and uses only its public handle (teach, forget, understood, lessons).
   Every lesson still goes through the same test gate, so nothing the engine cannot answer is ever kept.

   TWO WAYS IT LEARNS
   1. Practice (button "Start practising", or "Run 15 tests"). It takes questions the engine already answers
      (window.__qaIdeas), rewords them (slang, typos, nicknames of long item names) and checks:
        - does the engine fail on the reworded question?            (if not, nothing to learn)
        - does swapping the odd word back give the SAME answer?     (stricter than the plain gate)
      Only then it calls QALearn.teach(...). Questions it can only guess at are never learned.
   2. Your own questions (toggle "Learning from your questions"). When a question fails and the next thing you ask
      (or tap in "Did you mean") works, it saves failed -> working as a lesson, after the same checks.
      A lesson made from one word or phrase must be seen twice, unless you tapped a "Did you mean" button.

   KEEPING IT CLEAN
   - Lessons it made are tagged "auto" in the Lessons list. Unused ones are dropped after 14 days (max 200 kept).
   - If you forget one of its lessons, it is remembered as banned and never learned again.
   - It pauses while you type, scroll or touch the page, while a popup is open, and while the tab is hidden.
   - Practice stops by itself after 600 tests or when it runs out of new ideas.
   - Practice only starts when you press the button (and then resumes after a reload, until you stop it).

   TO MAKE LESSONS PERMANENT: same as before. Learning panel > Export lessons > paste into qaLessonsBaked.
   Public handle for experiments: window.QAAuto (start, stop, batch, runSync, pair, stats). */
(function(){
'use strict';
var L=window.QALearn,inp=document.getElementById('qaInput'),out=document.getElementById('qaOut'),panel=document.getElementById('qaLearn');
if(!L||!inp||!out||!panel||window.QAAuto||typeof window.__qaAnswer!=='function'||typeof L.teach!=='function')return;

var KEY='bb2.qaAuto.v1',MISS=/I couldn.t match/,CLARIFY=/Tell me a bit more/,DAY=864e5,MAXAUTO=200;
var st={passive:true,active:false,stats:{practised:0,learned:0,already:0,rejected:0,fromUse:0},tried:[],mine:[],banned:[],pending:{}};
var triedSet={},memOnly=false;
var nz=function(s){return String(s==null?'':s).toLowerCase().replace(/[\u2018\u2019']/g,'').replace(/[^a-z0-9]+/g,' ').trim();};
var clean=function(s){return String(s==null?'':s).replace(/\s+/g,' ').trim();};
var plain=function(h){return String(h||'').replace(/<[^>]*>/g,' ').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();};
var rnd=function(n){return Math.floor(Math.random()*n);};
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=rnd(i+1),t=a[i];a[i]=a[j];a[j]=t;}return a;}

/* ---------- saved state (this browser only) ---------- */
function strs(a,n){return Array.isArray(a)?a.filter(function(x){return typeof x==='string'&&x.length<=300;}).slice(-n):[];}
function load(){
  try{
    var o=JSON.parse(localStorage.getItem(KEY)||'null');
    if(o&&typeof o==='object'){
      if(typeof o.passive==='boolean')st.passive=o.passive;
      if(typeof o.active==='boolean')st.active=o.active;
      if(o.stats&&typeof o.stats==='object')for(var k in st.stats)st.stats[k]=+o.stats[k]||0;
      st.tried=strs(o.tried,2500);st.banned=strs(o.banned,300);
      if(Array.isArray(o.mine))st.mine=o.mine.filter(function(m){return m&&typeof m.k==='string'&&typeof m.s==='string';}).slice(-400);
      if(o.pending&&typeof o.pending==='object')Object.keys(o.pending).slice(0,60).forEach(function(k){var p=o.pending[k];if(p&&typeof p==='object')st.pending[k]={n:+p.n||1,t:+p.t||0};});
    }
  }catch(e){memOnly=true;}
  st.tried.forEach(function(k){triedSet[k]=1;});
}
var saveT=0;
function save(){try{st.tried=st.tried.slice(-2500);localStorage.setItem(KEY,JSON.stringify(st));}catch(e){memOnly=true;}}
function saveSoon(){if(saveT)return;saveT=setTimeout(function(){saveT=0;save();},1500);}

/* ---------- what the engine really shows for a question (stable text, or null when unsure) ---------- */
function sig(q){
  var h;try{h=window.__qaAnswer(q);}catch(e){return null;}
  var t=plain(h),miss=MISS.test(t),d=null;
  if(CLARIFY.test(t))return null;
  try{d=window.__qaStrat&&window.__qaStrat.detect?window.__qaStrat.detect(q,miss):null;}catch(e){}
  if(d&&d.html)return 'S:'+plain(d.html);
  return miss?null:'A:'+t;
}
/* the engine's own rewrite step, without lessons (lessons only apply to what is typed in the box) */
function pre(q){if(q===inp.value)return q;try{return window.__qaPre?window.__qaPre(q):q;}catch(e){return q;}}
function und(q){try{return !!L.understood(q);}catch(e){return false;}}
function haveWhen(when){var z=nz(when);return L.lessons().some(function(l){return nz(l.when)===z;});}
function banned(when,say){return st.banned.indexOf(nz(when)+'>'+nz(say))>=0;}

/* same word/phrase matching the lesson store uses */
function spanRe(when){
  var key=nz(when);if(!key)return null;
  var parts=key.split(' ').map(function(t){return t.split('').join("['\u2018\u2019]?");});
  try{return new RegExp('(^|[^A-Za-z0-9])'+parts.join('[^A-Za-z0-9]+')+'(?![A-Za-z0-9])','i');}catch(e){return null;}
}
function subst(text,when,say){var re=spanRe(when);if(!re||!re.test(text))return null;return text.replace(re,function(m,p){return p+say;});}
function wordRe(w){return new RegExp('(^|[^A-Za-z0-9])'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![A-Za-z0-9])','i');}

/* ---------- 1. practice: reword questions the engine already answers ---------- */
var SLANG=[
  ['what is','whats','wats','wat is','whut is'],
  ['what does','wat does','whut does'],
  ['where does','wheres','whr does','where do'],
  ['how do i','how can i','how would i','hw do i'],
  ['which','wich'],
  ['best','top','goated','meta'],
  ['strongest','overpowered','broken','most broken'],
  ['beginner','noob','newbie','new player'],
  ['survive','stay alive','not die'],
  ['early game','early','start of the game'],
  ['skills','spells','abilities'],
  ['skill','spell','ability'],
  ['weapons','weps','guns'],
  ['armor','armour'],
  ['accessories','accs'],
  ['items','gear','stuff'],
  ['bosses','boss monsters','enemies'],
  ['damage','dmg'],
  ['uses','charges','casts'],
  ['stronger','better','more powerful'],
  ['compare','difference between','diff between'],
  ['most','highest'],
  ['have','got'],
  ['give','grant','provide'],
  ['element','type of damage'],
  ['hits','strikes'],
  ['drop','drops','dropp']
];
function slangVariants(seed,max){
  var res=[],order=shuffle(SLANG.slice());
  for(var i=0;i<order.length&&res.length<max;i++){
    var e=order[i],re=wordRe(e[0]);if(!re.test(seed))continue;
    var alts=e.slice(1).filter(function(a){return nz(a).length>=3;});if(!alts.length)continue;
    var alt=alts[rnd(alts.length)];
    res.push({v:seed.replace(re,function(m,p){return p+alt;}),when:alt,say:e[0]});
  }
  return res;
}
function typoVariant(seed){
  var ws=seed.match(/\b[a-z]{7,}\b/g)||[];if(!ws.length)return null;
  var w=ws[rnd(ws.length)],i=1+rnd(w.length-3),k=rnd(3),t;
  if(k===0)t=w.slice(0,i)+w.charAt(i+1)+w.charAt(i)+w.slice(i+2);
  else if(k===1)t=w.slice(0,i)+w.slice(i+1);
  else t=w.slice(0,i+1)+w.charAt(i)+w.slice(i+1);
  if(t===w)return null;
  return {v:seed.replace(wordRe(w),function(m,p){return p+t;}),when:t,say:w};
}
/* nicknames: one distinctive word of a long name ("Anastasia" for "Anastasia's Scepter") */
var NAMES=null,WC=null;
function initNames(){
  if(NAMES)return;NAMES=[];WC={};
  var seen={};
  [].forEach.call(document.querySelectorAll('.idx-link'),function(a){var n=clean(a.getAttribute('data-q')||a.textContent);if(n&&!seen[n]){seen[n]=1;NAMES.push(n);}});
  NAMES.forEach(function(n){var ws={};n.split(' ').forEach(function(w){var k=nz(w.replace(/['\u2019]s$/,''));if(k)ws[k]=1;});for(var k in ws)WC[k]=(WC[k]||0)+1;});
}
function nickTask(){
  initNames();if(!NAMES.length)return null;
  for(var tries=0;tries<30;tries++){
    var n=NAMES[rnd(NAMES.length)],ws=n.split(' ');if(ws.length<2)continue;
    var c=ws.map(function(w){return w.replace(/['\u2019]s$/,'');}).filter(function(w){var k=nz(w);return k.length>=5&&WC[k]===1;});
    if(!c.length)continue;
    var w=c[rnd(c.length)];
    return {base:'Where does '+n+' drop?',v:'Where does '+w+' drop?',when:w,say:n};
  }
  return null;
}

var queue=[];
function refill(){
  var seeds=[],added=0;
  try{seeds=window.__qaIdeas?(window.__qaIdeas(8)||[]):[];}catch(e){}
  seeds.forEach(function(s){
    var grp={s0:undefined};
    slangVariants(s,3).concat([typoVariant(s)]).forEach(function(x){
      if(!x||triedSet[nz(x.v)])return;
      x.base=s;x.grp=grp;queue.push(x);added++;
    });
  });
  for(var i=0;i<2;i++){var n=nickTask();if(n&&!triedSet[nz(n.v)]){n.grp={s0:undefined};queue.push(n);added++;}}
  return added;
}
function doTask(t){
  var key=nz(t.v);if(!key||triedSet[key])return;
  triedSet[key]=1;st.tried.push(key);
  if(t.v===inp.value||haveWhen(t.when)||banned(t.when,t.say))return;
  if(t.grp&&t.grp.s0===undefined)t.grp.s0=sig(t.base);
  var s0=t.grp?t.grp.s0:sig(t.base);
  if(s0===null||s0===undefined)return;                    /* the starting question has no stable answer to compare with */
  st.stats.practised++;
  if(und(pre(t.v))){st.stats.already++;return;}           /* the engine copes on its own: nothing to learn */
  var c=subst(t.v,t.when,t.say);
  if(!c||!und(c)||sig(c)!==s0){st.stats.rejected++;return;}
  var r=L.teach(t.when,t.say,t.v,'auto');
  if(r&&r.ok){st.stats.learned++;st.mine.push({k:nz(t.when),s:nz(t.say),t:Date.now()});}
  else st.stats.rejected++;
}

/* ---------- housekeeping ---------- */
function maintain(){
  try{
    var now=Date.now(),autos=L.lessons().filter(function(l){return l.src==='auto'&&!l.baked;});
    var drop=[];
    autos.forEach(function(l){if(!l.n&&l.t&&now-l.t>14*DAY)drop.push(l);});
    var rest=autos.filter(function(l){return drop.indexOf(l)<0;});
    if(rest.length>MAXAUTO){
      rest.filter(function(l){return !l.n;}).sort(function(a,b){return a.t-b.t;}).slice(0,rest.length-MAXAUTO).forEach(function(l){drop.push(l);});
    }
    drop.forEach(function(l){var z=nz(l.when);st.mine=st.mine.filter(function(m){return m.k!==z;});L.forget(l.when);});
    var have={};L.lessons().forEach(function(l){have[nz(l.when)]=1;});
    st.mine=st.mine.filter(function(m){
      if(have[m.k])return true;
      var b=m.k+'>'+m.s;if(st.banned.indexOf(b)<0)st.banned.push(b);   /* someone forgot it: never relearn it */
      return false;
    });
    st.banned=st.banned.slice(-300);
    var ks=Object.keys(st.pending);
    if(ks.length>40){ks.sort(function(a,b){return st.pending[a].t-st.pending[b].t;}).slice(0,ks.length-40).forEach(function(k){delete st.pending[k];});}
    save();
  }catch(e){}
}

/* ---------- the practice loop (gentle: one test at a time, only while you are idle) ---------- */
var running=false,manual=false,timer=null,quota=0,session=0,dry=0;
QA.track('idle_touch',window,['keydown','pointerdown','touchstart','wheel','scroll'],function(){window.QA.state.touchAt=Date.now();},{passive:true,capture:true});
function sched(ms){clearTimeout(timer);timer=setTimeout(tick,ms);}
function busy(){
  if(document.hidden||document.activeElement===inp)return true;
  if(document.body&&document.body.style.overflow==='hidden')return true;
  return !manual&&Date.now()-window.QA.state.touchAt<2500;
}
function step(){
  if(!queue.length){
    var n=refill();
    if(!n){dry++;return dry>=6?'dry':'';}
    dry=0;return '';
  }
  doTask(queue.shift());session++;
  if(session%30===0)maintain();
  saveSoon();
  return 'task';
}
function tick(){
  if(!running)return;
  if(busy()){sched(1500);return;}
  var r;try{r=step();}catch(e){r='';}
  ui();
  if(r==='dry'){stop('Nothing new to try right now.');return;}
  if(r==='task'&&quota>0&&--quota===0){stop('Batch finished.');return;}
  if(session>=600){stop('Done for now. Press Start to continue later.');return;}
  sched(r==='task'?250:120);
}
function start(n){
  if(running)return;
  running=true;manual=n>0;quota=n>0?n:0;dry=0;if(!manual)session=0;
  st.active=!manual;save();maintain();ui(manual?'Running a batch…':'Practising while you are idle…');
  sched(manual?50:600);
}
function stop(msg){
  running=false;clearTimeout(timer);manual=false;quota=0;st.active=false;save();ui(msg||'Stopped.');
}
function batch(n){if(running)stop();start(n||15);}
/* synchronous version for experiments and tests: ignores the idle checks */
function runSync(n){
  var done=0,guard=0;maintain();
  while(done<n&&guard++<n*40){var r=step();if(r==='task')done++;else if(r==='dry')break;}
  save();ui();return JSON.parse(JSON.stringify(st.stats));
}

/* ---------- 2. learn from the person's own questions ---------- */
function keyTok(w){return w.toLowerCase().replace(/[^a-z0-9\u2605\u2606]/g,'');}
function toks(s){return clean(s).replace(/[?!.,;:]+$/,'').split(' ').filter(Boolean);}
function considerPair(failedRaw,okq,explicit){
  failedRaw=clean(failedRaw);okq=clean(okq);
  if(!failedRaw||!okq||nz(failedRaw)===nz(okq))return {ok:false,msg:'same question'};
  var A=toks(failedRaw),B=toks(okq),i=0,j=0;
  while(i<A.length&&i<B.length&&keyTok(A[i])===keyTok(B[i]))i++;
  while(j<A.length-i&&j<B.length-i&&keyTok(A[A.length-1-j])===keyTok(B[B.length-1-j]))j++;
  var w=A.slice(i,A.length-j),s=B.slice(i,B.length-j),cands=[];
  if(w.length&&s.length&&w.length<=3&&s.length<=4&&i+j>=1)cands.push({when:w.join(' '),say:s.join(' '),span:true});
  var ka=A.map(keyTok).filter(Boolean),kb=B.map(keyTok).filter(Boolean);
  var common=ka.filter(function(x){return kb.indexOf(x)>=0;}).length,jac=common/((ka.length+kb.length-common)||1);
  if(explicit||jac>=0.5)cands.push({when:failedRaw.replace(/[?!.]+$/,''),say:okq.replace(/[?!.]+$/,''),span:false});
  if(!cands.length)return {ok:false,msg:'too different to be the same question'};
  var s0=sig(okq);if(s0===null)return {ok:false,msg:'no stable answer to compare with'};
  for(var c=0;c<cands.length;c++){
    var x=cands[c],k=nz(x.when)+'>'+nz(x.say);
    if(nz(x.when).length<3||nz(x.say).length<3||banned(x.when,x.say)||haveWhen(x.when))continue;
    var sub=subst(failedRaw,x.when,x.say);
    if(!sub||!und(sub)||sig(sub)!==s0)continue;
    if(x.span&&!explicit){
      var p=st.pending[k]||(st.pending[k]={n:0,t:0});p.n++;p.t=Date.now();
      if(p.n<2){save();return {ok:false,msg:'seen once, waiting for a second time'};}
      delete st.pending[k];
    }
    var r=L.teach(x.when,x.say,failedRaw,'auto');
    if(r&&r.ok){st.stats.learned++;st.stats.fromUse++;st.mine.push({k:nz(x.when),s:nz(x.say),t:Date.now()});save();return {ok:true,when:x.when,say:x.say};}
  }
  return {ok:false,msg:'no safe lesson'};
}
QA.track('chip_click',document,['click'],function(e){var t=e.target;if(t&&t.closest&&t.closest('.qa-exbtn'))window.QA.state.chipAt=Date.now();},true);
function onShown(){
  if(!st.passive)return;
  var raw=clean(inp.value),txt=out.textContent||'';
  if(!raw)return;
  if(MISS.test(txt)||CLARIFY.test(txt)){window.QA.state.fail={raw:raw,t:Date.now()};return;}
  if(out.querySelector('.ql-row,[data-multi]')){window.QA.state.fail=null;return;}
  var f=window.QA.state.fail;window.QA.state.fail=null;
  if(!f||Date.now()-f.t>150000)return;
  var okq=raw,n=out.querySelector('.qa-note');
  if(n&&/^Understood as:/.test(n.textContent)){var b=n.querySelector('b');if(b)okq=clean(b.textContent);}
  var explicit=Date.now()-window.QA.state.chipAt<3000;
  setTimeout(function(){try{considerPair(f.raw,okq,explicit);}catch(e){}ui();},500);
}
window.QA.shape.add('auto_learn',30,function(S1){return function(el){
  var r;try{r=S1?S1.apply(this,arguments):undefined;}catch(e){}
  try{if(el===out)onShown();}catch(e){}
  return r;
};});

/* ---------- panel section ---------- */
var runBtn,batchBtn,passBtn,forgetBtn,statEl,lastMsg='',forgetArm=0;
function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
function ui(msg){
  if(msg!=null)lastMsg=msg;
  if(!statEl)return;
  var s=st.stats;
  statEl.textContent='Practised '+s.practised+' \u00B7 learned '+s.learned+' \u00B7 engine already knew '+s.already+' \u00B7 rejected '+s.rejected+(s.fromUse?' \u00B7 from your questions '+s.fromUse:'')+(lastMsg?'\n'+lastMsg:'');
  runBtn.textContent=running&&!manual?'Stop practising':'Start practising';
  passBtn.textContent='Learning from your questions: '+(st.passive?'On':'Off');
  batchBtn.disabled=running&&manual;
}
function build(){
  var body=panel.querySelector('.ql-body');if(!body)return;
  var box=el('div','qa-auto');box.id='qaAuto';
  box.appendChild(el('h4',null,'Auto-learn (no typing needed)'));
  box.appendChild(el('p',null,'It practises on rewordings of questions the engine already answers (slang, typos, nicknames) and learns from your own questions: when one fails and the next one works, it keeps the pair. A lesson is only kept if the engine then gives the same answer. No AI model, nothing leaves this page.'));
  runBtn=el('button','ql-btn pri','Start practising');runBtn.type='button';runBtn.id='qaAutoRun';
  runBtn.addEventListener('click',function(){if(running&&!manual)stop();else{if(running)stop();start(0);}});
  batchBtn=el('button','ql-btn','Run 15 tests');batchBtn.type='button';batchBtn.id='qaAutoBatch';
  batchBtn.addEventListener('click',function(){batch(15);});
  passBtn=el('button','ql-btn','');passBtn.type='button';passBtn.id='qaAutoPassive';
  passBtn.addEventListener('click',function(){st.passive=!st.passive;window.QA.state.fail=null;save();ui();});
  forgetBtn=el('button','ql-btn','Forget auto lessons');forgetBtn.type='button';forgetBtn.id='qaAutoForget';
  forgetBtn.addEventListener('click',function(){
    if(Date.now()-forgetArm>3500){forgetArm=Date.now();forgetBtn.textContent='Tap again to confirm';setTimeout(function(){forgetBtn.textContent='Forget auto lessons';},3600);return;}
    forgetArm=0;var n=0;
    L.lessons().forEach(function(l){if(l.src==='auto'&&!l.baked&&L.forget(l.when))n++;});
    st.mine=[];st.pending={};save();forgetBtn.textContent='Forget auto lessons';ui('Forgot '+n+' auto lesson'+(n===1?'':'s')+'.');
  });
  statEl=el('div','ql-msg');statEl.id='qaAutoStat';statEl.setAttribute('role','status');statEl.style.whiteSpace='pre-line';
  [runBtn,batchBtn,passBtn,forgetBtn,statEl].forEach(function(x){box.appendChild(x);});
  var first=body.querySelector('h4');
  if(first)body.insertBefore(box,first);else body.appendChild(box);
  ui(memOnly?'This browser cannot save progress here.':'');
}

window.QAAuto={version:1,start:function(){start(0);},stop:stop,batch:batch,runSync:runSync,pair:considerPair,
  stats:function(){return JSON.parse(JSON.stringify(st.stats));},
  variants:function(seed){return slangVariants(seed,6).concat([typoVariant(seed)]).filter(Boolean);}};
load();build();maintain();
if(st.active)setTimeout(function(){if(!running)start(0);},5000);
})();
