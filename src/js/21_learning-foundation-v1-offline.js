
/* ===== LEARNING FOUNDATION v1 (offline) =====
   WHAT THIS IS
   A small layer on top of the Ask box that lets it learn new ways of asking WITHOUT any AI model.
   It does not answer questions itself. It only remembers "when someone says X, treat it as Y",
   where Y is something the offline engine already knows how to answer.

   THE PARTS (in the order they appear below)
   1. Lesson store   - lessons + unanswered questions saved in this browser (localStorage), plus the
                       permanent lessons in the qaLessonsBaked block above.
   2. Test gate      - understood(q): "can the offline engine really answer this?" A lesson is only
                       kept, and only used, if the answer is yes. Nothing the engine can't answer is ever learned.
   3. Hook           - wraps window.__qaPre. When the engine does NOT understand a question, it tries the
                       lessons. It never changes a question the engine already understands.
   4. Log            - wraps window.__qaShape. After each answer it notes questions the engine failed on.
                       That list is your to-do list for what to teach, or what code to write next.
   5. Panel          - the "Learning" box under the answers: teach, forget, export, import.
   6. Teacher slot   - OFF by default. A function (for example your Cloudflare worker) that suggests lessons
                       for a failed question. Its suggestions go through the same test gate.

   WHAT A LESSON LOOKS LIKE (plain data, no code):
       { "when": "how do i become unkillable", "say": "how do i not die early on" }
       { "when": "boomstick", "say": "Shotgun", "ex": "what does the boomstick do" }
   "when" is a word, phrase or whole question. "say" is what to replace it with. "ex" is an optional example
   question used to prove a word/phrase lesson works.

   TO PUT LESSONS INTO THE FILE PERMANENTLY: Learning panel > Export lessons, copy the list, paste it between
   the [ ] of the qaLessonsBaked block at the top of this snippet. They are then built in for everyone.

   TEACHER PROTOCOL (only used if you switch it on, see QALearn.useWorker below):
       request  POST {mode:"teach", question:"...", examples:["a question the engine can answer", ...]}
       response {lessons:[{when:"...", say:"...", ex:"..."}]}      (at most 5 are read)

   TO ADD REAL UNDERSTANDING LATER: write it as a normal rewrite step (like window.__qaPre) or inside the engine.
   Lessons keep working on top of it, and the "unanswered" list shows where it is still weak.
   Public handle for experiments: window.QALearn (teach, forget, understood, lessons, unanswered, ...). */
