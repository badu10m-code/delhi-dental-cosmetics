// blog.js: append clinic posts saved from the admin panel
document.addEventListener('DOMContentLoaded',function(){
  var box=document.getElementById('dyn-posts');if(!box)return;
  var d;try{d=binLoad();}catch(e){d=null;}
  var posts=(d&&d.posts)||[];
  if(!posts.length)return;
  box.innerHTML='';
  posts.slice().reverse().forEach(function(p){
    var el=document.createElement('article');el.className='art dynpost';
    el.innerHTML='<h2>'+esc(p.title)+'</h2><p class="ameta">'+esc(p.date||'')+' &middot; from the clinic desk</p>'+String(p.body||'').split(/\n\n+/).map(function(par){return '<p>'+esc(par)+'</p>';}).join('');
    box.appendChild(el);
  });
});
