# Operations Guide

## Supported Operating Model

This repository is prepared for a single running instance with:

- one application container or one Node.js process
- one SQLite file
- one admin user bootstrap path via environment variables

## Daily Checks

Verify:

- the app is reachable on the expected URL
- `/api/health` returns `ok` or at least `degraded`
- the admin login still works
- the database file exists and is writable

## Start, Stop, Restart

### Docker Compose

Start:

```bash
docker compose up -d
```

Stop:

```bash
docker compose down
```

Restart after config or image changes:

```bash
docker compose up -d --build
```

### Bare Metal

Start:

```bash
npm run start
```

Stop:

- stop the process manager or send `SIGTERM`

Restart:

- restart the supervising service or rerun `npm run start`

## Health and Diagnostics

Primary route:

```bash
curl http://localhost:3000/api/health
```

Interpretation:

- `ok`: application is healthy and ready for customer use
- `degraded`: runtime is alive, but customer-facing configuration is incomplete
- `error`: runtime validation or database access failed

The current rate-limit mode is reported as `memory-single-instance`. This is expected in V1.

## Backup Procedure

Recommended approach:

1. stop the app briefly
2. copy the SQLite file
3. restart the app

### Docker Compose

The default compose setup stores the SQLite file under `./data/dev.db` on the host.

Example:

```bash
docker compose stop app
mkdir -p backups
cp data/dev.db backups/dev-$(date +%F-%H%M%S).db
docker compose start app
```

### Bare Metal

Stop the service, then copy the SQLite file referenced by `DATABASE_URL`.

## Restore Procedure

1. stop the app
2. replace the current SQLite file with the chosen backup
3. ensure file permissions still allow the app to write
4. start the app
5. verify `/api/health`
6. log into `/admin` and spot-check a recent inquiry

Docker example:

```bash
docker compose stop app
cp backups/dev-2026-03-11-120000.db data/dev.db
docker compose start app
curl http://localhost:3000/api/health
```

## Admin Password Reset

1. update `.env`
2. change `ADMIN_EMAIL`, `ADMIN_PASSWORD`, or `ADMIN_NAME`
3. run:

```bash
npm run admin:sync
```

Docker Compose example:

```bash
docker compose exec app npm run admin:sync
```

This will update the stored admin user in place.

## Update Procedure

### Docker Compose

```bash
git pull
docker compose build
docker compose up -d
docker compose exec app npm run bootstrap:single-instance
curl http://localhost:3000/api/health
```

### Bare Metal

```bash
git pull
npm install
npm run build
npm run bootstrap:single-instance
npm run start
```

Important:

- keep SQL migrations additive and controlled
- create a database backup before every update
- verify the health route after every restart

## Recovery Notes

If the app fails during startup:

1. check `.env`
2. confirm `SESSION_SECRET` and admin credentials are valid
3. run `npm run db:migrate`
4. run `npm run bootstrap:single-instance`
5. inspect container or process logs
6. verify the SQLite file path and permissions

If the health route returns `degraded`:

- missing company settings: complete the admin form or provide all `COMPANY_*` values and rerun bootstrap
- missing pricing: rerun bootstrap or restore the pricing profile
- missing admin: rerun `npm run admin:sync`

## Known Operational Limits in V1

- no automatic scheduled backups
- no multi-user role management
- no in-app password change screen
- no persistent distributed rate limiting
- SQLite is not designed for multi-instance concurrency
