const ITEM_DETAILS = {

  "Invisibility Cloak": {
    icon: "{{@img:img/gear/invisibility-cloak.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The cloak makes the wearer invisible, but since the cloak itself is not transparent, it requires some ingenuity to make use of it.",
    ability: { name: "Transparency", color: "#5fd0ff", icon: IMG[11], description: "Negates {{Physical}} damage while effect is active\n(Excluding critical hits)" },
    stats: [
      { name: "Number of Encounters", value: "-50%", masked: "-??%" },
      { name: "Evasion", value: "+25%", masked: "+??%" },
      { name: "Movement Preparation", value: "+50%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Shield", value: "+1727", masked: "+??" }
    ]
  },

  "Ghost jewel crown": {
    icon: "{{@img:img/gear/ghost-jewel-crown.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Forged from blue meteoric iron, the armor absorbs the life of its owner and increases its luster.",
    abilities: [
      { name: "Secret of heart", color: "#ffa63d", icon: IMG[14], description: "Increases skill power of all skills by 100% of {{Prayer||cy}}." },
      { name: "Craftsmanship", color: "#ffa63d", icon: IMG[8], description: "When leveling up, the performance of this equipment is improved" }
    ],
    stats: [
      { name: "Add Rune Slot", value: "+50%", masked: "+??%" },
      { name: "Resist: Magical", value: "+100%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Physical Enhancement", value: "+25%", masked: "+??%" }
    ]
  },

  "Ghost demon": {
    icon: "{{@img:img/gear/ghost-demon.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Forged from blue meteoric iron, the armor absorbs the life of its owner and increases its luster.",
    abilities: [
      { name: "Secret of power", color: "#ffa63d", icon: IMG[18], description: "Increases skill power of all skills by 100% of {{Rage}}." },
      { name: "Craftsmanship", color: "#ffa63d", icon: IMG[8], description: "When leveling up, the performance of this equipment is improved" }
    ],
    stats: [
      { name: "Critical", value: "+50%", masked: "+??%" },
      { name: "Accuracy", value: "+50%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Max HP", value: "+25%", masked: "+??%" }
    ]
  },

  "Remote Possession": {
    icon: "{{@img:img/gear/remote-possession.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "In order to achieve maximum results with minimum risk, the necromancers pursued their tactics and came to one conclusion. The method was to remotely control one individual, who in turn remotely controlled another individual, who in turn remotely controlled another individual, and to send their forces into the battlefield without ever being traced back to the main body.",
    ability: { name: "Minion Possession", color: "#ffa63d", icon: "{{@img:img/gear/pic--minion-possession.webp}}", description: "Your minions are greatly enhanced, but you lose 1 HP stack each time a minion is summoned" },
    stats: [
      { name: "Summon Damage", value: "+50%", masked: "+??%" },
      { name: "Summon Health", value: "+25%", masked: "+??%" },
      { name: "Resist: Large Damage", value: "+50%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Sniping", value: "+100%", masked: "+??%" }
    ]
  },

  "King's Shield": {
    icon: "{{@img:img/gear/king-s-shield.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "One of the national treasures of the Scheinenaue royal family is a shield as tall as a man. It is not something that a human being could handle, but there may have been someone who handled this shield in the past.",
    ability: { name: "Secret Stance", color: "#ffa63d", icon: "{{@img:img/gear/pic--secret-stance.webp}}", category: "Status", description: "Your {{Barrier}} can now also reduce physical damage" },
    stats: [
      { name: "Parry", value: "+30%", masked: "+??%" },
      { name: "Max HP", value: "+4943", masked: "+??" },
      { name: "Resist: Physical", value: "+50%", masked: "+??%" },
      { name: "Healthy Resistance", value: "+50%", masked: "+??%" }
    ]
  },

  "Pillar Shield": {
    icon: "{{@img:img/gear/pillar-shield.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "A large shield as long and slender as a pillar. It was designed to protect not only himself but also his companions in the rear from arrow bullets and magic, and was a piece of equipment that embodied the sense of mission of the knights who protected their companions on the front line.",
    ability: { name: "Shielding", color: "#ffa63d", icon: IMG[44], description: "Negates {{Magical}} damage while effect is active\n(Excluding critical hits)" },
    stats: [
      { name: "Parry", value: "+15%", masked: "+??%" },
      { name: "Resist: Physical", value: "+75%", masked: "+??%" },
      { name: "Avoid Critical", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Appraisal Eye", value: "+15%", masked: "+??%" }
    ]
  },

  "Ghost river crossing": {
    icon: "{{@img:img/gear/ghost-river-crossing.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Forged from blue meteoric iron, the armor absorbs the life of its owner and increases its luster.",
    abilities: [
      { name: "Secret of technique", color: "#ffa63d", icon: IMG[25], description: "Increases skill power of all skills by 100% of {{Trick}}." },
      { name: "Craftsmanship", color: "#ffa63d", icon: IMG[8], description: "When leveling up, the performance of this equipment is improved" }
    ],
    stats: [
      { name: "Maximum Uses", value: "+100%", masked: "+??%" },
      { name: "Evasion", value: "+50%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Shield", value: "+25%", masked: "+??%" }
    ]
  },

  "Helmet of Tsuneyoshi": {
    icon: "{{@img:img/gear/helmet-of-tsuneyoshi.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "It is said that the demigod of the battlefield was once a human being. Those who knew him in his childhood all say that he was a friendly, mild-mannered boy.",
    ability: { name: "Ultimate in Martial Art", color: "#ffa63d", icon: "{{@img:img/gear/pic--ultimate-in-martial-art.webp}}", description: "Whenever your turn starts, all skills you possess switch to alt mode." },
    stats: [
      { name: "Max HP", value: "+4635", masked: "+??" },
      { name: "Guts", value: "+25%", masked: "+??%" },
      { name: "Skill Boost", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Bleed Enhancement", value: "+50%", masked: "+??%" }
    ]
  },


  "Southern Exploration Team": {
    icon: "{{@img:img/gear/southern-exploration-team.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Frigid, uninhabitable areas extend to the northern and southern ends of Saigoku. Many public and private expeditions have gone to investigate these areas, but none of them have yielded any significant discoveries. If expeditions using corpses are conducted in the future, something new may be discovered in these areas.",
    ability: { name: "Local procurement", color: "#ffa63d", icon: IMG[83], description: "Every time you move to a room, the remaining number of uses for all skills becomes 5." },
    stats: [
      { name: "Resist: Ailments", value: "+25%", masked: "+??%" },
      { name: "Minion Resistance", value: "+30%", masked: "+??%" },
      { name: "Crafting Cost", value: "-25%", masked: "-??%" }
    ],
    randomStats: [
      { name: "Thorns Enhancement", value: "+50%", masked: "+??%" }
    ]
  },

  "Idaten": {
    icon: "{{@img:img/gear/idaten.webp}}",
    category: "Equipment",
    stars: 7,
    stats: [
      { name: "Haste", value: "+3", masked: "+?" }
    ]
  },


  "Platinum Helmet": {
    icon: "{{@img:img/gear/platinum-helmet.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Manufactured using an extremely rare metal called platinum. Currently, platinum is depleted in all mountains and is considered unobtainable.",
    ability: { name: "Platinum Coat", color: "#ffa63d", icon: "{{@img:img/gear/pic--platinum-coat.webp}}", description: "All equipment is not affected by equipment deterioration effects." },
    stats: [
      { name: "Resist: Physical", value: "+50%", masked: "+??%" },
      { name: "Direct Damage Resistance", value: "+35%", masked: "+??%" },
      { name: "Convert Resist: Physical", value: "+50%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Magical Absorption", value: "+5%", masked: "+??%" }
    ]
  },


  "Guardian of Fatima": {
    icon: "{{@img:img/gear/guardian-of-fatima.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "There is no point in a third party questioning whether something that needed to be protected was worth protecting. Value is something that people assign to it, and it does not exist universally.",
    ability: { name: "Tree of Life", color: "#ffa63d", icon: "{{@img:img/gear/pic--tree-of-life.webp}}", description: "HP stacks are restored twice as much." },
    stats: [
      { name: "Shield", value: "+2722", masked: "+??" },
      { name: "Max HP+Shield", value: "+25%", masked: "+??%" },
      { name: "Max HP Stacks", value: "1", masked: "??" }
    ],
    randomStats: [
      { name: "Magical Penetration", value: "+25%", masked: "+??%" }
    ]
  },

  "Eternity": {
    icon: "{{@img:img/gear/eternity.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The one who transcends time and space is worthy of the title of eternal. Transcending space-time also means being ubiquitous in all space. It is there and yet not there, nowhere and yet everywhere.",
    abilities: [
      { name: "Immovable", color: "#5fd0ff", icon: IMG[80], description: "You can not get a new status.\nYou can not receive any status cure.\n(\"Remove all status effects\" is acceptable.)" },
      { name: "Plating", color: "#ffa63d", icon: "{{@img:img/gear/pic--plating.webp}}", description: "Whenever this equipment receives an equipment degradation effect, its performance will be enhanced instead." }
    ],
    stats: [
      { name: "Max HP", value: "+4136", masked: "+??" },
      { name: "Max HP Stacks", value: "1", masked: "??" }
    ],
    randomStats: [
      { name: "Ignore Reroll Cost", value: "+25%", masked: "+??%" }
    ]
  },

  "Chief of the Dragoons": {
    icon: "{{@img:img/gear/chief-of-the-dragoons.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The circumstances surrounding the birth of the dragon people are shrouded in mystery, but their existence has been confirmed since the time of the rise of the Flaus cult at the earliest.",
    ability: { name: "Steel body", color: "#ffa63d", icon: "{{@img:img/gear/pic--steel-body.webp}}", description: "Ignore HP stack reduction effects." },
    stats: [
      { name: "Max HP", value: "+4166", masked: "+??" },
      { name: "Max HP Stacks", value: "1", masked: "??" },
      { name: "Avoid Critical", value: "+50%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Defiant Evasion", value: "+50%", masked: "+??%" }
    ]
  },

  "Acheron's Robe": {
    icon: "{{@img:img/gear/acheron-s-robe.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The necromancer Aquelon had feelings for his brother Ix, but after killing him with his own hands, he realized that the true nature of what had been sinking deep within him was envy, and he did not hesitate to use the corpse as his own limb.",
    abilities: [
      { name: "Armed Minions", color: "#ffa63d", icon: "{{@img:img/gear/pic--armed-minions.webp}}", description: "{{Summon}}ed minions gain effects from your weapon." },
      { name: "Minion Transfer", color: "#ffa63d", icon: "{{@img:img/gear/pic--minion-transfer.webp}}", description: "Pass all temporary effects you currently have to the summoned minion" }
    ],
    stats: [
      { name: "Shield", value: "+2667", masked: "+??" },
      { name: "Summon Damage", value: "+40%", masked: "+??%" },
      { name: "Summon Health", value: "+25%", masked: "+??%" }
    ]
  },


  "Self-Indulgence": {
    icon: "{{@img:img/gear/self-indulgence.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Tobacco, imported from Mlima Nyota, has not taken root in the West, and alcoholic beverages are distributed only to the extent that good products are enjoyed by a few chiefs. This is because the more addictive drugs from Woltland dominated the market.",
    abilities: [
      { name: "Cursed Item", color: "#ffa63d", icon: IMG[15], description: "This equipment has much higher performance than normal, but +1 consumption of each skill" },
      { name: "Excessive Defense", color: "#ffa63d", icon: IMG[35], description: "Whenever you take direct damage, additionally activate skill Revenge" }
    ],
    stats: [
      { name: "Shield", value: "+2171", masked: "+??" },
      { name: "Shield", value: "+2152", masked: "+??" },
      { name: "Resist: Void", value: "+75%", masked: "+??%" }
    ]
  },

  "Sven's Clothes": {
    icon: "{{@img:img/gear/sven-s-clothes.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "There are several problems with going back in time. One is that in many cases, the attempt to bring about some kind of change results in an unintended change, without exception. Another is that the time watchers can find out.",
    ability: {
      name: "Space-Time Transition",
      icon: "{{@img:img/gear/pic.webp}}",
      category: "Status",
      description: "Effects that activate at the start of your turn will trigger an extra +2 times"
    },
    stats: [
      { name: "Shield", value: "+2641", masked: "+??" },
      { name: "Resist: Magical", value: "+85%", masked: "+??%" },
      { name: "Movement Preparation", value: "+95%", masked: "+??%" },
      { name: "Skill Boost", value: "+15%", masked: "+??%" }
    ]
  },

  "Queen's Dress": {
    icon: "{{@img:img/gear/queen-s-dress.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "To ensure that the queen's authority was never compromised even in the presence of the opulent nobility of Scheinenaue, her clothing was ordered from the world's finest and made to order. It is said that more than 1,000 exclusive craftsmen worked in the noble districts just for her clothing.",
    stats: [
      { name: "Shield", value: "+3622", masked: "+??" },
      { name: "Resist: Magical", value: "+120%", masked: "+??%" },
      { name: "Shield Amplification", value: "+100%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Toughness", value: "+25%", masked: "+??%" },
      { name: "Resist: Reflect Damage", value: "+50%", masked: "+??%" }
    ]
  },

  "Tsukuyomi": {
    icon: "{{@img:img/gear/tsukuyomi.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Forged from blue meteoric iron, the armor absorbs the life of its owner and increases its luster.",
    abilities: [
      { name: "Barrier Development", color: "#ffa63d", icon: IMG[51], description: "Gain Resist: {{Magical}} equal to 200% of {{Focus}}." },
      { name: "Craftsmanship", color: "#ffa63d", icon: IMG[8], description: "When leveling up, the performance of this equipment is improved" }
    ],
    stats: [
      { name: "Shield", value: "+3644", masked: "+??" },
      { name: "Resist: Magical", value: "+100%", masked: "+??%" }
    ],
    randomStats: [
      { name: "STR Mastery", value: "+25%", masked: "+??%" }
    ]
  },

  "Nobuhide's Armor": {
    icon: "{{@img:img/gear/nobuhide-s-armor.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Nobuhide, who once aimed to unify the eastern provinces, was assassinated by his vassal Hidenari in the midst of his aspirations. Hidenari was also assassinated by his vassal Yasumoto, and the eastern provinces were once again plunged into a war in which the living and the dead mingled.",
    abilities: [
      { name: "Master's Riposte", color: "#ffa63d", icon: "{{@img:img/gear/pic--master-s-riposte.webp}}", description: "Whenever you successfully parry, all skills you own are used automatically" },
      { name: "Robust", color: "#ffa63d", icon: "{{@img:img/gear/pic--robust.webp}}", description: "Halves the damage taken from indirect attacks" }
    ],
    stats: [
      { name: "Max HP", value: "+4140", masked: "+??" },
      { name: "Max HP Stacks", value: "1", masked: "??" },
      { name: "Parry", value: "+30%", masked: "+??%" }
    ]
  },

  "Shelno Clinic": {
    icon: "{{@img:img/gear/shelno-clinic.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Burgtiller's Shelno Clinic was the second largest medical facility after Trae National Hospital and had a large number of talented doctors. However, after the group returned from Lorkor Village, many of the doctors began to suffer from mental abnormalities one after another, and the hospital was eventually shut down.",
    abilities: [
      { name: "Infinite Growth", color: "#ffa63d", icon: "{{@img:img/gear/pic--infinite-growth.webp}}", description: "Whenever you heal your HP, you will earn Max HP+5%/1Floor." }
    ],
    stats: [
      { name: "Max HP", value: "+4154", masked: "+??" },
      { name: "Shield", value: "+2703", masked: "+??" },
      { name: "Healing Power", value: "+35%", masked: "+??%" },
      { name: "Parry", value: "+15%", masked: "+??%" }
    ]
  },

  "Sailor of the Azure Sea": {
    icon: "{{@img:img/gear/sailor-of-the-azure-sea.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "The sailors who crossed the Azure Sea, which had been ruled by demonic creatures since before the day of the prophecy, were so reckless that they were no match for the armies of the three Blastfort nations.",
    abilities: [
      { name: "Daredevil Voyage", color: "#ffa63d", icon: "{{@img:img/gear/pic--daredevil-voyage.webp}}", description: "While {{Explosion}} is applied to you, you will not receive {{Physical}} or {{Magical}} damage" }
    ],
    stats: [
      { name: "Max HP", value: "+3570", masked: "+??" },
      { name: "Max HP Stacks", value: "1", masked: "??" },
      { name: "Healing Power", value: "+25%", masked: "+??%" },
      { name: "Guts", value: "+15%", masked: "+??%" }
    ]
  },

  "Piece of Incarnate Flesh": {
    icon: "{{@img:img/gear/piece-of-incarnate-flesh.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "When an external deity descends into this world, it manifests itself by possessing the life that already exists in this world. To summon down a mighty deity in his or her gigantic form, an appropriate amount of flesh is required. In such a case, the flesh is gathered as an offering and used as a vessel for the deity.",
    abilities: [
      { name: "Body Expansion", color: "#ffa63d", icon: "{{@img:img/gear/pic--body-expansion.webp}}", description: "Whenever you take a critical hit, you will regain +1 HP stack" }
    ],
    stats: [
      { name: "Max HP Stacks", value: "1", masked: "??" },
      { name: "Max HP", value: "+25%", masked: "+??%" },
      { name: "Resist: Large Damage", value: "+40%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Instant Cooldown", value: "+25%", masked: "+??%" }
    ]
  },

  "Dominic's Dragonscale Armor": {
    icon: "{{@img:img/gear/dominic-s-dragonscale-armor.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Dominic the Dragon Man was a famous mercenary, but his whereabouts are unknown after the day of the prophecy. Since his corpse has not been found, he may still be fighting against the army of the dead somewhere.",
    stats: [
      { name: "Max HP Stacks", value: "2", masked: "??" },
      { name: "Max HP", value: "+5828", masked: "+??" },
      { name: "Resist: Physical", value: "+120%", masked: "+??%" }
    ]
  },

  "Archbishop of Launi": {
    icon: "{{@img:img/gear/archbishop-of-launi.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Since the Blastfort War, the position of archbishop of the Church of Flaus has remained vacant. Launi had a tentative next archbishop, but Trae, Solde and Scheinenaue did not accept his claim, and the factional conflict within the church continued to intensify.",
    stats: [
      { name: "Shield", value: "+2165", masked: "+??" },
      { name: "Shield", value: "+2150", masked: "+??" },
      { name: "Sanctuary", value: "+100%", masked: "+??%" },
      { name: "Defiant Resistance", value: "+50%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Healthy Evasion", value: "+50%", masked: "+??%" }
    ]
  },

  "Witch of Scheinenaue": {
    icon: "{{@img:img/gear/witch-of-scheinenaue.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "When the Buriedbornes technique is exercised, the memories of the subject flow into the surgeon's brain and the boundaries between self and others are violated. For this reason, the surgeon must have either a sufficiently mature and robust mind or the means to protect it.",
    ability: {
      name: "Parallel Thinking",
      icon: "{{@img:img/gear/pic-2.webp}}",
      category: "Status",
      description: "Whenever you end your turn, you will auto-use the skill with the highest number of remaining uses."
    },
    stats: [
      { name: "Shield", value: "+2709", masked: "+??" },
      { name: "Shield", value: "+25%", masked: "+??%" },
      { name: "Magical Penetration", value: "+25%", masked: "+??%" },
      { name: "INT Mastery", value: "+25%", masked: "+??%" }
    ]
  },

  "Rainbow": {
    icon: "{{@img:img/gear/rainbow.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "The gem, a joint work of Rauni and Strat craftsmen, is made of silk threads interwoven with countless fine magical patterns, and is known to emit a different colored luster depending on the angle of view.",
    ability: {
      name: "Resistance Reversal",
      icon: "{{@img:img/gear/pic-3.webp}}",
      category: "Status",
      description: "The positive and negative values of your Resist: {{Physical}}, Resist: {{Magical}}, and Resist: {{Void}} are reversed"
    },
    stats: [
      { name: "Max HP", value: "+3524", masked: "+??" },
      { name: "Shield", value: "+2158", masked: "+??" }
    ],
    randomStats: [
      { name: "DEXterity", value: "+474", masked: "+??" },
      { name: "Boost Proficiency", value: "+25%", masked: "+??%" }
    ]
  },

  "Klaus's Healer Coat": {
    icon: "{{@img:img/gear/klaus-s-healer-coat.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "There were many other magic schools besides Solde, but the magic school in Bergstiller made particularly outstanding achievements in medical magic. However, since many of its best and brightest were lost in the scourge of the village of Lorkor, its authority has been lost.",
    abilities: [
      { name: "Cursed Item", color: "#ffa63d", icon: IMG[15], description: "This equipment has much higher performance than normal, but +1 consumption of each skill" },
      { name: "Call from Another World", color: "#ffa63d", icon: "{{@img:img/gear/pic--call-from-another-world.webp}}", description: "Insanity value is also added to Conserve Skill Uses, Bravery Increase, and Skill Boost." }
    ],
    stats: [
      { name: "Shield", value: "+3176", masked: "+??" },
      { name: "Resist: Magical", value: "+100%", masked: "+??%" },
      { name: "Boost Proficiency", value: "+40%", masked: "+??%" }
    ]
  },

  "Solven Armor": {
    icon: "{{@img:img/gear/solven-armor.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Even after being given the name Sobei in the East, Solven continued to patronize the armor worn by northern warriors. It seems that people of foreign origin stood out on the battlefield and were perfect for demonstrating military exploits.",
    abilities: [
      { name: "Physical Activity", color: "#ffa63d", icon: "{{@img:img/gear/pic--physical-activity.webp}}", description: "Apply the effect of the rune \"Auto: Heal\" to all skills." }
    ],
    stats: [
      { name: "Max HP", value: "+4145", masked: "+??" },
      { name: "Max HP Stacks", value: "1", masked: "??" },
      { name: "STRength Expert", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "STR Mastery", value: "+20%", masked: "+??%" }
    ]
  },

  "Saint of Lotta Veck": {
    icon: "{{@img:img/gear/saint-of-lotta-veck.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Saint Mary of Rota Vec, the hope of the survivors, became a symbol of despair in its final stages.",
    abilities: [
      { name: "Devotion", color: "#ffa63d", icon: "{{@img:img/gear/pic--devotion.webp}}", description: "Whenever you are affected by an ailment, you gain {{Immunity}}/3 turns" }
    ],
    stats: [
      { name: "Max HP", value: "+3648", masked: "+??" },
      { name: "Resist: Magical", value: "+75%", masked: "+??%" },
      { name: "PIE Mastery", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "DEX Mastery", value: "+20%", masked: "+??%" }
    ]
  },

  "Outer Silken Garment": {
    icon: "{{@img:img/gear/outer-silken-garment.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "It is nearly impossible for a manifested being to bring goods from the Outer Worlds into Versiegelt, but only some powerful Outer Gods are able to do so.",
    abilities: [
      { name: "Blessing of Outer Light", color: "#ffa63d", icon: "{{@img:img/gear/pic--blessing-of-outer-light.webp}}", description: "Every time a quick skill is used, Protection is automatically triggered." }
    ],
    stats: [
      { name: "Max HP", value: "+6077", masked: "+??" },
      { name: "Shield", value: "+3805", masked: "+??" },
      { name: "Additional Action", value: "+50%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Remaining Protection", value: "+75%", masked: "+??%" }
    ]
  }
,
  "Saint of the Outer Light": {
    icon: "{{@img:img/gear/saint-of-the-outer-light.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Humans with the \"eyes\" to see the outer light are rare, and when they are found they are welcomed as saints by the Outer Light Cult.",
    abilities: [
      { name: "Evil-Slaying Glow", color: "#ffa63d", icon: "{{@img:img/gear/pic--evil-slaying-glow.webp}}", description: "Whenever you directly use a skill, remove all temporary effects from the enemy." }
    ],
    stats: [
      { name: "Shield", value: "+2520", masked: "+??" },
      { name: "Shield", value: "+2516", masked: "+??" },
      { name: "Direct Damage Resistance", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Bravery Increase", value: "+25%", masked: "+??%" }
    ]
  },

  "Future Vision": {
    icon: "{{@img:img/gear/future-vision.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The outer light even reflects the karma and destiny that make up Vasigalt. It is said that Emperor Theo once used this power to predict the future.",
    abilities: [
      { name: "Contrived Fate", color: "#ffa63d", icon: "{{@img:img/gear/pic--contrived-fate.webp}}", description: "All equipment dropped in dungeons will have rarity 5." }
    ],
    stats: [
      { name: "Healing Power", value: "+40%", masked: "+??%" },
      { name: "Resist: Ailments", value: "+40%", masked: "+??%" },
      { name: "Preemptive Strike", value: "+100%", masked: "+??%" }
    ],
    randomStats: [
      { name: "STRength", value: "+578", masked: "+??" }
    ]
  },

  "Graduate": {
    icon: "{{@img:img/gear/graduate.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Wizards who graduate from magic schools go on to many different destinations, but most are either employed as state servants or live isolated lives pursuing their own research.",
    abilities: [
      { name: "Complete Mastery", color: "#ffa63d", icon: "{{@img:img/gear/pic--complete-mastery.webp}}", description: "Skills with 5 equipped Runes gain +50% Skill Power." }
    ],
    stats: [
      { name: "Add Rune Slot", value: "+35%", masked: "+??%" },
      { name: "Resist: Magical", value: "+65%", masked: "+??%" },
      { name: "Rune Slot", value: "+1", masked: "+??" }
    ],
    randomStats: [
      { name: "Replenish when Moving Floors", value: "+5", masked: "+??" },
      { name: "Instant Cooldown", value: "+25%", masked: "+??%" }
    ]
  },

  "Necromancy Troupe": {
    icon: "{{@img:img/gear/necromancy-troupe.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "The necromancers are still active on the frontlines, but despite signs of a turnaround in their forces from the situation at the time of the prophecy, they have yet to find the means to completely eliminate the ancient High King.",
    abilities: [
      { name: "Wall of Flesh", color: "#ffa63d", icon: "{{@img:img/gear/pic--wall-of-flesh.webp}}", description: "Whenever a minion is summoned, reset your shield." }
    ],
    stats: [
      { name: "Shield", value: "+2195", masked: "+??" },
      { name: "Shield", value: "+2115", masked: "+??" },
      { name: "Summon Damage", value: "+50%", masked: "+??%" },
      { name: "Resist: Void", value: "+50%", masked: "+??%" }
    ]
  },

  "Conqueror": {
    icon: "{{@img:img/gear/conqueror.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "In the year 395 of the Flausian calendar, the year after the usurpation of the imperial throne by the underlord Theo the High King, the Vernis Empire suddenly vanished from the face of the earth.",
    abilities: [
      { name: "Hegemony", color: "#ffa63d", icon: "{{@img:img/gear/pic--hegemony.webp}}", description: "Dramatically increases the appearance rate of elite monsters" }
    ],
    stats: [
      { name: "Max HP+Shield", value: "+25%", masked: "+??%" },
      { name: "Almighty", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Resist: Physical", value: "+50%", masked: "+??%" },
      { name: "Dual Resistance", value: "+30%", masked: "+??%" }
    ]
  },

  "Jonin of the Eastern Kingdoms": {
    icon: "{{@img:img/gear/jonin-of-the-eastern-kingdoms.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "In the final stage of a ninja's training, his master seriously tries to kill him. Only those who have the strength of spirit to fulfill their mission, even after taking their own life, are appointed as jounin.",
    abilities: [
      { name: "Secret Maneuver", color: "#ffa63d", icon: "{{@img:img/gear/pic--secret-maneuver.webp}}", description: "Whenever you enter dark rooms, gain {{Transparency}}/1 combat" }
    ],
    stats: [
      { name: "Max HP", value: "+3598", masked: "+??" },
      { name: "Evasion", value: "+29%", masked: "+??%" },
      { name: "Additional Action", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "INT Mastery", value: "+25%", masked: "+??%" }
    ]
  },

  "Sword of the Church": {
    icon: "{{@img:img/gear/sword-of-the-church.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "The Sword of the Church was in fact a private army of the Church of Flaus, but Scheinenaue tolerated its existence. Many of the people did not understand that they were not an organization that existed for the sake of the country.",
    abilities: [
      { name: "Magical Formation", color: "#ffa63d", icon: "{{@img:img/gear/pic--magical-formation.webp}}", description: "Your \u201c{{Sanctuary}}\u201d is also added to \"Magic Penetration\", \"Indirect Damage Resistance\", and \"Magic Absorption\"." }
    ],
    stats: [
      { name: "Max HP", value: "+3663", masked: "+??" },
      { name: "Max HP Stacks", value: "1", masked: "??" },
      { name: "Stack Refill", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "PIE Mastery", value: "+25%", masked: "+??%" }
    ]
  },

  "Tsukigakure": {
    icon: "{{@img:img/gear/tsukigakure.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Forged from blue meteoric iron, the armor absorbs the life of its owner and increases its luster.",
    abilities: [
      { name: "Skillful guidance", color: "#ffa63d", icon: IMG[25], description: "Gain Parry equal to 100% of the {{Trick|Trick|cy}}." },
      { name: "Craftsmanship", color: "#ffa63d", icon: IMG[8], description: "When leveling up, the performance of this equipment is improved" }
    ],
    stats: [
      { name: "Max HP", value: "+5853", masked: "+??" },
      { name: "Shield", value: "+3602", masked: "+??" }
    ],
    randomStats: [
      { name: "PIE Mastery", value: "+25%", masked: "+??%" }
    ]
  },

  "Northern Barbarian": {
    icon: "{{@img:img/gear/northern-barbarian.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "In addition to the barbarians, there were many humans living in the northern uninhabited areas, including wanted persons who had been forced to leave their countries and those who had been liberated from the human world. Those living in remote areas, for example, may be unaware of the world's catastrophic situation.",
    abilities: [
      { name: "Lively Pulse", color: "#ffa63d", icon: "{{@img:img/gear/pic--lively-pulse.webp}}", description: "While under the effect of Natural Recovery, healing received +100%" }
    ],
    stats: [
      { name: "Max HP", value: "+3536", masked: "+??" },
      { name: "Resist: Physical", value: "+75%", masked: "+??%" },
      { name: "Resist: Magical", value: "+60%", masked: "+??%" },
      { name: "Healing Power", value: "+25%", masked: "+??%" }
    ]
  },

  "The Brilliance of Flaus": {
    icon: "{{@img:img/gear/the-brilliance-of-flaus.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Flaus' teachings have brought about many conflicts and deaths. But at the same time, human society that has developed in accordance with his teachings has also given birth to and increased many new lives. If the number of lives that have been increased is greater than the number of lives that have been lost, can we say that the benefits outweigh the sins?",
    abilities: [
      { name: "Protection of Flaus", color: "#ffa63d", icon: "{{@img:img/gear/pic--protection-of-flaus.webp}}", description: "You will not die even if your HP and HP stacks reach 0. You cannot summon minions. Whenever you use a skill directly, the number of uses remaining for all skills is reduced by 3. (This effect cannot be reduced.)" }
    ],
    stats: [
      { name: "Max HP", value: "+4108", masked: "+??" },
      { name: "Resist: Void", value: "+60%", masked: "+??%" },
      { name: "Prayer Enhancement", value: "+95%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Magical Penetration", value: "+25%", masked: "+??%" }
    ]
  },

  "Moonshadow": {
    icon: "{{@img:img/gear/moonshadow.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Forged from blue meteoric iron, the armor absorbs the life of its owner and increases its luster.",
    abilities: [
      { name: "Guardian of heaven", color: "#ffa63d", icon: IMG[14], description: "Obtain Guts equivalent to 100% of {{Prayer|Prayer|cy}}." },
      { name: "Craftsmanship", color: "#ffa63d", icon: IMG[8], description: "When leveling up, the performance of this equipment is improved" }
    ],
    stats: [
      { name: "Max HP", value: "+5865", masked: "+??" },
      { name: "Resist: Physical", value: "+100%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Preemptive Strike", value: "+50%", masked: "+??%" }
    ]
  },

  "Solde Magic Corps": {
    icon: "{{@img:img/gear/solde-magic-corps.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Tactics that use magic are extremely limited in what they can do. Before the day of the prophecy, there were very few magicians who could use powerful magic that could completely change the course of battle. Only the corpses created by the Buriedbornes' techniques can easily use substandard magic.",
    abilities: [
      { name: "Military's Cooperation", color: "#ffa63d", icon: "{{@img:img/gear/pic--military-s-cooperation.webp}}", description: "Your \u201c{{Ironclad}}\u201d is added to \u201c{{Physical}} Penetration,\u201d \u201cDirect Damage Resistance,\u201d and \u201c{{Physical}} Absorption.\u201d" }
    ],
    stats: [
      { name: "Shield", value: "+2231", masked: "+??" },
      { name: "Resist: Magical", value: "+25%", masked: "+??%" },
      { name: "INTelligence Expert", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Sanctuary Enhancement", value: "+50%", masked: "+??%" }
    ]
  },

  "Moonlight": {
    icon: "{{@img:img/gear/moonlight.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Forged from blue meteoric iron, the armor absorbs the life of its owner and increases its luster.",
    abilities: [
      { name: "Pain numbness", color: "#ffa63d", icon: IMG[18], description: "Gain Resist: {{Physical}} equal to 200% of {{Rage}}." },
      { name: "Craftsmanship", color: "#ffa63d", icon: IMG[8], description: "When leveling up, the performance of this equipment is improved" }
    ],
    stats: [
      { name: "Max HP", value: "+5957", masked: "+??" },
      { name: "Max HP Stacks", value: "2", masked: "??" }
    ],
    randomStats: [
      { name: "INT Mastery", value: "+25%", masked: "+??%" }
    ]
  },

  "Sodom": {
    icon: "{{@img:img/gear/sodom.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "The aristocratic town of Scheinenaue was an earthly paradise where corruption and depravity reigned. The city, which fell first on the day of the prophecy, became a lesson for the rest of the world.",
    abilities: [
      { name: "Flames of Doom", color: "#ffa63d", icon: "{{@img:img/gear/pic--flames-of-doom.webp}}", description: "{{Burn}} status that you are suffering from will deal damage to both you and your enemies" }
    ],
    stats: [
      { name: "Max HP", value: "+3667", masked: "+??" },
      { name: "Shield", value: "+2074", masked: "+??" },
      { name: "Burn Enhancement", value: "+50%", masked: "+??%" },
      { name: "Burn Piercing", value: "+25%", masked: "+??%" }
    ]
  },

  "Ghost Lingstone": {
    icon: "{{@img:img/gear/ghost-lingstone.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Forged from blue meteoric iron, the armor absorbs the life of its owner and increases its luster.",
    abilities: [
      { name: "Secret of knowledge", color: "#ffa63d", icon: IMG[51], description: "Increases skill power of all skills by 100% of {{Focus}}." },
      { name: "Craftsmanship", color: "#ffa63d", icon: IMG[8], description: "When leveling up, the performance of this equipment is improved" }
    ],
    stats: [
      { name: "Conserve Skill Uses", value: "+50%", masked: "+??%" },
      { name: "Skill Rarity", value: "+50%", masked: "+??%" }
    ],
    randomStats: [
      { name: "DEX Mastery", value: "+25%", masked: "+??%" }
    ]
  },

  "Dark-red Meat": {
    icon: "{{@img:img/gear/dark-red-meat.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "The piece of flesh found in the crater of Mlima Nyota, when implanted in a corpse, takes control of its body and begins to move. It acquires paranormal regenerative abilities and bodily functions, but it is extremely difficult to overturn the control of the piece of flesh and manipulate the corpse.",
    abilities: [
      { name: "Cursed Item", color: "#ffa63d", icon: IMG[15], description: "This equipment has much higher performance than normal, but +1 consumption of each skill" },
      { name: "Distorted Body", color: "#ffa63d", icon: "{{@img:img/gear/pic--distorted-body.webp}}", description: "10% of current HP added to STRength" }
    ],
    stats: [
      { name: "STRength", value: "+521", masked: "+??" },
      { name: "Max HP", value: "+2657", masked: "+??" }
    ],
    randomStats: [
      { name: "Add Rune Slot", value: "+25%", masked: "+??%" }
    ]
  },

  "Apothecary of Woltland": {
    icon: "{{@img:img/gear/apothecary-of-woltland.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "From a medical point of view, magic is suitable for treating injuries, but not for eliminating diseases and poisons. In Woltland, the very sick, who have reached the end of their magical cures, come in search of a last hope.",
    stats: [
      { name: "PIEty", value: "+516", masked: "+??" },
      { name: "Max HP", value: "+2591", masked: "+??" },
      { name: "Prayer Enhancement", value: "+25%", masked: "+??%" },
      { name: "Prayer", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Resist: Physical", value: "+50%", masked: "+??%" }
    ]
  },
  "Aegis": {
    icon: "{{@img:img/gear/aegis.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "This shield will not let anything pass through. Even if it did, it would be deflected so that it would not reach the bearer.",
    stats: [
      { name: "Shield", value: "+1563", masked: "+??" },
      { name: "Parry", value: "+15%", masked: "+??%" },
      { name: "Resist: Magical", value: "+40%", masked: "+??%" },
      { name: "Convert Resist: Magical", value: "+80%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Resist: Physical", value: "+50%", masked: "+??%" }
    ]
  },
  "Orchestra of Solde": {
    icon: "{{@img:img/gear/orchestra-of-solde.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "The Solde Academy of Magic, the Solde Academy of Music, and the Solde Academy of Crafts are three of the most prestigious schools in Solde. In terms of difficulty of admission, the Solde Academy of Music is particularly outstanding among these three+.",
    stats: [
      { name: "DEXterity", value: "+504", masked: "+??" },
      { name: "Shield", value: "+1487", masked: "+??" },
      { name: "Trick", value: "+25%", masked: "+??%" },
      { name: "Trick Enhancement", value: "+25%", masked: "+??%" },
      { name: "Boost Proficiency", value: "+25%", masked: "+??%" }
    ]
  },
  "Trae's Engineer": {
    icon: "{{@img:img/gear/trae-s-engineer.webp}}",
    category: "Equipment",
    flavor: "Although living beings and corpses are made of the same material, they have completely different properties. For this reason, research on \"corpses with living bodies\" is essential in the study of Buriedbornes.",
    ability: {
      name: "Designer's perspective",
      icon: "{{@img:img/gear/pic-4.webp}}",
      category: "Status",
      description: "Corpse Modification Board Node Visibility +5"
    },
    stats: [
      { name: "Max HP Stacks", value: "1", masked: "??" },
      { name: "Double Penetration", value: "+9%", masked: "+??%" },
      { name: "Initial Bravery", value: "+1", masked: "+??" }
    ],
    randomStats: [
            { name: "Magical Absorption", value: "+5%", masked: "+??%" }
    ]
  },
  "Solde Knights": {
    icon: "{{@img:img/gear/solde-knights.webp}}",
    category: "Equipment",
    flavor: "Solde knights are known for their unusual relentlessness. They never attack their enemies from behind. They never allow their frightened enemies to escape, but stand them squarely in front of them and cut them down, deceiving them into thinking they are being fair.",
    ability: {
      name: "Chivalry",
      icon: "{{@img:img/gear/pic-5.webp}}",
      category: "Status",
      description: "Whenever you and your enemy automatically activate a skill in your possession, all skills are stunned and the Remainings of all skills are reduced by 5 each."
    },
    stats: [
      { name: "Parry", value: "+15%", masked: "+??%" },
      { name: "Resist: Physical", value: "+50%", masked: "+??%" },
      { name: "Convert Resist: Physical", value: "+50%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Evasion", value: "+25%", masked: "+??%" }
    ]
  },
  "Rauni House of Lords": {
    icon: "{{@img:img/gear/rauni-house-of-lords.webp}}",
    category: "Equipment",
    flavor: "In the extremely corrupt Rauni noble house, bribery and fraud were rampant, and politics never worked for the people. Magic was for the church and not within the reach of the people. Contrary to its glittering facade, the misery of the exploited poor in the country was not comparable to other countries.",
    ability: {
      name: "Blaming others",
      icon: "{{@img:img/gear/pic-6.webp}}",
      category: "Status",
      description: "Any effects of skills you use that target yourself will now target the enemy instead."
    },
    stats: [
      { name: "Causes and Effects", value: "+4%", masked: "+??%" },
      { name: "Skill Power", value: "+9%", masked: "+??%" },
      { name: "Greed", value: "+21%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Burn Enhancement", value: "+40%", masked: "+??%" }
    ]
  },
  "Scheinenaue Brothel": {
    icon: "{{@img:img/gear/scheinenaue-brothel.webp}}",
    category: "Equipment",
    flavor: "Deep within the gorgeous aristocratic district, the dark side of Scheinenaue was hidden. The aristocrats say that the brothel owner, who made a huge fortune through sensual pleasure, had more power than the king.",
    ability: {
      name: "Enchanting Allure",
      icon: "{{@img:img/gear/pic-7.webp}}",
      category: "Status",
      description: "At the start of combat, the enemy is inflicted with Temptation/3 turns."
    },
    stats: [
      { name: "Defiant Evasion", value: "+80%", masked: "+??%" },
      { name: "Healthy Evasion", value: "+80%", masked: "+??%" },
      { name: "Evasion", value: "+20%", masked: "+??%" }
    ],
    randomStats: [
      { name: "STR Mastery", value: "+25%", masked: "+??%" }
    ]
  },
  "Turban of Dalbae": {
    icon: "{{@img:img/gear/turban-of-dalbae.webp}}",
    category: "Equipment",
    flavor: "Darubae created a number of \"rules\" within himself to control himself so that he would not realize the madness that was hidden within him. When he wore this turban, he was encapsulating his original, bizarre personality.",
    ability: {
      name: "Flexible Thinking",
      icon: "{{@img:img/gear/pic-8.webp}}",
      category: "Status",
      description: "All nodes within the line of sight on the corpse modification board become selectable."
    },
    stats: [
      { name: "Prayer Enhancement", value: "+67%", masked: "+??%" },
      { name: "Physical Milling", value: "+25%", masked: "+??%" },
      { name: "Bleed Enhancement", value: "+80%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Additional Action", value: "+18%", masked: "+??%" }
    ]
  }
,
  "Great Forest of Nordmia": {
    icon: "{{@img:img/gear/great-forest-of-nordmia.webp}}",
    category: "Equipment",
    flavor: "Nordomia was home to the largest northern elf settlement, and the three Blastfort kingdoms were aware of its existence, and although there was no formal diplomacy, humans and elves traveled back and forth in large numbers.",
    ability: {
      name: "Speed reversal",
      icon: "{{@img:img/gear/pic-9.webp}}",
      category: "Status",
      description: "Ignores cooldown delay effects and instead accelerates cooldowns"
    },
    stats: [
      { name: "Void Milling", value: "+25%", masked: "+??%" },
      { name: "Steady", value: "+75%", masked: "+??%" },
      { name: "Skill Boost", value: "+15%", masked: "+??%" }
    ]
  }
,
  "Mask of Mutation": {
    icon: "{{@img:img/gear/mask-of-mutation.webp}}",
    category: "Equipment",
    flavor: "The one who wears it transforms into the thing he or she fears most. It was thought to be a kind of curse, but the thing he fears the most is synonymous with the most powerful being.",
    stats: [
      { name: "Cursed Item", color: "#ffa63d", icon: IMG[15], description: "This equipment has much higher performance than normal, but +1 consumption of each skill" },
      { name: "Crafting Disabled", color: "#ffa63d", icon: IMG[71], description: "Crafting is not possible for this piece of equipment." },
      { name: "Mutation", value: "+200%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Additional Action", value: "+20%", masked: "+??%" },
      { name: "Remaining Protection", value: "+75%", masked: "+??%" }
    ]
  }
,
  "Machine Parts": {
    icon: "{{@img:img/gear/machine-parts.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The technology to attach machines to the human body had also been developed in Trae, but limbs that could move according to the owner's will were never completed. Necromancers solved this problem by constructing machines using only human bones and bits of flesh.",
    abilities: [
      { name: "Machine Body", color: "#ffa63d", icon: "{{@img:img/gear/pic--machine-body.webp}}", description: "Transforms into a machine golem. Gains +50% {{Ironclad}}, +50% {{Sanctuary}}, and +50% {{Mutation}}. At the start of each turn, if there is a shield of 1 or more, take indirect damage equal to shield and replenish the remaining uses of all skills by 1." }
    ],
    stats: [
      { name: "Skill Power", value: "+8%", masked: "+??%" },
      { name: "Crafting Cost", value: "-25%", masked: "-??%" },
      { name: "Shield Regeneration", value: "+10%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Add Rune Slot", value: "+25%", masked: "+??%" }
    ]
  }
,
  "Eltrant Ruins": {
    icon: "{{@img:img/gear/eltrant-ruins.webp}}",
    category: "Equipment",
    flavor: "Old ruins from the era before Theo the Great can be seen in Eltranto. Ancient magic may be discovered through the investigation of such ruins, and unknown wisdom may still lie dormant in these ruins.",
    ability: {
      name: "Unknown Forcefield",
      icon: "{{@img:img/gear/pic-10.webp}}",
      category: "Status",
      description: "Every time you level up, one of your empty rune slots will randomly get a rune."
    },
    stats: [
      { name: "Rune Slot", value: "+1", masked: "+??" },
      { name: "Rune Rarity", value: "+1", masked: "+??" },
      { name: "Crafting Cost", value: "-3", masked: "-??" }
    ],
    randomStats: [
      { name: "Add Rune Slot", value: "+25%", masked: "+??%" }
    ]
  }
,
  "Scepter of Emperor Solde": {
    icon: "{{@img:img/gear/scepter-of-emperor-solde.webp}}",
    category: "Equipment",
    flavor: "Roberto VII never opened his heart to anyone other than his beloved cat Raul. However, even he himself does not know that the cat has continued to live in the royal palace from the time of the first emperor to the present day.",
    ability: {
      name: "Seat of Dominion",
      icon: "{{@img:img/gear/pic-11.webp}}",
      category: "Status",
      description: "You cannot deal direct damage. Summon skill power +100%."
    },
    stats: [
      { name: "STRength", value: "+309", masked: "+??" },
      { name: "PIEty", value: "+307", masked: "+??" },
      { name: "Summon Critical Rate", value: "+32%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Conserve Skill Uses", value: "+25%", masked: "+??%" }
    ]
  },
  "Rainabel's Dark Elf": {
    icon: "{{@img:img/gear/rainabel-s-dark-elf.webp}}",
    category: "Equipment",
    flavor: "Dark elves are merely abnormal in pigmentation, and are only seen in southern elves, such as Lynabel. Northern elves believe it is due to \"impurity\" and discriminate against all southern elves.",
    ability: {
      name: "Blood Thorns",
      icon: "{{@img:img/gear/pic-12.webp}}",
      category: "Status",
      description: "Reflected damage to enemies is increased by the amount of HP lost by the user."
    },
    stats: [
      { name: "STRength", value: "+242", masked: "+??" },
      { name: "PIEty", value: "+244", masked: "+??" },
      { name: "Influence", value: "+50%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Influence", value: "+50%", masked: "+??%" }
    ]
  },
  "Voice of the Dead": {
    icon: "{{@img:img/gear/voice-of-the-dead.webp}}",
    category: "Equipment",
    ability: {
      name: "Post-mortem Domination",
      icon: "{{@img:img/gear/pic-13.webp}}",
      category: "Status",
      description: "Whenever you defeat an enemy, you have a low chance to summon that enemy as a minion"
    },
    stats: [
      { name: "Cursed Item", color: "#ffa63d", icon: IMG[15], description: "This equipment has much higher performance than normal, but +1 consumption of each skill" },
      { name: "INTelligence", value: "+409", masked: "+??" },
      { name: "PIEty", value: "+407", masked: "+??" }
    ],
    randomStats: [
      { name: "Add Rune Slot", value: "+25%", masked: "+??%" }
    ]
  }
,
  "Matchlock": {
    icon: "{{@img:img/gear/matchlock.webp}}",
    category: "Equipment",
    flavor: "The long gun developed in Trae was expected to be successful in battle due to its long range, but due to the gap in loading, it was not as successful as expected in the Blastfort War. After the prophetic day, the inhuman agility of the wights forced the loading problem to be solved, giving the long gun a new value.",
    ability: {
      name: "Strafing",
      icon: "{{@img:img/gear/pic-14.webp}}",
      category: "Status",
      description: "Hidden blade will now be activated by direct magical damage and direct void damage."
    },
    stats: [
      { name: "STRength+DEXterity", value: "+194", masked: "+??" },
      { name: "INTelligence+PIEty", value: "+194", masked: "+??" },
      { name: "Physical Penetration", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Preemptive Strike", value: "+30%", masked: "+??%" }
    ]
  }
,
  "Slum Thieves": {
    icon: "{{@img:img/gear/slum-thieves.webp}}",
    category: "Equipment",
    flavor: "In the slums, where betrayal is commonplace, interests and trust are not enough to form a proper organization. They place curses on each other and make a contract so that if the other party betrays them, death will come upon the other party. The thieves in the slums are truly a group of 100-year-olds.",
    ability: {
      name: "Malice Infiltration",
      icon: "{{@img:img/gear/pic-15.webp}}",
      category: "Status",
      description: "Apply the effect of the rune \"Unopposed\" to all skills."
    },
    stats: [
      { name: "DEXterity", value: "+809", masked: "+??" },
      { name: "INTelligence", value: "+828", masked: "+??" },
      { name: "Causes and Effects", value: "+5%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Accuracy", value: "+25%", masked: "+??%" }
    ]
  },
  "Gezeithen Craftsmen": {
    icon: "{{@img:img/gear/gezeithen-craftsmen.webp}}",
    category: "Equipment",
    flavor: "In the downtown areas of the eastern provinces, which were falling into rapid ruin, robbery and murder were rampant, and with the loss of public order under the protection of the state, vigilante groups sprang up in abundance. Eventually, conflicts between these groups became endless, and the burden of all this was passed on to the powerless people.",
    ability: {
      name: "Steady Efforts",
      icon: "{{@img:img/gear/pic-16.webp}}",
      category: "Status",
      description: "All skills power +3"
    },
    stats: [
      { name: "DEXterity", value: "+245", masked: "+??" },
      { name: "INTelligence", value: "+254", masked: "+??" },
      { name: "Magical Milling", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Bravery Increase", value: "+20%", masked: "+??%" }
    ]
  },
  "Smoldering Black Flame": {
    icon: "{{@img:img/gear/smoldering-black-flame.webp}}",
    category: "Equipment",
    flavor: "Continuously burning craters can sometimes be found in the mountains of Mlima Nyota. At the bottom lies a meteorite that once fell on this land, during the creation of Versiegelt.",
    ability: {
      name: "Jet-Black Wave",
      icon: "{{@img:img/gear/pic-17.webp}}",
      category: "Status",
      description: "Any reversible HP recovery effect on yourself will instead be replaced with {{Void}} damage to the enemy."
    },
    stats: [
      { name: "DEXterity", value: "+251", masked: "+??" },
      { name: "PIEty", value: "+246", masked: "+??" },
      { name: "Healing Power", value: "+40%", masked: "+??%" }
    ],
    randomStats: [
      { name: "STRength+PIEty", value: "+84", masked: "+??" }
    ]
  },
  "Swordsmith of Motomori": {
    icon: "{{@img:img/gear/swordsmith-of-motomori.webp}}",
    category: "Equipment",
    flavor: "Motomori territory had many iron mines where excellent iron could be produced, and the swordsmithing skills were also outstanding. However, most of the swordsmiths were imprisoned for false crimes by the dark lord Ougai.",
    ability: {
      name: "War Deity",
      icon: "{{@img:img/gear/pic-18.webp}}",
      category: "Status",
      description: "When all skills are in Alt Mode, they will always be critical hits."
    },
    stats: [
      { name: "STRength", value: "+247", masked: "+??" },
      { name: "INTelligence", value: "+252", masked: "+??" },
      { name: "Healthy Critical", value: "+80%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Add Rune Slot", value: "+25%", masked: "+??%" }
    ]
  }
,
  "Downtown Tokyo": {
    icon: "{{@img:img/gear/downtown-tokyo.webp}}",
    category: "Equipment",
    flavor: "Trae offered huge subsidies to developers of advanced technology. Young people hoping to turn their ideas around and turn their fortunes into reality made their fortunes, but the Day of Prophecy and the army of the dead wiped all of that out.",
    ability: {
      name: "Odor",
      icon: "{{@img:img/gear/pic-19.webp}}",
      category: "Status",
      description: "Whenever you use a skill directly, enemy Bravery -1"
    },
    stats: [
      { name: "Max HP", value: "+1543", masked: "+??" },
      { name: "Direct Damage Resistance", value: "+25%", masked: "+??%" },
      { name: "Influence", value: "+60%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Defiant Evasion", value: "+50%", masked: "+??%" }
    ]
  },
  "Milica's Lament": {
    icon: "{{@img:img/gear/milica-s-lament.webp}}",
    category: "Equipment",
    flavor: "Even through the excruciating pain of modification and experimentation, it is difficult to maintain a consistent spirit. Milica was able to do this because of the various personal items that reminded her of herself when she was an ordinary elf.",
    ability: {
      name: "Foamed Structure",
      icon: "{{@img:img/gear/pic-20.webp}}",
      category: "Status",
      description: "HP cannot be restored. Shields cannot be gained. Maximum HP stack is always 9."
    },
    stats: [
      { name: "Resist: Large Damage", value: "+70%", masked: "+??%" },
      { name: "Defiant Evasion", value: "+49%", masked: "+??%" },
      { name: "Guts", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Evasion", value: "+25%", masked: "+??%" }
    ]
  },
  "Priest of Weissfate": {
    icon: "{{@img:img/gear/priest-of-weissfate.webp}}",
    category: "Equipment",
    flavor: "Weissfate Cathedral, built as part of the fortress of Schneeburg, is considered the largest structure in Flausianism. It is said that Flaus once descended here for the first time.",
    ability: {
      name: "Discipline",
      icon: "{{@img:img/gear/pic-21.webp}}",
      category: "Status",
      description: "Whenever you use a burst skill, you gain Invincible /1 turn."
    },
    stats: [
      { name: "Shield", value: "+891", masked: "+??" },
      { name: "Resist: Magical", value: "+20%", masked: "+??%" },
      { name: "Sanctuary Enhancement", value: "+50%", masked: "+??%" },
      { name: "PIE Mastery", value: "+25%", masked: "+??%" }
    ],
    randomStats: [

    ]
  },
  "Divine Might": {
    icon: "{{@img:img/gear/divine-might.webp}}",
    category: "Equipment",
    flavor: "Once upon a time, angels wore clothing made of materials that did not exist in Versiegelt. Since people plundered their clothes, most angels now appear naked.",
    ability: {
      name: "Majestic",
      icon: "{{@img:img/gear/pic-22.webp}}",
      category: "Status",
      description: "When Brave is at maximum, you will no longer take {{Void}} damage."
    },
    stats: [
      { name: "Max HP", value: "+1534", masked: "+??" },
      { name: "Max HP Stacks", value: "1", masked: "??" },
      { name: "Bravery Increase", value: "+40%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Summon Health", value: "+25%", masked: "+??%" }
    ]
  },
  "Puppet": {
    icon: "{{@img:img/gear/puppet.webp}}",
    category: "Equipment",
    flavor: "When controlling a corpse, the reaction speed of the jutsu-jutsu is inevitably a limitation, as the jutsu-jutsu acts based on the information it sees and hears. This weakness can be overcome by having the corpse react automatically according to the situation.",
    ability: {
      name: "Minion Protection",
      icon: "{{@img:img/gear/pic-23.webp}}",
      category: "Status",
      description: "Maximum HP stack becomes 0. Whenever you summon a minion, give that minion +1 max HP stack"
    },
    stats: [
      { name: "Shield", value: "+905", masked: "+??" },
      { name: "Shield", value: "+889", masked: "+??" },
      { name: "Summon Damage", value: "+40%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Instant Cooldown", value: "+20%", masked: "+??%" }
    ]
  },
  "Flaus's Revelation": {
    icon: "{{@img:img/gear/flaus-s-revelation.webp}}",
    category: "Equipment",
    flavor: "There are a total of 17 revelations that Flaus brought to the Versiegelt. The first one was to incite discrimination against demi-humans, but many others were also created to deepen divisions between people.",
    ability: {
      name: "Flaus's Dominion",
      icon: "{{@img:img/gear/pic-24.webp}}",
      category: "Status",
      description: "Each time a minion is summoned, it gains Protection of Flaus."
    },
    stats: [
      { name: "Shield", value: "+901", masked: "+??" },
      { name: "Resist: Magical", value: "+75%", masked: "+??%" },
      { name: "Maximum Uses", value: "+10", masked: "+??" }
    ],
    randomStats: [
      { name: "Toughness", value: "+25%", masked: "+??%" }
    ]
  },
  "Biomedical Research": {
    icon: "{{@img:img/gear/biomedical-research.webp}}",
    category: "Equipment",
    flavor: "While mechanical technology reached a new height in Trae, old-fashioned manufacturing continued in Gezeithen, the birthplace of mechanical technology. This was because the entertainment of the mechanical manufacturing process was emphasized more than the benefits and rationality of machines.",
    ability: {
      name: "Complete",
      icon: "{{@img:img/gear/pic-25.webp}}",
      category: "Status",
      description: "When Bravery is at its maximum, you are immune to abnormal conditions."
    },
    stats: [
      { name: "Shield", value: "+916", masked: "+??" },
      { name: "Indirect Damage Resistance", value: "+20%", masked: "+??%" },
      { name: "Shield", value: "+30%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Resist: Damage over Time", value: "+40%", masked: "+??%" }
    ]
  },
  "De Vermis Mysteriis": {
    icon: "{{@img:img/gear/de-vermis-mysteriis.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Many magical books suggest the existence of multiple other worlds and external realms that exist outside of this world+. And of beings beyond human knowledge and the dangers they pose+.",
    stats: [
      { name: "Cursed Item", color: "#ffa63d", icon: IMG[15], description: "This equipment has much higher performance than normal, but +1 consumption of each skill" },
      { name: "Evil Research", color: "#ffa63d", icon: "{{@img:img/gear/pic--evil-research.webp}}", description: "20% of current shield is added to INTelligence" },
      { name: "INTelligence", value: "+844", masked: "+??" },
      { name: "Shield", value: "+2488", masked: "+??" }
    ],
    randomStats: [
      { name: "Add Rune Slot", value: "+25%", masked: "+??%" }
    ]
  },

  "Umbilical cord": {
      icon: "{{@img:img/gear/umbilical-cord.webp}}",
      category: "Equipment",
      stars: 7,
      flavor: "They say that beyond the stars that shine in the heavens lies the Outer Heavens+, but there were those who thought that far beyond that, beyond the heavens above Vaasigalt+, there was something else hidden as well+. And in a way+, they were right+.",
      ability: {
        name: "New door",
        color: "#ffa63d",
        icon: "{{@img:img/gear/pic-26.webp}}",
        description: "Transform into something inhuman, and gain a large amount of \"madness\" every time you move from room to room."
      },
      stats: [
        { name: "Skill Power", value: "+20%", masked: "+??%" },
        { name: "Focus Enhancement", value: "+95%", masked: "+??%" },
        { name: "Add Rune Slot", value: "+28%", masked: "+??%" },
        { name: "Movement Preparation", value: "+50%", masked: "+??%" }
      ]
    },
  "Umbilical Cord": {
    icon: "{{@img:img/gear/umbilical-cord-2.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Research on the otherworldly world had made great strides under the hands of Dr. Matthias and Dr. Walter, but since their disappearance in the tragedy of Lorchor Village, their research has stalled.",
    abilities: [
      { name: "Black Flame", icon: "{{@img:img/gear/pic--black-flame.webp}}", category: "Status", description: "{{Burn}} damage dealt to enemies is treated as void damage" },
      { name: "Burn Specialist", icon: IMG[13], category: "Status", description: "{{Burn}} damage can now critically hit" }
    ],
    stats: [
      { name: "Burn Piercing", value: "+25%", masked: "+??%" },
      { name: "Resist: Damage over Time", value: "+100%", masked: "+??%" },
      { name: "Mutation Enhancement", value: "+50%", masked: "+??%" }
    ]
  },
  "Twilight": {
    icon: "{{@img:img/gear/twilight.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Even the outer gods who live in the outer heaven and earth may not be that different from humans in that they are the life forms that construct society.",
    ability: { name: "Maturity", icon: "{{@img:img/gear/pic--maturity.webp}}", category: "Status", description: "All skills will be in a constant burst state, but you will no longer gain experience points." },
    stats: [
      { name: "Boost Proficiency", value: "+25%", masked: "+??%" },
      { name: "Rune Rarity", value: "+1", masked: "+??" },
      { name: "Final Blow", value: "+30%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Add Rune Slot", value: "+25%", masked: "+??%" }
    ]
  },
  "Madman's Pride": {
    icon: "{{@img:img/gear/madman-s-pride.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Even those who are said to be \"crazy\" have their own consistent rules.",
    ability: { name: "Optimism", icon: "{{@img:img/gear/pic--optimism.webp}}", category: "Status", description: "All temporary statuses are treated as buffs" },
    stats: [
      { name: "Resist: Magical", value: "+50%", masked: "+??%" },
      { name: "Conserve Skill Uses", value: "+25%", masked: "+??%" },
      { name: "Rune Rarity", value: "+1", masked: "+??" },
      { name: "Guts", value: "+15%", masked: "+??%" }
    ]
  },
  "Nether ocean": {
    icon: "{{@img:img/gear/nether-ocean.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "At the end of the Yomi Sea, there is a large hole in the sea, and from the bottom of the hole, abnormally cold air is flowing out. This hole is thought to be connected to some otherworld, but as there is currently no way to get there, no progress has been made in the investigation.",
    ability: { name: "Steady Stance", icon: "{{@img:img/gear/pic--steady-stance.webp}}", category: "Status", description: "Apply the effect of the rune \"Shift\" to all skills." },
    stats: [
      { name: "Indirect Damage Resistance", value: "+35%", masked: "+??%" },
      { name: "Skill Power", value: "+10%", masked: "+??%" },
      { name: "Replenish when Moving Floors", value: "+5", masked: "+??" }
    ],
    randomStats: [
      { name: "Influence", value: "+50%", masked: "+??%" }
    ]
  },
  "Mlima Nyota Magician": {
    icon: "{{@img:img/gear/mlima-nyota-magician.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Humans born in Mlima Nyota often acquire some form of magic. This also applies to the children of people who have come over from abroad. The question is, what gives a person born in Mlima Nyota magic?",
    stats: [
      { name: "INTelligence", value: "+498", masked: "+??" },
      { name: "Shield", value: "+1526", masked: "+??" },
      { name: "Focus Enhancement", value: "+25%", masked: "+??%" },
      { name: "Focus", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Minion Defense Boost", value: "+30%", masked: "+??%" }
    ]
  },
  "Pietro's Shoes": {
    icon: "{{@img:img/gear/pietro-s-shoes.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The wererabbit boy, a slave of the necromancer, escaped the necromancer's clutches after Freesia's murder and left for a faraway land. Now he is engaged in the work of carrying cargo in some remote place, unnoticed.",
    abilities: [
      { name: "Secret Path", icon: "{{@img:img/gear/pic--secret-path.webp}}", category: "Status", description: "Whenever you use an inventory item, restore 1 HP stack" },
      { name: "Teleport", icon: "{{@img:img/gear/pic--teleport.webp}}", category: "Status", description: "Whenever you use an inventory item, the room configuration changes randomly.\nOne of the oldest dungeon status will be lost." }
    ],
    stats: [
      { name: "Maximum Uses", value: "+50%", masked: "+??%" },
      { name: "Evasion", value: "+25%", masked: "+??%" },
      { name: "Item Rarity", value: "+1", masked: "+??" }
    ]
  },
  "Mushroom": {
    icon: "{{@img:img/gear/mushroom.webp}}",
    category: "Equipment",
    flavor: "It's a mushroom, no matter how you look at it. There are mushrooms out there.",
    stats: [
      { name: "Spreading Spores", value: "1%", masked: "??%" },
      { name: "Crafting Disabled", color: "#ffa63d", icon: IMG[71], description: "Crafting is not possible for this piece of equipment." }
    ],
    randomStats: [
      { name: "DEX Mastery", value: "+25%", masked: "+??%" },
      { name: "Replenish when Moving Floors", value: "+4", masked: "+??" },
      { name: "Additional Action", value: "+25%", masked: "+??%" }
    ]
  },
  "Flaus' Grace": {
    icon: "{{@img:img/gear/flaus-grace.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Flaus, perhaps to make his power known, brought numerous artifacts to mankind at the time of his descent. Some of them have been used as references for the creation of new magic items by mankind itself.",
    ability: {
      name: "Burst Heal",
      icon: "{{@img:img/gear/pic-27.webp}}",
      category: "Status",
      description: "Whenever you heal your HP, Bravery +1"
    },
    stats: [
      { name: "Healing Power", value: "+25%", masked: "+??%" },
      { name: "Sanctuary Enhancement", value: "+50%", masked: "+??%" },
      { name: "Prayer Enhancement", value: "+25%", masked: "+??%" },
      { name: "Skill Rarity", value: "+1", masked: "+??" }
    ]
  },
  "Trapezohedron": {
    icon: "{{@img:img/gear/trapezohedron.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "When you look into the crystals floating in the box, you can catch a glimpse of the otherworldly world of the abyss. The lid of the box must never be closed.",
    stats: [
      { name: "Cursed Item", color: "#ffa63d", icon: IMG[15], description: "This equipment has much higher performance than normal, but +1 consumption of each skill" },
      { name: "Eternal Dark", color: "#ffa63d", icon: "{{@img:img/gear/pic--eternal-dark.webp}}", description: "Whenever you level up, the unique effects of other equipment will be transferred to the free slots of this equipment." }
    ]
  },
  "Guardian of the North": {
    icon: "{{@img:img/gear/guardian-of-the-north.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "The warriors of the north trained day and night from their youth, and even in the extreme cold of the snowy mountains, they crossed the barbarians as if they were white wolves. Without their efforts, Vashigarht might have been ruled by subhumans.",
    stats: [
      { name: "STRength", value: "+541", masked: "+??" },
      { name: "Max HP", value: "+2620", masked: "+??" },
      { name: "Rage", value: "+25%", masked: "+??%" },
      { name: "Rage Enhancement", value: "+25%", masked: "+??%" },
      { name: "Resist: Reflect Damage", value: "+50%", masked: "+??%" }
    ]
  },

  "Sakura's Obi": {
    icon: "{{@img:img/gear/sakura-s-obi.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Not only the case of the Motomori family, but suspicion and suspicion reigned in the East, and even among family members, there were many confirmed cases of people killing each other.",
    abilities: [
      { name: "Oriental Swordsmanship", color: "#ffa63d", icon: "{{@img:img/gear/pic--oriental-swordsmanship.webp}}", category: "Status", description: "Skill effects that deal direct damage will trigger an additional time" },
      { name: "Tempo", color: "#ffa63d", icon: "{{@img:img/gear/pic--tempo.webp}}", category: "Status", description: "The base cooldown of all skills is now 4" }
    ],
    stats: [
      { name: "STRength+DEXterity", value: "+834", masked: "+??" },
      { name: "Movement Preparation", value: "+50%", masked: "+??%" },
      { name: "Max HP", value: "+4598", masked: "+??" }
    ]
  },
  "Gift of Love": {
    icon: "{{@img:img/gear/gift-of-love.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The ancient High King's principle of action can be summed up in one word: love. The principle of the ancient High King is, in a word, \"love,\" and the principle of those who understand him is the same. However, these two are also decisively different.",
    ability: { name: "Spirit of Love", color: "#ffa63d", icon: "{{@img:img/gear/pic--spirit-of-love.webp}}", category: "Status", description: "At the start of combat, you have a low chance to summon the Ancient King" },
    stats: [
      { name: "Healing Power", value: "+25%", masked: "+??%" },
      { name: "Resist: Ailments", value: "+25%", masked: "+??%" },
      { name: "Consumption", value: "+1", masked: "+??" }
    ],
    randomStats: [
      { name: "Replenishment on move", value: "+50%", masked: "+??%" }
    ]
  },
  "Darren's Oath": {
    icon: "{{@img:img/gear/darren-s-oath.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Not all necromancers have been good ones. Some struggle in their inexperience, suffer pain, and are defeated with regret, while others are awakened by abandoning hesitation and human morality.",
    abilities: [
      { name: "Schmeat", color: "#ffa63d", icon: "{{@img:img/gear/pic--schmeat.webp}}", category: "Status", description: "Whenever you defeat an enemy, your HP is reduced to 1 and your HP stack is restored by 1." },
      { name: "Willpower", color: "#ffa63d", icon: "{{@img:img/gear/pic--willpower.webp}}", category: "Status", description: "You will not be rendered inoperable due to confusion, etc.\nAdditionally, effects that change the target of skills are negated." }
    ],
    stats: [
      { name: "Rune Slot", value: "+1", masked: "+??" },
      { name: "Rune Rarity", value: "+20%", masked: "+??%" },
      { name: "Shield Amplification", value: "+25%", masked: "+??%" }
    ]
  },

  "Sword of Ix": {
    icon: "{{@img:img/gear/sword-of-ix.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Ix was blessed with outstanding talent as a magical swordsman, but it was not until his brother took control of him through necromancy that his talents were displayed to the fullest.",
    abilities: [
      { name: "Blade of Light", color: "#ffa63d", icon: "{{@img:img/gear/pic--blade-of-light.webp}}", category: "Status", description: "{{Hidden Blade}} damage dealt to enemies is treated as magical damage." },
      { name: "Hidden Blade Specialist", color: "#ffa63d", icon: IMG[76], category: "Status", description: "Hidden blade damage can now critically hit" }
    ],
    stats: [
      { name: "STRength+PIEty", value: "+860", masked: "+??" },
      { name: "Hidden Blade Enhancement", value: "+50%", masked: "+??%" },
      { name: "Magical Penetration", value: "+25%", masked: "+??%" }
    ]
  },

  "Pandora": {
    icon: "{{@img:img/gear/pandora.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "When the cloak is wielded, something comes out. What comes out is really quite unpredictable. It is said that the unusually elaborate machine that came out of Gezeithen when it was shaken once contributed to the rapid development of technology.",
    abilities: [
      { name: "Call Miracle", color: "#ffa63d", icon: "{{@img:img/gear/pic--call-miracle.webp}}", category: "Status", description: "Whenever you use a Burst Skill, additionally activate skill Call Miracle" }
    ],
    stats: [
      { name: "Almighty", value: "+684", masked: "+??" },
      { name: "Dual Resistance", value: "+30%", masked: "+??%" },
      { name: "Boost Proficiency", value: "+30%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Magical Penetration", value: "+25%", masked: "+??%" }
    ]
  },
  "Ray Gun": {
    icon: "{{@img:img/gear/ray-gun.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The divine artifact known as Pandora called forth unknown technology from the other world. When the trigger is pulled, a heat ray is released to burn the target, and when the button on the side is pressed in, a vibrating sphere of energy is released to blast the target.",
    stats: [
      { name: "Almighty", value: "+687", masked: "+??" },
      { name: "Magic Conversion", value: "+100%", masked: "+??%" },
      { name: "Void Conversion", value: "+100%", masked: "+??%" },
      { name: "Void Penetration", value: "+25%", masked: "+??%" },
      { name: "Initial Bravery", value: "+1", masked: "+??" }
    ]
  },

  "Handheld Cannon": {
    icon: "{{@img:img/gear/handheld-cannon.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "If it is possible to achieve higher firepower by throwing a cannonball with all one's might than by packing it into this and shooting it out, it is a needless substitute.",
    abilities: [
      { name: "Flaming Burst", color: "#ffa63d", icon: "{{@img:img/gear/pic--flaming-burst.webp}}", category: "Status", description: "{{Explosion}} damage dealt to enemies is treated as magical damage." },
      { name: "Explosion Specialist", color: "#ffa63d", icon: IMG[22], category: "Status", description: "{{Explosion}} damage can now critically hit" }
    ],
    stats: [
      { name: "Explosion Enhancement", value: "+50%", masked: "+??%" },
      { name: "Almighty", value: "+691", masked: "+??" },
      { name: "Explosion Piercing", value: "+25%", masked: "+??%" }
    ]
  },

  "Scepter of Sandra": {
    icon: "{{@img:img/gear/scepter-of-sandra.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The prestige of Schneeburg's previous queen, Sandra, has left its mark on today's Schneeburg. But that made the pressure on his successor, Vera, even heavier.",
    abilities: [
      { name: "Ice sculpture", color: "#ffa63d", icon: "{{@img:img/gear/pic--ice-sculpture.webp}}", category: "Status", description: "Whenever you defeat an enemy inflicted with {{Frostbite}}, summon a ice golem with power based on the amount of {{Frostbite}} inflicted" },
      { name: "Frostbite Specialist", color: "#ffa63d", icon: IMG[31], category: "Status", description: "{{Frostbite}} damage can now critically hit" }
    ],
    stats: [
      { name: "INTelligence+PIEty", value: "+859", masked: "+??" },
      { name: "Frostbite Enhancement", value: "+80%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Summon Damage", value: "+50%", masked: "+??%" }
    ]
  },

  "Star crusher": {
    icon: "{{@img:img/gear/star-crusher.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Forged from blue meteoric iron, the armor absorbs the life of its owner and increases its luster.",
    abilities: [
      { name: "Benefits of Flaus", color: "#ffa63d", icon: IMG[14], category: "Status", description: "Gain Healing Power equal to 200% of {{Prayer}}." },
      { name: "Craftsmanship", color: "#ffa63d", icon: IMG[8], description: "When leveling up, the performance of this equipment is improved" }
    ],
    stats: [
      { name: "STRength", value: "+1419", masked: "+??" },
      { name: "PIEty", value: "+1437", masked: "+??" }
    ],
    randomStats: [
      { name: "Item Reuse", value: "+25%", masked: "+??%" }
    ]
  },

  "Ruler": {
    icon: "{{@img:img/gear/ruler.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The true ruler is the one who convinces those who are ruled that they rule.",
    abilities: [
      { name: "Ancient Tactics", color: "#ffa63d", icon: "{{@img:img/gear/pic--ancient-tactics.webp}}", category: "Status", description: "Whenever you get a buff, Bravery +2" },
      { name: "Victory Cry", color: "#ffa63d", icon: "{{@img:img/gear/pic--victory-cry.webp}}", category: "Status", description: "Whenever you defeat an enemy, gain +1 Bravery" }
    ],
    stats: [
      { name: "Almighty", value: "+687", masked: "+??" },
      { name: "Double Penetration", value: "+25%", masked: "+??%" },
      { name: "Instant Cooldown", value: "+25%", masked: "+??%" }
    ]
  },

  "Yggdrasil": {
    icon: "{{@img:img/gear/yggdrasil.webp}}",
    category: "Equipment",
    flavor: "It is rumored that in the depths of the Great Forest of Nordmere, there is a huge tree that rises to the sky, but if such a thing were real, it would be visible from outside the forest.",
    stats: [
      { name: "Sure Hit", color: "#ff6f8e", icon: IMG[41], description: "Skills with normal hit calculation will always successfully hit" },
      { name: "Haste", value: "+1", masked: "+??" },
      { name: "Final Blow", value: "+30%", masked: "+??%" },
      { name: "Physical Penetration", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Direct Damage Resistance", value: "+25%", masked: "+??%" }
    ]
  },

  "Holy Knight of Scheinenaue": {
    icon: "{{@img:img/gear/holy-knight-of-scheinenaue.webp}}",
    category: "Equipment",
    flavor: "The center of the Flausian religion is the Secunda Rushe Cathedral in Launi, where the archbishop resides, but in terms of the population and power of its followers, Scheinenaue is the largest.",
    abilities: [
      { name: "Light Bullet Specialist", color: "#ffa63d", icon: IMG[32], category: "Status", description: "Light bullet damage can now critically hit" }
    ],
    stats: [
      { name: "STRength", value: "+868", masked: "+??" },
      { name: "PIEty", value: "+837", masked: "+??" },
      { name: "Magical Penetration", value: "+25%", masked: "+??%" },
      { name: "Light Bullet Enhancement", value: "+50%", masked: "+??%" }
    ]
  },

  "Flamberge": {
    icon: "{{@img:img/gear/flamberge.webp}}",
    category: "Equipment",
    flavor: "While sword smiths around the world have all been obsessed with forging the sharpest blades, the engineers at Trae took a different approach. They engineered a blade that would most efficiently take the life of the cutter.",
    abilities: [
      { name: "Bleed Specialist", color: "#ffa63d", icon: IMG[19], category: "Status", description: "{{Bleed}} damage can now critically hit" }
    ],
    stats: [
      { name: "Permanent Bleeding", color: "#ff6f8e", icon: IMG[19], description: "Effects on the enemy will not be removed by the passage of a turn." },
      { name: "STRength", value: "+803", masked: "+??" },
      { name: "DEXterity", value: "+825", masked: "+??" },
      { name: "Bleed Enhancement", value: "+50%", masked: "+??%" }
    ]
  },

  "Malice of the Swamp": {
    icon: "{{@img:img/gear/malice-of-the-swamp.webp}}",
    category: "Equipment",
    flavor: "Woltland's primitive witchcraft is so potent because of its purity that it is difficult to resist directly. Even doubled amounts of magic power cannot stop it.",
    abilities: [
      { name: "Poison Specialist", color: "#ffa63d", icon: IMG[59], category: "Status", description: "{{Poison}} damage can now critically hit" },
      { name: "Cursed Item", color: "#ffa63d", icon: IMG[15], description: "This equipment has much higher performance than normal, but +1 consumption of each skill" }
    ],
    stats: [
      { name: "Poison Enhancement", value: "+75%", masked: "+??%" },
      { name: "DEXterity+INTelligence", value: "+1410", masked: "+??" },
      { name: "Additional Poison", value: "+25%", masked: "+??%" }
    ]
  },

  "Kaworu's Dagger": {
    icon: "{{@img:img/gear/kaworu-s-dagger.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The next head of the Hironaga family abandoned his hometown and set out on a journey through the countries. He lost his beloved entourage on the day of the prophecy, yet he never stopped walking, and it seems that he is still traveling somewhere.",
    abilities: [
      { name: "Kunoichi Seal", color: "#ffa63d", icon: "{{@img:img/gear/pic--kunoichi-seal.webp}}", category: "Status", description: "Whenever you use a skill, the cooldown of all skills is reduced by 1." }
    ],
    stats: [
      { name: "DEXterity", value: "+1010", masked: "+??" },
      { name: "INTelligence", value: "+1020", masked: "+??" },
      { name: "Additional Action", value: "+25%", masked: "+??%" },
      { name: "Preemptive Strike", value: "+100%", masked: "+??%" }
    ]
  },

  "Elemental Master": {
    icon: "{{@img:img/gear/elemental-master.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Those who study magic usually major in one field. However, there are those who are gifted enough to become authorities in more than one field.",
    stats: [
      { name: "INTelligence", value: "+813", masked: "+??" },
      { name: "PIEty", value: "+827", masked: "+??" },
      { name: "Attribute Enhancement: Burn", value: "+100%", masked: "+??%" },
      { name: "Attribute Enhancement: Frostbite", value: "+100%", masked: "+??%" },
      { name: "Attribute Enhancement: Electrified", value: "+100%", masked: "+??%" }
    ]
  },

  "Asara's Punishment": {
    icon: "{{@img:img/gear/asara-s-punishment.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "It seems that Ursala was highly trusted by Flaus, as she was allowed to use most of Flaus's powers as is if Ursala herself deemed it necessary.",
    abilities: [
      { name: "Birth of Spirits", color: "#ffa63d", icon: "{{@img:img/gear/pic--birth-of-spirits.webp}}", category: "Status", description: "Every time you defeat an enemy, summon a Holy Spirit whose strength corresponds to the amount of light bullets you have." }
    ],
    stats: [
      { name: "STRength", value: "+1040", masked: "+??" },
      { name: "PIEty", value: "+1030", masked: "+??" },
      { name: "Light Bullet Extension", value: "+1", masked: "+??" }
    ],
    randomStats: [
      { name: "STR Mastery", value: "+25%", masked: "+??%" }
    ]
  },

  "Lord of Demons": {
    icon: "{{@img:img/gear/lord-of-demons.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "In hell, demons are boiling with chaos every day, competing for supremacy in their power and scheming. There are countless people who claim to be kings, and tomorrow, a different person will be king again.",
    abilities: [
      { name: "Hell's Thunder", color: "#ffa63d", icon: "{{@img:img/gear/pic--hell-s-thunder.webp}}", category: "Status", description: "{{Electrified}} damage dealt to enemies is treated as void damage." },
      { name: "Electrified Specialist", color: "#ffa63d", icon: IMG[23], category: "Status", description: "Electrification damage can now critically hit" }
    ],
    stats: [
      { name: "Electrified Extension", value: "+1", masked: "+??" },
      { name: "Electrified Enhancement", value: "+50%", masked: "+??%" },
      { name: "INTelligence+PIEty", value: "+845", masked: "+??" }
    ]
  },

  "Queen's Embrace": {
    icon: "{{@img:img/gear/queen-s-embrace.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Some of the poisonous spiders of Vasigardt conceive their prey and give birth to them as spiders. This property is very similar to that possessed by the baby otherworldly spiders found in the village of Lorchor.",
    abilities: [
      { name: "Spider Incubation", color: "#ffa63d", icon: "{{@img:img/gear/pic--spider-incubation.webp}}", category: "Status", description: "Whenever you defeat an enemy inflicted with {{Poison}}, summon a poisonous spider with power based on the amount of {{Poison}} inflicted" }
    ],
    stats: [
      { name: "DEXterity", value: "+853", masked: "+??" },
      { name: "INTelligence", value: "+844", masked: "+??" },
      { name: "Damage over Time Enhancement", value: "+25%", masked: "+??%" },
      { name: "Additional Action", value: "+25%", masked: "+??%" }
    ]
  },

  "Starry bow": {
    icon: "{{@img:img/gear/starry-bow.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Forged from blue meteoric iron, the armor absorbs the life of its owner and increases its luster.",
    abilities: [
      { name: "Assassination plan", color: "#ffa63d", icon: IMG[25], category: "Status", description: "Gain {{Critical}} equal to 100% of the {{Trick|Trick|cy}}." },
      { name: "Craftsmanship", color: "#ffa63d", icon: IMG[8], description: "When leveling up, the performance of this equipment is improved" }
    ],
    stats: [
      { name: "DEXterity", value: "+1406", masked: "+??" },
      { name: "INTelligence", value: "+1427", masked: "+??" }
    ],
    randomStats: [
      { name: "STRength+DEXterity", value: "+285", masked: "+??" }
    ]
  },

  "Freesia's Wand": {
    icon: "{{@img:img/gear/freesia-s-wand.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "It is believed that the unusually powerful magic possessed by faeries is due to their ability to obtain magic from the surrounding atmosphere and natural objects. Freesia was able to communicate with plants and flowers with her mind, and in terms of the amount of magical power she could handle, she had stepped into the realm of the gods.",
    abilities: [
      { name: "Fairy Magic Bullet", color: "#ffa63d", icon: "{{@img:img/gear/pic--fairy-magic-bullet.webp}}", category: "Status", description: "Whenever you gain a shield, you gain 50% of its value as light bullet" }
    ],
    stats: [
      { name: "INTelligence", value: "+1012", masked: "+??" },
      { name: "Shield", value: "+3177", masked: "+??" },
      { name: "Light Bullet Enhancement", value: "+50%", masked: "+??%" },
      { name: "Light Bullet Extension", value: "+1", masked: "+??" }
    ]
  },

  "Head of the Spires": {
    icon: "{{@img:img/gear/head-of-the-spires.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The method by which the soaring spire was created overnight remains a secret to this day. Few magicians could have predicted that it was created by constructing an extremely simple circular magic system.",
    abilities: [
      { name: "Grim reaper", color: "#ffa63d", icon: "{{@img:img/gear/pic--grim-reaper.webp}}", category: "Status", description: "Your HP stack reduction effects are doubled." }
    ],
    stats: [
      { name: "INTelligence", value: "+1033", masked: "+??" },
      { name: "PIEty", value: "+1022", masked: "+??" },
      { name: "Void Milling", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Curse Enhancement", value: "+50%", masked: "+??%" }
    ]
  },

  "Stargazing staff": {
    icon: "{{@img:img/gear/stargazing-staff.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Forged from blue meteoric iron, the armor absorbs the life of its owner and increases its luster.",
    abilities: [
      { name: "Discover weaknesses", color: "#ffa63d", icon: IMG[51], category: "Status", description: "Gain {{Magical}} Penetration equal to 100% of {{Focus}}." },
      { name: "Craftsmanship", color: "#ffa63d", icon: IMG[8], description: "When leveling up, the performance of this equipment is improved" }
    ],
    stats: [
      { name: "INTelligence", value: "+1406", masked: "+??" },
      { name: "PIEty", value: "+1432", masked: "+??" }
    ],
    randomStats: [
      { name: "Final Blow", value: "+30%", masked: "+??%" }
    ]
  },

  "Solamia Tools": {
    icon: "{{@img:img/gear/solamia-tools.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Members of the Engineers Union respect Solamia for her technical prowess and her open-mindedness, but her most outstanding quality is her determination to never give up and to keep trying.",
    abilities: [
      { name: "Mechanic", color: "#ffa63d", icon: "{{@img:img/gear/pic--mechanic.webp}}", category: "Status", description: "{{Summon}} a Metal Golem every time you pick up a treasure chest" }
    ],
    stats: [
      { name: "INTelligence", value: "+1030", masked: "+??" },
      { name: "PIEty", value: "+1043", masked: "+??" },
      { name: "Sniping", value: "+100%", masked: "+??%" }
    ],
    randomStats: [
      { name: "PIE Mastery", value: "+25%", masked: "+??%" }
    ]
  },

  "Ninja Leader": {
    icon: "{{@img:img/gear/ninja-leader.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "The ninja leader never appears in public. If their existence were known, they would naturally be targeted for assassination by hostile forces. And no one even knows the chain of command. There are even rumors that the leader himself does not exist.",
    abilities: [
      { name: "Ninja Secret", color: "#ffa63d", icon: "{{@img:img/gear/pic--ninja-secret.webp}}", category: "Status", description: "Apply the effect of the rune \"Quicker\" to all skills." }
    ],
    stats: [
      { name: "DEXterity", value: "+843", masked: "+??" },
      { name: "PIEty", value: "+841", masked: "+??" },
      { name: "Instant Cooldown", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Toughness", value: "+25%", masked: "+??%" }
    ]
  },

  "Gottfried's Greatsword": {
    icon: "{{@img:img/gear/gottfried-s-greatsword.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The essence of Gottfried's swordsmanship lies in his mobility supplemented by magic items. It was not something that just anyone could do, but only his genius could make it possible.",
    abilities: [
      { name: "Superhumanity", color: "#ffa63d", icon: "{{@img:img/gear/pic--superhumanity.webp}}", category: "Status", description: "{{Critical}}+n% (n is increased by the total number of the temporary buff you are currently getting)" }
    ],
    stats: [
      { name: "STRength", value: "+1023", masked: "+??" },
      { name: "DEXterity", value: "+1027", masked: "+??" },
      { name: "Sniping", value: "+100%", masked: "+??%" },
      { name: "Physical Penetration", value: "+25%", masked: "+??%" }
    ]
  },

  "Bottomless Desire": {
    icon: "{{@img:img/gear/bottomless-desire.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "It is said that \"knowing enough is enough,\" but we should think of it that way because we can't get what we want.",
    stats: [
      { name: "Gold Rush", value: "100%", masked: "??%" },
      { name: "STRength", value: "+852", masked: "+??" },
      { name: "DEXterity", value: "+829", masked: "+??" },
      { name: "Soulstone Looting", value: "+3", masked: "+??" }
    ],
    randomStats: [
      { name: "Magical Penetration", value: "+25%", masked: "+??%" }
    ]
  },


  "Volcanic": {
    icon: "{{@img:img/gear/volcanic.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "The lava spewed from the Ya Moto volcano of Mlima Nyota continues to harbor flames that do not solidify for several years after coming into contact with the air on the surface of the earth.",
    stats: [
      { name: "Permanent Burn", color: "#ff6f8e", icon: IMG[13], description: "Effects on the enemy will not be removed by the passage of a turn." },
      { name: "STRength", value: "+840", masked: "+??" },
      { name: "INTelligence", value: "+850", masked: "+??" },
      { name: "Burn Enhancement", value: "+50%", masked: "+??%" },
      { name: "Bravery Increase", value: "+25%", masked: "+??%" }
    ]
  },


  "Meteorite of Mlima Nyota": {
    icon: "{{@img:img/gear/meteorite-of-mlima-nyota.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "The rugged mountains of Mlima Nyota are thought to have been formed by the upheaval of craters created by the countless stars that fell on them.",
    abilities: [
      { name: "Explosion Specialist", color: "#ffa63d", icon: IMG[22], category: "Status", description: "{{Explosion}} damage can now critically hit" }
    ],
    stats: [
      { name: "STRength", value: "+837", masked: "+??" },
      { name: "INTelligence", value: "+821", masked: "+??" },
      { name: "Explosion Enhancement", value: "+50%", masked: "+??%" },
      { name: "Explosion Piercing", value: "+25%", masked: "+??%" }
    ]
  },


  "Cursed Wand": {
    icon: "{{@img:img/gear/cursed-wand.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "A curse is a formless wish, but if there are many who wish for it often, it works more powerfully. It is called a curse spirit, a pitiful spirit whose mind has been controlled in order to strengthen the wisher's wish.",
    abilities: [
      { name: "Cursed Spirits Summoning", color: "#ffa63d", icon: "{{@img:img/gear/pic--cursed-spirits-summoning.webp}}", category: "Status", description: "Whenever a curse is inflicted on an enemy, summon a {{Curse}}d Spirit with power based on the amount of curse being inflicted on the enemy" },
      { name: "Curse Specialist", color: "#ffa63d", icon: IMG[35], category: "Status", description: "{{Curse}} damage can now critically hit" }
    ],
    stats: [
      { name: "DEXterity", value: "+1020", masked: "+??" },
      { name: "PIEty", value: "+1028", masked: "+??" },
      { name: "Curse Enhancement", value: "+50%", masked: "+??%" }
    ]
  },

  "Shootingstar": {
    icon: "{{@img:img/gear/shootingstar.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Forged from blue meteoric iron, the armor absorbs the life of its owner and increases its luster.",
    abilities: [
      { name: "Spirit flame", color: "#ffa63d", icon: IMG[18], category: "Status", description: "Gain {{Physical}} Penetration equal to 100% of {{Rage}}." },
      { name: "Craftsmanship", color: "#ffa63d", icon: IMG[8], description: "When leveling up, the performance of this equipment is improved" }
    ],
    stats: [
      { name: "STRength", value: "+1410", masked: "+??" },
      { name: "DEXterity", value: "+1436", masked: "+??" }
    ],
    randomStats: [
      { name: "Healthy Resistance", value: "+50%", masked: "+??%" }
    ]
  },

  "Fighters of Ya Moto": {
    icon: "{{@img:img/gear/fighters-of-ya-moto.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "The ferocious eruptions of the Ya Mot volcano are a symbol of the fierceness of nature and have attracted strong beliefs.",
    abilities: [
      { name: "Incandescence", color: "#ffa63d", icon: "{{@img:img/gear/pic--incandescence.webp}}", category: "Status", description: "Whenever you gain an HP stack, you lose 1 HP stack.\nWhenever an enemy gains an HP stack, they lose 1 HP stack." }
    ],
    stats: [
      { name: "Burn Extension", value: "+1", masked: "+??" },
      { name: "Additional Burn", value: "+25%", masked: "+??%" },
      { name: "Magical Penetration", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "DEXterity", value: "+548", masked: "+??" }
    ]
  },

  "Einherjar": {
    icon: "{{@img:img/gear/einherjar.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "God sends his own sentinels to Vashigarh to move it for his purposes. The sentinels are sometimes at odds with each other and fight each other without being known to the public.",
    abilities: [
      { name: "Summon Battle Maiden", color: "#ffa63d", icon: "{{@img:img/gear/pic--summon-battle-maiden.webp}}", category: "Status", description: "Whenever you lose an HP stack, summon a Valkyrie minion" }
    ],
    stats: [
      { name: "STRength", value: "+832", masked: "+??" },
      { name: "PIEty", value: "+828", masked: "+??" },
      { name: "Double Penetration", value: "+15%", masked: "+??%" },
      { name: "Prayer Enhancement", value: "+25%", masked: "+??%" }
    ]
  },

  "Bianca's Staff": {
    icon: "{{@img:img/gear/bianca-s-staff.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Gordon, a good-natured man, never gave up on helping people even in the final days when the dead were rampant. Bianca respected him. It couldn't be called love, but at least she felt like she wanted to help Gordon in his reckless battle, even if it meant giving up his life.",
    abilities: [
      { name: "Lightning Shield", color: "#ffa63d", icon: "{{@img:img/gear/pic--lightning-shield.webp}}", category: "Status", description: "Whenever you gain a shield, gain a corresponding amount of {{Electrified}}/5 turns." }
    ],
    stats: [
      { name: "INTelligence", value: "+1015", masked: "+??" },
      { name: "PIEty", value: "+1032", masked: "+??" },
      { name: "Electrified Enhancement", value: "+50%", masked: "+??%" }
    ],
    randomStats: [
      { name: "INTelligence", value: "+25%", masked: "+??%" }
    ]
  },

  "Anastasia's Scepter": {
    icon: "{{@img:img/gear/anastasia-s-scepter.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Cunning vampires use advanced illusion techniques, making it extremely difficult to discover their true identity.",
    abilities: [
      { name: "Blood Modeling", color: "#ffa63d", icon: "{{@img:img/gear/pic--blood-modeling.webp}}", category: "Status", description: "Whenever you take damage, summon a Blood Golem with strength based on the damage received." }
    ],
    stats: [
      { name: "STRength", value: "+234", masked: "+??" },
      { name: "PIEty", value: "+231", masked: "+??" },
      { name: "Max HP", value: "+24%", masked: "+??%" }
    ],
    randomStats: [
      { name: "STRength+PIEty", value: "+64", masked: "+??" }
    ]
  },

  "General of Trae": {
    icon: "{{@img:img/gear/general-of-trae.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "The legends of Gottfried, the god of war, are legion. Gottfried is known to have been given the title of \"God of War\" for his achievements in single-handedly slaying thousands of men and returning from the dead at Farbranil. He is known to have been given the title of \"god of war\" for his achievements, or as they say, \"Fabulanir single-handedly.",
    stats: [
      { name: "Max HP", value: "+4272", masked: "+??" },
      { name: "Max HP Stacks", value: "1", masked: "??" },
      { name: "Ironclad", value: "+100%", masked: "+??%" },
      { name: "Healthy Resistance", value: "+50%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Shield", value: "+25%", masked: "+??%" }
    ]
  },

  "Kenzo's Costume": {
    icon: "{{@img:img/gear/kenzo-s-costume.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Kenzo loved Sakura like a daughter. Sakura loved Kenzo like a father, and the two knew that they could be a real family even though they were not blood related.",
    stats: [
      { name: "Additional Action", value: "+100%", masked: "+??%" },
      { name: "Max HP", value: "+4796", masked: "+??" },
      { name: "Shield", value: "+3155", masked: "+??" },
      { name: "DEXterity+INTelligence", value: "+857", masked: "+??" },
      { name: "DEX Mastery", value: "+25%", masked: "+??%" }
    ]
  },

  "Mirror of Dusk": {
    icon: "{{@img:img/gear/mirror-of-dusk.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Even those who do not have so-called \"eyes\" can see the outer light through a mirror made of the etheric body brought in from the outer heavens and earth.",
    ability: { name: "Infinite Light", color: "#ffa63d", icon: "{{@img:img/gear/pic--infinite-light.webp}}", category: "Status", description: "Whenever you level up, one ability from a random piece of equipment is replaced with a different random unique ability." },
    stats: [
      { name: "Parry", value: "+24%", masked: "+??%" },
      { name: "Resist: Physical", value: "+53%", masked: "+??%" },
      { name: "Initial Bravery", value: "+1", masked: "+??" }
    ],
    randomStats: [
      { name: "Resist: Damage over Time", value: "+50%", masked: "+??%" }
    ]
  },

  "Staff of the Five Great Sages": {
    icon: "{{@img:img/gear/staff-of-the-five-great-sages.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "The five presidents of the Royal Magic Academy were known as the Five Great Sages and possessed exceptional magical knowledge. Currently, one of them has died and the other is missing, leaving the position vacant.",
    ability: { name: "Trinity Elemental", color: "#ffa63d", icon: "{{@img:img/gear/pic--trinity-elemental.webp}}", category: "Status", description: "Gain {{Magical}} Penetration equivalent to 100% of {{Burn}} enhancement, {{Frostbite}} enhancement, and {{Electrified}} enhancement." },
    stats: [
      { name: "INTelligence", value: "+491", masked: "+??" },
      { name: "PIEty", value: "+484", masked: "+??" },
      { name: "Magical Milling", value: "+25%", masked: "+??%" }
    ],
    randomStats: [
      { name: "STRength+PIEty", value: "+135", masked: "+??" }
    ]
  },

  "Crystal Block": {
    icon: "{{@img:img/gear/crystal-block.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Natural, artificial magic stones are also rare. The magician who successfully refined them is currently missing, and no one else has been able to recreate them.",
    ability: { name: "Crystal Shell", color: "#ffa63d", icon: "{{@img:img/gear/pic--crystal-shell.webp}}", category: "Status", description: "At the start of each turn, lose 10% of your held Magic Stones and restore 1 HP Stack instead." },
    stats: [
      { name: "Max HP Stacks", value: "1", masked: "??" },
      { name: "Max HP Stacks", value: "1", masked: "??" },
      { name: "Greed", value: "+40%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Add Rune Slot", value: "+25%", masked: "+??%" }
    ]
  },

  "Trae's Shock Troops": {
    icon: "{{@img:img/gear/trae-s-shock-troops.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Trae's shock troops, using explosive assault stakes, were feared throughout the three Blastfort nations for their recklessness, and even their own allies avoided approaching them during battle.",
    ability: { name: "Inexorable Progress", color: "#ffa63d", icon: "{{@img:img/gear/pic--inexorable-progress.webp}}", category: "Status", description: "Skill Power of all skills +1% per cumulative cooldown." },
    stats: [
      { name: "STRength", value: "+194", masked: "+??" },
      { name: "DEXterity", value: "+188", masked: "+??" },
      { name: "Accuracy", value: "+24%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Magical Penetration", value: "+20%", masked: "+??%" }
    ]
  },

  "Oil Fields of Bal Igus": {
    icon: "{{@img:img/gear/oil-fields-of-bal-igus.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "In Bal Igus, Mlima Nyota, there is an oil field that is believed to never run dry. It is said that the oil field is actually a dimensional gate that leads to another world made up of an oil sea.",
    ability: { name: "Friction Disappearance", color: "#ffa63d", icon: "{{@img:img/gear/pic--friction-disappearance.webp}}", category: "Status", description: "Whenever you take critical damage, gain {{Physical}} Counter / 3 turns and {{Magical}} Counter / 3 turns." },
    stats: [
      { name: "Max HP", value: "+941", masked: "+??" },
      { name: "Shield", value: "+600", masked: "+??" },
      { name: "Toughness", value: "+40%", masked: "+??%" }
    ],
    randomStats: [
      { name: "Healthy Evasion", value: "+35%", masked: "+??%" }
    ]
  },

  "Scavenger in the Slums": {
    icon: "{{@img:img/gear/scavenger-in-the-slums.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "After the Day of Prophecy, the only time trash is produced in a city is when someone dies there.",
    ability: { name: "Repurposing of Materials", color: "#ffa63d", icon: "{{@img:img/gear/pic--repurposing-of-materials.webp}}", description: "Whenever you craft, gain -5 Craft Cost / 1 room." },
    stats: [
      { name: "Additional Action", value: "+35%", masked: "+??%" },
      { name: "Instant Cooldown", value: "+35%", masked: "+??%" },
      { name: "Crafting Cost", value: "-30%", masked: "-??%" }
    ],
    randomStats: [
      { name: "Ignore Crafting Cost", value: "+25%", masked: "+??%" }
    ]
  }
,
  "Void of the Underworld": {
    icon: "{{@img:img/gear/void-of-the-underworld.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Many sorcerers have confirmed the existence of a strange hole at the edge of the underworld that continually emits spiritual energy, but its true nature remains shrouded in mystery.",
    ability: { name: "Mirror of the Void", color: "#ffa63d", icon: "{{@img:img/gear/pic--mirror-of-the-void.webp}}", category: "Status", description: "Skills that deal {{Void}} damage activate one additional time." },
    stats: [
      { name: "INTelligence", value: "+840", masked: "+??" },
      { name: "PIEty", value: "+830", masked: "+??" },
      { name: "Causes and Effects", value: "+5%", masked: "+??%" }
    ],
    randomStats: [
      { name: "STR Mastery", value: "+25%", masked: "+??%" }
    ]
  },

  "Twisted Forest of Rainabel": {
    icon: "{{@img:img/gear/twisted-forest-of-rainabel.webp}}",
    category: "Equipment",
    stars: 6,
    flavor: "Deep in the rainforests of southern Rainabel lies a forest where the trees are abnormally twisted, and the cause of this abnormal growth has only just been discovered.",
    ability: { name: "Unnatural Body", color: "#ffa63d", icon: "{{@img:img/gear/pic--unnatural-body.webp}}", category: "Status", description: "At the start of each turn, force all enemy-held skills to revert from Alt Mode to Default Mode." },
    stats: [
      { name: "Max HP", masked: "+??" },
      { name: "Shield", masked: "+??" },
      { name: "Rest", masked: "??" }
    ],
    randomStats: [
      { name: "STR Mastery", value: "+25%", masked: "+??%" }
    ]
  },
  "Shizune's Fan": {
    icon: "{{@img:img/gear/shizune-s-fan.webp}}",
    category: "Equipment",
    stars: 7,
    flavor: "Legend has it that Shizune, a hero from the eastern kingdoms and a capricious tengu, used his fan to create gusts of wind that reached the end of the horizon.",
    ability: { name: "Shadow Replica", color: "#ffa63d", icon: "{{@img:img/gear/pic--shadow-replica.webp}}", category: "Status", description: "Each time a burst skill is used, gain {{Skill Boost}} +100%/1 turn and Boost Enhancement +100%/1 turn." },
    stats: [
      { name: "DEXterity", value: "+1013", masked: "+??" },
      { name: "INTelligence", value: "+1042", masked: "+??" },
      { name: "Initial Bravery", value: "+1", masked: "+??" }
    ],
    randomStats: [
      { name: "Dual Resistance", value: "+30%", masked: "+??%" }
    ]
  }
};
