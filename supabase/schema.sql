-- Enable UUID generation extension (required for default UUID primary keys)
create extension if not exists "pgcrypto";

-- Folders table stores user-defined groups of SOAP notes
create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamp with time zone not null default timezone('utc', now()),
  updated_at timestamp with time zone not null default timezone('utc', now())
);

-- Documents table stores generated SOAP notes with optional folder association
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  title text not null default 'Untitled Note',
  content jsonb,
  created_at timestamp with time zone not null default timezone('utc', now()),
  updated_at timestamp with time zone not null default timezone('utc', now())
);

-- Update updated_at timestamps automatically
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_updated_at on public.folders;
create trigger handle_updated_at
before update on public.folders
for each row execute function public.handle_updated_at();

drop trigger if exists handle_updated_at_documents on public.documents;
create trigger handle_updated_at_documents
before update on public.documents
for each row execute function public.handle_updated_at();

-- Enable Row Level Security
alter table public.folders enable row level security;
alter table public.documents enable row level security;

-- Policies to restrict access to the owning user
drop policy if exists "Folders access for owner" on public.folders;
create policy "Folders access for owner"
  on public.folders
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Documents access for owner" on public.documents;
create policy "Documents access for owner"
  on public.documents
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

