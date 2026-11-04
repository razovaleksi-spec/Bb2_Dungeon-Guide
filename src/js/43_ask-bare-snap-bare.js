
(function(){'use strict';var D=document,go=D.getElementById('qaGo'),inp=D.getElementById('qaInput'),out=D.getElementById('qaOut');if(!go||!inp||!out)return;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var BARE=/^\s*(?:(?:and|but|so)\s+)?(why not|why so|why though|why is that|how come|how so|what for|what about it|why|how many|how much|how|what|when|where|who|which)\s*[?.!]*\s*$/i;
var BAGS={};function pick(k,a){var b=BAGS[k];if(!b||!b.length){b=BAGS[k]=a.map(function(_,i){return i;});for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=b[i];b[i]=b[j];b[j]=t;}}return a[b.pop()];}
var last=window.QA.state.answer;
function snap(){if(out.querySelector('[data-bare],[data-aw]'))return;var t=out.querySelector('.qa-title');
  if(!t){var nt=out.querySelector('.qa-card > .qa-note');var nx=nt?nt.textContent.split(' \u00b7 ')[0].replace(/[?!.\s]+$/,'').trim():'';if(nx&&nx.length<=60&&!/^(Understood as|I read this|What I understood|Tell me a bit more)/i.test(nx)&&!out.querySelector('.qa-title')){last.topic=nx;last.name=nx.split(':')[0].trim();last.kind='rules';last.why='';}return;}
  if(/Tell me a bit more|Outside this guide/.test(t.textContent))return;
  var n=t.firstChild;var tp=((n&&n.textContent)||'').trim().slice(0,60);last.topic=/^Built for:/.test(tp)?tp.replace(/^Built for:\s*/,'the ')+' build':tp;last.why='';
  last.name=tp;var sb=t.querySelector('.qa-sub');last.kind=/^Built for:/.test(tp)?'build':(sb&&/^stat$/i.test(sb.textContent.trim()))?'stat':(t.querySelector('.qa-chip')?'item':'other');
  [].forEach.call(out.querySelectorAll('details'),function(d){var s=d.querySelector('summary');if(s&&/^Why these/.test(s.textContent))last.why=[].map.call(d.querySelectorAll('.qa-line'),function(x){return x.textContent.trim();}).join(' ').replace(/\s+/g,' ').slice(0,440);});}
QA.watch('bare_snap',snap);
var EX={why:'Why is parry capped at 95?',how:'How does parry work?',what:'What does Item Rarity do?','how many':'How many hp stacks can I have?','how much':'How many hp stacks can I have?'};
function reply(raw){var m=BARE.exec(raw),lw=m[1].toLowerCase(),W=lw.charAt(0).toUpperCase()+lw.slice(1),T=last.topic?'<b>'+esc(last.topic)+'</b>':'',isWhy=/^(why|how come|how so)/.test(lw);
  var open=pick('o',[W+' what?',W+'\u2026 what exactly?','You stopped at \u201c'+lw+'\u201d.','I only caught \u201c'+lw+'\u201d.','That sentence ended early.','I got \u201c'+lw+'\u201d but not the rest.','Hm, \u201c'+lw+'\u201d about what?']);
  var ask=pick('a',['Finish the thought and I will look it up.','Tell me what you want to know about.','Give me the full question, or just name the thing.','Which part do you mean?','Name the item, skill or stat you are asking about.','Say it as one full sentence and I will check the guide.','What are you referring to?']);
  var L=[Math.random()<0.5?open+' '+ask:open,Math.random()<0.5?'':ask];if(L[1]==='')L=[open+' '+ask];else L=[open,ask];
  if(T){
    L.push(pick('c',['Or do you mean the '+T+' answer I just gave?','If this is about '+T+', say so and I will connect it back.','Is this still about '+T+'?','A moment ago we were on '+T+'; is that what you mean?','Tell me if you mean '+T+'.']));
    if(isWhy&&last.why)L.push(pick('w',['If you mean why that answer: ','Connecting back to '+T+', here is the reasoning that answer showed: ','Taking it as a question about the last answer: '])+esc(last.why));
  }else{var ex=EX[lw.replace(/^(and|but|so)\s+/,'')];if(ex)L.push(pick('h',['For example: \u201c'+ex+'\u201d.','Try something like \u201c'+ex+'\u201d.','Like this: \u201c'+ex+'\u201d.']));}
  return '<div class="qa-card" data-bare="1">'+L.map(function(x){return '<div class="qa-line">'+x+'</div>';}).join('')+'</div>';}
var OFFER=null,YESW=/^\s*(?:yes|yeah|yep|yup|yea|sure|ok|okay|k|alright|please|go on|go ahead|do it|of course|definitely|absolutely|sounds good)\s*[?.!]*\s*$/i;
/* v89: the lone-word reply remembers its offer (word, topic, reason) while its card is shown; a following yes-word follows it */
QA.on('bare',function(q){if(!BARE.test(q))return false;var lw=BARE.exec(q)[1].toLowerCase();QA.show(reply(q));OFFER=(last.topic&&last.kind!=='chat')?{w:lw,topic:last.topic,why:last.why||'',kind:last.kind||'',at:Date.now()}:null;return true;});
QA.on('bare_yes',function(q){var o=OFFER;if(!o)return false;if(!YESW.test(q)||Date.now()-o.at>150000||!out.querySelector('[data-bare]')){OFFER=null;return false;}OFFER=null;
  var w=o.w,t=o.topic,ask='';
  if(/^(why|how come|how so)/.test(w)&&o.why){QA.show('<div class="qa-card" data-bare="1"><div class="qa-line">'+pick('y',['Yes, the <b>'+esc(t)+'</b> answer. Here is the reasoning it showed: ','Okay, the <b>'+esc(t)+'</b> answer. This is why it came out that way: '])+esc(o.why)+'</div><div class="qa-line">To get the topic itself explained, ask \u201chow does '+esc(t)+' work?\u201d.</div></div>');return true;}
  if(w==='how'||/^(why|how come|how so)/.test(w))ask='how does '+t+' work?';
  else if(w==='where'&&o.kind==='item')ask='where does '+t+' drop?';
  else ask='what is '+t+'?';
  QA.inp.value=ask;QA.go.click();return true;});
})();
