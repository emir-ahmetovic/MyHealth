# MyHealth

MyHealth is a healthcare appointment booking platform built with Next.js and Prisma. It lets patients find clinics and doctors, view available time slots, and book appointments. The project targets private clinics in Bosnia and Herzegovina and includes clinic/doctor management, patient accounts, appointments, medical records and a searchable clinics directory.

**Key features:**
- Clinic & doctor listing and search
- Patient registration, authentication and profiles
- Book appointments and view upcoming visits
- Time slots, doctor schedules and availability exceptions
- Clinic gallery, contact information and specialties
- Admin logs, notifications and basic review system

**Tech stack:**
- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- Radix UI for primitives
- lucide-react, date-fns, zod and other utilities

## Quick start (local)

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables (create a `.env` file):

Required (typical):

- `DATABASE_URL` — Postgres connection string
- `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000`
- Any other env vars used by your deployment (JWT secret, SMTP, etc.)

3. Run database migrations and seed (Postgres must be reachable):

```bash
npx prisma migrate dev
node prisma/seed-timeslots.js   # optional: provided seeds
node prisma/seed-clinic-types-bosnian.js
```

4. Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

## Scripts

- `npm run dev` — run Next.js in development
- `npm run build` — build for production
- `npm run start` — run built app
- `npm run lint` — run linter

## Database

The project uses Prisma with a PostgreSQL datasource. Schema lives in `prisma/schema.prisma`. If you change the schema run:

```bash
npx prisma generate
npx prisma migrate dev --name your_change
```

There are seed scripts in the `prisma/` folder to populate clinic types and time slots used for development.

## Where to look in the code

- `src/app/page.tsx` — landing page (hero, search, featured clinics)
- `src/components/shared/` — core UI blocks (search, featured clinics, booking)
- `src/server/db.ts` — Prisma client instance
- `prisma/` — schema and seed scripts

## Notes

- The UI is internationalized (Bosnian/English) and primarily written in Bosnian.
- Environment-specific secrets (JWT, DATABASE_URL, SMTP) must be created before running production builds.

If you'd like, I can also add a short screenshot, CI/deploy instructions, or example `.env` file. 
