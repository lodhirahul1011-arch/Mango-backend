# PIO website and contact API

One repository, one Netlify site. The React website is in frontend/ and the Express contact API runs as netlify/functions/api.cjs.

## Deployment
Connect lodhirahul1011-arch/Mango-backend (main) to Netlify. Keep the base directory at the repository root. netlify.toml sets build command npm run build, publish directory frontend/dist and functions directory netlify/functions.

Set these server environment variables in Netlify with Functions scope:
- CONTACT_MAIL_PROVIDER=emailjs
- CONTACT_EMAIL (recipient address)
- EMAILJS_SERVICE_ID
- EMAILJS_TEMPLATE_ID=template_rosujl5
- EMAILJS_PUBLIC_KEY
- EMAILJS_PRIVATE_KEY

Never commit .env files or put secrets in VITE_ variables. VITE_CONTACT_API_BASE_URL is no longer used by this combined frontend: all contact requests use the current site's /api/pio/contact endpoint. Redeploy after environment changes.

GET /api/health returns JSON. POST /api/pio/contact validates enquiries before sending mail. API rewrites precede the frontend fallback, so API failures are not turned into HTML success pages. The in-memory enquiry rate limit is per function instance, not global across Netlify instances.

## Local development
Run npm ci and npm --prefix frontend ci. Put mail settings in the root .env. Run npm run dev:api and npm run dev in separate terminals. Vite proxies /api to localhost:5000.

npm test runs API and Netlify handler tests. npm --prefix frontend run typecheck checks frontend types. npm run build builds the website. npm run mail:verify validates provider configuration without sending mail.

Previous RoomRent sources are preserved; npm run start:roomrent runs that separate application. They are not part of the Netlify deployment.
