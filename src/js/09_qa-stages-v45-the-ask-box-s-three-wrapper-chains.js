
/* ===== QA stages (v45): the Ask box's three wrapper chains as NAMED, ORDERED stages with a trace =====
   Before (v44): nine scripts each wrapped window.__qaPre (rewrite the typed question), three wrapped window.__qaShape
   (after-answer shaping) and two wrapped window.__qaOnline (answer add-ons), each capturing "the previous one" by itself.
   Now: QA.pre / QA.shape / QA.online hold the stages. QA.pre.add(id, order, wrap): wrap(next) returns the stage function;
   next(...) runs the stages below (smaller order). Same order as v44, same stage bodies. window.__qaPre / __qaShape /
   __qaOnline stay as the entry points. QA.pre.list() = stages in running order (inner first); QA.pre.trace() = the last
   calls with, for each stage, what came in, what the stages below returned and what this stage returned (changed = true
   when this stage altered it). For shape / online the trace shows the answer-box HTML length before and after each stage. */
(function(){'use strict';var W=window,QA=W.QA=W.QA||{};QA.state=QA.state||{};(function(S){var d={orig:'',item:'',reading:null,intent:{build:null,last:''},named:{prev:[],cur:[]},build:null,learn:null,fail:null,touchAt:0,chipAt:0,answer:{topic:'',name:'',why:'',kind:''}};for(var k in d)if(!(k in S))S[k]=d[k];})(QA.state);
function pv(v){var s;try{s=v===undefined?'undefined':typeof v==='string'?v:(v&&v.nodeType?'<'+String(v.nodeName).toLowerCase()+'>':String(v));}catch(e){s='?';}return s.length>160?s.slice(0,160)+'\u2026':s;}
function hl(el){try{return el&&typeof el.innerHTML==='string'?el.innerHTML.length:-1;}catch(e){return -1;}}
function chain(name,win,base,elArg){
  var S=[],T=[],cur=null,depth=0,MAX=40;
  function top(){return S[S.length-1];}
  var C={name:name,installed:false,
    add:function(id,order,wrap){
      var rec={id:id,order:order,stack:[]};
      var below=function(){
        var i=S.indexOf(rec),lo=i>0?S[i-1]:null,e=rec.stack[rec.stack.length-1];
        if(e)e.called=true;
        var r=lo?lo.run.apply(this,arguments):base.apply(this,arguments);
        if(e)e.inner=pv(r);
        return r;};
      rec.own=wrap(below);
      rec.run=function(){
        var e=null,el=elArg>=0?arguments[elArg]:null;
        if(cur){e={id:id,d:depth,in:pv(arguments[0]),called:false,inner:undefined,out:undefined,len0:hl(el),len1:undefined};cur.steps.push(e);}
        rec.stack.push(e);depth++;
        var r;
        try{r=rec.own.apply(this,arguments);}
        finally{depth--;rec.stack.pop();}
        if(e){e.out=pv(r);e.len1=hl(el);e.changed=elArg>=0?e.len0!==e.len1:(e.called?e.out!==e.inner:e.out!==e.in);}
        return r;};
      var k=S.length;while(k>0&&S[k-1].order>order)k--;
      S.splice(k,0,rec);
      if(!C.installed){C.installed=true;W[win]=function(){return C.run.apply(this,arguments);};}
      return C;},
    run:function(){
      var t=top();if(!t)return base.apply(this,arguments);
      var root=!cur;if(root)cur={chain:name,in:pv(arguments[0]),steps:[]};
      try{var r=t.run.apply(this,arguments);if(root){cur.out=pv(r);T.push(cur);if(T.length>MAX)T.shift();}return r;}
      finally{if(root)cur=null;}},
    list:function(){return S.map(function(s){return {id:s.id,order:s.order};});},
    trace:function(){return T.slice();},
    last:function(){return T[T.length-1]||null;}
  };
  return C;}
QA.pre=chain('pre','__qaPre',function(raw){return raw;},-1);
QA.shape=chain('shape','__qaShape',function(){return undefined;},0);
QA.online=chain('online','__qaOnline',function(){return undefined;},1);
QA.stages=function(){return {pre:QA.pre.list(),shape:QA.shape.list(),online:QA.online.list()};};
})();
