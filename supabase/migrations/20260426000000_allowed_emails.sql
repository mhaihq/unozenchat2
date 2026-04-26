-- Allowed emails table: only these emails can register
create table if not exists allowed_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Only admins (service role) can write; anon can read to check at signup
alter table allowed_emails enable row level security;

create policy "Anyone can check if their email is allowed"
  on allowed_emails for select
  using (true);

create policy "Only service role can insert"
  on allowed_emails for insert
  with check (auth.role() = 'service_role');

create policy "Only service role can delete"
  on allowed_emails for delete
  using (auth.role() = 'service_role');
