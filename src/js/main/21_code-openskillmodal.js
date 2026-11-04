
function openSkillModal(name){
  const d = SKILL_DETAILS[name] || {_empty:true, description:'No skill data yet.'};
  const group = d.group || [name];
  const tabs = d._empty ? '' : '<div class="skill-tabs">' + group.map(g=>{
        const s = SKILL_DETAILS[g];
        return '<div class="skill-tab'+(g===name?' sel':'')+'" data-kind="skilltab" data-name="'+esc(g)+'"><img src="'+s.icon+'" alt=""><span>'+esc(g)+'</span></div>';
      }).join('') + '</div>';
  const slotCount = d.slots || Math.max(0, ...group.map(g=>(SKILL_DETAILS[g]||{}).slots||0));
  const slotsHTML = slotCount
    ? '<div class="skill-slots">' + Array.from({length:slotCount},(_,n)=>'<div class="skill-slot-wrap" data-kind="slot" data-slot="'+n+'"><div class="skill-slot"></div><span>Empty slot</span></div>').join('') + '</div>'
    : '';
  modalContent.innerHTML =
    '<div class="skill-card">'+
      '<div class="skill-head">'+
        (d.icon ? '<img class="game-icon" src="'+d.icon+'" alt="">' : '<div class="game-icon" style="background:#111"></div>')+
        '<span class="game-title">'+esc(name)+'</span>'+
        '<div class="skill-meta"><div class="skill-category-row">'+(d._empty ? '' : (d.category && d.category.length) ? ('<span class="skill-category-label">Category:</span> <span class="skill-category-values">'+d.category.map(c=>'<span style="color:'+c[1]+'">'+esc(c[0])+'</span>').join('/<wbr>')+'</span>') : '<span class="skill-category-label">No Category</span>')+'</div><div class="skill-stars'+(d.stars===7?' s7':'')+'">'+'\u2605'.repeat(d._empty ? 0 : (d.stars||6))+'</div></div>'+
      '</div>'+
      tabs+
      '<div class="skill-scroll">'+
        '<div class="skill-desc" id="skillDesc">'+richText(d.description)+'</div>'+
        '<div class="skill-track" id="skillTrack"><div class="skill-thumb" id="skillThumb"></div></div>'+
      '</div>'+
      slotsHTML+
    '</div>';
  modalOverlay.classList.add('open');
  initSkillScroll();
}

