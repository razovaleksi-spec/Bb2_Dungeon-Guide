
/* ===== QA core (v44): ONE dispatcher + ONE output watcher for every Ask-box extension =====
   Before: six scripts each registered their own capture listeners and each re-checked the click / Enter gate.
   Now: extensions call QA.on(id, fn[, {ime:false}]) and QA.watch(fn). fn(question, event) returns true when it
   answered; the core then stops the page's own handler. Handlers run in registration order; an error in one
   handler or watcher is reported and does not stop the others (same isolation as separate listeners).
   QA.show(html) writes an answer card and scrolls to it. QA.state is the shared state (orig = typed words). */
(function(){'use strict';var W=window,D=document,go=D.getElementById('qaGo'),inp=D.getElementById('qaInput'),out=D.getElementById('qaOut');if(!go||!inp||!out)return;
var H=[],V=[];
var QA=W.QA=W.QA||{};QA.go=go;QA.inp=inp;QA.out=out;QA.state=QA.state||{orig:''};
QA.on=function(id,fn,o){H.push({id:id,fn:fn,ime:!(o&&o.ime===false)});};
/* v149: QA.first puts a handler BEFORE all others (the Ask core v2 uses it: it answers only when it is sure, else it returns false). */
QA.first=function(id,fn,o){H.unshift({id:id,fn:fn,ime:!(o&&o.ime===false)});};
QA.watch=function(id,fn){V.push({id:id,fn:fn});};
QA.show=function(html){out.innerHTML=html;try{out.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(x){}};
QA.list=function(){return {handlers:H.map(function(h){return h.id;}),watchers:V.map(function(v){return v.id;})};};
function dispatch(e){
  if(e.type==='click'){if(e.target!==go)return;}else if(e.key!=='Enter'||e.target!==inp)return;
  for(var i=0;i<H.length;i++){var h=H[i];if(h.ime&&e.isComposing)continue;
    var r=false;try{r=h.fn(inp.value,e);}catch(x){try{console.error('QA handler '+h.id,x);}catch(y){}}
    if(r){e.stopImmediatePropagation();e.preventDefault();return;}}}
D.addEventListener('click',dispatch,true);D.addEventListener('keydown',dispatch,true);
try{new MutationObserver(function(){for(var i=0;i<V.length;i++){try{V[i].fn();}catch(x){try{console.error('QA watcher '+V[i].id,x);}catch(y){}}}}).observe(out,{childList:true});}catch(e){}
})();
