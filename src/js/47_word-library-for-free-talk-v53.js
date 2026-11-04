
/* ===== Word library for Free talk (v53) =====
   Offline, no LLM, no network. A hand-written lexicon (everyday topics + a small definitions list) that is read
   AFTER Free talk has built its card, so it only improves replies the Ask box could not answer. It adds no game facts,
   and it never touches __qaKnown (the typo fixers rely on that meaning "in the guide").
   v58 change: 'what does X do / work' and 'what is the best X' are NOT dictionary requests any more (Free talk's own reply stays);
   'what does X do' still shows a definition when X is in the list; the 'not in my word list' reply keeps the suggestion buttons.
   Grow it: __qaLex.addWords('food','taco burrito')  and  __qaLex.addDefs('term|meaning'+'\n'+'term2|meaning'). */
(function(){'use strict';
var W=window,D=document,out=D.getElementById('qaOut');
if(!out||!W.QA||typeof W.QA.watch!=='function'||W.__qaLex)return;
var QA=W.QA;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var R=0;function pick(a){return a[R++%a.length];}
/* key|label|words|follow-up 1|follow-up 2 */
var TOP=`food|food|food eat eating dinner lunch breakfast pizza burger pasta rice noodle ramen sushi cake cookie chocolate candy snack soup salad steak chicken cheese bread sandwich fries cook cooking recipe bake baking fruit apple banana coffee tea meal restaurant dessert|What is your favourite dish?|Do you cook it yourself or order it?
family|family|family mom dad mother father brother sister parents parent grandma grandpa cousin uncle aunt kid kids baby child children son daughter wife husband|How is your family doing?|Is there a family tradition you like?
social|friends and social life|friend friends buddy buddies party hangout dating crush boyfriend girlfriend partner relationship birthday wedding|How long have you known them?|What did you get up to together?
work|work|job office career salary shift meeting coworker colleague manager interview resume deadline company business|How is work going lately?|What part of it takes the most out of you?
school|school and study|school college university teacher homework exam study student lecture grade grades degree course essay assignment|What are you studying?|How are the deadlines looking?
weather|the weather|weather rain rainy snow snowy sunny storm wind windy cloudy fog summer winter spring autumn season temperature humid|What is it like where you are?|Do you like that kind of weather?
music|music|music song songs band singer guitar piano drum drums concert album playlist rap rock jazz pop melody lyrics violin|What have you been listening to?|Do you play anything yourself?
screen|shows and movies|movie movies film series anime manga cartoon netflix episode actor cinema trailer sitcom drama youtube video videos streaming|What are you watching at the moment?|Would you recommend it?
games|other games|minecraft fortnite zelda pokemon mario chess poker console playstation xbox nintendo steam esports gamer gaming roblox valorant skyrim|What do you like most about it?|Do you play it often?
sports|sports and fitness|football soccer basketball baseball tennis golf gym workout swimming boxing hockey cricket sport sports fitness yoga|Do you play or just watch?|Who do you support?
travel|travel|travel trip vacation holiday flight airport hotel beach mountain city country abroad passport camping hiking tour|Where is the trip?|What is the one thing you want to see?
pets|pets and animals|dog dogs cat cats puppy kitten pet pets bird fish hamster rabbit horse animal animals zoo|What is its name?|How long have you had it?
sleep|sleep|sleep nap bed dream dreams nightmare insomnia pillow|Are you getting enough rest?|Do you remember your dreams?
health|health|doctor hospital medicine pain injury dentist diet healthy vitamin vitamins checkup|I hope it is nothing serious. How are you coping?|Have you been able to see someone about it?
money|money|money rent bills price cheap expensive savings bank budget buying shopping sale broke debt paycheck wallet|Is it something you are saving for?|Was it worth the price?
tech|tech|phone computer laptop internet wifi app apps software coding programming website keyboard battery charger tablet|What do you use it for?|Is it giving you trouble?
books|books and writing|book books novel story stories reading author library poem poetry comic comics writing|What are you reading?|Who is your favourite author?
art|art and making things|art draw drawing paint painting sketch design photo photography camera craft crafts sculpture|What do you like to make?|How long have you been at it?
home|home|house home apartment room kitchen garden cleaning furniture neighbor neighbour|How is the place coming along?|What would you change about it?
road|cars and the road|car cars bike bicycle train bus driving traffic motorcycle|Do you drive much?|Where are you headed?
nature|nature, space and science|tree trees forest river ocean sea lake flower flowers moon sky space planet planets galaxy universe science physics chemistry maths biology history|What got you interested in it?|Do you read or watch much about it?`;
/* term|short general-English meaning (not from the guide) */
var DEFTXT=`serendipity|finding something good by chance, without looking for it.
ephemeral|lasting only a very short time.
nostalgia|a wistful longing for the past.
melancholy|a deep, lingering sadness, often with no clear cause.
resilience|the ability to recover quickly from setbacks.
procrastinate|to put off something you should be doing.
paradox|a statement or situation that seems self-contradictory but may still be true.
irony|an outcome opposite to what was expected, or words that mean the opposite of what is said.
empathy|the ability to understand and share another person's feelings.
sympathy|feeling sorrow for someone else's trouble.
ambiguous|open to more than one meaning.
ethics|principles about what is right and wrong.
democracy|a system of government in which people choose their leaders by voting.
inflation|a general rise in prices over time, so money buys less.
recession|a significant decline in economic activity lasting months or more.
budget|a plan for how much money you will earn and spend.
mortgage|a loan used to buy property, secured by that property.
interest|the cost of borrowing money, or what savings earn, as a percentage.
tax|money people and businesses pay to a government.
profit|money left after costs are taken from earnings.
gravity|the force that pulls objects with mass toward each other, like things falling to Earth.
photosynthesis|how plants use sunlight, water and carbon dioxide to make sugar and oxygen.
evolution|gradual change in living things over generations through natural selection.
algorithm|a step-by-step set of instructions for solving a problem.
internet|a global network of connected computers that share information.
wifi|wireless networking that connects devices to the internet.
software|programs and data that tell a computer what to do.
hardware|the physical parts of a computer.
metaphor|describing one thing as another to suggest likeness, like "time is a thief".
simile|a comparison using "like" or "as", like "brave as a lion".
entropy|a measure of disorder; in physics it tends to increase in a closed system.
atom|the basic unit of a chemical element.
molecule|two or more atoms bonded together.
cell|the basic unit of life; also a small room, as in a prison.
dna|the molecule that carries genetic instructions in living things.
vaccine|a medicine that trains the immune system to fight a specific disease.
antibiotic|a medicine that kills or stops bacteria; it does not work on viruses.
bacteria|single-celled microorganisms, some helpful and some harmful.
virus|a tiny infectious agent that can only multiply inside living cells.
oxygen|the gas in air that most living things need to breathe.
volcano|an opening in the Earth's crust where molten rock, ash and gas can erupt.
earthquake|shaking of the ground caused by movement of rock below the surface.
tsunami|a huge ocean wave, usually caused by an underwater earthquake or landslide.
hurricane|a large, powerful tropical storm with strong winds.
tornado|a rotating column of air that touches the ground.
galaxy|a huge system of stars, gas and dust held together by gravity.
planet|a large body that orbits a star.
comet|an icy body that grows a glowing tail near the Sun.
asteroid|a rocky body orbiting the Sun, smaller than a planet.
black hole|a region of space where gravity is so strong that not even light can escape.
equator|the imaginary line around Earth halfway between the poles.
continent|one of Earth's large landmasses.
peninsula|land almost surrounded by water.
island|land completely surrounded by water.
glacier|a large, slow-moving mass of ice.
ecosystem|a community of living things and the environment they interact with.
climate|the typical weather of a region over many years.
weather|the day-to-day state of the atmosphere, such as rain or sun.
hobby|an activity you do for enjoyment in your free time.
anxiety|worry or unease about something that might happen.
meditation|training attention or calm, often by focusing on the breath.
mindfulness|paying attention to the present moment without judging it.
introvert|a person who gains energy from time alone.
extrovert|a person who gains energy from being around others.
optimist|someone who expects good outcomes.
pessimist|someone who expects bad outcomes.
coincidence|events that happen together by chance but seem connected.
insomnia|trouble falling or staying asleep.
hibernation|a long, sleep-like winter state some animals enter to save energy.
caffeine|a stimulant found in coffee, tea and cocoa.
protein|a nutrient the body needs to build and repair tissue.
vitamin|a nutrient needed in small amounts to stay healthy.
calorie|a unit of energy in food.
recipe|a set of instructions for cooking a dish.
vegetarian|someone who does not eat meat.
vegan|someone who avoids all animal products.
sushi|a Japanese dish of vinegared rice with fish, vegetables or egg.
ramen|a Japanese noodle soup.
jazz|a music style from African American communities, known for improvisation.
symphony|a long piece of music for a full orchestra.
orchestra|a large group of musicians playing together.
novel|a long fictional story in book form.
poetry|writing that uses rhythm and condensed language to express ideas and feelings.
biography|a book about a real person's life.
documentary|a film that presents real events or facts.
anime|animation from Japan.
manga|comics from Japan.
marathon|a 42.195 km (26.2 mile) running race.
passport|an official document that identifies you when travelling abroad.
visa|official permission to enter or stay in a country.
souvenir|an item kept as a reminder of a place or trip.
philosophy|the study of basic questions about existence, knowledge and ethics.
psychology|the study of the mind and behaviour.
economics|the study of how people produce, trade and use resources.
biology|the study of living things.
chemistry|the study of matter and how substances change.
physics|the study of matter, energy and forces.
geometry|the branch of maths about shapes, sizes and space.
algebra|the branch of maths that uses letters for unknown numbers.
calculus|the branch of maths about change and accumulation.
probability|how likely something is to happen, from 0 to 1.
percentage|a number expressed as parts per hundred.
average|the sum of values divided by how many there are.
median|the middle value when numbers are sorted.
prime number|a number greater than 1 divisible only by 1 and itself.
pi|the ratio of a circle's circumference to its diameter, about 3.14159.
quantum|the smallest discrete amount of something; quantum physics studies very small particles.
robot|a machine that can carry out tasks automatically.
encryption|scrambling data so only someone with the key can read it.
password|a secret word or phrase used to prove your identity.
bug|a small insect, or a mistake in software that makes it misbehave.
cloud|a mass of water droplets in the sky; also computing services run on remote servers.
ai|short for artificial intelligence: computer systems doing tasks that normally need human intelligence.`;
var TOPICS=[],WT={},DEFS={};
function vars(w){var o=[w];if(w.length>3){if(/ies$/.test(w))o.push(w.slice(0,-3)+'y');if(/es$/.test(w))o.push(w.slice(0,-2));if(/s$/.test(w))o.push(w.slice(0,-1));if(/ing$/.test(w)){o.push(w.slice(0,-3));o.push(w.slice(0,-3)+'e');}if(/ed$/.test(w)){o.push(w.slice(0,-2));o.push(w.slice(0,-1));}}return o;}
function look(m,w){var v=vars(w);for(var i=0;i<v.length;i++)if(Object.prototype.hasOwnProperty.call(m,v[i]))return m[v[i]];return null;}
function addW(t,s){String(s).split(' ').forEach(function(w){if(w)WT[w]=t;});}
function addDefs(s){String(s).split('\n').forEach(function(l){var i=l.indexOf('|');if(i>0)DEFS[l.slice(0,i).trim().toLowerCase()]=l.slice(i+1).trim();});}
TOP.split('\n').forEach(function(l){var p=l.split('|');if(p.length<5)return;var t={k:p[0],label:p[1],qs:[p[3],p[4]],n:0};TOPICS.push(t);addW(t,p[2]);});
addDefs(DEFTXT);
function topicOf(ws){var hit={},best=null,bn=0,word='';ws.forEach(function(w){var t=look(WT,w);if(t){hit[t.k]=(hit[t.k]||0)+1;if(hit[t.k]>bn){bn=hit[t.k];best=t;word=w;}}});return best?{t:best,w:word}:null;}
var FN=false;
function termOf(p){FN=false;var s=p.replace(/\s+(mean|means|meaning)$/,''),m=/^(what is the (meaning|definition) of|what do you mean by|what is|what are|what does|whats|define|definition of|meaning of|explain|tell me about)\s+/.exec(s);if(!m)return '';s=s.slice(m[0].length).replace(/^(an?|the)\s+/,'');if(m[1]==='what does'&&/\s+(do|does|work|works)$/.test(s)){FN=true;s=s.replace(/\s+(do|does|work|works)$/,'');}if(s.split(' ').length>3)return '';if(s.indexOf(' ')>0&&(POS.test(s)||NEG.test(s)))return '';return s;}
function defOf(term){if(Object.prototype.hasOwnProperty.call(DEFS,term))return {k:term,d:DEFS[term]};var ws=term.split(' '),last=ws.pop(),v=vars(last);for(var i=1;i<v.length;i++){var k=ws.concat([v[i]]).join(' ');if(Object.prototype.hasOwnProperty.call(DEFS,k))return {k:k,d:DEFS[k]};}return null;}
var POS=/\b(good|great|fun|amazing|awesome|nice|favou?rite|best|wonderful|cool|lovely|delicious|excellent)\b/,NEG=/\b(bad|awful|boring|terrible|annoying|worst|gross|horrible|disappointing|rough)\b/;
function enhance(){
  var card=out.querySelector('[data-ft]');if(!card||card.getAttribute('data-lex'))return;
  var TK=QA.state.talk,tn=TK&&TK.turns&&TK.turns[TK.turns.length-1];if(!tn||!W.__qaTalk)return;
  card.setAttribute('data-lex','1');
  if(!/^(statement|question|like)$/.test(tn.act))return;
  var A=W.__qaTalk.analyse(tn.q);if(A.gameish||A.allNames.length)return;
  var tp=topicOf(A.ws),L=[],ask='',info='',t,x,q;
  var term=tn.act==='question'?termOf(A.plain):'',fn=FN,keepEx=false;
  var lines=[].filter.call(card.children,function(c){return c.classList.contains('qa-line');});
  if(term){var d=defOf(term);
    if(d){L=['<b>'+esc(d.k)+'</b>: '+esc(d.d),'<span style="opacity:.7">From my small offline word list (general English, not from the guide).</span>'];info='definition of '+d.k;}
    else if(fn){return;}
    else{keepEx=true;L=['I do not have <b>'+esc(term)+'</b> in my small offline word list'+(tp?', though it looks like it belongs with '+esc(tp.t.label)+'.':'.'),'I cannot look anything up online, so I will not guess a meaning.'];info='word not in list';}
  }else if(tp){t=tp.t;x='<b>'+esc(tp.w)+'</b>';q=t.qs[t.n++%2];ask='tellmore';info='topic: '+t.label+' (word: '+tp.w+')';
    var mood=POS.test(A.plain)?pick(['That sounds good.','Nice.']):NEG.test(A.plain)?pick(['That sounds rough.','Ugh, fair enough.']):'';
    if(tn.act==='question')L=['Good question about '+x+'. I only hold Buriedbornes 2 data and a small word list, so I will not guess an answer.','Tell me your take, though. '+q];
    else if(tn.act==='like')L=lines.slice(0,-1).map(function(n){return n.innerHTML;}).concat([q]);
    else L=[(mood?mood+' ':'')+pick(['Ah, '+x+'. We are on the subject of '+t.label+'.','Okay, '+x+'. So this is about '+t.label+'.','Got it, '+x+'. That is '+t.label+' talk.']),q];
    tn.topic=t.k;
  }else return;
  var det=card.querySelector('details'),ex=card.querySelector('.qa-ex');
  lines.forEach(function(n){card.removeChild(n);});if(ex&&!keepEx)card.removeChild(ex);
  L.forEach(function(h){var d=D.createElement('div');d.className='qa-line';d.innerHTML=h;card.insertBefore(d,(keepEx&&ex)?ex:det);});
  if(det){var f=D.createElement('div');f.className='qa-line';f.innerHTML='<span class="qa-lab">Offline word library</span> '+esc(info);det.appendChild(f);}
  TK.ask=ask;TK.askAt=Date.now();
  try{if(typeof QA.record==='function'){var dd=term?defOf(term):null,rt=dd?dd.k:(term?term:(tp?tp.w:'')),rw=dd?'I answered from my small offline word list: general English, not from the guide. The Ask box found nothing about it in the guide.':(term?'I looked for "'+term+'" in my small offline word list and the Ask box found nothing about it in the guide, so I did not guess a meaning.':'I matched the word "'+(tp?tp.w:'')+'" to the everyday topic "'+(tp?tp.t.label:'')+'" in my small offline word list and asked a follow-up. No game facts were used.');QA.record({card:card,topic:rt,why:rw});}}catch(x){}
}
QA.watch('word_library',enhance);
W.__qaLex={addDefs:addDefs,addWords:function(k,s){for(var i=0;i<TOPICS.length;i++)if(TOPICS[i].k===k){addW(TOPICS[i],s);return true;}return false;},define:function(w){return defOf(String(w).toLowerCase());},topic:function(s){var r=topicOf(String(s).toLowerCase().split(/[^a-z0-9]+/));return r?{topic:r.t.k,word:r.w}:null;},size:function(){return {topics:TOPICS.length,words:Object.keys(WT).length,definitions:Object.keys(DEFS).length};},version:1};
})();
