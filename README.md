# Work Bazar

On-demand local worker–recruiter platform. Phase 1 MVP: phone-OTP auth,
worker/recruiter registration, ₹99/month subscription, and basic dashboards.

## Stack

Next.js (App Router, TypeScript) with its own API routes, PostgreSQL via
Prisma, JWT session cookies (`jose`), Razorpay for payments.

## Getting started

```bash
npm install
docker compose up -d          # starts local Postgres on :5432
cp .env.example .env          # then edit if needed
npx prisma migrate dev        # creates the schema
npm run dev
```

Visit http://localhost:3000.

## Demo mode

No third-party keys are required to try the full flow locally:

- **OTP**: with `SMS_PROVIDER_API_KEY` unset, OTPs aren't actually sent —
  they're logged to the server console and shown directly on the OTP
  screen in the UI.
- **Payment**: with `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` unset,
  subscribing instantly marks the subscription `ACTIVE` without contacting
  Razorpay.

Set those env vars in `.env` to switch each one to the real integration.

## Project structure

```
prisma/schema.prisma       Data model (User, WorkerProfile, RecruiterProfile, Subscription, OtpCode)
src/app/                   Pages (App Router) + API routes under app/api
src/components/            Header, AuthForm (shared OTP flow for login/signup)
src/lib/                   prisma client, session (JWT cookies), otp, validation (zod), auth helpers
src/proxy.ts               Route protection for /dashboard, /register, /payment
```

## What's implemented (Phase 1)

- Phone OTP login/signup with role selection (Worker / Recruiter)
- Worker registration (skills, experience, availability, bank details)
- Recruiter registration (business details, service areas, hiring preferences)
- ₹99/month subscription (UPI / Card / QR selector, Razorpay-ready)
- Worker and Recruiter dashboards with profile summary and subscription status

## Not yet implemented (later phases per the product spec)

Distance-based worker/job search, job posting, in-app chat, applications
pipeline, admin panel, file uploads for certificates — these need their own
data model and UI and are natural next slices of work.
