
/* Guard: "how does X work / what is the X chance" about a game rule goes to the rule answer, never to a gear-build rewrite. */
(function(){'use strict';var W=window;if(typeof W.__qaPre!=='function'||!W.__qaMech||!W.__qaMech.topic)return;
W.QA.pre.add('mech_guard',80,function(P){return function(q){var r=P(q);
  try{if(r!==q&&W.__qaMech.topic(q)&&/\b(how|what)\b/i.test(q)&&/\b(work|works|calculated|worked out|formula|chance|determined|decided|rolled)\b/i.test(q)&&!/\b(best|build|gear|recommend|should|setup|suggest|which|for a)\b/i.test(q))return q;}catch(e){}
  return r;};});})();
