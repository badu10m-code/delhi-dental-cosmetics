// main.js: nav, reveal, counters, typewriter, year
document.addEventListener('DOMContentLoaded',function(){
  var b=document.querySelector('.burger'),l=document.querySelector('.links');
  if(b&&l)b.addEventListener('click',function(){l.classList.toggle('open');});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.15});
  document.querySelectorAll('section,figure.row,blockquote').forEach(function(el){el.classList.add('reveal');io.observe(el);});
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;cio.unobserve(e.target);
    var el=e.target,n=parseFloat(el.dataset.n),d=parseInt(el.dataset.d||'0'),s=performance.now();
    function step(t){var p=Math.min((t-s)/1400,1);var v=n*(.5-.5*Math.cos(Math.PI*p));el.textContent=d?v.toFixed(d):Math.round(v);if(p<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);});},{threshold:.4});
  document.querySelectorAll('.cnt').forEach(function(el){cio.observe(el);});
  var tw=document.getElementById('tw');
  if(tw){var words=JSON.parse(tw.dataset.words),wi=0,ci=0,del=false;
    (function tick(){var w=words[wi];tw.textContent=w.slice(0,ci);
      if(!del&&ci<w.length){ci++;setTimeout(tick,70);}
      else if(!del){del=true;setTimeout(tick,1900);}
      else if(ci>0){ci--;setTimeout(tick,35);}
      else{del=false;wi=(wi+1)%words.length;setTimeout(tick,250);}})();}
  var y=document.querySelector('.yr');if(y)y.textContent=new Date().getFullYear();
});
