/* ===== Player view (v150): hide the Ask box's test panels from players =====
   The Ask box shows panels that are for checking how it works, not for players: "What I picked up", the inner
   "What I understood" fold, the Learning panel (lessons / unanswered), and the awareness card when a real answer
   is already shown next to it. They stay in the page (other layers read them) but are hidden with CSS.
   An awareness card that IS the answer (nothing else shown beside it) stays visible.
   Debug switch: open the page with #debug at the end of its address, or run localStorage.qaDebug='1' once:
   everything shows again. #nodebug (or localStorage.qaDebug='0') turns it off. */
(function(){'use strict';var D=document;
var css='body:not(.qa-debug) #qaLearn{display:none!important}'+
  'body:not(.qa-debug) #qaOut [data-debug]{display:none!important}'+
  'body:not(.qa-debug) #qaOut:has(> .qa-card:not([data-aw])) > [data-aw]{display:none!important}';
try{var st=D.createElement('style');st.id='qaPlayerView';st.textContent=css;D.head.appendChild(st);}catch(e){}
function on(){var v=null;try{v=localStorage.getItem('qaDebug');}catch(e){}
  var h=String(location.hash||'');
  if(/\bnodebug\b/.test(h)){try{localStorage.setItem('qaDebug','0');}catch(e){}return false;}
  if(/\bdebug\b/.test(h)){try{localStorage.setItem('qaDebug','1');}catch(e){}return true;}
  return v==='1';}
function apply(){try{D.body.classList.toggle('qa-debug',on());}catch(e){}}
apply();window.addEventListener('hashchange',apply);
})();
