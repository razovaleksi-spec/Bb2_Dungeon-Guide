
/* ===== QA trackers (v47): named registry for the page's background activity trackers =====
   Before (v46): part 037 attached its own listeners (window: key / pointer / touch / wheel / scroll -> idle time;
   document click -> chip tap time). Now: QA.track(id, target, events, fn, options) attaches the SAME listeners with the SAME
   options at the SAME place in load order (fn is called unchanged), and keeps a count of how often each fired.
   QA.trackers() lists them (id, where, events, hits, last). Nothing else changes. */
(function(){'use strict';var QA=window.QA=window.QA||{};var T=[];
QA.track=function(id,target,events,fn,opts){
  var rec={id:id,where:target===window?'window':target===document?'document':'other',events:events.slice(),hits:0,last:0};T.push(rec);
  events.forEach(function(ev){target.addEventListener(ev,function(e){rec.hits++;rec.last=Date.now();return fn.call(this,e);},opts);});
  return rec;};
QA.trackers=function(){return T.map(function(r){return {id:r.id,where:r.where,events:r.events.slice(),hits:r.hits,last:r.last};});};
})();
