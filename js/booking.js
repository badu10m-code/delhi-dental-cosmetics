// booking.js: validated appointment requests to the clinic's cloud store
document.addEventListener('DOMContentLoaded',function(){
  var f=document.getElementById('bookform');if(!f)return;
  var msg=document.getElementById('f-msg'),send=document.getElementById('f-send'),last=0;
  var dt=document.getElementById('f-date');dt.min=new Date().toISOString().slice(0,10);
  f.addEventListener('submit',function(e){e.preventDefault();msg.className='fmsg';
    if(f.querySelector('#f-hp').value){msg.textContent='Something went wrong, please retry.';msg.classList.add('bad');return;}
    var name=f.querySelector('#f-name').value.trim(),ph=f.querySelector('#f-phone').value.replace(/[^0-9+ ]/g,'').trim();
    if(name.length<3||ph.replace(/[^0-9]/g,'').length<10){msg.textContent='Please give your name and a 10-digit phone number.';msg.classList.add('bad');return;}
    var now=Date.now();if(now-last<30000){msg.textContent='Request already sent. Please wait a moment.';msg.classList.add('bad');return;}last=now;
    send.disabled=true;send.textContent='Sending...';
    var d=binLoad()||{};d.appointments=d.appointments||[];
    var a={id:apptId(),name:name,phone:ph,service:f.querySelector('#f-service').value,date:f.querySelector('#f-date').value,time:f.querySelector('#f-time').value,note:f.querySelector('#f-note').value.slice(0,400),created:new Date().toISOString(),status:'new'};
    d.appointments.push(a);
    binSave(d,function(ok){
      send.disabled=false;send.textContent='Request Appointment';
      if(ok){msg.textContent='Request received. Reference '+a.id+'. The clinic will confirm your slot shortly.';msg.classList.add('ok');f.reset();}
      else{msg.textContent='Could not reach the clinic server right now. Please call '+ '+91 95605 53331'+' instead.';msg.classList.add('bad');}
    });
  });
});
