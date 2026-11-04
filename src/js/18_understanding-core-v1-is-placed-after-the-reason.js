
/* ===== Understanding Core v1 is placed AFTER the Reasoning layer v8 script on purpose: it needs window.__qaReason and window.__qaStrat to exist,
   and it then wraps window.__qaPre so that it reads the typed question before Reason Core, the synonym/typo layer and the follow-up memory do.
   The Learning layers further down wrap __qaPre again, outside of it. ===== */
/* ===== Understanding Core v1 (understanding_core.js) =====
   What it is: the part of the Ask box that works out what the person is SAYING, before the Reasoning layer
   (Reason Core, "Reasoning layer v8") works out what to ANSWER. It never looks at gear, skills or bosses to
   decide anything: it only reads language. Everything is offline, plain JavaScript, no data of its own about the game.

   What it reads
     - different ways of asking the same thing ("stop dying so fast", "I keep dyin", "make me beefy" all mean: survive)
     - synonyms, informal wording, simple slang and chat shorthand (idk, pls, wanna, dmg, cc, thicc ...)
     - small spelling mistakes ("somthing", "tankier", "healling", "weopon") and g-dropping ("dyin", "killin")
     - incomplete wording ("fire", "mage?", "tanky stuff")
     - several ideas in one sentence ("a tanky mage that can also heal and kill bosses fast")
     - what the person is trying to do (get gear, fix a problem, find where to farm, learn the basics, look something up)
     - conditions and limits ("armor only", "no weapons", "not 6 star", "7 star accessories", "skip skills")
     - direction: "bosses are too tanky" is a DAMAGE need, "bosses hit too hard" is a SURVIVE need,
       "kill bosses faster" is damage (not speed), "I keep getting poisoned" is about resisting, not poisoning.

   What it produces (window.__qaUnderstanding.last, or interpret(text)):
     { raw, text, corrections, intent{primary,secondary,goalShaped}, goals[{id,label,score,weight}], used[ids],
       avoid[ids], persona[], target{kind,names}, constraints{slot,exclude,star,excludeStar,stage,cheap},
       entities[], domain, flags{beginner,explain,more,farm}, confidence, canonical, summary, decision }
   The goal ids are the Reason Core concept ids (survive, heal, damage, burn, uses ...).

   How it plugs in (nothing existing is replaced):
     1. window.__qaPre is wrapped, and this wrapper is the outermost one, so it reads the typed question first.
        Whatever it does not take (follow-ups such as "armor only", "it" meaning the last thing discussed, plain lookups,
        synonym/typo repair) goes down the existing chain exactly as before.
     2. If the question is goal-shaped and Reason Core would read it wrongly or not at all, the question is
        restated in clear words ("gear for a damage build") and that restated question goes on to the Ask box.
        The page then shows its usual "Understood as: ..." line. Questions the engine's own strategies answer
        (compare, skill facts, runes, races/jobs/origins, "which skills grant burn") are never touched.
     3. Reason Core reads the structured interpretation through one small optional hook in its parse():
        window.__qaUnderstanding.applyTo(P, text). Without the hook everything still works from the restated text.
   Nothing here makes network calls. */
