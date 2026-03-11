# Deployment Guide

## Scope

This project is prepared for a single customer installation on:

- a small Linux server with Docker and Docker Compose
- a small Linux host with Node.js 20 as a fallback

The recommended target is Docker Compose with a host-mounted SQLite file.

## Required Inputs Before Installation

The customer or project owner should provide:

- company name and contact details
- service area wording
- estimate disclaimer wording
- final pricing values
- admin email address
- initial admin password
- domain or subdomain target
- reverse proxy / TLS decision

## Required Environment Variables

Use `.env.example` as the starting point.

Required in production:

- `DATABASE_URL`
- `SESSION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

Optional during bootstrap:

- `COMPANY_NAME`
- `COMPANY_EMAIL`
- `COMPANY_PHONE`
- `COMPANY_WEBSITE`
- `COMPANY_STREET`
- `COMPANY_POSTAL_CODE`
- `COMPANY_CITY`
- `COMPANY_SERVICE_AREA_NOTE`
- `COMPANY_ESTIMATE_FOOTNOTE`
- `COMPANY_SUPPORT_HOURS`

Rules:

- `SESSION_SECRET` must be a real secret with at least 32 characters.
- `ADMIN_PASSWORD` must not remain the default demo password.
- Either provide all required `COMPANY_*` values for bootstrap or none of them.

## Recommended Docker Compose Installation

1. Install Docker and Docker Compose on the host.
2. Copy the repository to the server.
3. Create the runtime directories:

```bash
mkdir -p data
```

4. Copy and edit the environment file:

```bash
cp .env.example .env
```

5. Adjust at least:

```env
SESSION_SECRET="replace-this-with-a-real-random-secret"
ADMIN_EMAIL="admin@customer-domain.de"
ADMIN_PASSWORD="replace-this-with-a-real-password"
ADMIN_NAME="Administrator"
```

6. Build and start the container:

```bash
docker compose build
docker compose up -d
```

7. Run the one-time bootstrap:

```bash
docker compose exec app npm run bootstrap:single-instance
```

8. Verify health:

```bash
curl http://localhost:3000/api/health
```

Expected result:

- `status: "ok"` for a customer-ready installation
- `status: "degraded"` if admin, pricing, or company setup is still incomplete

## Bare-Metal Node.js Installation

This is supported for a small host, but Docker remains the preferred path.

1. Install Node.js 20 and npm.
2. Copy the repository to the server.
3. Create `.env`.
4. Use an explicit database file path outside the repository, for example:

```env
DATABASE_URL="file:/var/lib/entruempler-angebotsrechner/app.db"
```

5. Install dependencies:

```bash
npm install
```

6. Build the app:

```bash
npm run build
```

7. Run bootstrap once:

```bash
npm run bootstrap:single-instance
```

8. Start the app:

```bash
npm run start
```

Notes:

- The current single-instance operational scripts are TypeScript-based, so the fallback Node deployment uses the full install and not an `--omit=dev` production-only install.
- For persistent operation, place the process behind systemd or another supervisor.

## First Login and Password Process

The first admin account is created or updated from the environment:

- `npm run bootstrap:single-instance`
- `npm run admin:sync`

Use this process for:

- initial admin creation
- password reset
- admin email replacement

There is currently no in-app password change flow. This is acceptable for the current single-instance delivery but should be improved later.

## Health Check

Route:

```text
/api/health
```

Checks included:

- runtime environment validity
- database access
- company settings present
- active pricing profile present
- admin user present

The route is intended for single-instance diagnostics and basic uptime monitoring.

## Update Flow

Docker Compose:

```bash
git pull
docker compose build
docker compose up -d
docker compose exec app npm run bootstrap:single-instance
curl http://localhost:3000/api/health
```

Bare metal:

```bash
git pull
npm install
npm run build
npm run bootstrap:single-instance
npm run start
```

## Current Production Limits

- single tenant only
- SQLite only for the first live installation
- in-memory rate limiting only
- no background jobs
- no email delivery
- no file uploads
- no multi-instance coordination
