const reply=(status,message)=>new Response(JSON.stringify({error:message}),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
function decode(s){const normalized=s.replace(/-/g,'+').replace(/_/g,'/');const bytes=atob(normalized.padEnd(Math.ceil(normalized.length/4)*4,'='));return Uint8Array.from(bytes,c=>c.charCodeAt(0))}
export async function authenticateAccess(request,env){const team=env.ACCESS_TEAM_DOMAIN, aud=env.ACCESS_AUD;if(!team||!aud)return {error:reply(503,'Autenticação administrativa não configurada')};const token=request.headers.get('Cf-Access-Jwt-Assertion');if(!token)return {error:reply(401,'Autenticação necessária')};try{const parts=token.split('.');if(parts.length!==3)throw Error('JWT inválido');const header=JSON.parse(new TextDecoder().decode(decode(parts[0])));const claims=JSON.parse(new TextDecoder().decode(decode(parts[1])));const issuer='https://'+team.replace(/^https?:\/\//,'').replace(/\/$/,'');if(header.alg!=='RS256'||!header.kid||claims.iss!==issuer||!(Array.isArray(claims.aud)?claims.aud.includes(aud):claims.aud===aud)||!claims.exp||claims.exp<=Date.now()/1000||!claims.email)throw Error('Credencial inválida');const response=await fetch(issuer+'/cdn-cgi/access/certs');if(!response.ok)throw Error('Certificados indisponíveis');const jwks=await response.json();const key=jwks.keys.find(k=>k.kid===header.kid&&k.kty==='RSA');if(!key)throw Error('Chave desconhecida');const cryptoKey=await crypto.subtle.importKey('jwk',key,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);const valid=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',cryptoKey,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));if(!valid)throw Error('Assinatura inválida');const email=String(claims.email).toLowerCase();const allowed=(env.ADMIN_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);if(!allowed.length)return {error:reply(503,'Lista de administradores não configurada')};if(!allowed.includes(email))return {error:reply(403,'Acesso não autorizado')};return {email}}catch{return {error:reply(401,'Sessão inválida ou expirada')}}}
export const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export const clean=(s,n=500)=>typeof s==='string'?s.trim().slice(0,n):'';

const SESSION_COOKIE='__Host-candle_admin_session';
const b64url=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
export async function ensureAuthTables(env){
 if(!env.DB)throw Error('Banco D1 não configurado');
 await env.DB.prepare('CREATE TABLE IF NOT EXISTS admin_credentials (id INTEGER PRIMARY KEY CHECK(id=1), username TEXT NOT NULL UNIQUE COLLATE NOCASE, email TEXT NOT NULL, salt TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)').run();
 await env.DB.prepare('CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, username TEXT NOT NULL, email TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)').run();
 await env.DB.prepare('CREATE TABLE IF NOT EXISTS admin_login_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, ip_hash TEXT NOT NULL, attempted_at INTEGER NOT NULL, success INTEGER NOT NULL DEFAULT 0)').run();
}
export async function sha256(value){
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
 return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function getSession(request,env){
 if(!env.DB)return null;
 const cookie=request.headers.get('Cookie')||'';
 const token=cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith(SESSION_COOKIE+'='))?.slice(SESSION_COOKIE.length+1);
 if(!token||token.length<40)return null;
 try{
  const tokenHash=await sha256(token);
  const row=await env.DB.prepare('SELECT username,email FROM admin_sessions WHERE token_hash=? AND expires_at>?').bind(tokenHash,Math.floor(Date.now()/1000)).first();
  return row||null;
 }catch{return null}
}
export async function createSession(env,identity){
 const bytes=crypto.getRandomValues(new Uint8Array(32)),token=b64url(bytes),expires=Math.floor(Date.now()/1000)+604800;
 await env.DB.prepare('INSERT INTO admin_sessions(token_hash,username,email,expires_at) VALUES(?,?,?,?)').bind(await sha256(token),identity.username,identity.email,expires).run();
 return {cookie:SESSION_COOKIE+'='+token+'; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax',expires};
}
export async function destroySession(request,env){
 const cookie=request.headers.get('Cookie')||'';
 const token=cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith(SESSION_COOKIE+'='))?.slice(SESSION_COOKIE.length+1);
 if(token&&env.DB)await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await sha256(token)).run();
 return SESSION_COOKIE+'=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax';
}
export async function authenticate(request,env){
 if(!env.DB)return {error:reply(503,'Banco D1 não configurado')};
 const session=await getSession(request,env);
 return session?session:{error:reply(401,'Sessão administrativa necessária')};
}
