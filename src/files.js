import {ensure,text,choice,integer} from './validation.js';

// A small text-only PDF writer: deterministic invoice snapshots, no HTML or remote resources.
export function invoicePdf(invoice,revision,tenant){
  const escape=value=>String(value).replace(/[^\x20-\x7e]/g,'?').replace(/([\\()])/g,'\\$1');
  const lines=['RoomRent - Rent Invoice',`Invoice: ${invoice.id}`,`Tenant: ${tenant.name}`,`Month: ${invoice.month}    Due: ${invoice.dueDate}`,`Revision ${revision.revision}: ${revision.description}`,'',...revision.items.map(i=>`${i.label}: INR ${(i.amountPaise/100).toFixed(2)}`),'',`Total: INR ${(revision.totalPaise/100).toFixed(2)}`,'This invoice snapshot does not confirm payment.'];
  const stream='BT /F1 11 Tf 45 790 Td 18 TL '+lines.map((line,i)=>(i?'T* ':'')+`(${escape(line.slice(0,100))}) Tj`).join('\n')+' ET';
  const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
  let result='%PDF-1.4\n';const offsets=[0];
  for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(result));result+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}
  const xref=Buffer.byteLength(result);result+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(result);
}

export function createFiles(store,domain){
  function save(org,tenantId,name,type,content){
    const record=store.add('files',org,{tenantId,name,type,size:content.length});
    store.db.prepare('INSERT INTO files VALUES (?,?)').run(record.id,content);return record;
  }
  return {
    upload(tenantId,file,kind,actor){
      const tenant=domain.get('tenants',tenantId,actor);ensure(actor.role==='tenant','Tenant upload required',403);
      ensure(domain.visible('tenancies',actor).some(t=>t.tenantId===tenant.id&&t.status==='active'),'Active tenancy required',409);
      const name=text(file.name,'Filename',1,200).replace(/[\\/\r\n\x00-\x1f]/g,'_');
      choice(file.type,['application/pdf','image/png','image/jpeg'],'file type');integer(file.content.length,'File size',1,10*1024*1024);
      const bytes=file.content;
      const valid=file.type==='application/pdf'?bytes.subarray(0,5).toString()==='%PDF-':file.type==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
      ensure(valid,'File content does not match its type');
      const asset=save(tenant.organizationId,tenant.id,name,file.type,bytes);
      return store.add('documents',tenant.organizationId,{tenantId:tenant.id,fileAssetId:asset.id,name,kind:choice(kind,['identity','photo','other'],'document kind'),status:'pending'});
    },
    archive(invoiceId,requestedRevision,actor){
      const invoice=domain.get('invoices',invoiceId,actor);
      const history=domain.visible('revisions',actor).filter(r=>r.invoiceId===invoice.id);
      const revision=requestedRevision?history.find(r=>r.revision===integer(Number(requestedRevision),'Revision',1)):history.at(-1);
      ensure(revision,'Invoice revision not found',404);
      const existing=domain.visible('pdfs',actor).find(p=>p.invoiceId===invoice.id&&p.revision===revision.revision);if(existing)return existing;
      const tenant=domain.get('tenants',invoice.tenantId,actor),bytes=invoicePdf(invoice,revision,tenant);
      const asset=save(invoice.organizationId,invoice.tenantId,`invoice-${invoice.month}-v${revision.revision}.pdf`,'application/pdf',bytes);
      return store.add('pdfs',invoice.organizationId,{invoiceId:invoice.id,tenantId:invoice.tenantId,revision:revision.revision,fileAssetId:asset.id});
    },
    download(id,actor){const record=domain.get('files',id,actor);const bytes=store.db.prepare('SELECT content FROM files WHERE id=?').get(id);ensure(bytes,'File not found',404);return {...record,content:Buffer.from(bytes.content)};}
  };
}
