
/* ===== Reasoning layer v8 =====
   What it adds: the Ask box now works out what a vague question is really asking for. It reads the wording (synonyms,
   slang, typos, "I keep dying", "something tanky", "I'm a mage"), turns it into goals such as surviving, healing or burn damage,
   scores every piece of gear and every skill in the guide against those goals, and plans which bosses drop the most of them.
   Everything is computed offline from the guide's own tables; nothing is invented. The card shows its working ("Why these?").
   How it plugs in (nothing existing is replaced):
     - window.__qaStrat.detect is wrapped: the engine's own strategy answers still go first; this layer only answers what they
       leave over, and only when the engine itself would say "I couldn't match" or the question is clearly goal-shaped.
     - the card carries ctx, so the online "Smart answer" (callAI) receives a focused, pre-computed context for vague questions.
     - window.__qaPre is wrapped for typed follow-ups ("armor only", "7 star only", "why", "more") on top of one of these cards.
     - window.__qaReason exposes parse/solve for testing. The failure text "I couldn't match" is never produced here.
     - Understanding Core v1 (the script right after this one) sits in front of this layer on window.__qaPre. For a question it restated, parse() asks
       window.__qaUnderstanding.applyTo(P,text) for the structured reading (goals, slot, stars, slots to leave out); __qaReason.takesUnderstanding tells it so.
       The adj words ("durable", "skill uses") are what the card buttons and follow-ups say, so they must be words no other strategy claims. */
