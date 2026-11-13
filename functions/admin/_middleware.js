import {getSession} from '../_lib/auth.js';
export async function onRequest({request,env,next}){
 const url=new URL(request.url),path=url.pathname;
 if(path.startsWith('/admin/login')||/\.(?:css|js|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(path))return next();
 const session=await getSession(request,env);
 if(session)return next();
 const target='/admin/login/?next='+encodeURIComponent(path+url.search);
 return Response.redirect(new URL(target,url.origin),302);
}
