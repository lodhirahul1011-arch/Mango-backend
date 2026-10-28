import {createServer} from 'node:http';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,dirname} from 'node:path';
import {openStore} from './store.js';
import {createAuth} from './auth.js';
import {createDomain} from './domain.js';
import {createFiles} from './files.js';
import {ensure,email,ApiError} from './validation.js';

const backendRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
async function readBody(req,limit){
  const chunks=[];let size=0;
  for await(const chunk of req){size+=chunk.length;ensure(size<=limit,'Request body is too large',413);chunks.push(chunk);}
  return Buffer.concat(chunks);
}
function respond(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(status===204?undefined:JSON.stringify(data));}

export function createApp({database=resolve(backendRoot,process.env.DATABASE_PATH||'data/roomrent.sqlite'),origins=(process.env.ALLOWED_ORIGINS||'http://localhost:3000,http://127.0.0.1:3000').split(',').map(s=>s.trim()),rateLimit=Number(process.env.AUTH_IP_RATE_LIMIT??300),emailRateLimit=30}={}){
  ensure(origins.length&&origins.every(o=>/^https?:\/\/[^/]+$/.test(o)),'ALLOWED_ORIGINS must contain exact origins');
  ensure(Number.isSafeInteger(rateLimit)&&rateLimit>0,'AUTH_IP_RATE_LIMIT must be a positive integer');
  ensure(Number.isSafeInteger(emailRateLimit)&&emailRateLimit>0,'Email authentication limit must be a positive integer');
  const store=openStore(database),auth=createAuth(store),domain=createDomain(store),files=createFiles(store,domain);
  const ipAttempts=new Map(),emailAttempts=new Map();
  function throttle(attempts,key,limit,res){
    const now=Date.now();
    for(const [value,entry] of attempts)if(entry.until<=now)attempts.delete(value);
    const entry=attempts.get(key)||{count:0,until:now+15*60_000};entry.count++;attempts.set(key,entry);
    if(entry.count>limit){res.setHeader('Retry-After',String(Math.ceil((entry.until-now)/1000)));throw new ApiError(429,'Too many authentication attempts; try later');}
  }
  const server=createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');res.setHeader('Vary','Origin');
    try{
      const origin=req.headers.origin;
      if(origin){ensure(origins.includes(origin),'Origin not allowed',403);res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE, OPTIONS');}
      if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
      const url=new URL(req.url,'http://localhost'),method=req.method,path=url.pathname;
      ensure(path.length<=1000,'URL too long',414);
      if(path==='/api/health'&&method==='GET'){store.db.prepare('SELECT 1').get();respond(res,200,{status:'ok',service:'roomrent-backend'});return;}
      ensure(path.startsWith('/api/'),'Endpoint not found',404);
      const publicAuth=method==='POST'&&['/api/auth/login','/api/auth/register','/api/auth/register-tenant','/api/auth/refresh'].includes(path);
      // Never trust forwarded IP headers; shared proxies can raise the bulk cap through the environment.
      if(publicAuth)throttle(ipAttempts,req.socket.remoteAddress||'unknown',rateLimit,res);
      const actor=publicAuth?null:auth.authenticate(req);
      const upload=method==='POST'&&/^\/api\/files\/documents\/[^/]+$/.test(path);
      let body={};let file=null;
      if(['POST','PATCH','DELETE'].includes(method)){
        const raw=await readBody(req,upload?10*1024*1024+64*1024:128*1024);
        if(upload){
          ensure(req.headers['content-type']?.startsWith('multipart/form-data;'),'Multipart form required',415);
          let form;try{form=await new Request('http://localhost',{method:'POST',headers:{'content-type':req.headers['content-type']},body:raw}).formData();}catch{throw new ApiError(400,'Invalid multipart form');}
          const entry=form.get('file');ensure(entry&&typeof entry.arrayBuffer==='function'&&form.getAll('file').length===1,'One file is required');
          file={name:entry.name,type:entry.type,content:Buffer.from(await entry.arrayBuffer())};body={kind:form.get('kind')};
        }else if(raw.length){
          ensure(req.headers['content-type']?.split(';')[0]==='application/json','JSON content type required',415);
          try{body=JSON.parse(raw.toString('utf8'));}catch{throw new ApiError(400,'Invalid JSON');}
          ensure(body&&typeof body==='object'&&!Array.isArray(body),'JSON object required');
        }
      }
      if(publicAuth){
        if(path!=='/api/auth/refresh')throttle(emailAttempts,email(body.email),emailRateLimit,res);
        const result=path.endsWith('/login')?await auth.login(body):path.endsWith('/refresh')?auth.refresh(body):await auth.register(body,path.endsWith('/register-tenant')?'tenant':'owner');
        respond(res,path.includes('/register')?201:200,result);return;
      }
      if(path==='/api/auth/me'&&method==='GET'){respond(res,200,{user:{id:actor.id,name:actor.name,email:actor.email},actor:{role:actor.role,organizationId:actor.organizationId}});return;}
      if(path==='/api/auth/logout'&&method==='POST'){auth.logout(actor);respond(res,204);return;}
      const download=path.match(/^\/api\/files\/([^/]+)\/download$/);
      if(download&&method==='GET'){
        const file=files.download(download[1],actor);res.writeHead(200,{'Content-Type':file.type,'Content-Length':file.content.length,'Content-Disposition':`attachment; filename="document"; filename*=UTF-8''${encodeURIComponent(file.name)}`});res.end(file.content);return;
      }
      if(method==='GET'){
        const result=domain.query(path.slice(5),url.searchParams,actor);
        respond(res,200,/^\/api\/tenants\/[^/]+\/ledger$/.test(path)?result:{data:result});return;
      }
      const archive=path.match(/^\/api\/invoices\/([^/]+)\/pdf$/);
      const result=store.transaction(()=>{
        const value=upload?files.upload(path.split('/').at(-1),file,body.kind,actor):archive&&method==='POST'?files.archive(archive[1],url.searchParams.get('revision'),actor):domain.mutate(method,path.slice(5),body,actor);
        store.audit(actor,`${method} ${path}`);return value;
      });
      respond(res,method==='DELETE'?204:method==='POST'?201:200,{data:result});
    }catch(error){
      if(res.headersSent){res.end();return;}
      const status=error instanceof ApiError?error.status:500;
      if(status===500)console.error('Request failed:',error.message);
      respond(res,status,{error:{code:`HTTP_${status}`,message:status===500?'Internal server error':error.message}});
    }
  });
  server.requestTimeout=30_000;server.headersTimeout=15_000;server.maxHeadersCount=50;
  return {server,store,close:()=>new Promise((resolve,reject)=>{server.close(error=>{store.close();error?reject(error):resolve();});server.closeIdleConnections();})};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const app=createApp();const port=Number(process.env.PORT||5000),host=process.env.HOST||'127.0.0.1';
  app.server.listen(port,host,()=>console.log(`RoomRent backend ready at http://${host}:${port}`));
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{app.close().then(()=>process.exit(0));});
}
