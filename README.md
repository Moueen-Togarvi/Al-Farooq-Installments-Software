# Al Farooq Installments Software

A **minimal, readable, and light-mode only** installment management starter built with:

- SvelteKit
- Tailwind CSS
- PostgreSQL (Neon-ready)

## Features included (UI + structure)

- Dashboard KPIs
- Customer management form
- Product management form
- Installment plan creation form
- Installment tracking table + payment area
- Reports cards + export actions
- Settings page for optional integrations
- Mobile responsive navigation and layout
- Accessible semantic HTML and focus states

## Setup

> Note: if your environment blocks npm registry access, install dependencies in a network-enabled environment.

```bash
npm install
npm run dev
```

## Neon / PostgreSQL

1. Copy environment file:

```bash
cp .env.example .env
```

2. Set your Neon connection string in `.env`.
3. Run SQL schema at `database/schema.sql`.

## Data model

Core tables:

- users
- customers
- products
- installment_plans
- installments
- payments
- fines
- expenses
- branches

## Core calculations to implement in server actions/APIs

- `profit = installment_price - purchase_price`
- `remaining_balance = total_amount - sum(payments)`
- `days_late = current_date - due_date`
- `fine = days_late * fine_rate`

## Suggested next steps

- Add server actions for CRUD operations
- Add authentication and role-based permissions
- Add PDF receipt generation
- Add SMS/WhatsApp reminders
- Add audit logs and backup tools
