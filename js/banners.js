// banners.js: offer banner strip driven by cloud config
(function(){
  var d=binLoad();
  var banners=(d&&d.banners)||[];
  if(!banners.length)return;
  var b=banners.filter(function(x){return x.active;})[0];if(!b)return;
  var el=document.createElement('section');el.className='banner';
  el.innerHTML='<p class="bk">'+esc(b.badge||'Special offer')+'</p><h2>'+esc(b.heading)+'</h2><p>'+esc(b.text)+'</p><a class="btn" href="contact.html#book">'+esc(b.cta||'Book an appointment')+'</a>';
  var strip=document.querySelector('.strip')||document.querySelector('.pagehead');
  if(strip)strip.after(el);
})();
