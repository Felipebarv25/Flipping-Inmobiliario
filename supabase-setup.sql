-- Run this in Supabase SQL Editor (left menu > SQL Editor > New query)

-- 1. Projects table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  address text default '',
  city text default '',
  barrio text default '',
  estrato integer,
  area integer,
  rooms integer,
  baths integer,
  matricula text default '',
  status text default 'prospecto' check (status in ('prospecto','negociando','comprado','en-obra','en-venta','vendido')),
  notes text default '',
  date_acquisition date,
  date_obra_start date,
  date_obra_end date,
  date_publication date,
  date_sold date,
  financials jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Project images table
create table public.project_images (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  url text not null,
  order_index integer default 0,
  created_at timestamptz default now()
);

-- 3. Row Level Security (only see your own data)
alter table public.projects enable row level security;
alter table public.project_images enable row level security;

create policy "Users can view own projects" on public.projects
  for select using (auth.uid() = user_id);

create policy "Users can insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update own projects" on public.projects
  for update using (auth.uid() = user_id);

create policy "Users can delete own projects" on public.projects
  for delete using (auth.uid() = user_id);

create policy "Users can view own project images" on public.project_images
  for select using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

create policy "Users can insert own project images" on public.project_images
  for insert with check (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

create policy "Users can delete own project images" on public.project_images
  for delete using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

-- 4. Storage bucket for images
insert into storage.buckets (id, name, public) values ('project-images', 'project-images', true);

create policy "Anyone can view project images" on storage.objects
  for select using (bucket_id = 'project-images');

create policy "Authenticated users can upload" on storage.objects
  for insert with check (bucket_id = 'project-images' and auth.role() = 'authenticated');

create policy "Authenticated users can delete" on storage.objects
  for delete using (bucket_id = 'project-images' and auth.role() = 'authenticated');