(function(){
'use strict';
var inp=document.getElementById('qaInput'),out=document.getElementById('qaOut'),go=document.getElementById('qaGo');
if(!inp||!out||!go||typeof window.__qaAnswer!=='function'||window.QALearn)return;

var KEY='bb2.qaLearn.v1',MISS=/I couldn.t match/,CLARIFY=/Tell me a bit more/,MAXL=500,MAXM=150;
var store={lessons:[],misses:[]},baked=[],memOnly=false,tried={},reCache={};
var nz=function(s){return String(s==null?'':s).toLowerCase().replace(/[\u2018\u2019']/g,'').replace(/[^a-z0-9]+/g,' ').trim();};
var clean=function(s){return String(s==null?'':s).replace(/\s+/g,' ').trim();};

/* ---------- 1. lesson store ---------- */
function okRec(l){
  if(!l||typeof l!=='object'||typeof l.when!=='string'||typeof l.say!=='string')return false;
  var w=clean(l.when),s=clean(l.say);
  if(w.length<2||w.length>200||s.length<2||s.length>200)return false;
  return l.ex==null||(typeof l.ex==='string'&&l.ex.length<=200);
}
function rec(l){
  var r={when:clean(l.when),say:clean(l.say),t:+l.t||0,n:+l.n||0,src:typeof l.src==='string'?l.src.slice(0,12):'user'};
  if(typeof l.ex==='string'&&clean(l.ex))r.ex=clean(l.ex);
  return r;
}
function load(){
  try{
    var raw=localStorage.getItem(KEY);
    if(raw){
      var o=JSON.parse(raw);
      if(o&&Array.isArray(o.lessons))store.lessons=o.lessons.filter(okRec).slice(0,MAXL).map(rec);
      if(o&&Array.isArray(o.misses))store.misses=o.misses.filter(function(m){return m&&typeof m.q==='string'&&m.q.length<=200;}).slice(0,MAXM).map(function(m){
        return {q:clean(m.q),n:+m.n||1,t:+m.t||0,gap:!!m.gap,why:typeof m.why==='string'?m.why.slice(0,200):''};});
    }
  }catch(e){memOnly=true;}
  try{
    var b=JSON.parse(document.getElementById('qaLessonsBaked').textContent);
    if(Array.isArray(b))baked=b.filter(okRec).map(function(l){var r=rec(l);r.baked=true;return r;});
  }catch(e){}
}
function save(){
  try{localStorage.setItem(KEY,JSON.stringify(store));memOnly=false;return true;}
  catch(e){memOnly=true;return false;}
}
function allLessons(){
  var seen={},res=[];
  store.lessons.concat(baked).forEach(function(l){var z=nz(l.when);if(!seen[z]){seen[z]=1;res.push(l);}});
  return res;
}

/* ---------- 2. test gate: can the offline engine really answer this? ---------- */
function ansOK(q){try{var a=window.__qaAnswer(q);return !!a&&!MISS.test(a);}catch(e){return false;}}
function understood(q){
  q=clean(q);if(!q)return false;
  if(ansOK(q))return true;
  try{return !!(window.__qaUnderstood&&window.__qaUnderstood(q));}catch(e){return false;}
}

/* ---------- matching a lesson inside a question ---------- */
function spanRe(when){
  var key=nz(when);if(!key)return null;
  if(reCache[key]!==undefined)return reCache[key];
  var parts=key.split(' ').map(function(t){return t.split('').join("['\u2018\u2019]?");});
  var re=null;
  try{re=new RegExp('(^|[^A-Za-z0-9])'+parts.join('[^A-Za-z0-9]+')+'(?![A-Za-z0-9])','i');}catch(e){}
  reCache[key]=re;return re;
}
function subst(text,l){
  var re=spanRe(l.when);if(!re||!re.test(text))return null;
  return text.replace(re,function(m,pre){return pre+l.say;});
}
function matches(text){
  var hits=allLessons().filter(function(l){var re=spanRe(l.when);return re&&re.test(text);});
  hits.sort(function(a,b){return nz(b.when).length-nz(a.when).length;});   /* the most specific lesson goes first */
  return hits;
}
function tryApply(text,hits){
  var i,c;
  for(i=0;i<hits.length;i++){
    c=subst(text,hits[i]);
    if(c&&c!==text&&understood(c))return {q:c,used:[hits[i]]};
  }
  if(hits.length>1){                                                       /* two lessons together, e.g. a slang word + a nickname */
    var used=[];c=text;
    hits.slice(0,4).forEach(function(l){var n=subst(c,l);if(n&&n!==c){c=n;used.push(l);}});
    if(used.length>1&&understood(c))return {q:c,used:used};
  }
  return null;
}

/* ---------- teaching (with the gate) ---------- */
function teach(when,say,ex,src){
  when=clean(when);say=clean(say);ex=clean(ex||'');
  if(nz(when).length<3||nz(say).length<3)return {ok:false,msg:'Both boxes need a few real words.'};
  if(when.length>200||say.length>200||ex.length>200)return {ok:false,msg:'Keep each box under 200 characters.'};
  if(nz(when)===nz(say))return {ok:false,msg:'Those are the same thing already.'};
  /* a lesson must turn something the engine does NOT understand into something it does */
  if(ex){
    if(understood(ex))return {ok:false,msg:'The engine already understands your example, so nothing needs teaching.'};
  }else if(understood(when)){
    return {ok:false,msg:'The engine already understands that on its own, so a lesson is not needed.'};
  }
  var l={when:when,say:say},proved=false;
  if(ex){var c=subst(ex,l);proved=!!(c&&c!==ex&&understood(c));}
  else proved=understood(say);
  if(!proved){
    logMiss(ex||when,true,'taught it as "'+say.slice(0,80)+'", but the engine cannot answer that yet');
    return {ok:false,gap:true,msg:ex?'That did not make your example work, so it was not learned. Logged under "needs new engine code".':'The engine cannot answer "'+say+'" yet, so it cannot learn this. Logged under "needs new engine code".'};
  }
  var r={when:when,say:say,t:Date.now(),n:0,src:src||'user'};if(ex)r.ex=ex;
  var z=nz(when);
  store.lessons=store.lessons.filter(function(x){return nz(x.when)!==z;});
  store.lessons.unshift(r);
  if(store.lessons.length>MAXL)store.lessons.length=MAXL;
  store.misses=store.misses.filter(function(m){return nz(m.q)!==z&&nz(m.q)!==nz(ex);});
  var ok=save();render();
  return {ok:true,msg:'Learned.'+(ok?'':' (This browser cannot save it, so export it before leaving.)')};
}
function forget(when){
  var z=nz(when),n=store.lessons.length;
  store.lessons=store.lessons.filter(function(x){return nz(x.when)!==z;});
  if(store.lessons.length!==n){save();render();return true;}
  return false;
}

/* ---------- 4. log of what the engine failed on ---------- */
function logMiss(q,gap,why){
  q=clean(q);var z=nz(q);if(z.length<3)return;
  var i=-1;store.misses.forEach(function(m,k){if(i<0&&nz(m.q)===z)i=k;});
  var m;
  if(i>=0){m=store.misses.splice(i,1)[0];m.n++;m.t=Date.now();if(gap){m.gap=true;m.why=why||m.why;}}
  else m={q:q.slice(0,200),n:1,t:Date.now(),gap:!!gap,why:why?String(why).slice(0,200):''};
  store.misses.unshift(m);
  if(store.misses.length>MAXM)store.misses.length=MAXM;
  save();render();
}

/* ---------- 3. hook into the engine ---------- */
window.QA.pre.add('learning_hook',50,function(P0){return function(raw){
  var q=raw;try{q=P0?P0(raw):raw;}catch(e){q=raw;}
  try{
    raw=String(raw);
    if(raw!==inp.value)return q;                       /* not a real submit (e.g. the engine testing its own suggestions) */
    window.QA.state.learn={raw:raw,q:q,used:null,done:false};
    if(!clean(raw))return q;
    var h1=matches(q),h2=q!==raw?matches(raw):[];
    if(!h1.length&&!h2.length)return q;                /* no lesson even mentions this question: nothing to do, and no extra work */
    if(understood(q))return q;                         /* the engine already knows this: never touch it */
    var r=(h1.length?tryApply(q,h1):null)||(h2.length?tryApply(raw,h2):null);
    if(r){window.QA.state.learn.used=r.used;window.QA.state.learn.q=r.q;return r.q;}
  }catch(e){}
  return q;
};});
window.QA.shape.add('learning_log',20,function(S0){return function(el){
  var r;try{r=S0?S0.apply(this,arguments):undefined;}catch(e){}
  try{if(el===out)observe();}catch(e){}
  return r;
};});
function observe(){
  var c=window.QA.state.learn;if(!c||c.done||c.raw!==inp.value)return;
  c.done=true;
  var txt=out.textContent||'',failed=MISS.test(txt)||CLARIFY.test(txt);
  if(c.used){
    if(failed)return;
    c.used.forEach(function(l){store.lessons.forEach(function(m){if(nz(m.when)===nz(l.when))m.n++;});});
    save();render();feedbackRow(c.used);
  }else if(failed){
    logMiss(c.raw);
    askTeacher(c.raw);
  }
}
function feedbackRow(used){
  var row=document.createElement('div');row.className='qa-note ql-row';
  row.appendChild(document.createTextNode('Answered using what you taught it. '));
  var local=used.filter(function(l){return !l.baked;});
  if(local.length){
    var b=document.createElement('button');b.type='button';b.className='ql-btn';b.textContent='Wrong? Forget it';
    b.addEventListener('click',function(ev){ev.stopPropagation();local.forEach(function(l){forget(l.when);});row.textContent='Forgotten. Ask again to see the original result.';});
    row.appendChild(b);
  }
  out.appendChild(row);
}

/* ---------- 6. teacher slot (OFF by default) ---------- */
function examples(){try{return window.__qaIdeas?window.__qaIdeas(12).map(String):[];}catch(e){return [];}}
function askTeacher(q){
  var T=api.teacher;if(!api.teacherOn||typeof T!=='function')return;
  var z=nz(q);if(!z||tried[z])return;tried[z]=1;
  Promise.resolve().then(function(){return T(q,{examples:examples()});}).then(function(ls){
    if(!Array.isArray(ls))return;
    var learned=0;
    ls.slice(0,5).forEach(function(l){if(l&&typeof l==='object'&&teach(l.when,l.say,l.ex,'teacher').ok)learned++;});
    if(learned&&inp.value===q)go.click();            /* run the same question again, now with the new lesson */
  }).catch(function(){});
}

/* ---------- export / import ---------- */
function exportLessons(){
  return JSON.stringify(allLessons().map(function(l){var o={when:l.when,say:l.say};if(l.ex)o.ex=l.ex;return o;}),null,1);
}
function exportUnanswered(){
  return store.misses.map(function(m){return m.q+(m.n>1?'  (x'+m.n+')':'')+(m.gap&&m.why?'  [needs engine code: '+m.why+']':'');}).join('\n');
}
function importLessons(text){
  var d;try{d=JSON.parse(text);}catch(e){return {ok:false,msg:'That is not a valid lesson list.'};}
  if(d&&!Array.isArray(d)&&Array.isArray(d.lessons))d=d.lessons;
  if(!Array.isArray(d))return {ok:false,msg:'That is not a valid lesson list.'};
  var ok=0,no=0;
  d.slice(0,MAXL).forEach(function(l){
    if(!okRec(l)){no++;return;}
    var r=teach(l.when,l.say,l.ex,'import');
    if(r.ok)ok++;else no++;
  });
  return {ok:ok>0,msg:'Imported '+ok+', skipped '+no+' (invalid, already understood, or the engine cannot answer them).'};
}

/* ---------- 5. the panel ---------- */
var sum,lessonsUl,missUl,gapUl,gapH,msgEl,io,fW,fS,fE,memEl;
function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
function msg(t){if(msgEl)msgEl.textContent=t||'';}
function buildPanel(){
  var st=document.createElement('style');
  st.textContent='.qa-learn{margin:12px 0;border:1px solid var(--border);border-radius:10px;background:var(--panel)}'
  +'.qa-learn>summary{padding:10px 12px;cursor:pointer;color:var(--accent);font-weight:600;font-size:14px}'
  +'.ql-body{padding:0 12px 12px;font-size:13px;color:var(--text)}'
  +'.ql-body p{margin:6px 0;color:var(--dim)}.ql-body h4{margin:14px 0 4px;font-size:13px;color:var(--accent)}'
  +'.ql-body label{display:block;margin:8px 0 2px;color:var(--dim);font-size:12px}'
  +'.ql-body input,.ql-body textarea{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:#0d0f14;color:#fff;-webkit-text-fill-color:#fff;caret-color:#fff;font-size:16px;font-family:inherit}'
  +'.ql-body textarea{min-height:90px;font-size:13px}'
  +'.ql-btn{background:#1c2030;color:var(--text);border:1px solid var(--border);border-radius:6px;padding:7px 10px;font-size:13px;margin:6px 6px 0 0;font-family:inherit}'
  +'.ql-btn.pri{background:var(--accent);color:#0d0f14;border:0;font-weight:600}'
  +'.ql-list{margin:4px 0;padding:0;list-style:none}'
  +'.ql-list li{display:flex;gap:8px;align-items:flex-start;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)}'
  +'.ql-list li .ql-t{flex:1;min-width:0;overflow-wrap:anywhere}.ql-list li small{display:block;color:var(--dim)}'
  +'.ql-pick{background:none;border:0;color:var(--text);text-align:left;padding:0;font:inherit;cursor:pointer;overflow-wrap:anywhere}'
  +'.ql-msg{margin:8px 0 0;min-height:1.2em;color:var(--accent)}.ql-warn{color:#ffcc33}';
  document.head.appendChild(st);
  var d=el('details','qa-learn');d.id='qaLearn';
  sum=el('summary');d.appendChild(sum);
  var b=el('div','ql-body');d.appendChild(b);
  b.appendChild(el('p',null,'Teach it a new way to ask. A lesson is only kept if the offline engine can really answer it. No AI model is involved.'));
  memEl=el('p','ql-warn');b.appendChild(memEl);
  var l1=el('label',null,'When someone says (a word, phrase or whole question)');fW=el('input');fW.id='qlWhen';fW.maxLength=200;fW.setAttribute('autocomplete','off');l1.appendChild(fW);b.appendChild(l1);
  var l2=el('label',null,'treat it as (something the engine already answers)');fS=el('input');fS.id='qlSay';fS.maxLength=200;fS.setAttribute('autocomplete','off');l2.appendChild(fS);b.appendChild(l2);
  var l3=el('label',null,'Example question using it (optional, proves a word or phrase lesson)');fE=el('input');fE.id='qlEx';fE.maxLength=200;fE.setAttribute('autocomplete','off');l3.appendChild(fE);b.appendChild(l3);
  var bt=el('button','ql-btn pri','Teach');bt.type='button';bt.id='qlTeach';
  bt.addEventListener('click',function(){var r=teach(fW.value,fS.value,fE.value,'user');msg(r.msg);if(r.ok){fW.value='';fS.value='';fE.value='';}});
  b.appendChild(bt);
  msgEl=el('div','ql-msg');msgEl.id='qlMsg';msgEl.setAttribute('role','status');b.appendChild(msgEl);
  b.appendChild(el('h4',null,'Questions it could not answer (tap one to teach it)'));missUl=el('ul','ql-list');b.appendChild(missUl);
  gapH=el('h4',null,'Needs new engine code');b.appendChild(gapH);gapUl=el('ul','ql-list');b.appendChild(gapUl);
  b.appendChild(el('h4',null,'Lessons'));lessonsUl=el('ul','ql-list');b.appendChild(lessonsUl);
  b.appendChild(el('h4',null,'Export / import'));
  b.appendChild(el('p',null,'To make lessons permanent: Export lessons, then paste the list between the [ ] of the qaLessonsBaked block in the file.'));
  io=el('textarea');io.id='qlIO';io.setAttribute('aria-label','Lessons export or import');io.setAttribute('spellcheck','false');b.appendChild(io);
  function btn(label,fn){var x=el('button','ql-btn',label);x.type='button';x.addEventListener('click',fn);b.appendChild(x);return x;}
  btn('Export lessons',function(){io.value=exportLessons();io.focus();io.select();msg('Exported '+allLessons().length+' lessons.');});
  btn('Export unanswered',function(){io.value=exportUnanswered();io.focus();io.select();msg('Exported '+store.misses.length+' questions.');});
  btn('Copy',function(){
    var t=io.value;if(!t){msg('Nothing to copy yet.');return;}
    var fb=function(){try{io.focus();io.select();return document.execCommand('copy');}catch(e){return false;}};
    var done=function(ok){msg(ok?'Copied.':'Select the text and copy it by hand.');};
    try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){done(true);},function(){done(fb());});return;}}catch(e){}
    done(fb());
  });
  btn('Import',function(){var r=importLessons(io.value);msg(r.msg);});
  btn('Clear unanswered',function(){store.misses=[];save();render();msg('Cleared.');});
  var anchor=out.parentNode;anchor.appendChild(d);
  render();
}
function row(parent,main,sub,btnLabel,onBtn,onPick){
  var li=el('li');var t=el('div','ql-t');
  if(onPick){var p=el('button','ql-pick',main);p.type='button';p.addEventListener('click',onPick);t.appendChild(p);}else t.appendChild(document.createTextNode(main));
  if(sub){t.appendChild(el('small',null,sub));}
  li.appendChild(t);
  if(btnLabel){var x=el('button','ql-btn',btnLabel);x.type='button';x.addEventListener('click',onBtn);li.appendChild(x);}
  parent.appendChild(li);
}
function render(){
  if(!sum)return;
  var ls=allLessons(),ms=store.misses.filter(function(m){return !m.gap;}),gs=store.misses.filter(function(m){return m.gap;});
  sum.textContent='\uD83E\uDDE0 Learning \u00B7 '+ls.length+' lesson'+(ls.length===1?'':'s')+' \u00B7 '+store.misses.length+' unanswered';
  memEl.textContent=memOnly?'This browser cannot save lessons here (private mode?). They last until you close the page. Export them to keep them.':'';
  missUl.textContent='';gapUl.textContent='';lessonsUl.textContent='';
  if(!ms.length)row(missUl,'None yet.');
  ms.slice(0,12).forEach(function(m){row(missUl,m.q+(m.n>1?'  \u00D7'+m.n:''),null,null,null,function(){fW.value=m.q;fS.focus();msg('Now type something the engine already answers.');});});
  gapH.style.display=gs.length?'':'none';gapUl.style.display=gs.length?'':'none';
  gs.slice(0,12).forEach(function(m){row(gapUl,m.q+(m.n>1?'  \u00D7'+m.n:''),m.why);});
  if(!ls.length)row(lessonsUl,'None yet.');
  ls.forEach(function(l){row(lessonsUl,l.when+'  \u2192  '+l.say,(l.baked?'built in':'taught by '+(l.src||'you'))+(l.n?' \u00B7 used '+l.n+'\u00D7':'')+(l.ex?' \u00B7 e.g. '+l.ex:''),l.baked?null:'\u00D7',function(){forget(l.when);});});
}

/* ---------- public handle ---------- */
var api=window.QALearn={
  version:1,teach:teach,forget:forget,understood:understood,
  lessons:function(){return allLessons().map(function(l){return JSON.parse(JSON.stringify(l));});},
  unanswered:function(){return JSON.parse(JSON.stringify(store.misses));},
  exportLessons:exportLessons,importLessons:importLessons,
  teacher:null,teacherOn:false,
  /* api.useWorker('https://your-worker...') switches the teacher on. It sends the unanswered question and a few
     example questions to that URL. Leave it off to stay fully offline. */
  useWorker:function(url){
    api.teacher=function(q,info){
      if(navigator.onLine===false)return [];
      return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'teach',question:String(q).slice(0,300),examples:info.examples})})
        .then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(d){return d&&d.lessons;});
    };
    api.teacherOn=true;
  }
};
load();buildPanel();
})();
