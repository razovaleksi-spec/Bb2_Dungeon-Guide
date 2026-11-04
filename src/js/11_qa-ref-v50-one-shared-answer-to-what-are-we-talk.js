
/* ===== QA.ref (v50): ONE shared answer to "what are we talking about?" =====
   Before (v49): four layers worked out "it / its / that / tell me more" separately (019 follow memory, 039 follow-up
   resolver, 077 lone words, 027 / 045 build follow-ups) and some picked the wrong thing: after a stat card (e.g. Parry)
   they used the first equipment name in the answer. Now they ask QA.ref(), which reads the shared QA.state.
   QA.ref(onlyAnswer) -> {name, kind, via} or null.
     1. the topic of the last answer when it was a stat card, a short rules card or a plain guide term (state.answer)
     2. unless onlyAnswer: the last item the user named or tapped (state.item)
   QA.plain(name) = true when a topic looks like a real thing (2-24 letters / digits / space / ' / -), not a search title. */
(function(){'use strict';var W=window,QA=W.QA=W.QA||{};
var SKIP=/^(Related|Runes matching|Understood|Comparison|Built for|Tell me|Outside|What I|Results|Matches|Search)/i;
QA.plain=function(n){return typeof n==='string'&&/^[\w' -]{2,24}$/.test(n)&&!SKIP.test(n);};
QA.ref=function(onlyAnswer){var S=QA.state||{},A=S.answer;
  if(A&&A.name&&(A.kind==='stat'||A.kind==='rules'||A.kind==='other')&&QA.plain(A.name))return {name:A.name,kind:A.kind,via:'answer'};
  if(!onlyAnswer&&S.item)return {name:S.item,kind:'item',via:'item'};
  return null;};
})();
