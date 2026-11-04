
/* ===== Loot popup: grid of drops + description popup (in-game style) ===== */
(function(){
var M=document.getElementById('lootModal'),D=document.getElementById('lootDesc'),cur=null;
var FR='<svg class="lt-frame" viewBox="0 0 100 100" aria-hidden="true"><path d="M35.6 16.4 50 2l14.4 14.4M83.6 35.6 98 50 83.6 64.4M64.4 83.6 50 98 35.6 83.6M16.4 64.4 2 50l14.4-14.4"/></svg>';
function X(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function lock(){var o=(M.classList.contains('open')||D.classList.contains('open'));document.body.style.overflow=o?'hidden':'';document.body.classList.toggle('loot-open',o);}
function closeDesc(){D.classList.remove('open');lock();}
function closeLoot(){D.classList.remove('open');M.classList.remove('open');lock();}
window.openLoot=function(boss){
  var L=BOSS_LOOT[boss];if(!L)return;cur=L;
  document.getElementById('lootGrid').innerHTML=L.map(function(it,i){
    return '<button type="button" class="lt-cell" data-i="'+i+'"><span class="lt-ico">'+FR+'<img src="'+it.icon+'" alt="'+X(it.name)+'"></span><span class="lt-name">Treasure box: <b style="color:'+it.color+'">'+X(it.name)+'</b></span></button>';
  }).join('');
  M.classList.add('open');lock();
};
document.getElementById('lootGrid').addEventListener('click',function(e){
  var c=e.target.closest('.lt-cell');if(!c||!cur)return;
  var it=cur[+c.dataset.i];if(!it)return;
  document.getElementById('lootDescBody').innerHTML='<div class="ld-head"><img src="'+it.icon+'" alt=""><span>'+X(it.name)+'</span></div><div class="ld-cat">'+X(it.category)+'</div><p class="ld-main">'+X(it.desc).replace(/\[\[(.+?)\]\]/g,function(m,x){return (typeof SKILL_DETAILS!=='undefined'&&SKILL_DETAILS[x])?'<span class="cy" data-kind="skilltab" data-name="'+x+'" style="cursor:pointer">'+x+'</span>':'<span class="cy">'+x+'</span>';})+'</p><p class="ld-note">'+X(it.note)+'</p>';
  D.classList.add('open');lock();
});
document.getElementById('lootClose').addEventListener('click',closeLoot);
document.getElementById('lootDescClose').addEventListener('click',closeDesc);
M.addEventListener('click',function(e){if(e.target===M)closeLoot();});
D.addEventListener('click',function(e){if(e.target===D){closeDesc();return;}var b=e.target.closest('.modal-box');if(b&&e.clientY-b.getBoundingClientRect().top<56)closeDesc();});
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape'||e.defaultPrevented)return; /* a skill card / term popup on top already used this Escape */
  if(D.classList.contains('open')){closeDesc();}else if(M.classList.contains('open')){closeLoot();}
});
/* keep the page behind locked while a skill card opened from the loot popup is closed again */
['itemModal','subModal'].forEach(function(id){var o=document.getElementById(id);if(!o)return;new MutationObserver(function(){if(M.classList.contains('open')||D.classList.contains('open'))document.body.style.overflow='hidden';}).observe(o,{attributes:true,attributeFilter:['class']});});
/* saved text edits can replace a dungeon cell; make sure the Loot link is still there */
[tbody,tbody2,tbody3,tbody4].forEach(function(tb){[].forEach.call(tb.children,function(tr){
  var n=Object.keys(BOSS_LOOT).filter(function(k){return k.toLowerCase()===tr.dataset.boss;})[0],td=tr.firstElementChild;
  if(n&&td&&!td.querySelector('.boss-loot'))td.insertAdjacentHTML('beforeend',bossLoot(n));
});});
try{relayoutSoon();}catch(e){}
})();