(function(){'use strict';
var W=(typeof window!=='undefined')?window:{};
var API={version:1,history:[]};Object.defineProperty(API,'last',{get:function(){return W.QA?W.QA.state.reading:null;},set:function(v){if(W.QA)W.QA.state.reading=v;},enumerable:true});
var busy=false;

/* ---------------------------------------------------------------- small helpers */
var HAS=Object.prototype.hasOwnProperty;
/* rules that read a sentence from the person's side (problems, enemy behaviour): plain keyword strategies in the engine misread these */
var FLIP={'passive-die':1,'killed-by':1,'keep-dying':1,'stop-dying':1,'die-fast':1,'take-damage':1,'less-damage-taken':1,'enemy-hits-hard':1,'hits-like-truck':1,'hp-melts':1,'squishy':1,
 'cannot-last':1,'me-die':1,'enemy-kills-me':1,'shot-me':1,'enemy-dies-fast':1,'make-enemy-die':1,'enemy-tanky':1,'enemy-much-hp':1,'take-forever':1,'hp-bar-stuck':1,
 'weak-hits':1,'low-damage':1,'cannot-kill':1,'keep-ailed':1,'ailment-killing-me':1,'self-slow':1,'not-squishy':1,'not-slow':1};
var KEYWORD={'void':1,burn:1,frost:1,shock:1,poison:1,bleed:1,explosion:1,dot:1,summon:1,holy:1,phys:1,magic:1,crit:1,evasion:1,block:1,ailment:1,loot:1,craft:1,heal:1,survive:1,
 'die-words':1,safe:1,resist:1,speed:1,casts:1,'damage-strong':1,'kill-leftover':1,'damage-weak':1,'hp-weak':1,'fast-weak':1,control:1,reflect:1,hiddenblade:1,lightbullet:1,'glass-cannon':1,
 'p-rogue':1,'p-archer':1,'p-brawler':1,'p-pyro':1,'p-cryo':1,'p-paladin':1,'p-mage':1,'p-healer':1,'p-support':1,'p-tank':1,'p-summoner':1,'p-dps':1};
var OVERRIDE=['boost','burst','skillrank','rank','search'];
function has(o,k){return HAS.call(o,k);}
function uniq(a){var o=[],s={};a.forEach(function(x){if(!has(s,x)){s[x]=1;o.push(x);}});return o;}
function dl(a,b,max){ /* Damerau-Levenshtein distance with a cut-off */
  var al=a.length,bl=b.length,i,j,c,d=[];
  if(Math.abs(al-bl)>max)return max+1;
  for(i=0;i<=al;i++){d[i]=[i];}
  for(j=1;j<=bl;j++)d[0][j]=j;
  for(i=1;i<=al;i++)for(j=1;j<=bl;j++){
    c=a.charAt(i-1)===b.charAt(j-1)?0:1;
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);
    if(i>1&&j>1&&a.charAt(i-1)===b.charAt(j-2)&&a.charAt(i-2)===b.charAt(j-1))d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
  }
  return d[al][bl];
}
function known(w){try{return !!(W.__qaKnown&&W.__qaKnown(w));}catch(e){return false;}}

/* ---------------------------------------------------------------- concepts (ids are Reason Core's) */
/* adj = a plain word Reason Core reads as that concept; label = how a person would say it */
var CON={
  survive:{adj:'durable',alt:['sturdy','defensive'],label:'staying alive'}, /* not "tanky"/"survival" + "build": the engine's own Lemegeton combo answer claims those words */
  heal:{adj:'healing',label:'healing and recovery'},
  stacks:{adj:'hp stack',label:'HP stacks'},
  phys:{adj:'physical',label:'physical damage'},
  magic:{adj:'magical',label:'magical damage'},
  void:{adj:'void',label:'void and curse damage'},
  burn:{adj:'burn',label:'burn (fire) damage'},
  frost:{adj:'frost',label:'frostbite (ice) damage'},
  shock:{adj:'lightning',label:'lightning damage'},
  poison:{adj:'poison',label:'poison'},
  bleed:{adj:'bleed',label:'bleed'},
  explosion:{adj:'explosive',label:'explosion damage'},
  hiddenblade:{adj:'hidden blade',label:'hidden blade damage'},
  lightbullet:{adj:'light bullet',label:'light bullets'},
  reflect:{adj:'reflect',label:'reflect and thorns'},
  crit:{adj:'crit',label:'critical hits'},
  speed:{adj:'fast',label:'speed and cooldowns'},
  uses:{adj:'skill uses',label:'skill uses'},
  summon:{adj:'minion',label:'summons and minions'},
  evasion:{adj:'evasive',label:'evasion and parrying'},
  ailment:{adj:'cleansing',label:'resisting status ailments'},
  dot:{adj:'dot',label:'damage over time'},
  loot:{adj:'loot',label:'loot and soulstones'},
  craft:{adj:'crafting',label:'crafting and mods'},
  holy:{adj:'holy',label:'prayer and holy power'},
  damage:{adj:'damage',label:'dealing more damage'},
  control:{adj:'control',label:'locking down enemies'}
};
var SLOTS=['weapon','armor','accessory','skill'];
var SLOTPL={weapon:'weapons',armor:'armor',accessory:'accessories',skill:'skills'};

/* ---------------------------------------------------------------- vocabulary for spelling repair */
var CORE=('survive survival tank tanky tankier tanking bulky bulk durable durability sturdy tough toughness beefy meaty immortal invincible invulnerable unkillable resilient defense defence defensive protection protect shield '
+'armor armour robe cloak helmet hat crown boots shoes ring amulet jewelry accessory accessories weapon sword staff wand gun dagger bow scepter spear cannon skill spell ability abilities technique '
+'die dying dies died dead death killed kill killing slain squishy fragile flimsy damage damaging harder hardest stronger strongest strong powerful offense offence attack burst nuke melt shred '
+'boss bosses enemy enemies monster opponent faster quicker quickly sooner speed speedy haste cooldown cooldowns turn turns action actions extra '
+'heal healing healer regen regeneration recover recovery restore sustain lifesteal leech drain revive resurrect stack stacks lives physical melee strength brawler bruiser fighter berserker barbarian warrior '
+'magic magical mage caster sorcerer wizard arcane intelligence void curse cursed hex shadow burn burning fire fiery flame flames ignite scorch ice icy cold frost frostbite freeze freezing chill lightning electric electrified shock thunder voltage storm '
+'poison poisoned venom toxic plague bleed bleeding blood explosion explosive explode bomb blast grenade dynamite summon summoner summoning minion pet familiar companion necromancer golem undead '
+'evasion evasive evade dodge dodging agile parry block deflect riposte ailment debuff immune immunity cleanse cure purify status stun stunned slow bind petrify paralyze control crowd '
+'critical crit sniper sniping lucky thorns thorny reflect retaliation counter revenge loot looting soulstone money gold coins currency rich wealth treasure rarity craft crafting forge upgrade enchant socket '
+'holy prayer pray divine sacred blessing angel uses casts refill replenish conserve spam remaining beginner newbie noob starter early rookie '
+'recommend recommendation suggest best better good great build gear equipment item stuff something anything everything help need looking trying '
+'star stars rarity highest lowest only without except exclude nothing weaker weakest dungeon disaster conquest hidden blade bullet light '
+'about where which should what farm drops drop obtain compare versus explain cheap early late endgame damage output hits hitting health points vitality '
+'accuracy resistance resist resists reduce reduces reduction increase increases improve upgrade progress progressing level levels paladin necro rogue assassin archer pyro ninja').split(' ');
var COMMON=('about above after again against all also always and another any anything are around ask asking at back because been before being best better between big both but can could did does doing done down '
+'each enough even ever every few find first for from game gear get gets getting give given going good got great had has have having help her here him his how into its just keep know last least less let like little long look '
+'made make makes many may maybe more most much must need never new next not now off often once one only other our out over own people play played player playing please pretty put really right run said same say see seem '
+'should show since small some something soon still such sure take than that the their them then there these they thing think this those though through time too try under until use used using very want was way well were what when '
+'where whether which while who why will with without would year yes yet you your tell please thanks thank hello what whats which stuff item items boss bosses dungeon dungeons floor floors level levels hard harder easy easier '
+'quick quickly slow slowly fast faster fastest side bit lot lots kind sort type types name names start started starting begin began today tonight wanted wants wanting trying tried tries going gonna wanna should shouldnt wouldnt couldnt '
+'before after during among each either neither whole entire single double triple several multiple another others itself myself yourself theirs mine ours yours character class race job origin contract rune runes union').split(' ');
var LEX={},LEXBY={},COMMONSET={};
COMMON.forEach(function(w){COMMONSET[w]=1;});
function addWord(w){if(w.length<4||LEX[w])return;LEX[w]=1;(LEXBY[w.charAt(0)]=LEXBY[w.charAt(0)]||[]).push(w);}
CORE.forEach(function(w){
  addWord(w);addWord(w+'s');addWord(w+'es');
  if(/e$/.test(w)){addWord(w+'d');addWord(w.slice(0,-1)+'ing');addWord(w+'r');addWord(w+'st');}
  else if(/y$/.test(w)){addWord(w.slice(0,-1)+'ier');addWord(w.slice(0,-1)+'iest');addWord(w.slice(0,-1)+'ies');addWord(w.slice(0,-1)+'ied');}
  else{addWord(w+'ed');addWord(w+'ing');addWord(w+'er');addWord(w+'est');addWord(w+'y');}
});

/* chat shorthand and slang: whole-word replacements (empty string = filler that carries no meaning) */
var SLANG={dyin:'dying',dieing:'dying',dyng:'dying',ded:'dead',deadd:'dead',killin:'killing',healin:'healing',tankin:'tanking',burnin:'burning',
 pls:'please',plz:'please',plss:'please',pleez:'please',thx:'thanks',thanx:'thanks',ty:'thanks',u:'you',ur:'your',r:'are',ya:'you',yall:'you all',
 wanna:'want to',gonna:'going to',gotta:'got to',lemme:'let me',gimme:'give me',dunno:'do not know',idk:'i do not know',imo:'in my opinion',imho:'in my opinion',
 tbh:'',ngl:'',lol:'',lmao:'',haha:'',hehe:'',bruh:'',yo:'',hey:'',hi:'',hello:'',um:'',uh:'',umm:'',hmm:'',hmmm:'',ok:'',okay:'',lowkey:'',kinda:'',sorta:'',literally:'',basically:'',
 abt:'about',bc:'because',cuz:'because',cus:'because',cos:'because',coz:'because',tho:'though',thru:'through',bout:'about',rn:'right now',fr:'',nvm:'never mind',
 gud:'good',gd:'good',bst:'best',bestest:'best',dmg:'damage',dmgs:'damage',cc:'crowd control',cd:'cooldown',cds:'cooldowns',op:'overpowered',
 wat:'what',wut:'what',wht:'what',hw:'how',whr:'where',wher:'where',sumthin:'something',somethin:'something',sth:'something',smth:'something',anythin:'anything',everythin:'everything',
 thicc:'tanky',thiccc:'tanky',chonky:'tanky',oneshot:'one shot',oneshotted:'one shotted',oneshots:'one shots',rekt:'wrecked',
 lifesteal:'life steal',pyro:'fire',hpstacks:'hp stacks',
 xp:'experience',outta:'out of',outa:'out of',lotta:'lot of',tryna:'trying to',lookin:'looking',gettin:'getting',keepin:'keeping',goin:'going',bis:'best',meta:'',pog:'',lmfao:'',wtf:'',omg:'',tf:'',smh:'',afaik:'',irl:'',asap:'',pov:'',noob:'noob'};
var BARE={dont:'do not',doesnt:'does not',didnt:'did not',cant:'can not',cannot:'can not',wont:'will not',isnt:'is not',arent:'are not',wasnt:'was not',werent:'were not',
 couldnt:'could not',shouldnt:'should not',wouldnt:'would not',havent:'have not',hasnt:'has not',im:'i am',ive:'i have',ill:'i will',youre:'you are',thats:'that is',
 whats:'what is',hows:'how is',wheres:'where is',whos:'who is',lets:'let us',theres:'there is',itll:'it will',id:'i would'};

/* ---------------------------------------------------------------- normalising */
var CONTR=[[/\bwon't\b/g,'will not'],[/\bcan't\b/g,'can not'],[/\bcannot\b/g,'can not'],[/\bain't\b/g,'is not'],[/n't\b/g,' not'],
 [/\bi'm\b/g,'i am'],[/'re\b/g,' are'],[/'ve\b/g,' have'],[/'ll\b/g,' will'],[/\bi'd\b/g,'i would'],[/'d\b/g,' would'],
 [/\b(what|how|where|that|it|who|there)'s\b/g,'$1 is'],[/\blet's\b/g,'let us']];
function normalize(raw){
  var s=String(raw==null?'':raw);
  try{s=s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'');}catch(e){}
  s=s.toLowerCase().replace(/[\u2018\u2019\u02bc`\u00b4]/g,"'");
  CONTR.forEach(function(c){s=s.replace(c[0],c[1]);});
  s=s.replace(/[\u2605\u2606\u272a\u2736]/g,' star ').replace(/(\d)\s*\*/g,'$1 star ');
  s=s.replace(/&/g,' and ').replace(/\+/g,' plus ').replace(/[\/\\]/g,' or ').replace(/[-_]/g,' ').replace(/'/g,'');
  s=s.replace(/[,;:.!?(){}\[\]"\n\r\t\u2026]+/g,' | ').replace(/[^a-z0-9| ]+/g,' ');
  s=s.replace(/([a-z])\1{2,}/g,'$1$1');
  s=s.replace(/[a-z0-9]+/g,function(w){if(has(BARE,w))return BARE[w];if(has(SLANG,w))return SLANG[w];return w;});
  return ' '+s.replace(/\s+/g,' ').trim()+' ';
}
function repair(s,fixes){
  return s.replace(/[a-z]+/g,function(w){
    var n=w.length;
    if(n<4||LEX[w]||COMMONSET[w])return w;
    if(known(w))return w;
    if(/in$/.test(w)&&LEX[w+'g']){fixes.push([w,w+'g']);return w+'g';}
    var pool=LEXBY[w.charAt(0)]||[],lim=n<=7?1:2,best=null,bd=9,i,c,d;
    for(i=0;i<pool.length;i++){
      c=pool[i];
      if(Math.abs(c.length-n)>lim)continue;
      d=dl(w,c,lim);
      if(d>lim)continue;
      if(n===4&&!((c.length===4&&w.split('').sort().join('')===c.split('').sort().join(''))||(c.length===5&&c.indexOf(w)===0)))continue; /* four-letter words: only swapped letters ("hael" for "heal") or one dropped letter at the end ("skil") */
      if(d<bd){bd=d;best=c;}
    }
    if(best&&best!==w){fixes.push([w,best]);return best;}
    return w;
  });
}

/* ---------------------------------------------------------------- evidence rules (phrases first, single words last) */
/* Every rule records evidence for one or more concepts and then blanks out the words it used, so a word is never counted twice.
   ev = [[concept, weight], ...]; tag = persona name or similar note */
var RULES=[];
function R(id,re,ev,tag,extra){var r={id:id,re:re,ev:ev,tag:tag||null};if(extra){for(var k in extra)if(has(extra,k))r[k]=extra[k];}RULES.push(r);}
var ENEMY='(?:bosses|boss|enemies|enemy|monsters?|mobs?|opponents?|foes?|dungeons?|disasters?|conquests?)';
var TGT='(?:(?:the|all|those|these|any|every|big|tough|hard|strong|final|late|end|dungeon|disaster|conquest|some|a|an|that|this)\\s+)*(?:bosses|boss|enemies|enemy|monsters?|mobs?|opponents?|foes?|them|it|things|stuff|everything|guys|baddies|adds|trash|dungeons?|disasters?|conquests?|floors?|stages?|runs?)';
var KILLV='(?:kill\\w*|slay\\w*|slaughter\\w*|beat\\w*|defeat\\w*|destroy\\w*|murder\\w*|delete\\w*|shred\\w*|melt\\w*|nuke\\w*|nuking|obliterat\\w*|annihilat\\w*|wreck\\w*|crush\\w*|smash\\w*|finish\\w*|clear\\w*|burn(?:ing|s|ed)? down|take(?:s|n|ing)? (?:down|out)|took (?:down|out)|bring(?:s|ing)? down|put(?:ting)? down|wipe(?:s|d)? out|eliminat\\w*|execut\\w*|dispatch\\w*|erase\\w*|vaporiz\\w*|disintegrat\\w*|one ?shot\\w*|burst(?:ing)? down|deal(?:ing)? with|handl\\w*|bully|bullying|farm(?:ing)? down)';
var ADVQ='(?:\\s+(?:much |way |a lot |lot |alot |so |even |far )?(?:faster|quicker|quickly|fast|sooner|easier|easily|more easily|in fewer turns|in less time|before they act|in one go))?';
var VICTIM='(?:i|me|we|my \\w+|my)';
var DIEW='(?:dying|dieing|dead|die|dies|death|killed|slain)';
var GETKILLED='getting (?:killed|wrecked|destroyed|crushed|melted|rekt|stomped|slaughtered|wiped\\w*|one ?shot\\w*|deleted|murdered|beaten|owned)';

/* phase 0: idioms that contain words which would otherwise be read as gear types */
R('glass-cannon',/\bglass cannons?\b/g,[['damage',3]],'glass cannon');
/* phase 1: the person's own survival problems */
R('passive-die',new RegExp('\\b(?:get|gets|got|getting|being|be|was|were|keeps? getting|keeps? being)\\s+(?:\\w+\\s+){0,1}?(?:one ?shot\\w*|killed|slain|destroyed|crushed|wrecked|wiped|melted|deleted|murdered|obliterated|annihilated|stomped|demolished|slaughtered|smashed|beaten|defeated|owned|dominated)(?:\\s+by\\s+(?:\\w+\\s+){0,3}?(?:'+ENEMY+'|everything|something|anything|them|it|stuff))?\\b','g'),[['survive',4]]);
R('killed-by',/\b(?:one ?shot(?:ted)?|killed|slain|destroyed|crushed|wrecked|wiped out|melted|deleted|murdered|obliterated|annihilated|stomped|demolished|slaughtered)\s+by\b/g,[['survive',4]]); /* "one shot by everything" (no "get" in front) is still the player being hit */
R('keep-dying',new RegExp('\\b(?:keeps?|kept|keeps? on|always|constantly|continually|forever|just|still|again and again|every time)\\s+(?:\\w+\\s+){0,2}?(?:dying|dieing|dead|dies|'+GETKILLED+')\\b','g'),[['survive',4]]);
R('stop-dying',new RegExp('\\b(?:stop|stopping|prevent|preventing|avoid|avoiding|reduce|reducing|less|fewer|not|never|can not|unable to|how (?:do|can|to) (?:i )?not)\\s+(?:\\w+\\s+){0,2}?(?:dying|die|dies|death|dead|getting killed|'+GETKILLED+')\\b','g'),[['survive',4]]);
R('die-fast',/\b(?:die|dies|dying|died|dead)\s+(?:\w+\s+){0,1}?(?:too |so |really |very |way |pretty |)\s*(?:fast|quick\w*|easily|early|soon|often|a lot|constantly|always|all the time|every (?:run|time|boss|fight)|in one hit|in (?:1|one|a few) hits?|in seconds|instantly|immediately|again and again|over and over|repeatedly)\b/g,[['survive',4]]);
R('take-damage',/\b(?:take|takes|taking|took|receive\w*|suffer\w*|eat|eating)\s+(?:\w+\s+){0,2}?(?:too much|so much|a lot of|lots of|way too much|massive|huge|heavy|big|tons of|loads of|crazy|insane|so many|too many)\s+(?:\w+\s+){0,1}?(?:damage|dmg|hits?|punishment)\b/g,[['survive',4]]);
R('less-damage-taken',/\b(?:(?:take|takes|taking)\s+(?:less|fewer|reduced|lower|no)\s+(?:damage|dmg|hits?)|(?:less|lower|reduc\w*|minimi[sz]\w*|cut|negat\w*|mitigat\w*|absorb\w*|soak\w*|withstand\w*|block\w*)\s+(?:the |incoming |all |enemy |boss |taken )*(?:damage|dmg|hits?)|damage (?:taken|received|reduction|mitigation)|incoming damage)\b/g,[['survive',4]]);
R('enemy-hits-hard',new RegExp('\\b(?:'+ENEMY+'|everything|they|it)\\s+(?:\\w+\\s+){0,2}?(?:hit|hits|hitting|attack|attacks|deal|deals|dealing|do|does|smack\\w*|punch\\w*)\\s+(?:\\w+\\s+){0,2}?(?:hard|harder|too hard|so hard|way too hard|like a truck|a lot|too much|so much|crazy|insane\\w*|massive\\w*|huge\\w*|heavy|heavily|brutal\\w*)\\b','g'),[['survive',4]]);
R('hits-like-truck',/\bhits? (?:me )?(?:\w+ ){0,1}?like a truck\b/g,[['survive',4]]);
R('hp-melts',/\b(?:hp|health|life)\s+(?:\w+\s+){0,2}?(?:melts?|drops?|disappears?|vanish\w*|evaporat\w*|gone|low|too low|so low|runs? out|depletes?|drains? fast|goes? down fast|bleeds? out|is not enough|too small|tiny|too little)\b/g,[['survive',4]]);
R('squishy',/\b(?:squishy|squishier|fragile|flimsy|paper thin|glass jaw|low hp|low health|tiny hp|too little hp)\b/g,[['survive',4]]);
R('cannot-last',/\b(?:can not|unable to|struggl\w* to|trouble|hard to|difficult to)\s+(?:\w+\s+){0,2}?(?:survive|last|live|stay alive|stay up|stand|hold|endure|withstand|outlast|make it)\b/g,[['survive',4]]);
R('survive-verb',/\b(?:surviv\w*|staying alive|stay alive|keep(?:ing)? alive|live longer|last longer|outlast\w*|stay(?:ing)? up longer)\b/g,[['survive',4]]);
R('me-die',new RegExp('\\b'+VICTIM+'\\s+(?:\\w+\\s+){0,2}?(?:die|dies|died|dying|dead|death)\\b','g'),[['survive',3]]);
R('not-squishy',/\b(?:not|never|no more|stop being|stop|less|do not be)\s+(?:so |too |that |very )?(?:squishy|fragile|flimsy|glassy)\b/g,[['survive',4]]);
R('not-slow',/\b(?:not|never|no more|stop being|stop|less)\s+(?:so |too |that |very )?slow\b/g,[['speed',4]]);
/* phase 2: how the person talks about enemies (the meaning flips) */
R('enemy-resists',new RegExp('\\b(?:'+ENEMY+')\\s+(?:\\w+\\s+){0,2}?(?:resist\\w*|immun\\w*|ignor\\w*|block\\w*|weak to|weakness\\w*)\\s+(?:to\\s+)?(?:\\w+\\s+){0,1}?\\w+\\b','g'),[]);
R('enemy-kills-me',new RegExp('\\b(?:'+ENEMY+'|everything|they|it|that)\\s+(?:\\w+\\s+){0,2}?(?:one ?shot\\w*|kill\\w*|destroy\\w*|wreck\\w*|crush\\w*|wipe\\w*|melt\\w*|delete\\w*|murder\\w*|obliterat\\w*|slaughter\\w*|stomp\\w*|demolish\\w*|beat\\w*|smash\\w*)\\s+(?:me|us|my \\w+)\\b','g'),[['survive',4]]);
R('shot-me',/\bone ?shot\w*\s+(?:me|us)\b/g,[['survive',4]]);
R('self-slow',/\b(?:i am|me|my \w+|skills?|cooldowns?|turns?|attacks?)\s+(?:\w+\s+){0,2}?(?:slow|sluggish|laggy|take too long|takes too long)\b/g,[['speed',4]]);
R('enemy-dies-fast',new RegExp('\\b(?:'+ENEMY+'|them|things)\\s+(?:\\w+\\s+){0,2}?(?:die|dies|dead|go down|fall|drop|melt\\w*|crumble\\w*)\\s+(?:\\w+\\s+){0,2}?(?:faster|quicker|quickly|fast|sooner|easier|easily|slow|slowly|too slow|so slow|late)\\b','g'),[['damage',4]],'target');
R('make-enemy-die',new RegExp('\\bmake\\s+(?:the\\s+|all\\s+)?(?:'+ENEMY+'|them|things)\\s+(?:\\w+\\s+){0,2}?(?:die|dead)\\b','g'),[['damage',4]],'target');
R('enemy-tanky',new RegExp('\\b'+ENEMY+'\\s+(?:\\w+\\s+){0,3}?(?:tanky|tankier|bulky|tough|tougher|durable|sturdy|beefy|hard to kill|impossible to kill|unkillable|invincible|immortal|never die|will not die|do not die|too strong)\\b','g'),[['damage',4]],'target');
R('enemy-much-hp',new RegExp('\\b'+ENEMY+'\\s+(?:\\w+\\s+){0,3}?(?:have|has|got|with)\\s+(?:so |too |way |much |a lot of |lots of |tons of |huge |big |massive |insane |crazy )+(?:hp|health|defen[cs]e)\\b','g'),[['damage',4]],'target');
R('take-forever',/\b(?:take|takes|taking|took)\s+(?:forever|too long|ages|so long|way too long|a long time|too many (?:hits|turns))(?:\s+to\s+(?:kill|beat|defeat|die|finish|clear))?\b/g,[['damage',4]],'target');
R('hp-bar-stuck',/\b(?:hp|health) bar\s+(?:\w+\s+){0,3}?(?:barely|hardly|not)\s+(?:moves?|budges?|drops?|goes? down|changes?)\b/g,[['damage',4]],'target');
R('weak-hits',/\b(?:my\s+)?(?:attacks?|hits?|damage|dmg|skills?)\s+(?:\w+\s+){0,2}?(?:tickles?|scratch\w*|do(?:es)? nothing|is weak|are weak|too weak|so weak|too low|so low|pathetic|useless|bad|trash|pitiful)\b/g,[['damage',4]]);
R('low-damage',/\b(?:low|weak|not enough|poor|little|bad|lacking)\s+(?:damage|dmg|dps|output|offen[cs]e|attack power|firepower)\b/g,[['damage',4]]);
R('cannot-kill',/\b(?:can not|unable to|struggl\w* to|trouble|hard to|difficult to|stuck on)\s+(?:\w+\s+){0,3}?(?:kill|beat|defeat|finish|clear|take down|get past)\w*\b/g,[['damage',3]],'target');
R('kill-target',new RegExp('\\b'+KILLV+'\\s+(?:\\w+\\s+){0,2}?'+TGT+ADVQ+'\\b','g'),[['damage',4]],'target');
/* phase 3: status ailments from the victim's side (burned, poisoned, stunned ...) */
R('keep-ailed',/\b(?:keeps?|always|constantly|continually|forever|often|get|gets|getting|got|being|been)\s+(?:\w+\s+){0,2}?(?:burn(?:ed|t|ing)|poisoned|poisoning|frozen|freezing|stunned|stunlocked|cursed|bleeding|bled|electrocuted|shocked|confused|paralyzed|paralysed|petrified|slowed|silenced|debuffed)\b/g,[['ailment',4],['survive',1.5]]);
R('ailment-hurting-me',/\b(?:burn|burning|burns|poison|poisons|poisoning|stun|stuns|curse|curses|bleed|bleeding|freeze|freezing|fire|ice|status|ailments?|debuffs?)\s+(?:keeps? )?(?:killing|wrecking|ruining|destroying|hurting|melting|screwing|messing|beating|ending|murdering)\s+(?:me|us|my \w+)\b/g,[['ailment',4],['survive',2]]);
R('resist-ailment',/\b(?:resist\w*|immun\w*|protect\w*|cleans\w*|cure\w*|purif\w*|remov\w*|ignor\w*|negat\w*|avoid\w*|dodg\w*|block\w*|stop\w*|prevent\w*|get rid of|survive)\s+(?:\w+\s+){0,2}?(?:ailments?|status(?:es)?(?: effects?)?|debuffs?|burn\w*|poison\w*|stun\w*|curses?|freez\w*|frost\w*|bleed\w*|shock\w*|fire|confusion|paralysis)\b/g,[['ailment',4]]);
R('ailment-killing-me',/\b(?:burn|burning|poison|stun|curse|bleed|bleeding|freeze|fire|ice|status|ailments?|debuffs?)\s+(?:\w+\s+){0,1}?(?:is|are|keeps?|keeps on)\s+(?:\w+\s+){0,1}?(?:killing|wrecking|ruining|destroying|hurting|melting|screwing|messing|beating)\b/g,[['ailment',4],['survive',2]]);
/* phase 4: other whole-phrase ideas */
R('uses-idiom',/\b(?:run(?:s|ning)? out of (?:\w+ ){0,2}?(?:uses?|casts?|skills?|spells?|charges?|ammo|mana|stamina)|out of (?:\w+ ){0,2}?(?:uses?|casts?|skills?|charges?|ammo|mana|stamina)|(?:uses|casts|skills|charges|mana|stamina|ammo)\s+(?:\w+\s+){0,2}?(?:run|runs|ran|go|goes|went)\s+(?:out|dry|empty|low)|(?:not enough|low|few|limited|no more|zero|too few|so few|little)\s+(?:skill )?(?:uses|casts|charges|mana|stamina|ammo)|(?:skill |remaining |max(?:imum)? |more |extra |refill |restock |replenish |conserve )+(?:uses|casts|charges)|uses (?:left|remaining)|remaining uses|(?:cast|use)\s+(?:\w+\s+){0,2}?(?:skills?|spells?)\s+(?:more|again|repeatedly|constantly|nonstop|non stop|endlessly|infinitely|all the time|a lot)|infinite (?:skills?|uses|casts)|unlimited (?:skills?|uses|casts)|conserv\w*|refill\w*|replenish\w*|restock\w*|more casts?|spam\w*)\b/g,[['uses',4]]);
R('act-first',/\b(?:(?:act|attack|move|go|strike|hit|play|cast)\s+(?:first|before (?:them|the enemy|enemies|bosses|everyone))|first strike|first move|extra (?:turns?|actions?|moves?)|additional (?:turns?|actions?)|(?:more|double|multiple) (?:turns?|actions?)|take (?:two|2|more) turns|turn order|preempt\w*|initiative)\b/g,[['speed',4]]);
R('cooldown-fast',/\b(?:(?:skills?|spells?|abilit\w+|cooldowns?|cds?)\s+(?:\w+\s+){0,3}?(?:cool ?down|recharg\w*|reset\w*|ready|available|come back|refresh\w*)\s+(?:\w+\s+){0,1}?(?:faster|quicker|sooner|quickly)|(?:reduc\w*|less|lower|shorter|cut|shorten\w*|instant|fewer)\s+(?:the )?(?:cool ?downs?|cds?)|(?:cool ?downs?|cds?)\s+(?:\w+\s+){0,3}?(?:too long|so long|forever|too slow|long|annoying)|(?:faster|quicker)\s+(?:skills?|spells?|casting|cooldowns?|attacks?|actions?|turns?|recharge|movement|moves?|speed)|(?:attack|cast|move|action|turn) speed|speed up)\b/g,[['speed',4]]);
R('heal-hp',/\b(?:(?:get|got|getting|restor\w*|regain\w*|recover\w*|replenish\w*|refill\w*)\s+(?:my |our |the |some |more )*(?:hp|health|life)(?: back)?|(?:hp|health|life)\s+(?:regen\w*|recover\w*|restor\w*|regain\w*|sustain\w*))\b/g,[['heal',4]]);
R('hp-stacks',/\b(?:(?:hp|health|life)\s+stacks?|stacks?\s+of\s+(?:hp|health|life)|extra\s+(?:lives|life|chances?)|second\s+(?:wind|chance|life)|another\s+chance|come ?back|revive\w*|resurrect\w*|phoenix|extra stacks?|more stacks?|stack refill|refill (?:my )?stacks?|lives)\b/g,[['stacks',4]]);
R('avoid-hits',/\b(?:(?:avoid\w*|dodg\w*|evad\w*|sidestep\w*|miss\w*)\s+(?:\w+\s+){0,2}?(?:hits?|attacks?|damage|blows?)|(?:not|never|stop|without)\s+(?:getting|get|being|be|taking|take)\s+hit|enem\w+ miss\w*|miss me|never get hit|untouch\w*)\b/g,[['evasion',4],['survive',1.5]]);
R('reflect',/\b(?:thorn\w*|reflect\w*|retaliat\w*|counter\w*|revenge|spik\w*|(?:return|send|throw|bounce)\w*\s+(?:\w+\s+){0,2}?(?:damage|hits?)\s+back|hit (?:them|enemies) back|punish\w* (?:attackers|enemies)|damage back)\b/g,[['reflect',4]]);
R('control',/\b(?:stuns?|stunn\w*|slow\w*|bind\w*|lock ?down|crowd control|disabl\w*|petrif\w*|paraly\w*|immobili\w*|control\w*|root\w*|silenc\w*|interrupt\w*|pin(?:ning)? down|skip (?:their|enemy) turns?|keep (?:them|enemies|bosses) from (?:acting|attacking))\b/g,[['control',3.5]]);
/* phase 5: persona words and element / type words */
R('fast-and',/\b(?:fast|faster|quick|quicker|speedy)(?=\s+(?:and|but|plus)\s+\w)|\b(?:and|but|plus)\s+(?:fast|faster|quick|quicker|speedy)\b/g,[['speed',3]]);
R('p-rogue',/\b(?:rogues?|assassins?|ninjas?|thieves|thief|stealth\w*|backstab\w*|shadow ?blades?)\b/g,[['crit',3],['evasion',2],['hiddenblade',1]],'rogue');
R('p-archer',/\b(?:archers?|snipers?|marksm[ae]n|rangers?|gunners?|gunslingers?|sharpshooters?)\b/g,[['crit',3],['phys',2]],'archer');
R('p-brawler',/\b(?:brawlers?|bruisers?|berserkers?|barbarians?|fighters?|warriors?|melee|swordsm[ae]n|samurai|monks?|knights?)\b/g,[['phys',3]],'brawler');
R('p-pyro',/\b(?:pyromancers?|fire mages?|flame mages?)\b/g,[['burn',3],['magic',2]],'pyromancer');
R('p-cryo',/\b(?:cryomancers?|ice mages?|frost mages?)\b/g,[['frost',3],['magic',2]],'cryomancer');
R('p-paladin',/\b(?:paladins?|crusaders?|templars?)\b/g,[['holy',3],['survive',2]],'paladin');
R('p-mage',/\b(?:mages?|casters?|sorcer\w+|wizards?|warlocks?|witch\w*|spell ?casters?|magicians?)\b/g,[['magic',3]],'mage');
R('p-healer',/\b(?:healers?|medics?|clerics?|priests?|priestess|white mages?)\b/g,[['heal',3],['holy',1]],'healer');
R('p-support',/\bsupport\b/g,[['heal',1.5]],'support');
R('p-tank',/\b(?:tanks?|tanky|tankier|tankiest|tanking|guardians?|bodyguards?|defenders?)\b/g,[['survive',3.5]],'tank');
R('p-summoner',/\b(?:summoners?|necromancers?|necros?|beast ?masters?|minion masters?|puppeteers?)\b/g,[['summon',3]],'summoner');
R('p-dps',/\b(?:dps|damage dealers?)\b/g,[['damage',3]],'dps');
R('hiddenblade',/\b(?:hidden blades?|stealth blades?|sneak attacks?)\b/g,[['hiddenblade',4]]);
R('lightbullet',/\b(?:light bullets?|holy bullets?|magic bullets?)\b/g,[['lightbullet',4]]);
R('void',/\b(?:void|curses?|cursed|cursing|hex\w*|dark magic|shadow\w*|insan\w*|madness|necrotic|eldritch|abyss\w*)\b/g,[['void',3]]);
R('burn',/\b(?:burn\w*|fire|fiery|flames?|flaming|ignit\w*|scorch\w*|incinerat\w*|pyro\w*|inferno|blaze|lava|magma|molten|embers?|on fire|heat)\b/g,[['burn',3]]);
R('frost',/\b(?:frost\w*|ice|icy|cold|freez\w*|chill\w*|snow\w*|blizzard|glacial|frozen|winter)\b/g,[['frost',3]]);
R('shock',/\b(?:lightning|electr\w*|shock\w*|thunder\w*|volt\w*|storm\w*|zap\w*|static|spark\w*)\b/g,[['shock',3]]);
R('poison',/\b(?:poison\w*|venom\w*|toxic\w*|toxin\w*|plague|spiders?|noxious)\b/g,[['poison',3]]);
R('bleed',/\b(?:bleed\w*|hemorrhag\w*|gore|blood\w*|bloody|lacerat\w*)\b/g,[['bleed',3]]);
R('explosion',/\b(?:explo\w*|bomb\w*|blast\w*|grenades?|dynamite|boom|detonat\w*|kaboom|tnt)\b/g,[['explosion',3]]);
R('dot',/\b(?:damage over time|dots|dot|over time|ailment damage|status damage|ticking|ticks?|tick damage|passive damage)\b/g,[['dot',3.5]]);
R('summon',/\b(?:summon\w*|minions?|pets?|familiars?|companions?|golems?|undead|servants?|horde|army|followers?|allies|helpers?|spawn\w*|conjur\w*)\b/g,[['summon',3]]);
R('holy',/\b(?:holy|pray\w*|piety|divine|sacred|saint\w*|angel\w*|blessing|bless\w*|smite|radiant)\b/g,[['holy',3]]);
R('phys',/\b(?:physical|phys|strength|slash\w*|smash\w*|punch\w*|brute|muscle\w*)\b/g,[['phys',3]]);
R('magic',/\b(?:magic\w*|arcane|intelligence|mystic\w*|spellcast\w*)\b/g,[['magic',3]]);
R('crit',/\b(?:crit\w*|snip\w*|lucky hits?|headshot\w*|precision|assassination)\b/g,[['crit',3]]);
R('evasion',/\b(?:evad\w*|evasi\w*|dodg\w*|agil\w*|parr(?:y|ies|ying|ied)|deflect\w*|riposte|elusive|nimble|acrobat\w*|slippery)\b/g,[['evasion',3]]);
R('block',/\bblock\w*\b/g,[['evasion',2]]);
R('ailment',/\b(?:ailments?|status effects?|statuses|status|debuffs?|immun\w*|cleans\w*|cure\w*|purif\w*|confus\w*)\b/g,[['ailment',3]]);
R('loot',/\b(?:loot\w*|soul ?stones?|money|gold|coins?|currency|rich|wealth\w*|greed\w*|treasure\w*|chests?|riches|rarity|rarer|rarest|drop rates?|better drops?|more drops?|broke|poor|cash|funds)\b/g,[['loot',3]]);
R('craft',/\b(?:craft\w*|forg\w*|mod board|mod points?|modification|rune slots?|sockets?|upgrad\w*|enchant\w*|reforg\w*|tinker\w*)\b/g,[['craft',3]]);
R('heal',/\b(?:heal(?!th)\w*|regen\w*|recuperat\w*|sustain\w*|life ?steal\w*|life steal|leech\w*|vampir\w*|drain\w* (?:life|hp|health)|mend\w*|bandage\w*|self ?heal\w*|restor\w*|recover\w*)\b/g,[['heal',3]]);
R('survive',/\b(?:tank\w*|bulk\w*|durab\w*|sturd\w*|tough\w*|beefy|meaty|chunk\w*|chonk\w*|unkillable|immortal\w*|invincib\w*|invulnerab\w*|indestructib\w*|resilien\w*|hardy|robust|defen[cs]\w*|protect\w*|shield\w*|damage reduction|health pool|hp pool|max hp|hit points|hitpoints|more hp|extra hp|more health|big hp|high hp|vitality|sponge|survivab\w*|fortif\w*|ironclad|guts|sanctuary|barrier|plating)\b/g,[['survive',3]]);
R('die-words',/\b(?:die|dies|died|dying|dead|death|killed|slain)\b/g,[['survive',3]]);
R('safe',/\b(?:safe\w*|safer|safety)\b/g,[['survive',2]]);
R('resist',/\b(?:resist\w*)\b/g,[['survive',2]]);
R('speed',/\b(?:haste\w*|speedy|tempo|rapid\w*|swift\w*|cooldowns?|cool downs?|cds?|quicken\w*)\b/g,[['speed',3]]);
R('casts',/\b(?:casts?|charges|mana|stamina|ammo)\b/g,[['uses',2]]);
R('damage-strong',/\b(?:hit(?:s|ting)? hard\w*|hit(?:s|ting)? harder|hits? more|hurt\w* more|deal\w* more|more damage|more dmg|extra damage|high damage|big damage|massive damage|big hits?|burst\w*|nukes?|nuking|one ?shot\w*|powerful|offen[cs]\w*|attack power|damage output|firepower|output|kill power|killing power|overpowered|strong attacks?|stronger attacks?|stronger hits?|punch harder|brute force|raw power|damage dealing)\b/g,[['damage',4]]);
R('kill-leftover',/\b(?:kill\w*|slay\w*|defeat\w*|destroy\w*|obliterat\w*)\b/g,[['damage',2.5]]);
R('damage-weak',/\b(?:damage|dmg|strong\w*|power\w*|attack\w*|hits?)\b/g,[['damage',1]]);
R('hp-weak',/\b(?:hp|health)\b/g,[['survive',1]]);
R('fast-weak',/\b(?:fast|faster|fastest|quick|quicker|quickest|quickly|speed)\b/g,[['speed',1]]);

/* ---------------------------------------------------------------- slots, stars, stage, negation */
var SLOTW={
  weapon:'weapons?|swords?|greatswords?|staffs?|staves|wands?|guns?|daggers?|bows?|scepters?|spears?|cannons?|axes?|hammers?|rods?|firearms?',
  armor:'armou?rs?|robes?|clothes|clothing|outfits?|costumes?|suits?|coats?|dress(?:es)?|vests?|plate|chestplates?|body gear',
  accessory:'accessor(?:y|ies)|helm(?:et|ets)?|hats?|crowns?|shoes|boots?|rings?|amulets?|jewel(?:ry|s)?|trinkets?|charms?|necklaces?|cloaks?|masks?|gloves?|belts?|bracelets?|pendants?|talismans?',
  skill:'skills?|spells?|techniques?|abilities'
};
var SLOTRE={};SLOTS.forEach(function(k){SLOTRE[k]=new RegExp('\\b(?:'+SLOTW[k]+')\\b','g');});
var NEG='(?:no|not|without|except|excluding|exclude|skip|ignore|forget|minus|other than|besides|instead of|rather than|never|do not care about|do not care for|do not need|do not want|no need for|not interested in|sick of|tired of|can do without)';
var NEGPRE=new RegExp('(?:^|\\s)'+NEG+'\\s+(?:(?:any|the|a|an|my|those|these|of|for|on|to|wear|use|equip|using|wearing|equipping|new|more|extra|other|all)\\s+){0,3}$');
var LISTJOIN=/^\s*(?:,|or|nor|and|\|)?\s*(?:or |nor |and |no |not |any |the |a |an )*$/;
var ONLYPRE=/(?:only|just|exclusively|purely|solely)\s+(?:\w+\s+){0,1}$/;
var ONLYPOST=/^\s+(?:only|please only|exclusively)\b/;
function findSlots(t){
  /* returns {include:[], exclude:[], only:bool, text: t with the slot words blanked} */
  var hits=[];
  SLOTS.forEach(function(k){var re=new RegExp(SLOTRE[k].source,'g'),m;while((m=re.exec(t))){hits.push({k:k,i:m.index,e:m.index+m[0].length});}});
  hits.sort(function(a,b){return a.i-b.i;});
  var inc=[],exc=[],only=false,prevNeg=false,prevEnd=-1,out=t;
  hits.forEach(function(h){
    var before=t.slice(0,h.i),seg=before.slice(before.lastIndexOf('|')+1);
    var neg=NEGPRE.test(seg);
    if(!neg&&prevNeg&&prevEnd>=0&&LISTJOIN.test(t.slice(prevEnd,h.i))&&!/\bbut\b/.test(t.slice(prevEnd,h.i)))neg=true;
    if(neg){if(exc.indexOf(h.k)<0)exc.push(h.k);}
    else{
      if(inc.indexOf(h.k)<0)inc.push(h.k);
      if(ONLYPRE.test(seg)||ONLYPOST.test(t.slice(h.e,h.e+16)))only=true;
    }
    prevNeg=neg;prevEnd=h.e;
  });
  hits.slice().reverse().forEach(function(h){out=out.slice(0,h.i)+new Array(h.e-h.i+1).join(' ')+out.slice(h.e);});
  return {include:inc,exclude:exc,only:only,text:out};
}
var NUMW={six:6,seven:7,'6':6,'7':7};
function findStars(t){
  var re=/\b(6|7|six|seven)\s*stars?\b|\bstars?\s*(6|7|six|seven)\b/g,m,inc=[],exc=[],out=t,spans=[];
  while((m=re.exec(t))){
    var v=NUMW[m[1]||m[2]],before=t.slice(0,m.index),seg=before.slice(before.lastIndexOf('|')+1);
    if(NEGPRE.test(seg)){if(exc.indexOf(v)<0)exc.push(v);}else if(inc.indexOf(v)<0)inc.push(v);
    spans.push([m.index,m.index+m[0].length]);
  }
  /* a bare list such as "6 or 7 star": the leading number is picked up too */
  var m2=t.match(/\b(6|7|six|seven)\s*(?:or|and|\/)\s*(6|7|six|seven)\s*stars?\b/);
  if(m2){[NUMW[m2[1]],NUMW[m2[2]]].forEach(function(v){if(inc.indexOf(v)<0)inc.push(v);});}
  if(/\b(?:highest|top|max(?:imum)?|best|rarest)\s+(?:rarity|stars?|tier)\b/.test(t)&&!inc.length&&!exc.length)inc.push(7);
  spans.reverse().forEach(function(s){out=out.slice(0,s[0])+new Array(s[1]-s[0]+1).join(' ')+out.slice(s[1]);});
  return {include:inc,exclude:exc,text:out};
}
/* negated ideas ("I do not care about healing", "no fire") are treated as things to leave out */
var NEGC=new RegExp('(?:^|\\s)(?:no need for|do not care about|do not care for|do not need|do not want|ignore|skip|forget|without|not interested in|sick of|tired of|minus|no)\\s+((?:(?:any|the|a|an|my|more|extra|much|really|that)\\s+)*[a-z]+(?:\\s+[a-z]+){0,1})','g');

/* ---------------------------------------------------------------- reading intent */
var RE_BEGIN=/\b(?:beginn\w*|new player|newbie|noob|rookie|starter|first run|early game|just started|just began|just installed|just downloaded|getting started|new to (?:the )?game|new here|brand new|never played|first time|where (?:do i |to |should i )?(?:start|begin)|how (?:do i |to |should i )?(?:start|begin)|what should i start|learning the game|help me start)\b/;
var RE_NEWSELF=/\b(?:i am|we are)\s+(?:\w+\s+){0,2}?(?:new|clueless|lost|confused|green|fresh)\b|\bnew\s+(?:and|but|so)\b|\bi am new\b/;
var RE_WHATDO=/\b(?:what (?:do|should|can) i (?:do|try|start with|begin with)(?: now| first| next)?|what now|where (?:do|should) i (?:start|begin|go)|what is next|what next)\b/;
var RE_RECO=/\b(?:(?:what|which)\s+(?:\w+\s+){0,2}?(?:should|do|can|would|will|might)\s+i\s+(?:\w+\s+){0,1}?(?:use|using|equip|wear|pick|get|run|take|bring|choose|buy|grab|go for|go with|try|slot|put on|build|need|want)|(?:what|which)\s+(?:is|are)\s+(?:the\s+)?(?:best|good|great|top|better|strongest|ideal|optimal|perfect)|best|better|good|great|top|strongest|ideal|optimal|recommend\w*|suggest\w*|advice|tips?|ideas?|options?|picks?|something (?:to|for|that|which|with)|anything (?:to|for|that|which|with)|stuff (?:to|for|that|which|with)|things? (?:to|for|that|which|with)|(?:gear|items?|equipment|skills?|armou?r|weapons?|accessor\w+) (?:to|for|that|which|with)|i (?:need|want|require|would like|am looking for|am trying to|am after)|looking for|builds?|help me|make me|give me|show me)\b/;
var RE_IMPROVE=/\b(?:how (?:do|can|should|would|to|could)(?: i| we| you)?|how come i|help|fix|stuck|struggl\w*|trouble|problem|keep losing|can not win|improve|get (?:stronger|better)|stronger|power up|progress\w*|level up|too weak)\b/;
var RE_LOCATE=/\b(?:where (?:do|can|should|to|would)\b|which (?:boss|bosses|dungeon|dungeons)|what (?:boss|bosses|dungeon|dungeons)|farm\w*|drops? (?:from|in)|who drops|come from|obtain|acquire|grind\w*)\b/;
var RE_EXPLAIN=/^\s*(?:why|how come|explain|can you explain|show your working|reasoning)\b/;
var RE_LOOKUP=/^\s*(?:(?:what|which) (?:is|are|does|do) (?!i\b|we\b|you\b|the best|best|good|better|a good|some good|the strongest|my best|a better)|tell me about|info on|information on|describe|define|meaning of|explain (?!why|how)|what does .{1,40} do\b)/;
var RE_SEARCH=/\b(?:which|what|any|list|show)\s+(?:me\s+)?(?:\w+\s+){0,2}?(?:skills?|gear|items?|weapons?|armou?rs?|accessor\w+|bosses|boss|dungeons?|races?|jobs?|origins?)\s+(?:\w+\s+){0,2}?(?:that |which |who )?(?:have|has|give|gives|grant|grants|apply|applies|inflict|inflicts|cause|causes|drop|drops|contain|contains|include|includes|with|without|resist|heal|heals|add|adds|reduce|reduces|increase|increases)\b/;
var RE_MORE=/\b(?:show more|more results|more options|more gear|show all|see more)\b/;
var RE_MULTIQ=/\?\s+\S|;\s*\S|\band also\b|\bthen\b|\band\s+(?:what|where|which|how|who|does|do|is|are|can|list|show|compare|tell)\b/;
var RE_CODEX=/\b(?:races?|jobs?|class(?:es)?|origins?|contracts?|unions?|runes?)\b/;
var RE_GEAR=/\b(?:gear|equipment|weapons?|armou?rs?|accessor\w+|skills?|spells?|items?|helm\w*|robes?)\b/;
var RE_REQWORD=/\b(?:stuff|things?|something|anything|gear|equipment|items?)\b/;
var RE_EARLY=/\b(?:early game|early|beginning|starter|starting out|low level|first (?:few )?(?:floors|runs|levels)|new player|noob|newbie)\b/;
var RE_CHEAP=/\b(?:cheap|budget|affordable|low cost|easy to get|easily available|common)\b/;
var RE_TARGET=/\b(bosses|boss|enemies|enemy|monsters?|mobs?|dungeons?|disasters?|conquests?)\b/;

/* ---------------------------------------------------------------- the interpretation */
function envEntities(raw){
  /* names of things in the guide (items, skills, bosses, races ...), found by the reasoning layer's own index */
  try{
    if(!(W.__qaReason&&W.__qaReason.parse))return [];
    busy=true;var P=W.__qaReason.parse(raw);
    return (P.ent||[]).map(function(e){return {name:e.name,kind:e.kind,z:e.z};});
  }catch(e){return [];}finally{busy=false;}
}
function scan(t,ev,personas,tags){
  RULES.forEach(function(r){
    r.re.lastIndex=0;
    t=t.replace(r.re,function(m){
      r.ev.forEach(function(e){ev.push({c:e[0],w:e[1],src:r.id,span:m.trim()});});
      if(r.tag){if(/^[a-z ]+$/.test(r.tag)&&r.id.charAt(0)==='p')personas.push(r.tag);else if(r.tag==='target')tags.push('target');else personas.push(r.tag);}
      return ' '+new Array(m.length).join(' ')+' ';
    });
  });
  return t;
}
function interpret(raw,opts){
  opts=opts||{};
  var u={raw:String(raw==null?'':raw),text:'',corrections:[],intent:{primary:'unknown',secondary:[],goalShaped:false},goals:[],used:[],avoid:[],persona:[],
    target:{kind:null,names:[]},constraints:{slot:null,exclude:[],star:null,excludeStar:null,stage:null,cheap:false},entities:[],domain:'any',
    flags:{beginner:false,explain:false,more:false,farm:false,fragment:false,multi:false,lookup:false,flipped:false,phrased:false},confidence:0,canonical:'',summary:'',decision:null};
  var n=normalize(u.raw);
  n=repair(n,u.corrections);
  u.text=n.replace(/\|/g,' ').replace(/\s+/g,' ').trim();
  var lower=u.raw.toLowerCase();

  /* things in the guide named in the question (kept out of the word reading, so a boss called "Pride" is not a feeling) */
  var ents=opts.entities||envEntities(u.raw);
  u.entities=ents.map(function(e){return {name:e.name,kind:e.kind};});
  var body=n;
  ents.slice().sort(function(a,b){return b.z.length-a.z.length;}).forEach(function(e){
    var zs=[' '+e.z+' ',' '+e.z+'s '];
    zs.forEach(function(z){var i;while((i=body.indexOf(z))>=0)body=body.slice(0,i)+' '+body.slice(i+z.length-1).replace(/^\s?/,'');});
  });
  var bossNames=ents.filter(function(e){return e.kind==='boss';}).map(function(e){return e.name;});
  if(bossNames.length){u.target.names=bossNames;u.target.kind='boss';}

  /* domain and flags that depend on the whole sentence */
  var hasCodex=RE_CODEX.test(n),hasGear=RE_GEAR.test(n);
  u.domain=hasCodex&&!hasGear?'codex':(/\b(?:skills?|spells?|techniques?|abilities)\b/.test(n)&&!/\b(?:gear|equipment|weapons?|armou?rs?|accessor\w+)\b/.test(n)?'skill':(hasGear?'gear':'any'));
  u.flags.multi=RE_MULTIQ.test(lower)&&splitCount(lower)>=2;
  u.flags.explain=RE_EXPLAIN.test(n);
  u.flags.more=RE_MORE.test(n);
  u.flags.farm=RE_LOCATE.test(n);

  /* ideas the person does not want ("I don't care about healing") */
  var avoidEv=[],am;
  NEGC.lastIndex=0;
  while((am=NEGC.exec(body))){
    var win=' '+am[1]+' ',tmp=[],pp=[],tg=[];
    scan(win,tmp,pp,tg);
    tmp.forEach(function(e){if(e.w>=2&&u.avoid.indexOf(e.c)<0)u.avoid.push(e.c);});
    if(tmp.length)body=body.replace(am[0],' ');
  }

  /* meaning */
  var ev=[],personas=[],tags=[];
  body=scan(body,ev,personas,tags);
  /* constraints: stars, then slots with their negations (read after the ideas, so "skill uses" is an idea and not a request for skills) */
  var st=findStars(body);body=st.text;
  var sl=findSlots(body);body=sl.text;
  var c=u.constraints;
  if(st.include.length===1&&st.exclude.indexOf(st.include[0])<0)c.star=st.include[0];
  else if(!st.include.length&&st.exclude.length===1)c.star=st.exclude[0]===6?7:6;
  if(st.exclude.length===1)c.excludeStar=st.exclude[0];
  var inc=sl.include.slice(),exc=sl.exclude.slice();
  if(inc.length===1)c.slot=inc[0];
  if(inc.length>=2&&inc.length<4)SLOTS.forEach(function(k){if(inc.indexOf(k)<0&&exc.indexOf(k)<0)exc.push(k);});
  if(c.slot&&exc.indexOf(c.slot)>=0)exc.splice(exc.indexOf(c.slot),1);
  c.exclude=exc;
  if(RE_EARLY.test(n))c.stage='early';
  if(RE_CHEAP.test(n))c.cheap=true;
  if(!u.target.kind){var tm=n.match(RE_TARGET);if(tm)u.target.kind=/boss/.test(tm[1])?'boss':(/dungeon/.test(tm[1])?'dungeon':(/disaster|conquest/.test(tm[1])?'boss':'enemy'));}

    u.persona=uniq(personas);
  if(tags.indexOf('target')>=0&&!u.target.kind)u.target.kind='enemy';
  var tot={},mx={},srcs={};
  ev.forEach(function(e){if(u.avoid.indexOf(e.c)>=0)return;tot[e.c]=(tot[e.c]||0)+e.w;mx[e.c]=Math.max(mx[e.c]||0,e.w);(srcs[e.c]=srcs[e.c]||[]).push(e.src);});
  var score={};Object.keys(tot).forEach(function(k){score[k]=mx[k]+0.4*(tot[k]-mx[k]);});
  var ranked=Object.keys(score).sort(function(a,b){return score[b]-score[a];});
  var top=ranked.length?score[ranked[0]]:0;
  u.goals=ranked.map(function(id){return {id:id,label:CON[id]?CON[id].label:id,score:Math.round(score[id]*100)/100,weight:Math.round(score[id]/top*100)/100,evidence:uniq(srcs[id])};});
  u.used=ranked.filter(function(id){return score[id]>=1.5&&score[id]>=top*0.5&&CON[id];}).slice(0,3);
  /* "I do not care about healing, just damage": once something is ruled out, the one idea left standing is the goal even if it was said in a single plain word */
  if(!u.used.length&&u.avoid.length&&ranked.length&&CON[ranked[0]]&&score[ranked[0]]>=1)u.used=[ranked[0]];
  u.flags.flipped=ev.some(function(e){return FLIP[e.src]&&e.w>=3&&u.used.indexOf(e.c)>=0;});
  /* "phrased": the goal came from a whole way of saying it ("run out of uses", "recover hp"), not just a keyword */
  u.flags.phrased=ev.some(function(e){return !KEYWORD[e.src]&&e.w>=3.5&&u.used.indexOf(e.c)>=0;});

  /* what the person is trying to do */
  var secondary=[],primary='unknown';
  var begin=RE_BEGIN.test(n)||RE_NEWSELF.test(n);
  var whatdo=RE_WHATDO.test(n);
  var reco=RE_RECO.test(n),improve=RE_IMPROVE.test(n),locate=u.flags.farm,lookup=RE_LOOKUP.test(n)&&!reco,search=RE_SEARCH.test(n)&&!/\bshould i\b|\bi need\b|\bi want\b|\brecommend|\bbest for\b/.test(n);
  var toks=n.replace(/\|/g,' ').trim().split(/\s+/).filter(Boolean);
  var gearWord=RE_GEAR.test(n)||RE_REQWORD.test(n)||sl.include.length>0;
  if(!reco&&u.used.length&&gearWord&&!lookup&&!search&&!locate)reco=true; /* "healing gear", "tanky armor" */
  var frag=toks.length<=4&&u.used.length>0&&!reco&&!improve&&!lookup&&!locate&&!u.flags.phrased;
  u.flags.fragment=frag;
  u.flags.lookup=lookup||(u.entities.length>0&&!u.used.length&&!reco);
  var newish=begin;
  if(newish)u.flags.beginner=true;
  if(newish)primary='beginner';
  else if(u.flags.explain&&!u.used.length&&!lookup)primary='explain';
  else if(search&&!improve)primary='search';
  else if(lookup&&!improve)primary='lookup';
  else if(locate&&!reco&&!improve)primary='locate';
  else if(reco)primary='recommend';
  else if(improve)primary='improve';
  else if(frag||u.persona.length&&u.used.length)primary='recommend';
  else if(u.used.length&&(u.persona.length||u.goals.length))primary='recommend';
  [['beginner',begin],['recommend',reco],['improve',improve],['locate',locate],['lookup',lookup],['explain',u.flags.explain],['search',search]].forEach(function(p){if(p[1]&&p[0]!==primary)secondary.push(p[0]);});
  if(u.entities.length>1&&/\b(?:compare|versus|vs|difference|differences|better than)\b/.test(n)){if(primary!=='compare')secondary.push('compare');}
  u.intent={primary:primary,secondary:uniq(secondary),goalShaped:(primary==='recommend'||primary==='improve'||primary==='locate'||primary==='beginner')};
  if(primary==='locate'&&!u.used.length)u.intent.goalShaped=false;

  /* confidence: how sure the reading of the goal is */
  var conf=top>=4?0.85:top>=3?0.75:top>=2?0.55:top>=1.5?0.45:0.2;
  if(!u.used.length)conf=begin?0.9:Math.min(conf,0.2);
  if(reco||improve)conf=Math.min(1,conf+0.1);
  if(frag)conf=Math.max(0.2,conf-0.15);
  if(u.avoid.length&&u.used.length&&conf<0.6)conf=0.6;
  if(primary==='lookup'||primary==='search'||primary==='explain')conf=Math.min(conf,0.3);
  u.confidence=Math.round(conf*100)/100;

  u.canonical=makeCanonical(u);
  u.summary=summarize(u);
  return u;
}
function splitCount(s){
  var ps=s.split(/\s*(?:\?+\s+|;\s*|\band also\b|\bthen\b|,?\s*\band\b\s+(?=(?:what|where|which|how|who|does|do|is|are|can|list|show|compare|tell)\b))/i).filter(function(x){return x&&x.replace(/[?\s]/g,'').length>2;});
  return ps.length;
}

/* ---------------------------------------------------------------- restating the question */
function hookReady(){return !!(W.__qaReason&&W.__qaReason.takesUnderstanding);}
function adjOf(id,variant){return (variant&&CON[id].alt&&CON[id].alt[variant-1])||CON[id].adj;}
function makeCanonical(u,variant){
  var c=u.constraints;
  if(u.flags.beginner&&!u.used.length)return 'what should a beginner start with';
  if(!u.used.length)return '';
  var head=c.slot?SLOTPL[c.slot]:'gear';
  if(c.star)head+=' '+c.star+' star';
  var s=head+' for a '+u.used.map(function(id){return adjOf(id,variant||0);}).join(' ')+' build';
  if(c.exclude.length&&hookReady())s+=', no '+c.exclude.map(function(k){return SLOTPL[k];}).join(' or no ');
  return s;
}
function summarize(u){
  var bits=[];
  if(u.flags.beginner&&!u.used.length)bits.push('a newer player asking where to start');
  if(u.used.length)bits.push('wants '+u.used.map(function(id){return CON[id].label;}).join(' + '));
  var c=u.constraints;
  if(c.slot)bits.push(SLOTPL[c.slot]+' only');
  if(c.exclude.length)bits.push('not '+c.exclude.map(function(k){return SLOTPL[k];}).join(' or '));
  if(c.star)bits.push(c.star+'\u2605');
  if(u.avoid.length)bits.push('does not care about '+u.avoid.map(function(id){return CON[id]?CON[id].label:id;}).join(', '));
  if(u.target.kind)bits.push('against '+(u.target.names.length?u.target.names.join(', '):u.target.kind+'s'));
  return bits.join('; ');
}

/* ---------------------------------------------------------------- checking against the existing system */
var VALID=null;
function validIds(){
  if(VALID)return VALID;
  VALID={};
  Object.keys(CON).forEach(function(id){VALID[id]=true;});
  try{
    if(W.__qaReason&&W.__qaReason.parse){
      busy=true;
      Object.keys(CON).forEach(function(id){
        var P=W.__qaReason.parse('gear for a '+CON[id].adj+' build');
        if(!P||!P.cs||P.cs.indexOf(id)<0)VALID[id]=false;
      });
    }
  }catch(e){}finally{busy=false;}
  return VALID;
}
function reasonReads(q){
  try{busy=true;return W.__qaReason.parse(q);}catch(e){return null;}finally{busy=false;}
}
function sameReading(P,u){
  if(!P)return false;
  var a=(P.cs||[]).slice().sort().join(','),b=u.used.slice().sort().join(',');
  if(a!==b)return false;
  if((P.slot||null)!==(u.constraints.slot||null))return false;
  if((P.star||null)!==(u.constraints.star||null))return false;
  if(u.constraints.exclude.length)return false;
  if(u.flags.beginner&&!P.begin)return false;
  return true;
}
function engineView(raw){
  var unm=false,res=null;
  try{var h=W.__qaAnswer?String(W.__qaAnswer(raw)):'';unm=/I couldn.t match/.test(h);}catch(e){unm=true;}
  try{res=(W.__qaStrat&&W.__qaStrat.detect)?W.__qaStrat.detect(raw,unm):null;}catch(e){res=null;}
  return {unm:unm,res:res};
}

/* ---------------------------------------------------------------- the registry that Reason Core's hook reads */
var REG={},REGN=[];
function register(q,u){
  if(!has(REG,q)){REGN.push(q);if(REGN.length>24)delete REG[REGN.shift()];}
  REG[q]=u;
}
API.lookup=function(q){return has(REG,String(q))?REG[String(q)]:null;};
/* called from Reason Core's parse(): only for a question this core restated */
API.applyTo=function(P,q){
  if(busy||!P)return;
  var u=API.lookup(q);if(!u||!u.apply)return;
  var a=u.apply;
  if(a.cs&&a.cs.length){P.cs=a.cs.slice();P.ranked=a.cs.slice();P.score={};a.cs.forEach(function(id){P.score[id]=a.score[id];});P.goal=true;}
  P.slot=a.slot||null;P.star=a.star||null;
  if(a.exclude&&a.exclude.length)P.exclude=a.exclude.slice();
  if(a.begin)P.begin=true;
};
function applyBlock(u){
  var sc={},top=u.goals.length?u.goals[0].score:1;
  u.used.forEach(function(id){var g=u.goals.filter(function(x){return x.id===id;})[0];sc[id]=Math.max(1.5,Math.round(3*(g?g.score:top)/top*100)/100);});
  return {cs:u.used.slice(),score:sc,slot:u.constraints.slot,star:u.constraints.star,exclude:u.constraints.exclude.slice(),begin:!!(u.flags.beginner&&!u.used.length)};
}

/* ---------------------------------------------------------------- deciding what goes on to the Ask box */
/* returns the text the Ask box should carry on with, or null to leave the question to the existing chain unchanged.
   raw back = "I understood this myself, Reason Core reads it the same way: do not let the older word-swapping change it";
   other text = the question restated in clear words. */
function decide(raw,real){
  if(has(REG,raw))return raw; /* already restated by this core: leave it alone */
  var u=interpret(raw);
  /* only what the person really typed is recorded: the Ask box also runs its own suggestions and the learning layers' test questions through __qaPre, and those must not overwrite .last */
  if(real!==false){API.last=u;API.history.push(u);if(API.history.length>40)API.history.shift();}
  var why=function(r){u.decision={rewrote:false,claimed:false,reason:r};return null;};
  if(!u.intent.goalShaped)return why('not a request for advice ('+u.intent.primary+')');
  if(u.domain==='codex')return why('about races, jobs, origins, contracts or runes: left to the engine');
  if(u.flags.multi)return why('several questions in one: left to the multi-part answer');
  if(!(u.used.length||u.flags.beginner))return why('no clear goal found');
  if(u.confidence<0.55&&!(u.flags.beginner&&!u.used.length))return why('not confident enough ('+u.confidence+')');
  var ok=validIds();
  u.used=u.used.filter(function(id){return ok[id];});
  if(!u.used.length&&!u.flags.beginner)return why('no usable goal');
  if(u.flags.beginner&&u.used.length)return why('newer player with a goal: Reason Core shows its getting-started card');
  u.canonical=makeCanonical(u);
  if(!u.canonical)return why('nothing to restate');
  var P=reasonReads(raw),eng=engineView(raw),strat=(eng.res&&eng.res.kind!=='reason')?eng.res.kind:null;
  /* one or two bare words ("fire", "mage?"): the existing chain shows its glossary or search card for those; step in only if it has nothing */
  var negated=u.avoid.length||u.constraints.exclude.length||u.constraints.excludeStar; /* "not 6 star, healing": the older chain reads a negation as the opposite, so a short fragment that says what it does NOT want is not left to it */
  if(u.flags.fragment&&!negated&&!(!eng.res&&eng.unm))return why('short fragment: left to the existing chain');
  if(strat){
    /* the engine has its own strategy for this wording; only step in where that strategy is known to misread
       (a problem told from the player's side, or something the person said they do NOT want) */
    var may=(u.flags.phrased||u.flags.flipped||u.avoid.length||(strat==='search'&&u.constraints.exclude.indexOf('skill')>=0))&&!u.entities.length&&OVERRIDE.indexOf(strat)>=0; /* a skills list answers "something that heals, skip skills" the wrong way round */
    if(!may)return why('answered by the engine\'s own strategy ('+strat+')');
  }else if(!eng.res&&!eng.unm){
    if(u.entities.length||u.flags.fragment||u.confidence<0.6)return why('the engine already has an answer for it');
  }else if(eng.res&&P&&sameReading(P,u)){
    u.decision={rewrote:false,claimed:true,reason:'Reason Core already reads it the same way'};
    return raw;
  }
  /* the restated sentence must reach Reason Core and not be claimed by one of the engine's other strategies */
  var okText=null,v,taken=null;
  for(v=0;v<=2&&!okText;v++){
    var cand=makeCanonical(u,v);
    if(v>0&&cand===makeCanonical(u,v-1))continue;
    var ev2=engineView(cand);
    if(ev2.res&&ev2.res.kind!=='reason'){taken=ev2.res.kind;continue;}
    okText=cand;
  }
  if(!okText)return why('the restated question would be taken by the engine\'s '+taken+' strategy');
  u.canonical=okText;
  if(!hookReady()){
    var chk=reasonReads(u.canonical);
    if(!chk||(chk.cs||[]).slice().sort().join(',')!==u.used.slice().sort().join(',')||u.constraints.exclude.length)return why('Reason Core would not read the restated question the same way');
  }
  u.apply=applyBlock(u);
  register(u.canonical,u);
  u.decision={rewrote:true,claimed:true,reason:'restated for Reason Core'};
  return u.canonical;
}
API.interpret=interpret;
API.decide=decide;
API.find=function(raw){for(var i=API.history.length-1;i>=0;i--)if(API.history[i].raw===raw)return API.history[i];return null;};
API.describe=function(text){var u=interpret(text);return u.summary||'(no goal found)';};
API.normalize=normalize;

/* ---------------------------------------------------------------- plugging into the Ask box */
function install(){
  if(!W.document||!W.document.getElementById||!W.document.getElementById('qaOut'))return;
  if(!(W.__qaReason&&W.__qaReason.parse)||!(W.__qaStrat&&W.__qaStrat.detect))return;
  var PRON=/\b(?:it|its|that one|this one|this item|that item|this boss|that boss)\b/i;
  W.QA.pre.add('understanding',40,function(P1){return function(raw){
    try{
      if(!String(raw||'').trim())return P1?P1(raw):raw;
      /* "what drops it?": the existing follow-up memory resolves "it" to the last thing discussed, so it goes first */
      if(PRON.test(raw)&&P1){var b0=P1(raw);if(b0!==raw)return b0;}
      var qi=W.document.getElementById('qaInput');
      var d=decide(raw,!qi||raw===qi.value);
      if(d!==null)return d;
    }catch(e){}
    /* not for this core to rewrite: the existing chain (follow-ups, "armor only", synonym repair) works exactly as before */
    return P1?P1(raw):raw;
  };});
}
W.__qaUnderstanding=API;
install();
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})();

