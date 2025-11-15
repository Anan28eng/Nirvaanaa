const http = require('http');
function get(url){return new Promise((res,rej)=>{http.get(url, r=>{let b='';r.on('data',c=>b+=c);r.on('end',()=>res({status:r.statusCode,body:b}));}).on('error',rej);});}
(async()=>{try{const ad=await get('http://localhost:3000/api/announcements/adbanner');console.log('AD',ad.status,ad.body);const ann=await get('http://localhost:3000/api/announcements/announcement');console.log('ANN',ann.status,ann.body);}catch(e){console.error('ERR',e.message);process.exit(2);} })();
