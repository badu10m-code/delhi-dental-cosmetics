// booking.js v3: validated appointment requests, Sunday guard, duplicate check
document.addEventListener('DOMContentLoaded',function(){
  var f=document.getElementById('bookform');if(!f)return;
  var msg=document.getElementById('f-msg'),send=document.getElementById('f-send'),last=0;
  var dt=document.getElementById('f-date');dt.min=new Date().toISOString().slice(0,10);
  var sel=document.getElementById('f-time');
  function setMsg(t,cls){msg.textContent=t;msg.className='fmsg'+(cls?' '+cls:'');}
  document.querySelectorAll('#quickslots button').forEach(function(ch){ch.addEventListener('click',function(){
    sel.value=ch.dataset.slot;document.querySelectorAll('#quickslots button').forEach(function(x){x.classList.remove('on');});ch.classList.add('on');});});
  dt.addEventListener('change',function(){
    if(dt.value){var day=new Date(dt.value+'T12:00:00+05:30').getDay();
      if(day===0)setMsg('The clinic is closed on Sundays. Please pick a Monday to Saturday date.','bad');
      else if(dt.value===dt.min)setMsg('Same-day requests: the clinic may already be full. A call is faster for today.','');}
  });
  f.addEventListener('submit',function(e){e.preventDefault();msg.className='fmsg';
    if(f.querySelector('#f-hp').value){setMsg('Something went wrong, please retry.','bad');return;}
    var name=f.querySelector('#f-name').value.trim();
    var ph=f.querySelector('#f-phone').value.replace(/[^0-9+ ]/g,'').trim();
    var em=f.querySelector('#f-email')?f.querySelector('#f-email').value.trim():'';
    var date=dt.value,svc=f.querySelector('#f-service').value,doc=f.querySelector('#f-doctor')?f.querySelector('#f-doctor').value:'Any available dentist';
    if(name.length<3){setMsg('Please give your name.','bad');return;}
    if(ph.replace(/[^0-9]/g,'').length<10){setMsg('Please give a 10-digit phone number.','bad');return;}
    if(em&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){setMsg('That email address does not look right. Leave it empty or correct it.','bad');return;}
    if(!date){setMsg('Please pick a preferred date.','bad');return;}
    if(new Date(date+'T12:00:00+05:30').getDay()===0){setMsg('The clinic is closed on Sundays. Please pick a Monday to Saturday date.','bad');return;}
    var now=Date.now();if(now-last<30000){setMsg('Request already sent. Please wait a moment.','bad');return;}last=now;
    send.disabled=true;send.textContent='Sending...';
    binGet(true).then(function(d){
      var dup=null;(d&&d.appointments||[]).forEach(function(x){
        if(x.phone&&x.phone.replace(/[^0-9]/g,'').slice(-10)===ph.replace(/[^0-9]/g,'').slice(-10)&&x.date===date&&x.status!=='cancelled')dup=x;});
      if(dup){send.disabled=false;send.textContent='Request Appointment';
        setMsg('You already have a request for this date (reference '+dup.id+'). The clinic will confirm it. To change it, please call the clinic.','bad');return null;}
      var a={id:apptId(),name:name,phone:ph,email:em,service:svc,doctor:doc,date:date,time:sel.value,note:(f.querySelector('#f-note').value||'').slice(0,400),created:new Date().toISOString(),status:'new'};
      return new Promise(function(res){binMerge(function(o){o.appointments.push(a);return a.id;},function(ok,id){res(ok?id:null);});});
    }).then(function(ref){
      send.disabled=false;send.textContent='Request Appointment';
      if(ref){f.reset();document.querySelectorAll('#quickslots button').forEach(function(x){x.classList.remove('on');});
        setMsg('Request received. Reference '+ref+'. Save this reference, the clinic will confirm your slot by call or WhatsApp during working hours.','ok');}
      else if(msg.className.indexOf('bad')===-1){setMsg('Could not reach the clinic server right now. Please call +91 95605 53331 instead.','bad');}
    });
  });
});