function initSkillScroll(){
  const desc = document.getElementById('skillDesc');
  const track = document.getElementById('skillTrack');
  const thumb = document.getElementById('skillThumb');
  if(!desc || !track || !thumb) return;
  function update(){
    const th = track.clientHeight, sh = desc.scrollHeight, ch = desc.clientHeight;
    if(sh <= ch + 1){ thumb.style.height = th+'px'; thumb.style.top = '0px'; return; }
    const h = Math.max(28, th * ch / sh);
    thumb.style.height = h+'px';
    thumb.style.top = ((th - h) * desc.scrollTop / (sh - ch))+'px';
  }
  desc.addEventListener('scroll', update);
  let drag = null;
  thumb.addEventListener('pointerdown', e=>{
    e.preventDefault();
    try{ thumb.setPointerCapture(e.pointerId); }catch(err){}
    drag = { y: e.clientY, st: desc.scrollTop };
  });
  thumb.addEventListener('pointermove', e=>{
    if(!drag) return;
    const room = track.clientHeight - thumb.offsetHeight;
    const range = desc.scrollHeight - desc.clientHeight;
    if(room > 0) desc.scrollTop = drag.st + (e.clientY - drag.y) * range / room;
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>thumb.addEventListener(ev, ()=>{ drag = null; }));
  track.addEventListener('pointerdown', e=>{
    if(e.target === thumb) return;
    const r = track.getBoundingClientRect();
    desc.scrollTop = ((e.clientY - r.top) / r.height) * (desc.scrollHeight - desc.clientHeight);
  });
  update();
}


function renderGalleryHTML(name, emptyMsg){
  const imgs = ITEM_IMAGES[name];
  if(imgs && imgs.length){
    return '<div class="modal-images">' + imgs.map(src=>'<img src="'+src+'" alt="'+esc(name)+'">').join('') + '</div>';
  }
  return '<p class="modal-empty">' + (emptyMsg || 'No image uploaded for this item yet.') + '</p>';
}

function richText(str){
  return esc(str||'')
    .replace(/\{\{(.+?)\}\}/g, (m,inner)=>{
      const parts = inner.split('|');
      const t = parts[0], label = parts[1] || t;
      const T = TERMS[t];
      const img = (T && T.inline && T.icon) ? '<img class="inline-icon" src="'+T.icon+'" alt="">' : '';
      const body = (T && T.inline === 'before') ? img+label : label+img;
      return '<span class="term-link'+(parts[2]==='red' ? ' rd' : (parts[2]==='cy' ? '' : (T && T.pink ? ' pk' : '')))+'" data-kind="term" data-term="'+t+'">'+body+'</span>';
    })
    .replace(/\[\[(.+?)\]\]/g, (m,x)=>'<span class="cy">'+x+'</span>')
    .replace(/%%(.+?)%%/g, (m,x)=>'<span class="cy">'+x+'</span>')
    .replace(/~~(.+?)~~/g, (m,x)=>'<span class="pk">'+x+'</span>')
    .replace(/@@(.+?)@@/g, (m,x)=>'<span class="rd">'+x+'</span>')
    .replace(/\^\^(.+?)\^\^/g, (m,x)=>'<span class="sm">'+x+'</span>')
    .replace(/\$\$(.+?)\$\$/g, (m,x)=>'<span class="gn">'+x+'</span>')
    .replace(/##(.+?)##/g, (m,x)=>'<span class="og">'+x+'</span>');
}

function openTermDetail(term){
  const t = TERMS[term] || {title: term, description: 'No description yet.'};
  subModalContent.innerHTML =
    '<div class="sub-header">'+
      (t.icon ? '<img class="game-icon" src="'+t.icon+'" alt="">' : '')+
      '<span class="game-title">'+esc(t.title||term)+'</span>'+
      (t.category ? '<span class="game-category">'+esc(t.category)+'</span>' : '')+
    '</div>'+
    '<p class="sub-desc">'+richText(t.description)+'</p>';
  subModalOverlay.classList.add('open');
}

function openDungeonStatDetail(name, value){
  const def = STATS[name]; if(!def) return;
  const desc = (def.pos && /^\s*\+/.test(value || '')) ? def.pos : def.description;
  subModalContent.innerHTML =
    '<div class="sub-header">'+
      (def.icon ? '<img class="game-icon" src="'+def.icon+'" alt="">' : '')+
      '<span class="game-title">'+esc(name)+'</span>'+
      '<span class="game-category">'+esc(def.category || 'Status')+'</span>'+
    '</div>'+
    '<p class="sub-desc">'+richText(desc)+'</p>';
  subModalOverlay.classList.add('open');
}

function resolveKey(name, slot){ const k = slot ? name+'::'+slot : ''; return (k && (ITEM_DETAILS[k] || ITEM_IMAGES[k])) ? k : name; }
function dispName(k){ return k.replace(/::(weapon|armor|accessory|skill)$/,''); }
function openItemModal(name, slot){
  const isEquipSlot = slot==='weapon' || slot==='armor' || slot==='accessory';
  if(slot==='skill' || (!isEquipSlot && SKILL_DETAILS[name])){ openSkillModal(name); return; }
  const key = resolveKey(name, slot);
  const d = ITEM_DETAILS[key];
  if(d){
    const abilityList = d.abilities || (d.ability ? [d.ability] : []);
    const abilityLine = abilityList.map(a=>
      '<div class="detail-line ability-line" style="color:'+(a.color||'#ffa63d')+'" data-kind="ability" data-name="'+esc(key)+'" data-stat="'+esc(a.name)+'">'+esc(a.name)+'</div>'
    ).join('');
    const statLines = (d.stats||[]).map(s=>
      '<div class="detail-line" style="color:'+s.color+'" data-kind="stat" data-name="'+esc(key)+'" data-stat="'+esc(s.name)+'">'+esc(s.name)+(s.masked ? (' '+esc(s.masked)) : (s.value ? (' '+esc(s.value)) : ''))+'</div>'
    ).join('');
    modalContent.innerHTML =
      '<div class="game-card">'+
        '<div class="game-card-header" data-kind="reroll" data-name="'+esc(key)+'">'+
          '<img class="game-icon" src="'+d.icon+'" alt="">'+
          '<span class="game-title">'+esc(name)+'</span>'+
          '<span class="game-category">'+esc(d.category||'')+'</span>'+
        '</div>'+
        '<div class="game-lines">'+abilityLine+statLines+'</div>'+
        (d.flavor ? '<p class="game-flavor">'+esc(d.flavor)+'</p>' : '')+
        '<div class="game-ground"></div>'+
      '</div>';
  } else {
    modalContent.innerHTML =
      '<div class="game-card">'+
        '<div class="game-card-header">'+
          '<span class="game-title">'+esc(name)+'</span>'+
          '<span class="game-category">Equipment</span>'+
        '</div>'+
        '<p class="game-flavor">No item data yet.</p>'+
        (ITEM_IMAGES[key] ? renderGalleryHTML(key) : '')+
        '<div class="game-ground"></div>'+
      '</div>';
  }
  modalOverlay.classList.add('open');
}

// Expose the existing item renderer to the index click handler.
// This does NOT create a second renderer; it uses openItemModal() above.
window.__openExistingItemModal = openItemModal;
window.__existingItemDetails = ITEM_DETAILS;
window.__existingSkillDetails = SKILL_DETAILS;

const BOSS_FIELD = {"Land Devourer":["Narrow Space","Cliff"]};
function bossFieldHtml(name){
  const f = BOSS_FIELD[name]; if(!f) return '';
  return '<div class="detail-line ability-line" style="cursor:default">Field effects</div>' +
    f.map(t=>'<div class="detail-line ability-line" data-kind="term" data-term="'+esc(t)+'" style="cursor:pointer">'+esc(t)+(TERMS[t]?' \u2014 '+esc(TERMS[t].description):'')+'</div>').join('');
}
function openBossImages(name){
  modalContent.innerHTML = '<h3 id="modalTitle">'+esc(name)+'</h3>' + renderBossGallery(name) + bossFieldHtml(name);
  modalOverlay.classList.add('open');
}

function renderBossGallery(name){
  const imgs = BOSS_IMAGES[name] || [];
  return '<div class="modal-images">' + imgs.map(src=>'<img src="'+src+'" alt="'+esc(name)+'">').join('') + '</div>';
}

function coverageStats(){
  const names = new Set();
  [DATA, CONQUEST, CONQUEST2].forEach(arr=>arr.forEach(r=>r.slice(1).forEach(cellTxt=>{
    (cellTxt||'').split(',').forEach(n=>{ n = n.trim(); if(n && n!=='\u2014') names.add(n); });
  })));
  let done = 0;
  names.forEach(n=>{ if(ITEM_DETAILS[n] || SKILL_DETAILS[n] || ['weapon','armor','accessory'].some(sl=>ITEM_DETAILS[n+'::'+sl])) done++; });
  return { total: names.size, done: done, pct: names.size ? Math.round(done/names.size*100) : 0 };
}

function openAbout(){
  const c = coverageStats();
  const line = (label, text) => '<div class="detail-line ability-line" style="cursor:default">'+label+'</div><p class="about-text">'+text+'</p>';
  modalContent.innerHTML =
    '<div class="game-card">'+
      '<div class="game-card-header" style="cursor:default"><span class="game-title">About this Wiki</span><span class="game-category">Fan-Made</span></div>'+
      '<div class="game-lines">'+
        line('Unofficial', 'This is an unofficial, fan-made wiki. It is not affiliated with, endorsed by, or sponsored by the developers or publishers of Buriedbornes 2.')+
        line('Labor of Love', 'A free, non-commercial fan project made by one player out of love for the game: no ads, no payments, nothing for sale. The race, job and origin notes are player impressions, not official guidance, and may be wrong or change as the game does.')+
        line('Player-Compiled', 'Every entry was recreated by hand from in-game screenshots (game v1.6.2A). Reroll samples show one example roll, not fixed values, and some entries may be incomplete or out of date after game updates.')+
        line('Game Content', 'Game names, item art, icons, screenshots and descriptive text belong to their respective owners. This wiki does not own or license them, and their appearance here does not imply the owners\u2019 permission. This is a self-contained file that anyone can copy and re-share, so the compiler cannot recall, edit or remove copies that are already out there.')+
        '<div class="detail-line" style="color:#5fd97a;cursor:default">Documented +'+c.pct+'%</div>'+
        '<div class="detail-line" style="color:#5fd0ff;cursor:default">Item Cards '+c.done+' / '+c.total+'</div>'+
      '</div>'+
      '<p class="game-flavor">Compiled by one adventurer, one screenshot at a time. Spotted a mistake? Turn on \u270f\ufe0f Edit Text to fix it on your own device.</p>'+
      '<div class="game-ground"></div>'+
    '</div>';
  modalOverlay.classList.add('open');
}

function closeItemModal(){ modalOverlay.classList.remove('open'); }

function openSubDetail(itemName, kind, statName){
  const d = ITEM_DETAILS[itemName];
  if(!d) return;
  const abilityList = d.abilities || (d.ability ? [d.ability] : []);
  const block = kind === 'ability' ? (abilityList.find(a=>a.name===statName) || abilityList[0]) : (d.stats||[]).find(s=>s.name===statName);
  if(!block) return;
  subModalContent.innerHTML =
    '<div class="sub-header">'+
      (block.icon ? '<img class="game-icon" src="'+block.icon+'" alt="">' : '')+
      '<span class="game-title">'+esc(block.name)+'</span>'+
      '<span class="game-category">'+esc(block.category||'Status')+'</span>'+
    '</div>'+
    '<p class="sub-desc">'+richText(block.description||'')+'</p>';
  subModalOverlay.classList.add('open');
}

function openRerollModal(name){
  const d = ITEM_DETAILS[name];
  let randomHTML = '';
  if(d && d.randomStats && d.randomStats.length){
    randomHTML = d.randomStats.map(s=>
      '<div class="detail-line" style="color:'+s.color+'">'+esc(s.name)+(s.masked ? (' '+esc(s.masked)) : (s.value ? (' '+esc(s.value)) : ''))+'</div>'+
      (s.description ? '<p class="sub-desc">'+richText(s.description)+'</p>' : '')
    ).join('');
  }
  subModalContent.innerHTML = '<h3 id="modalTitle">'+esc(dispName(name))+' \u2014 Reroll samples</h3>' +
    renderGalleryHTML(name, 'No reroll samples uploaded yet.') +
    randomHTML;
  subModalOverlay.classList.add('open');
}

function closeSubModal(){ subModalOverlay.classList.remove('open'); }

document.getElementById('modalClose').addEventListener('click', closeItemModal);
document.getElementById('subModalClose').addEventListener('click', closeSubModal);
document.getElementById('aboutBtn').addEventListener('click', openAbout);
document.getElementById('aboutLink').addEventListener('click', e=>{ e.preventDefault(); openAbout(); });
modalOverlay.addEventListener('click', e=>{ if(e.target === modalOverlay) closeItemModal(); });
subModalOverlay.addEventListener('click', e=>{ if(e.target === subModalOverlay) closeSubModal(); });

document.addEventListener('click', e=>{
  if(editMode) return;
  const trigger = e.target.closest('[data-kind]');
  if(trigger){
    const kind = trigger.dataset.kind;
    const name = trigger.dataset.name;
    if(kind === 'reroll'){ openRerollModal(name); return; }
    if(kind === 'skilltab'){ openSkillModal(name); return; }
    if(kind === 'noop'){ return; } /* no description yet: clickable but unresponsive */
    if(kind === 'slot'){ return; } /* empty slot: placeholder, nothing equipped yet */
    if(kind === 'boss'){ openBossImages(name); return; }
    if(kind === 'loot'){ openLoot(name); return; }
    if(kind === 'ability'){ openSubDetail(name, 'ability', trigger.dataset.stat); return; }
    if(kind === 'stat'){ openSubDetail(name, 'stat', trigger.dataset.stat); return; }
    if(kind === 'term'){ openTermDetail(trigger.dataset.term); return; }
    if(kind === 'dungeonstat'){ openDungeonStatDetail(trigger.dataset.stat, trigger.dataset.value); return; }
  }
  const el = e.target.closest('.item');
  if(el) openItemModal(el.dataset.item, el.dataset.slot);
});

/* ---- Click-to-edit mode (saved to this browser only) ---- */
const EDIT_PREFIX = 'dungeon-table-edit:';
let editMode = false;

function cellKey(tableId, rowIdx, colIdx){ return EDIT_PREFIX + tableId + ':' + rowIdx + ':' + colIdx; }

function updateRowSearch(tr){
  tr.dataset.search = [...tr.children].map(td => td.textContent).join(' ').toLowerCase();
}

function loadEdits(tableId, tb){
  [...tb.children].forEach((tr, domIdx) => {
    const rowIdx = tr.dataset.orig !== undefined ? tr.dataset.orig : domIdx;
    [...tr.children].forEach((td, colIdx) => {
      try{
        /* boss name cells that carry trait rows or a Loot link are always rebuilt from DUNGEON_STATUS / BOSS_LOOT, so an old saved copy can never override their layout */
        if(colIdx === 0 && (Object.keys(DUNGEON_STATUS).concat(Object.keys(BOSS_LOOT))).some(n => n.toLowerCase() === tr.dataset.boss)){
          localStorage.removeItem(cellKey(tableId, rowIdx, colIdx));
          return;
        }
        const saved = localStorage.getItem(cellKey(tableId, rowIdx, colIdx));
        const strippedText = saved !== null ? saved.replace(/<[^>]+>/g,'').trim() : '';
        if(saved !== null && strippedText !== '') td.innerHTML = saved;
        else if(saved !== null) localStorage.removeItem(cellKey(tableId, rowIdx, colIdx));
      }catch(err){}
    });
    updateRowSearch(tr);
  });
}

function saveCell(td){
  const table = td.closest('table');
  const tr = td.parentElement;
  const tb = tr.parentElement;
  const rowIdx = tr.dataset.orig !== undefined ? tr.dataset.orig : [...tb.children].indexOf(tr);
  const colIdx = [...tr.children].indexOf(td);
  try{ localStorage.setItem(cellKey(table.id, rowIdx, colIdx), td.innerHTML); }catch(err){}
  markRaw(td);
  updateRowSearch(tr);
}

document.addEventListener('input', e=>{
  if(editMode && e.target.tagName === 'TD' && e.target.isContentEditable) saveCell(e.target);
});

function setEditMode(on){
  editMode = on;
  document.body.classList.toggle('editing', on);
  [tbody, tbody2, tbody3, tbody4].forEach(tb=>{
    [...tb.children].forEach(tr=>{
      [...tr.children].forEach(td=>{ td.contentEditable = on; });
    });
  });
  const btn = document.getElementById('editToggle');
  btn.textContent = on ? '✅ Done Editing' : '✏️ Edit Text';
  btn.classList.toggle('active', on);
}

document.getElementById('editToggle').addEventListener('click', ()=> setEditMode(!editMode));

document.getElementById('resetEdits').addEventListener('click', ()=>{
  if(!confirm('Reset all your manual text edits back to the original data? This cannot be undone.')) return;
  try{
    Object.keys(localStorage).filter(k => k.startsWith(EDIT_PREFIX)).forEach(k => localStorage.removeItem(k));
  }catch(err){}
  fillTable(DATA, tbody);
  fillTable(CONQUEST, tbody2);
  fillTable(CONQUEST2, tbody3);
  fillTable(SPECIAL, tbody4);
  setEditMode(editMode);
  markRawAll();
  relayout();
});

function applyFit(){
  const on = document.body.classList.contains('fit');
  const wrap = document.querySelector('.wrap');
  const avail = wrap.clientWidth - 20;
  const z = on ? Math.min(1, avail / 700) : 1;
  document.querySelectorAll('.wrap table').forEach(t=>{
    t.style.zoom = on && z < 1 ? z : '';
    t.style.width = on && z < 1 ? '700px' : '';
  });
}
document.getElementById('fitToggle').addEventListener('click', ()=>{
  const on = document.body.classList.toggle('fit');
  document.getElementById('fitToggle').classList.toggle('active', on);
  document.getElementById('fitToggle').textContent = on ? '↔ Scroll view' : '↔ Fit width';
  relayout();
});
const HAS_SUBGRID = !!(window.CSS && CSS.supports && CSS.supports('grid-template-rows','subgrid'));
function markRaw(td){
  if(td.classList.contains('dungeon')) return;
  td.classList.toggle('raw', td.querySelectorAll(':scope > .tier').length === 0);
}
function markRawAll(){ document.querySelectorAll('tbody td').forEach(markRaw); }
function alignTiers(){
  if(HAS_SUBGRID){
    document.querySelectorAll('td > .tier.line6').forEach(t=>{ t.style.minHeight=''; });
    return;
  }
  document.querySelectorAll('tbody tr').forEach(tr=>{
    if(tr.classList.contains('hidden')) return;
    const t6 = [...tr.querySelectorAll('td > .tier.line6')];
    t6.forEach(t=>{ t.style.minHeight=''; });
    const h = Math.max(0, ...t6.map(t=>t.offsetHeight));
    t6.forEach(t=>{ t.style.minHeight = h + 'px'; });
  });
}
function relayout(){
  document.querySelectorAll('.wrap table').forEach(t=>{ t.style.zoom=''; t.style.width=''; });
  alignTiers();
  applyFit();
}
let relayoutTimer;
function relayoutSoon(){ clearTimeout(relayoutTimer); relayoutTimer = setTimeout(relayout, 250); }
window.addEventListener('resize', relayoutSoon);
window.addEventListener('orientationchange', ()=>setTimeout(relayout,250));
window.addEventListener('load', relayout);
if(document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
document.addEventListener('input', e=>{ const t=e.target; if(t && (t.id==='search' || t.isContentEditable)) relayoutSoon(); });

// One-time cleanup: drop stale saved edits for the Highway row (table row 0) so it rebuilds from the data
try{ if(!localStorage.getItem('dungeon-table-fix:highway-v1')){ for(let c=0;c<5;c++) localStorage.removeItem(EDIT_PREFIX+'tbl:0:'+c); localStorage.setItem('dungeon-table-fix:highway-v1','1'); } }catch(err){}
loadEdits('tbl', tbody);
loadEdits('tbl2', tbody2);
loadEdits('tbl3', tbody3);
loadEdits('tbl4', tbody4);
markRawAll();
relayout();
