
/* Skills by stat or ability (v95): a typed search bar like "Find gear by stat or ability".
   Only the skills listed in the page's 6 and 7 star tables (all of them have a skill card). Tapping a row opens the normal skill card. */
(function(){
if(window.__sbs95)return;window.__sbs95=1;
var inp0=document.getElementById('advSearch'),panel0=document.getElementById('advPanel'),hdr=document.querySelector('header');
if(!inp0||!hdr)return;
var LAY={'Activate the skill':1,'Cooldown':1,'Remaining Uses':1,'Always':1,'Alt mode':1,'Using burst skill':1};
var MAIN={'STRength':'S','DEXterity':'D','INTelligence':'I','PIEty':'P'};
var SC={S:'#f83030',D:'#30f830',I:'#3098f8',P:'#f8f830'};
var SN={S:'STR',D:'DEX',I:'INT',P:'PIE'};
var PTS={S:'<rect x="2" y="2" width="16" height="16"/>',D:'<polygon points="10,2 18,18 2,18"/>',I:'<polygon points="2,2 18,2 10,18"/>',P:'<polygon points="10,1 19,10 10,19 1,10"/>'};
var ALIAS=[['ailment chance','ailment hit'],['status chance','ailment hit']];
function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function h(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function shape(k,sz){return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 20 20" fill="'+SC[k]+'">'+PTS[k]+'</svg>';}
function starColor(n){return n>=7?'#f83030':n===6?'#f89800':'#ffffff';}
var css=document.createElement('style');
css.textContent='input#skSearch{width:100%;margin-top:8px;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:#0d0f14;color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;caret-color:#ffffff;font-size:15px}'
+'input#skSearch::placeholder{color:var(--dim)}'
+'input#skSearch:focus{outline:2px solid var(--accent);-webkit-text-fill-color:#ffffff !important}'
+'.adv-stars.sk-top{display:flex;align-items:center;justify-content:space-between;gap:6px}'
+'.sk-cat{display:inline-flex;align-items:center;gap:4px;line-height:0}';
document.head.appendChild(css);
/* the page's own skill entries: names in the 6 star (column 7) and 7 star (column 8) skill lists of the boss tables */
var pst={};
try{[DATA,CONQUEST,CONQUEST2,SPECIAL].forEach(function(a){(a||[]).forEach(function(r){[[7,6],[8,7]].forEach(function(p){(r[p[0]]||'').split(',').forEach(function(x){x=x.trim();if(x&&x!=='\u2014'&&SKILL_DETAILS[x])pst[x]=Math.max(pst[x]||0,p[1]);});});});});}catch(e){}
/* v131: the skill books in the Loot (BOSS_LOOT, Trial) give 7 star skills that are in no boss table, so the search added none of them; add them here */
try{Object.keys(BOSS_LOOT).forEach(function(k){BOSS_LOOT[k].forEach(function(it){var m=/\[\[(.+?)\]\]/.exec(it.desc||'');if(m&&/^book of /i.test(it.name)&&SKILL_DETAILS[m[1]])pst[m[1]]=Math.max(pst[m[1]]||0,7);});});}catch(e){}
function build(){
 return Object.keys(pst).map(function(n){
  var d=SKILL_DETAILS[n],grp=(d.group&&d.group.length?d.group:[n]).filter(function(g){return SKILL_DETAILS[g];});
  if(grp.indexOf(n)<0)grp.unshift(n);
  var cat={},catN=[],lines=[],seen={};
  (d.category||[]).forEach(function(c){var k=MAIN[c[0]];if(k){cat[k]=1;catN.push(norm(c[0]));}});
  grp.forEach(function(g){
   (SKILL_DETAILS[g].description||'').split('\n').forEach(function(line){
    var re=/\{\{(.+?)\}\}(\s*~~(.+?)~~)?/g,m;
    while((m=re.exec(line))){
     var parts=m[1].split('|'),t=parts[0].trim();
     if(LAY[t]||MAIN[t])continue;
     var T=null;try{T=TERMS[t];}catch(e){}
     var col=parts[2]==='red'?'#f01818':parts[2]==='cy'?'#33e6e6':(T&&T.pink?'#f09898':'#33e6e6');
     var key=t+'|'+(m[3]||'');if(seen[key])continue;seen[key]=1;
     lines.push({n:t,nN:norm(t),v:m[3]||'',c:col});
    }
   });
  });
  return {name:n,nameN:norm(n),icon:d.icon||'',stars:d.stars||pst[n],cat:['S','D','I','P'].filter(function(k){return cat[k];}),catN:catN,lines:lines};
 });
}
var ENTRIES=[];try{ENTRIES=build();}catch(e){}
var inp=document.createElement('input');inp.id='skSearch';inp.type='text';inp.placeholder='Find skills by stat or ability';inp.autocomplete='off';inp.setAttribute('aria-label','Search skills by stat or ability');
inp0.insertAdjacentElement('afterend',inp);
var panel=document.createElement('div');panel.id='skPanel';panel.className='adv-panel';panel.setAttribute('role','region');panel.setAttribute('aria-label','Skill search results');
(panel0||inp).insertAdjacentElement('afterend',panel);
function matchAll(e,terms){return terms.every(function(t){return e.nameN.indexOf(t)>=0||e.catN.some(function(c){return c.indexOf(t)>=0;})||e.lines.some(function(l){return l.nN.indexOf(t)>=0;});});}
var state={res:[],terms:[],shown:0},PAGE=30;
function size(){var vv=window.visualViewport,H=vv?vv.height:window.innerHeight;panel.style.maxHeight=Math.max(160,H-hdr.getBoundingClientRect().bottom-16)+'px';}
function close(){panel.classList.remove('open');}
function rowHTML(e){
 var col=starColor(e.stars);
 var names=e.cat.map(function(k){return SN[k];}).join(' / ');
 var cat=e.cat.length?'<span class="sk-cat" title="Category: '+names+'" aria-label="Category: '+names+'">'+e.cat.map(function(k){return shape(k,14);}).join('')+'</span>':'';
 var top='<div class="adv-stars sk-top"><span style="color:'+col+'">'+'\u2605'.repeat(e.stars)+'</span>'+cat+'</div>';
 var lines=e.lines.map(function(l){
  var hit=state.terms.some(function(t){return l.nN.indexOf(t)>=0;});
  return '<span class="adv-l'+(hit?' hit':'')+'"><span style="color:'+l.c+'">'+h(l.n)+'</span>'+(l.v?' <span style="color:#f09898">'+h(l.v)+'</span>':'')+'</span>';
 }).join(', ');
 return '<div class="adv-row" data-name="'+h(e.name)+'"><img class="adv-ico" src="'+e.icon+'" alt="">'+
  '<div class="adv-main">'+top+'<div class="adv-name" style="color:'+col+'">'+h(e.name)+'</div><div class="adv-stats">'+lines+'</div></div>'+
  '<button type="button" class="adv-q" aria-label="Open '+h(e.name)+'">?</button></div>';
}
function paint(){
 var part=state.res.slice(0,state.shown).map(rowHTML).join('');
 var more=state.shown<state.res.length?'<button type="button" class="adv-more">Show more ('+(state.res.length-state.shown)+' left)</button>':'';
 panel.querySelector('.adv-list').innerHTML=part+more;
}
function render(){
 var raw=norm(inp.value).trim();
 if(!raw){close();return;}
 ALIAS.forEach(function(a){raw=raw.split(a[0]).join(a[1]);});
 var terms=raw.split(/[,+;]/).map(function(x){return x.trim();}).filter(Boolean);
 var res=ENTRIES.filter(function(e){return matchAll(e,terms);});
 if(!res.length&&terms.length===1&&/\s/.test(terms[0])){
  var words=terms[0].split(/\s+/),alt=ENTRIES.filter(function(e){return matchAll(e,words);});
  if(alt.length){res=alt;terms=words;}
 }
 res.sort(function(a,b){return (b.stars-a.stars)||a.name.localeCompare(b.name,'en',{sensitivity:'base'});});
 state={res:res,terms:terms,shown:Math.min(PAGE,res.length)};
 panel.innerHTML='<div class="adv-top"><span>'+(res.length?res.length+' skills found':'')+'</span><button type="button" class="adv-close">Close</button></div>'+
  (res.length?'<div class="adv-list"></div>':'<div class="adv-empty">No skill has that stat or ability.</div><div class="adv-list"></div>');
 if(res.length)paint();
 if(panel0)panel0.classList.remove('open');
 panel.classList.add('open');size();
}
inp.addEventListener('input',render);
inp.addEventListener('focus',function(){if(inp.value.trim())render();});
inp.addEventListener('keydown',function(e){if(e.key==='Escape'){close();inp.blur();}});
inp0.addEventListener('input',close);inp0.addEventListener('focus',close);
window.addEventListener('resize',function(){if(panel.classList.contains('open'))size();});
if(window.visualViewport)window.visualViewport.addEventListener('resize',function(){if(panel.classList.contains('open'))size();});
panel.addEventListener('click',function(e){
 if(e.target.closest('.adv-close')){close();return;}
 if(e.target.closest('.adv-more')){state.shown=Math.min(state.res.length,state.shown+PAGE);paint();return;}
 var row=e.target.closest('.adv-row');
 if(row){inp.blur();try{openItemModal(row.dataset.name,'skill');}catch(err){}}
});
document.addEventListener('click',function(e){
 if(!panel.classList.contains('open'))return;
 if(e.target.closest('#skPanel')||e.target.closest('#skSearch')||e.target.closest('.modal-overlay'))return;
 close();
});
})();
