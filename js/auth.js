// auth.js v2: passcode gate. Local hash is the fallback; the cloud store can hold the current hash.
var AUTH_HASH='9bbca531dd40de934c9ae9b1cae9973005bc10d88cb7f5672e139d62a81c9c88';
var LOCK_KEY='ddc_lock',SES_KEY='ddc_ses',TRIES_KEY='ddc_tries';
function sha(h){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(h));}
function hex(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return('0'+x.toString(16)).slice(-2);}).join('');}
function locked(){var l=+localStorage.getItem(LOCK_KEY)||0;return l>Date.now();}
function activeHashes(){return binGet().then(function(d){var h=(d&&d.settings&&d.settings.admin_hash)||null;return h?[h,AUTH_HASH]:[AUTH_HASH];}).catch(function(){return [AUTH_HASH];});}
function tryLogin(code,cb){if(locked()){cb('locked',Math.ceil((+localStorage.getItem(LOCK_KEY)-Date.now())/60000));return;}
  activeHashes().then(function(hs){sha(code).then(function(b){var hx=hex(b);
    if(hs.indexOf(hx)>-1){sessionStorage.setItem(SES_KEY,Date.now());localStorage.removeItem(LOCK_KEY);localStorage.removeItem(TRIES_KEY);cb('ok');}
    else{var t=(+localStorage.getItem(TRIES_KEY)||0)+1;localStorage.setItem(TRIES_KEY,t);
      if(t>=5){localStorage.setItem(LOCK_KEY,Date.now()+10*60000);localStorage.removeItem(TRIES_KEY);cb('locked',10);}else cb('bad',5-t);}});});}
function checkSession(){var s=+sessionStorage.getItem(SES_KEY)||0;if(!s||Date.now()-s>20*60000){sessionStorage.removeItem(SES_KEY);return false;}sessionStorage.setItem(SES_KEY,Date.now());return true;}
function sessionLeft(){var s=+sessionStorage.getItem(SES_KEY)||0;return Math.max(0,Math.ceil((s+20*60000-Date.now())/60000));}
function logout(){sessionStorage.removeItem(SES_KEY);location.reload();}
