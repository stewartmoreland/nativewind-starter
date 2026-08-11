-- RLS assertions.
--
-- These MUST run as the `authenticated` / `anon` roles with a JWT claim set.
-- Running them as postgres or service_role proves nothing: both hold BYPASSRLS,
-- so every policy appears to pass. `supabase db reset` and the Studio SQL
-- editor are also privileged.
--
-- Run: yarn db:test-rls

\set ON_ERROR_STOP on

do $$
declare
  ada  uuid;
  alan uuid;
  n    int;
begin
  select id into ada  from public.profiles where username = 'ada';
  select id into alan from public.profiles where username = 'alan';
  if ada is null or alan is null then
    raise exception 'Seed data missing — run `yarn db:seed-auth` first';
  end if;

  -- ---------------------------------------------------------------------
  -- (0) POSITIVE CONTROLS. Without these the whole suite passes vacuously if
  --     the JWT claim stops reaching auth.uid() — every "cannot read" check
  --     would succeed simply because the role can read nothing at all.
  -- ---------------------------------------------------------------------
  set local role authenticated;
  perform set_config('request.jwt.claims',
    json_build_object('sub', ada, 'role', 'authenticated')::text, true);

  if auth.uid() is distinct from ada then
    raise exception 'HARNESS BROKEN: auth.uid()=% expected %', auth.uid(), ada;
  end if;

  select count(*) into n from public.posts where user_id = ada;
  if n <> 2 then
    raise exception 'HARNESS BROKEN: Ada sees % of her own posts, expected 2', n;
  end if;

  -- ---------------------------------------------------------------------
  -- (i) A cannot read B's draft.
  -- ---------------------------------------------------------------------
  set local role authenticated;
  perform set_config('request.jwt.claims',
    json_build_object('sub', ada, 'role', 'authenticated')::text, true);

  select count(*) into n from public.posts
   where user_id = alan and not published;
  if n <> 0 then
    raise exception 'RLS FAIL (i): Ada read % of Alan''s drafts', n;
  end if;

  -- ---------------------------------------------------------------------
  -- (ii) A cannot transfer a row to B. This is what WITH CHECK prevents;
  --      with only USING, the update silently succeeds and the row is gone.
  -- ---------------------------------------------------------------------
  begin
    update public.posts set user_id = alan where user_id = ada;
    get diagnostics n = row_count;
    if n > 0 then
      raise exception 'RLS FAIL (ii): transferred % row(s) to another user', n;
    end if;
  exception
    when insufficient_privilege then null;  -- expected
  end;

  -- ---------------------------------------------------------------------
  -- (iii) A cannot insert a row owned by B.
  -- ---------------------------------------------------------------------
  begin
    insert into public.posts (user_id, title) values (alan, 'forged');
    raise exception 'RLS FAIL (iii): inserted a row owned by another user';
  exception
    when insufficient_privilege then null;  -- expected
  end;

  -- ---------------------------------------------------------------------
  -- (iv) anon sees published rows only, and cannot write.
  -- ---------------------------------------------------------------------
  reset role;
  set local role anon;
  perform set_config('request.jwt.claims', null, true);

  select count(*) into n from public.posts where not published;
  if n <> 0 then
    raise exception 'RLS FAIL (iv): anon read % draft(s)', n;
  end if;

  -- Positive control for anon: the published rows MUST be visible.
  select count(*) into n from public.posts where published;
  if n <> 2 then
    raise exception 'HARNESS BROKEN: anon sees % published posts, expected 2', n;
  end if;

  begin
    insert into public.posts (user_id, title) values (ada, 'anon write');
    raise exception 'RLS FAIL (iv): anon inserted a row';
  exception
    when insufficient_privilege then null;  -- expected
  end;

  -- ---------------------------------------------------------------------
  -- (v) anon must not hold TRUNCATE. TRUNCATE is NOT filtered by RLS, so a
  --     grant here empties the table regardless of every policy above.
  -- ---------------------------------------------------------------------
  reset role;
  if has_table_privilege('anon', 'public.posts', 'TRUNCATE')
     or has_table_privilege('authenticated', 'public.posts', 'TRUNCATE') then
    raise exception 'RLS FAIL (v): TRUNCATE granted to anon/authenticated';
  end if;

  raise notice 'All RLS assertions passed.';
end $$;
