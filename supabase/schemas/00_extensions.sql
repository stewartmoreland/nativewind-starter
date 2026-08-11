-- Extensions live in the `extensions` schema, never in `public`.
create extension if not exists pgcrypto with schema extensions;
