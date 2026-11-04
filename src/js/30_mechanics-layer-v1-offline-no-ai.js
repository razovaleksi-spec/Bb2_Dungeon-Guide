
/* ===== Mechanics layer v1 (offline, no AI) =====
   What it is: the part of the Ask box that does the game's maths and explains its rules.
   Data it uses: #qaMechData (formulas run by the Mechanics engine) and #qaMechRules (plain-language rules and topics).
   Both are written in plain words.
   What it answers: (1) numbers it can work out (armor, source armor, crit, hit chance, ailment chance, parry chance, HP stacks gained / lost, max HP / shield, Guts, drop weight, base damage, starting stats of a race + job + origin),
   (2) how a rule works (turn order, parry, HP stacks, drops, ...), (3) "I can't calculate that yet" for anything not known (enemy stat tables).
   Every answer carries a label: computed (checked), estimate (best guess) or can't calculate yet. It never invents a number.
   Hooks: window.__qaMech.handle(raw, intent, slots) is called by the Intent layer; window.__qaMech.reply(text) is its fallback. */
(function(){'use strict';
var W=window,ED=document.getElementById('qaMechData'),RD=document.getElementById('qaMechRules'),KBE=document.getElementById('qaKB');
if(!W.Mechanics||!ED||!RD||W.__qaMech)return;
var M,RU;try{M=W.Mechanics.load(JSON.parse(ED.textContent));RU=JSON.parse(RD.textContent);}catch(e){return;}
var BYID={};RU.rules.forEach(function(r){BYID[r.id]=r;});
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function norm(t){return ' '+String(t||'').toLowerCase().replace(/\.(?!\d)/g,' ').replace(/([^\d])\./g,'$1 ').replace(/[^a-z0-9.%+\u2605-]+/g,' ').replace(/\s+/g,' ').trim()+' ';}
function has(z,p){return z.indexOf(' '+p+' ')>=0;}
function fmt(n){return Number(Math.round(n*100)/100).toLocaleString('en-US');}
function card(title,sub,html,chips){return '<div class="qa-card" data-intent="1" data-mech="1"><div class="qa-title">'+esc(title)+'<span class="qa-sub">'+esc(sub)+'</span></div>'+html+
  (chips&&chips.length?'<div class="qa-ex">'+chips.map(function(c){return '<button type="button" class="qa-exbtn" data-ex="'+esc(c[1])+'">'+esc(c[0])+'</button>';}).join('')+'</div>':'')+'</div>';}
function line(h){return '<div class="qa-line">'+h+'</div>';}
function labelOf(st){return W.Mechanics.label(st);}
function badge(st){var l=labelOf(st);return l==='computed'?'computed (checked)':l==='estimate'?'estimate (best guess, not confirmed)':"can't calculate yet";}
var CHIPS=[['100 damage against 50% armor','100 damage against 50% armor'],['Who acts first?','who goes first in a fight'],['Bone Death Knight Rebel stats','Bone Death Knight Rebel starting stats']];

/* ---- numbers with labels: each number is given to the nearest label word (the label before it wins a tie, the longer label wins a tie) ---- */
function numTokens(z){var w=z.trim().split(' '),out=[];
  w.forEach(function(x,i){var m=/^([+-]?\d+(?:\.\d+)?)(%?)$/.exec(x);if(m)out.push({i:i,v:parseFloat(m[1]),pct:!!m[2]||w[i+1]==='percent'||w[i+1]==='pct'});});
  return {w:w,n:out};}
function labelled(z,labels){var t=numTokens(z),w=t.w,res={};
  t.n.forEach(function(nm){var best=null;
    Object.keys(labels).forEach(function(k){labels[k].forEach(function(a){var ap=a.split(' ');
      for(var i=0;i+ap.length<=w.length;i++){var ok=true,j;for(j=0;j<ap.length;j++)if(w[i+j]!==ap[j]){ok=false;break;}
        if(!ok)continue;var end=i+ap.length-1,before=end<nm.i,d=before?nm.i-end:i-nm.i;
        if(d<1||d>3)continue;var sc=d*2+(before?0:1)-ap.length*0.1;if(!best||sc<best.s)best={k:k,s:sc};}});});
    if(best&&!res[best.k])res[best.k]={v:nm.v,pct:nm.pct};});
  return res;}
function need(o,names){for(var i=0;i<names.length;i++)if(!o[names[i]])return names[i];return null;}
function run(id,inp){var r=M.calc(id,inp);return r&&r.ok?r:null;}
function weakest(a,b){var R=W.Mechanics.RANK;return R[a]<=R[b]?a:b;}

/* ---- calculators: each returns a card or null ---- */
var LBL={armor:['armor','armour','defense','defence'],dmg:['damage','dmg','hit','hits','attack']};
function calcArmor(z){if(!(has(z,'armor')||has(z,'armour')||has(z,'defense')||has(z,'defence')))return null;
  var o=labelled(z,LBL);if(need(o,['dmg','armor']))return null;
  var dmg=o.dmg.v,ar=o.armor.v,crit=has(z,'crit')||has(z,'critical')||has(z,'crits'),cap=(has(z,'iron')||has(z,'sanctuary')||has(z,'mutation')||has(z,'95'))?95:75,r,f,txt,st;
  if(crit&&ar>0){r=run('crit_damage',{v:dmg});f=r&&run('final_damage',{v:r.value});if(!f)return null;
    txt='A crit ignores positive armor, so '+fmt(dmg)+' damage becomes <b>'+fmt(f.value)+'</b> (x1.5, armor not applied).';st=weakest(r.status,f.status);}
  else{r=run('armor_reduction',{v:dmg,armor:ar,cap:cap});f=r&&run('final_damage',{v:r.value});if(!f)return null;
    var used=Math.min(ar,cap);txt=fmt(dmg)+' damage against '+fmt(ar)+'% armor'+(ar>cap?' (counts as '+cap+'%, the limit)':'')+' = <b>'+fmt(f.value)+'</b> damage.'+(ar<0?' Negative armor adds damage.':'');st=weakest(r.status,f.status);}
  return card('Armor','calculator \u00b7 '+labelOf(st),line(txt)+line('Armor is limited to 75% (95% with Iron wall, Sanctuary or Mutation). Other damage modifiers are not included.')+line('<i>'+esc(badge(st))+'</i>'),[['Same with a crit','100 damage with crit against 50% armor'],['Who acts first?','who goes first in a fight']]);}
function calcCritDmg(z){if(!(has(z,'crit')||has(z,'critical')||has(z,'crits')))return null;if(has(z,'chance')||has(z,'rate')||has(z,'likely')||has(z,'avoid'))return null;
  var o=labelled(z,{dmg:LBL.dmg});if(!o.dmg)return null;var r=run('crit_damage',{v:o.dmg.v}),f=r&&run('final_damage',{v:r.value});if(!f)return null;
  var st=weakest(r.status,f.status);return card('Critical hit damage','calculator \u00b7 '+labelOf(st),line(fmt(o.dmg.v)+' damage on a crit = <b>'+fmt(f.value)+'</b> (x1.5). Crit-damage bonuses from gear or states apply on top and are not included.')+line('<i>'+esc(badge(st))+'</i>'),CHIPS.slice(0,2));}
function calcCritChance(z){if(!(has(z,'crit')||has(z,'critical')))return null;if(!(has(z,'chance')||has(z,'likely')||has(z,'rate')))return null;
  var o=labelled(z,{rate:['crit rate','critrate','crit','critical'],avoid:['avoid crit','crit avoid','avoid','resist']});if(need(o,['rate','avoid']))return null;
  var r=run('crit_chance',{crit_rate:o.rate.v,avoid_crit:o.avoid.v});if(!r)return null;
  return card('Critical hit chance','calculator \u00b7 '+labelOf(r.status),line('Crit rate '+fmt(o.rate.v)+' against Avoid Crit '+fmt(o.avoid.v)+' = <b>'+fmt(r.value)+'%</b> (always kept between 5% and 95%). Skill crit bonuses are not included.')+line('<i>'+esc(badge(r.status))+'</i>'),CHIPS.slice(0,2));}
function calcHit(z){if(!(has(z,'hit')||has(z,'accuracy')||has(z,'accu')||has(z,'miss')))return null;if(!(has(z,'chance')||has(z,'likely')||has(z,'rate')||has(z,'accuracy')))return null;
  var o=labelled(z,{hit:['skill accuracy','base accuracy','hit rate','skill hit','skill','hit'],accu:['my accuracy','your accuracy','accuracy','accu'],avoid:['target avoid','avoid','evasion','dodge']});
  if(need(o,['hit','accu','avoid']))return null;var r=run('normal_hit_chance',{skill_hit:o.hit.v,accu:o.accu.v,target_avoid:o.avoid.v});if(!r)return null;
  return card('Hit chance','calculator \u00b7 '+labelOf(r.status),line('Skill hit '+fmt(o.hit.v)+' + Accu '+fmt(o.accu.v)+' - target Avoid '+fmt(o.avoid.v)+' = <b>'+fmt(r.value)+'%</b> (always kept between 5% and 95%). Special hit-rate effects are not included.')+line('<i>'+esc(badge(r.status))+'</i>'),CHIPS.slice(0,2));}
function calcHpShield(z){if(!(has(z,'hp')||has(z,'shield')||has(z,'health')))return null;if(!(has(z,'0.85')||has(z,'raw')))return null;
  var t=numTokens(z),raw=null,pct=0,i;for(i=0;i<t.n.length;i++){if(t.n[i].pct&&!(pct))pct=t.n[i].v;else if(!t.n[i].pct&&raw===null&&t.n[i].v!==0.85)raw=t.n[i].v;}
  if(raw===null)return null;var sh=has(z,'shield')&&!has(z,'hp'),r=run(sh?'max_shield_final':'max_hp_final',{raw:raw,pct:pct});if(!r)return null;
  var step=Math.floor(raw*85/100+0.5);return card(sh?'Max shield':'Max HP','calculator \u00b7 '+labelOf(r.status),line(fmt(raw)+' x 0.85 = '+fmt(step)+(pct?', then +'+fmt(pct)+'% = ':' = ')+'<b>'+fmt(r.value)+'</b> (rounded half up each step'+(sh?'':', never below 1')+').')+line('<i>'+esc(badge(r.status))+'</i>'),[['How is max HP worked out?','how is max hp worked out']]);}
function calcGuts(z){if(!has(z,'guts'))return null;var o=labelled(z,{g:['guts']});if(!o.g)return null;var r=run('guts_chance',{guts:o.g.v});if(!r)return null;
  return card('Guts','calculator \u00b7 '+labelOf(r.status),line('Guts '+fmt(o.g.v)+' = about <b>'+fmt(r.value)+'%</b> chance to keep an HP stack when it would be lost.')+line('<i>'+esc(badge(r.status))+' The highest value the Guts stat can have is not known yet.</i>'),[['How do HP stacks work?','how do hp stacks work']]);}
function plainDrop(z){var m=/^ (?:what (?:is|are|s) )?(?:the )?(?:enemy |enemies )?drop chance (?:if it is |if |is |of |at )?(\d+(?:\.\d+)?)(?: out of 10 ?000)? $/.exec(z);return m?' freq '+m[1]+' ':null;}
function calcDrop(z){if(!(has(z,'freq')||has(z,'weight'))){z=plainDrop(z);if(!z)return null;}var o=labelled(z,{f:['freq','weight','frequency']});if(!o.f)return null;var r=run('drop_chance',{freq:o.f.v});if(!r)return null;
  return card('Drop chance','calculator \u00b7 '+labelOf(r.status),line('A drop chance of '+fmt(o.f.v)+' (out of 10,000) drops <b>'+fmt(r.value)+'%</b> of the time at the normal rate. Capture on a boss changes the capture-item drop chance from 100 (1%) to 1000 (10%).')+line('<i>'+esc(badge(r.status))+'</i>'),[['How do drops work?','how are drops rolled']]);}
function calcBase(z){if(!(has(z,'power')||has(z,'skill')))return null;
  var o=labelled(z,{stat:['str','dex','int','pie','stat','strength','dexterity','intelligence','piety'],pow:['skill power','power'],arm:LBL.armor});if(need(o,['stat','pow']))return null;
  var r=run('base_damage',{stat:o.stat.v,power:o.pow.v});if(!r)return null;var v=r.value,st=r.status,L=[fmt(o.stat.v)+' x '+fmt(o.pow.v)+'% = <b>'+fmt(v)+'</b> base damage'],crit=has(z,'crit')||has(z,'critical');
  var tot=v;if(crit){var c=run('crit_damage',{v:tot});if(c){tot=c.value;L.push('Crit: x1.5 = '+fmt(tot));}}
  if(o.arm&&!(crit&&o.arm.v>0)){var a=run('armor_reduction',{v:tot,armor:o.arm.v,cap:75});if(a){tot=a.value;L.push('After '+fmt(o.arm.v)+'% armor = '+fmt(tot));}}
  var f=run('final_damage',{v:tot});if(f)tot=f.value;st=(o.arm||crit)?weakest(st,'hypothesis'):st;
  return card('Skill damage (core)','calculator \u00b7 '+labelOf(st),L.map(line).join('')+line('Final damage '+fmt(tot)+'. Other bonuses (skill, target type, elite, ailments) and the hit roll are not included.')+line('<i>'+esc(badge(st))+'</i>'),CHIPS.slice(0,2));}
/* ---- v2 calculators: parry, source armor, HP stacks, ailment chance ---- */
function ti(x){return Math.floor(x+0.5);}
function labelled2(z,labels,afterOK){var t=numTokens(z),w=t.w,res={},free=[];afterOK=afterOK||[];
  t.n.forEach(function(nm){var best=null;
    Object.keys(labels).forEach(function(k){labels[k].forEach(function(a){var ap=a.split(' ');
      for(var i=0;i+ap.length<=w.length;i++){var ok=true,j;for(j=0;j<ap.length;j++)if(w[i+j]!==ap[j]){ok=false;break;}
        if(!ok)continue;var end=i+ap.length-1,before=end<nm.i,d=before?nm.i-end:i-nm.i;
        if(d<1||d>3)continue;if(!before&&afterOK.indexOf(k)<0)continue;
        var sc=d*2+(before?0:1)-ap.length*0.1;if(!best||sc<best.s)best={k:k,s:sc};}});});
    if(best&&!res[best.k])res[best.k]={v:nm.v,pct:nm.pct,i:nm.i};else free.push({v:nm.v,pct:nm.pct,i:nm.i});});
  res._free=free;return res;}
function negWords(z){return z.replace(/ (?:reduced by|reduces by|reduce by|lowered by|lowers by|lower by|decreased by|decrease by|reduced|reduces|reduce|lowered|lowers|lower|decreased|decrease|minus|less) (\d+(?:\.\d+)?)(%?)(?= )/g,' -$1$2');}

/* parry: attacker modifiers applied over (target modifiers applied over the Parry stat), limited to 0..95 */
function calcParry(z){if(!(has(z,'parry')||has(z,'parries')||has(z,'parrying')))return null;
  z=negWords(z);
  var o=labelled2(z,{p:['parry stat','parry chance','parry'],att:['attacker','attackers','attacker modifier','attackers modifier'],tg:['target','defender','my','your','own']},['att','tg']);
  if(!o.p)return null;
  var tp=o.tg?o.tg.v:0,ap=o.att?o.att.v:0,r=run('parry_chance',{parry:o.p.v,target_pct:tp,attacker_pct:ap});if(!r)return null;
  var v0=ti(o.p.v),v1=ti(v0*(100+tp)/100),v2=ti(v1*(100+ap)/100),L=['Parry stat <b>'+fmt(o.p.v)+'</b>'];
  if(o.tg)L.push('Target side '+(tp>0?'+':'')+fmt(tp)+'% = '+fmt(v1));
  if(o.att)L.push('Attacker side '+(ap>0?'+':'')+fmt(ap)+'% = '+fmt(v2));
  var lost=o._free.filter(function(f){return f.pct;});
  var body=line(L.join(' \u2192 ')+' \u2192 <b>'+fmt(r.value)+'% parry chance</b> (always kept between 0% and 95%; rounded after each step).')+
    line('Only direct attacks and debuffs can be parried, never buffs. Several effects cannot be parried at all. Flat modifiers and "set to" effects are not included.')+
    (lost.length?line('I left out '+lost.map(function(f){return fmt(f.v)+'%';}).join(', ')+' because I could not tell which side it belongs to. Write it as "attacker +20%" or "target +20%".'):'')+
    line('<i>'+esc(badge(r.status))+'</i>');
  return card('Parry chance','calculator \u00b7 '+labelOf(r.status),body,[['How does parry work?','how does parry work'],['Parry 40, attacker -20%','parry 40 attacker -20%']]);}

/* source armor: extra armor for damage over time, delayed, reflect and pursuit damage; limit 75, multiplies with normal armor */
var SRC=['source','dot','dots','damage over time','over time','poison','burn','bleed','doomsday flame','doomsday','explode','explosion','frostbite','hex','delay','delayed','delay damage','electric','karma','revenge','thorn','thorns','reflect','reflected','reflect damage','pursuit','erosion','hidden blade','spell bullet'];
function calcSource(z){if(!(has(z,'armor')||has(z,'armour')))return null;
  if(!SRC.some(function(s){return has(z,s);}))return null;
  var lab={dmg:['damage','dmg','hit','hits','tick','ticks'],src:[],arm:['armor','armour']};
  SRC.forEach(function(s){lab.src.push(s+' armor');lab.src.push(s+' armour');});
  var o=labelled2(z,lab,['dmg','src','arm']);if(!o.src)return null;
  var cap=(has(z,'iron')||has(z,'sanctuary')||has(z,'mutation'))?95:75,L=[],base,sr,main,st;
  if(!o.dmg){sr=run('source_armor',{v:100,src_armor:o.src.v});if(!sr)return null;
    return card('Source armor','calculator \u00b7 '+labelOf(sr.status),line(fmt(o.src.v)+'% source armor cuts that kind of damage by <b>'+fmt(100-sr.value)+'%</b> (limit 75%). Give me a damage number and I will work out the result.')+line('<i>'+esc(badge(sr.status))+'</i>'),[['100 poison damage, 40% poison armor','100 poison damage against 40% poison armor']]);}
  base=o.dmg.v;L.push(fmt(base)+' damage');st='verified';
  if(o.arm){main=run('armor_reduction',{v:base,armor:o.arm.v,cap:cap});if(!main)return null;base=main.value;st=weakest(st,main.status);L.push('after '+fmt(o.arm.v)+'% normal armor: '+fmt(base));}
  sr=run('source_armor',{v:base,src_armor:o.src.v});if(!sr)return null;st=weakest(st,sr.status);
  var f=run('final_damage',{v:sr.value});if(!f)return null;
  L.push('after '+fmt(o.src.v)+'% source armor'+(o.src.v>75?' (counts as 75%, the limit)':''));
  var body=line(L.join(' \u2192 ')+' = <b>'+fmt(f.value)+'</b> damage.')+
    line('Source armor only works on its own kind of damage: damage over time (Bleed, Burn, Poison, Doomsday Flame), delayed (Explode, Frostbite, Hex), reflect (Electric, Karma, Revenge, Thorn) or pursuit (Erosion, Hidden Blade, Spell Bullet). It is limited to 75% (never 95%) and multiplies with normal armor. The extra armor that a few named state attacks have is not included.')+
    line('<i>'+esc(badge(st))+'</i>');
  return card('Source armor','calculator \u00b7 '+labelOf(st),body,[['How does armor work?','how does armor work']]);}

/* HP stacks: gain (capped at the maximum), lose (Guts can save it, never below 0), reset (maximum) */
function calcStacks(z){if(!(has(z,'stack')||has(z,'stacks')))return null;
  var gainW=/ (gain|gains|gained|gaining|regain|regains|restore|restores|restored|add|adds|added|heal|heals|refill|refills|reset|resets) /.test(z),
      loseW=/ (lose|loses|lost|losing|remove|removes|removed|drain|drains|drained|spend|spends|spent|take|takes) /.test(z);
  if(gainW===loseW)return null;
  var reset=/ (reset|resets|refill|refills) /.test(z),
      o=labelled2(z,{g:['guts'],amt:['gain','gains','gained','gaining','regain','regains','restore','restores','add','adds','heal','heals','lose','loses','lost','losing','remove','removes','removed','drain','drains','spend','spends','take','takes'],
        max:['max','maximum','out of','of'],cur:['have','having','current','currently','at','with','got','holding']},['g']),
      free=o._free.filter(function(f){return !f.pct||true;}).map(function(f){return f.v;}),
      cur=o.cur?o.cur.v:null,mx=o.max?o.max.v:null,am=o.amt?o.amt.v:null,g=o.g?o.g.v:null;
  function fill(){return free.length?free.shift():null;}
  if(gainW){
    if(reset){if(mx===null)mx=fill();if(mx===null)return null;var rr=run('hp_stack_reset',{max_stacks:mx});if(!rr)return null;
      return card('HP stacks','calculator \u00b7 '+labelOf(rr.status),line('A reset sets the stacks to the maximum: <b>'+fmt(rr.value)+'</b> (Camp, the Scapegoat gear effect and Call Miracle do this).')+line('<i>'+esc(badge(rr.status))+'</i>'),[['How do HP stacks work?','how do hp stacks work']]);}
    if(cur===null)cur=fill();if(mx===null)mx=fill();if(am===null)am=fill();
    if(cur===null||mx===null||am===null)return null;
    var r=run('hp_stack_gain',{cur:cur,max_stacks:mx,amount:am});if(!r)return null;
    var txt=cur>=mx?'The stacks are already full ('+fmt(cur)+' of '+fmt(mx)+'), so nothing is gained.':'Gain '+fmt(am)+' HP stack'+(am===1?'':'s')+': '+fmt(cur)+' \u2192 <b>'+fmt(r.value)+'</b> of '+fmt(mx)+(cur+am>mx?' (capped at the maximum).':'.');
    return card('HP stacks','calculator \u00b7 '+labelOf(r.status),line(txt)+line('A gain needs the effect to hit, a living target and stacks that are not full. It adds the effect\u2019s value and stops at the maximum.')+line('<i>'+esc(badge(r.status))+'</i>'),[['How do HP stacks work?','how do hp stacks work']]);}
  if(cur===null)cur=fill();
  if(am===null)am=/ (a|an|one) (hp )?stack/.test(z)?1:fill();
  if(cur===null||am===null)return null;
  var rl=run('hp_stack_lose',{cur:cur,amount:am});if(!rl)return null;
  var gr=g!==null?run('guts_chance',{guts:g}):null,st2=gr?weakest(rl.status,gr.status):rl.status,L2;
  if(cur<1)L2=line('There are no stacks to lose, so nothing happens.');
  else{L2=line('Lose '+fmt(am)+' HP stack'+(am===1?'':'s')+' from '+fmt(cur)+': if the loss goes through, the stacks drop to <b>'+fmt(rl.value)+'</b> (never below 0).');
    if(gr)L2+=line('Guts '+fmt(g)+' = about <b>'+fmt(gr.value)+'%</b> chance to keep the stacks (nothing is lost); <b>'+fmt(100-gr.value)+'%</b> of the time the loss happens.');
    else L2+=line('No Guts was given, so I counted the loss as certain. Add "guts 30" to include it.');}
  return card('HP stacks','calculator \u00b7 '+labelOf(st2),L2+line('A loss needs the effect to hit a living target that has stacks. Only the stack count changes: HP and shield stay the same and nothing is refilled.')+line('<i>'+esc(badge(st2))+(gr?' The highest value the Guts stat can have is not known yet.':'')+'</i>'),[['How do HP stacks work?','how do hp stacks work'],['With Guts 30','I have 3 hp stacks and lose 1 with guts 30']]);}

/* ailment chance: skill value + your Effective - target Resist, limited to 5..95 */
function calcAilment(z){if(!(has(z,'ailment')||has(z,'status')||has(z,'debuff')||has(z,'inflict')||((has(z,'effective')||has(z,'effectiveness'))&&(has(z,'resist')||has(z,'resistance')))))return null;
  var o=labelled2(z,{hit:['skill value','skill hit','skill chance','skill','base chance','base','ailment chance','status chance','chance'],eff:['effectiveness','effective','my effective'],res:['resist ailment','resistance','resist','target resist','target resistance']},['hit','eff','res']);
  if(!o.hit||(!o.eff&&!o.res))return null;
  var ef=o.eff?o.eff.v:0,rs=o.res?o.res.v:0,r=run('ailment_hit_chance',{skill_hit:o.hit.v,effective:ef,target_resist:rs});if(!r)return null;
  var body=line('Skill value '+fmt(o.hit.v)+' + Effective '+fmt(ef)+' \u2212 target Resist '+fmt(rs)+' = <b>'+fmt(r.value)+'%</b> (always kept between 5% and 95%).')+
    line('The extra Effective / Resist of one specific ailment and special modifiers are not included.')+line('<i>'+esc(badge(r.status))+'</i>');
  return card('Ailment chance','calculator \u00b7 '+labelOf(r.status),body,[['How is the ailment chance worked out?','what is the ailment chance'],['Skill 80, Effective 20, Resist 30','ailment chance skill 80 effective 20 resist 30']]);}
var NEWC=[calcSource,calcParry,calcStacks,calcAilment];
function calcNew(z){for(var i=0;i<NEWC.length;i++){try{var c=NEWC[i](z);if(c)return c;}catch(e){}}return null;}
var CALCS=[calcSource,calcParry,calcStacks,calcAilment,calcArmor,calcCritChance,calcCritDmg,calcHit,calcHpShield,calcGuts,calcDrop,calcBase];
function calculate(z){for(var i=0;i<CALCS.length;i++){try{var c=CALCS[i](z);if(c)return c;}catch(e){}}return null;}

/* ---- starting stats: race + job + origin (read from the guide's own race / job / origin entries) ---- */
var KBM=null,KBMAX=1;
function kbBuild(){KBM={};KBMAX=1;try{JSON.parse(KBE.textContent).forEach(function(r){if(r[0]==='Race'||r[0]==='Job'||r[0]==='Origin'){var k=norm(r[1]).trim();if(!k)return;(KBM[k]=KBM[k]||[]).push(r);var n=k.split(' ').length;if(n>KBMAX)KBMAX=n;}});}catch(e){}}
function findKinds(z){if(!KBM)kbBuild();var w=z.trim().split(' '),picks=[],taken={},i=0;
  while(i<w.length){var hit=0,rows=null,L;for(L=Math.min(KBMAX,w.length-i);L>0;L--){var k=w.slice(i,i+L).join(' ');if(KBM[k]){hit=L;rows=KBM[k];break;}}
    if(hit){var row=null,j;for(j=0;j<rows.length;j++)if(!taken[rows[j][0]]){row=rows[j];break;}
      if(row){taken[row[0]]=1;picks.push(row);}i+=hit;}else i++;}
  return picks;}
function parseRow(str){var o={main:{STR:0,DEX:0,INT:0,PIE:0},hp:0,stacks:0,shield:0,other:{}};
  String(str).split(';').forEach(function(seg){seg=seg.trim();var m;
    if((m=/^Stats:\s*(.*)$/.exec(seg))){var re=/(STR|DEX|INT|PIE|HP)\s+(\d+)/g,x;while((x=re.exec(m[1]))){if(x[1]==='HP')o.hp+=+x[2];else o.main[x[1]]+=+x[2];}}
    else if((m=/^HP Stacks:\s*(\d+)/.exec(seg)))o.stacks+=+m[1];
    else if((m=/^Shield:\s*(\d+)/.exec(seg)))o.shield+=+m[1];
    else if((m=/^Other Stats:\s*(.*)$/.exec(seg))){m[1].split(/,\s*(?=[A-Za-z])/).forEach(function(p){var y=/^(.*?)\s*([+-]\d+(?:\.\d+)?)(%?)$/.exec(p.trim());if(y){var key=y[1]+(y[3]?' %':'');o.other[key]=(o.other[key]||0)+parseFloat(y[2]);}});}});
  return o;}
function simulate(raw,z,c){var picks=findKinds(z);if(!picks.length)return null;var kinds={};picks.forEach(function(p){kinds[p[0]]=1;});var nk=Object.keys(kinds).length;
  var statword=/ (stats|stat|hp|health|shield|stacks|start|starting|base|total|combine|combo|build|lv|level|begin|would have|simulate) /.test(z);
  if(!(nk>=2&&(statword||(c&&c.intent==='simulate'))||nk>=1&&c&&c.intent==='simulate'&&statword))return null;
  var by={Race:null,Job:null,Origin:null},tot={STR:0,DEX:0,INT:0,PIE:0,hp:0,stacks:0,shield:0},other={},names=[],abil=[];
  picks.forEach(function(p){by[p[0]]=p;names.push(p[1]);var o=parseRow(p[2]);['STR','DEX','INT','PIE'].forEach(function(k){tot[k]+=o.main[k];});tot.hp+=o.hp;tot.stacks+=o.stacks;tot.shield+=o.shield;
    Object.keys(o.other).forEach(function(k){other[k]=(other[k]||0)+o.other[k];});});
  var res={},st='verified',ok=true;
  ['STR','DEX','INT','PIE'].forEach(function(k){var a=by.Race?parseRow(by.Race[2]).main[k]:0,b=by.Job?parseRow(by.Job[2]).main[k]:0,d=by.Origin?parseRow(by.Origin[2]).main[k]:0,r=run('start_stat_total',{race:a,job:b,origin:d,gear:0});if(!r)ok=false;else{res[k]=r.value;st=weakest(st,r.status);}});
  if(!ok)return null;
  var missing=[];if(!by.Race)missing.push('race');if(!by.Job)missing.push('job');if(!by.Origin)missing.push('origin');
  var otherTxt=Object.keys(other).map(function(k){var v=other[k],pc=/ %$/.test(k);return esc(k.replace(/ %$/,''))+' '+(v>0?'+':'')+fmt(v)+(pc?'%':'');}).join(' \u00b7 ');
  var body=line('<b>STR '+res.STR+' \u00b7 DEX '+res.DEX+' \u00b7 INT '+res.INT+' \u00b7 PIE '+res.PIE+'</b>')+line('<b>HP '+fmt(tot.hp)+' \u00b7 HP Stacks '+fmt(tot.stacks)+' \u00b7 Shield '+fmt(tot.shield)+'</b>')+(otherTxt?line('Other stats: '+otherTxt):'')+
    line('This is race + job + origin <b>before gear</b>: equipped gear adds on top and I do not guess it'+(missing.length?'; no '+missing.join(' / ')+' was named, so it is not counted':'')+'.')+line('<i>'+esc(badge(st))+'</i>');
  return card(names.join(' \u00b7 '),'starting stats at Lv 1 \u00b7 '+labelOf(st),body,[['Try another combination','Elf Ninja Noble starting stats']]);}

/* ---- rule explanations ---- */
function topicFor(z){var best=null,bl=0;RU.topics.forEach(function(t){t.kw.forEach(function(k){if(has(z,k)&&k.length>bl){bl=k.length;best=t;}});});return best;}
function ruleLine(r){return '<li>'+(r.status==='HYPOTHESIS'?'<i>(HYPOTHESIS)</i> ':'')+esc(r.rule)+'</li>';}
function topicCard(t,z){var rules=(t.rules||[]).map(function(id){return BYID[id];}).filter(Boolean),extra='';
  if(t.id==='enemy_tables'||!rules.length)return card(t.title,"can't calculate yet",line(esc(t.unknown||'This is not known yet, so I will not make up a number.')),CHIPS.slice(0,2));
  if(t.id==='turn'){var tr=run('turn_order',{}),ef=run('enemy_first_chance',{});if(tr&&ef)extra=line('Chance the player acts first: <b>'+fmt(tr.value)+'%</b>. Chance the enemy acts first: <b>'+fmt(ef.value)+'%</b>.');}
  var head=rules.slice(0,3),more=rules.slice(3),hyp=rules.some(function(r){return r.status==='HYPOTHESIS';});
  var html=extra+line('<ul style="margin:4px 0 4px 18px;padding:0">'+head.map(ruleLine).join('')+'</ul>')+
    (more.length?'<details class="qa-fold"><summary>'+more.length+' more rule'+(more.length>1?'s':'')+'</summary><ul style="margin:4px 0 4px 18px;padding:0">'+more.map(ruleLine).join('')+'</ul></details>':'')+
    line('<i>'+(hyp?'Lines marked HYPOTHESIS are best guesses; the rest are checked.':'Checked.')+'</i>');
  return card(t.title,'game rule \u00b7 '+(hyp?'partly estimate':'computed'),html,(t.chips||[]).concat(CHIPS).slice(0,3));}

function handle(raw,c,sl){var z=norm(raw),ents=(sl&&sl.ents)||[],own=!ents.length,r,t;
  r=simulate(raw,z,c);if(r)return r;
  if(own){r=calculate(z);if(r)return r;}else{r=calcNew(z);if(r)return r;}
  t=topicFor(z);if(!t)return null;
  /* a stat name such as "Parry" counts as the topic word itself, not as an item */
  var named=ents.every(function(e){return t.kw.indexOf(String(e).toLowerCase())>=0;});
  if(t.id==='enemy_tables'&&named)return topicCard(t,z);
  if(c&&c.intent==='mechanic'&&c.conf>=0.5&&named)return topicCard(t,z);
  /* "how does Parry work": keep the guide's own stat answer and add the game rule underneath it */
  if(ents.length&&named&&/ (how|what) .*(work|works|calculated|worked out|decided|determined|rolled) /.test(z))return '<!--after-->'+topicCard(t,z);
  return null;}
function reply(text){var z=norm(text),t=topicFor(z);return t?topicCard(t,z):null;}
W.__qaMech={handle:handle,reply:reply,calculate:function(t){return calculate(norm(t));},simulate:function(t){return simulate(t,norm(t),{intent:'simulate'});},topic:function(t){var x=topicFor(norm(t));return x&&x.id;},engine:M};
})();

