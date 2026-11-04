
/* v129: "where can I loot Restart" -> the earlier rewrite layer turned the word loot into "gear for a loot build". When the sentence names one of the Loot-book skills, the word loot is read as get, so the Loot book answer runs. */
(function(){
var prev=window.__qaPre;if(typeof prev!=='function'||window.__lootPre129)return;window.__lootPre129=1;
var NAMES=[];
try{if(typeof BOSS_LOOT!=='undefined')Object.keys(BOSS_LOOT).forEach(function(k){BOSS_LOOT[k].forEach(function(it){var m=/\[\[(.+?)\]\]/.exec(it.desc||'');if(m&&/^book of /i.test(it.name))NAMES.push(m[1].toLowerCase());});});}catch(e){}
window.__qaPre=function(raw){
  try{var s=String(raw),l=s.toLowerCase();
    if(NAMES.length&&/\bloot(?:s|ed|ing)?\b/.test(l)&&NAMES.some(function(n){return (' '+l.replace(/[^a-z0-9' ]+/g,' ')+' ').indexOf(' '+n+' ')>=0;}))
      return prev.call(this,s.replace(/\bloot(?:s|ed|ing)?\b/gi,'get'));
  }catch(e){}
  return prev.apply(this,arguments);
};
})();
