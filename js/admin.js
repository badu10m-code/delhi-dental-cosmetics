// admin.js: clinic dashboard - appointments, banners, posts, settings
document.addEventListener('DOMContentLoaded',function(){
  var gate=document.getElementById('gate'),panel=document.getElementById('panel');
  function unlockUI(){gate.style.display='none';panel.style.display='block';load();}
  if(checkSession())unlockUI();
  document.getElementById('login').addEventListener('submit',function(e){e.preventDefault();
    var code=document.getElementById('code').value,st=document.getElementById('st');
    tryLogin(code,function(r,n){code='';document.getElementById('code').value='';
      if(r==='ok')unlockUI();
      else if(r==='locked')st.textContent='Too many attempts. Locked for '+n+' minutes.';
      else st.textContent='Wrong passcode. '+(n!=null?n+' attempts left.':'');});
  });
  function load(){var d=binLoad()||{};d.appointments=d.appointments||[];d.banners=d.banners||[];d.posts=d.posts||[];d.settings=d.settings||{};render(d);}
  // tabs
  document.querySelectorAll('.atab').forEach(function(tb){tb.addEventListener('click',function(){
    document.querySelectorAll('.atab').forEach(function(x){x.classList.remove('on');});
    document.querySelectorAll('.asec').forEach(function(x){x.classList.remove('on');});
    tb.classList.add('on');document.getElementById('t-'+tb.dataset.tab).classList.add('on');});});
  function msg(id,txt,ok){var e=document.getElementById(id);e.textContent=txt;e.className='fmsg '+(ok?'ok':'bad');}

  /* ---- appointments ---- */
  function render(d){var t=document.getElementById('rows');t.innerHTML='';
    var list=d.appointments.slice().reverse();
    if(!list.length){t.innerHTML='<tr><td colspan="7">No appointment requests yet.</td></tr>';return;}
    list.forEach(function(a){var tr=document.createElement('tr');
      tr.innerHTML='<td>'+esc(a.date)+'</td><td>'+esc(a.time)+'</td><td>'+esc(a.name)+'</td><td><a href="tel:'+esc(a.phone)+'">'+esc(a.phone)+'</a></td><td>'+esc(a.service)+'<br><small>'+esc(a.note||'')+'</small></td><td><select class="statussel" data-id="'+esc(a.id)+'"><option'+(a.status==='new'?' selected':'')+'>new</option><option'+(a.status==='confirmed'?' selected':'')+'>confirmed</option><option'+(a.status==='done'?' selected':'')+'>done</option></select></td><td>'+esc(a.id)+'<br><button class="abtn gold" data-wa="'+esc(a.phone)+'" data-nm="'+esc(a.name)+'" data-dt="'+esc(a.date)+'" data-tm="'+esc(a.time)+'">WhatsApp</button><button class="abtn red" data-del="'+esc(a.id)+'">Delete</button></td>';
      t.appendChild(tr);});
    t.querySelectorAll('.statussel').forEach(function(sel){sel.addEventListener('change',function(){
      var a=d.appointments.find(function(x){return x.id===sel.dataset.id;});if(a){a.status=sel.value;binSave(d,function(o){if(!o)msg2('Save failed, retry.');});}});});
    t.querySelectorAll('[data-wa]').forEach(function(b2){b2.onclick=function(){
      var nm=b2.dataset.wa.replace(/[^0-9]/g,'').slice(-10);
      var msg2=encodeURIComponent('Hello '+b2.dataset.nm+', this is Delhi Dental Cosmetics confirming your appointment request for '+b2.dataset.dt+', '+b2.dataset.tm+'. See you at the clinic!');
      window.open('https://wa.me/91'+nm+'?text='+msg2,'_blank');};});
    t.querySelectorAll('[data-del]').forEach(function(b2){b2.onclick=function(){
      if(!confirm('Delete this request?'))return;
      d.appointments=d.appointments.filter(function(x){return x.id!==b2.dataset.del;});
      binSave(d,function(){load();});};});
  }
  document.getElementById('refresh').onclick=load;
  document.getElementById('csv').onclick=function(){var d=binLoad()||{};var rows=[['id','created','name','phone','service','date','time','status','note']];
    (d.appointments||[]).forEach(function(a){rows.push([a.id,a.created,a.name,a.phone,a.service,a.date,a.time,a.status||'new',a.note]);});
    var csv=rows.map(function(r){return r.map(function(c){return '"'+String(c||'').replace(/"/g,'""')+'"';}).join(',');}).join('\n');
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='delhi-dental-cosmetics-appointments.csv';a.click();};
  document.getElementById('out').onclick=logout;

  /* ---- banners ---- */
  function renderBanners(d){var box=document.getElementById('bn-list');box.innerHTML='';
    var list=d.banners||[];
    if(!list.length){box.innerHTML='<p class="fine">No banners saved yet.</p>';return;}
    list.slice().reverse().forEach(function(bn){var el=document.createElement('div');el.className='bitem';
      el.innerHTML='<div><b>'+esc(bn.heading)+'</b><br><small>'+esc(bn.badge||'')+' &middot; '+(bn.active?'<span style="color:#1E7A46">ACTIVE</span>':'inactive')+'</small></div><div><button class="abtn gold" data-on="'+esc(bn.id)+'">Activate</button><button class="abtn red" data-bdel="'+esc(bn.id)+'">Delete</button></div>';
      box.appendChild(el);});
    box.querySelectorAll('[data-on]').forEach(function(b2){b2.onclick=function(){
      d.banners.forEach(function(x){x.active=(x.id===b2.dataset.on);});binSave(d,function(o){o?load():msg('s-msg','Save failed.',false);});};});
    box.querySelectorAll('[data-bdel]').forEach(function(b2){b2.onclick=function(){
      if(!confirm('Delete this banner?'))return;
      d.banners=d.banners.filter(function(x){return x.id!==b2.dataset.bdel;});binSave(d,function(){load();});};});
  }
  document.getElementById('bn-save').onclick=function(){
    var d=binLoad()||{};d.banners=d.banners||[];
    var heading=document.getElementById('bn-head').value.trim();
    if(heading.length<4){msg('s-msg','Give the banner a heading.',false);return;}
    if(!confirm('Activate this banner site-wide now?'))return;
    d.banners.forEach(function(x){x.active=false;});
    d.banners.push({id:'B-'+Date.now().toString(36).toUpperCase(),badge:document.getElementById('bn-badge').value.trim(),heading:heading,text:document.getElementById('bn-text').value.trim(),cta:document.getElementById('bn-cta').value.trim()||'Book an appointment',active:true,created:new Date().toISOString()});
    if(d.banners.length>6)d.banners=d.banners.slice(-6);
    binSave(d,function(o){if(o){msg('s-msg','Banner saved and activated. Refresh the website to see it.',true);['bn-badge','bn-head','bn-text'].forEach(function(i){document.getElementById(i).value='';});load();}else msg('s-msg','Save failed, check connection.',false);});
  };

  /* ---- posts ---- */
  function renderPosts(d){var box=document.getElementById('p-list');box.innerHTML='';
    var list=d.posts||[];
    if(!list.length){box.innerHTML='<p class="fine">No posts yet.</p>';return;}
    list.slice().reverse().forEach(function(p){var el=document.createElement('div');el.className='bitem';
      el.innerHTML='<div><b>'+esc(p.title)+'</b><br><small>'+esc(p.date||'')+'</small></div><div><button class="abtn red" data-pdel="'+esc(p.id)+'">Delete</button></div>';
      box.appendChild(el);});
    box.querySelectorAll('[data-pdel]').forEach(function(b2){b2.onclick=function(){
      if(!confirm('Delete this post?'))return;
      d.posts=d.posts.filter(function(x){return x.id!==b2.dataset.pdel;});binSave(d,function(){load();});};});
  }
  document.getElementById('p-save').onclick=function(){
    var d=binLoad()||{};d.posts=d.posts||[];
    var title=document.getElementById('p-title').value.trim(),body=document.getElementById('p-body').value.trim();
    if(title.length<4||body.length<20){msg('s-msg','Give the post a title and a few lines of body.',false);return;}
    d.posts.push({id:'P-'+Date.now().toString(36).toUpperCase(),title:title,date:document.getElementById('p-date').value,body:body,created:new Date().toISOString()});
    binSave(d,function(o){if(o){msg('s-msg','Post published. It shows on the Blog page.',true);document.getElementById('p-title').value='';document.getElementById('p-body').value='';load();}else msg('s-msg','Save failed, check connection.',false);});
  };

  /* ---- settings ---- */
  document.getElementById('s-save').onclick=function(){
    var d=binLoad()||{};d.settings=d.settings||{};
    var ph=document.getElementById('s-phone').value.trim(),wa=document.getElementById('s-wal').value.trim(),hr=document.getElementById('s-hours').value.trim(),ad=document.getElementById('s-addr').value.trim();
    if(wa&&wa.replace(/[^0-9]/g,'').length<10){msg('s-msg','WhatsApp number looks wrong (10 digits needed).',false);return;}
    if(ph)d.settings.phone=ph;if(wa)d.settings.whatsapp=wa.replace(/[^0-9]/g,'');if(hr)d.settings.hours=hr;if(ad)d.settings.address=ad;
    binSave(d,function(o){msg('s-msg',o?'Settings saved. Website updates on next page load.':'Save failed, check connection.',!!o);});
  };
});
