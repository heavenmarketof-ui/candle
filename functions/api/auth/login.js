import {ensureAuthTables,createSession,sha256,response} from '../../_lib/auth.js';
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
const originOK=request=>request.headers.get('Origin')===new URL(request.url).origin;
const hex=s=>Array.from(s).map(b=>b.toString(16).padStart(2,'0')).join('');
async function derive(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:310000},key,256)))}
function safeEqual(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0}
export async function onRequestPost({request,env}){
 if(!originOK(request))return json({error:'Origem inválida'},403);
 if(!env.DB)return json({error:'Autenticação indisponível'},503);
 let data;try{data=await request.json()}catch{return json({error:'Requisição inválida'},400)}
 const username=String(data.username||'').trim().toLowerCase(),password=String(data.password||'');
 if(!username||!password)return json({error:'Informe usuário e senha'},400);
 try{
  await ensureAuthTables(env);
  const ip=await sha256(request.headers.get('CF-Connecting-IP')||'unknown'),now=Math.floor(Date.now()/1000);
  await env.DB.prepare('DELETE FROM admin_login_attempts WHERE attempted_at<?').bind(now-86400).run();
  const recent=await env.DB.prepare('SELECT COUNT(*) AS total FROM admin_login_attempts WHERE ip_hash=? AND success=0 AND attempted_at>?').bind(ip,now-3600).first();
  if((recent?.total||0)>=8)return json({error:'Muitas tentativas. Aguarde antes de tentar novamente.'},429,{'Retry-After':'3600'});
  const account=await env.DB.prepare('SELECT username,email,salt,password_hash FROM admin_credentials WHERE id=1').first();
  let ok=false;
  if(account&&safeEqual(account.username.toLowerCase(),username)){
   const salt=Uint8Array.from(account.salt.match(/.{2}/g)||[],h=>parseInt(h,16));
   ok=safeEqual(await derive(password,salt),account.password_hash);
  }else if(account){await derive(password,new Uint8Array(16))}
  await env.DB.prepare('INSERT INTO admin_login_attempts(ip_hash,attempted_at,success) VALUES(?,?,?)').bind(ip,now,ok?1:0).run();
  if(!ok)return json({error:'Usuário ou senha incorretos'},401);
  const session=await createSession(env,account);
  return json({ok:true},200,{'Set-Cookie':session.cookie});
 }catch(e){console.error('Admin login failed',e);return json({error:'Não foi possível iniciar a sessão'},500)}
}
