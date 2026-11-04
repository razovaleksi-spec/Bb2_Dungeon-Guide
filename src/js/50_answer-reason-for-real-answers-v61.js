
/* ===== Answer reason for real answers (v61) =====
   Before (v60): a real answer card (stat / rules / item / skill / term / search results) was recorded in QA.state.answer with a topic and a kind
   but NO reason, so a lone "why?" after it only said "Or do you mean the <topic> answer I just gave?". Now this script fills QA.state.answer.why
   with what the card itself says it used: its title, its own label (for example "stat", "term", "verified rules", "computed") and, when the page
   showed one, the line before the card ("Showing results for ...", "Closest match: ...", "Understood as: ..."). If a "Smart answer" card from the
   optional online AI is shown, the reason says that part is not read straight from the guide.
   It only reads the visible card and adds no game facts. It never overwrites a reason that already exists (build cards keep their "Why these"
   reasoning; chat replies keep the text from QA.record). Test hook: window.__qaWhy.now() / .last(). */
(function(){'use strict';var W=window,QA=W.QA;if(!QA||!QA.state||W.__qaWhy)return;
var out=QA.out||document.getElementById('qaOut'),MINE='';
if(!out)return;
function T(el,n){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim().slice(0,n||60);}
var SMALL=/(\bguide|assistant)$|^(anything else|I only know|what I can and cannot)/i;
function hint(l){var s=l.toLowerCase();
  if(/^stat$/.test(s))return 'a stat entry';
  if(/^term$/.test(s))return 'a term entry';
  if(/\u2605\s*(weapon|armor|accessory|skill|rune)/.test(s))return 'an entry for that piece or skill';
  if(/computed/.test(s))return 'a calculated result';
  if(/estimate/.test(s))return 'partly an estimate, not all checked';
  if(/verified/.test(s))return 'marked as checked rules';
  if(/formula status/.test(s))return 'a note on whether the formula is known yet';
  if(/skill data/.test(s))return 'taken from the skill data';
  if(/^\d+ match/.test(s))return 'the closest matches I found';
  return '';}
function build(){var A=QA.state.answer;if(!A||A.kind==='chat'||!A.topic)return undefined;
  if(out.querySelector('[data-bare],[data-aw]'))return undefined;
  var cards=[],pre='',online=false,i,ch;
  for(i=0;i<out.children.length;i++){ch=out.children[i];
    if(ch.classList.contains('qa-note')){var nn=T(ch,90);if(!pre&&/^(Showing results for|Closest match|Understood as)/i.test(nn))pre=nn.replace(/[.\s]+$/,'');continue;}
    if(!ch.classList.contains('qa-card')||ch.style.display==='none')continue;
    var tt=ch.querySelector('.qa-title'),c=null;
    if(tt){var sb=tt.querySelector('.qa-sub'),sl=T(sb,50),f=tt.firstChild,key=T(f,60);
      if(/^online$/i.test(sl)){online=true;continue;}
      if(SMALL.test(sl))return undefined;
      if(/Tell me a bit more|Outside this guide/.test(T(tt)))return undefined;
      c={key:key,t:sl?key.replace(/^Built for:\s*/,'the ')+(/^Built for:/.test(key)?' build':''):T(tt,60),l:sl};}
    else{var nt=ch.querySelector('.qa-note'),nx=T(nt,120),k=nx.split(' \u00b7 ');
      if(k.length<2||!/verified|estimate|rule|example|status/i.test(k.slice(1).join(' ')))continue;
      c={key:k[0].replace(/[?!.\s]+$/,'').trim(),t:k[0].replace(/[?!.\s]+$/,'').trim(),l:k.slice(1).join(' \u00b7 ')};}
    cards.push(c);}
  if(!cards.length)return undefined;
  var c0=cards[0];if(!(A.name===c0.key||A.topic===c0.key||(c0.key&&A.topic.indexOf(c0.key)===0)))return undefined;
  var tail=(pre?' Before the card the page said \u201c'+pre+'\u201d.':'')+(online?' A \u201cSmart answer\u201d card from the online AI is also shown; that part is not read straight from the guide, so check it.':'');
  var n=Math.min(3,cards.length),head='';
  for(;n>=1;n--){var ps=cards.slice(0,n).map(function(x,j){var h=x.l?hint(x.l):'';return (cards.length>1?'Card '+(j+1)+': ':'')+x.t.slice(0,40)+(x.l?', labelled \u201c'+x.l.slice(0,50)+'\u201d'+(h?' ('+h+')':''):'');});
    head='I answered from the guide\u2019s own cards. '+ps.join('; ')+'.';if(head.length+tail.length<=440)break;}
  return (head+tail).slice(0,440);}
function refresh(){try{var A=QA.state.answer,w=build();if(typeof w==='string'&&A&&(A.why===''||A.why===MINE)){A.why=w;MINE=w;}}catch(x){try{console.error('QA answer_why',x);}catch(y){}}}
try{new MutationObserver(refresh).observe(out,{childList:true,subtree:true});}catch(e){}
W.__qaWhy={version:1,now:function(){return build();},last:function(){return MINE;}};
})();