(function(){'use strict';
var STR=window.__qaStrat;
if(!STR||typeof STR.detect!=='function'||!document.getElementById('qaOut'))return;

var esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
var nz=function(s){return String(s).toLowerCase().replace(/[\u2018\u2019']/g,'').replace(/[^a-z0-9]+/g,' ').trim();};
var plain=function(s){return String(s||'').replace(/\{\{([^}]*)\}\}/g,function(m,i){var p=i.split('|');return p[1]||p[0];}).replace(/\[\[(.+?)\]\]/g,'$1').replace(/%%(.+?)%%/g,'$1').replace(/~~(.+?)~~/g,'$1').replace(/@@(.+?)@@/g,'$1').replace(/\^\^(.+?)\^\^/g,'$1').replace(/\$\$/g,'').replace(/##(.+?)##/g,'$1');};
var L=function(s){return (s||'').split(',').map(function(x){return x.trim();}).filter(function(x){return x&&x!=='\u2014';});};
var g=function(n){try{return (0,eval)('typeof '+n+'!=="undefined"?'+n+':null');}catch(e){return null;}};
function dist(a,b){var p=[],i,j,c,d;for(j=0;j<=b.length;j++)p[j]=j;for(i=1;i<=a.length;i++){d=p[0];p[0]=i;for(j=1;j<=b.length;j++){c=p[j];p[j]=Math.min(p[j]+1,p[j-1]+1,d+(a.charAt(i-1)===b.charAt(j-1)?0:1));d=c;}}return p[b.length];}
function cnt(re,s){re.lastIndex=0;var m=s.match(re);return m?m.length:0;}
function uniq(a){var o=[],s={};a.forEach(function(x){if(!s[x]){s[x]=1;o.push(x);}});return o;}
var SLOTS=['weapon','armor','accessory','skill'];
var SLN={weapon:['weapon','weapons'],armor:['armor','armor'],accessory:['accessory','accessories'],skill:['skill','skills']};

/* ---------- goal concepts ----------
   id, label (how the card names it), adj (the word used in the typed follow-up "armor for a <adj> build"),
   t = strong trigger words, w = weak trigger words, lex = words used to repair typos,
   stat = gear stat names that count, side = stat names that count half, abil = ability names that count,
   desc = ability wording that counts, sk = skill wording that counts (or a function),
   kb = wording in the Race/Job/Origin codex that counts. */
var C=[
 {id:'survive',label:'staying alive',adj:'durable',
  t:'surviv\\w*|tank\\w*|bulk\\w*|durab\\w*|sturdy|unkillable|immortal\\w*|squish\\w*|fragile|stay(?:ing)? alive|not die|keeps? dying|dying|defen[cs]\\w*|protect\\w*|damage reduction|health pool|sponge|toughen\\w*|shield build',
  w:'die|dies|died|death|hp|health|hit points|resist\\w*|safe\\w*|shield|shields',
  lex:'survive survival tanky tank tanking bulky durable sturdy defense defence protection immortal squishy fragile dying unkillable',
  stat:'^(Max HP Stacks|Max HP|Max HP\\+Shield|Shield|Shield Amplification|Shield Regeneration|Guts|Ironclad|Sanctuary|Sanctuary Enhancement|Direct Damage Resistance|Indirect Damage Resistance|Dual Resistance|Healthy Resistance|Defiant Resistance|Resist: .+|Convert Resist: .+|Stack Refill|Toughness|Mutation)$',
  side:'^(Evasion|Healthy Evasion|Defiant Evasion|Parry|Avoid Critical|Steady|Rest|Healing Power)$',
  abil:'^(Steel body|Robust|Protection of Flaus|Willpower)$',
  desc:'will not die|ignore HP stack reduction|damage taken|damage received|negates .* damage|no longer take|regain \\+?1 HP stack|restore 1 HP stack|HP stacks? (?:are |is )?restored|immune|Immunity|Invincible|Guts|Ironclad|Sanctuary|Resist:',
  sk:function(r){return r.surv?3:0;},
  kb:'Shield|HP Stacks?|Resist|Ironclad|Guts|Robust|Steel Body|Immortality|Eternal Youth|Dignity|Sanctuary|Plating|Invincib|Vigor|Barrier|Substitute|Spirit Form'},
 {id:'heal',label:'healing and recovery',adj:'healing',
  t:'heal\\w*|regen\\w*|recover\\w*|restor\\w*|sustain\\w*|life ?steal|leech\\w*|drain\\w*|mend\\w*|self ?sustain\\w*|revive|resurrect\\w*|replenish hp',
  w:'hp|health|cleric|healer|support|priest',
  lex:'healing heal healer regeneration recovery restore sustain lifesteal leech drain revive resurrect',
  stat:'^(Healing Power|Stack Refill|Rest|Max HP Stacks)$',side:'^(Guts|Toughness|Prayer Enhancement)$',
  abil:'^(Burst Heal|Benefits of Flaus|Tree of Life|Infinite Growth|Lively Pulse|Physical Activity|Secret Path|Schmeat|Body Expansion|Crystal Shell)$',
  desc:'heal|recover|restore .*HP|regain \\+?1 HP stack|HP stacks? (?:are |is )?restored|Healing Power',
  sk:/Heal yourself|Natural Recovery|gain \d+ HP stack|Healing Power|Absorption|Drain Life/,
  kb:'Healing|Heal |Absorption|Natural Recovery|Regenerat|Rest |Delay Heal|Eternal Youth'},
 {id:'stacks',label:'HP stacks',adj:'hp-stack',
  t:'hp stacks?|stacks?|extra lives?|lives|second wind|comeback|second chance|stack refill',w:'revive|resurrect\\w*',
  lex:'stack stacks lives revive resurrect',
  stat:'^(Max HP Stacks|Stack Refill|Guts)$',side:'^(Max HP|Healing Power)$',
  abil:'^(Steel body|Tree of Life|Body Expansion|Crystal Shell|Schmeat|Protection of Flaus)$',
  desc:'HP stacks?',sk:/gain \d+ HP stack|HP stack\(s\)/,kb:'HP Stacks?|Steel Body|Eternal Youth|Bone Graft|Immortality'},
 {id:'phys',label:'physical damage',adj:'physical',
  t:'physical|phys|melee|strength|str|swordsm\\w*|brawl\\w*|bruiser|fighter|berserk\\w*|barbarian|warrior',w:'rage|sword|punch|slash|attack',
  lex:'physical melee strength brawler bruiser fighter berserker barbarian',
  stat:'^(STRength|STRength Expert|STRength\\+DEXterity|STRength\\+PIEty|Physical Penetration|Physical Milling|Rage|Rage Enhancement|Almighty)$',side:'^(DEXterity|DEXterity\\+INTelligence|DEX Mastery)$',
  abil:'^(Spirit flame|Secret of power|Distorted Body|Oriental Swordsmanship)$',desc:'Physical (?:Penetration|damage)|STRength|Rage',
  sk:/Element: Physical/,kb:'Physical|STRength|Rage|Slash|Smash'},
 {id:'magic',label:'magical damage',adj:'magical',
  t:'magic\\w*|mage|mages|caster|casters|spell ?caster|sorcer\\w*|intelligence|wizard\\w*|arcane',w:'int|spell|spells|focus',
  lex:'magic magical mage caster sorcerer wizard intelligence arcane',
  stat:'^(INTelligence|INTelligence Expert|INT Mastery|INTelligence\\+PIEty|DEXterity\\+INTelligence|Magical Penetration|Magical Milling|Magic Conversion|Focus|Focus Enhancement)$',side:'^(Evil Research|PIEty)$',
  abil:'^(Discover weaknesses|Secret of knowledge|Trinity Elemental|Evil Research|Blade of Light|Flaming Burst)$',desc:'Magical|Focus|INTelligence',
  sk:/Element: Magical/,kb:'Magical|Focus|INTelligence|Spell|Teleport|Arcane'},
 {id:'void',label:'void and curse damage',adj:'void',
  t:'void|curse\\w*|hex\\w*|dark magic|shadow\\w*|insan\\w*|madness|necrotic',w:'dark',
  lex:'void curse cursed hex shadow insanity madness',
  stat:'^(Void Conversion|Void Penetration|Void Milling|Curse Enhancement)$',side:'^(Mutation|Eternal Dark)$',
  abil:'^(Black Flame|Hell\'s Thunder|Mirror of the Void|Curse Specialist|Cursed Spirits Summoning|Jet-Black Wave)$',desc:'void|curse',
  sk:/Element: Void|Curse/,kb:'Void|Curse|Insanity|Dark|Shadow|Mutation'},
 {id:'burn',label:'burn (fire) damage',adj:'burn',
  t:'burn\\w*|fire|fiery|flame\\w*|ignit\\w*|scorch\\w*|incinerat\\w*|pyro\\w*|inferno|heat',w:'blaze|hot',
  lex:'burn burning fire fiery flame flames ignite scorch pyro inferno',
  stat:'Burn',side:'^(Attribute Enhancement: .+|Magical Penetration|Magic Conversion)$',
  abil:'^(Burn Specialist|Black Flame|Flames of Doom|Trinity Elemental)$',desc:'\\bBurn\\b',sk:/\bBurn\b/,kb:'Burn|Fire|Flame|Ignit'},
 {id:'frost',label:'frostbite (ice) damage',adj:'frost',
  t:'frost\\w*|ice|icy|cold|freez\\w*|chill\\w*|snow\\w*|blizzard|glacial',w:'winter',
  lex:'frost frostbite ice icy cold freeze freezing chill blizzard',
  stat:'Frostbite',side:'^(Attribute Enhancement: .+|Magical Penetration)$',
  abil:'^(Frostbite Specialist|Ice sculpture|Trinity Elemental)$',desc:'Frostbite',sk:/Frostbite/,kb:'Frostbite|Ice|Frost|Freez'},
 {id:'shock',label:'lightning (electrified) damage',adj:'lightning',
  t:'lightning|electric\\w*|shock\\w*|thunder\\w*|electrif\\w*|volt\\w*|storm',w:'zap',
  lex:'lightning electric electrified shock thunder voltage storm',
  stat:'Electrified',side:'^(Attribute Enhancement: .+|Magical Penetration)$',
  abil:'^(Electrified Specialist|Hell\'s Thunder|Lightning Shield|Trinity Elemental)$',desc:'Electrif',sk:/Electrified/,kb:'Electrified|Lightning|Thunder|Shock'},
 {id:'poison',label:'poison',adj:'poison',
  t:'poison\\w*|venom\\w*|toxic\\w*|toxin\\w*|plague|spiders?',w:'noxious',
  lex:'poison poisoned venom venomous toxic toxin plague spider',
  stat:'Poison',abil:'^(Poison Specialist|Spider Incubation)$',desc:'Poison',sk:/\bPoison\b/,kb:'Poison|Venom|Toxic|Pollution'},
 {id:'bleed',label:'bleed',adj:'bleed',
  t:'bleed\\w*|hemorrhag\\w*|gore',w:'blood\\w*',
  lex:'bleed bleeding blood hemorrhage',
  stat:'Bleed|Bleeding',abil:'^(Bleed Specialist)$',desc:'Bleed',sk:/\bBleed\b/,kb:'Bleed|Blood'},
 {id:'explosion',label:'explosion damage',adj:'explosive',
  t:'explo\\w*|bomb\\w*|blast\\w*|grenade\\w*|dynamite|boom|detonat\\w*',w:'cannon',
  lex:'explosion explosive explode bomb bombs blast grenade dynamite detonate',
  stat:'Explosion',abil:'^(Explosion Specialist|Flaming Burst|Daredevil Voyage)$',desc:'Explosion',sk:/Explosion|Dynamite|Grenade/,kb:'Explosion|Dynamite|Grenade|Cannon'},
 {id:'hiddenblade',label:'hidden blade damage',adj:'hidden-blade',
  t:'hidden blades?|stealth blades?|assassin\\w*|backstab\\w*',w:'ninja|rogue',
  lex:'assassin assassins backstab rogue',
  stat:'Hidden Blade',abil:'^(Hidden Blade Specialist|Blade of Light|Strafing)$',desc:'hidden blade',sk:/Hidden Blade/,kb:'Hidden Blade|Back Stab|Sheathing|Ninja'},
 {id:'lightbullet',label:'light bullets',adj:'light-bullet',
  t:'light bullets?|holy bullets?',w:'bullets?',
  lex:'bullet bullets',
  stat:'Light Bullet',abil:'^(Light Bullet Specialist|Fairy Magic Bullet|Birth of Spirits)$',desc:'light bullet',sk:/Light Bullet/,kb:'Light Bullet|Holy'},
 {id:'reflect',label:'reflect and thorns',adj:'reflect',
  t:'thorn\\w*|reflect\\w*|retaliat\\w*|counter\\w*|revenge|spik\\w*',w:'return damage',
  lex:'thorns thorny reflect reflected retaliation counter revenge spiky',
  stat:'^(Resist: Reflect Damage|Causes and Effects)$',abil:'^(Blood Thorns|Excessive Defense|Friction Disappearance)$',desc:'Reflect|Thorns|Retaliat|Counter|Revenge',sk:/Thorns|Retaliation|Reflect/,kb:'Thorns|Reflect|Retaliation|Retribution'},
 {id:'crit',label:'critical hits',adj:'crit',
  t:'crit\\w*|snip\\w*|lucky hits?|headshot\\w*',w:'luck\\w*',
  lex:'critical crit crits sniping sniper critting',
  stat:'^(Critical|Healthy Critical|Sniping|Final Blow|Summon Critical Rate)$',side:'^(Sure Hit|Accuracy)$',
  abil:'^(Assassination plan|Superhumanity|War Deity)$',desc:'Critical\\+|equal to .* of the Trick|can now critically hit|always be critical',
  sk:/Critical rate|Critical \+|Critical/,kb:'Critical|Sniper|Sniping|Executioner'},
 {id:'speed',label:'speed and cooldowns',adj:'fast',
  t:'fast\\w*|speed\\w*|haste\\w*|quick\\w*|cooldown\\w*|tempo|rapid\\w*|swift\\w*|initiative|first strike|preempt\\w*|extra turns?|extra actions?|act first|additional actions?',w:'turns?|rush',
  lex:'fast faster fastest speed speedy haste quick quicker cooldown cooldowns rapid swift initiative preemptive',
  stat:'^(Haste|Instant Cooldown|Additional Action|Preemptive Strike|Movement Preparation)$',
  abil:'^(Kunoichi Seal|Speed reversal|Space-Time Transition|Ninja Secret|Blessing of Outer Light|Tempo)$',desc:'cooldown|quick|extra \\+2 times',sk:/Haste|Quick|Cooldown|Additional Action/,kb:'Haste|Cooldown|Quick|Preemptive|Movement Preparation|Instant'},
 {id:'uses',label:'skill uses',adj:'skill uses',
  t:'(?:skill )?uses|remainings?|remaining uses|run(?:s|ning)? out|last longer|conserve\\w*|refill\\w*|replenish\\w*|restock\\w*|spam\\w*|more casts?|out of uses',w:'consumption|casts?',
  lex:'uses remaining conserve refill replenish restock spam casts consumption',
  stat:'^(Maximum Uses|Conserve Skill Uses|Replenish when Moving Floors)$',side:'^(Movement Preparation|Boost Proficiency)$',
  abil:'^(Local procurement|Call from Another World)$',desc:'Remainings?|number of uses',sk:function(r){return (r.refill||r.scale)?3:0;},kb:'Remaining|Maximum Uses|Replenish|Consumption|Cooldown -1|Uses'},
 {id:'summon',label:'summons and minions',adj:'minion',
  t:'summon\\w*|minions?|pets?|familiars?|companions?|necro\\w*|golems?|undead|servants?|horde',w:'army',
  lex:'summon summoner summoning minion minions pet pets familiar companion necromancer golem undead servant',
  stat:'^(Summon Damage|Summon Health|Summon Critical Rate|Minion Resistance)$',
  abil:'^(Armed Minions|Birth of Spirits|Cursed Spirits Summoning|Summon Battle Maiden|Blood Modeling|Ice sculpture|Spider Incubation|Mechanic|Post-mortem Domination|Seat of Dominion|Flaus\'s Dominion|Spirit of Love|Minion Possession|Minion Protection|Minion Transfer|Wall of Flesh)$',
  desc:'minion|summon',sk:/Summon .{0,40}to fight|Banish your opponent's minions|minion/i,kb:'Summon|Minion|Command|Necromancer'},
 {id:'evasion',label:'evasion and parrying',adj:'evasive',
  t:'evad\\w*|evasi\\w*|dodg\\w*|agil\\w*|untouchable|avoid\\w*|parr(?:y|ies|ying)|block\\w*|deflect\\w*|riposte',w:'miss\\w*|elusive',
  lex:'evade evasion evasive dodge dodging agile avoid parry parries block deflect riposte elusive',
  stat:'^(Evasion|Healthy Evasion|Defiant Evasion|Parry|Avoid Critical)$',abil:'^(Master\'s Riposte|Skillful guidance)$',desc:'parry|evasion|evade|dodge',
  sk:/Evasion|Parry|Substitute|Transparency/,kb:'Evasion|Parry|Evade|Acrobatics|Defiant Evasion|Healthy Evasion'},
 {id:'ailment',label:'resisting status ailments',adj:'cleansing',
  t:'ailments?|status effects?|debuffs?|immun\\w*|cleans\\w*|cure\\w*|purif\\w*|stun ?resist\\w*|confus\\w*',w:'status|stun\\w*',
  lex:'ailment ailments debuff debuffs immune immunity cleanse cure purify confusion',
  stat:'^(Resist: Ailments|Toughness|Steady|Minion Resistance|Resist: Damage over Time)$',abil:'^(Complete|Devotion|Immovable|Willpower)$',desc:'immun|ailment|status|stun|confusion',
  sk:/cure .{0,12}ailment|Immunity|Remove all yourself's status|Refresh/,kb:'Ailment|Immun|Cure|Willpower|Detox|Toughness'},
 {id:'dot',label:'damage over time',adj:'dot',
  t:'damage over time|dots?|over time|ailment damage|status damage|ticking|ticks?',w:'ailments?',
  lex:'dot dots ticking',
  stat:'^(Damage over Time Enhancement|Influence|Additional Burn|Additional Poison|Permanent Burn|Permanent Bleeding|Burn Enhancement|Poison Enhancement|Bleed Enhancement|Curse Enhancement|Frostbite Enhancement|Electrified Enhancement|Explosion Enhancement)$',
  abil:'Specialist$',desc:'damage can now critically hit|Damage over Time',sk:/Grant (?:Burn|Poison|Bleed|Curse|Frostbite|Explosion)/,kb:'Damage over Time|Burn|Poison|Bleed'},
 {id:'loot',label:'loot and soulstones',adj:'loot',
  t:'loot\\w*|soulstones?|money|gold|coins?|currency|rich|wealth\\w*|greed\\w*|treasure\\w*|chests?|riches|rarity|rarer|drop rate',w:'rare|rarest|farm',
  lex:'loot looting soulstone soulstones money gold coins currency rich wealth greed treasure chest rarity rarer',
  stat:'^(Soulstone Looting|Greed|Gold Rush|Item Rarity|Rune Rarity|Skill Rarity)$',side:'^(Number of Encounters|Crafting Cost)$',
  abil:'^(Contrived Fate)$',desc:'rarity|soulstone',sk:/soulstone|Gold|Greed/i,kb:'Soulstone|Rarity|Greed|Looting|Treasure|Magic Stones|Item Rarity'},
 {id:'craft',label:'crafting and mods',adj:'crafting',
  t:'craft\\w*|forg\\w*|mod board|mod points?|modification|rune slots?|sockets?|upgrad\\w*|enchant\\w*',w:'slots?|mods?',
  lex:'craft crafting forge upgrade upgrades enchant socket',
  stat:'^(Crafting Cost|Add Rune Slot|Rune Slot|Rune Rarity)$',abil:'^(Craftsmanship|Repurposing of Materials|Unknown Forcefield|Eternal Dark|Infinite Light|Plating|Flexible Thinking|Designer\'s perspective)$',
  desc:'craft|rune slot|level up|leveling',sk:/craft|rune/i,kb:'Craft|Modification|Mod |Rune|Reroll'},
 {id:'holy',label:'prayer and holy power',adj:'holy',
  t:'holy|pray\\w*|piety|divine|sacred|saint\\w*|angel\\w*|blessing',w:'pie|light',
  lex:'holy prayer pray piety divine sacred saint angel blessing',
  stat:'^(PIEty|Prayer|Prayer Enhancement|PIE Mastery|INTelligence\\+PIEty|STRength\\+PIEty)$',abil:'^(Benefits of Flaus|Guardian of heaven|Secret of heart)$',desc:'Prayer|PIEty',
  sk:/Prayer|PIEty|Holy|Divine Punishment/,kb:'Prayer|PIEty|Holy|Divine|Saint|Angel'},
 {id:'damage',label:'dealing more damage',adj:'damage',
  t:'hit(?:s|ting)? hard(?:er|est)?|burst\\w*|nukes?|nuking|one ?shot\\w*|one-shot\\w*|big hits?|big damage|massive damage|harder|hardest|dps|more damage|kill faster|powerful|glass cannon|hurt more|deal more',
  w:'damage|dmg|strong(?:er|est)?|power|offen[cs]\\w*|attack\\w*|kill\\w*|hit|hits',
  lex:'damage dmg damaging burst nuke oneshot harder hardest powerful offense offence attack dps',
  stat:'^(Skill Power|Double Penetration|Physical Penetration|Magical Penetration|Void Penetration|Skill Boost|Boost Proficiency|Final Blow|Sniping|Critical|Almighty|Explosion Piercing|Burn Piercing)$',side:'^(Additional Action|Physical Milling|Magical Milling|Void Milling|STRength Expert|INTelligence Expert)$',
  abil:'^(Steady Efforts|Inexorable Progress|Secret of power|Secret of knowledge|Secret of heart|Secret of technique|Complete Mastery|Maturity|Oriental Swordsmanship|Mirror of the Void|Shadow Replica|Spirit flame|Discover weaknesses|Trinity Elemental|War Deity|Superhumanity)$',
  desc:'skill power|penetration|additional time|trigger an additional',sk:function(r){return r.direct?Math.min(3,Math.max(0,Math.log(Math.max(1,r.mult*r.hits)/300)/Math.LN2)):0;},kb:'Enhancement|Penetration|Skill Power|Burst'},
 {id:'control',label:'locking down enemies',adj:'control',
  t:'stuns?|stunn\\w*|slow\\w*|bind\\w*|lock ?down|crowd control|cc|disabl\\w*|petrif\\w*|paraly\\w*|immobili\\w*|control',w:'stone',
  lex:'stun stunning slow slowing bind lockdown disable petrify paralyze immobilize control',
  stat:'^(Preemptive Strike|Influence|Sure Hit)$',abil:'^(Evil-Slaying Glow|Chivalry|Odor|Blaming others|Enchanting Allure)$',desc:'stun|enemy Bravery|remove all temporary effects|Temptation',
  sk:/Stun|Slow|Bind|Petrif|Skill Lock|Capture|Immovable|Isolation/,kb:'Stun|Slow|Bind|Petrif|Capture|Isolation'}
];
var CID={};
C.forEach(function(c){
  CID[c.id]=c;
  c.tRe=new RegExp('\\b(?:'+c.t+')\\b','gi');c.wRe=c.w?new RegExp('\\b(?:'+c.w+')\\b','gi'):null;
  c.statRe=c.stat?new RegExp(c.stat,'i'):null;c.sideRe=c.side?new RegExp(c.side,'i'):null;c.abilRe=c.abil?new RegExp(c.abil,'i'):null;c.descRe=c.desc?new RegExp(c.desc,'i'):null;
  c.kbRe=c.kb?new RegExp(c.kb,'gi'):null;c.lexA=(c.lex||'').split(' ').filter(Boolean);
  if(c.sk&&c.sk.constructor===RegExp)c.skRe=c.sk;
});
/* concepts that are guidance, not gear: answered with a short "getting started" card */
var BEGIN=/\b(beginn\w*|new player|newbie|noob|starter|first run|early game|just started|getting started|new to (?:the )?game|start with|where (?:do i |to )?start|first time|new here|brand new)\b/;
/* persona words -> concept ids (data still decides what is shown) */
var PERSONA=[
 [/\b(mage|mages|caster|casters|sorcerer|sorceress|spell ?caster)\b/,['magic']],
 [/\b(healer|healers|medic|support|cleric)\b/,['heal']],
 [/\b(tank|tanks|tanky|guardian|bodyguard|defender)\b/,['survive']],
 [/\b(summoner|summoners|minion master|beastmaster)\b/,['summon']],
 [/\b(rogue|rogues|assassin|assassins|stealth)\b/,['crit','evasion']],
 [/\b(archer|archers|sniper|snipers|marksman)\b/,['crit','phys']],
 [/\b(brawler|brawlers|bruiser|berserker|barbarian|fighter|fighters|melee)\b/,['phys']],
 [/\b(glass cannon)\b/,['damage']]
];
var FAMILY={survive:['heal','evasion','stacks'],heal:['survive','stacks','holy'],stacks:['survive','heal'],phys:['crit','damage','speed'],magic:['burn','frost','shock'],
  void:['magic','poison','damage'],burn:['magic','dot','explosion'],frost:['magic','control','dot'],shock:['magic','speed','crit'],poison:['dot','bleed','summon'],bleed:['dot','phys','poison'],
  explosion:['burn','damage','dot'],hiddenblade:['crit','speed','evasion'],lightbullet:['magic','holy','damage'],reflect:['survive','phys','evasion'],crit:['damage','phys','speed'],
  speed:['uses','crit','evasion'],uses:['speed','damage','craft'],summon:['survive','damage','heal'],evasion:['survive','speed','crit'],ailment:['survive','control','heal'],
  dot:['burn','poison','bleed'],loot:['craft','uses','speed'],craft:['loot','uses','damage'],holy:['heal','magic','survive'],damage:['crit','phys','magic'],control:['speed','ailment','survive']};

/* ---------- the guide's data, indexed once on first use ---------- */
var IX=null;
function ix(){
  if(IX)return IX;
  var groups=[['Dungeon','DATA'],['Disaster','CONQUEST'],['Conquest','CONQUEST2'],['Special','SPECIAL']];
  var bosses=[],items={};
  groups.forEach(function(gr){
    (g(gr[1])||[]).forEach(function(r){
      var b={name:r[0],z:nz(r[0]),type:gr[0],drops:{}};
      SLOTS.forEach(function(s,i){b.drops[s]=[L(r[1+i*2]),L(r[2+i*2])];});
      bosses.push(b);
      SLOTS.forEach(function(s){[0,1].forEach(function(k){b.drops[s][k].forEach(function(n){
        var key=nz(n)+'|'+s,it=items[key];
        if(!it)it=items[key]={name:n,z:nz(n),slot:s,stars:{},bosses:[],special:false};
        it.stars[k?7:6]=1;
        if(gr[0]==='Special')it.special=true;else if(it.bosses.indexOf(b)<0)it.bosses.push(b);
      });});});
    });
  });
  var real=bosses.filter(function(b){return b.type!=='Special';});
  /* equipment with a tooltip: stats and abilities */
  var ID=g('ITEM_DETAILS')||{},eq=[],eqBy={};
  Object.keys(ID).forEach(function(k){
    var d=ID[k],name=k.replace(/::(weapon|armor|accessory|skill)$/,''),z=nz(name),slot=null,it=null;
    ['weapon','armor','accessory'].forEach(function(s){if(!it&&items[z+'|'+s]){it=items[z+'|'+s];slot=s;}});
    var ab=(d.abilities||(d.ability?[d.ability]:[])).map(function(a){return {n:a.name,d:plain(a.description||'')};});
    var st=(d.stats||[]).map(function(s){return {n:s.name,v:s.masked||s.value||'',d:plain(s.description||'')};});
    var e={key:k,name:name,z:z,slot:slot,it:it,stars:d.stars||0,ab:ab,st:st};
    eq.push(e);if(!eqBy[z])eqBy[z]=e;
  });
  /* how rare each stat or ability is across gear: rarer features say more about an item */
  var df={};
  eq.forEach(function(e){var seen={};e.st.concat(e.ab).forEach(function(f){var k=nz(f.n);if(!seen[k]){seen[k]=1;df[k]=(df[k]||0)+1;}});});
  var N=Math.max(eq.length,1),idf=function(n){return Math.log(1+N/(df[nz(n)]||1));};
  /* skills */
  var rows={};(STR.rows||[]).forEach(function(r){rows[nz(r.n)]=r;});
  /* codex */
  var kb=[];try{kb=JSON.parse(document.getElementById('qaKB').textContent);}catch(e){}
  var ops={items:{}};try{ops=JSON.parse(document.getElementById('qaOpinions').textContent);}catch(e){}
  var cdx=[];kb.forEach(function(e){if(e[0]==='Race'||e[0]==='Job'||e[0]==='Origin'){var o=(ops.items&&ops.items[e[0]]&&ops.items[e[0]][e[1]])||null;cdx.push({type:e[0],name:e[1],z:nz(e[1]),text:e[2],tier:o?o.tier:''});}});
  IX={bosses:bosses,real:real,items:items,eq:eq,eqBy:eqBy,df:df,idf:idf,rows:rows,cdx:cdx,N:N};
  /* names that mean a specific thing: used to leave "tell me about X" style questions to the engine */
  var ent=[],seenE={};
  function addE(name,kind,ref){var z=nz(name);if(z.length<4||seenE[kind+z])return;
    var isC=C.some(function(c){c.tRe.lastIndex=0;return c.tRe.test(z)&&z.split(' ').length===1;});
    if(isC)return;seenE[kind+z]=1;ent.push({z:z,kind:kind,ref:ref,name:name});}
  Object.keys(items).forEach(function(k){var it=items[k];addE(it.name,it.slot==='skill'?'skill':'item',it);});
  eq.forEach(function(e){addE(e.name,'item',e);});
  bosses.forEach(function(b){addE(b.name,'boss',b);});
  cdx.forEach(function(c){addE(c.name,c.type.toLowerCase(),c);});
  ent.sort(function(a,b){return b.z.length-a.z.length;});
  IX.ent=ent;
  return IX;
}

/* ---------- reading a question ---------- */
var LEX=null;
function lexMap(){
  if(LEX)return LEX;LEX={};
  C.forEach(function(c){c.lexA.forEach(function(w){LEX[w]=c.id;});});
  return LEX;
}
function fixTypos(s,fixes){
  var M=lexMap(),keys=Object.keys(M);
  return s.replace(/[a-z]{5,}/g,function(w){
    if(M[w])return w;
    var known=false;try{known=!!(window.__qaKnown&&window.__qaKnown(w));}catch(e){}
    if(known)return w;
    var lim=w.length<=7?1:2,best=null,bd=9;
    keys.forEach(function(k){if(k.charAt(0)!==w.charAt(0)||Math.abs(k.length-w.length)>lim)return;var d=dist(w,k);if(d<=lim&&d<bd){bd=d;best=k;}});
    if(best){fixes.push([w,best]);return best;}
    return w;});
}
var SLOTRE={
  weapon:/\b(weapons?|swords?|greatswords?|staffs?|staves|wands?|guns?|daggers?|bows?|scepters?|spears?|cannons?)\b/,
  armor:/\b(armou?rs?|robes?|clothes|clothing|outfits?|costumes?|suits?|coats?|dress(?:es)?|vests?)\b/,
  accessory:/\b(accessor(?:y|ies)|helm(?:et)?s?|hats?|crowns?|shoes|boots|rings?|amulets?|jewel(?:ry|s)?|trinkets?|charms?|necklaces?|cloaks?|masks?)\b/,
  skill:/\b(skills?|spells?|techniques?|abilities)\b/
};
var STARRE=[/\b(6|six)\s*(?:star|stars)\b/,/\b(7|seven)\s*(?:star|stars)\b/,/\bstars?\s*(6|7)\b/];
function parse(q){
  var X=ix(),raw=String(q==null?'':q),fixes=[];
  var s0=' '+nz(raw.replace(/[\u2605\u2606]/g,' star ').replace(/\*/g,' star '))+' ';
  /* "dies too fast" / "dying quickly" is about dying, not about speed */
  s0=s0.replace(/\b(?:die|dies|dying|died|dead|killed)\s+(?:too |so |really |very |way )?(?:fast|quick\w*|easily|often|a lot|constantly)\b/g,' dying ').replace(/\b(?:too|so) (?:squishy|fragile|weak)\b/g,' squishy ');
  var s=' '+fixTypos(s0.trim(),fixes)+' ';
  var P={raw:raw,s:s,fixes:fixes,cs:[],score:{},slot:null,star:null,boss:null,explain:false,more:false,begin:false,persona:[],ent:[],goal:false,fit:false,farm:false,help:false};
  /* concepts: strong words count 3, weak words 1; a persona word adds its concepts */
  var sc={};
  C.forEach(function(c){var n=cnt(c.tRe,s)*3+(c.wRe?cnt(c.wRe,s):0);if(n)sc[c.id]=n;});
  PERSONA.forEach(function(p){if(p[0].test(s))p[1].forEach(function(id){sc[id]=(sc[id]||0)+3;P.persona.push(id);});});
  /* "damage" next to a specific element/type means that element, not damage in general */
  var ids=Object.keys(sc).sort(function(a,b){return sc[b]-sc[a];});
  if(ids.length>1&&sc.damage&&sc.damage<=1){delete sc.damage;ids=ids.filter(function(i){return i!=='damage';});}
  if(ids.length){var top=sc[ids[0]];P.cs=ids.filter(function(i){return sc[i]>=Math.max(1,top*0.5);}).slice(0,3);}
  P.score=sc;P.ranked=ids;
  /* filters */
  SLOTS.forEach(function(k){if(!P.slot&&SLOTRE[k].test(s))P.slot=k;});
  if(STARRE[0].test(s)&&!STARRE[1].test(s))P.star=6;else if(STARRE[1].test(s)&&!STARRE[0].test(s))P.star=7;else{var m=s.match(/\bstars?\s*(6|7)\b/);if(m)P.star=+m[1];}
  P.explain=/\b(explain|why|how did you|show your working|reasoning)\b/.test(s)&&/\b(explain|why|working|reasoning)\b/.test(s);
  P.more=/\b(show more|more results|more options|more gear|show all|see more)\b/.test(s);
  P.begin=BEGIN.test(s);
  /* entities named in the question */
  var pad=s,used=pad;
  X.ent.forEach(function(e){var i=used.indexOf(' '+e.z+' ');if(i<0&&e.z.length>5&&e.z.charAt(e.z.length-1)!=='s')i=used.indexOf(' '+e.z+'s ');if(i<0)return;P.ent.push(e);used=used.slice(0,i+1)+new Array(e.z.length+1).join('#')+used.slice(i+1+e.z.length);});
  var bs=P.ent.filter(function(e){return e.kind==='boss';});if(bs.length)P.boss=bs[0].ref;
  /* intent */
  P.goal=/\b(build|builds|i want|i need|i wanna|i d like|i would like|looking for|trying to|want to|how (?:do|can|should|would) i|what should i|should i|recommend\w*|suggest\w*|ideas?|advice|tips?|help me|help|what do i need|keep dying|keeps dying|goes? well|pairs? (?:well )?with)\b/.test(s)||/\b(best|good|great|top|better|strongest)\b.*\b(for|gear|stuff|items?|equipment)\b/.test(s)||/\b(stuff|gear|items?|equipment|things?)\b.*\b(for|to make|that (?:make|help))\b/.test(s)||P.persona.length>0||/\b(i m a|im a|i am a|as a)\b/.test(s);
  P.fit=/\b(good|great|useful|worth|suit\w*|fit\w*|work(?:s|ing)? (?:for|with)|decent|viable|enough|ok|okay)\b/.test(s);
  P.farm=/\b(farm\w*|where (?:can|do|should) i (?:get|find|go)|which (?:boss|bosses|dungeon|dungeons)|what (?:boss|dungeon)|where to|obtain|acquire)\b/.test(s);
  P.help=/\b(something useful|anything|where (?:do|should) i start|what now|how do i (?:get )?(?:stronger|better|improve|progress|win)|get stronger|power up|improve|progress|level up|stronger|weak|too weak|useful|help)\b/.test(s);
  /* Understanding Core hook: for a question that core restated, it hands over the structured reading (goals, slot, stars, exclusions) */
  try{if(window.__qaUnderstanding&&window.__qaUnderstanding.applyTo)window.__qaUnderstanding.applyTo(P,raw);}catch(e){}
  return P;
}
window.__qaReasonParse=parse;

/* ---------- turning goals into weights ---------- */
function weights(P){
  var W={},ids=P.cs.slice(),top=P.score[ids[0]]||1;
  ids.forEach(function(id){W[id]=Math.max(0.5,(P.score[id]||1)/top);});
  /* neighbouring concepts count a little, so "tanky" also notices a healing or evasion piece */
  ids.slice(0,2).forEach(function(id){(FAMILY[id]||[]).forEach(function(f){if(!W[f])W[f]=0.18;});});
  return W;
}
function featScore(f,isAb,W){
  var tot=0,why=[],core=false;
  Object.keys(W).forEach(function(id){
    var c=CID[id],w=W[id],s=0;
    if(isAb){
      if(c.abilRe&&c.abilRe.test(f.n))s=1.6;
      else if(c.descRe&&f.d&&c.descRe.test(f.d))s=0.5;
    }else{
      if(c.statRe&&c.statRe.test(f.n))s=1;
      else if(c.sideRe&&c.sideRe.test(f.n))s=0.5;
      else if(c.descRe&&f.d&&c.descRe.test(f.d))s=0.25;
    }
    if(s>=1&&w>=0.5)core=true;
    if(s){var v=s*w*ix().idf(f.n);tot+=v;why.push([f.n,v,id]);}
  });
  return {s:tot,why:why,core:core};
}
function eqSlot(e){if(e.slot)return e.slot;var m=String(e.key).match(/::(weapon|armor|accessory)$/);return m?m[1]:null;}
function starOf(e){if(e.stars)return e.stars>=7?7:e.stars>=6?6:e.stars;if(e.it)return e.it.stars[7]?7:6;return 0;}
function scoreEq(e,W){
  var s=0,why=[],core=false;
  e.st.forEach(function(f){var r=featScore(f,false,W);s+=r.s;if(r.core)core=true;why=why.concat(r.why);});
  e.ab.forEach(function(f){var r=featScore(f,true,W);s+=r.s;if(r.core)core=true;why=why.concat(r.why);});
  why.sort(function(a,b){return b[1]-a[1];});
  var seen={},names=[];why.forEach(function(w){if(!seen[w[0]]){seen[w[0]]=1;names.push(w[0]);}});
  return {s:s,why:names.slice(0,3),core:core};
}
function scoreSkill(r,W){
  var s=0,main=r.t.split(/ \/ [^\/]{2,40} \/ \[On Use\]/)[0];
  Object.keys(W).forEach(function(id){
    var c=CID[id],v=0;
    if(typeof c.sk==='function')v=c.sk(r);
    else if(c.skRe){c.skRe.lastIndex=0;if(c.skRe.test(main))v=2;}
    s+=v*W[id];
  });
  return s;
}
function scoreCodex(c,W){
  var s=0;Object.keys(W).forEach(function(id){var k=CID[id];if(k.kbRe)s+=Math.min(3,cnt(k.kbRe,c.text||''))*W[id];});
  return s;
}

/* v40: questions that need exact stats */
function specialRe(P){var s=(P.s||'')+' '+String(window.__qaOrig||'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ')+' ';
  var ail=(P.cs||[]).some(function(i){return /^(poison|bleed|burn|frost|shock|explosion|dot|ailment)$/.test(i);});
  if(/\b(resist\w*|immun\w*|protect\w*|against)\b/.test(s)&&ail)return {res:true,re:/^(Resist: Damage over Time|Resist: Ailments|Indirect Damage Resistance)$/};
  if(/\bparr\w*/.test(s)&&!/\b(evasion|evade|dodge|avoid\w*)\b/.test(s))return {re:/^(Parry|Master.s Riposte)$/};
  if(/\bshield\w*/.test(s)&&!/\b(hp|health|stacks?)\b/.test(s))return {re:/^(Max HP\+Shield|Shield|Shield Amplification|Shield Regeneration)$/};
  if(/\bmax(?:imum)? hp\b/.test(s)&&!/\bstacks?\b/.test(s)&&!/\bshield\w*/.test(s))return {re:/^(Max HP|Max HP\+Shield)$/};
  return null;}
function scoreSp(e,re){var s=0,why=[];e.st.concat(e.ab).forEach(function(f){if(re.test(f.n)){s+=2;why.push(f.n);}});
  return {s:s>0?s+(starOf(e)>=7?0.2:0):0,why:why.slice(0,3),core:s>0};}
/* ---------- solving ---------- */
function solve(P){
  var X=ix(),W=weights(P),slots=P.slot?[P.slot]:SLOTS.slice(0,3),EX=P.exclude||[],SP=specialRe(P);
  var memo={};
  function sc(e){if(!memo[e.key])memo[e.key]=SP?scoreSp(e,SP.re):scoreEq(e,W);return memo[e.key];}
  var gear={weapon:[],armor:[],accessory:[]},nGear=0;
  X.eq.forEach(function(e){
    var sl=eqSlot(e);if(!sl||!gear[sl]||EX.indexOf(sl)>=0)return;
    if(P.star&&starOf(e)&&starOf(e)!==P.star)return;
    var r=sc(e);if(r.s<=0.4||!r.core)return;nGear++;
    gear[sl].push({e:e,s:r.s,why:r.why});
  });
  SLOTS.slice(0,3).forEach(function(k){gear[k].sort(function(a,b){return b.s-a.s;});});
  var skills=[];
  if((!P.slot||P.slot==='skill')&&EX.indexOf('skill')<0&&!(SP&&SP.res))(STR.rows||[]).forEach(function(r){
    if(P.star&&r.st&&r.st!==P.star)return;
    var s=scoreSkill(r,W);if(s>=1)skills.push({r:r,s:s+(r.st||0)*0.05});
  });
  skills.sort(function(a,b){return b.s-a.s;});
  /* bosses: which fight drops the most pieces that fit the goal */
  var bosses=[];
  if(!P.slot||P.slot!=='skill'||true){
    X.real.forEach(function(b){
      var tot=0,hits=[];
      SLOTS.slice(0,3).forEach(function(sl){
        if(P.slot&&P.slot!=='skill'&&sl!==P.slot)return;
        if(EX.indexOf(sl)>=0)return;
        var best=null;
        [0,1].forEach(function(k){
          if(P.star&&(k?7:6)!==P.star)return;
          b.drops[sl][k].forEach(function(n){var e=X.eqBy[nz(n)];if(!e)return;var r=sc(e);if(r.s>0.4&&r.core&&(!best||r.s>best.s))best={n:n,s:r.s,sl:sl};});
        });
        if(best){tot+=best.s;hits.push(best);}
      });
      if(tot>0)bosses.push({b:b,s:tot,hits:hits});
    });
    bosses.sort(function(a,b){return b.s-a.s||b.hits.length-a.hits.length;});
  }
  var cdx={Race:[],Job:[],Origin:[]};
  X.cdx.forEach(function(c){if(SP&&SP.res)return;var s=scoreCodex(c,W);if(s>0&&cdx[c.type])cdx[c.type].push({c:c,s:s});});
  Object.keys(cdx).forEach(function(k){cdx[k].sort(function(a,b){return b.s-a.s;});});
  return {W:W,gear:gear,skills:skills,bosses:bosses,cdx:cdx,nGear:nGear,sp:SP};
}

/* ---------- rendering ---------- */
var QE=esc;
function eqChip(e){
  var st=starOf(e),sl=eqSlot(e)||'';
  return '<span class="item qa-chip s'+(st>=7?7:6)+'" data-item="'+QE(e.name)+'" data-slot="'+sl+'">'+QE(e.name)+'</span>';
}
function skChip(r){
  var D=g('SKILL_DETAILS');
  if(D&&D[r.n])return '<span class="item qa-chip s'+(r.st>=7?7:6)+'" data-item="'+QE(r.n)+'" data-slot="skill">'+QE(r.n)+'</span>';
  return '<b>'+QE(r.n)+'</b>';
}
function bossChip(b){return '<a href="#" class="idx-link qa-chip qa-boss" data-q="'+QE(b.name)+'">'+QE(b.name)+'</a>';}
function askBtn(label,q){return '<button type="button" class="qa-exbtn" data-ex="'+QE(q)+'">'+QE(label)+'</button>';}
function line(l,t){return '<div class="qa-line"><span class="qa-lab">'+QE(l)+'</span> '+t+'</div>';}
function title(t,s){return '<div class="qa-title">'+QE(t)+'<span class="qa-sub">'+QE(s)+'</span></div>';}
function goalText(P){return P.cs.map(function(id){return CID[id].label;}).join(' + ');}
function adjText(P){return P.cs.map(function(id){return CID[id].adj;}).join(' ');}
function buildQ(P,pre){return (pre?pre+' ':'')+'for a '+adjText(P)+' build';}

function dropsOf(e){
  var it=e.it;if(!it||!it.bosses.length)return it&&it.special?'special drop':'';
  return it.bosses.slice(0,2).map(bossChip).join(' ')+(it.bosses.length>2?' +'+(it.bosses.length-2):'');
}
function render(P,R){
  var X=ix(),n=P.more?9:4,h='',ctx=[];
  var EXN=(P.exclude||[]).map(function(k){return SLN[k]?SLN[k][1]:k;});
  h+=title('Built for: '+goalText(P),'worked out from the guide\'s own tables'+(EXN.length?', leaving out '+EXN.join(' and '):''));
  if(R.sp&&R.sp.res)h+='<div class="qa-note">Only pieces with a matching defence stat are shown (Resist: Damage over Time, Resist: Ailments, Indirect Damage Resistance). The guide has no gear stat for one single ailment.</div>';
  if(P.fixes.length)h+='<div class="qa-note">Read '+P.fixes.map(function(f){return '"'+QE(f[0])+'" as "'+QE(f[1])+'"';}).join(', ')+'.</div>';
  var slots=(P.slot&&P.slot!=='skill'?[P.slot]:(P.slot==='skill'?[]:['weapon','armor','accessory'])).filter(function(k){return (P.exclude||[]).indexOf(k)<0;});
  var shown=0;
  slots.forEach(function(sl){
    var all=R.gear[sl],floor=all.length?all[0].s*0.35:0;
    var list=all.filter(function(x,i){return x.s>=floor;}).slice(0,P.slot?n+4:n);if(!list.length)return;
    h+=line(cap(SLN[sl][1]),'');
    list.forEach(function(x){
      shown++;
      var st=starOf(x.e);
      h+='<div class="qa-line">'+eqChip(x.e)+(st?' '+st+'\u2605':'')+' \u00b7 '+QE(x.why.join(', '))+(dropsOf(x.e)?' \u00b7 '+dropsOf(x.e):'')+'</div>';
    });
    ctx.push(cap(sl)+': '+list.map(function(x){return x.e.name+' ('+x.why.join(', ')+')';}).join('; '));
  });
  if((!P.slot||P.slot==='skill')&&(P.exclude||[]).indexOf('skill')<0){
    var sfloor=R.skills.length?R.skills[0].s*0.35:0;
    var sk=R.skills.filter(function(x,i){return i<2||x.s>=sfloor;}).slice(0,P.slot==='skill'?n+4:n);
    if(sk.length){
      shown++;
      h+=line('Skills','');
      sk.forEach(function(x){
        var r=x.r,main=skillBlurb(r);
        main=main.length>110?main.slice(0,110).replace(/\s+\S*$/,'')+'\u2026':main;
        h+='<div class="qa-line">'+skChip(r)+(r.st?' '+r.st+'\u2605':'')+' \u00b7 '+QE(main)+'</div>';
      });
      ctx.push('Skills: '+sk.map(function(x){return x.r.n+' ('+x.r.t.slice(0,120).replace(/\s+/g,' ')+')';}).join('; '));
    }
  }
  if(!shown){return clarify(P,'Nothing in the guide scored well for "'+goalText(P)+'" with those filters.');}
  /* codex */
  var cd=[];['Race','Job','Origin'].forEach(function(k){
    var l=R.cdx[k].slice(0,2);if(!l.length)return;
    cd.push(k+': '+l.map(function(x){return x.c.name+(x.c.tier?' ('+x.c.tier+')':'');}).join(', '));
    h+='<div class="qa-line"><span class="qa-lab">'+k+'</span> '+l.map(function(x){return '<button type="button" class="qa-exbtn" data-ex="'+QE('Tell me about '+x.c.name)+'">'+QE(x.c.name)+'</button>';}).join('')+'</div>';
  });
  if(cd.length)ctx.push('Race/Job/Origin whose text touches the goal: '+cd.join(' | '));
  /* bosses */
  var bs=R.bosses.slice(0,3);
  if(bs.length){
    h+=line('Where to farm','');
    bs.forEach(function(x){
      h+='<div class="qa-line">'+bossChip(x.b)+' ('+QE(x.b.type)+') \u00b7 '+x.hits.map(function(t){return QE(t.n);}).join(', ')+'</div>';
    });
    ctx.push('Bosses dropping the most matching gear: '+bs.map(function(x){return x.b.name+' ['+x.hits.map(function(t){return t.n;}).join(', ')+']';}).join('; '));
  }
  /* Explain the actual matches, not the scoring machinery. Keep phrasing varied while grounding every reason in listed stats/abilities. */
  var matched=[],seenWhy={};
  slots.forEach(function(sl){(R.gear[sl]||[]).slice(0,P.more?9:4).forEach(function(x){
    (x.why||[]).forEach(function(y){y=String(y||'').trim();if(y&&!seenWhy[y]){seenWhy[y]=1;matched.push(y);}});
  });});
  var topic=goalText(P), explainOpen=P.explain?' open':'';
  var openers=[
    'For <b>'+QE(topic)+'</b>, I prioritized gear whose listed bonuses directly support that goal.',
    'The key is the match to <b>'+QE(topic)+'</b>: these options have listed stats or effects that point in that direction.',
    'I compared the item details against <b>'+QE(topic)+'</b>, then surfaced the pieces with the clearest relevant bonuses.',
    'These picks are based on what their entries actually list for <b>'+QE(topic)+'</b>, rather than a universal tier ranking.'
  ];
  var w='<div class="qa-line">'+openers[Math.floor(Math.random()*openers.length)]+'</div>';
  if(matched.length){
    var concrete=matched.slice(0,8).map(QE).join(', ');
    var whyLines=[
      'Relevant bonuses found in these entries include: <b>'+concrete+'</b>. Check each item line to see which bonuses belong to which piece.',
      'The matching details are <b>'+concrete+'</b>. They are shown beside the gear names so you can compare the actual reasons item by item.',
      'I found these relevant stats/effects in the listed gear: <b>'+concrete+'</b>. A piece is included because its own listed details match the goal.'
    ];
    w+='<div class="qa-line">'+whyLines[Math.floor(Math.random()*whyLines.length)]+'</div>';
  } else {
    w+='<div class="qa-line">The guide entries provide the basis for these matches, but I could not extract a concise list of specific bonuses for this result.</div>';
  }
  if(bs.length)w+='<div class="qa-line">For farming, the boss names beside an item indicate its listed drop source; they are not a separate power ranking.</div>';
  w+='<div class="qa-line">This is a relevance match to your goal, not proof that one option wins in every build.</div>';
  h+='<details class="qa-more qa-fold"'+explainOpen+'><summary>Why these?</summary>'+w+'</details>';
  /* follow-ups */
  var f='';
  if(P.slot!=='armor')f+=askBtn('Armor only',buildQ(P,'armor'));
  if(P.slot!=='weapon')f+=askBtn('Weapons only',buildQ(P,'weapons'));
  if(P.slot!=='accessory')f+=askBtn('Accessories only',buildQ(P,'accessories'));
  if(P.slot!=='skill')f+=askBtn('Skills only',buildQ(P,'skills'));
  if(P.star!==7)f+=askBtn('7\u2605 only',buildQ(P,(P.slot?SLN[P.slot][1]:'gear')+' 7 star'));
  if(P.star!==6)f+=askBtn('6\u2605 only',buildQ(P,(P.slot?SLN[P.slot][1]:'gear')+' 6 star'));
  if(!P.more)f+=askBtn('Show more',buildQ(P,'show more '+(P.slot?SLN[P.slot][1]:'gear')));
  var rel=uniq((FAMILY[P.cs[0]]||[]).slice(0,2));
  rel.forEach(function(id){f+=askBtn('Also: '+CID[id].label,'gear for a '+CID[id].adj+' build');});
  h+='<div class="qa-ex">'+f+'</div>';
  var pre='You are helping with Buriedbornes 2. The question was vague, so the guide data was already scored against the goal "'+goalText(P)+'". The CONTEXT lists the best matches and why. Answer in under 130 words in a neutral factual register, using only the CONTEXT. Do not invent numbers, do not call anything the best, and say when something is not listed.\n';
  window.QA.state.build={q:P.raw,ids:P.cs.slice(),slot:P.slot,star:P.star,P:P};
  return {kind:'reason',html:'<div class="qa-card" data-rc="1">'+h+'</div>',ctx:(pre+ctx.join('\n')).slice(0,5800),names:[]};
}
function skillBlurb(r){
  var t=r.t.split(/ \/ [^\/]{2,40} \/ \[On Use\]/)[0],i=t.search(/\[On [Uu]se\]/);
  if(i>=0)t=t.slice(i).replace(/^\[On [Uu]se\]\s*/,'');
  return t.replace(/\b\d+% (?:Normal|Pure|Ailment) hit\b/g,'').replace(/\s+/g,' ').trim();
}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}

function clarify(P,msg){
  var h=title('Tell me a bit more','I want to point you at the right thing');
  h+='<div class="qa-line">'+QE(msg||'That could mean a few things. Pick what you are after and I will score the whole guide for it.')+'</div>';
  var opts=[['Staying alive','gear for a durable build'],['Healing','gear for a healing build'],['More damage','gear for a damage build'],['Burn damage','gear for a burn build'],['Summons','gear for a minion build'],['Loot','gear for a loot build'],['Skill uses','skills for a skill uses build'],['I am new','what should a beginner start with']];
  h+='<div class="qa-ex">'+opts.map(function(o){return askBtn(o[0],o[1]);}).join('')+'</div>';
  return {kind:'reason',html:'<div class="qa-card" data-rc="1">'+h+'</div>',ctx:null,names:[]};
}
function beginner(P){
  var early=(STR.early||[]).slice(0,8),h=title('Getting started','from the guide data');
  h+='<div class="qa-line">The guide does not rank skills overall. These are cheap skills that heal, shield, dodge or escape, which is what early runs lean on:</div>';
  h+='<div class="qa-ex">'+early.map(function(r){return askBtn(r.n,'Tell me about '+r.n);}).join('')+'</div>';
  h+='<div class="qa-line"><span class="qa-lab">Rule</span> 6\u2605 and 7\u2605 equipment and skills do not appear in rerolls unless you reach Savage mode.</div>';
  h+='<div class="qa-line"><span class="qa-lab">Contracts</span> Contracts are permanent items that are never lost when you die in a dungeon run.</div>';
  h+='<div class="qa-ex">'+askBtn('Survive longer','gear for a durable build')+askBtn('Hit harder','gear for a damage build')+askBtn('Best early race','What is the best early game race?')+'</div>';
  return {kind:'reason',html:'<div class="qa-card" data-rc="1">'+h+'</div>',ctx:'You are helping with Buriedbornes 2. Cheap early skills that heal, shield, dodge or escape: '+early.map(function(r){return r.n;}).join(', ')+'. Contracts are never lost when you die. 6 and 7 star gear does not appear in rerolls unless you reach Savage mode. Answer in under 100 words using only this.',names:[]};
}

/* ---------- plugging in ---------- */
var CODEXRE=/\b(races?|jobs?|class(?:es)?|origins?|contracts?|unions?)\b/;
function answer(q,unmatched){
  var P=parse(q);
  if(P.begin&&!P.cs.length)return beginner(P);
  if(!P.cs.length)return null;
  if(CODEXRE.test(P.s)&&!/\b(gear|items?|equipment|weapons?|armou?r|accessor\w+|skills?|farm\w*|drops?)\b/.test(P.s))return null; /* the engine's race/job/origin cards answer these */
  if(P.ent.length&&!P.goal&&!P.persona.length)return null; /* \"tell me about X\" stays with the engine */
  if(!(P.goal||P.persona.length||P.fit||P.farm||P.help||unmatched||P.slot||P.star))return null;
  if(P.begin)return beginner(P);
  return render(P,solve(P));
}
var D0=STR.detect;
STR.detect=function(q,unmatched){
  var r=D0.apply(STR,arguments);if(r)return r;
  try{return answer(q,unmatched);}catch(e){return null;}
};
/* typed follow-ups on top of one of these cards */
var FOLLOW=[
 [/^(armou?r|armou?rs)(?: only)?$/,function(){return 'armor';}],
 [/^(weapons?)(?: only)?$/,function(){return 'weapons';}],
 [/^(accessor(?:y|ies))(?: only)?$/,function(){return 'accessories';}],
 [/^(skills?)(?: only)?$/,function(){return 'skills';}],
 [/^(?:6|six) ?(?:star|stars)?(?: only)?$/,function(){return 'gear 6 star';}],
 [/^(?:7|seven) ?(?:star|stars)?(?: only)?$/,function(){return 'gear 7 star';}],
 [/^(?:show )?more(?: options| results)?$/,function(){return 'show more gear';}],
 [/^(?:why|explain|how|how come|why these)$/,function(){return 'explain why gear';}]
];
window.QA.pre.add('typed_followups',30,function(Q0){return function(raw){
  try{
    if(window.QA.state.build){
      var t=nz(raw);
      for(var i=0;i<FOLLOW.length;i++){
        if(FOLLOW[i][0].test(t)){
          var ids=window.QA.state.build.ids,adj=ids.map(function(id){return CID[id].adj;}).join(' ');
          return FOLLOW[i][1]()+' for a '+adj+' build';
        }
      }
    }
  }catch(e){}
  return Q0?Q0(raw):raw;
};});
/* a question nothing could place gets a pick-a-goal card instead of \"I couldn't match\" */
if(typeof window.__qaOnline==='function')window.QA.online.add('pick_goal_card',20,function(O0){return function(q,el){
  O0(q,el);
  try{
    if(q&&String(q).trim()&&/I couldn.t match/.test(el.textContent)&&!el.querySelector('[data-rc]')){
      var P=parse(q);el.innerHTML=(P.begin?beginner(P):clarify(P)).html;
    }
  }catch(e){}
};});
window.__qaReason={parse:parse,solve:solve,answer:answer,ix:ix,weights:weights,takesUnderstanding:true};
})();
