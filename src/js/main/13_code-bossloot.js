
function bossLoot(name){
  return BOSS_LOOT[name] ? '<div class="boss-loot" data-kind="loot" data-name="'+esc(name)+'">Loot</div>' : '';
}

function bossName(name){
  const n = BOSS_IMAGES[name] ? '<span class="boss-link" data-kind="boss" data-name="'+esc(name)+'">'+name+'</span>' : name;
  const cfg = DUNGEON_STATUS[name];
  if(!cfg) return n;
  return '<div class="dz-head"><span class="dz-title">'+n+'</span>'+'</div>';
}

function dungeonStatus(name){
  const cfg = DUNGEON_STATUS[name];
  if(!cfg) return '';
  let terms, stats;
  try{ terms = TERMS; stats = STATS; }catch(e){ return ''; } /* TERMS/STATS are defined further down; filled in once they exist */
  return '<div class="dungeon-status-list">'+cfg.status.map(t=>{
    if(t && typeof t === 'object' && t.term){ /* {term, value, color}: a status term shown with a value, e.g. Insanity +20% */
      const TT = terms[t.term] || {};
      return '<div class="dungeon-status dungeon-status-stat" style="--tc:'+(t.color || '#d13b3a')+'" data-kind="'+(TT.description ? 'term" data-term="'+esc(t.term) : 'noop')+'">'+
        (TT.icon ? '<img class="dungeon-status-icon" src="'+TT.icon+'" alt="">' : '')+
        '<span class="dungeon-status-body"><span class="dungeon-status-name">'+esc(t.term)+'</span>'+
        (t.value ? '<span class="dungeon-status-val">'+esc(t.value)+'</span>' : '')+'</span></div>';
    }
    if(t && typeof t === 'object'){ /* {stat, value}: an existing equipment stat shown with a value, e.g. Number of Encounters +50% */
      const def = stats[t.stat] || {};
      return '<div class="dungeon-status dungeon-status-stat" style="--tc:'+(def.color || '#5fd97a')+'" data-kind="dungeonstat" data-stat="'+esc(t.stat)+'" data-value="'+esc(t.value || '')+'">'+
        (def.icon ? '<img class="dungeon-status-icon" src="'+def.icon+'" alt="">' : '')+
        '<span class="dungeon-status-body"><span class="dungeon-status-name">'+esc(t.stat)+'</span>'+
        (t.value ? '<span class="dungeon-status-val">'+esc(t.value)+'</span>' : '')+'</span></div>';
    }
    const T = terms[t] || {};
    const ic = T.icon || DUNGEON_STATUS_ICONS[t] || '';
    return '<div class="dungeon-status" data-kind="'+(T.description ? 'term" data-term="'+esc(t) : 'noop')+'">'+
      (ic ? '<img class="dungeon-status-icon" src="'+ic+'" alt="">' : '')+
      '<span class="dungeon-status-name">'+esc(t)+'</span></div>';
  }).join('')+'</div>';
}

function fillTable(data, tb){
  tb.innerHTML = '';
  data.map((row,orig)=>({row,orig}))
    .sort((a,b)=>a.row[0].localeCompare(b.row[0],'en',{sensitivity:'base',ignorePunctuation:true}))
    .forEach(({row,orig})=>{
    const [name,w6,w7,a6,a7,ac6,ac7,s6,s7] = row;
    const tr = document.createElement('tr');
    tr.dataset.orig = orig;
    tr.dataset.search = row.join(' ').toLowerCase();
    tr.dataset.boss = String(name).trim().toLowerCase();
    tr.innerHTML = `<td class="dungeon">${bossName(name)}${dungeonStatus(name)}${bossLoot(name)}</td><td>${cell(w6,w7,'weapon')}</td><td>${cell(a6,a7,'armor')}</td><td>${cell(ac6,ac7,'accessory')}</td><td>${cell(s6,s7,'skill')}</td>`;
    tb.appendChild(tr);
  });
}

const tbody2 = document.getElementById('tbody2');
const emptyMsg2 = document.getElementById('empty2');
const tbody3 = document.getElementById('tbody3');
const emptyMsg3 = document.getElementById('empty3');
const tbody4 = document.getElementById('tbody4');
const emptyMsg4 = document.getElementById('empty4');

fillTable(DATA, tbody);
fillTable(CONQUEST, tbody2);
fillTable(CONQUEST2, tbody3);
fillTable(SPECIAL, tbody4);
countEl.textContent = DATA.length + ' dungeons · ' + CONQUEST.length + ' disasters · ' + CONQUEST2.length + ' conquests · ' + SPECIAL.length + ' special dungeons';

function filterTable(tb, emptyEl, q, exact){
  let shown = 0;
  [...tb.children].forEach(tr=>{
    const match = !q || (exact ? tr.dataset.boss === q : tr.dataset.search.includes(q));
    tr.classList.toggle('hidden', !match);
    if(match) shown++;
  });
  emptyEl.style.display = shown === 0 ? 'block' : 'none';
  return shown;
}

document.getElementById('search').addEventListener('input', e=>{
  const q = e.target.value.trim().toLowerCase();
  const exact = !!window.__bossExactOnce; window.__bossExactOnce = false;
  const shown1 = filterTable(tbody, emptyMsg, q, exact);
  const shown2 = filterTable(tbody2, emptyMsg2, q, exact);
  const shown3 = filterTable(tbody3, emptyMsg3, q, exact);
  const shown4 = filterTable(tbody4, emptyMsg4, q, exact);
  relayoutSoon();
  countEl.textContent = shown1 + ' / ' + DATA.length + ' dungeons · ' + shown2 + ' / ' + CONQUEST.length + ' disasters · ' + shown3 + ' / ' + CONQUEST2.length + ' conquests · ' + shown4 + ' / ' + SPECIAL.length + ' special dungeons';
});

/* ---- Item image lookup ----
   Orchestra of Solde uses the supplied white-border screenshot as its reroll sample.

   Add entries as: "Exact Item Name": ["data:image/png;base64,....", "data:image/png;base64,...."]
   One or more images per item are supported. Names must match the table text exactly. */
