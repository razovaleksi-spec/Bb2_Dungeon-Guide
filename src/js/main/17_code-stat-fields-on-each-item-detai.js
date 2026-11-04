
/* STAT FIELDS on each ITEM_DETAILS entry:
   stats       = the equipment's own stats. Each has its own numeric value that changes with the item level and is random each time
                 you get or reroll the same equipment; it rises as the item levels up. "value" is only one sample, "masked" (e.g. +??%) is what the card shows.
   randomStats = randomized stats that can roll on rerolls (listed under "Reroll samples"). They are NOT "hidden stats" and are not part of the stats list. */
(function(){ // fill each equipment stat line from STATS so every renderer sees the same fields as before
  Object.keys(ITEM_DETAILS).forEach(function(k){ var it=ITEM_DETAILS[k];
    ['stats','randomStats'].forEach(function(f){ (it[f]||[]).forEach(function(s){
      var def=STATS[s.name]; if(!def) return;
      if(!s.color) s.color=def.color; if(!s.icon) s.icon=def.icon;
      s.description=(def.pct && /%/.test(s.value||'')) ? def.pct : def.description;
    }); });
  });
})();

