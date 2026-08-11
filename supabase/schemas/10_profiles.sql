-- Public mirror of auth.users.
-- The PK is the auth user id: only ever reference PRIMARY KEYS of
-- Supabase-managed tables, since those are the columns guaranteed stable.

create table public.profiles (
  id         uuid        not null references auth.users on delete cascade,
  username   text        unique,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

-- 1. PRIVILEGES — revoke first, then grant exactly what is needed.
--
-- The revoke is NOT redundant. Supabase ships ALTER DEFAULT PRIVILEGES in
-- schema `public` granting arwdDxtm (ALL) to anon/authenticated/service_role,
-- so a newly created table starts with TRUNCATE, TRIGGER and REFERENCES held
-- by anon. TRUNCATE is NOT filtered by row-level security — an anon role
-- holding it can empty the table regardless of any policy. Additive grants
-- cannot take that back; only an explicit revoke can.
--
-- Since 2026-05-30 new tables are also not auto-exposed to the Data API
-- (enforced everywhere 2026-10-30), so the grants below are what makes the
-- table reachable at all. Revoke, grants, RLS and policies ship together in
-- one file so a table can never be half-configured.
revoke all on public.profiles from anon, authenticated, service_role;

grant select                         on public.profiles to anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant all                            on public.profiles to service_role;

-- 2. RLS.
alter table public.profiles enable row level security;

-- 3. Policies.
--    * `to authenticated` short-circuits evaluation for anon.
--    * `(select auth.uid())` forces an initPlan so the function runs once per
--      statement instead of once per row.
--    * No index needed on `id` — it is the primary key.
create policy "profiles_select_all"
  on public.profiles for select to authenticated, anon
  using ( true );

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check ( (select auth.uid()) = id );

-- USING gates which rows may be updated; WITH CHECK gates the resulting row.
-- Postgres reuses USING as WITH CHECK when the latter is omitted on a single
-- UPDATE policy, so this is belt-and-braces rather than the only thing standing
-- between a user and rewriting the PK — but declare it anyway: it is required
-- as soon as the two expressions differ or a second policy is added.
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using      ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

create policy "profiles_delete_own"
  on public.profiles for delete to authenticated
  using ( (select auth.uid()) = id );

-- 4. updated_at maintenance.
--    `set search_path = ''` + fully-qualified names means a hijacked
--    search_path cannot redirect the write.
create function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Postgres grants EXECUTE to PUBLIC by default, which anon/authenticated
-- inherit. A SECURITY DEFINER function in `public` is otherwise a public API.
revoke execute on function public.set_updated_at() from anon, authenticated;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 5. Signup trigger. If this throws, ALL signups fail — exercise it on reset.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
