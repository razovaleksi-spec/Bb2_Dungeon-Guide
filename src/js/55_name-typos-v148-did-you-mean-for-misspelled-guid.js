
/* ===== Name typos (v148): "Did you mean ...?" for misspelled guide names =====
   Problem (v147, tested): the engine itself finds "tsukyomi" -> Tsukuyomi, but the awareness check sees an unknown
   word and the free-talk layer replaces the right answer with "That is outside the guide ... happy to chat".
   Fix: an early pre stage (order 15: right after follow_memory 10, which does not pass the question down, and before
   synonyms_typos 20) swaps a misspelled name for the guide's own spelling before any other layer
   reads the question. The page then shows its usual "Understood as: ..." line, so the player sees the correction.
   Only words the page does not know (window.__qaKnown false) are touched, only when ONE guide name is clearly
   closest (a tie = no change), and the first letter must match. Names: ITEM_DETAILS, SKILL_DETAILS, the four
   tables, STATS, TERMS, BOSS_LOOT. Offline, no game facts added. Test hook: window.__qaNameTypo(text). */
(function(){'use strict';
var W=window;
if(!W.QA||!W.QA.pre||typeof W.QA.pre.add!=='function'||typeof W.__qaKnown!=='function'||W.__qaNameTypo)return;
var K0=W.__qaKnown,NAMES=null,CK={};
function nz(s){return String(s==null?'':s).toLowerCase().replace(/[‘’'"]/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
function names(){
  if(NAMES)return NAMES;
  var seen={},L=[];
  function add(n){
    n=String(n==null?'':n).replace(/::(weapon|armor|accessory|skill)$/,'').trim();
    if(!n||n==='—'||/[()]/.test(n))return;
    var z=nz(n),c=z.replace(/ /g,'');
    if(c.length<5||seen[c])return;
    seen[c]=1;L.push({n:n,c:c});
  }
  try{Object.keys(ITEM_DETAILS).forEach(add);}catch(e){}
  try{Object.keys(SKILL_DETAILS).forEach(add);}catch(e){}
  try{[DATA,CONQUEST,CONQUEST2,SPECIAL].forEach(function(T){(T||[]).forEach(function(r){
    add(r[0]);r.slice(1).forEach(function(cell){String(cell==null?'':cell).split(',').forEach(add);});});});}catch(e){}
  try{Object.keys(STATS).forEach(add);}catch(e){}
  try{Object.keys(TERMS).forEach(function(k){add(k);if(TERMS[k]&&TERMS[k].title)add(TERMS[k].title);});}catch(e){}
  try{Object.keys(BOSS_LOOT).forEach(function(k){add(k);(BOSS_LOOT[k]||[]).forEach(function(it){if(it)add(it.name);});});}catch(e){}
  NAMES=L;return L;
}
/* edit distance with swapped letters counted as one edit; gives up above lim */
function dist(a,b,lim){
  if(Math.abs(a.length-b.length)>lim)return lim+1;
  var n=a.length,m=b.length,p2=null,p=[],i,j,row,best;
  for(j=0;j<=m;j++)p[j]=j;
  for(i=1;i<=n;i++){row=[i];best=i;
    for(j=1;j<=m;j++){
      var c=a.charAt(i-1)===b.charAt(j-1)?0:1,v=Math.min(p[j]+1,row[j-1]+1,p[j-1]+c);
      if(p2&&i>1&&j>1&&a.charAt(i-1)===b.charAt(j-2)&&a.charAt(i-2)===b.charAt(j-1))v=Math.min(v,p2[j-2]+1);
      row[j]=v;if(v<best)best=v;}
    if(best>lim)return lim+1;
    p2=p;p=row;}
  return p[m];
}
function limit(len){return len<5?0:len<=7?1:len<=14?2:3;}
function fix(q){
  q=String(q==null?'':q);
  var re=/[A-Za-z0-9‘’']+/g,T=[],m;
  while((m=re.exec(q)))T.push({s:m.index,e:m.index+m[0].length,w:nz(m[0]).replace(/ /g,'')});
  var bad=[];
  T.forEach(function(t,i){if(t.w.length>=4&&!/^\d+$/.test(t.w)&&!K0(t.w))bad.push(i);});
  if(!bad.length)return q;
  var L=names(),picks=[];
  bad.forEach(function(i){
    var top=null,tie=false,exact=false;
    for(var a=Math.max(0,i-3);a<=i;a++)for(var b=i;b<=Math.min(T.length-1,a+3);b++){
      var c='';for(var k=a;k<=b;k++)c+=T[k].w;
      var lim=limit(c.length);if(!lim)continue;
      for(var x=0;x<L.length;x++){var N=L[x];
        if(N.c.charAt(0)!==c.charAt(0))continue;
        var d=dist(c,N.c,lim);if(d>lim)continue;
        if(d===0){exact=true;continue;}
        var span=b-a;
        if(!top||d<top.d||(d===top.d&&span>top.span)){top={a:a,b:b,d:d,span:span,n:N.n};tie=false;}
        else if(d===top.d&&span===top.span&&N.n!==top.n)tie=true;}
    }
    if(top&&!tie&&!exact)picks.push(top);/* already a guide name (only capitals / apostrophes differ) = leave it */
  });
  if(!picks.length)return q;
  picks.sort(function(x,y){return (T[y.a].s-T[x.a].s)||(y.span-x.span);});
  var out=q,last=Infinity;
  picks.forEach(function(p){if(T[p.b].e>last)return;out=out.slice(0,T[p.a].s)+p.n+out.slice(T[p.b].e);last=T[p.a].s;});
  return out;
}
W.__qaNameTypo=fix;
/* Free talk's looseMatch reads the RAW typed words: if none is known it swaps a real answer for the chat reply
   ("probably not about this"). A word that is clearly a misspelled guide name now counts as known, so the real
   answer stays. Only single words of 5+ letters that fix() turns into a guide name; results cached. */
W.__qaKnown=function(w){
  if(K0(w))return true;
  var k=String(w==null?'':w).toLowerCase();
  if(CK.hasOwnProperty(k))return CK[k];
  var r=false;try{if(k.length>=5&&/^[a-z0-9]+$/.test(k))r=fix(k)!==k;}catch(e){}
  CK[k]=r;return r;};
W.QA.pre.add('name_typos',15,function(P0){return function(raw){var q=P0?P0(raw):raw;try{return fix(q);}catch(e){return q;}};});
})();
