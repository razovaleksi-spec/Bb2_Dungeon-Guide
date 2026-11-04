
/* ===== page Ask handler (v46) =====
   Before (v45): the Ask script wired its own click listener on the button and its own Enter listener on the box.
   Now: the same run() is the LAST handler of the core (QA.on, registered after every other handler).
   It always returns false, so the event goes on to later listeners exactly as before (the old listeners never stopped it);
   Enter keeps its own preventDefault; IME composition (isComposing or keyCode 229) is skipped; an error inside run() is
   still reported as an uncaught page error (re-thrown), not swallowed by the core. */
(function(){'use strict';var QA=window.QA;if(!QA||!QA.on||!QA.run)return;
QA.on('page_ask',function(q,e){
  if(e.type==='keydown'){if(e.isComposing||e.keyCode===229)return false;e.preventDefault();}
  try{QA.run();}catch(err){setTimeout(function(){throw err;},0);}
  return false;},{ime:false});
})();
