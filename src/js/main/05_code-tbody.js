
const tbody = document.getElementById('tbody');
const emptyMsg = document.getElementById('empty');
const countEl = document.getElementById('count');

function esc(s){ return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

function nameList(text){
  return (text||'').split(',').map(x=>x.trim()).filter(x=>x && x!=='\u2014')
    .sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base',ignorePunctuation:true}));
}

function linkify(text,slot){
  const names = nameList(text);
  if(!names.length) return '<span class="tier-none">—</span>';
  return names.map(name=>`<span class="item" data-item="${esc(name)}" data-slot="${slot||''}">${esc(name)}</span>`).join('');
}

function tier(cls, star, text, slot){
  const n = nameList(text).length;
  return `<div class="tier ${cls} ${n>1?'multi':'single'}"><span class="tier-star">${star}</span>${linkify(text,slot)}</div>`;
}

function cell(list6, item7, slot){
  return tier('line6','6★',list6,slot) + tier('line7','7★',item7,slot);
}

