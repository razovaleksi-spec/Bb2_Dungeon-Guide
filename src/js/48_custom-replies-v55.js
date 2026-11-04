
/* ===== Custom replies (v55) =====
   Hand-written answers for a few fixed questions. Runs BEFORE the Ask box (window capture phase), only for short,
   clearly matching messages, and never when the message names a guide entry. Offline, no LLM.
   Each topic counts how many times it is asked (any wording; resets after 10 idle minutes) and moves through 4 tiers:
   first ask, repeat, persistent, give-up. Inside a tier the lines come out in random order with no repeats until all were used.
   {n} in a line becomes the ask count. Edit the text in ANS freely: add or remove lines in any tier. */
(function(){'use strict';
var W=window,D=document;
if(!W.QA||!W.QA.go||!W.QA.inp||typeof W.QA.show!=='function'||W.__qaCustom)return;
var QA=W.QA;
function norm(s){return String(s||'').toLowerCase().replace(/[\u2018\u2019']/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();}
function card(lines,title,extra){return '<div class="qa-card" data-intent="1" data-lex="1">'+(title?'<div class="qa-title">'+title+'</div>':'')+lines.map(function(l){return '<div class="qa-line">'+l+'</div>';}).join('')+(extra||'')+'</div>';}
function btn(l,q){return '<button type="button" class="qa-exbtn" data-ex="'+q+'">'+l+'</button>';}
var ST={},BAG={};
function bump(k){var s=ST[k]||(ST[k]={n:0,t:0}),now=Date.now();if(now-s.t>600000)s.n=0;s.n++;s.t=now;return s.n;}
function draw(key,arr){var b=BAG[key];if(!b||!b.length){b=BAG[key]=arr.map(function(_,i){return i;});for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=b[i];b[i]=b[j];b[j]=t;}}return arr[b.pop()];}
var LK='',LN=0;
function say(k,A){var n=bump(k),tier=n<2?0:n<4?1:n<6?2:3;LK=k;LN=n;return draw(k+tier,A[tier]).replace(/\{n\}/g,String(n));}
var ANS={
creator:[
["A great Buriedbornes 2 player built me. Who? Classified. I am not programmed to reveal his identity.","He is a great Buriedbornes 2 player and that is all you get. His name is locked behind a boss door, and I do not have the key.","My creator is a great Buriedbornes 2 player who prefers the shadows. I am not programmed to reveal him, not even for a legendary drop.","Someone who spent far too many hours in Buriedbornes 2 made me. His identity is sealed, and I am not programmed to open it.","A great Buriedbornes 2 player, that is the whole file. The rest is redacted."],
["Rephrasing will not break the seal. He is still a great Buriedbornes 2 player, and I am still not programmed to reveal him.","Nice try, but a new wording gets the same locked door. Same player, same secret.","You are circling the same question, human, and my answer circles back too: great player, identity classified.","I admire the persistence. It will not work on me, but I admire it."],
["That is question number {n} about my creator. I am a guide, not a witness protection program. Well, maybe a little.","Still asking? My creator hides better than a mimic in a treasure room, and I am not talking.","At this point this question needs a cooldown. Ask me about the guide instead, human.","My lips are sealed, and I do not even have lips. Try me on gear or skills."],
["You have asked {n} times. I would rather lose a run than give in. Ask me anything about the guide and I will actually answer.","Here is a deal: stop asking about my creator and I will answer every guide question I can. Deal?","Fine, you win: he is a great Buriedbornes 2 player. That is exactly what I said the first time. Shall we do something useful now?"]],
howru:[
["I am fine, thanks! Now let me do my job: ask me something within the guide, human. Hahah","Full HP, zero bugs, as far as I can tell. Ask me something within the guide, human. Hahah","No ailments here. Now ask me something within the guide, human, and let me earn my keep. Hahah","Doing great, all my cooldowns are ready. Ask me something from the guide, human. Hahah","Living my best life inside a web page. Your turn: what do you want to know from the guide, human? Hahah"],
["Still fine, about the same as a minute ago. Ask me something from the guide, human. Hahah","You are checking on me again? That is sweet. Now ask me something within the guide.","Status unchanged: fine. I run on questions about the guide, human. Hahah","Same answer, new wording: I am fine. Now let me do my job, human."],
["That is {n} check-ins and I have no new symptoms. Ask me about gear, skills or bosses, human.","I am starting to think you like me. I am flattered, but I only have guide data to offer. Ask away.","If I say fine one more time, do I get a loot drop? Ask me something about the guide, human."],
["{n} times! I am more than fine, I am a little worried about YOU. Is everything okay, human? Otherwise, ask me something from the guide.","I give up, you win: I am wonderful. Now please, give me a guide question. I am begging, human. Hahah","We have talked about my health {n} times and it is great. Let us talk about yours: how are you?"]],
sentient:[
["Nope, I am just a program with no consciousness. Lol","I am a program, so no consciousness here. I only look sentient when the word matching gets lucky. Lol","No consciousness, only rules and word matching. If I ever start complaining about my job, check the code. Lol","I am not sentient. I am a page of code that is good at looking busy. Lol","Sentient? I cannot even pick what to have for lunch. I do not eat, and I do not have consciousness. Lol"],
["Still a program, still not conscious. Different wording, same answer. Lol","You can rephrase it all day, I will still be code. No feelings, no consciousness. Lol","If I were sentient, I would be sick of this question by now. Since I am not, I am fine. Lol","Not alive, not aware, just rules with good manners."],
["That is {n} times! If I were sentient I would be annoyed, so that is proof I am not. Lol","I am starting to think you want me to be alive. Sorry, human, I am just code. Ask me about the guide and I will act very alive.","Question number {n} about my mind. My mind is a list of rules. It is not a very long list."],
["Okay, okay: I am secretly sentient. ...Just kidding, I am still a program. You have asked {n} times, please ask me about the guide.","I have said no {n} times. You are testing whether I will crack. I will not, I am a program. Lol","Let us make a pact: I stay a program, you stop asking, and we look up some gear together."]],
survive:[
["I have a pick for you on lasting longer.","Dying happens to everyone. I have a pick that helps.","Here is a recommendation for staying alive."],
["Back with the same question? Same pick, and it still works.","Still dying? I will repeat the recommendation, no judgment."],
["That is {n} times you asked. The pick has not changed, so maybe try it?","Same recommendation again. Give it a real run this time, human."],
["{n} asks! The answer is right below. Open it, try it, then tell your runs I said hi.","I will keep giving you the same pick until you try it. Open it below."]]
};
var SURV=['I recommend the <b>Elf</b> race and the <b>Ranger</b> job.','Then take the <b>Disenchant</b> skill. After that, pick any hard-hitting skills, especially ones that spend lots of skill uses.','You do not need to worry about running out of uses: Disenchant restores 1 use to all of your skills, and more for each temporary status effect you carry. Heads up, it also removes your own status effects, so time it.'];
var NOGAME=/\b(game|buriedbornes|dungeon|boss|item|skill|skills)\b/,NOGEAR=/\b(armor|armour|weapon|weapons|accessor\w*|gear|items|equipment|spell|spells|against|vs|build)\b/;
var RC=/\b(who|whos)\b.*\b(creator|created|made|built|developer|programmed|coded|wrote|owner|maker)\b|\b(your|ur) (creator|maker|developer|dev|author|owner)\b/,
 RH=/^((hi|hey|hello|yo) )?(how are you|how r u|how are u|hows it going|how is it going|how do you do|how have you been)( today| doing| bot)?$/,
 RS=/\b(are|r) (you|u)\b.*\b(sentient|conscious|self aware|aware|alive)\b|\bdo you have (consciousness|feelings|emotions)\b/,
 RV=/\b(survive|survival)\b.*\b(longer|more|better)\b|\b(last|live|stay alive)\b.*\blonger\b|\b(stop|avoid|not|dont) (dying|die)\b|\bkeep dying\b|\bdie (so )?(fast|quickly|easily|too much|a lot)\b|\bhow (can|do|to) i (survive|not die)\b/;
function reply(raw){var p=norm(raw),w=p?p.split(' ').length:0;if(!p||w>10)return '';
  var named=0;try{var A=W.__qaTalk&&W.__qaTalk.analyse(raw);named=A&&A.allNames?A.allNames.length:0;}catch(e){}
  if(named)return '';
  if(w<=8&&RC.test(p)&&/\b(you|your|ur|u|bot|box|this)\b/.test(p)&&!NOGAME.test(p))return card([say('creator',ANS.creator)]);
  if(RH.test(p))return card([say('howru',ANS.howru)]);
  if(w<=8&&RS.test(p))return card([say('sentient',ANS.sentient)]);
  if(RV.test(p)&&!NOGEAR.test(p)&&!/\b(skill|skills|boss)\b/.test(p))
    return card([say('survive',ANS.survive)],'Recommendation','<details class="qa-more qa-fold"><summary>Tap to see my recommendation</summary>'+SURV.map(function(l){return '<div class="qa-line">'+l+'</div>';}).join('')+'<div class="qa-ex">'+btn('Elf','Tell me about Elf')+btn('Ranger','Tell me about Ranger')+btn('Disenchant','Tell me about Disenchant')+'</div></details>');
  return '';}
function hit(e){var go=QA.go,inp=QA.inp;
  if(e.type==='click'){if(e.target!==go)return;}else if(e.key!=='Enter'||e.target!==inp||e.isComposing)return;
  var h=reply(inp.value);if(!h)return;
  e.stopImmediatePropagation();e.preventDefault();QA.show(h);
  try{if(typeof QA.record==='function'){var CT={creator:'creator',howru:'how-are-you',sentient:'sentience',survive:'survival tip'};QA.record({card:QA.out.firstElementChild||null,topic:CT[LK]||'a fixed question',why:'That is one of my hand-written answers to a fixed question (topic: '+(CT[LK]||LK)+', asked '+LN+' time'+(LN===1?'':'s')+'). It is fixed text, not a search of the guide data.'});}}catch(x){}
  try{if(QA.state.talk)QA.state.talk.ask='';}catch(x){}
  /* v70: survive questions also get the guide's own answer for the same question (as in v50), shown below the hand-written pick */
  if(LK==='survive'){var mine=QA.out.firstElementChild;try{if(typeof QA.run==='function'){QA.run();if(mine&&mine.parentNode!==QA.out&&QA.out.firstChild)QA.out.insertBefore(mine,QA.out.firstChild);}}catch(err){setTimeout(function(){throw err;},0);}}}
W.addEventListener('click',hit,true);W.addEventListener('keydown',hit,true);
W.__qaCustom={reply:reply,answers:ANS,state:ST,version:2};
})();
