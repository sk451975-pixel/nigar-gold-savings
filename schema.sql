-- Nigar Gems & Jewellers v3 database
create extension if not exists pgcrypto;

create sequence if not exists public.receipt_seq start 1;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('admin','staff')),
  phone text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, role) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'staff')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin','staff'));
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.schemes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_months integer not null check(duration_months in (7,12,24)),
  installment_amount numeric(12,2) not null check(installment_amount > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(name, duration_months, installment_amount)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  customer_code text not null unique,
  full_name text not null,
  phone text not null,
  email text,
  address text,
  id_number text,
  scheme_id uuid references public.schemes(id),
  start_date date not null default current_date,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  receipt_no text not null unique default ('NGJ-' || to_char(current_date,'YYYYMMDD') || '-' || lpad(nextval('public.receipt_seq')::text,5,'0')),
  amount numeric(12,2) not null check(amount > 0),
  payment_mode text not null check(payment_mode in ('Cash','UPI','Bank','Card')),
  payment_date timestamptz not null default now(),
  remarks text,
  created_by uuid references auth.users(id),
  whatsapp_status text not null default 'pending' check(whatsapp_status in ('pending','sent','failed','not_configured')),
  created_at timestamptz not null default now()
);

create index if not exists customers_phone_idx on public.customers(phone);
create index if not exists customers_code_idx on public.customers(customer_code);
create index if not exists payments_customer_idx on public.payments(customer_id);
create index if not exists payments_date_idx on public.payments(payment_date desc);

insert into public.schemes(name,duration_months,installment_amount) values
('Nigar Arambh',7,1000),
('Nigar Arambh',7,2000),
('Nigar Arambh',7,3000),
('Nigar Arambh',7,5000),
('Nigar Arambh',7,10000),
('Nigar Arambh',7,20000),
('Nigar Arambh',7,25000),
('Nigar Arambh',7,30000),
('Nigar Arambh',7,35000),
('Nigar Arambh',7,50000),
('Nigar Arambh',7,100000),
('Nigar Arambh',7,200000),
('Nigar Arambh',12,1000),
('Nigar Arambh',12,2000),
('Nigar Arambh',12,3000),
('Nigar Arambh',12,5000),
('Nigar Arambh',12,10000),
('Nigar Arambh',12,20000),
('Nigar Arambh',12,25000),
('Nigar Arambh',12,30000),
('Nigar Arambh',12,35000),
('Nigar Arambh',12,50000),
('Nigar Arambh',12,100000),
('Nigar Arambh',12,200000),
('Nigar Arambh',24,1000),
('Nigar Arambh',24,2000),
('Nigar Arambh',24,3000),
('Nigar Arambh',24,5000),
('Nigar Arambh',24,10000),
('Nigar Arambh',24,20000),
('Nigar Arambh',24,25000),
('Nigar Arambh',24,30000),
('Nigar Arambh',24,35000),
('Nigar Arambh',24,50000),
('Nigar Arambh',24,100000),
('Nigar Arambh',24,200000),
('Nigar Unnati',7,1000),
('Nigar Unnati',7,2000),
('Nigar Unnati',7,3000),
('Nigar Unnati',7,5000),
('Nigar Unnati',7,10000),
('Nigar Unnati',7,20000),
('Nigar Unnati',7,25000),
('Nigar Unnati',7,30000),
('Nigar Unnati',7,35000),
('Nigar Unnati',7,50000),
('Nigar Unnati',7,100000),
('Nigar Unnati',7,200000),
('Nigar Unnati',12,1000),
('Nigar Unnati',12,2000),
('Nigar Unnati',12,3000),
('Nigar Unnati',12,5000),
('Nigar Unnati',12,10000),
('Nigar Unnati',12,20000),
('Nigar Unnati',12,25000),
('Nigar Unnati',12,30000),
('Nigar Unnati',12,35000),
('Nigar Unnati',12,50000),
('Nigar Unnati',12,100000),
('Nigar Unnati',12,200000),
('Nigar Unnati',24,1000),
('Nigar Unnati',24,2000),
('Nigar Unnati',24,3000),
('Nigar Unnati',24,5000),
('Nigar Unnati',24,10000),
('Nigar Unnati',24,20000),
('Nigar Unnati',24,25000),
('Nigar Unnati',24,30000),
('Nigar Unnati',24,35000),
('Nigar Unnati',24,50000),
('Nigar Unnati',24,100000),
('Nigar Unnati',24,200000),
('Nigar Sikhar',7,1000),
('Nigar Sikhar',7,2000),
('Nigar Sikhar',7,3000),
('Nigar Sikhar',7,5000),
('Nigar Sikhar',7,10000),
('Nigar Sikhar',7,20000),
('Nigar Sikhar',7,25000),
('Nigar Sikhar',7,30000),
('Nigar Sikhar',7,35000),
('Nigar Sikhar',7,50000),
('Nigar Sikhar',7,100000),
('Nigar Sikhar',7,200000),
('Nigar Sikhar',12,1000),
('Nigar Sikhar',12,2000),
('Nigar Sikhar',12,3000),
('Nigar Sikhar',12,5000),
('Nigar Sikhar',12,10000),
('Nigar Sikhar',12,20000),
('Nigar Sikhar',12,25000),
('Nigar Sikhar',12,30000),
('Nigar Sikhar',12,35000),
('Nigar Sikhar',12,50000),
('Nigar Sikhar',12,100000),
('Nigar Sikhar',12,200000),
('Nigar Sikhar',24,1000),
('Nigar Sikhar',24,2000),
('Nigar Sikhar',24,3000),
('Nigar Sikhar',24,5000),
('Nigar Sikhar',24,10000),
('Nigar Sikhar',24,20000),
('Nigar Sikhar',24,25000),
('Nigar Sikhar',24,30000),
('Nigar Sikhar',24,35000),
('Nigar Sikhar',24,50000),
('Nigar Sikhar',24,100000),
('Nigar Sikhar',24,200000)
on conflict (name,duration_months,installment_amount) do nothing;

alter table public.profiles enable row level security;
alter table public.schemes enable row level security;
alter table public.customers enable row level security;
alter table public.payments enable row level security;

drop policy if exists profiles_self on public.profiles;
drop policy if exists profiles_admin on public.profiles;
create policy profiles_self on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_admin on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists schemes_staff on public.schemes;
create policy schemes_staff on public.schemes for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists customers_staff on public.customers;
create policy customers_staff on public.customers for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists payments_staff on public.payments;
create policy payments_staff on public.payments for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Keep updated_at current.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists customers_touch on public.customers;
create trigger customers_touch before update on public.customers for each row execute procedure public.touch_updated_at();

-- After creating your first Auth user, make that user the admin:
-- update public.profiles set role='admin' where id = 'PASTE_AUTH_USER_UUID_HERE';
