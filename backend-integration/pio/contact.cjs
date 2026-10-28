const express = require('express');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const TYPES = ['Become a Distributor', 'Become a Retailer', 'B2B / Institutional', 'General Consumer Feedback'];
const emailPattern = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/;
const cleanHeader = value => typeof value === 'string' && !/[\r\n\0]/.test(value);
function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw Error('validation');
  const data = {};
  for (const [key, limit] of Object.entries({name:100, phone:30, email:254, inquiryType:80, message:5000, website:200})) {
    const value = body[key] ?? '';
    if (typeof value !== 'string' || value.length > limit || (key !== 'message' && !cleanHeader(value))) throw Error('validation');
    data[key] = value.trim();
  }
  if (!data.name || !emailPattern.test(data.email) || !/^[+\d ()-]{7,30}$/.test(data.phone) || data.phone.replace(/\D/g, '').length < 7 || data.phone.replace(/\D/g, '').length > 15 || !TYPES.includes(data.inquiryType) || data.website) throw Error('validation');
  return data;
}
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function createMailer(env = process.env, dependencies = {}) {
  let transport;
  const fetcher = dependencies.fetch || globalThis.fetch;
  function config() {
    const mode = env.CONTACT_MAIL_PROVIDER || 'smtp';
    const to = env.CONTACT_EMAIL;
    if (!cleanHeader(to) || !emailPattern.test(to)) throw Error('configuration');
    if (!['smtp','resend','emailjs'].includes(mode)) throw Error('configuration');
    if (mode === 'emailjs') {
      const {EMAILJS_SERVICE_ID: serviceId, EMAILJS_TEMPLATE_ID: templateId, EMAILJS_PUBLIC_KEY: publicKey, EMAILJS_PRIVATE_KEY: privateKey} = env;
      if (![serviceId,templateId,publicKey,privateKey].every(value => typeof value === 'string' && value.trim())) throw Error('configuration');
      return {mode,to,serviceId,templateId,publicKey,privateKey};
    }
    const from = env.MAIL_FROM;
    if (!cleanHeader(from) || !from || !emailPattern.test((from.match(/<([^<>]+)>$/) || [null,from])[1])) throw Error('configuration');
    if (mode === 'resend') {
      if (!env.RESEND_API_KEY) throw Error('configuration');
      return {mode,from,to};
    }
    const host = env.SMTP_HOST || env.MAIL_HOST;
    const user = env.SMTP_USER || env.MAIL_USER;
    const pass = env.SMTP_PASS || env.MAIL_PASS;
    const port = Number(env.SMTP_PORT || env.MAIL_PORT || 587);
    const secure = env.SMTP_SECURE ?? env.MAIL_SECURE ?? String(port === 465);
    if (!host || !user || !pass || ![465,587].includes(port) || secure !== String(port === 465)) throw Error('configuration');
    if (!transport) transport = (dependencies.createTransport || nodemailer.createTransport)({host,port,secure:port===465,requireTLS:port===587,auth:{user,pass},tls:{rejectUnauthorized:true},dnsTimeout:15000,connectionTimeout:15000,greetingTimeout:15000,socketTimeout:20000});
    return {mode,from,to};
  }
  return {
    async verify() {
      const cfg=config();
      if (cfg.mode === 'smtp') await transport.verify();
      return cfg.mode;
    },
    async send(data) {
      const cfg=config();
      const subject='PIO Website - New '+({'Become a Distributor':'Distributor Enquiry','Become a Retailer':'Retailer Enquiry','B2B / Institutional':'B2B Enquiry','General Consumer Feedback':'Consumer Feedback'}[data.inquiryType]);
      if (cfg.mode === 'emailjs') {
        const response=await fetcher('https://api.emailjs.com/api/v1.0/email/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
          service_id:cfg.serviceId,
          template_id:cfg.templateId,
          user_id:cfg.publicKey,
          accessToken:cfg.privateKey,
          template_params:{
            to_email:cfg.to,
            name:data.name,
            email:data.email,
            phone:data.phone,
            inquiry_type:data.inquiryType,
            message:data.message || '(Not provided)',
            reply_to:data.email,
            subject,
            submitted_at:new Date().toISOString(),
          },
        }),signal:AbortSignal.timeout(20000)});
        if (!response.ok) throw Error('provider');
      } else {
        const rows=[['Name',data.name],['Phone',data.phone],['Email',data.email],['Enquiry purpose',data.inquiryType],['Message',data.message || '(Not provided)'],['Submitted at (UTC)',new Date().toISOString()]];
        const mail={from:cfg.from,to:cfg.to,replyTo:data.email,subject,text:rows.map(([k,v])=>k+': '+v).join('\n'),html:'<h2>PIO website enquiry</h2>'+rows.map(([k,v])=>'<p><b>'+k+':</b> '+escapeHtml(v).replace(/\n/g,'<br>')+'</p>').join('')};
        if (cfg.mode === 'resend') {
          const {replyTo,...payload}=mail;
          const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({...payload,to:[cfg.to],reply_to:replyTo}),signal:AbortSignal.timeout(20000)});
          const result=await response.json();
          if (!response.ok || !result.id) throw Error('provider');
        } else {
          const result=await transport.sendMail(mail);
          if (!result.accepted?.some(address => String(typeof address==='string'?address:address.address).toLowerCase()===cfg.to.toLowerCase())) throw Error('provider');
        }
      }
      return {emailStatus:'accepted'};
    }
  };
}
function createRouter({mailer=createMailer(), max=5} = {}) {
  const router=express.Router();
  router.use(rateLimit({windowMs:15*60*1000,max,standardHeaders:true,legacyHeaders:false,message:{message:'Too many enquiries. Please try again later.'}}));
  router.use(express.json({limit:'12kb'}));
  router.post('/',async(req,res)=>{
    let data;
    try { data=validate(req.body); } catch { return res.status(400).json({message:'Please check your name, phone, email and enquiry details.'}); }
    try { await mailer.send(data); return res.status(200).json({emailStatus:'accepted'}); }
    catch { return res.status(503).json({emailStatus:'failed',message:'Email service unavailable. Please try again or call our helpline.'}); }
  });
  router.use((err,req,res,next)=>res.status(err.type==='entity.too.large'?413:400).json({message:'Invalid request body.'}));
  return router;
}
module.exports={validate,createMailer,createRouter};
