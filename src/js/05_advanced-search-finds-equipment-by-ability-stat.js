
/* ---- Advanced search: finds equipment by ability / stat name ----
   Uses ITEM_DETAILS (same data as the tooltips). Tapping a row opens the normal item tooltip via openItemModal(). */
(function(){
  const inp = document.getElementById('advSearch');
  const panel = document.getElementById('advPanel');
  const hdr = document.querySelector('header');
  if(!inp || !panel) return;

  const META = {};
  function addRows(rows){
    (rows||[]).forEach(r=>{
      [[1,2,'weapon'],[3,4,'armor'],[5,6,'accessory']].forEach(([a,b,slot])=>{
        [[r[a],6],[r[b],7]].forEach(([txt,st])=>{
          (txt||'').split(',').map(x=>x.trim()).filter(x=>x && x!=='\u2014').forEach(n=>{ if(!META[n]) META[n]={slot:slot,stars:st}; });
        });
      });
    });
  }
  addRows(DATA); addRows(CONQUEST); addRows(CONQUEST2); addRows(SPECIAL);

  const norm = s => (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const h = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  function statText(s){
    if(s.masked) return s.name+' '+s.masked;
    if(s.value) return s.name+' '+String(s.value).replace(/\d+/g,'??');
    return s.name;
  }

  const ENTRIES = Object.keys(ITEM_DETAILS).map(key=>{
    const d = ITEM_DETAILS[key], name = dispName(key), m = META[name] || {};
    const lines = [];
    (d.abilities || (d.ability ? [d.ability] : [])).forEach(a=>lines.push({n:a.name, c:a.color||'#ffa63d', t:a.name}));
    (d.stats||[]).forEach(s=>lines.push({n:s.name, c:s.color||'#5fd0ff', t:statText(s)}));
    lines.forEach(l=>{ l.nN = norm(l.n); });
    return {key:key, name:name, nameN:norm(name), icon:d.icon, stars:d.stars||m.stars||0, slot:m.slot||'', lines:lines};
  });

  function matchAll(e, terms){ return terms.every(t=> e.nameN.includes(t) || e.lines.some(l=>l.nN.includes(t))); }
  const starColor = n => n>=7 ? '#f83030' : n===6 ? '#f89800' : '#ffffff';

  let state = {res:[], terms:[], shown:0};
  const PAGE = 30;

  function size(){
    const vv = window.visualViewport, H = vv ? vv.height : window.innerHeight;
    panel.style.maxHeight = Math.max(160, H - hdr.getBoundingClientRect().bottom - 16) + 'px';
  }
  function close(){ panel.classList.remove('open'); }

  function rowHTML(e){
    const col = starColor(e.stars);
    const stars = e.stars ? '<div class="adv-stars" style="color:'+col+'">'+'\u2605'.repeat(e.stars)+'</div>' : '';
    const lines = e.lines.map(l=>{
      const hit = state.terms.some(t=>l.nN.includes(t));
      return '<span class="adv-l'+(hit?' hit':'')+'" style="color:'+h(l.c)+'">'+h(l.t)+'</span>';
    }).join(', ');
    return '<div class="adv-row" data-key="'+h(e.key)+'" data-name="'+h(e.name)+'" data-slot="'+h(e.slot)+'">'+
      '<img class="adv-ico" src="'+e.icon+'" alt="">'+
      '<div class="adv-main">'+stars+'<div class="adv-name" style="color:'+col+'">'+h(e.name)+'</div><div class="adv-stats">'+lines+'</div></div>'+
      '<button type="button" class="adv-q" aria-label="Open '+h(e.name)+'">?</button></div>';
  }

  function paint(){
    const part = state.res.slice(0, state.shown).map(rowHTML).join('');
    const more = state.shown < state.res.length
      ? '<button type="button" class="adv-more">Show more ('+(state.res.length-state.shown)+' left)</button>' : '';
    panel.querySelector('.adv-list').innerHTML = part + more;
  }

  function render(){
    const raw = norm(inp.value).trim();
    if(!raw){ close(); return; }
    let terms = raw.split(/[,+;]/).map(x=>x.trim()).filter(Boolean);
    let res = ENTRIES.filter(e=>matchAll(e, terms));
    if(!res.length && terms.length===1 && /\s/.test(terms[0])){
      const words = terms[0].split(/\s+/);
      const alt = ENTRIES.filter(e=>matchAll(e, words));
      if(alt.length){ res = alt; terms = words; }
    }
    res.sort((a,b)=> (b.stars-a.stars) || a.name.localeCompare(b.name,'en',{sensitivity:'base'}));
    state = {res:res, terms:terms, shown:Math.min(PAGE,res.length)};
    panel.innerHTML = '<div class="adv-top"><span>'+(res.length ? res.length+' equipment found' : '')+'</span><button type="button" class="adv-close">Close</button></div>'+
      (res.length ? '<div class="adv-list"></div>' : '<div class="adv-empty">No equipment has that stat or ability.</div><div class="adv-list"></div>');
    if(res.length) paint();
    panel.classList.add('open'); size();
  }

  inp.addEventListener('input', render);
  inp.addEventListener('focus', ()=>{ if(inp.value.trim()) render(); });
  inp.addEventListener('keydown', e=>{ if(e.key==='Escape'){ close(); inp.blur(); } });
  window.addEventListener('resize', ()=>{ if(panel.classList.contains('open')) size(); });
  if(window.visualViewport) window.visualViewport.addEventListener('resize', ()=>{ if(panel.classList.contains('open')) size(); });

  panel.addEventListener('click', e=>{
    if(e.target.closest('.adv-close')){ close(); return; }
    if(e.target.closest('.adv-more')){ state.shown = Math.min(state.res.length, state.shown+PAGE); paint(); return; }
    const row = e.target.closest('.adv-row');
    if(row){ inp.blur(); openItemModal(row.dataset.name, row.dataset.slot); }
  });
  document.addEventListener('click', e=>{
    if(!panel.classList.contains('open')) return;
    if(e.target.closest('#advPanel') || e.target.closest('#advSearch') || e.target.closest('.modal-overlay')) return;
    close();
  });
})();
