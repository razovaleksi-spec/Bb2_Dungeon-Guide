
/* ===== Answer record for chat replies (v59) =====
   Before (v58): the three chat layers (Free talk, Word library, Custom replies) showed a reply but left QA.state.answer empty (or
   pointing at an older answer), so a lone "why?" after them could not connect back. Now each layer calls QA.record({card, topic, why})
   with what it used. QA.record writes into QA.state.answer IN PLACE (the lone-word reply keeps a reference to that object), kind 'chat'
   (QA.ref ignores kind 'chat', so "it / its" is not tied to a chat topic). A last watcher re-applies the record while that chat card is
   still shown (the answer snapshot watcher can overwrite it with an older answer that sits in the folded search details).
   Adds no game facts; the "why" text only says which layer answered and what it used. Test hook: window.__qaRecord.last(). */
(function(){'use strict';var W=window,QA=W.QA;if(!QA||typeof QA.watch!=='function'||QA.record)return;
var out=QA.out||document.getElementById('qaOut'),REC=null;
function clean(s,n){return String(s==null?'':s).replace(/\s+/g,' ').trim().slice(0,n);}
function apply(){var A=QA.state&&QA.state.answer;if(!A||!REC)return;A.topic=REC.topic;A.name=REC.name;A.kind='chat';A.why=REC.why;}
QA.record=function(o){if(!o)return;var t=clean(o.topic,60);if(!t)return;REC={topic:t,name:t,why:clean(o.why,440),card:o.card||null};apply();};
QA.watch('answer_record',function(){if(!REC||!REC.card||!out||!out.contains(REC.card))return;var A=QA.state.answer;if(A&&(A.topic!==REC.topic||A.kind!=='chat'||A.why!==REC.why))apply();});
W.__qaRecord={version:1,last:function(){return REC?{topic:REC.topic,why:REC.why}:null;}};
})();
