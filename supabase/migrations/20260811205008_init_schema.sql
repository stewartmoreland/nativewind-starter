-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

CREATE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE FUNCTION public.set_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE TABLE public.posts (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  user_id    uuid                     NOT NULL,
  title      text                     NOT NULL,
  body       text,
  published  boolean                  DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.posts
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_pkey PRIMARY KEY (id);

ALTER TABLE public.posts
  ADD CONSTRAINT posts_title_check CHECK (char_length(title) >= 1 AND char_length(title) <= 200);

-- Added by hand: pg-delta emits only GRANTs, because it models a new table as
-- starting with an empty ACL. It does not: Supabase's ALTER DEFAULT PRIVILEGES
-- in schema public grants arwdDxtm to anon/authenticated at CREATE TABLE time,
-- so without this REVOKE the additive GRANTs below leave anon holding TRUNCATE
-- (which RLS does NOT filter). Keep this in sync with supabase/schemas/.
REVOKE ALL ON public.posts FROM anon, authenticated, service_role;

GRANT SELECT ON public.posts TO anon;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.posts TO authenticated;

GRANT ALL ON public.posts TO service_role;

CREATE INDEX posts_published_created_at_idx ON public.posts (created_at DESC)
  WHERE published;

CREATE INDEX posts_user_id_idx ON public.posts (user_id);

CREATE TRIGGER posts_set_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY posts_delete_own ON public.posts
  FOR DELETE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY posts_insert_own ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY posts_select_own ON public.posts
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY posts_select_published ON public.posts
  FOR SELECT
  TO anon, authenticated
  USING (published);

CREATE POLICY posts_update_own ON public.posts
  FOR UPDATE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.profiles (
  id         uuid                     NOT NULL,
  username   text,
  full_name  text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE public.posts
  ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- Added by hand: pg-delta emits only GRANTs, because it models a new table as
-- starting with an empty ACL. It does not: Supabase's ALTER DEFAULT PRIVILEGES
-- in schema public grants arwdDxtm to anon/authenticated at CREATE TABLE time,
-- so without this REVOKE the additive GRANTs below leave anon holding TRUNCATE
-- (which RLS does NOT filter). Keep this in sync with supabase/schemas/.
REVOKE ALL ON public.profiles FROM anon, authenticated, service_role;

GRANT SELECT ON public.profiles TO anon;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.profiles TO authenticated;

GRANT ALL ON public.profiles TO service_role;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY profiles_delete_own ON public.profiles
  FOR DELETE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY profiles_select_all ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = id));