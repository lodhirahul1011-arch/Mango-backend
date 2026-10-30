const {test}=require('node:test');
const assert=require('node:assert/strict');
const express=require('express');
const cors=require('cors');
const {validate,createMailer,createRouter}=require('./contact.cjs');
const data={name:'Test <PIO>',phone:'+919876543210',email:'customer@example.com',inquiryType:'Become a Distributor',message:'<script>test</script>'};
const env={SMTP_HOST:'smtp.example.com',SMTP_USER:'sender@example.com',SMTP_PASS:'test',MAIL_FROM:'PIO <sender@example.com>',CONTACT_EMAIL:'receiver@example.com'};
test('validates required fields, lengths, headers, enum and honeypot',()=>{
 assert.equal(validate(data).name,data.name);
 for(const edit of [{name:''},{phone:'abc'},{email:'bad'},{email:'a@example.com\nBcc:x@y.com'},{inquiryType:'booking'},{message:'x'.repeat(5001)},{website:'bot'},{name:[]}]) assert.throws(()=>validate({...data,...edit}));
 assert.equal(validate({...data,message:''}).message,'');
});
test('SMTP awaits recipient acceptance, escapes HTML and uses Reply-To',async()=>{
 let captured,options,created=0;
 const mailer=createMailer(env,{createTransport:o=>{options=o;created++;return {sendMail:async m=>{captured=m;return {accepted:[env.CONTACT_EMAIL]};}};}});
 assert.deepEqual(await mailer.send(data),{emailStatus:'accepted'});await mailer.send(data);
 assert.equal(options.pool,true);assert.equal(options.maxConnections,2);assert.equal(created,1);assert.equal(options.requireTLS,true);assert.equal(options.tls.rejectUnauthorized,true);
 assert.equal(captured.to,env.CONTACT_EMAIL);assert.equal(captured.replyTo,data.email);assert.equal(captured.from,env.MAIL_FROM);
 assert.ok(captured.html.includes('&lt;script&gt;'));assert.ok(captured.text.includes(data.message));assert.ok(captured.text.includes('Submitted at (UTC)'));
});
test('missing config, transport failure and unaccepted recipient reject',async()=>{
 await assert.rejects(createMailer({}).send(data));
 for(const sendMail of [async()=>{throw Error('secret-provider-error');},async()=>({accepted:[]})]) await assert.rejects(createMailer(env,{createTransport:()=>({sendMail})}).send(data));
 await assert.rejects(createMailer({...env,SMTP_PORT:'465',SMTP_SECURE:'false'}).send(data));
});
test('HTTPS provider requires successful response and message id',async()=>{
 const cfg={...env,CONTACT_MAIL_PROVIDER:'resend',RESEND_API_KEY:'test'};
 for(const [ok,body,pass] of [[true,{id:'accepted'},true],[false,{message:'secret'},false],[true,{},false]]){
  const mailer=createMailer(cfg,{fetch:async()=>({ok,json:async()=>body})});
  if(pass) assert.equal((await mailer.send(data)).emailStatus,'accepted');else await assert.rejects(mailer.send(data));
 }
});
test('EmailJS sends server-only credentials and backend-controlled recipient',async()=>{
 const cfg={CONTACT_MAIL_PROVIDER:'emailjs',CONTACT_EMAIL:'receiver@example.com',EMAILJS_SERVICE_ID:'service',EMAILJS_TEMPLATE_ID:'template',EMAILJS_PUBLIC_KEY:'public',EMAILJS_PRIVATE_KEY:'private'};
 let request;
 const mailer=createMailer(cfg,{fetch:async(url,options)=>{request={url,options};return {ok:true};}});
 assert.equal(await mailer.verify(),'emailjs');
 assert.deepEqual(await mailer.send(data),{emailStatus:'accepted'});
 assert.equal(request.url,'https://api.emailjs.com/api/v1.0/email/send');
 const payload=JSON.parse(request.options.body);
 assert.equal(payload.service_id,cfg.EMAILJS_SERVICE_ID);
 assert.equal(payload.template_id,cfg.EMAILJS_TEMPLATE_ID);
 assert.equal(payload.user_id,cfg.EMAILJS_PUBLIC_KEY);
 assert.equal(payload.accessToken,cfg.EMAILJS_PRIVATE_KEY);
 assert.equal(payload.template_params.to_email,cfg.CONTACT_EMAIL);
 assert.equal(payload.template_params.reply_to,data.email);
 assert.equal(payload.template_params.name,data.name);
 assert.equal(payload.template_params.inquiry_type,data.inquiryType);
 await assert.rejects(createMailer({...cfg,EMAILJS_PRIVATE_KEY:''}).send(data));
 await assert.rejects(createMailer(cfg,{fetch:async()=>({ok:false})}).send(data));
});
async function withServer(mailer,run,max=50){
 const app=express();
 app.use('/api/pio/contact',cors({origin:true}),createRouter({mailer,max}));
 app.use(cors({origin(origin,callback){callback(null,!origin||origin==='https://allowed.example');},credentials:true}));
 app.get('/api/private',(req,res)=>res.status(200).end());
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const url='http://127.0.0.1:'+server.address().port+'/api/pio/contact';
 try{await run((body,headers={})=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)}),url.replace('/api/pio/contact',''));}finally{await new Promise(r=>server.close(r));}
}
test('contact route allows any origin while other routes retain the configured allowlist',async()=>{
 await withServer({send:async()=>{}},async(post,base)=>{
  const origin='https://unlisted-site.example';
  const preflight=await fetch(base+'/api/pio/contact',{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});
  assert.equal(preflight.status,204);
  assert.equal(preflight.headers.get('access-control-allow-origin'),origin);
  assert.equal(preflight.headers.get('access-control-allow-credentials'),null);
  const privateResponse=await fetch(base+'/api/private',{headers:{Origin:origin}});
  assert.equal(privateResponse.headers.get('access-control-allow-origin'),null);
 });
});
test('route success, invalid input and oversized body',async()=>{
 let calls=0;await withServer({send:async()=>{calls++;}},async post=>{
  assert.equal((await post(data)).status,200);
  assert.equal((await post({...data,email:''})).status,400);
  assert.equal((await post({...data,message:'a'.repeat(14000)})).status,413);
  const response=await post(data,{Origin:'https://unlisted-site.example'});
  assert.equal(response.status,200);
  assert.equal(response.headers.get('access-control-allow-origin'),'https://unlisted-site.example');
  assert.equal(calls,2);
 });
});
test('route mail failure is safe and never success',async()=>{
 await withServer({send:async()=>{throw Error('secret password customer@example.com');}},async post=>{
  const r=await post(data);assert.equal(r.status,503);const body=await r.text();assert.ok(!body.includes('secret'));assert.ok(!body.includes(data.email));
 });
});
test('rate limit blocks repeated submissions',async()=>{
 await withServer({send:async()=>{}},async post=>{assert.equal((await post(data)).status,200);assert.equal((await post(data)).status,429);},1);
});

