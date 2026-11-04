
/* ===== Answer shaping (offline answers): short lead, folded extras, one footnote per session ===== */
(function(){'use strict';
var RULE_RE=/do not appear in rerolls unless you reach Savage mode/i,ruleSeen=false;
function kids(p,cls){return [].filter.call(p.children,function(c){return c.classList&&c.classList.contains(cls);});}
function mkFold(label){var d=document.createElement('details');d.className='qa-more qa-fold';var s=document.createElement('summary');s.textContent=label;d.appendChild(s);return d;}
window.QA.shape.add('shape_base',10,function(){return function(el){
  try{
    /* 1. the reroll footnote shows once per session */
    [].forEach.call(el.querySelectorAll('.qa-note'),function(n){
      if(!RULE_RE.test(n.textContent))return;
      if(ruleSeen)n.remove();else ruleSeen=true;
    });
    /* 2. community-opinion cards: first 3 rows, the rest folded; one provenance note per answer */
    var noteSeen=false;
    [].forEach.call(el.querySelectorAll('.qa-op'),function(c){
      var rows=kids(c,'qa-slot');
      if(rows.length>3){var d=mkFold('+'+(rows.length-3)+' more');c.insertBefore(d,rows[3]);rows.slice(3).forEach(function(r){d.appendChild(r);});}
      var nt=kids(c,'qa-note')[0];
      if(nt){if(noteSeen)nt.remove();else noteSeen=true;}
    });
    /* 3. when an opinion card already answers a "best race/job/origin" question, the big stat comparison is folded */
    if(el.querySelector('.qa-op')){
      [].forEach.call(el.querySelectorAll('.qa-card'),function(c){
        var t=c.querySelector('.qa-title');
        var m=t&&t.textContent.trim().match(/^(Race|Job|Origin) comparison/);
        if(!m||c.querySelector(':scope > details.qa-fold.qa-whole'))return;
        var rest=[].filter.call(c.children,function(x){return x!==t;});
        var d=mkFold('Compare all '+m[1].toLowerCase()+'s by stats and survival tools');d.className+=' qa-whole';
        c.appendChild(d);rest.forEach(function(r){d.appendChild(r);});
      });
    }
    /* 4. any long run of chips or buttons: show 8, fold the rest */
    var ps=[].slice.call(el.querySelectorAll('div,span,td'));
    ps.forEach(function(p){
      if(p.closest('[data-doc]'))return;
      var card=p.closest('.qa-card'),tt=card&&card.querySelector('.qa-title');
      if(tt&&/^(All |Contracts)/.test(tt.textContent.trim()))return;
      var ch=[].filter.call(p.children,function(c){return c.classList&&(c.classList.contains('qa-chip')||c.classList.contains('qa-exbtn'));});
      if(ch.length<=9)return;
      var rest=ch.slice(8),d=mkFold('+'+rest.length+' more');
      p.insertBefore(d,rest[0]);rest.forEach(function(c){d.appendChild(c);});
    });
  }catch(e){}
};});
})();
