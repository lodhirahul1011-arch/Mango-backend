# RoomRent backend

Standalone Node.js 24 API with persistent SQLite storage. Runtime dependencies are built into Node; no database service, npm packages, or Supabase credentials are required for live mode.

## Run

```sh
cd backend
npm start
```

API: `http://localhost:5000/api`. Health: `/api/health`.
From the repository root, `npm run dev` starts both services; `npm run dev:backend` starts just the backend. Copy `.env.example` to `.env` to customize ports, origins and storage.

The default database is `backend/data/roomrent.sqlite`. Documents, PDFs, accounts and sessions are stored in that database. Use a SQLite-aware backup process, or stop the service before copying its data directory.

## Accounts

Register at the frontend `/register` page. Passwords require at least 10 characters; there are no seeded accounts. Authentication uses scrypt hashes, hashed opaque session tokens, 15-minute access tokens, rotating 7-day refresh tokens and logout revocation.

To connect a tenant portal, the owner creates a property with applications enabled, adds a floor and room, and approves the registered tenant's application. Approval links the account to a tenant profile and creates the tenancy atomically.

The manual tenant-directory/direct-assignment flow creates managed records without a login link. Registering the same email later does not automatically claim those records. Use application/approval for connected tenant access; an invitation flow for pre-existing manual records is not implemented.

## API scope

All routes except health, register, login and refresh require a bearer access token. Records are scoped to the owner's organization or the tenant's linked profiles. Resource responses use `{data: ...}`; errors use `{error: {code, message}}`.

- Account registration, login, refresh, logout and current user.
- Properties, floors, rooms, tenants, occupancy overview and vacancy catalog.
- Enrollment approval/rejection, direct tenancy assignment, history and move-out.
- Monthly invoices, balances, immutable revisions, overdue penalties and private PDF archives.
- Payment submission/verification/rejection, ledger and monthly reconciliation.
- Maintenance requests with enforced status transitions.
- Deposits, deductions and settlement after move-out.
- Private document upload (PDF/JPEG/PNG, 10 MB maximum), download and owner review.
- In-app notifications and mark-read.

Currency uses integer paise. Rent is billed for the full month whenever a tenancy overlaps that month; no prorating is implemented. Deposits and payments record external transactions and do not transfer money. Penalties use the server's current UTC date. The current payment form submits proof metadata only; the document form uploads actual bytes. PDF snapshots use an ASCII font, replacing non-Latin characters with `?`.

## Verify

Run `npm test` here, or `npm run test:backend` from the root. Tests use isolated databases and cover roles, organization/tenant isolation, atomic approval rollback, payment allocation, invoice revisions, ledger arithmetic, private files, sessions, CORS and persistence after restart.

## Deploy separately

Deploy `backend/` to a Node.js 24 server with a persistent disk. Start command: `npm start`; health path: `/api/health`. Configure:

```dotenv
HOST=0.0.0.0
PORT=5000
ALLOWED_ORIGINS=https://your-frontend.example
DATABASE_PATH=/persistent-data/roomrent.sqlite
```

Alternatively build the included Dockerfile and mount persistent storage at `/app/data`. Use one service instance per database, with HTTPS at the host/reverse proxy. Ephemeral serverless storage and multiple replicas sharing the database are not supported.

Build the frontend with `NEXT_PUBLIC_ROOMRENT_API_MODE=live` and `NEXT_PUBLIC_ROOMRENT_API_URL=https://your-backend.example`. Changing these public variables requires a frontend rebuild.

Authentication is limited to 300 requests per socket IP per 15 minutes (`AUTH_IP_RATE_LIMIT`) and 30 login/registration attempts per normalized email. Refresh does not consume the email limit. Forwarded IP headers are not trusted; tune the bulk limit for a shared reverse proxy and enforce edge-level abuse limits there.

## Remaining modules

Admin/subscription management, change approvals, CCTV/device/telephony integrations, WhatsApp delivery, email verification/password reset and payment gateways are not implemented. The existing live UI marks unsupported modules unavailable.

Legacy Supabase files from an earlier implementation are intentionally not included in this standalone backend repository. The active API uses SQLite and does not require Supabase credentials.