test('rejects incomplete and malformed phones and returns field errors without sending',async()=>{
 for(const phone of ['1234567','0000000000','999+9999999','+919876543','123456789012345']) {
  assert.throws(()=>validate({...data,phone}),error=>Boolean(error.errors.phone));
 }
 for(const phone of ['9876543210','+91 98765 43210','+1 (415) 555-2671']) assert.equal(validate({...data,phone}).phone,phone);
 for(const name of ['  ','A','12345']) assert.throws(()=>validate({...data,name}),error=>Boolean(error.errors.name));
 let calls=0;
 await withServer({send:async()=>{calls++;}},async post=>{
  const response=await post({...data,name:' ',phone:'123',email:'bad'});
  assert.equal(response.status,400);
  const body=await response.json();
  assert.deepEqual(Object.keys(body.errors).sort(),['email','name','phone']);
  assert.equal(calls,0);
 });
});

test('does not acknowledge success before the mail provider accepts',async()=>{
 let accept;
 const accepted=new Promise(resolve=>{accept=resolve;});
 let started;
 const sending=new Promise(resolve=>{started=resolve;});
 await withServer({send:async()=>{started();await accepted;}},async post=>{
  let complete=false;
  const response=post(data).then(r=>{complete=true;return r;});
  await sending;
  assert.equal(complete,false);
  accept();
  assert.equal((await response).status,200);
 });
});
