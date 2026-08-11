-- The canonical "this row belongs to a user" pattern, end to end.
-- Copy this file as the template for new owned tables.

create table public.posts (
  id         uuid        not null default gen_random_uuid(),
  user_id    uuid        not null references public.profiles (id) on delete cascade,
  title      text        not null check (char_length(title) between 1 and 200),
  body       text,
  published  boolean     not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

-- REQUIRED: every column referenced by a policy that is not already a primary
-- key must be indexed, or each policy check degrades into a sequential scan.
create index posts_user_id_idx on public.posts using btree (user_id);
create index posts_published_created_at_idx
  on public.posts using btree (created_at desc) where published;

-- Revoke first — see the note in 10_profiles.sql. Without this, anon and
-- authenticated inherit TRUNCATE from Supabase's default privileges, and
-- TRUNCATE ignores RLS.
revoke all on public.posts from anon, authenticated, service_role;

grant select                         on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
grant all                            on public.posts to service_role;

alter table public.posts enable row level security;

-- Two permissive SELECT policies are OR'd by Postgres, which plans better than
-- a single policy with an `or` in the USING clause.
create policy "posts_select_published"
  on public.posts for select to authenticated, anon
  using ( published );

create policy "posts_select_own"
  on public.posts for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "posts_insert_own"
  on public.posts for insert to authenticated
  with check ( (select auth.uid()) = user_id );

-- USING says "the existing row must be mine"; WITH CHECK says "the resulting
-- row must still be mine".
--
-- Note: for a single UPDATE policy Postgres reuses USING as the WITH CHECK
-- expression when the latter is omitted, so leaving it off does NOT by itself
-- let a user hand a row to someone else (verified against this schema). It is
-- still declared explicitly here because it is required the moment USING and
-- WITH CHECK must differ, and because an additional permissive UPDATE policy
-- added later would otherwise widen what may be written.
create policy "posts_update_own"
  on public.posts for update to authenticated
  using      ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "posts_delete_own"
  on public.posts for delete to authenticated
  using ( (select auth.uid()) = user_id );

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();
