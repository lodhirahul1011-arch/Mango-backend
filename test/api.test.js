import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../src/server.js';

const password='Test-password-938!';
async function fixture(t,options={}){
  const app=createApp({database:':memory:',rateLimit:1000,...options});
  await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${app.server.address().port}`;
  t.after(()=>app.close());
  async function api(path,method='GET',body,session,expected=200){
    const headers={};if(session)headers.Authorization=`Bearer ${session.accessToken}`;
    if(body!==undefined)headers['Content-Type']='application/json';
    const response=await fetch(base+'/api/'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
    const result=response.status===204?null:await response.json();
    assert.equal(response.status,expected,`${method} ${path}: ${JSON.stringify(result)}`);return result;
  }
  async function account(email,role='owner'){
    await api(role==='tenant'?'auth/register-tenant':'auth/register','POST',{name:'Test Person',email,password},null,201);
    return api('auth/login','POST',{email,password});
  }
  async function property(owner){
    const p=(await api('properties','POST',{name:'Test House',location:'Bhopal',acceptingEnrollments:true},owner,201)).data;
    const f=(await api('floors','POST',{propertyId:p.id,name:'Ground',order:0},owner,201)).data;
    const r=(await api('rooms','POST',{propertyId:p.id,floorId:f.id,number:'101',rentPaise:1500000},owner,201)).data;
    return {p,f,r};
  }
  async function approved(owner,tenant,p,r){
    const e=(await api('enrollments','POST',{applicantName:'Tenant Person',phone:'9999999999',email:'ignored@example.com',propertyId:p.id,roomId:r.id,moveIn:'2025-01-01'},tenant,201)).data;
    const result=(await api(`enrollments/${e.id}/approve`,'POST',{},owner,201)).data;
    return {e:result,tenantId:result.tenantId,tenancyId:result.tenancyId};
  }
  return {app,base,api,account,property,approved};
}

test('accounts, roles, opaque sessions, refresh rotation and logout',async t=>{
  const {api,account,app}=await fixture(t);
  await api('properties','GET',undefined,null,401);
  await api('auth/register','POST',{name:'A',email:'bad',password:'short'},null,400);
  const owner=await account('OWNER@example.com');
  assert.equal(owner.user.email,'owner@example.com');assert.equal(owner.role,'owner');
  await api('auth/register','POST',{name:'Other',email:'owner@example.com',password},null,409);
  await api('auth/login','POST',{email:'owner@example.com',password:'incorrect'},null,401);
  const tenant=await account('tenant@example.com','tenant');
  await api('properties','POST',{name:'Escalation',organizationId:owner.organizationId},tenant,403);
  const stored=app.store.db.prepare('SELECT * FROM users WHERE id=?').get(owner.user.id);
  assert.notEqual(stored.password,password);assert.match(stored.password,/^[a-f0-9]+:[a-f0-9]+$/);
  const session=app.store.db.prepare('SELECT * FROM sessions WHERE user_id=?').get(owner.user.id);
  assert.notEqual(session.access_hash,owner.accessToken);
  const refreshed=await api('auth/refresh','POST',{refreshToken:owner.refreshToken});
  await api('auth/refresh','POST',{refreshToken:owner.refreshToken},null,401);
  await api('auth/me','GET',undefined,owner,401);
  await api('auth/me','GET',undefined,refreshed);
  await api('auth/logout','POST',undefined,refreshed,204);
  await api('auth/refresh','POST',{refreshToken:refreshed.refreshToken},null,401);
});

test('organization isolation, foreign keys and protected deletion',async t=>{
  const {api,account,property}=await fixture(t);const a=await account('a@example.com'),b=await account('b@example.com');
  const {p,f,r}=await property(a);
  assert.equal((await api('properties','GET',undefined,b)).data.length,0);
  await api(`properties/${p.id}/overview`,'GET',undefined,b,404);
  await api(`properties/${p.id}`,'PATCH',{name:'Stolen'},b,404);
  await api('floors','POST',{propertyId:p.id,name:'Intruder'},b,404);
  await api('rooms','POST',{propertyId:p.id,floorId:f.id,number:'101',rentPaise:100},a,409);
  await api(`rooms/${r.id}`,'PATCH',{rentPaise:-1},a,400);
  await api(`rooms/${r.id}`,'PATCH',{organizationId:b.organizationId,number:'102'},a);
  assert.equal((await api('rooms','GET',undefined,a)).data[0].organizationId,a.organizationId);
  await api(`properties/${p.id}`,'DELETE',undefined,a,409);
  await api(`floors/${f.id}`,'DELETE',undefined,a,409);
  await api(`rooms/${r.id}`,'DELETE',undefined,a,204);
  await api(`floors/${f.id}`,'DELETE',undefined,a,204);
  await api(`properties/${p.id}`,'DELETE',undefined,a,204);
});

test('tenant approval, simultaneous booking conflict and transaction rollback',async t=>{
  const {api,account,property,approved}=await fixture(t);const owner=await account('owner@example.com'),tenant=await account('t@example.com','tenant'),other=await account('other@example.com','tenant');
  const {p,r}=await property(owner);
  const catalog=(await api('catalog/properties','GET',undefined,tenant)).data;assert.equal(catalog[0].id,p.id);assert.equal(catalog[0].organizationId,undefined);
  const second=(await api('enrollments','POST',{applicantName:'Other Tenant',phone:'999999999',propertyId:p.id,roomId:r.id,moveIn:'2025-01-01'},other,201)).data;
  const approvedRecord=await approved(owner,tenant,p,r);
  assert.equal((await api('tenant/profile','GET',undefined,tenant)).data.email,tenant.user.email);
  await api(`enrollments/${second.id}/approve`,'POST',{},owner,409);
  assert.equal((await api('tenants','GET',undefined,owner)).data.length,1,'Failed approval rolled back the new tenant');
  await api(`enrollments/${approvedRecord.e.id}/approve`,'POST',{},owner,409);
  await api(`enrollments/${second.id}/reject`,'POST',{reason:'Room occupied'},owner,201);
  assert.equal((await api('enrollments/mine','GET',undefined,other)).data[0].status,'rejected');
  assert.equal((await api('tenant/tenancies','GET',undefined,other)).data.length,0);
  const rows=(await api('rooms','GET',undefined,owner)).data;assert.equal(rows[0].occupancy,'occupied');
  await api(`rooms/${r.id}`,'PATCH',{status:'maintenance'},owner,409);
  await api(`rooms/${r.id}`,'DELETE',undefined,owner,409);
  await api('tenancies','POST',{tenantId:approvedRecord.tenantId,roomId:r.id,moveIn:'2025-02-30'},owner,400);
  await api('tenancies','POST',{tenantId:approvedRecord.tenantId,roomId:r.id,moveIn:'2025-02-01'},owner,409);
  await api(`tenancies/${approvedRecord.tenancyId}/move-out`,'POST',{moveOut:'2024-12-31'},owner,400);
});

test('invoices, pending payments, immutable revisions, ledger and authenticated PDFs',async t=>{
  const {api,base,account,property,approved}=await fixture(t);const owner=await account('owner@example.com'),tenant=await account('t@example.com','tenant'),outsider=await account('x@example.com','tenant');
  const {p,r}=await property(owner);const {tenantId,tenancyId}=await approved(owner,tenant,p,r);
  const invoices=(await api('invoices/generate','POST',{month:'2025-01',dueDay:5},owner,201)).data;assert.equal(invoices.length,1);const invoice=invoices[0];
  assert.equal((await api('invoices/generate','POST',{month:'2025-01'},owner,201)).data.length,0);
  await api('invoices/generate','POST',{month:'2025-13'},owner,400);
  await api(`invoices/${invoice.id}/balance`,'GET',undefined,outsider,404);
  const payment=(await api('payments','POST',{invoiceId:invoice.id,amountPaise:500000,method:'upi',reference:'UPI-001'},tenant,201)).data;
  assert.equal((await api(`invoices/${invoice.id}/balance`,'GET',undefined,tenant)).data.paidPaise,0);
  await api('payments','POST',{invoiceId:invoice.id,amountPaise:500000,method:'upi',reference:'upi-001'},tenant,409);
  await api('payments','POST',{invoiceId:invoice.id,amountPaise:1100000,method:'upi',reference:'UPI-002'},tenant,409);
  await api(`payments/${payment.id}/verify`,'POST',{},tenant,403);
  await api(`payments/${payment.id}/verify`,'POST',{},owner,201);
  await api(`payments/${payment.id}/verify`,'POST',{},owner,409);
  await api(`invoices/${invoice.id}/penalty`,'POST',{today:'2099-01-01',rule:{mode:'fixed',graceDays:15,value:10000}},owner,201);
  await api(`invoices/${invoice.id}/penalty`,'POST',{rule:{mode:'fixed',graceDays:15,value:10000}},owner,409);
  const history=(await api(`invoices/${invoice.id}/revisions`,'GET',undefined,tenant)).data;
  assert.equal(history.length,2);assert.equal(history[0].totalPaise,1500000);assert.equal(history[1].totalPaise,1510000);
  const ledger=await api(`tenants/${tenantId}/ledger`,'GET',undefined,owner);assert.equal(ledger.balancePaise,1010000);assert.equal(ledger.data.length,3);
  const tenantLedger=(await api('tenant/ledger','GET',undefined,tenant)).data;assert.equal(tenantLedger.at(-1).balancePaise,1010000);
  const report=(await api('reports/reconciliation?month=2025-01','GET',undefined,owner)).data;assert.equal(report.outstandingPaise,1010000);
  const archived=(await api(`invoices/${invoice.id}/pdf?revision=1`,'POST',{},tenant,201)).data;
  assert.equal((await api(`invoices/${invoice.id}/pdf?revision=1`,'POST',{},tenant,201)).data.id,archived.id);
  await api(`files/${archived.fileAssetId}/download`,'GET',undefined,outsider,404);
  const pdf=await fetch(`${base}/api/files/${archived.fileAssetId}/download`,{headers:{Authorization:`Bearer ${tenant.accessToken}`}});assert.equal(pdf.status,200);const pdfText=await pdf.text();assert.ok(pdfText.startsWith('%PDF-1.4'));assert.match(pdfText,/15000.00/);assert.ok(pdfText.includes('%%EOF'));
  const final=(await api('payments','POST',{invoiceId:invoice.id,amountPaise:1010000,method:'cash',reference:'CASH-002'},tenant,201)).data;
  await api(`payments/${final.id}/verify`,'POST',{},owner,201);assert.equal((await api('invoices','GET',undefined,tenant)).data[0].status,'paid');
  await api(`tenancies/${tenancyId}/move-out`,'POST',{moveOut:'2025-02-01'},owner,201);
  assert.equal((await api('invoices/generate','POST',{month:'2025-03'},owner,201)).data.length,0);
});

test('maintenance lifecycle, deposits, private upload review, notifications',async t=>{
  const {api,base,account,property,approved}=await fixture(t);const owner=await account('owner@example.com'),tenant=await account('t@example.com','tenant'),otherOwner=await account('other@example.com');
  const {p,r}=await property(owner),{tenantId,tenancyId}=await approved(owner,tenant,p,r);
  const ticket=(await api('maintenance','POST',{roomId:r.id,propertyId:p.id,title:'Water leak',description:'Pipe is leaking in the bathroom'},tenant,201)).data;
  await api(`maintenance/${ticket.id}/status`,'PATCH',{status:'resolved',remark:'Done'},owner,409);
  await api(`maintenance/${ticket.id}/status`,'PATCH',{status:'in-progress',remark:'Assigned plumber'},owner);
  await api(`maintenance/${ticket.id}/status`,'PATCH',{status:'resolved',remark:'Repaired pipe'},owner);
  const deposit=(await api('deposits','POST',{tenancyId,amountPaise:2000000,reference:'DEP-01'},owner,201)).data;
  await api(`deposits/${deposit.id}/settle`,'POST',{deductionsPaise:0,reason:'No damage',refundReference:'REF-01'},owner,409);
  const upload=async(content,type)=>{const form=new FormData();form.append('file',new Blob([content],{type}),'document.pdf');form.append('kind','identity');return fetch(`${base}/api/files/documents/${tenantId}`,{method:'POST',headers:{Authorization:`Bearer ${tenant.accessToken}`},body:form});};
  assert.equal((await upload('not a pdf','application/pdf')).status,400);
  const response=await upload('%PDF-1.4\nTest fixture\n%%EOF','application/pdf');assert.equal(response.status,201);const document=(await response.json()).data;
  await api(`files/${document.fileAssetId}/download`,'GET',undefined,otherOwner,404);
  await api(`documents/${document.id}/review`,'PATCH',{status:'approved'},tenant,403);
  await api(`documents/${document.id}/review`,'PATCH',{status:'approved'},owner);
  const notices=(await api('notifications','GET',undefined,tenant)).data;assert.ok(notices.length>=3);
  await api(`notifications/${notices[0].id}/read`,'PATCH',{},tenant);
  await api(`notifications/${notices[0].id}/read`,'PATCH',{},otherOwner,404);
  await api(`tenancies/${tenancyId}/move-out`,'POST',{moveOut:'2025-02-01'},owner,201);
  await api(`deposits/${deposit.id}/settle`,'POST',{deductionsPaise:2000001,reason:'Damage',refundReference:'REF-01'},owner,400);
  const settled=(await api(`deposits/${deposit.id}/settle`,'POST',{deductionsPaise:10000,reason:'Repair costs',refundReference:'REF-01'},owner,201)).data;assert.equal(settled.refundPaise,1990000);
  await api(`deposits/${deposit.id}/settle`,'POST',{deductionsPaise:0,reason:'Again',refundReference:'REF-02'},owner,409);
  await api('maintenance','POST',{roomId:r.id,title:'Another issue',description:'No longer a current tenant'},tenant,409);
});

test('CORS, malformed JSON, request limits and authentication throttling',async t=>{
  const {base}=await fixture(t,{rateLimit:2});
  assert.equal((await fetch(base+'/api/health',{headers:{Origin:'https://evil.example'}})).status,403);
  const preflight=await fetch(base+'/api/properties',{method:'OPTIONS',headers:{Origin:'http://localhost:3000'}});assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),'http://localhost:3000');
  assert.equal((await fetch(base+'/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:'{broken'})).status,400);
  assert.equal((await fetch(base+'/api/auth/login',{method:'POST',headers:{'content-type':'text/plain'},body:'{}'})).status,415);
  const limited=await fetch(base+'/api/auth/login',{method:'POST',headers:{'content-type':'application/json','x-forwarded-for':'203.0.113.1'},body:'{}'});
  assert.equal(limited.status,429,'Forwarded headers cannot bypass the socket IP limit');
  assert.ok(Number(limited.headers.get('retry-after'))>0);
});

test('accounts sharing an IP have separate email budgets and refresh does not consume them',async t=>{
  const {api,account}=await fixture(t,{emailRateLimit:3});
  let first=await account('first@example.com');
  await account('second@example.com','tenant');
  await account('third@example.com');
  for(let i=0;i<4;i++)first=await api('auth/refresh','POST',{refreshToken:first.refreshToken,email:'first@example.com'});
  await api('auth/login','POST',{email:' FIRST@EXAMPLE.COM ',password:'incorrect'},null,401);
  await api('auth/login','POST',{email:'first@example.com',password},null,429);
  await api('auth/register-tenant','POST',{name:'Duplicate Person',email:'FIRST@example.com',password},null,429);
  await api('auth/login','POST',{email:'second@example.com',password});
  await api('auth/login','POST',{email:'third@example.com',password});
  first=await api('auth/refresh','POST',{refreshToken:first.refreshToken});
  await api('auth/me','GET',undefined,first);
});

test('refresh remains subject to the bulk IP cap',async t=>{
  const {api,account}=await fixture(t,{rateLimit:3});
  const session=await account('bulk@example.com');
  const refreshed=await api('auth/refresh','POST',{refreshToken:session.refreshToken});
  await api('auth/refresh','POST',{refreshToken:refreshed.refreshToken},null,429);
});

test('database records and hashed sessions survive process restart',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'roomrent-test-')),database=join(directory,'data.sqlite');let app;
  try{
    app=createApp({database});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));let base=`http://127.0.0.1:${app.server.address().port}`;
    const post=(path,body,token)=>fetch(base+'/api/'+path,{method:'POST',headers:{'content-type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});
    assert.equal((await post('auth/register',{name:'Persistent User',email:'persist@example.com',password})).status,201);
    const session=await (await post('auth/login',{email:'persist@example.com',password})).json();
    assert.equal((await post('properties',{name:'Persistent House'},session.accessToken)).status,201);
    await app.close();app=null;app=createApp({database});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${app.server.address().port}`;
    const response=await fetch(base+'/api/properties',{headers:{Authorization:`Bearer ${session.accessToken}`}});assert.equal(response.status,200);assert.equal((await response.json()).data[0].name,'Persistent House');
  }finally{if(app)await app.close();rmSync(directory,{recursive:true,force:true});}
});
