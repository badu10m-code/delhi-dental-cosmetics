// store.js: cloud storage helpers + safe HTML escaping
var STORE_URL = 'https://extendsclass.com/api/json-storage/bin/ecbafad';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function binLoad(t){var x=new XMLHttpRequest();x.open('GET',STORE_URL+'?t='+Date.now(),false);x.send();try{return JSON.parse(x.responseText);}catch(e){return null;}}
function binSave(obj,cb){var x=new XMLHttpRequest();x.open('PUT',STORE_URL,true);x.setRequestHeader('Content-Type','text/plain');x.onload=function(){try{cb&&cb(JSON.parse(x.responseText));}catch(e){cb&&cb(null);}};x.onerror=function(){cb&&cb(null);};x.send(JSON.stringify(obj));}
function apptId(){return 'DDC-'+Math.random().toString(36).slice(2,8).toUpperCase();}
