create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  role text not null check (role in ('Admin', 'Manager', 'Staff')),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  reference_name text,
  cnic text unique not null,
  mobile_number text not null,
  alternate_mobile text,
  address text,
  photo_url text,
  cnic_front_url text,
  cnic_back_url text,
  guarantor_details text,
  status text not null default 'Active' check (status in ('Active', 'Defaulter', 'Closed')),
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  category text not null,
  purchase_price numeric(12,2) not null,
  cash_price numeric(12,2) not null,
  installment_price numeric(12,2) not null,
  down_payment numeric(12,2) not null,
  profit_amount numeric(12,2) not null,
  installments_count integer not null,
  monthly_installment_amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists installment_plans (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  product_id uuid not null references products(id),
  total_amount numeric(12,2) not null,
  down_payment numeric(12,2) not null,
  profit_amount numeric(12,2) not null,
  duration_months integer not null check (duration_months in (6, 12, 18)),
  monthly_due_day integer not null check (monthly_due_day between 1 and 28),
  remaining_balance numeric(12,2) not null,
  status text not null default 'Active' check (status in ('Active', 'Closed', 'Overdue')),
  created_at timestamptz not null default now()
);

create table if not exists installments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references installment_plans(id) on delete cascade,
  due_month integer not null check (due_month between 1 and 12),
  due_year integer not null,
  installment_amount numeric(12,2) not null,
  received_amount numeric(12,2) not null default 0,
  pending_amount numeric(12,2) not null,
  payment_date date,
  late_fine numeric(12,2) not null default 0,
  signature_url text,
  status text not null default 'Unpaid' check (status in ('Paid', 'Unpaid', 'Partial')),
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  installment_id uuid not null references installments(id) on delete cascade,
  amount_paid numeric(12,2) not null,
  fine_paid numeric(12,2) not null default 0,
  receipt_no text,
  paid_at timestamptz not null default now(),
  notes text
);

create table if not exists fines (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references installment_plans(id) on delete cascade,
  days_late integer not null,
  fine_rate numeric(12,2) not null,
  total_fine numeric(12,2) not null,
  waived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount numeric(12,2) not null,
  expense_date date not null,
  branch_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  branch_name text not null,
  address text,
  phone text,
  created_at timestamptz not null default now()
);
