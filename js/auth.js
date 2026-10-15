// auth.js: passcode gate. Change the passcode by replacing this hash (see README).
// Default passcode for handover: set below in README. Hash is SHA-256 of the passcode.
var AUTH_HASH='9bbca531dd40de934c9ae9b1cae9973005bc10d88cb7f5672e139d62a81c9c88';
var LOCK_KEY='ddc_lock',SES_KEY='ddc_ses';
function sha(h){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(h));}
function hex(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return('0'+x.toString(16)).slice(-2);}).join('');}
function locked(){var l=+localStorage.getItem(LOCK_KEY)||0;return l>Date.now();}
function tryLogin(code,cb){if(locked()){cb('locked',Math.ceil((+localStorage.getItem(LOCK_KEY)-Date.now())/60000));return;}
  sha(code).then(function(b){if(hex(b)===AUTH_HASH){sessionStorage.setItem(SES_KEY,Date.now());localStorage.removeItem(LOCK_KEY);localStorage.removeItem('ddc_tries');cb('ok');}
    else{var t=(+localStorage.getItem('ddc_tries')||0)+1;localStorage.setItem('ddc_tries',t);
      if(t>=5){localStorage.setItem(LOCK_KEY,Date.now()+10*60000);localStorage.removeItem('ddc_tries');cb('locked',10);}else cb('bad',5-t);}});
}
function checkSession(){var s=+sessionStorage.getItem(SES_KEY)||0;if(!s||Date.now()-s>20*60000){sessionStorage.removeItem(SES_KEY);return false;}sessionStorage.setItem(SES_KEY,Date.now());return true;}
function logout(){sessionStorage.removeItem(SES_KEY);location.reload();}
