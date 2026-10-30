-- Naalya Secondary School, Bweyogerere Campus: admissions enquiry store and staff access.
--
-- STATUS: DRAFT. Not applied to any Supabase project. Apply only after the school has approved
-- storage, privacy text, retention period and staff access in writing (see docs/DAY4-ENQUIRY.md
-- and docs/DAY5-STAFF-DASHBOARD.md).
--
-- Identity: staff sign in with Clerk. Supabase must be configured to accept Clerk session tokens
-- (Third-party auth). In that setup auth.jwt() ->> 'sub' is the Clerk user id (user_...).
--
-- Design rules:
-- * Anonymous visitors cannot read, insert, update or delete anything.
-- * Public inserts come only from the website server, using the service role key kept in server env vars.
-- * Active staff with role 'admissions' or 'admin' can read enquiries and change status only.
-- * Only role 'admin' (the Headmaster account) can delete an enquiry. Enforced by RLS, not the screen.
-- * Staff cannot edit what the parent wrote (column grants).
-- * retain_until is intentionally left empty until the school sets its retention period.

create table if not exists public.staff_profiles (
  user_id text primary key check (user_id ~ '^user_[A-Za-z0-9]+$'),
  role text not null check (role in ('admissions', 'admin')),
  full_name text check (full_name is null or char_length(full_name) <= 120),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^ENQ-[0-9]{8}-[0-9A-F]{8}$'),
  parent_name text not null check (char_length(parent_name) between 2 and 80),
  phone text not null check (phone ~ '^\+256[1-9][0-9]{8}$'),
  email text check (email is null or (char_length(email) between 3 and 254 and email like '%@%.%')),
  desired_level text not null check (desired_level in ('O-Level', 'A-Level')),
  learner_age smallint not null check (learner_age between 10 and 25),
  preferred_intake text not null check (preferred_intake in ('next-available', 'not-sure')),
  question text check (question is null or char_length(question) <= 500),
  consent_given boolean not null check (consent_given = true),
  consent_notice_version text not null check (char_length(consent_notice_version) between 1 and 64),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'visit-scheduled', 'enrolled', 'withdrawn')),
  source text not null default 'website' check (source in ('website', 'test')),
  created_at timestamptz not null default now(),
  contacted_at timestamptz,
  handled_at timestamptz,
  handled_by text check (handled_by is null or handled_by ~ '^user_[A-Za-z0-9]+$'),
  retain_until timestamptz
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx on public.enquiries (status);

alter table public.staff_profiles enable row level security;
alter table public.enquiries enable row level security;

-- Start from zero access for the public API roles.
revoke all on public.enquiries from anon, authenticated;
revoke all on public.staff_profiles from anon, authenticated;

-- Helper: is the signed-in Clerk user an active staff member with one of the allowed roles?
create or replace function public.is_enquiry_staff(allowed text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_profiles s
    where s.user_id = (select auth.jwt() ->> 'sub')
      and s.active
      and s.role = any (allowed)
  );
$$;

-- Supabase grants EXECUTE on new public functions to anon by default, so revoke it explicitly.
revoke all on function public.is_enquiry_staff(text[]) from public, anon;
grant execute on function public.is_enquiry_staff(text[]) to authenticated;

-- Staff can read enquiries, change status and handling fields, and (admin only, below) delete.
grant select on public.enquiries to authenticated;
grant update (status, contacted_at, handled_at, handled_by) on public.enquiries to authenticated;
grant delete on public.enquiries to authenticated;

create policy enquiries_staff_select
  on public.enquiries for select to authenticated
  using ((select public.is_enquiry_staff(array['admissions', 'admin'])));

create policy enquiries_staff_update
  on public.enquiries for update to authenticated
  using ((select public.is_enquiry_staff(array['admissions', 'admin'])))
  with check ((select public.is_enquiry_staff(array['admissions', 'admin'])));

-- Only the Headmaster account (role 'admin') may delete. Admissions gets zero rows affected.
create policy enquiries_admin_delete
  on public.enquiries for delete to authenticated
  using ((select public.is_enquiry_staff(array['admin'])));

-- Staff can see their own profile row. Only an admin (via SQL, reviewed by the school) changes roles.
grant select on public.staff_profiles to authenticated;

create policy staff_profiles_self_select
  on public.staff_profiles for select to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));
