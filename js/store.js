// store.js v3: cloud storage with caching, safe merge saves, and local backup
var STORE_URL = 'https://extendsclass.com/api/json-storage/bin/ecbafad';
var _cache=null,_cacheAt=0,_inflight=null;
function esc(s){return String(s==null?'':s).replace(/[\u0026\u003c\u003e"']/g,function(c){return{'\u0026':'\u0026amp;','\u003c':'\u0026lt;','\u003e':'\u0026gt;','"':'\u0026quot;',"'":'\u0026#39;'}[c];});}
function apptId(){return 'DDC-'+Math.random().toString(36).slice(2,8).toUpperCase();}
function binGet(force){
  if(!force && _cache && Date.now()-_cacheAt<45000) return Promise.resolve(_cache);
  if(_inflight) return _inflight;
  _inflight=fetch(STORE_URL+'?t='+Date.now(),{cache:'no-store'})
    .then(function(r){return r.ok?r.json():null;})
    .then(function(d){_cache=d||null;_cacheAt=Date.now();_inflight=null;return _cache;})
    .catch(function(){_inflight=null;return null;});
  return _inflight;
}
function binPut(d){
  try{localStorage.setItem('ddc_backup',JSON.stringify(d));}catch(e){}
  return fetch(STORE_URL,{method:'PUT',headers:{'Content-Type':'text/plain'},body:JSON.stringify(d)})
    .then(function(r){return r.ok?r.json():null;})
    .catch(function(){return null;});
}
function blank(){return {appointments:[],banners:[],posts:[],settings:{}};}
function binMerge(mutator,cb,attempt){
  attempt=attempt||0;
  binGet(true).then(function(fresh){
    var d=fresh||blank();
    ['appointments','banners','posts'].forEach(function(k){if(!Array.isArray(d[k]))d[k]=[];});
    if(!d.settings||typeof d.settings!=='object'||Array.isArray(d.settings))d.settings={};
    var res=mutator(d);
    return binPut(d).then(function(ok){
      if(ok){_cache=d;_cacheAt=Date.now();cb&&cb(true,res);}
      else if(attempt<2){setTimeout(function(){binMerge(mutator,cb,attempt+1);},1500);}
      else cb&&cb(false,res);
    });
  });
}
