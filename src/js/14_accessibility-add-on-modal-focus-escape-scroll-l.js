
/* ===== Accessibility add-on: modal focus, Escape, scroll lock; plain-text paste in edit mode ===== */
(function(){
'use strict';
var overlays=[document.getElementById('itemModal'),document.getElementById('subModal')].filter(Boolean);
var openers=new Map();
function isOpen(o){return o.classList.contains('open');}
function topOpen(){var sub=document.getElementById('subModal'),item=document.getElementById('itemModal');
  return (sub&&isOpen(sub))?sub:(item&&isOpen(item))?item:null;}
function syncLock(){document.body.style.overflow=topOpen()?'hidden':'';}
overlays.forEach(function(o){
  var wasOpen=false;
  new MutationObserver(function(){
    var now=isOpen(o);
    if(now===wasOpen)return;
    wasOpen=now;
    if(now){
      if(!openers.has(o))openers.set(o,document.activeElement);
      var b=o.querySelector('.modal-close');if(b){try{b.focus({preventScroll:true});}catch(e){b.focus();}}
    }else{
      var prev=openers.get(o);openers.delete(o);
      if(prev&&prev!==document.body&&document.contains(prev)&&!topOpen()){try{prev.focus({preventScroll:true});}catch(e){}}
    }
    syncLock();
  }).observe(o,{attributes:true,attributeFilter:['class']});
});
document.addEventListener('keydown',function(e){
  var o=topOpen();if(!o)return;
  if(e.key==='Escape'){
    var b=o.querySelector('.modal-close');if(b){e.preventDefault();b.click();}
    return;
  }
  if(e.key==='Tab'){
    var f=[].slice.call(o.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(function(x){return x.offsetParent!==null;});
    if(!f.length)return;
    var first=f[0],last=f[f.length-1],a=document.activeElement;
    if(!o.contains(a)){e.preventDefault();first.focus();}
    else if(e.shiftKey&&a===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&a===last){e.preventDefault();first.focus();}
  }
});
document.addEventListener('paste',function(e){
  var t=e.target;
  if(!t||!t.isContentEditable||!e.clipboardData)return;
  e.preventDefault();
  var txt=e.clipboardData.getData('text/plain');
  document.execCommand('insertText',false,txt);
});
})();
