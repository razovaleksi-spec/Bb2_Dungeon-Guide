
/* Hide / show the 3 search bars (v99): one small chevron button at the start of the toolbar.
   It only hides or shows them; no search text is cleared and no search is changed. */
(function(){
if(window.__sbt99)return;window.__sbt99=1;
var hdr=document.querySelector('header'),tb=hdr&&hdr.querySelector('.toolbar');
if(!hdr||!tb)return;
var st=document.createElement('style');
st.textContent='header.sb-off #search,header.sb-off #advSearch,header.sb-off #skSearch,header.sb-off #advPanel,header.sb-off #skPanel{display:none !important}'
+'.toolbar button.sb-toggle{display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--accent);background:#0d0f14}'
+'.sb-toggle svg{width:14px;height:14px;transform:rotate(180deg);transition:transform .15s}'
+'header.sb-off .sb-toggle svg{transform:none}'
+'.sb-toggle[data-has="1"] span::after{content:" \\2022"}';
document.head.appendChild(st);
var btn=document.createElement('button');
btn.id='sbToggle';btn.type='button';btn.className='sb-toggle';
btn.innerHTML='<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 5l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Search</span>';
function has(){return ['search','advSearch','skSearch'].some(function(id){var e=document.getElementById(id);return !!(e&&e.value&&e.value.trim());});}
function mark(){btn.setAttribute('data-has',has()?'1':'0');}
function set(off){
 hdr.classList.toggle('sb-off',off);
 btn.setAttribute('aria-expanded',off?'false':'true');
 btn.title=off?'Show the 3 search bars':'Hide the 3 search bars';
 btn.setAttribute('aria-label',btn.title);
 if(off){
  ['advPanel','skPanel'].forEach(function(id){var p=document.getElementById(id);if(p)p.classList.remove('open');});
  var a=document.activeElement;if(a&&a.tagName==='INPUT'&&hdr.contains(a))a.blur();
 }
 mark();
}
btn.addEventListener('click',function(){set(!hdr.classList.contains('sb-off'));});
hdr.addEventListener('input',mark,true);
tb.insertBefore(btn,tb.firstChild);
set(false);
})();
