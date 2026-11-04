
const modalOverlay = document.getElementById('itemModal');
const modalContent = document.getElementById('modalContent');
const subModalOverlay = document.getElementById('subModal');
const subModalContent = document.getElementById('subModalContent');

/* ---- Skill glossary terms + skill cards ---- */
Object.assign(TERMS, {
  "Immunity": {"icon": IMG[100], "category": "Status", "description": "While under the effect, the effect value of the ailment is reduced to 0."},

  "Transparency": {"icon": IMG[11], "category": "Status", "description": "Negates {{Physical}} damage while effect is active (Excluding critical hits)"},

  "Carrion Accumulation": {"icon": "{{@img:img/page/carrion-accumulation.webp}}", "category": "Status", "description": "This parameter itself has no effect. Referenced by some skills."},

  "Damage over Time": {"icon": "{{@img:img/page/damage-over-time.webp}}", "description": "At the start of their turn, target will receive damage of the corresponding type. There are three types of damage: {{Bleed}}, {{Burn}} and {{Poison}}. The effect lasts for 5 turns under normal circumstances."},
  "Burn": {"icon": IMG[13], "category": "Status", "description": "{{Damage over Time|Magical Damage over Time}}"},
  "Twin Enhancement": {"icon": IMG[53], "category": "Status", "description": "Enhances physical damage and magical damage"},
  "Double Penetration": {"icon": IMG[53], "category": "Status", "description": "Reduce target's physical and magical resistance when attacking.\n\nIf the final resistance is negative, including \"Penetration\" and \"Vulnerable\", the target will lose 1 HP stack every time it takes damage of that element (triggered by the negative resistance, maximum probability 100%)."},
  "Intense Heat": {"icon": "{{@img:img/icons/IMG-021.webp}}", "category": "Status", "description": "HP recovery amount down"},
  "Ailment hit": {"icon": IMG[39], "inline": "after", "description": "This hit chance is increased by Influence and Pollution, and reduced by Resist: Ailments. (Usually 5-95%)\nBasic hit rate of the skill + \"Influence\" + Target's \"Pollution\" - Target's \"Resist: Ailments\" = Final hit rate"},
  "Pure hit": {"icon": "{{@img:img/page/pure-hit.webp}}", "inline": "after", "description": "This hit chance is not affected by any factors."},
  "Cooldown": {"icon": "{{@img:img/page/cooldown.webp}}", "description": "Skill cannot be used again until a certain number of turns have passed after it is used. This number of turns is called the cooldown. There are also status effects that can change the cooldown of skills.\nIn addition, there is also {{Stun}}, which causes skills to be put on cooldown."},
  "Remaining Uses": {"icon": IMG[46], "description": "Each skill has a limit to the number of times it can be used (=Remaining Uses). Some skills consume more than 1 Remaining per use. Remaining can be regained by stopping at the camp.\nSome abilities can reduce the number of uses consumed, but it can never be made less than -1."},
  "Using burst skill": {"icon": IMG[57], "description": "At the end of your turn, if the enemy is alive, your Bravery increases by 1.\nWhen Bravery reaches its maximum value, the skill will change to a burst skill and have different effect than usual.\nBravery will return to 0 after you use a burst skill."},
  "Activate the skill": {"icon": "{{@img:img/page/activate-the-skill.webp}}", "description": "Normally, a skill is selected and used directly in combat to produce an effect.\nIn contrast, some skills exert their exclusive effects when certain conditions are met. (At the start of a turn, when HP is recovered, etc...)\nSuch automatic activation is only possible when the skill is not on cooldown and has 1 or more Remaining Uses."},
  "DEXterity": {"icon": IMG[5], "inline": "before", "description": "One of the basic parameters that affect the power of most skills"},
  "PIEty": {"icon": IMG[3], "inline": "before", "description": "One of the basic parameters that affect the power of most skills"},
  "Direct attack": {"icon": "{{@img:img/page/direct-attack.webp}}", "inline": "after", "description": "Direct attacks trigger Pursuit damage and Reflect damage.\nThere are several other effects that are triggered on direct attacks."},
  "Normal hit": {"icon": IMG[41], "inline": "after", "description": "This hit chance is increased by Accuracy, and reduced by Evasion. (Usually 5-95%)\nBasic hit rate of the skill + \"Accuracy\" + Target's \"Bind\" - Target's \"Evasion\" = Final hit rate"},
  "Previous action hit": {"icon": "{{@img:img/page/previous-action-hit.webp}}", "inline": "after", "description": "This hit chance is determined by the previous part of the skill. If the previous action did not hit, the chance of this action will be 0%."},
  "INTelligence": {"icon": IMG[2], "inline": "before", "description": "One of the basic parameters that affect the power of most skills"},
  "Frostbite Enhancement": {"icon": IMG[31], "category": "Status", "pink": true, "description": "Increases the power of targeted effects"},
  "Electrified Enhancement": {"icon": IMG[23], "category": "Status", "description": "Increases the power of targeted effects"},
  "Shield Amplification": {"icon": IMG[64], "category": "Status", "description": "Increases the amount of shields gained from skills and abilities"},
  "Electrified": {"icon": IMG[23], "category": "Status", "description": "{{Reflect Damage|Magical Reflect Damage}}"},
  "Quick skill": {"icon": IMG[17], "description": "Quick Skills are skills that can be used without ending the turn, allowing the user to use another skill immediately without waiting for the enemy to act."},
  "Physical": {"icon": "{{@img:img/page/physical.webp}}", "inline": "before", "description": "A type of damage.\nDamage has one of three types, and each has its own resistance attribute."},
  "Critical Hit Rate": {"icon": IMG[109], "description": "Some skills have a higher or lower critical hit rate than normal.\nOnly skills with a multiplier other than 100% will be displayed in the skill details."},
  "Poison": {"icon": IMG[59], "category": "Status", "description": "{{Damage over Time|Void Damage over Time}}"},
  "Trick": {"icon": IMG[25], "category": "Status", "pink": true, "description": "Increases DEXterity by a certain amount, and boosts effects of various skills"},
  "Prayer": {"icon": IMG[14], "category": "Status", "pink": true, "description": "Increases PIEty by a certain amount, and boosts effects of various skills"},
  "Bleed": {"icon": IMG[19], "category": "Status", "description": "{{Damage over Time|Physical Damage over Time}}"},
  "STRength": {"icon": IMG[4], "inline": "before", "category": "Status", "description": "One of the basic parameters that affect the power of most skills"},
  "Petrification": {"icon": "{{@img:img/page/petrification.webp}}", "category": "Status", "description": "Each turn, Remaining Uses of all your skill are reduced by the amount"},
  "Summon": {"icon": "{{@img:img/page/summon.webp}}", "description": "{{Summon}}ing allows you to call forth various monsters to fight in your place until their HP reaches 0. (Enemy attacks will also be received by the summoned monsters.)\nIn most cases, summoned monsters are uncontrollable and fight automatically.\n{{Summon}}ing costs the summoner all of their Bravery.\n{{Summon}}ed monsters are instantly destroyed when they are banished."},
  "Substitute": {
    "icon": IMG[11],
    "category": "Status",
    "description": "Negates {{Physical|Physical}} damage (Excluding critical hits)\nImmediately removed when attacked by physical element"
  },
  "Summon Damage": {
    "icon": IMG[12],
    "pink": true,
    "description": "{{Summon|Summon}}ed minions gain Almighty."
  },
  "Summon Health": {
    "icon": IMG[12],
    "description": "{{Summon|Summon}}ed minions gain increased Maximum HP."
  },
  "Decay": {
    "icon": "{{@img:img/page/decay.webp}}",
    "description": "When receiving HP recovery effect, take damage instead"
  },
  "Preemptive Use": {"icon": "{{@img:img/page/preemptive-use.webp}}", "description": "Skills with \"Preemptive Use\" will be auto-used immediately at the start of combat if the skill's current mode has it."},
  "Influence": {"icon": IMG[39], "category": "Status", "pink": true, "description": "Increases chance of inflicting ailments on enemies"},
  "Pursuit Damage": {"icon": "{{@img:img/page/pursuit-damage.webp}}", "description": "Whenever you deal direct damage of a certain type, you will deal additional damage of the corresponding type. There are three types of damage: {{Hidden Blade}}, {{Light Bullet}} and {{Erosion}}. The effect lasts for 5 turns under normal circumstances."},
  "Hidden Blade": {"icon": IMG[76], "category": "Status", "description": "{{Pursuit Damage|Physical Pursuit Damage}}"},
  "Light Bullet": {"icon": IMG[32], "category": "Status", "description": "{{Pursuit Damage|Magical Pursuit Damage}}"},
  "Erosion": {"icon": "{{@img:img/page/erosion.webp}}", "category": "Status", "description": "{{Pursuit Damage|Void Pursuit Damage}}"},
  "Reflect Damage": {"icon": "{{@img:img/page/reflect-damage.webp}}", "description": "Whenever you receive direct damage, you will deal corresponding elemental damage. There are three types of damage: {{Thorns}}, {{Electrified}} and {{Retaliation}}. The effect lasts for 5 turns under normal circumstances."},
  "Thorns": {"icon": IMG[96], "category": "Status", "description": "{{Reflect Damage|Physical Reflect Damage}}"},
  "Retaliation": {"icon": "{{@img:img/page/retaliation.webp}}", "category": "Status", "description": "{{Reflect Damage|Void Reflect Damage}}"},
  "Mutation": {"icon": IMG[108], "category": "Status", "description": "Increases Resist: Void and raises the Resist: Void reduction limit to 95%"},
  "Invincible": {"icon": IMG[80], "category": "Status", "description": "Damage will not be received"},
  "Insanity": {"icon": "{{@img:img/page/insanity.webp}}", "category": "Status", "description": "Each turn, chance of becoming Confused.\nDecreases Resist: {{Void}}."},
  "Tidal Current": {"icon": "{{@img:img/page/tidal-current.webp}}", "category": "Status", "description": "Each time you or your enemy's HP reaches 0, an HP stack will be consumed instantly, instead of at the start of the turn."},
  "Curse": {"icon": IMG[35], "category": "Status", "description": "{{Delayed Damage|Void Delayed Damage}}"},
  "Delayed Damage": {"icon": "{{@img:img/page/delayed-damage.webp}}", "category": "Status", "description": "When the effect is applied, the target takes damage of the corresponding type after 3 turns.\nThere are three types of damage: {{Explosion}}, {{Frostbite}} and {{Curse}}. If the effect is cleansed or combat ends before it activates, the damage will not be received."},
  "Explosion": {"icon": IMG[104], "category": "Status", "description": "{{Delayed Damage|Physical Delayed Damage}}"},
  "Explosion Piercing": {"icon": IMG[104], "category": "Status", "description": "Increases direct damage you deal to enemies suffering from {{Explosion}}"},
  "Frostbite": {"icon": IMG[31], "category": "Status", "description": "{{Delayed Damage|Magical Delayed Damage}}"},
  "Accuracy": {"icon": IMG[41], "category": "Status", "pink": true, "description": "Increases Accuracy."},
  "Ironclad": {"icon": IMG[78], "category": "Status", "description": "Increases Resist: {{Physical}} and raises the Resist: {{Physical}} reduction limit to 95%"},
  "Sanctuary": {"icon": IMG[27], "category": "Status", "description": "Increases Resist: {{Magical}} and raises the Resist: {{Magical}} reduction limit to 95%"},
  "Haste": {"icon": IMG[20], "category": "Status", "description": "Decreases cooldowns"},
  "Consumption": {"icon": IMG[45], "category": "Status", "description": "Reduces the number of uses consumed when using skills (up to 1). (Max:$$-99$$)"},
  "Dim": {"icon": "{{@img:img/page/dim.webp}}", "category": "Status", "description": "The quick effect of skills is disabled (the turn will end no matter what skill you use)"},
  "Always": {"icon": "{{@img:img/page/always.webp}}", "title": "[Always]", "description": "Some skills give the skill holder an always-on bonus in certain modes.\nThe always-on bonus is valid only when Remaining Uses of the skill has been used is 1 or more."},
  "Stun": {"icon": "{{@img:img/page/stun.webp}}", "description": "This effect forces the target skill(s) to be put on cooldown. It has no effect on skills that are already on cooldown."},
  "Slow": {"icon": IMG[20], "category": "Status", "description": "Increases cooldowns"},
  "Alt mode": {"icon": "{{@img:img/page/alt-mode.webp}}", "description": "Some skills have an alt mode.\nWhen they switch to alt mode, the skill changes to have a different effect than normal.\nThe mode can change depending on various factors such as skills and runes."},
  "Max HP": {"icon": IMG[1], "description": "When HP and HP stacks reach 0, the character dies"},
  "Serious injury": {"icon": "{{@img:img/page/serious-injury.webp}}", "category": "Status", "description": "HP stacks cannot be restored"}
});

/* pink "Extension" status lines used by Gloomy (own icons, text taken from the game popups) */
Object.assign(TERMS, {
  "Hidden Blade Extension": {icon: IMG[97], category: "Status", pink: true, description: "Increases the duration of this effect applied on yourself (Max:~~+5~~)"},
  "Poison Extension": {icon: IMG[98], category: "Status", pink: true, description: "Increases the duration of this effect applied on enemies (Max:~~+5~~)"},
  "Thorns Extension": {icon: IMG[96], category: "Status", pink: true, description: "Increases the duration of this effect applied on yourself (Max:~~+5~~)"}
});

/* Ward/Tempo/Insanity/Tidal Current live in TERMS, which is completed after the tables are first built, so add the dungeon status rows now. */
[tbody, tbody2, tbody3, tbody4].forEach(tb=>{
  [...tb.children].forEach(tr=>{
    const td = tr.firstElementChild;
    if(!td || td.querySelector('.dungeon-status-list')) return;
    const name = Object.keys(DUNGEON_STATUS).find(n=>n.toLowerCase()===tr.dataset.boss);
    if(name && td.textContent.trim()===name) td.insertAdjacentHTML('beforeend', dungeonStatus(name));
  });
});

