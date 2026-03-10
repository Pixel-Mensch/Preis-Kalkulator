# Entruempler Angebotsrechner V1

Mobile-first web app for German decluttering and clearance businesses. Customers receive a non-binding estimate, submit an inquiry, and the business manages leads in a protected admin area.

## Stack

- Next.js App Router
- TypeScript
- Prisma
- SQLite for local development
- Zod
- PDF generation without browser automation

## Local setup

1. Copy `.env.example` to `.env`
2. Install dependencies
3. Run the local database bootstrap
4. Seed initial data
5. Start the dev server

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open:

- Public landing page: `http://localhost:3000`
- Calculator: `http://localhost:3000/rechner`
- Admin login: `http://localhost:3000/admin/login`

## Validation commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Initial admin access

- Email: value from `ADMIN_EMAIL`
- Password: value from `ADMIN_PASSWORD`

## Notes

- This product generates a `Kostenschaetzung`, not a legally binding universal offer.
- Each inquiry stores an immutable calculation snapshot so historical estimates remain reproducible after pricing changes.
- Photo uploads are intentionally deferred in this V1 because the cleanest version needs dedicated storage and stricter abuse controls.
- `npm run db:migrate` applies the checked-in initial SQLite schema via SQL bootstrap so local setup stays reproducible on this environment.
- The root control files are intentionally local-only and ignored by Git.
