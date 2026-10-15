// admin.js: staff dashboard for appointments
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
  function load(){var d=binLoad()||{};d.appointments=d.appointments||[];render(d);}
  function render(d){var t=document.getElementById('rows');t.innerHTML='';
    var list=d.appointments.slice().reverse();
    if(!list.length){t.innerHTML='<tr><td colspan="6">No appointment requests yet.</td></tr>';return;}
    list.forEach(function(a){var tr=document.createElement('tr');
      tr.innerHTML='<td>'+esc(a.date)+'</td><td>'+esc(a.time)+'</td><td>'+esc(a.name)+'</td><td><a href="tel:'+esc(a.phone)+'">'+esc(a.phone)+'</a></td><td>'+esc(a.service)+'<br><small>'+esc(a.note||'')+'</small></td><td>'+esc(a.id)+'<br><button class="abtn gold" data-wa="'+esc(a.phone)+'" data-nm="'+esc(a.name)+'" data-dt="'+esc(a.date)+'" data-tm="'+esc(a.time)+'">WhatsApp</button><button class="abtn red" data-del="'+esc(a.id)+'">Delete</button></td>';
      t.appendChild(tr);});
    t.querySelectorAll('[data-wa]').forEach(function(b){b.onclick=function(){
      var msg=encodeURIComponent('Hello '+b.dataset.nm+', this is Delhi Dental Cosmetics confirming your appointment request for '+b.dataset.dt+', '+b.dataset.tm+'. See you at the clinic!');
      window.open('https://wa.me/91'+b.dataset.wa.replace(/[^0-9]/g,'').slice(-10)+'?text='+msg,'_blank');};});
    t.querySelectorAll('[data-del]').forEach(function(b){b.onclick=function(){
      if(!confirm('Delete this request?'))return;
      d.appointments=d.appointments.filter(function(x){return x.id!==b.dataset.del;});
      binSave(d,function(){load();});};});
  }
  document.getElementById('refresh').onclick=load;
  document.getElementById('csv').onclick=function(){var d=binLoad()||{};var rows=[['id','created','name','phone','service','date','time','note']];
    (d.appointments||[]).forEach(function(a){rows.push([a.id,a.created,a.name,a.phone,a.service,a.date,a.time,a.note]);});
    var csv=rows.map(function(r){return r.map(function(c){return '"'+String(c||'').replace(/"/g,'""')+'"';}).join(',');}).join('\n');
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='delhi-dental-cosmetics-appointments.csv';a.click();};
  document.getElementById('out').onclick=logout;
});
