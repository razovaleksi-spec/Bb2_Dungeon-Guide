
(function(){'use strict';var D=document,W=window,inp=D.getElementById('qaInput'),out=D.getElementById('qaOut');if(!inp||!out||typeof MutationObserver==='undefined')return;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var STOP=/^(a|an|the|is|are|was|were|be|do|does|did|i|me|my|you|your|it|its|of|to|in|on|for|and|or|but|not|can|could|would|should|will|what|whats|why|how|when|where|which|who|with|that|this|there|any|some|get|got|have|has|about|so|if|at|as|by|from|than|then|just|really|much|many|more|very|also|work|works|need|needed|want|tell|other|mean|means|come|only)$/;
function stem(w){if(w.length>4)return w.replace(/(ies)$/,'y').replace(/(ing|ed|es|s)$/,'');return w.length>3?w.replace(/s$/,''):w;}
function words(t){return String(t||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(' ').filter(function(w){return w.length>1;});}
function tok(t){var o=[];words(t).forEach(function(w){if(!STOP.test(w)){var s=stem(w);if(o.indexOf(s)<0)o.push(s);}});return o;}
function clean(t){return String(t||'').replace(/\$\$|\{\{|\}\}|\[\[|\]\]/g,'').replace(/\s+/g,' ').trim();}
var BAGS={};function pick(k,a){var b=BAGS[k];if(!b||!b.length){b=BAGS[k]=a.map(function(_,i){return i;});for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=b[i];b[i]=b[j];b[j]=t;}}return a[b.pop()];}
/* ---- the only fact sources: clean rules (qaMechRules) and stat definitions (STATS) ---- */
var DOCS=[],DF={};
try{JSON.parse(D.getElementById('qaMechRules').textContent).rules.forEach(function(r){DOCS.push({k:'rule',id:r.id,name:r.topic,text:r.rule,st:r.status,tk:tok(r.topic+' '+r.rule),nt:tok(r.topic)});});}catch(e){}
try{Object.keys(STATS).forEach(function(n){var d=clean(STATS[n]&&STATS[n].description);if(d)DOCS.push({k:'stat',id:n,name:n,text:d,tk:tok(n+' '+d),nt:tok(n)});});}catch(e){}
DOCS.forEach(function(d){d.tk.forEach(function(t){DF[t]=(DF[t]||0)+1;});});
function idf(t){return Math.log(1+DOCS.length/(DF[t]||1));}
function match(q){var qt=tok(q),res=[];if(!DOCS.length)return {qt:qt,hits:[],near:[]};
  DOCS.forEach(function(d){var s=0,h=[],nh=0;qt.forEach(function(t){if(d.tk.indexOf(t)>=0){var inn=d.nt.indexOf(t)>=0;s+=idf(t)*(inn&&d.k==='stat'?2:1);h.push(t);if(inn)nh++;}});
    if(!h.length)return;var ok=d.k==='stat'?(nh>=Math.min(2,d.nt.length)&&nh>=d.nt.length-1):(h.length>=2&&s>=4.2);
    res.push({d:d,s:s/Math.pow(d.tk.length+1,0.25),h:h,ok:ok,exact:d.k==='stat'&&nh===d.nt.length});});
  res.sort(function(a,b){return (b.exact-a.exact)||(b.s-a.s);});
  var ok=res.filter(function(r){return r.ok;}),ex=ok.filter(function(r){return r.exact;}),hits=ex.length?ex.slice(0,2).concat(ok.filter(function(r){return r.d.k==='rule';}).slice(0,1)):ok.slice(0,3);
  return {qt:qt,hits:hits,near:res.filter(function(r){return r.d.k==='stat'&&!r.ok&&r.h.some(function(t){return idf(t)>=3.4;});}).slice(0,3)};}
/* ---- the form of the question (what the topic reader does not look at) ---- */
var BUILDW=/\b(good|best|better|build|recommend|worth|should|top|strong|which|gear for|armor for|weapon for)\b/;
function form(q){q=' '+q.toLowerCase()+' ';
  if(/\b(why|how come)\b/.test(q))return 'why';
  if(/\bhow (many|much|high|low|big|often|long)\b|\bwhat (percent|percentage|amount|number)\b|percent/.test(q))return 'amount';
  if(!BUILDW.test(q)&&(/\bwhat (?:does|do) .{2,40}? (?:do|mean|give|add)\b/.test(q)||/\bwhat(?:'s| is| are) (?!the best|a good)[a-z]/.test(q)||/\bhow (?:does|do|is) .{0,40}\bwork/.test(q)||/\bmeans?\b/.test(q)))return 'what';
  if(/\b(can|could|is it possible|am i able|do i need|is there)\b/.test(q)&&!BUILDW.test(q))return 'yesno';
  return 'other';}
var FL={why:'a \u201cwhy\u201d question',amount:'a \u201chow many / how much\u201d question',what:'a \u201cwhat does it do\u201d question',yesno:'a \u201ccan I / is there\u201d question',other:'a general question'};
function lab(t){return '<span class="qa-lab">'+t+'</span> ';}
function ask(l,q){return '<button type="button" class="qa-exbtn" data-ex="'+esc(q)+'">'+esc(l)+'</button>';}
function unknown(q){var u=[];if(typeof W.__qaKnown!=='function')return u;words(q).forEach(function(w){if(w.length>2&&!STOP.test(w)&&!/^\d+$/.test(w)&&u.indexOf(w)<0){try{if(!W.__qaKnown(w))u.push(w);}catch(e){}}});return u.slice(0,3);}
function reading(q){try{return W.__qaUnderstanding&&W.__qaUnderstanding.interpret(q)||null;}catch(e){return null;}}
function build(q,why){
  var f=form(q),m=match(q),U=reading(q),unk=unknown(q),h='';
  var sh=m.hits.filter(function(r){return r.d.k==='stat';}),th=sh.length?sh:m.hits,topic=th.length?th.map(function(r){return r.d.k==='stat'?r.d.name:r.d.name.toLowerCase();}).filter(function(x,i,a){return a.indexOf(x)===i;}).slice(0,2).join(' / '):(unk.length?unk.join(', '):m.qt.slice(0,4).join(' '));
  h+='<div class="qa-line">'+pick('re',['I read this as '+FL[f]+' about <b>'+esc(topic||'something I could not pin down')+'</b>.','Here is how I understood it: '+FL[f]+', topic <b>'+esc(topic||'unclear')+'</b>.','My reading: '+FL[f]+' about <b>'+esc(topic||'an unclear topic')+'</b>.'])+'</div>';
  if(m.hits.length){
    h+='<div class="qa-line">'+pick('has',['These entries in the guide touch it:','The guide has this on the topic:','What the guide itself says:'])+'</div>';
    m.hits.forEach(function(r){var d=r.d;h+='<div class="qa-line">'+(d.k==='rule'?lab('Rule '+esc(d.id)+' \u00b7 '+esc(String(d.st||'').toLowerCase())):lab('Stat \u00b7 '+esc(d.name)))+esc(d.text)+'</div>';});
    h+='<div class="qa-line">'+pick('lim',['This does not answer your exact question word for word; check the lines above against what you asked.','I only show what the guide states, so it may cover just part of your question.'])+'</div>';
  }else{
    h+='<div class="qa-line">'+pick('no',['The guide does not cover this, so I will not guess.','I cannot find this in the guide, so I have nothing verified to tell you.','This is not in the guide data, and I do not make facts up.'])+(unk.length?' I do not recognise: <b>'+esc(unk.join(', '))+'</b>.':'')+'</div>';
    if(m.near.length)h+='<div class="qa-line">'+lab('Closest entries')+m.near.map(function(r){return ask(r.d.name,'What does '+r.d.name+' do?');}).join('')+'</div>';
  }
  var core=U?('intent '+esc(U.intent&&U.intent.primary||'?')+', confidence '+esc(U.confidence)+(U.summary?', read as \u201c'+esc(U.summary)+'\u201d':'')):'not available';
  h+='<details class="qa-more qa-fold"><summary>What I understood</summary><div class="qa-line">'+lab('Question form')+esc(FL[f])+'</div><div class="qa-line">'+lab('Words matched')+(m.qt.length?esc(m.qt.join(', ')):'none')+'</div>'+(unk.length?'<div class="qa-line">'+lab('Not recognised')+esc(unk.join(', '))+'</div>':'')+'<div class="qa-line">'+lab('Topic reader')+core+'</div><div class="qa-line">'+lab('Why this answer')+esc(why)+'</div><div class="qa-line">Nothing here is generated word by word: facts are copied from the guide data and the sentences are hand-written.</div></details>';
  return '<div class="qa-card" data-aw="1"><div class="qa-title">What I understood<span class="qa-sub">awareness check</span></div>'+h+'</div>';}
var busy=false;
function check(){if(busy||out.querySelector('[data-aw],[data-redirect]'))return;var q=inp.value;if(!q||!q.trim())return;
  var txt=out.textContent||'',menu=/Tell me a bit more/.test(txt)||/I couldn.t match/.test(txt),rc=!!out.querySelector('[data-rc]'),f=form(q),why=null;
  if(menu)why='The Ask box was unsure what you meant, so it would only have shown the generic menu.';
  else if(f!=='other'){var t0=out.querySelector('.qa-title'),tt=t0?t0.textContent:'',U=reading(q),rec=U&&U.intent&&U.intent.primary==='recommend';
    if(rc&&rec)why='You asked '+FL[f]+', but the Ask box read it as a request for suggestions and listed them.';
    else if(/^Getting more out of your skill uses/.test(tt))why='You asked '+FL[f]+', but the Ask box matched the topic and showed its skill-uses answer instead of an explanation.';}
  if(!why)return;
  busy=true;try{var html=build(q,why);
    if(menu)out.insertAdjacentHTML('afterbegin',html);
    else{var nodes=[].slice.call(out.childNodes),note=null;if(nodes.length&&nodes[0].nodeType===1&&nodes[0].classList.contains('qa-note'))note=nodes.shift();
      var rest=D.createElement('details');rest.className='qa-more qa-fold';rest.innerHTML='<summary>Suggestions the Ask box also found</summary>';
      nodes.forEach(function(n){rest.appendChild(n);});
      var box=D.createElement('div');box.innerHTML=html;out.appendChild(box.firstChild);out.appendChild(rest);if(note)out.insertBefore(note,out.firstChild);}
  }catch(e){}
  setTimeout(function(){busy=false;},0);}
QA.watch('awareness',function(){check();});
})();
