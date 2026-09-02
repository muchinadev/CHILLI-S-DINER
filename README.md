# Chilli's Diner

A mobile-first food ordering and business-management platform for a
home-based food business in Kenya — customer ordering, order management,
payments (M-Pesa-ready), and an owner dashboard, built to run from a phone.

## Stack

- **Frontend:** Next.js (App Router) + React + TypeScript + Tailwind CSS
- **Database:** PostgreSQL, accessed directly over `DATABASE_URL` (this is
  what Supabase's database *is* — pointing `DATABASE_URL` at a Supabase
  project's connection string works with the exact same code)
- **Auth:** a self-contained signed-cookie admin session for now, designed
  to be swapped for Supabase Auth later without touching business logic
- **Payments:** a `PaymentProvider` interface with a `mock` implementation
  (simulates an M-Pesa STK push + async callback) so the app runs fully
  without live Safaricom Daraja credentials; a real `mpesa` provider slots
  in behind the same interface

## Getting started (local development)

1. A local Postgres 16 instance is expected at the connection string in
   `.env.local` (copy `.env.example` if you don't have one). Create the
   database and role once:

   ```bash
   sudo -u postgres psql -c "CREATE USER chillis WITH PASSWORD 'chillis_dev_pw' CREATEDB;"
   sudo -u postgres psql -c "CREATE DATABASE chillis_diner OWNER chillis;"
   ```

2. Apply the schema:

   ```bash
   psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
   ```

3. Install dependencies and seed demo data (Kenyan context, KSh currency —
   clearly fictional, no real payment credentials):

   ```bash
   npm install
   npm run seed
   ```

   This prints an admin login (`owner@chillisdiner.co.ke` /
   `ChilliAdmin123!`) and two sample order-tracking URLs.

4. Run the app:

   ```bash
   npm run dev
   ```

   - Customer site: <http://localhost:3000>
   - Admin dashboard: <http://localhost:3000/admin>

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build and run
- `npm run lint` — ESLint
- `npm run test` — Vitest unit tests (pricing, order status transitions,
  password hashing, checkout validation)
- `npm run seed` — reset and reseed demo data

## Architecture notes

- **Order totals are always server-calculated.** `src/lib/services/pricing.ts`
  re-fetches current product prices/stock from the database and recomputes
  the cart total from scratch — the browser only ever sends product IDs and
  quantities, never prices.
- **Payment status is only ever written by the payment service**
  (`src/lib/services/payment-service.ts`), never by a client claiming "I've
  paid". The mock provider simulates a provider webhook via a delayed
  callback, exactly like a real M-Pesa STK push confirmation would arrive.
- **Order status is a validated state machine** (`src/lib/data/orders.ts`),
  every transition is recorded in `order_status_history` with who made the
  change and when.
- **Historical pricing is preserved**: `order_items` snapshots the product
  name/price/cost at order time, so a later menu price change never alters
  a past order's total.
- Layers are separated: `lib/data` (SQL), `lib/services` (business logic /
  server actions), `lib/validation` (zod schemas), `lib/payments`
  (provider interface + implementations) — UI components stay free of
  business logic.

## What's built vs. what's next

Built: menu management, customer browsing + cart + checkout, order
management with a full status workflow, mock M-Pesa payments, and an
owner dashboard (today's orders, revenue, estimated costs/profit).

Not yet built (straightforward extensions of the same architecture):
customer segmentation/CRM views, delivery driver assignment, expense and
inventory UIs (the tables already exist in the schema), the analytics
dashboard beyond "today", notifications, and the AI business assistant.
