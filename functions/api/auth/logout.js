import {destroySession,response} from '../../_lib/auth.js';
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
export async function onRequestPost({request,env}){if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Origem inválida'},403);try{const cookie=await destroySession(request,env);return json({ok:true},200,{'Set-Cookie':cookie})}catch{return json({error:'Não foi possível encerrar a sessão'},500)}}
