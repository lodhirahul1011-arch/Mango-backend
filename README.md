# PIO contact backend

Render repository: lodhirahul1011-arch/Mango-backend, branch main.
Root Directory: empty. Build: npm ci. Start: npm start.
Docker deployments also start the PIO API through the updated Dockerfile.

GET /api/health returns {"status":"ok","service":"pio-backend"}.
POST /api/pio/contact accepts name, phone, email, inquiryType, message, and optional website honeypot.
OPTIONS /api/pio/contact supports the public frontend without cookies. Other routes are not exposed by this entrypoint.

Set mail credentials in Render Environment, never in Git. See .env.example. Set TRUST_PROXY_HOPS=1 for Render's proxy. SMTP ports 465/587 are blocked on Render Free; use a supported HTTPS provider (CONTACT_MAIL_PROVIDER=emailjs or resend) or SMTP-capable paid hosting. EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY and EMAILJS_PRIVATE_KEY are required for emailjs. CONTACT_EMAIL controls the recipient. Resend requires RESEND_API_KEY and authorized MAIL_FROM.

Frontend Render variable: VITE_CONTACT_API_BASE_URL=https://mango-backend-1wwy.onrender.com. Rebuild frontend after setting it.

npm test verifies PIO API and CORS. npm run mail:verify checks configuration/SMTP without sending email.
Previous RoomRent sources are preserved; npm run start:roomrent explicitly runs that application. The default deployed service is now PIO.

TDD evidence: tests were copied and executed before implementation; RED was missing app.cjs/contact.cjs. After porting the tested PIO implementation, npm test validates the API and cross-origin preflight. Live delivery requires deployment environment configuration.

## Netlify backend
Connect this repository to the backend Netlify site. The root netlify.toml builds the API function and publishes public/. Routes: GET /api/health and POST /api/pio/contact.
Set CONTACT_MAIL_PROVIDER=emailjs, CONTACT_EMAIL, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID=template_rosujl5, EMAILJS_PUBLIC_KEY and EMAILJS_PRIVATE_KEY in Netlify environment variables with Functions scope, then deploy. Never put private keys in VITE_ variables.
Set the frontend build environment VITE_CONTACT_API_BASE_URL=https://celadon-griffin-9382dd.netlify.app and rebuild the frontend. netlify.toml in the frontend repository applies only when the frontend is built on Netlify; a Render frontend requires this value in Render Environment.
The in-memory enquiry rate limit applies per function instance, not globally across Netlify instances.
