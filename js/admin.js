// admin.js v3: clinic dashboard
(function(){
'use strict';
var DATA=null,FILTER={q:'',status:'all',sort:'new'};
function $(i){return document.getElementById(i);}
function toast(t,ok){var e=$('toast');e.textContent=t;e.className='toast show '+(ok?'ok':'bad');setTimeout(function(){e.className='toast';},3200);}
function fmsg(id,t,ok){var e=$(id);e.textContent=t;e.className='fmsg '+(ok?'ok':'bad');}
var gate=$('gate'),panel=$('panel');
function unlock(){gate.style.display='none';panel.style.display='block';load();}
if(checkSession())unlock();
$('login').addEventListener('submit',function(e){e.preventDefault();
  var code=$('code').value;
  tryLogin(code,function(r,n){$('code').value='';
    if(r==='ok'){unlock();toast('Welcome back.',true);}
    else if(r==='locked'){$('st').textContent='Too many attempts. Locked for '+n+' minute(s).';$('st').className='fmsg bad';}
    else{$('st').textContent='Wrong passcode. '+(n!=null?n+' attempts left.':'');$('st').className='fmsg bad';}});
});
document.querySelectorAll('.atab').forEach(function(tb){tb.addEventListener('click',function(){
  document.querySelectorAll('.atab').forEach(function(x){x.classList.remove('on');});
  document.querySelectorAll('.asec').forEach(function(x){x.classList.remove('on');});
  tb.classList.add('on');$('t-'+tb.dataset.tab).classList.add('on');});});
$('out').onclick=logout;
$('refresh').onclick=function(){load(true);};
setInterval(function(){if(panel.style.display==='none')return;
  if(!checkSession()){gate.style.display='block';panel.style.display='none';return;}
  $('sess').textContent='Session: about '+sessionLeft()+' min left';
  if(document.visibilityState==='visible')load(true);},60000);
function norm(d){d=d||{};['appointments','banners','posts'].forEach(function(k){if(!Array.isArray(d[k]))d[k]=[];});
  if(!d.settings||typeof d.settings!=='object'||Array.isArray(d.settings))d.settings={};return d;}
function load(silent){binGet(true).then(function(d){DATA=norm(d);renderAll();if(silent!==true)toast('Data refreshed.',true);}).catch(function(){if(!DATA)DATA=norm(null);renderAll();if(silent!==true)toast('Could not reach the cloud store. Showing local backup if any.',false);});}
function save(mut,done){binMerge(mut,function(ok,res){if(ok){load(true);done&&done(true,res);}else{toast('Save failed. The clinic cloud store did not respond. Try again.',false);done&&done(false,res);}});}
/* stats */
function renderAll(){renderStats();renderAppts();renderRecent();renderBanners();renderPosts();loadSettingsForm();}
function isToday(iso){return iso===new Date().toISOString().slice(0,10);}
function renderStats(){var a=(DATA&&DATA.appointments)||[];var t=new Date().toISOString().slice(0,10);
  var in7=new Date();in7.setDate(in7.getDate()+7);var wk=in7.toISOString().slice(0,10);
  var s=[['Total requests',a.length],['New',a.filter(function(x){return x.status==='new';}).length],
  ['Confirmed',a.filter(function(x){return x.status==='confirmed';}).length],
  ['Visits today',a.filter(function(x){return x.date===t;}).length],
  ['Next 7 days',a.filter(function(x){return x.date>t&&x.date<=wk;}).length]];
  $('stats').innerHTML=s.map(function(x){return '<div class="astat"><b>'+x[1]+'</b><span>'+esc(x[0])+'</span></div>';}).join('');}
/* appointments */
$('q').addEventListener('input',function(){FILTER.q=this.value.toLowerCase();renderAppts();});
$('fstatus').addEventListener('change',function(){FILTER.status=this.value;renderAppts();});
$('fsort').addEventListener('change',function(){FILTER.sort=this.value;renderAppts();});
function renderAppts(){var t=$('rows');var a=((DATA&&DATA.appointments)||[]).slice();
  if(FILTER.status!=='all')a=a.filter(function(x){return (x.status||'new')===FILTER.status;});
  if(FILTER.q)a=a.filter(function(x){return ((x.name||'')+' '+(x.phone||'')+' '+(x.id||'')).toLowerCase().indexOf(FILTER.q)>-1;});
  a.sort(function(x,y){var c=(x.created||'')<(y.created||'')?-1:1;return FILTER.sort==='new'?-c:c;});
  if(!a.length){t.innerHTML='<tr><td colspan="6" class="aempty">No appointment requests match. New requests from the website appear here automatically.</td></tr>';return;}
  t.innerHTML='';a.forEach(function(x){var tr=document.createElement('tr');
    tr.innerHTML='<td>'+esc(x.date)+'<br><small>'+esc(x.time)+'</small></td>'
    +'<td><b>'+esc(x.name)+'</b><br><a href="tel:'+esc(x.phone)+'">'+esc(x.phone)+'</a>'+(x.email?'<br><small>'+esc(x.email)+'</small>':'')+'</td>'
    +'<td>'+esc(x.service)+'<br><small>'+esc(x.doctor||'Any available dentist')+'</small></td>'
    +'<td><small>'+esc(x.note||'-')+'</small></td>'
    +'<td><select class="statussel" data-id="'+esc(x.id)+'">'
    +['new','confirmed','done','cancelled'].map(function(s){return '<option'+((x.status||'new')===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select></td>'
    +'<td><small>'+esc(x.id)+'</small><br><button class="abtn gold" data-wa="'+esc(x.phone)+'" data-nm="'+esc(x.name)+'" data-dt="'+esc(x.date)+'" data-tm="'+esc(x.time)+'">WhatsApp</button> <button class="abtn red" data-del="'+esc(x.id)+'">Delete</button></td>';
    tr.title='Requested: '+(x.created||'');t.appendChild(tr);});
  t.querySelectorAll('.statussel').forEach(function(sel){sel.addEventListener('change',function(){
    save(function(d){var a=d.appointments.find(function(x){return x.id===sel.dataset.id;});if(a)a.status=sel.value;},function(ok){if(ok)toast('Status updated.',true);});});});
  t.querySelectorAll('[data-wa]').forEach(function(b){b.onclick=function(){
    var nm=b.dataset.wa.replace(/[^0-9]/g,'').slice(-10);
    var m=encodeURIComponent('Hello '+b.dataset.nm+', this is Delhi Dental Cosmetics confirming your appointment request for '+b.dataset.dt+', '+b.dataset.tm+'. See you at the clinic!');
    window.open('https://wa.me/91'+nm+'?text='+m,'_blank');};});
  t.querySelectorAll('[data-del]').forEach(function(b){b.onclick=function(){
    if(!confirm('Delete this request? This cannot be undone.'))return;
    save(function(d){d.appointments=d.appointments.filter(function(x){return x.id!==b.dataset.del;});},function(ok){if(ok)toast('Request deleted.',true);});};});}
function renderRecent(){var a=((DATA&&DATA.appointments)||[]).slice().sort(function(x,y){return (x.created||'')<(y.created||'')?1:-1;}).slice(0,5);
  if(!a.length){$('recent').innerHTML='<p class="aempty">No requests yet. The moment a patient books on the website, it appears here.</p>';return;}
  $('recent').innerHTML='<div class="bitem"><div><b>'+a.map(function(x){return esc(x.name);}).join('</b><br><b>')+'</b></div></div>';
  var html='';a.forEach(function(x){html+='<div class="bitem"><div><b>'+esc(x.name)+'</b> &middot; '+esc(x.date)+' '+esc(x.time)+'<br><small>'+esc(x.service)+' &middot; '+(x.status||'new')+' &middot; '+esc(x.id)+'</small></div><span class="tag-on">'+esc((x.status||'new'))+'</span></div>';});
  $('recent').innerHTML=html;}
$('csv').onclick=function(){var a=(DATA&&DATA.appointments)||[];
  var rows=[['id','created','name','phone','email','service','doctor','date','time','status','note']];
  a.forEach(function(x){rows.push([x.id,x.created,x.name,x.phone,x.email,x.service,x.doctor,x.date,x.time,x.status||'new',x.note]);});
  var csv=rows.map(function(r){return r.map(function(c){return '"'+String(c==null?'':c).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  var el=document.createElement('a');el.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));el.download='delhi-dental-cosmetics-appointments.csv';el.click();};
/* banners */
function renderBanners(){var list=((DATA&&DATA.banners)||[]).slice().reverse();var box=$('bn-list');
  if(!list.length){box.innerHTML='<p class="aempty">No saved banners. Create one above and it appears at the top of every public page.</p>';return;}
  box.innerHTML='';list.forEach(function(b){var el=document.createElement('div');el.className='bitem';
    el.innerHTML='<div><b>'+esc(b.heading)+'</b><br><small>'+esc(b.badge||'')+' &middot; '+(b.active?'<span class="tag-on">ACTIVE</span>':'<span class="tag-off">inactive</span>')+'</small></div><div><button class="abtn gold" data-on="'+esc(b.id)+'">'+(b.active?'Deactivate':'Activate')+'</button> <button class="abtn red" data-bdel="'+esc(b.id)+'">Delete</button></div>';
    box.appendChild(el);});
  box.querySelectorAll('[data-on]').forEach(function(b){b.onclick=function(){
    save(function(d){d.banners.forEach(function(x){x.active=(x.id===b.dataset.on)?!x.active:false;});},function(ok){if(ok)toast('Banner updated. Public pages show it on next visit.',true);});};});
  box.querySelectorAll('[data-bdel]').forEach(function(b){b.onclick=function(){
    if(!confirm('Delete this banner?'))return;
    save(function(d){d.banners=d.banners.filter(function(x){return x.id!==b.dataset.bdel;});},function(ok){if(ok)toast('Banner deleted.',true);});};});}
['bn-badge','bn-head','bn-text'].forEach(function(id){$(id).addEventListener('input',pv);});
function pv(){$('pv-badge').textContent=$('bn-badge').value.trim()||'PREVIEW';
  $('pv-head').textContent=$('bn-head').value.trim()||'Your banner heading';
  $('pv-text').textContent=$('bn-text').value.trim()||'Banner text appears here as patients will see it.';}
$('bn-save').onclick=function(){
  var head=$('bn-head').value.trim();
  if(head.length<4){fmsg('s-msg','Give the banner a heading.',false);return;}
  save(function(d){d.banners.forEach(function(x){x.active=false;});
    d.banners.push({id:'B-'+Date.now().toString(36).toUpperCase(),badge:$('bn-badge').value.trim(),heading:head,text:$('bn-text').value.trim(),cta:$('bn-cta').value.trim()||'Book an appointment',active:true,created:new Date().toISOString()});
    if(d.banners.length>6)d.banners=d.banners.slice(-6);},
    function(ok){if(ok){fmsg('s-msg','Banner saved and activated. Public pages show it on next visit.',true);['bn-badge','bn-head','bn-text','bn-cta'].forEach(function(i){$(i).value='';});pv();}});};
/* posts */
function renderPosts(){var list=((DATA&&DATA.posts)||[]).slice().reverse();var box=$('p-list');
  if(!list.length){box.innerHTML='<p class="aempty">No posts yet.</p>';return;}
  box.innerHTML='';list.forEach(function(p){var el=document.createElement('div');el.className='bitem';
    el.innerHTML='<div><b>'+esc(p.title)+'</b><br><small>'+esc(p.date||'')+'</small></div><div><button class="abtn red" data-pdel="'+esc(p.id)+'">Delete</button></div>';
    box.appendChild(el);});
  box.querySelectorAll('[data-pdel]').forEach(function(b){b.onclick=function(){
    if(!confirm('Delete this post?'))return;
    save(function(d){d.posts=d.posts.filter(function(x){return x.id!==b.dataset.pdel;});},function(ok){if(ok)toast('Post deleted.',true);});};});}
$('p-save').onclick=function(){
  var title=$('p-title').value.trim(),body=$('p-body').value.trim();
  if(title.length<4||body.length<20){fmsg('p-msg','Give the post a title and a few lines of body.',false);return;}
  save(function(d){d.posts.push({id:'P-'+Date.now().toString(36).toUpperCase(),title:title,date:$('p-date').value,body:body,created:new Date().toISOString()});},
    function(ok){if(ok){fmsg('p-msg','Post published. It shows on the Blog page.',true);$('p-title').value='';$('p-body').value='';}});};
/* settings */
function loadSettingsForm(){['s-phone','s-wal','s-hours','s-addr'].forEach(function(i){$(i).value='';});}
$('s-save').onclick=function(){
  var ph=$('s-phone').value.trim(),wa=$('s-wal').value.trim(),hr=$('s-hours').value.trim(),ad=$('s-addr').value.trim();
  if(wa&&wa.replace(/[^0-9]/g,'').length<10){fmsg('s2-msg','WhatsApp number looks wrong (10 digits needed).',false);return;}
  save(function(d){if(ph)d.settings.phone=ph;if(wa)d.settings.whatsapp=wa.replace(/[^0-9]/g,'');if(hr)d.settings.hours=hr;if(ad)d.settings.address=ad;},
    function(ok){if(ok){fmsg('s2-msg','Settings saved. Public pages update on the next visit.',true);loadSettingsForm();}});};
/* security */
$('sec-save').onclick=function(){
  var cur=$('sec-cur').value,n1=$('sec-new').value,n2=$('sec-new2').value;
  if(!cur||!n1){fmsg('sec-msg','Fill in the current and the new passcode.',false);return;}
  if(n1.length<6){fmsg('sec-msg','New passcode needs at least 6 characters.',false);return;}
  if(n1!==n2){fmsg('sec-msg','The two new passcodes do not match.',false);return;}
  activeHashes().then(function(hs){
    sha(cur).then(function(b){
      if(hs.indexOf(hex(b))===-1){fmsg('sec-msg','Current passcode is wrong.',false);return;}
      sha(n1).then(function(b2){
        var h=hex(b2);
        save(function(d){d.settings.admin_hash=h;},function(ok){
          if(ok){
            fmsg('sec-msg','Passcode changed. Use the new one from now on. Note it down: it is not shown again.',true);
            ['sec-cur','sec-new','sec-new2'].forEach(function(i){$(i).value='';});
          }
        });
      });
    });
  });
};
load();
})();
