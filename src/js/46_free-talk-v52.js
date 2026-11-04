
/* ===== Free talk (v52) =====
   What it is: when the Ask box cannot answer (it would show the generic "Tell me a bit more" menu, or the
   "Outside this guide" card), this layer talks back to the player about what they actually said.
   It reads the sentence (what kind of message it is, the key words, any guide names in it, the mood), then
   answers those words directly. It never works on a real answer: if the Ask box found something, this stays silent.
   Offline, no LLM, no network. Every sentence is hand-written and only fills in the player's own words.
   It adds NO game facts: guide names are only offered as buttons that go back into the Ask box.
   Plugs in with one QA.watch('free_talk') after the awareness check. Test hook: window.__qaTalk.reply(text). */
(function(){'use strict';
var W=window,D=document,inp=D.getElementById('qaInput'),out=D.getElementById('qaOut');
if(!inp||!out||!W.QA||typeof W.QA.watch!=='function'||W.__qaTalk)return;
var QA=W.QA,T=QA.state.talk=QA.state.talk||{turns:[],ask:'',askAt:0,n:0};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var BAGS={};function pick(k,a){var b=BAGS[k];if(!b||!b.length){b=BAGS[k]=a.map(function(_,i){return i;});for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=b[i];b[i]=b[j];b[j]=t;}}return a[b.pop()];}
function set(s){var o={};s.split(' ').forEach(function(x){if(x)o[x]=1;});return o;}
function cap(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1);}
function nz(s){return ' '+String(s||'').toLowerCase().replace(/[\u2018\u2019']/g,'').replace(/[^a-z0-9]+/g,' ').trim()+' ';}
var STOP=set('i im ive ill id me my mine myself we us our you your youre yours it its this that these those the a an and or but so if of to in on at for with about just really very too also then than is are was were be been am do does did dont doesnt didnt can cant could would should will wont have has had get got what whats why how hows when where who which there here some any lot lots much many more most thing things stuff ok okay yeah yes yep no nope nah lol haha hey hi hello please pls plz tell say know think want wanna gonna going let lets like love hate kinda sorta maybe actually basically literally even still already ever never always keep kept being now today tonight they them their he she him her his hers over under out off up down into onto from by as because since while after before again lately finally recently soon yet around something anything everything nothing someone anyone everyone morning evening afternoon night day days week time guess mean means sure thats theres nice good bad great outside long short big small hot cold fun');
var FLIP={i:'you',im:"you're",ive:"you've",ill:"you'll",id:"you'd",me:'you',my:'your',mine:'yours',myself:'yourself',we:'you',us:'you',our:'your'};
function flip(s){return String(s||'').split(' ').map(function(x){return FLIP.hasOwnProperty(x)?FLIP[x]:x;}).join(' ');}
function lab(t){return '<span class="qa-lab">'+t+'</span> ';}
function line(h){return '<div class="qa-line">'+h+'</div>';}
function btn(l,q){return '<button type="button" class="qa-exbtn" data-ex="'+esc(q)+'">'+esc(l)+'</button>';}
/* ---------------- guide names (only used to offer buttons back into the Ask box) ---------------- */
var EVERYDAY=set('rainbow graduate ruler puppet mushroom twilight eternity moonlight volcanic learning focus guts rage rest shield trick steady haste greed prayer influence judgement scream disaster eclipse evasion critical accuracy avatar sanctuary shotgun pandora conqueror abomination catastrophe almighty mutation domination consumption invincibility toughness sniping');
var NAMES=null;
function names(){if(NAMES)return NAMES;NAMES=[];var seen={};
  function add(k,kind){var n=String(k).replace(/::(weapon|armor|accessory|skill)$/,'').trim(),l=nz(n);if(n.length<4||seen[l])return;seen[l]=1;NAMES.push({n:n,l:l,kind:kind});}
  try{if(typeof ITEM_DETAILS!=='undefined')Object.keys(ITEM_DETAILS).forEach(function(k){add(k,'item');});}catch(e){}
  try{if(typeof SKILL_DETAILS!=='undefined')Object.keys(SKILL_DETAILS).forEach(function(k){add(k,'skill');});}catch(e){}
  try{if(typeof STATS!=='undefined')Object.keys(STATS).forEach(function(k){add(k,'stat');});}catch(e){}
  try{if(typeof SPECIAL!=='undefined')SPECIAL.forEach(function(r){add(r[0],'boss');});}catch(e){}
  try{if(typeof BOSS_LOOT!=='undefined')Object.keys(BOSS_LOOT).forEach(function(k){BOSS_LOOT[k].forEach(function(it){add(it.name,'loot');});});}catch(e){}
  NAMES.sort(function(a,b){return b.l.length-a.l.length;});return NAMES;}
function findNames(q){var t=nz(q),o=[];names().forEach(function(x){if(o.length>=3)return;var i=t.indexOf(x.l);if(i>=0){o.push(x);t=t.slice(0,i)+' '+t.slice(i+x.l.length-1);}});return o;}
function nameChip(x){return x.kind==='stat'?btn(x.n,'What does '+x.n+' do?'):btn(x.n,'Tell me about '+x.n);}
/* ---------------- reading the sentence ---------------- */
var RX={
 crisis:/\b(kill myself|killing myself|suicide|suicidal|end my life|want to die|wanna die|dont want to live|hurt myself|harm myself|cut myself|self harm|selfharm)\b/,
 greet:/^(hi+|hello+|hey+|heya|hiya|yo|sup|howdy|hola|good (morning|afternoon|evening)|greetings)( there| everyone| all| guys| bot| buddy| friend)?$/,
 bye:/\b(bye|goodbye|good night|goodnight|gn|gtg|g2g|see you|see ya|cya|gotta go|have to go|im off|logging off|going to sleep|heading out|talk later|ttyl)\b/,
 thanks:/\b(thanks|thank you|thx|ty|tysm|cheers|appreciate it)\b/,
 how:/\b(how are you|how r u|how are u|hows it going|how is it going|hows life|how do you do|how have you been|hows your day|how was your day|whats up|wassup|wyd|what are you doing|what are you up to)\b/,
 who:/\b(who are you|what are you|whats your name|what is your name|your name|who made you|who built you|who created you|are you (a |an )?(bot|ai|robot|real|human|person|alive|chatgpt|gpt|claude|llm|program)|are you smart|how do you work)\b/,
 help:/\b(what can you do|what do you know|how do i use|how to use this|what do you do|can you help)\b/,
 botq:/\b(do you|did you|can you|will you|would you|have you|are you|were you|you ever|your favorite|your favourite|how old are you|where do you live|where are you from)\b/,
 compl:/\b(youre|you are|you re|ur|u r)( so| really| very| pretty| actually)? (good|great|smart|awesome|amazing|helpful|cool|nice|funny|cute|the best|clever|useful|wonderful)\b|\b(good (job|bot|work)|nice (job|one|work)|well done|love you|i like you)\b/,
 insult:/\b(stupid|dumb|useless|trash|garbage|suck|sucks|idiot|moron|worthless|terrible|worst|hate you|shut up|annoying|bad bot)\b/,
 joke:/\b(joke|make me laugh|cheer me up|riddle|something funny)\b/,
 laugh:/^(l+o+l+|lmao+|lmfao|rofl|ha(ha)+h?|he(he)+|hehe+|xd+|haha+|hah)$/,
 yes:/^(yes|yeah|yep|yup|yea|sure|ok|okay|k|alright|fine|please|go on|go ahead|do it|why not|of course|definitely|absolutely|sounds good)$/,
 no:/^(no|nope|nah|not really|no thanks|no thank you|never mind|nevermind|nvm|its fine|forget it)$/,
 idk:/^(idk|i dont know|dunno|not sure|maybe|hmm+|hm+|um+|uh+|well|i guess|whatever|meh)$/,
 same:/^(same|me too|me neither|same here|true|right|exactly|fair|i agree|agreed|facts|valid)$/,
 time:/\b(what time is it|current time|time is it|whats the time|what is the time|time now)\b/,
 date:/\b(what day is it|whats the date|what is the date|todays date|what is today|which day is it|day is it today|whats today)\b/,
 game:/\b(hp|hp stacks?|crit|boss|bosses|dungeon|dungeons|armor|armour|weapon|weapons|accessor\w*|skill|skills|rune|runes|loot|farm|farming|resist\w*|damage|dmg|gear|tank|mage|healer|rogue|archer|buriedbornes|tiamat|conquest|evasion|parry|accuracy|ailment\w*)\b|\u2605/,
 struggle:/\b(died|dying|dead|die|lost|losing|lose|failed|fail|wiped|wipe|stuck|cant beat|cant kill|too hard|so hard|impossible|unfair|rng|no drops|unlucky|keep dying|one shot|oneshot|oneshotted|killed me)\b/,
 win:/\b(won|cleared|beat|finally|first time|got it|new record|it dropped|just got|lucky|killed it|finished)\b/,
 gamelove:/\b(love|like|enjoy|addicted to) (this|the) (game|guide|wiki|page)\b|\b(game|guide) is (great|good|fun|awesome|amazing)\b/,
 hard:/\b(passed away|funeral|lost my job|got fired|laid off|broke up|breakup|divorce|got dumped)\b|\b(grandpa|grandma|grandfather|grandmother|dad|mom|mother|father|brother|sister|friend|dog|cat|pet|uncle|aunt|wife|husband|son|daughter)\b.{0,25}\b(died|passed|dead)\b/,
 gamehate:/\b(hate|dislike) (this|the) (game|boss|dungeon|run|floor)\b|\b(game|boss|dungeon) (is|are) (unfair|trash|bad|too hard|broken|annoying)\b/
};
var MOODS=[['tired',/\b(tired|sleepy|exhausted|drained|sleepless|burnt out|burned out|worn out|no sleep)\b/],['bored',/\b(bored|boring|nothing to do)\b/],['happy',/\b(happy|excited|great day|pumped|hyped|proud|feeling good|having fun|good day|so good)\b/],['upset',/\b(angry|mad|annoyed|frustrated|furious|pissed|irritated|raging|tilted|salty)\b/],['stressed',/\b(stressed|anxious|worried|nervous|overwhelmed|scared|afraid|panicking)\b/],['down',/\b(sad|depressed|lonely|miserable|hopeless|unhappy|crying|feel down|feeling down|im down|so down)\b/],['hungry',/\b(hungry|starving)\b/],['sick',/\b(sick|ill|fever|headache|flu|not feeling well)\b/]];
function analyse(q){var raw=String(q||'').trim(),low=raw.toLowerCase().replace(/[\u2018\u2019]/g,"'");
  var plain=low.replace(/'/g,'').replace(/[^a-z0-9\u2605 ]+/g,' ').replace(/\s+/g,' ').trim(),ws=plain?plain.split(' '):[];
  var best=[],cur=[],all=[];function verbish(x){return x.length>4&&/(ed|ing)$/.test(x);}
  ws.forEach(function(x){if(!STOP[x]&&x.length>1&&!/^\d+$/.test(x)&&!verbish(x)){cur.push(x);all.push(x);}else{if(cur.length&&cur.length>=best.length)best=cur;cur=[];}});if(cur.length&&cur.length>=best.length)best=cur;
  if(!best.length){ws.forEach(function(x){if(!STOP[x]&&x.length>2&&!/^\d+$/.test(x)&&all.indexOf(x)<0)all.push(x);});best=all.slice(-1);}
  var A={raw:raw,low:low,plain:plain,ws:ws,words:all.slice(0,5),focus:best.slice(0,3).join(' ')};
  A.allNames=findNames(raw);var strong=A.allNames.filter(function(x){return x.l.trim().indexOf(' ')>0||!EVERYDAY[x.l.trim()];});
  A.gameish=RX.game.test(plain)||strong.length>0;A.names=A.gameish?A.allNames:[];
  A.isQ=/\?\s*$/.test(raw)||/^(who|what|whats|when|where|why|how|hows|which|is|are|do|does|did|can|could|will|would|should|have|has|am)\b/.test(plain);
  A.qw=(/^(who|what|whats|when|where|why|how|hows|which)\b/.exec(plain)||[''])[0];
  var m;A.mood='';MOODS.forEach(function(x){if(!A.mood&&x[1].test(plain))A.mood=x[0];});
  m=/\bi (?:really |just |kinda |actually |totally |also )?(love|like|enjoy|hate|dislike|adore|prefer|miss)\s+(.+)$/.exec(plain);
  if(m){A.verb=m[1];A.obj=m[2].split(/\s+(because|but|and then|since|when|so|though)\b/)[0].split(' ').slice(0,6).join(' ');}
  return A;}
function snippet(A){var s=A.raw.replace(/\s+/g,' ');return s.length>70?s.slice(0,67)+'\u2026':s;}
/* ---------------- tiny safe calculator (no eval) ---------------- */
function calc(low){var m=/^(?:what(?:s| is)?|calc(?:ulate)?|compute|solve|=)?\s*([0-9x\u00d7\u00f7+\-*\/().,\s]+?)\s*(?:=|\?)?\s*$/i.exec(low);if(!m)return null;
  var s=m[1].replace(/[x\u00d7]/gi,'*').replace(/\u00f7/g,'/').replace(/,/g,'').replace(/\s+/g,'');if(!/\d[+\-*\/]+[\d(]|\d[+\-*\/]*\(|\)[+\-*\/]/.test(s)||!/^[0-9.+\-*\/()]+$/.test(s))return null;
  var p=0;function ex(){var v=tm();while(s[p]==='+'||s[p]==='-'){var o=s[p++],r=tm();v=o==='+'?v+r:v-r;}return v;}
  function tm(){var v=fc();while(s[p]==='*'||s[p]==='/'){var o=s[p++],r=fc();if(o==='/'&&r===0)throw 'zero';v=o==='*'?v*r:v/r;}return v;}
  function fc(){if(s[p]==='-'){p++;return -fc();}if(s[p]==='('){p++;var v=ex();if(s[p]!==')')throw 'paren';p++;return v;}var n=/^[0-9]*\.?[0-9]+/.exec(s.slice(p));if(!n)throw 'num';p+=n[0].length;return parseFloat(n[0]);}
  try{var v=ex();if(p!==s.length)return null;return {expr:m[1].trim(),val:v};}catch(e){return e==='zero'?{expr:m[1].trim(),zero:true}:null;}}
/* ---------------- hand-written pieces ---------------- */
var CH=[['Best armor for a tank','best armor for tank'],['Where do I get Lemegeton','where do I farm Lemegeton'],['Which race for a beginner','which race is best for a beginner']];
var CHD=[['Stop dying so fast','stop dying so fast'],['Best armor for a tank','best armor for tank']];
var JOKES=['Why do skeletons never fight each other? They do not have the guts.','I told my sword a joke. It was a bit blunt.','What do you call a mage with no mana? Just someone in a very nice hat.','Why did the tank refuse to dance? Too much armor, not enough rhythm.','I would tell you a joke about HP stacks, but you would not survive the punchline.','Why was the dungeon so calm? It had nothing to hide, only floors.'];
function chipsHtml(list,names){var h='';(list||[]).forEach(function(c){h+=btn(c[0],c[1]);});(names||[]).forEach(function(x){h+=nameChip(x);});return h?'<div class="qa-ex">'+h+'</div>':'';}
function pending(){var ok=T.ask&&(Date.now()-T.askAt)<150000;return ok?T.ask:'';}
function actOf(A){var p=A.plain,w=A.ws.length;
  if(!p&&!A.raw)return 'empty';
  if(RX.crisis.test(p))return 'crisis';
  var na=(A.raw.match(/[^\x00-\x7f]/g)||[]).length;if(A.raw.length>3&&na/A.raw.length>0.4)return 'foreign';
  if(w===1&&((/^[^aeiou0-9]{4,}$/.test(p))||/(.)\1{4,}/.test(p)||/^(asdf\w*|qwer\w*|zxcv\w*|jkl\w*|hjkl\w*)$/.test(p)))return 'gibber';
  if(calc(A.low))return 'calc';
  if(RX.time.test(p))return 'time';if(RX.date.test(p))return 'date';
  if(RX.greet.test(p))return 'greet';
  if(w<=7&&RX.bye.test(p))return 'bye';
  if(w<=6&&RX.thanks.test(p))return 'thanks';
  if(RX.how.test(p))return 'howru';
  if(RX.who.test(p))return 'who';
  if(RX.help.test(p)&&w<=6)return 'help';
  if(RX.joke.test(p))return 'joke';
  if(RX.compl.test(p))return 'compl';
  if(RX.insult.test(p)&&(/\b(you|ur|u)\b/.test(p)||w<=3))return 'insult';
  if(RX.laugh.test(p))return 'laugh';
  var pd=pending();
  if(RX.yes.test(p))return pd?'pyes':'yes0';
  if(RX.no.test(p))return pd?'pno':'no0';
  if(RX.idk.test(p))return 'idk';
  if(RX.same.test(p))return 'same';
  if(RX.botq.test(p)&&/\b(you|your|youre)\b/.test(p))return 'botq';
  if(RX.gamelove.test(p))return 'gamelove';
  if(RX.gamehate.test(p))return 'gamehate';
  if(RX.hard.test(p))return 'hard';
  if(A.mood)return 'mood';
  if(RX.struggle.test(p)&&(A.gameish||/\b(keep dying|keep losing|keep failing|dying|wiped|one ?shot\w*|too hard|no drops|rng|run|runs|boss|game|dungeon|floor)\b/.test(p)))return 'struggle';
  if(RX.win.test(p)&&/\b(i|my|me|im|ive)\b/.test(p))return 'win';
  if(A.verb)return 'like';
  if(A.gameish)return 'gamemiss';
  if(A.isQ)return 'question';
  return 'statement';}
var MOODSAY={tired:['That sounds tiring.','If you can, take a break. The guide will still be here.'],bored:['Bored, hm.','If you want something to poke at, try an odd question like \u201cwhich skills grant burn\u201d.'],happy:['Glad to hear it!','What is making it a good one?'],upset:['That sounds frustrating.','Is it the game or something else? Tell me, I am listening. If it is a boss or gear problem, I can go look in the guide.'],stressed:['That sounds like a lot.','One thing at a time. I can listen for a bit, and talking it out sometimes helps.'],down:['I am sorry you are feeling low.','I am only the guide\u2019s Ask box, so I cannot give you what a friend can. If it keeps weighing on you, tell someone you trust.'],hungry:['Go eat something!','The dungeon can wait.'],sick:['Hope you feel better soon.','Rest up. The guide will still be here when you are back.']};
/* ---------------- the reply ---------------- */
function reply(q){var A=analyse(q),act=actOf(A),L=[],chips=null,ask='',tag='',f=A.focus,F=f?'<b>'+esc(f)+'</b>':'',nm=A.names,kindLabel='';
  var prev=T.turns.length?T.turns[T.turns.length-1]:null,recent=prev&&(Date.now()-prev.t)<300000;
  function back(){if(recent&&prev.focus&&prev.focus!==f&&/^(statement|like|question|win)$/.test(prev.act)&&Math.random()<0.3)L.push(pick('bk',['Earlier you mentioned <b>'+esc(prev.focus)+'</b>; we can come back to it.','We were on <b>'+esc(prev.focus)+'</b> a moment ago. Still thinking about it?']));}
  switch(act){
  case 'empty':kindLabel='empty';L=['I got an empty message. Type a few words and I will answer.'];break;
  case 'crisis':kindLabel='worrying message';L=['I am really sorry you are going through this. I am only a guide box and cannot help the way a person can.','Please reach out now to someone you trust, or to your local emergency number or a crisis line. You deserve real support.'];break;
  case 'foreign':kindLabel='not English';L=['I can only read English in this box, so I could not make out your message.','Try it in English and I will answer.'];break;
  case 'gibber':kindLabel='unreadable';L=[pick('gb',['I could not read that one.','That looks like a keyboard slip to me.','That did not come through as words.'])+' Try a few real words.'];chips=CH;break;
  case 'calc':{var c=calc(A.low);kindLabel='arithmetic';if(c.zero)L=['That divides by zero, so there is no answer.'];else{var v=Math.round(c.val*1e9)/1e9;L=[esc(c.expr)+' = <b>'+esc(String(v))+'</b>'];}break;}
  case 'time':kindLabel='time question';L=['By your device\u2019s clock it is <b>'+esc(new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}))+'</b>.'];break;
  case 'date':kindLabel='date question';L=['By your device\u2019s clock today is <b>'+esc(new Date().toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'}))+'</b>.'];break;
  case 'greet':kindLabel='greeting';L=[pick('gr',['Hi! Good to see you.','Hello there.','Hey! What is on your mind?']),'Ask me about the game, or just talk for a bit.'];chips=CH;break;
  case 'bye':kindLabel='goodbye';L=[pick('by',['See you! Good luck out there.','Take care, and good luck in the dungeons.','Bye for now. The guide will be here.'])];break;
  case 'thanks':kindLabel='thanks';L=[pick('th',['You are welcome.','Happy to help.','Anytime.']),'Anything else?'];break;
  case 'howru':kindLabel='how are you';L=[pick('hw',['I am a program in this page, so no bad days. Thanks for asking!','Doing fine, as far as a rule-based guide can.','All good on my side.']),'How are you doing?'];ask='tellmore';break;
  case 'who':kindLabel='about me';L=['I am the Ask box of this guide: a set of hand-written rules that read your words and answer from the guide\u2019s own data.','I am not a chat AI. I work offline in this page, look nothing up online, and my sentences are written by hand with your words filled in.'];break;
  case 'help':kindLabel='what I can do';L=['I can look up gear, skills, bosses, races, jobs and origins, compare things, suggest builds and explain stats.','If you just want to talk, you can do that too. I will say so when something is outside the guide.'];chips=CH;break;
  case 'joke':kindLabel='joke request';L=[pick('jk',JOKES),'Want another one?'];ask='joke';break;
  case 'compl':kindLabel='compliment';L=[pick('cp',['Thank you, that is kind.','That is nice to hear.','Thanks, I will take it.']),'I only know what is in the guide, but I will keep trying. What next?'];break;
  case 'insult':kindLabel='frustration with me';L=[pick('in',['Sorry I could not help with that one.','Fair enough, I missed that.','I hear you, that was not useful.']),'Tell me what you were after in a few plain words and I will try again.'];chips=CH;break;
  case 'laugh':kindLabel='laughing';L=[pick('lg',['Glad that landed.','Ha, nice.','Good to hear you laughing.'])];break;
  case 'pyes':{var pd=pending();kindLabel='yes';if(pd==='joke'){L=[pick('jk',JOKES),'Another?'];ask='joke';}else if(pd==='tellmore'){L=['Go on, I am listening.'];ask='tellmore';}else{L=['Okay! Ask me something about the guide, or keep talking.'];chips=CH;}break;}
  case 'pno':kindLabel='no';L=[pick('pn',['No problem.','Okay, no worries.','Fine by me.']),'I am here if you want the guide or just a chat.'];break;
  case 'yes0':kindLabel='yes';L=['Yes to what? I did not ask anything yet. Ask me something, or tell me what is on your mind.'];chips=CH;break;
  case 'no0':kindLabel='no';L=['Okay. Say more if you like, or ask me about the guide.'];break;
  case 'idk':kindLabel='unsure';L=[pick('ik',['No rush.','That is okay.','Fair, hard to say sometimes.']),'Say what you are leaning toward, or try a guide question.'];chips=CH;break;
  case 'same':kindLabel='agreeing';L=[pick('sm',['Right.','Fair point.','Good to know.']),'Anything you want to add?'];ask='tellmore';break;
  case 'hard':kindLabel='something hard';L=[pick('hd',['I am so sorry, that sounds really hard.','I am sorry you are dealing with that.']),'I am only the guide\u2019s Ask box, but I am happy to listen if you want to say more.'];ask='tellmore';break;
  case 'mood':{kindLabel='feeling: '+A.mood;var ms=MOODSAY[A.mood];L=ms.slice();if(A.mood==='bored')chips=[['Which skills grant burn','which skills grant burn']];if(A.mood==='upset')chips=CHD;if(A.mood==='happy'||A.mood==='stressed')ask='tellmore';break;}
  case 'struggle':kindLabel='trouble in a run';L=[pick('sg',['Ouch, that is rough.','Losing runs hurts.','That sounds painful.'])+(nm.length?' <b>'+esc(nm[0].n)+'</b> is in the guide.':''),'I cannot see your run, but I can look in the guide for ways to last longer.'];chips=CHD;break;
  case 'win':kindLabel='good news';L=[pick('wn',['Nice one! Congratulations.','That is great news, well done.','Good for you!']),'What happened? Tell me about it.'];ask='tellmore';break;
  case 'gamelove':kindLabel='liking the game';L=['Glad you are enjoying it.','What do you like most about it?'];ask='tellmore';break;
  case 'gamehate':kindLabel='frustrated with the game';L=[pick('gh',['That sounds rough.','I get it, that is frustrating.']),'Which part is getting to you? I can look in the guide for ways around it.'];chips=CHD;ask='tellmore';break;
  case 'like':{kindLabel='something you '+A.verb;var ob=flip(A.obj);A.allNames.forEach(function(n){if(EVERYDAY[n.l.trim()])return;try{ob=ob.replace(new RegExp(n.n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),n.n);}catch(e){}});var o='<b>'+esc(ob)+'</b>',v=A.verb,pos=/^(love|like|enjoy|adore|prefer)$/.test(v);
    if(v==='miss')L=['So you miss '+o+'.','What do you miss most about it?'];
    else L=[pos?pick('lk',['So you '+v+' '+o+'. Nice.','You '+v+' '+o+', good to know.','Got it, you '+v+' '+o+'.']):pick('dl',['Got it, you '+v+' '+o+'.','Noted: you '+v+' '+o+'.','Okay, adding '+o+' to your no list.']),'I will keep that in mind for this chat.',pos?'What do you like about it?':'What gets to you about it?'];
    ask='tellmore';break;}
  case 'botq':{kindLabel='question about me';var p=A.plain,s;
    if(/\b(eat|food|hungry|drink)\b/.test(p))s='I do not eat or drink, I am a program in this page.';
    else if(/\b(sleep|dream|tired|bed)\b/.test(p))s='I do not sleep or dream, I am a program in this page.';
    else if(/\b(old|age|born|birthday)\b/.test(p))s='I have no age. I am a page of code that runs in your browser.';
    else if(/\b(live|from|where)\b/.test(p))s='I live in your browser, inside this page.';
    else if(/\b(remember|forget)\b/.test(p))s='I keep a short memory of this chat while the page is open, and nothing personal beyond that.';
    else if(/\b(feel|feeling|emotion|lonely|alive|conscious)\b/.test(p))s='I am not sure \u201cfeel\u201d applies to me. I am rules and word matching, not a person.';
    else if(/\b(play|game|games)\b/.test(p)&&!/\bhelp\b/.test(p))s='I do not play games. I only read this guide\u2019s data about Buriedbornes 2.';
    else if(/\b(favorite|favourite|like|love|hate|prefer|enjoy)\b/.test(p))s='I do not have favourites the way you do. I am just the guide\u2019s Ask box.';
    else if(/\b(sing|dance|swim|draw|paint|cook|code|translate|drive|speak|talk)\b/.test(p)&&!/\b(help|tell|find|show|answer|look)\b/.test(p))s='That is beyond me. I read the guide and chat a little, that is about it.';
    else if(/\b(know|help|answer|tell|find|show|look)\b/.test(p))s=A.allNames.length?'Yes, the guide has an entry for <b>'+esc(A.allNames[0].n)+'</b>.':'Only if it is in the guide. I answer from this guide\u2019s data and I do not look things up online.';
    else s='That one is about me, and I am only the guide\u2019s Ask box.';
    L=[s];if(!A.allNames.length)L.push('What made you ask?');ask='tellmore';if(A.allNames.length&&/\b(know|help|answer|tell|find|show)\b/.test(p))chips=[];if(!A.allNames.length&&/\b(know|help|answer|tell|find|show)\b/.test(p))chips=CH;break;}
  case 'question':{kindLabel='question outside the guide';var qw=A.qw;
    var o1=f?pick('q1',['I picked up <b>'+esc(f)+'</b>, but that is not in this guide.','About <b>'+esc(f)+'</b>: that is outside this guide.','Good question about <b>'+esc(f)+'</b>, but it is outside what I know.']):pick('q0',['I could not find the subject of that question.','I am not sure what that is about.']);
    L=[o1,'I only hold Buriedbornes 2 data and I do not look things up online, so I will not guess.'];
    L.push(f?pick('q2',['What made you think of <b>'+esc(f)+'</b>?','What is your own take on <b>'+esc(f)+'</b>?','Tell me what you think about <b>'+esc(f)+'</b>, I am listening.']):'Try asking again with the name of what you mean.');
    if(f)ask='tellmore';chips=CH;back();break;}
  case 'gamemiss':{kindLabel='guide question I could not match';L=[pick('gm',['This sounds like a guide question, but I could not match it to an entry.','I think you are asking about the game, but nothing in the guide matched well.','That looks like a guide question I could not pin down.']),(f?'What I caught: <b>'+esc(f)+'</b>. ':'')+'Try naming the item, skill or stat and what you want to know, like \u201cHow does parry work?\u201d.'];chips=CH;break;}
  default:{kindLabel='something outside the guide';var pdg=pending()==='tellmore';
    L=[(pdg?pick('tk',['Thanks for telling me.','Got it, thanks for explaining.']):pick('st',['I hear you.','Okay, I see.','Got it.']))+(f?' So this is about <b>'+esc(f)+'</b>.':''),
       f?'That is outside the guide, so I cannot add facts about it, but I am happy to chat.':'That did not give me much to work with, but I am listening.',
       f?pick('s3',['What about <b>'+esc(f)+'</b> is on your mind?','How did <b>'+esc(f)+'</b> come up?','Tell me more about <b>'+esc(f)+'</b>.']):'Say a bit more, or ask me something about the game.'];
    if(f)ask='tellmore';chips=f?null:CH;back();}
  }
  var showN=(act!=='botq'&&nm.length)?nm:[],nmLine=showN.length?line('I spotted '+(showN.length>1?'these entries':'this entry')+' in the guide, tap to look '+(showN.length>1?'one':'it')+' up:'):'';
  var fold='<details class="qa-more qa-fold" data-debug="1"><summary>What I picked up</summary>'+line(lab('Kind of message')+esc(kindLabel))+line(lab('Words I picked up')+(A.words.length?esc(A.words.join(', ')):'none'))+(A.allNames.length?line(lab('Guide names found')+esc(A.allNames.map(function(x){return x.n;}).join(', '))):'')+line('These replies are hand-written and fill in your own words. They run offline, look nothing up online and add no game facts.')+'</details>';
  var html='<div class="qa-card" data-ft="1">'+L.map(function(x,i){return line((i===0?tag:'')+x);}).join('')+nmLine+chipsHtml(chips,showN)+fold+'</div>';
  return {act:act,kind:kindLabel,html:html,ask:ask,focus:f,words:A.words,names:A.allNames.map(function(x){return x.n;}),text:L.join(' ').replace(/<[^>]+>/g,'')};}
/* ---------------- when to talk: only when the Ask box could not answer ---------------- */
var CHATACT={like:1,mood:1,hard:1,statement:1,question:1,botq:1,compl:1,insult:1,howru:1,joke:1,laugh:1,idk:1,same:1};
/* an answer card exists, but is it clearly not about what was said? (every content word is unknown to the guide, no game words, no guide names, chat-type sentence) */
function looseMatch(q){if(typeof W.__qaKnown!=='function')return false;var A=analyse(q);
  if(!A.words.length||A.gameish||A.allNames.length||!CHATACT[actOf(A)])return false;
  for(var i=0;i<A.words.length;i++){try{if(W.__qaKnown(A.words[i])||(out.querySelector('[data-doc]')&&/^(cards?|images?|pictures?|pics?|photos?|screenshots?|samples?|artwork|tooltips?|entry|entries|descriptions?|pages?|text|info|information|data|details?)$/.test(A.words[i])))return false;}catch(e){return false;}}return true;}
var busy=false;
function check(){if(busy||out.querySelector('[data-ft]'))return;
  var q=(inp.value||'').trim()||String(QA.state.orig||'').trim();if(!q)return;
  if(out.querySelector('[data-bare],[data-keep]'))return;
  var txt=out.textContent||'',menu=/Tell me a bit more/.test(txt)||/I couldn.t match/.test(txt),oc=null,loose=false;
  [].forEach.call(out.querySelectorAll('[data-intent] .qa-title'),function(t){if(/^Outside this guide/.test(t.textContent))oc=t.closest('[data-intent]');});
  var real=[].some.call(out.querySelectorAll('.qa-title'),function(t){return !/Tell me a bit more|Outside this guide|What I understood|I couldn.t match/.test(t.textContent);});
  if(!menu&&!oc){if(!real||out.querySelector('[data-intent]')||out.querySelector('[data-aw]')){if(real)T.ask='';return;}/* v70: a 'Built for: ...' card means the guide found a goal in the words, so it is not 'probably not about this' */if([].some.call(out.querySelectorAll('.qa-title'),function(t){return /^Built for/.test(t.textContent);})){T.ask='';return;}if(!looseMatch(q)){T.ask='';return;}loose=true;}
  else if(real)return;
  busy=true;
  try{var r=reply(q),box=D.createElement('div');box.innerHTML=r.html;var card=box.firstChild;
    if(oc&&oc.parentNode===out&&!menu&&!loose){out.replaceChild(card,oc);}
    else{var nodes=[].slice.call(out.childNodes),rest=D.createElement('details');rest.className='qa-more qa-fold';/* v71: the guide's closest entries and goal buttons show under the chat reply (open fold); the 'probably not about this' fold stays closed */if(!loose)rest.open=true;rest.innerHTML='<summary>'+(loose?'Other matches in the guide (may not be what you meant)':'From the guide')+'</summary>';nodes.forEach(function(n){rest.appendChild(n);});out.appendChild(card);out.appendChild(rest);}
    T.turns.push({q:q,act:r.act,focus:r.focus,t:Date.now()});if(T.turns.length>8)T.turns.shift();T.n++;T.ask=r.ask||'';T.askAt=Date.now();
    try{if(typeof QA.record==='function')QA.record({card:card,topic:r.focus||'your last message',why:(loose?'The Ask box matched something else that was probably not about what you said, so I replied in chat instead of showing it.':'The Ask box found no matching guide entry, so I replied in chat instead.')+' I read your message as: '+r.kind+'. I only used your own words'+(r.words&&r.words.length?' ('+r.words.slice(0,6).join(', ')+')':'')+(r.names&&r.names.length?' and the guide names I spotted ('+r.names.slice(0,4).join(', ')+')':'')+' and added no game facts.'});}catch(x){}
  }catch(e){try{console.error('free talk',e);}catch(x){}}
  setTimeout(function(){busy=false;},0);}
QA.watch('free_talk',function(){check();});
W.__qaTalk={reply:reply,analyse:analyse,state:T,version:1};
})();
