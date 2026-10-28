import {ensure,text,optional,integer,choice,email,date,month,today,ApiError} from './validation.js';

export function createDomain(store) {
  const owner=a=>ensure(a.role==='owner','Owner access required',403);
  const tenantProfiles=a=>store.all('tenants').filter(t=>t.userId===a.id);
  const tenantIds=a=>new Set(tenantProfiles(a).map(t=>t.id));
  function visible(resource,a){
    if(a.role==='owner')return store.all(resource,a.organizationId).filter(r=>resource!=='notifications'||r.userId===a.id);
    const ids=tenantIds(a);
    if(resource==='notifications')return store.all(resource).filter(r=>r.userId===a.id);
    if(resource==='enrollments')return store.all(resource).filter(r=>r.userId===a.id);
    if(resource==='tenants')return tenantProfiles(a);
    if(resource==='rooms'){
      const rooms=new Set(store.all('tenancies').filter(t=>ids.has(t.tenantId)).map(t=>t.roomId));
      return store.all('rooms').filter(r=>rooms.has(r.id));
    }
    if(['tenancies','invoices','payments','maintenance','deposits','documents','files','revisions','pdfs','ledger'].includes(resource))return store.all(resource).filter(r=>ids.has(r.tenantId));
    throw new ApiError(403,'Resource is restricted to owners');
  }
  function get(resource,id,a){const row=visible(resource,a).find(r=>r.id===id);ensure(row,'Record not found',404);return row;}
  function occupied(room){return store.all('tenancies',room.organizationId).some(t=>t.roomId===room.id&&t.status==='active');}
  const roomView=r=>({...r,occupancy:r.status==='maintenance'?'maintenance':occupied(r)?'occupied':'vacant'});
  function notify(org,userId,title,body){if(userId)store.add('notifications',org,{userId,title,body,readAt:null});}
  function notifyOwner(org,title,body){for(const u of store.db.prepare("SELECT id FROM users WHERE organization_id=? AND role='owner'").all(org))notify(org,u.id,title,body);}
  function notifyTenant(org,tenantId,title,body){notify(org,store.get('tenants',tenantId)?.userId,title,body);}
  function ledger(org,tenantId,description,debitPaise,creditPaise){return store.add('ledger',org,{tenantId,description,debitPaise,creditPaise,occurredAt:new Date().toISOString()});}
  function ledgerView(rows){let balancePaise=0;return rows.map(r=>({...r,balancePaise:(balancePaise+=r.debitPaise-r.creditPaise)}));}
  function balance(invoice){
    const revisions=store.all('revisions',invoice.organizationId).filter(r=>r.invoiceId===invoice.id);
    const totalPaise=revisions.at(-1)?.totalPaise??invoice.originalItems.reduce((n,i)=>n+i.amountPaise,0);
    const paidPaise=store.all('payments',invoice.organizationId).filter(p=>p.invoiceId===invoice.id&&p.status==='verified').reduce((n,p)=>n+p.amountPaise,0);
    return {invoiceId:invoice.id,totalPaise,paidPaise,balancePaise:totalPaise-paidPaise};
  }
  function updateInvoice(invoice){const b=balance(invoice);invoice.status=b.balancePaise===0?'paid':b.paidPaise>0?'partially-paid':'unpaid';store.save('invoices',invoice);}
  function revision(invoice,items,kind,description){const count=store.all('revisions',invoice.organizationId).filter(r=>r.invoiceId===invoice.id).length;return store.add('revisions',invoice.organizationId,{invoiceId:invoice.id,tenantId:invoice.tenantId,revision:count+1,items,kind,description,totalPaise:items.reduce((n,i)=>n+i.amountPaise,0)});}
  function assign(a,tenantId,roomId,moveIn){
    const t=get('tenants',tenantId,a),r=get('rooms',roomId,a);date(moveIn);
    ensure(r.status==='active','Room is under maintenance',409);
    const history=store.all('tenancies',a.organizationId);
    ensure(!history.some(h=>(h.roomId===r.id||h.tenantId===t.id)&&(!h.moveOut||h.moveOut>=moveIn)),'Room or tenant has an overlapping tenancy',409);
    const tenancy=store.add('tenancies',a.organizationId,{tenantId:t.id,roomId:r.id,propertyId:r.propertyId,moveIn,moveOut:null,status:'active'});
    notifyTenant(a.organizationId,t.id,'Room assigned',`Room ${r.number} assigned from ${moveIn}.`);return tenancy;
  }
  function fields(resource,b,old,a){
    const merged={...old,...b};const org=a.organizationId;
    if(resource==='properties'){
      ensure(merged.acceptingEnrollments===undefined||typeof merged.acceptingEnrollments==='boolean','Invalid enrollment setting');
      return {name:text(merged.name,'Property name',2,120),location:optional(merged.location,'Location'),address:optional(merged.address,'Address'),acceptingEnrollments:merged.acceptingEnrollments??false};
    }
    if(resource==='floors'){
      const propertyId=old?.propertyId||text(b.propertyId,'Property');get('properties',propertyId,a);
      return {propertyId,name:text(merged.name,'Floor name',1,120),order:integer(merged.order??0,'Floor order',0,1000)};
    }
    if(resource==='rooms'){
      const propertyId=old?.propertyId||text(b.propertyId,'Property'),floorId=old?.floorId||text(b.floorId,'Floor');
      get('properties',propertyId,a);ensure(get('floors',floorId,a).propertyId===propertyId,'Floor belongs to another property');
      const number=text(merged.number,'Room number',1,50),status=choice(merged.status??'active',['active','maintenance'],'room status');
      ensure(!store.all('rooms',org).some(r=>r.propertyId===propertyId&&r.number===number&&r.id!==old?.id),'Room number already exists in this property',409);
      ensure(!(old&&occupied(old)&&status==='maintenance'),'Occupied room cannot enter maintenance',409);
      return {propertyId,floorId,number,status,rentPaise:integer(merged.rentPaise,'Monthly rent')};
    }
    if(resource==='tenants')return {name:text(merged.name,'Tenant name',2,120),phone:optional(merged.phone,'Phone',40),email:merged.email?email(merged.email):'',emergencyContact:optional(merged.emergencyContact,'Emergency contact',100),notes:optional(merged.notes,'Notes',2000)};
    throw new ApiError(404,'Unknown resource');
  }
  function metadata(raw){
    ensure(raw&&typeof raw==='object','Invalid file metadata');
    return {name:text(raw.name,'Filename',1,200),type:choice(raw.type,['application/pdf','image/jpeg','image/png'],'file type'),size:integer(raw.size,'File size',1,10*1024*1024),category:optional(raw.category,'Category',30)};
  }
  const api={
    get,visible,owner,balance,notifyTenant,
    query(path,params,a){
      let parts=path.split('/').filter(Boolean);let [resource,id,action]=parts;
      if(resource==='catalog'){
        if(id==='properties'&&!action)return store.all('properties').filter(p=>p.acceptingEnrollments).map(p=>({id:p.id,name:p.name,location:p.location}));
        if(id==='properties'&&parts[3]==='rooms'){
          const p=store.get('properties',action);ensure(p?.acceptingEnrollments,'Property is not accepting applications',404);
          return store.all('rooms',p.organizationId).filter(r=>r.propertyId===p.id&&r.status==='active'&&!occupied(r)).map(r=>({id:r.id,propertyId:r.propertyId,number:r.number,rentPaise:r.rentPaise}));
        }
      }
      if(resource==='tenant'){
        ensure(a.role==='tenant','Tenant access required',403);
        if(id==='profile'){const profiles=tenantProfiles(a);ensure(profiles.length,'No approved tenant profile yet',404);return profiles.at(-1);}
        if(id==='ledger')return ledgerView(visible('ledger',a));
        resource=id;id=undefined;
      }
      if(resource==='properties'&&action==='overview'){
        owner(a);const property=get(resource,id,a),rooms=visible('rooms',a).filter(r=>r.propertyId===id).map(roomView);
        return {property,rooms,floors:visible('floors',a).filter(f=>f.propertyId===id),occupancy:{total:rooms.length,occupied:rooms.filter(r=>r.occupancy==='occupied').length,vacant:rooms.filter(r=>r.occupancy==='vacant').length,maintenance:rooms.filter(r=>r.occupancy==='maintenance').length},scheduledRentPaise:rooms.filter(r=>r.occupancy==='occupied').reduce((n,r)=>n+r.rentPaise,0)};
      }
      if(resource==='invoices'&&id){const invoice=get(resource,id,a);if(action==='balance')return balance(invoice);if(action==='revisions'||action==='pdfs')return visible(action,a).filter(r=>r.invoiceId===id);}
      if(resource==='tenants'&&action==='ledger'){get('tenants',id,a);const data=ledgerView(visible('ledger',a).filter(r=>r.tenantId===id));return {data,balancePaise:data.at(-1)?.balancePaise||0};}
      if(resource==='reports'&&id==='reconciliation'){
        owner(a);const period=month(params.get('month')),invoices=visible('invoices',a).filter(i=>i.month===period),balances=invoices.map(balance);
        return {month:period,invoices:invoices.length,totalPaise:balances.reduce((n,b)=>n+b.totalPaise,0),verifiedPaise:balances.reduce((n,b)=>n+b.paidPaise,0),outstandingPaise:balances.reduce((n,b)=>n+b.balancePaise,0),pendingPaise:visible('payments',a).filter(p=>p.status==='submitted'&&invoices.some(i=>i.id===p.invoiceId)).reduce((n,p)=>n+p.amountPaise,0)};
      }
      if(resource==='enrollments'&&id==='mine'){ensure(a.role==='tenant','Tenant access required',403);return visible(resource,a);}
      if(!id&&['properties','floors','rooms','tenants','tenancies','enrollments','invoices','payments','maintenance','notifications','deposits','documents'].includes(resource))return visible(resource,a).map(r=>resource==='rooms'?roomView(r):r);
      throw new ApiError(404,'Endpoint not found');
    },
    mutate(method,path,b,a){
      const [resource,id,action]=path.split('/').filter(Boolean);
      if(['properties','floors','rooms','tenants'].includes(resource)){
        owner(a);
        if(method==='POST'&&!id)return store.add(resource,a.organizationId,fields(resource,b,null,a));
        const row=get(resource,id,a);
        if(method==='PATCH'&&!action)return store.save(resource,{...row,...fields(resource,b,row,a)});
        if(method==='DELETE'&&!action){
          const key={properties:'propertyId',floors:'floorId',rooms:'roomId',tenants:'tenantId'}[resource];
          const linked=['floors','rooms','tenancies','enrollments','invoices','payments','maintenance','deposits','documents'].some(r=>store.all(r,a.organizationId).some(item=>item[key]===id));
          ensure(!linked,'Linked records exist; history must be retained',409);store.remove(resource,id);return null;
        }
      }
      if(resource==='tenancies'){
        owner(a);
        if(method==='POST'&&!id)return assign(a,text(b.tenantId,'Tenant'),text(b.roomId,'Room'),date(b.moveIn));
        if(method==='POST'&&action==='move-out'){
          const row=get(resource,id,a),moveOut=date(b.moveOut);ensure(row.status==='active','Tenancy already ended',409);ensure(moveOut>=row.moveIn&&moveOut<=today(),'Move-out must be between move-in and today');
          row.status='ended';row.moveOut=moveOut;store.save(resource,row);notifyTenant(a.organizationId,row.tenantId,'Tenancy ended',`Move-out recorded for ${moveOut}.`);return row;
        }
      }
      if(resource==='enrollments'&&method==='POST'){
        if(!id){
          ensure(a.role==='tenant','Tenant access required',403);const p=store.get('properties',text(b.propertyId,'Property')),r=store.get('rooms',text(b.roomId,'Room'));
          ensure(p?.acceptingEnrollments&&r?.propertyId===p.id&&r.status==='active'&&!occupied(r),'Room is unavailable',409);
          ensure(!store.all('enrollments').some(e=>e.userId===a.id&&e.status==='pending'),'You already have a pending application',409);
          ensure(Array.isArray(b.documents||[])&&(b.documents||[]).length<=10,'Too many document entries');
          const row=store.add(resource,p.organizationId,{userId:a.id,applicantName:text(b.applicantName,'Applicant',2,120),email:a.email,phone:text(b.phone,'Phone',3,40),emergencyContact:optional(b.emergencyContact,'Emergency contact'),address:optional(b.address,'Address'),propertyId:p.id,roomId:r.id,moveIn:date(b.moveIn),documents:(b.documents||[]).map(metadata),status:'pending'});
          notifyOwner(p.organizationId,'New enrollment',`${row.applicantName} applied for room ${r.number}.`);return row;
        }
        owner(a);const row=get(resource,id,a);ensure(row.status==='pending','Enrollment already reviewed',409);
        if(action==='reject'){row.status='rejected';row.rejectionReason=text(b.reason,'Reason',3,1000);}
        else if(action==='approve'){
          let profile=store.all('tenants',a.organizationId).find(t=>t.userId===row.userId);
          if(!profile)profile=store.add('tenants',a.organizationId,{name:row.applicantName,email:row.email,phone:row.phone,emergencyContact:row.emergencyContact,notes:'',userId:row.userId});
          const tenancy=assign(a,profile.id,row.roomId,row.moveIn);row.status='approved';row.tenantId=profile.id;row.tenancyId=tenancy.id;
        }else throw new ApiError(404,'Unknown enrollment action');
        store.save(resource,row);notify(row.organizationId,row.userId,'Application reviewed',`Your application was ${row.status}.`);return row;
      }
      if(resource==='invoices'&&method==='POST'){
        owner(a);
        if(id==='generate'){
          const period=month(b.month),dueDay=integer(b.dueDay??5,'Due day',1,28);const created=[];
          for(const t of visible('tenancies',a)){
            if(t.moveIn.slice(0,7)>period||(t.moveOut&&t.moveOut.slice(0,7)<period)||visible('invoices',a).some(i=>i.tenancyId===t.id&&i.month===period))continue;
            const room=get('rooms',t.roomId,a),items=[{kind:'rent',label:`Rent ${period}`,amountPaise:room.rentPaise}];
            const invoice=store.add(resource,a.organizationId,{tenantId:t.tenantId,tenancyId:t.id,roomId:t.roomId,month:period,dueDate:`${period}-${String(dueDay).padStart(2,'0')}`,originalItems:items,status:room.rentPaise===0?'paid':'unpaid'});
            revision(invoice,items,'original','Original monthly rent');ledger(a.organizationId,t.tenantId,`Invoice ${period}`,room.rentPaise,0);notifyTenant(a.organizationId,t.tenantId,'Rent invoice issued',`Your ${period} rent invoice is ready.`);created.push(invoice);
          }return created;
        }
        if(action==='penalty'){
          const invoice=get(resource,id,a),rule=b.rule||{};choice(rule.mode,['fixed'],'penalty mode');const grace=integer(rule.graceDays,'Grace days',0,365),value=integer(rule.value,'Penalty',1);
          const cutoff=new Date(invoice.dueDate+'T00:00:00Z');cutoff.setUTCDate(cutoff.getUTCDate()+grace);
          ensure(today()>cutoff.toISOString().slice(0,10)&&balance(invoice).balancePaise>0,'Invoice is not overdue beyond grace period',409);
          const previous=store.all('revisions',a.organizationId).filter(r=>r.invoiceId===id);ensure(!previous.some(r=>r.kind==='penalty'),'Penalty already applied',409);
          revision(invoice,[...previous.at(-1).items,{kind:'penalty',label:'Late payment fee',amountPaise:value}],'penalty','Fixed late payment fee');ledger(a.organizationId,invoice.tenantId,`Penalty ${invoice.month}`,value,0);updateInvoice(invoice);return invoice;
        }
      }
      if(resource==='payments'&&method==='POST'){
        if(!id){
          const invoice=get('invoices',text(b.invoiceId,'Invoice'),a),amountPaise=integer(b.amountPaise,'Payment amount',1),reference=text(b.reference,'Reference',3,150),org=invoice.organizationId;
          ensure(!store.all(resource,org).some(p=>p.reference.toLowerCase()===reference.toLowerCase()&&p.status!=='rejected'),'Duplicate payment reference',409);
          const pending=store.all(resource,org).filter(p=>p.invoiceId===invoice.id&&p.status==='submitted').reduce((n,p)=>n+p.amountPaise,0);
          ensure(amountPaise<=balance(invoice).balancePaise-pending,'Amount exceeds unallocated balance',409);
          const row=store.add(resource,org,{tenantId:invoice.tenantId,invoiceId:invoice.id,amountPaise,reference,method:choice(b.method,['cash','upi','bank'],'payment method'),proof:b.proof?metadata(b.proof):null,status:'submitted'});
          notifyOwner(org,'Payment submitted',`Payment reference ${reference} awaits verification.`);return row;
        }
        owner(a);const row=get(resource,id,a);ensure(row.status==='submitted','Payment already reviewed',409);
        if(action==='verify'){
          const invoice=get('invoices',row.invoiceId,a);ensure(row.amountPaise<=balance(invoice).balancePaise,'Payment exceeds balance',409);row.status='verified';row.verifiedAt=new Date().toISOString();store.save(resource,row);
          ledger(a.organizationId,row.tenantId,`Payment ${row.reference}`,0,row.amountPaise);updateInvoice(invoice);
        }else if(action==='reject'){row.status='rejected';row.rejectionReason=text(b.reason,'Reason',3,1000);store.save(resource,row);}
        else throw new ApiError(404,'Unknown payment action');
        notifyTenant(a.organizationId,row.tenantId,'Payment reviewed',`Payment ${row.reference} was ${row.status}.`);return row;
      }
      if(resource==='maintenance'){
        if(method==='POST'&&!id){
          const room=get('rooms',text(b.roomId,'Room'),a),tenancy=visible('tenancies',a).find(t=>t.roomId===room.id&&t.status==='active');ensure(tenancy,'Active tenancy required',409);
          ensure(!b.tenantId||b.tenantId===tenancy.tenantId,'Tenant does not occupy this room');ensure(!b.propertyId||b.propertyId===room.propertyId,'Property mismatch');
          const row=store.add(resource,room.organizationId,{tenantId:tenancy.tenantId,roomId:room.id,propertyId:room.propertyId,title:text(b.title,'Title',3,150),description:text(b.description,'Description',5,5000),status:'new',history:[]});notifyOwner(room.organizationId,'Maintenance request',row.title);return row;
        }
        if(method==='PATCH'&&action==='status'){
          owner(a);const row=get(resource,id,a),expected={new:'in-progress','in-progress':'resolved'}[row.status];ensure(expected&&b.status===expected,'Invalid status transition',409);
          row.status=expected;row.history.push({status:expected,remark:text(b.remark,'Remark',3,1000),at:new Date().toISOString()});store.save(resource,row);notifyTenant(row.organizationId,row.tenantId,'Maintenance update',`${row.title}: ${row.status}`);return row;
        }
      }
      if(resource==='deposits'&&method==='POST'){
        owner(a);
        if(!id){const tenancy=get('tenancies',text(b.tenancyId,'Tenancy'),a);ensure(tenancy.status==='active','Deposit requires an active tenancy',409);ensure(!visible(resource,a).some(d=>d.tenancyId===tenancy.id),'Deposit already recorded',409);return store.add(resource,a.organizationId,{tenancyId:tenancy.id,tenantId:tenancy.tenantId,amountPaise:integer(b.amountPaise,'Deposit',1),reference:text(b.reference,'Reference',3,150),deductionsPaise:0,refundPaise:0,status:'held'});}
        if(action==='settle'){
          const row=get(resource,id,a);ensure(row.status==='held','Deposit already settled',409);ensure(get('tenancies',row.tenancyId,a).status==='ended','Move out before settlement',409);
          row.deductionsPaise=integer(b.deductionsPaise,'Deductions',0,row.amountPaise);row.refundPaise=row.amountPaise-row.deductionsPaise;row.reason=text(b.reason,'Reason',3,1000);row.refundReference=text(b.refundReference,'Refund reference',3,150);row.status='settled';store.save(resource,row);notifyTenant(row.organizationId,row.tenantId,'Deposit settled',`Refund recorded: INR ${(row.refundPaise/100).toFixed(2)}.`);return row;
        }
      }
      if(resource==='notifications'&&method==='PATCH'&&action==='read'){const row=get(resource,id,a);row.readAt ||=new Date().toISOString();return store.save(resource,row);}
      if(resource==='documents'&&method==='PATCH'&&action==='review'){
        owner(a);const row=get(resource,id,a);ensure(row.status==='pending','Document already reviewed',409);row.status=choice(b.status,['approved','rejected'],'document status');if(row.status==='rejected')row.rejectionReason=text(b.reason,'Reason',3,1000);store.save(resource,row);notifyTenant(row.organizationId,row.tenantId,'Document reviewed',`${row.name} was ${row.status}.`);return row;
      }
      throw new ApiError(404,'Endpoint not found');
    }
  };
  return api;
}
