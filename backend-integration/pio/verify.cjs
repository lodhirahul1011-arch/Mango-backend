require('dotenv').config();
const {createMailer}=require('./contact.cjs');
createMailer().verify().then(mode=>console.log(mode==='smtp'?'SMTP connection and authentication verified; no email sent.':'HTTPS provider configuration checked only; authorize sender and test delivery separately.')).catch(()=>{console.error('Mail verification failed. Check server mail configuration and provider connectivity.');process.exitCode=1;});
