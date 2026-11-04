
/* v83: alt-mode skill names (Lemegeton, Venom Burst, Summon Demon, Avatar, ...) answer "where does it drop" with the drop card of their main skill. Appended before </body>; nothing else changed. The page's own "Understood as" line shows the mapping. */
(function(){'use strict';
var ALT=[
['absolute\\s+zero\\s+release','Glyph of Ice'],['absolute\\s+zero','Glyph of Ice'],
['transform\\s+power\\s+release','Transform Power'],['call\\s+storm\\s+release','Eye of the Storm'],['call\\s+storm','Eye of the Storm'],
['learning\\s+release','Learning'],['summon\\s+legion','Bone Totem'],['summon\\s+demon','Demon Bite'],['venom\\s+burst','Deadly Stinger'],
['devil\'?s\\s+pact','Devil\'s Strike'],['slate\\s+breaker','Earth\'s Bind'],['void\\s+out','Eclipse'],['dancing\\s+jewel','Gem Bright'],
['avatar','Grand Cross'],['heaven\'?s\\s+ray','Judgement'],['lemegeton','Sealed Contraband'],['shadow\\s+servant','Shadow Walk'],
['lotus\\s+haze','Sword Flash'],['living\\s+armou?r','Armor Blessing'],['disaster\\s+skill','Void Edge']
].map(function(a){return {re:new RegExp('(^|[^a-z])('+a[0]+')(?![a-z])','i'),main:a[1]};});
function alt81(q){
  var t=String(q==null?'':q);
  var low=t.toLowerCase().replace(/[\u2018\u2019]/g,"'");
  var hit=null;
  for(var i=0;i<ALT.length;i++){if(ALT[i].re.test(low)){hit=ALT[i];break;}}
  if(!hit)return null;
  var u=low.replace(hit.re,'$1zzalt');
  var A='(a\\s+|an\\s+|the\\s+|some\\s+|my\\s+)?zzalt';
  var verb=new RegExp('\\b(i|we|you|to|should|can|could|will)\\s+drop\\s+(a\\s+|the\\s+|my\\s+)?zzalt\\b').test(u);
  var intent=(!verb&&/\bdrop(s|ped|ping)?\b/.test(u))
    ||new RegExp('\\b(get|find|obtain|acquire|unlock|farm|buy|loot)\\s+'+A+'\\b').test(u)
    ||new RegExp('\\bwhere\\s+(can\\s+i\\s+(get|find|buy|obtain)|do\\s+i\\s+(get|find)|to\\s+(get|find|buy|farm))\\b.{0,12}zzalt\\b').test(u)
    ||/\bwhere\s+(is|are)\s+(the\s+)?zzalt\s*\??\s*$/.test(u)
    ||/\bzzalt\s+(location|locations|source|sources|farm|farming|obtain|obtaining)\b/.test(u)
    ||(/\b(which|what)\s+(boss|bosses|dungeon|dungeons|disaster|disasters|conquest|conquests)\b/.test(u)&&/\b(gives?|lists?|carr(y|ies)|farm|fight\s+for|kill\s+for|hunt\s+for|for\s+zzalt)\b/.test(u));
  if(!intent)return null;
  var words=u.replace(/[^a-z0-9' ]+/g,' ').trim().split(/\s+/).length;
  if(words<=9&&!/\b(from|in|at|on|and|or|vs|versus|compare|than)\b/.test(u))return 'where does '+hit.main+' drop?';
  return t.replace(new RegExp(hit.re.source,'i'),'$1'+hit.main);
}
window.__qaAlt81=alt81;
var prev=window.__qaPre;
window.__qaPre=function(raw){
  try{var r=alt81(raw);if(r!==null)return r;}catch(e){}
  return prev?prev.apply(this,arguments):raw;
};
})();
