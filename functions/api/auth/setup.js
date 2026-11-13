import {authenticateAccess,ensureAuthTables,createSession,clean} from '../../_lib/auth.js';
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
const originOK=request=>request.headers.get('Origin')===new URL(request.url).origin;
const hex=s=>Array.from(s).map(b=>b.toString(16).padStart(2,'0')).join('');
async function derive(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:310000},key,256)))}
export async function onRequestGet({env}){try{if(env.ADMIN_USERNAME&&env.ADMIN_PASSWORD)return json({configured:true});await ensureAuthTables(env);const row=await env.DB.prepare('SELECT id FROM admin_credentials WHERE id=1').first();return json({configured:!!row})}catch{return json({error:'Autenticação indisponível'},503)}}
export async function onRequestPost({request,env}){
 if(!originOK(request))return json({error:'Origem inválida'},403);
 if(env.ADMIN_USERNAME&&env.ADMIN_PASSWORD)return json({error:'O acesso já foi configurado nas variáveis do projeto. Use a tela de login.'},409);
 const access=await authenticateAccess(request,env);if(access.error)return access.error;
 let data;try{data=await request.json()}catch{return json({error:'Requisição inválida'},400)}
 const username=clean(data.username,40).toLowerCase(),password=String(data.password||'');
 if(!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(username))return json({error:'Use de 3 a 40 caracteres: letras, números, ponto, hífen ou sublinhado.'},400);
 if(password.length<12||password.length>200)return json({error:'A senha precisa ter pelo menos 12 caracteres.'},400);
 try{
  await ensureAuthTables(env);
  const exists=await env.DB.prepare('SELECT id FROM admin_credentials WHERE id=1').first();
  if(exists)return json({error:'O acesso já foi configurado. Use a tela de login.'},409);
  const salt=crypto.getRandomValues(new Uint8Array(16));
  await env.DB.prepare('INSERT INTO admin_credentials(id,username,email,salt,password_hash) VALUES(1,?,?,?,?)').bind(username,access.email,hex(salt),await derive(password,salt)).run();
  const session=await createSession(env,{username,email:access.email});
  return json({ok:true},201,{'Set-Cookie':session.cookie});
 }catch(e){console.error('Admin setup failed',e);return json({error:'Não foi possível configurar o acesso.'},500)}
}
