
(function(){'use strict';var W=window,D=document,go=D.getElementById('qaGo'),inp=D.getElementById('qaInput'),out=D.getElementById('qaOut');
if(typeof W.__qaPre==='function')W.QA.pre.add('ailment_chance',90,function(P0){return function(q){try{if(/\bailment\b/i.test(q)&&/\b(chance|hit)\b/i.test(q)&&!/\d/.test(q)&&!/\b(best|build|gear|recommend|should|setup|suggest|which|for a|resist\w*)\b/i.test(q))return 'what is the ailment chance';}catch(e){}return P0(q);};});
if(!go||!inp||!out)return;
/* t topic | q vague question | k think first | a best estimate | r rules (V = computed, H = estimate) | x calculator chips */
var B=[
{t:'Turn order',q:'My damage hits the cap, yet some fights still go badly. What should I check first?',k:'Who acts first, and what can the enemy do before your first turn?',a:'Turn order is not speed. The enemy opens only 1 fight in 3, then the sides alternate. The real danger is that single opening enemy turn, so make sure your shield and HP stacks survive any one enemy turn.',r:['V:The enemy opens only about 1 fight in 3.','V:After that the sides alternate.','V:Damage hits the shield first, then HP.'],x:['who goes first in a fight']},
{t:'Armor',q:'Poison ticks keep wearing me down. What kind of defense should I look at?',k:'Is there more than one kind of armor that applies to a tick?',a:'Poison damage can be cut by two things that multiply: normal armor of its damage type and a matching poison source armor. Stacking only one leaves the other lever unused.',r:['V:Damage-over-time can also be cut by a matching source armor, limited to 75.','V:Source armor multiplies with normal armor.'],x:['100 poison damage against 40% poison armor']},
{t:'Parry',q:'Is investing in parry worth it for a tank build?',k:'What kinds of attacks can and cannot be parried?',a:'Parry is capped at 95 and only works on direct attacks, so many status effects still land. It is strong against direct hitters and weak against status-heavy bosses (estimate).',r:['V:Parry chance is limited to 0..95.','V:Only direct attacks can be parried; against status effects only debuffs, never buffs.','V:Several effects cannot be parried at all.'],x:['parry 40 attacker +20%']},
{t:'HP stacks',q:'How can I survive a hit that should kill me?',k:'What happens at 0 HP if you still have HP stacks?',a:'HP stacks work like extra lives: at 0 HP a stack is spent and HP refills, and Guts gives a chance to keep the stack. Guts gear gives 15 to 30. The exact timing is an estimate (probably at that unit\'s own next turn start).',r:['V:Alive while HP is above 0 or at least 1 HP stack remains.','V:Spending a stack refills HP; a Guts roll keeps the stack.','H:The stack is spent at that unit\'s own next turn start and at battle end.'],x:['I have 3 hp stacks and lose 1 with guts 30']},
{t:'Ailments',q:'My debuffs keep failing on bosses. How do I make them reliable?',k:'Which numbers push the chance up, and where does it stop?',a:'Ailment chance = skill value + your Effective - target Resist, then modifiers. Raising Effective or lowering their Resist both help, but it can never go above 95.',r:['V:Ailment hit chance = skill value + your Effective - target Resist Ailment, then modifiers.','V:The result is limited to 5..95.'],x:['ailment chance skill 80 effective 20 resist 30']},
{t:'Crit',q:'Should I build for crits or for armor penetration?',k:'What does a crit already do to armor?',a:'A crit multiplies damage by 1.5 and ignores positive armor, so crits already beat armor. Penetration helps your non-crit hits, so it is the better extra once your crit chance is already high (estimate).',r:['V:Crit chance is limited to 5..95; a crit multiplies damage by 1.5.','V:A crit ignores positive armor.','V:Penetrate runes ignore armor of their type.'],x:['100 damage against 50% armor']},
{t:'Shield vs HP',q:'Enemies strip my shield first. Is shield or HP the better thing to stack?',k:'Do the two behave differently when you take a normal hit?',a:'Damage hits the shield first, then HP, so for ordinary hits they act as one pool. Both follow the same 0.85 rule with percent bonuses on top, so compare the percent bonuses you can actually get.',r:['V:Damage hits the shield first, then HP.','V:Max HP and max shield = round(round(raw x 0.85) x (1 + extra%/100)).'],x:['How is max HP calculated if raw base HP is 100 and I have +25% max HP?']},
{t:'Loot',q:'Should I push my risk level before picking skills and gear?',k:'What do you unlock at high risk, and what might it cost?',a:'Rarity 6 and 7 picks need Savage mode (Risk 100 or more); below that the top rarity is 5. So pushing risk is the only way to see 6 and 7 star choices. The cost in harder fights is my estimate, not a checked rule.',r:['V:The rarity upper limit is 5, or 7 in Savage mode (Risk 100 or more).','V:Rarity 6 and 7 need Savage mode (Risk 100 or more).'],x:[]},
{t:'Loot',q:'My skill picks keep offering low rarity. What can raise the odds?',k:'Where does extra reroll power come from, and can buying it backfire?',a:'Reroll power gives extra tries for +1 star. It comes from the enhanced-reroll state, three origins, or a shop reroll contract. A contract overwrites the old value, so only buy one that is higher than what you already have.',r:['V:Reroll power N gives N extra tries for +1 star.','V:Buying a shop reroll contract (levels 1 / 3 / 5 / 7) overwrites the current value.'],x:[]},
{t:'Enemy AI',q:'How should I plan around an enemy whose skills seem random?',k:'Is there a pattern to find, or only a worst case to survive?',a:'It is random: without priority runes it picks uniformly among its usable skills. Plan for its worst usable skill every turn rather than a pattern. Skills on cooldown or out of uses leave the pool.',r:['V:The enemy picks among its usable skills.','H:With no priority runes it picks uniformly at random.'],x:[]},
{t:'Quick actions',q:'Is building around quick (extra) actions worth it?',k:'What blocks a quick action, and what is still unproven?',a:'Free skills are never quick and a no-quick flag blocks it. Whether a quick action really gives a second turn in a row is only an estimate, so test it in a safe fight before betting a build on it.',r:['V:Free skills are never quick; a no-quick flag blocks it.','H:A quick action probably lets the same side act again.'],x:[]},
{t:'Damage',q:'My damage is capped. Where can I still improve?',k:'What is capped, and what is not?',a:'One hit is capped at 9,999,999, so extra power only helps by adding hits, ailment damage or surviving longer. Damage-over-time, reflect and pursuit damage have their own bonuses and scale separately from direct hits.',r:['V:One hit is capped at 9,999,999.','V:Damage-over-time, delayed, reflect and pursuit damage each get their own bonus.'],x:[]},
{t:'Damage',q:'Do two damage bonuses add together or multiply?',k:'Does it matter whether they sit in the same step of the chain?',a:'In the damage chain each step multiplies the next (value x (100+n)/100), so +50% and +50% in two different steps make +125%, not +100%.',r:['V:Each modifier step of the damage chain multiplies the previous result.'],x:[]},
{t:'Drops',q:'A boss item never drops. What can I change?',k:'Is the chance fixed, and is there any way to shift it?',a:'Each enemy drop names one exact item with a fixed chance, and an enemy gives only one reward. The Capture state may raise its capture item from 1% to 10% (estimate); main drops stay the same. More kills is the only sure lever.',r:['V:The chance per kill is the drop chance x rate/100, where the base rate is 100.','H:Capture on the enemy at the win raises its capture item from 1% to 10%.'],x:['What is the enemy drop chance if it is 100 out of 10,000?']},
{t:'Death',q:'Can I lose a fight even with HP left?',k:'Is HP the only thing that decides it?',a:'Yes. A unit is also dead when the total remaining uses of all its non-free skills is below 1, whatever its HP. Running out of skill uses is a real way to lose.',r:['V:A unit is dead when the total remaining uses of all non-free skills is below 1.'],x:[]}
];

/* v32: build question per challenge (runs the wiki's own build answer) + 3 extra calculators */
var BUILD={0:'best gear for max hp',1:'best gear for poison resistance',2:'best gear for parry',3:'best build for hp stacks',5:'best gear for crit',6:'best gear for max shield',7:'best gear for drop rate',8:'best gear for rarity reroll',10:'best gear for extra actions',11:'best gear for damage over time',13:'best gear for drop rate'};
var XTRA={9:['enemy has 4 usable skills, chance to use a given skill in 3 turns'],11:['I hit for 12,000,000 damage in one hit'],12:['two damage bonuses +50% and +50%']};
B.forEach(function(c,i){if(BUILD[i])c.b=BUILD[i];if(XTRA[i])c.x=c.x.concat(XTRA[i]);});
function card(n,lab,l){return '<div class="qa-card"><div class="qa-note">'+n+' \u00b7 calculator \u00b7 '+lab+'</div>'+l.map(function(x){return '<div class="qa-line">'+x+'</div>';}).join('')+'</div>';}
function f(n){return String(Math.round(n*100)/100);}
function calc(t){var z=t.toLowerCase().replace(/,(?=\d{3})/g,''),m,v,k;
  m=/\b(\d{7,})\b/.exec(z);
  if(m&&/\b(hit|damage|dmg)\b/.test(z)&&z.indexOf('%')<0){v=+m[1];return card('Damage cap','computed',[v>9999999?'One hit of '+v.toLocaleString('en-US')+' is cut down to <b>9,999,999</b>. Power above the cap is wasted, so extra damage only helps through more hits, ailment damage or surviving longer.':v.toLocaleString('en-US')+' is under the cap of 9,999,999, so nothing is lost.']);}
  m=z.match(/[+-]?\d+(?:\.\d+)?\s*%/g);
  if(m&&m.length>=2&&/\b(bonus|bonuses|multipl\w*|stack\w*|together|combine\w*)\b/.test(z)&&/\b(damage|power)\b/.test(z)&&!/armor|parry|crit|chance|resist|hp|shield|guts|accuracy|drop/.test(z)){
    var p=1,sum=0;m.forEach(function(x){var n=parseFloat(x);p*=1+n/100;sum+=n;});
    return card('Damage bonuses','computed',[m.map(function(x){return f(1+parseFloat(x)/100);}).join(' x ')+' = <b>'+f(p)+'</b> = <b>'+(p>=1?'+':'')+f((p-1)*100)+'%</b> in total. Adding them would give '+(sum>=0?'+':'')+f(sum)+'%.','Applies to bonuses in different steps of the damage chain; each step multiplies the previous result.']);}
  k=/(\d+)\s*(?:usable\s+)?skills?\b/.exec(z);
  if(k&&/\b(enemy|boss)\b/.test(z)&&/\bchance\b/.test(z)){var s=+k[1],tn=/(\d+)\s*turns?/.exec(z);tn=tn?+tn[1]:1;if(s>=1&&tn>=1)return card('Enemy skill pick','estimate',['With '+s+' usable skills it picks each with 1 in '+s+' = '+f(100/s)+'% per turn.','Over '+tn+' turn'+(tn>1?'s':'')+' the chance to see a given skill at least once is <b>'+f((1-Math.pow(1-1/s,tn))*100)+'%</b>.','Estimate: this assumes the enemy has no priority runes; cooldowns and used-up skills change the number of usable skills from turn to turn.']);}
  return null;}
QA.on('calc',function(q){var h=calc(q);if(!h)return false;out.innerHTML=h;return true;});
/* v35 GENERATOR: 11 challenge types are built fresh every time from random numbers (and random ailment / wording); the 4 rules-only challenges stay fixed. v = numbers that pre-fill the calculator, chk = headline the calculator must show too, r2 = extra rule lines. */
var CAP=9999999;
var rh=function(x){return Math.floor(x+0.5);},cl=function(x,lo,hi){return Math.max(lo,Math.min(hi,x));},N=function(x){return Number(x).toLocaleString('en-US');};
function ri(lo,hi,st){st=st||1;return lo+st*Math.floor(Math.random()*(Math.floor((hi-lo)/st)+1));}
function pk(a){return a[Math.floor(Math.random()*a.length)];}
function sg(n){return (n<0?'-':'+')+Math.abs(n);}
var G={
/* 0 turn order -> calculator "first" */
0:function(){var n=ri(2,12),p=(1-Math.pow(2/3,n))*100;
 return {q:'You are about to fight '+n+' bosses in a row and your plan only works if you move first. How worried should you be?',
  a:'The enemy opens a fight only 1 time in 3 (33.33%), and speed does not change that. Across '+n+' fights the chance that it opens at least once is '+f(p)+'%. After the opening the sides alternate, so make sure your shield and HP stacks survive any single enemy turn.',
  v:[n],chk:f(p)+'%'};},
/* 1 armor + source armor -> calculator "armor" */
1:function(){var ail=pk(['Poison','Burn','Bleed']),d=ri(20000,400000,10000),a=ri(10,60,5),s=ri(0,50,5);
 var ar=function(x,y){return cl(rh(d*(1-Math.min(75,x)/100)*(1-Math.min(75,y)/100)),0,CAP);};
 var now=ar(a,s),na=ar(a+10,s),ns=ar(a,s+10);
 return {q:'A '+ail+' tick hits you for '+N(d)+' before armor. You have '+a+'% normal armor and '+s+'% '+ail+' source armor, and you can raise only ONE of them by 10 points. Which one?',
  a:'Right now a tick does '+N(now)+'. With +10 normal armor it does '+N(na)+'; with +10 '+ail+' source armor it does '+N(ns)+'. '+(na<ns?'Raising your normal armor is the better lever here.':ns<na?'Raising your '+ail+' source armor is the better lever here.':'Both levers give the same result.')+' The two multiply with each other and each stops at 75.',
  v:[d,a,s,0],chk:N(now)};},
/* 2 parry -> calculator "parry" */
2:function(){var p=ri(20,80,5),t=ri(-20,30,10),a=ri(-10,40,10),st=Math.random()<0.5;
 var x=rh(rh(p*(100+t)/100)*(100+a)/100),c=cl(x,0,95);
 return {q:'Your Parry stat is '+p+'. Your own effects change it by '+sg(t)+'% and the attacker\'s effects change it by '+sg(a)+'%. Is it worth building a tank around parry against a boss that mostly '+(st?'inflicts status effects':'hits with direct attacks')+'?',
  a:'Your parry chance works out to '+c+'%'+(x>95?' (the raw '+x+'% is cut down to the limit of 95)':'')+'. '+(st?'Only direct attacks can be parried, and against status effects only debuffs can be negated, never buffs, so many of its statuses will still land (estimate: weak against status-heavy bosses).':'Direct attacks are exactly what parry works on, so about '+c+' of every 100 of its direct hits would be negated (estimate: strong against direct hitters).'),
  v:[p,t,a],chk:c+'% parry chance'};},
/* 3 HP stacks (lose / gain / reset) -> calculator "stacks" */
3:function(){var vr=pk(['lose','gain','guts']),m=ri(3,9),c=ri(vr==='lose'?1:0,m),g=ri(1,3),u=pk([0,15,20,25,30]);
 var gain=Math.max(c,Math.min(m,c+g)),lose=Math.max(0,c-g),q,a,chk,r2=[],kk=vr==='lose'?'Does Guts keep the stack, and what changes at 0 stacks?':vr==='gain'?'Is there a maximum, and can part of the gain be wasted?':'Which helps more here: one more stack or more Guts, and does it depend on how many stacks you already have?';
 if(vr==='lose'){q='You have '+c+' of '+m+' HP stacks. An effect is about to remove '+g+' of them and your Guts is '+u+'%. How many stacks will you really have left?';
  a='If the Guts roll fails you drop to '+lose+' (never below 0). '+(u>0?'Guts '+u+'% is the chance that the stack is kept, so about '+u+' times in 100 you stay at '+c+'. ':'With Guts 0 the stack is always lost. ')+(lose===0?'At 0 stacks you no longer have an extra life.':'You stay alive while you have HP or at least 1 stack.');chk='Lose: '+lose;
  if(u>0)r2.push('H:The upper limit of the Guts stat is not confirmed, so treat the Guts percent as an estimate.');}
 else if(vr==='gain'){q='You have '+c+' of '+m+' HP stacks and an effect is about to give you '+g+' more. How many will you have, and is it worth it?';
  a=(c>=m?'You are already full ('+m+' of '+m+'), so nothing is gained.':'You end up with '+gain+': the gain is capped at the maximum of '+m+(c+g>m?', so '+(c+g-m)+' of the '+g+' is wasted.':', so nothing is wasted.'))+' In the game you can hold at most 9 HP stacks.';chk='Gain: '+gain;}
 else{var s=ri(3,8),dg=pk([10,15,20]),q0=1-u/100,q1=1-(u+dg)/100,A0=s/q0,A1=(s+1)/q0,A2=s/q1,r1=function(x){return Math.round(x*10)/10;},be=(100-u-dg)/dg;
  q='A boss fight is coming and it will keep knocking you down to 0 HP. You start with '+s+' HP stacks and '+u+'% Guts. You can take only ONE upgrade: one gives +1 max HP stack, the other gives +'+dg+' Guts. Which one keeps you alive through more knock-downs?';
  a='Each knock-down to 0 HP spends one stack unless your Guts roll keeps it, so on average you can absorb stacks / (1 - Guts) knock-downs before the one that kills you. Now: '+s+' stacks at '+u+'% Guts = about '+r1(A0)+'. With +1 max stack ('+(s+1)+' stacks): about '+r1(A1)+' (+'+r1(A1-A0)+'). With +'+dg+' Guts ('+(u+dg)+'%): about '+r1(A2)+' (+'+r1(A2-A0)+'). '+(A1>A2+0.005?'The extra stack is the better pick here.':A2>A1+0.005?'The extra Guts is the better pick here.':'Both picks are worth the same here.')+' At this Guts level the break-even is '+r1(be)+' stacks: Guts is the better pick above it, the extra stack below it. Guts also gives the same save chance against effects that remove HP stacks.';
  chk='Average: '+r1(A0);
  r2.push('V:You start every fight with full HP stacks, so +1 max stack counts from the first knock-down.');
  r2.push('H:This is an average over many fights. It assumes each knock-down is one Guts roll and nothing else gives or removes stacks; the exact moment the stack is spent and the upper limit of the Guts stat are not confirmed.');}
 return {q:q,k:kk,a:a,v:vr==='guts'?undefined:[c,m,g,u],chk:chk,r2:r2,nf:vr==='guts'?1:0};},
/* 4 ailment chance -> calculator "ailment" */
4:function(){var ail=pk(['Bleed','Burn','Poison','Explode','Frostbite','Hex']),s=ri(40,100,10),e=ri(0,50,5),r=ri(0,60,5),oe=ri(0,20,5),ore=ri(0,20,5),T=pk([75,80,90]);
 var w=s+e+oe-r-ore,c=cl(w,5,95),need=T-w;
 return {q:'Your '+ail+' keeps failing on a boss. Skill value '+s+', your Effective '+e+(oe?' (plus '+oe+' for '+ail+')':'')+', the boss\'s Resist '+r+(ore?' (plus '+ore+' against '+ail+')':'')+'. You want it to land at least '+T+' times in 100. What do you change?',
  a:'Right now the chance is '+c+'% (raw '+w+'). '+(c>=T?'That already meets your goal of '+T+'%. It can never go above 95%, so extra Effective beyond that is wasted.':'You need '+need+' more points: raise your Effective by '+need+' or lower the boss\'s Resist by '+need+'; both count the same. The result is always limited to 5..95%.'),
  v:[s,e,r,oe,ore],chk:c+'% ailment chance'};},
/* 5 crit vs penetration -> calculator "crit" */
5:function(){var c0=ri(10,60,5),b0=ri(0,25,5),m=pk([50,75,100,125,150,200]),e=ri(0,30,5),A=ri(20,60,10);
 var X=cl((c0+b0)*m/100-e,5,95),Y=cl(X+10,5,95);
 var av=function(x,pen){return x/100*150+(1-x/100)*(pen?100:100-A);};
 var n0=av(X,0),np=av(X,1),nc=av(Y,0),gp=np-n0,gc=nc-n0;
 var vd=gp>gc+0.005?'Armor penetration is the better extra here.':gc>gp+0.005?'More crit chance is the better extra here.':'Both extras are worth the same here.';
 return {q:'Your Crit Rate is '+c0+', your skill adds '+b0+' crit bonus with a crit multiplier of '+m+'%, and the target has '+e+' Avoid Crit and '+A+'% armor. Is it better to add +10 crit chance or armor penetration?',
  a:'Your crit chance is '+f(X)+'%. A crit does 150 for every 100 base damage and ignores positive armor, while a normal hit against '+A+'% armor does only '+(100-A)+'. Average per 100 base damage: now '+f(n0)+'; with armor penetration '+f(np)+' (+'+f(gp)+'); with +10 crit chance '+f(nc)+' (+'+f(gc)+'). '+vd,
  v:[c0,b0,m,e],chk:f(X)+'%',r2:['H:The averages ignore every other modifier and assume independent hits.']};},
/* 6 max HP / shield with the 0.85 step -> calculator "maxhp" */
6:function(){var kind=pk(['HP','shield']),r0=ri(100,3000,50),e=ri(0,100,5),g=ri(20,200,10);
 var mx=function(r){return Math.max(1,rh(rh(r*0.85)*(1+e/100)));};
 var m0=mx(r0),m1=mx(r0+g);
 return {k:'What happens to every raw point before the percent bonus applies?',q:'Your raw base '+kind+' is '+N(r0)+' and your job, race and gear give +'+e+'% extra. A piece of gear adds '+g+' raw '+kind+'. How much do you really gain?',
  a:'Max '+kind+' is '+N(m0)+' now and '+N(m1)+' with the piece: +'+N(m1-m0)+', not +'+g+'. Every raw point first loses 15% (x0.85) and then the +'+e+'% applies on top, so each raw point is worth about '+f((m1-m0)/g)+'. Damage hits the shield first and then HP, so for ordinary hits both act as one pool.',
  v:[r0,e],chk:N(m0)};},
/* 9 enemy skill pick -> calculator "pick" */
9:function(){var k=ri(2,5),t=ri(1,10),dg=pk(['its strongest hit','the skill that stuns you','the skill that drains your shield','its healing skill']);
 var p=(1-Math.pow(1-1/k,t))*100,tn=t+' turn'+(t>1?'s':'');
 return {q:'An enemy has '+k+' usable skills and one of them is '+dg+'. Over the next '+tn+', how likely are you to see it?',
  a:'With no priority runes it picks uniformly at random (estimate): 1 in '+k+' per turn = '+f(100/k)+'%. Over '+tn+' the chance to see it at least once is '+f(p)+'%, and on average it shows up after about '+k+' turns. Skills on cooldown or out of uses leave the pool, which raises the odds for the rest.',
  v:[k,t],chk:f(p)+'%'};},
/* 11 damage cap -> calculator "damage" */
11:function(){var d=ri(1000000,9000000,500000),A=ri(20,150,10),Bn=ri(20,150,10),Cn=ri(20,100,10);
 var tot=function(x){return rh(d*((1+A/100)*(1+Bn/100)*(1+x/100)));};
 var t0=tot(0),t1=tot(Cn),n0=Math.min(t0,CAP),n1=Math.min(t1,CAP);
 return {q:'One of your hits does '+N(d)+' before bonuses, with +'+A+'% and +'+Bn+'% damage bonuses already active. A new piece offers another +'+Cn+'%. Is it worth taking?',
  a:n0>=CAP?'You are already at the cap of 9,999,999 per hit ('+N(t0)+' before the cap), so the new +'+Cn+'% adds nothing. Extra power only helps through more hits, ailment damage or surviving longer.':'Now a hit does '+N(n0)+'; with the piece '+N(n1)+' (+'+N(n1-n0)+')'+(t1>CAP?', and '+N(t1-CAP)+' above the cap is wasted':'')+'. One hit can never go above 9,999,999.',
  v:[d,A,Bn,Cn],chk:N(n1)};},
/* 12 damage bonuses multiply -> calculator "damage" */
12:function(){var d=ri(100000,600000,50000),nb=pk([2,2,3]),A=ri(20,150,10),Bn=ri(20,150,10),Cn=nb===3?ri(20,100,10):0;
 var ps=[A,Bn].concat(nb===3?[Cn]:[]),p=(1+A/100)*(1+Bn/100)*(1+Cn/100),sum=A+Bn+Cn,mu=Math.min(rh(d*p),CAP),ad=rh(d*(1+sum/100));
 return {k:'Is each bonus applied to the base damage, or to the result of the previous one?',q:'Your build has '+(nb===3?'three damage bonuses of +'+A+'%, +'+Bn+'% and +'+Cn+'%':'two damage bonuses of +'+A+'% and +'+Bn+'%')+', each from a different step of the damage chain. Do they simply add together?',
  a:'No, they multiply: '+ps.map(function(x){return f(1+x/100);}).join(' x ')+' = '+f(p)+', which is +'+f((p-1)*100)+'% in total, not +'+sum+'%. On '+N(d)+' base damage that is '+N(mu)+' instead of '+N(ad)+' (+'+N(mu-ad)+' extra).',
  v:[d,A,Bn,Cn],chk:N(mu)};},
/* 13 drop chance -> calculator "drop" */
13:function(){var kind=pk(['a dungeon boss','a conquest boss','a disaster boss','a normal enemy']),ph=pk(['it still has not dropped','it keeps not dropping']),w=100,wc=1000;
 var pl=function(x){var p=x/10000;return {k50:Math.ceil(Math.log(0.5)/Math.log(1-p)),k90:Math.ceil(Math.log(0.1)/Math.log(1-p))};},p0=pl(w),p1=pl(wc);
 return {q:'You are farming the capture item of '+kind+' (drop chance '+f(w/100)+'%) and '+ph+'. How many kills should you plan for, without Capture and with Capture on the enemy?',
  a:'Without Capture: each kill gives '+f(w/100)+'%, about 1 in '+f(10000/w)+' kills. For a 50% chance of at least one drop plan about '+p0.k50+' kills; for 90% plan about '+p0.k90+'.\n\nWith Capture: each kill gives '+f(wc/100)+'%, about 1 in '+f(10000/wc)+' kills. For a 50% chance of at least one drop plan about '+p1.k50+' kills; for 90% plan about '+p1.k90+'.\n\nAn enemy gives only one reward, so more kills is the only other lever.',
  v:[w/100,100],chk:f(w/100)+'% per kill',r2:['V:Each kill is a separate roll, so the plan numbers are the chance of at least one drop in that many kills.','V:With Capture only capture items change (1% becomes 10%); every other drop keeps its chance.']};}
};
var ALT={
0:[function(){var n=ri(2,6),p=Math.pow(2/3,n)*100;return {q:'You plan to fight '+n+' bosses in a row and your plan needs you to act first in EVERY one of them. What are your chances?',k:'Does each fight roll the dice again, and do the chances add or multiply?',
 a:'You open a fight 2 times in 3 (66.67%) and the enemy opens 1 time in 3; speed does not change that. Opening all '+n+' fights is (2/3)^'+n+' = '+f(p)+'%, about 1 time in '+f(100/p)+'. So the enemy opens at least one of them '+f(100-p)+'% of the time: keep a plan for that.',v:[n],chk:f(100-p)+'%'};}],
1:[function(){var a=ri(40,70,5),x=pk([10,15,20,25]),d=ri(20000,400000,10000),ar=function(y){return cl(rh(d*(1-Math.min(75,y)/100)),0,CAP);},b=ar(a),w=ar(a+x),lim=Math.max(0,Math.min(75,a+x)-a);return {q:'A boss hit does '+N(d)+' before armor and you have '+a+'% normal armor. New gear gives +'+x+' armor. How much damage does it really save per hit?',k:'Is there a limit, and can part of the bonus be wasted?',
 a:'Armor stops at 75, so you only get '+lim+' of the +'+x+' points. A hit does '+N(b)+' now and '+N(w)+' with the gear, saving '+N(b-w)+' per hit.'+(lim<x?' '+(x-lim)+' points are wasted, so another stat may be worth more.':' All of it counts.'),v:[d,a+x,0,0],chk:N(w)};}],
2:[function(){var p=ri(20,80,5),t=ri(0,30,10),a=ri(-10,20,10),F=pk([10,15,20]),P=pk([10,20]),pr=function(s,u){return cl(rh(rh(s*(100+u)/100)*(100+a)/100),0,95);},c0=pr(p,t),cF=pr(p+F,t),cP=pr(p,t+P);return {q:'Your Parry stat is '+p+', your own effects change it by '+sg(t)+'% and the attacker\'s effects by '+sg(a)+'%. You can take ONE upgrade: +'+F+' Parry stat, or +'+P+'% parry from your own effects. Which one blocks more direct hits?',k:'Which number is multiplied by which, and where does it stop?',
 a:'Now you parry '+c0+'%. With +'+F+' stat: '+cF+'%. With +'+P+'% effect: '+cP+'%. '+(cF>cP?'The flat Parry stat is better here.':cP>cF?'The percent bonus is better here.':'Both give the same result here.')+' Parry stops at 95, and only direct attacks can be parried.',v:[p,t,a],chk:c0+'% parry chance'};}],
4:[function(){var ail=pk(['Bleed','Burn','Poison','Explode','Frostbite','Hex']),e=ri(0,50,5),r=ri(10,70,5),s1=ri(30,70,10),s2=s1+ri(10,30,10),n=ri(2,4),cc=function(s){return cl(s+e-r,5,95);},c1=cc(s1),c2=cc(s2),at=function(c){return 100*(1-Math.pow(1-c/100,n));};return {q:'The boss has '+r+' Resist and your Effective is '+e+'. Your '+ail+' skill A has value '+s1+' and skill B has value '+s2+'. You have '+n+' turns. Which skill is more likely to land '+ail+' at least once?',k:'Is the stronger skill always worth it, and where does the chance stop?',
 a:'Skill A lands '+c1+'% per try and skill B '+c2+'%. Over '+n+' turns that is '+f(at(c1))+'% for A and '+f(at(c2))+'% for B. '+(c1===c2?'Both are limited to the same 5..95 range here, so the stronger skill adds nothing.':'Skill B is better by '+f(at(c2)-at(c1))+' points.')+' Each try is limited to 5..95%.',v:[s1,e,r,0,0],chk:c1+'% ailment chance'};}]
};
function make(i){var o=null,c={},k,g=G[i],al=ALT[i];if(al&&Math.random()<al.length/(al.length+1))g=al[Math.floor(Math.random()*al.length)];if(g){try{o=g();}catch(e){o=null;}}for(k in B[i])c[k]=B[i][k];if(o)for(k in o)c[k]=o[k];c.i=i;c.gen=!!o;return c;}
var CM={0:'first',1:'armor',2:'parry',3:'stacks',4:'ailment',5:'crit',6:'maxhp',9:'pick',11:'damage',12:'damage',13:'drop'};
var deck=[],last=-1,cur=0,cc=null;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function draw(){if(!deck.length){deck=B.map(function(_,i){return i;}).filter(function(i){return i!==last;});for(var i=deck.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=deck[i];deck[i]=deck[j];deck[j]=t;}}last=deck.pop();return last;}
function btn(a,l,x){return '<button type="button" class="chbtn" data-ch="'+a+'" data-x="'+esc(x||'')+'">'+esc(l)+'</button> ';}
/* v84: reveal order = Estimate / Computed / Best estimate (solved sentences bold) / Formula */
function revHtml(c,i){var rs=c.r.concat(c.r2||[]),fo=CM[i]&&!c.nf&&W.__calcFormula?W.__calcFormula(CM[i]):'',NUM=/\d+(?:,\d{3})*(?:\.\d+)?/g,est=[],com=[],known={},h='',ans;
  var lb=function(t,col){return '<span style="color:var('+(col||'--dim')+')">'+t+'</span> ';},ln=function(x,st){return '<div class="qa-line"'+(st?' style="'+st+'"':'')+'>'+x+'</div>';};
  rs.forEach(function(r){(r.charAt(0)==='V'?com:est).push(r.slice(2));});
  ((rs.join(' ')+' '+fo).match(NUM)||[]).forEach(function(n){known[n]=1;});
  var bf=function(t){return c.gen?t.replace(/([.!?])\s+(?=[A-Z])/g,'$1\u0001').split('\u0001').map(function(p){var m=p.match(NUM)||[],bd=!/^\s*Estimate/i.test(p)&&m.length>0&&(/chance|probab|gives/i.test(p)||m.some(function(n){return !known[n];}));return bd?'<b>'+esc(p)+'</b>':esc(p);}).join(' '):esc(t);},pa=String(c.a).split('\n\n');
  ans=pa.length>1?pa.map(function(t){return '<div style="margin-top:8px">'+bf(t)+'</div>';}).join(''):bf(pa[0]);
  h+=est.map(function(x){return ln(lb('Estimate:')+esc(x));}).join('');
  h+=com.map(function(x){return ln(lb('Computed:')+esc(x));}).join('');
  h+=ln(lb('Best estimate:','--accent')+ans,'border-left:3px solid var(--accent);padding-left:8px;margin:10px 0 6px');
  if(fo)h+=ln(lb('Formula:')+esc(fo));
  return h;}
function show(i,rev,keep){var c,h;cur=i;if(!keep||!cc||cc.i!==i)cc=make(i);c=cc;
  h='<div class="qa-card"><div class="qa-note">Challenge: '+esc(c.t)+'</div><div class="qa-line"><b>'+esc(c.q)+'</b></div><div class="qa-line">Think first: '+esc(c.k)+'</div>';
  if(rev)h+=revHtml(c,i);
  h+='<div>'+(rev?'':btn('rev','Show best estimate'))+(rev&&CM[i]&&c.v?btn('calc','Open calculator to test it',CM[i]):'')+(c.b?btn('try','What build for this?',c.b):'')+btn('next','Another challenge')+'</div></div>';
  out.innerHTML=h;try{out.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(e){}}
var b=D.createElement('button');b.type='button';b.id='qaChallenge';b.textContent='Challenge me';
b.setAttribute('style','flex:1 1 auto;min-height:42px;background:#1c2030;color:var(--text);border:1px solid var(--border);border-radius:8px;padding:0 14px;font-weight:600;font-size:14px');
go.insertAdjacentElement('afterend',b);
b.addEventListener('click',function(){show(draw(),false);});
out.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('button[data-ch]');if(!t)return;var a=t.dataset.ch;
  if(a==='rev')show(cur,true,true);else if(a==='next')show(draw(),false);else if(a==='calc'&&W.__openCalc)W.__openCalc(t.dataset.x,false,cc&&cc.v);
  else if(a==='try'&&t.dataset.x){inp.value=t.dataset.x;go.click();}});
W.__qaChallenges=B;W.__chCur=function(){return cc;};
})();
