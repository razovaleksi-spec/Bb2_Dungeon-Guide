
document.addEventListener('click',function(e){var a=e.target.closest('.idx-link');if(!a)return;e.preventDefault();
var q=a.dataset.q;
var s=document.getElementById('search');s.value=q;
if(a.closest('.idx-places')||a.classList.contains('qa-boss'))window.__bossExactOnce=true;
s.dispatchEvent(new Event('input',{bubbles:true}));
window.scrollTo({top:0,behavior:'smooth'});
// Use the exact same item/skill renderers as the main loot tables.
var li=a.closest('li'),meta=li&&li.querySelector('.idx-meta'),sm=meta&&/\u2605 (weapon|armor|accessory|skill)/.exec(meta.textContent),slot=sm?sm[1]:'';
if(window.__existingItemDetails?.[q] || window.__existingItemDetails?.[q+'::'+slot] || window.__existingSkillDetails?.[q]){
  window.__openExistingItemModal(q,slot);
}
});
