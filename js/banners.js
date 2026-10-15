// banners.js v2: offer banner strip driven by cloud config (async, robust placement)
binGet().then(function(d){
  var banners=(d&&d.banners)||[];
  if(!banners.length)return;
  var b=null;for(var i=0;i<banners.length;i++){if(banners[i].active){b=banners[i];break;}}
  if(!b)return;
  var el=document.createElement('section');el.className='banner';
  el.innerHTML='<p class="bk">'+esc(b.badge||'Special offer')+'</p><h2>'+esc(b.heading)+'</h2><p>'+esc(b.text)+'</p><a class="btn" href="contact.html#book">'+esc(b.cta||'Book an appointment')+'</a>';
  var slot=document.getElementById('banner-slot');
  if(slot){slot.appendChild(el);return;}
  var strip=document.querySelector('.strip')||document.querySelector('.pagehead')||document.querySelector('nav');
  if(strip)strip.after(el);else document.body.prepend(el);
}).catch(function(){});
