# Entruempler Angebotsrechner V1

Demo-ready, mobile-first cost estimation and inquiry tool for German decluttering and clearance businesses. Customers receive a non-binding price range, send a structured inquiry, and the business manages leads in a protected admin area with PDF summaries and editable pricing rules.

## Target audience

- Local entruempelung and clearance businesses in Germany
- Single-tenant installations for one company per deployment
- Demo, sales, and early production pilots where structured lead intake matters more than broad marketplace features

## Core product scope

- Public landing page with clear German customer copy
- Multi-step mobile-first calculator
- Central pricing engine with manual review detection
- Inquiry persistence with immutable calculation snapshots
- Admin login and protected admin area
- Dashboard, inquiry list, inquiry detail, and PDF export
- Editable pricing settings and company settings
- Local demo seed with believable Ruhrgebiet sample data

## Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- SQLite for local development and demo mode
- Zod validation
- pdf-lib for stable server-side PDF generation
- Vitest for focused domain tests

## Local setup

1. Copy `.env.example` to `.env`
2. Install dependencies
3. Bootstrap the local SQLite schema
4. Seed demo data
5. Start the app

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open:

- Landing page: `http://localhost:3000`
- Calculator: `http://localhost:3000/rechner`
- Admin login: `http://localhost:3000/admin/login`

## Environment variables

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="replace-with-a-long-random-string"
ADMIN_EMAIL="demo@klarraum-ruhr.de"
ADMIN_PASSWORD="ChangeMe123!"
```

Notes:

- `DATABASE_URL="file:./dev.db"` resolves to the local SQLite file used by Prisma.
- `SESSION_SECRET` should always be replaced outside local development.
- The seeded admin user is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Database workflow

The repository currently uses a checked-in SQL bootstrap for the first schema instead of `prisma migrate dev`.

Useful commands:

```bash
npm run db:migrate
npm run db:seed
npm run db:reset-demo
```

What they do:

- `db:migrate`: applies the checked-in initial schema SQL
- `db:seed`: upserts company settings, pricing data, admin user, and demo inquiries
- `db:reset-demo`: deletes the local SQLite file, recreates the schema, and reseeds the demo dataset

`prisma.config.ts` loads `.env` for Prisma CLI commands so local setup remains reproducible on this repository.

## Seeded demo content

The seed creates:

- Demo company: `Klarraum Entrümpelung Ruhr`
- Demo admin user from `.env`
- Active pricing profile for entruempelung jobs
- Four believable sample inquiries:
  - 58 m2 apartment, normal fill, 2nd floor
  - 140 m2 house with dismantling and kitchen removal
  - 85 m2 apartment with extreme fill and manual review flags
  - garage scenario with extra area and long walk distance

## Demo walkthrough

Recommended live demo flow:

1. Open the landing page and show the value proposition.
2. Start the calculator and enter a realistic apartment or house case.
3. Show the non-binding price range and manual review behavior.
4. Submit the inquiry and open the confirmation page.
5. Log into the admin area with the seeded credentials.
6. Open the new inquiry in the list and detail view.
7. Download the PDF summary.
8. Change a pricing value in `/admin/preise`.
9. Submit another inquiry and compare the new estimate with the older stored snapshot.

## Validation commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

See `QA_REPORT.md` for the latest hardening pass, checked flows, fixed failure paths, and remaining known risks.

## Production and deployment notes

### Current recommendation

For demos, pilots, and single-machine installs, the current stack is best suited to:

- a small Linux VM
- a Hetzner cloud server
- a single Docker host with persistent storage

### SQLite expectation

SQLite is intentionally kept for local development and demo simplicity. It is acceptable for a single-instance install, but not for multi-instance or serverless scaling.

For broader production rollout, move to PostgreSQL and keep the Prisma schema compatible during that migration.

### Docker

A Dockerfile is included for a single-container deployment with a persistent SQLite volume.

Example:

```bash
docker build -t entruempler-rechner .
docker run \
  -p 3000:3000 \
  -e SESSION_SECRET="replace-with-a-long-random-string" \
  -e ADMIN_EMAIL="demo@klarraum-ruhr.de" \
  -e ADMIN_PASSWORD="ChangeMe123!" \
  -e DATABASE_URL="file:/app/data/dev.db" \
  -v entruempler-data:/app/data \
  entruempler-rechner
```

### Hosting caveats

- Local file uploads are not implemented in this V1.
- PDF generation is server-side and does not rely on headless browser tooling.
- If deployed behind HTTPS, admin session cookies remain secure automatically.
- If run locally over plain HTTP, admin login still works for demo purposes.
- A Vercel-style serverless deployment is not the preferred target while the app depends on a local SQLite file.

## Known limitations

- No photo upload workflow yet
- No outbound e-mail notifications yet
- No advanced admin filtering, notes, or assignment workflow yet
- Initial schema bootstrapping still relies on checked-in SQL
- SQLite is best treated as local/demo or single-install storage
- Rate limiting and duplicate-submit protection are currently in-memory only

## Likely next improvements

- Calibrate pricing with real operating data from a target business
- Add admin list filters for status, postal code, and manual review
- Introduce PostgreSQL for broader deployment scenarios
- Add media uploads with constrained storage and abuse protection
- Add e-mail notifications or CRM handoff integrations
