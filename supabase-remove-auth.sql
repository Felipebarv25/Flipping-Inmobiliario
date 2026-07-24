-- Migration: Remove auth-based RLS, make all data public
-- Run this in Supabase SQL Editor

-- 1. Drop existing RLS policies on projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- 2. Drop existing RLS policies on project_images
DROP POLICY IF EXISTS "Users can view own project images" ON public.project_images;
DROP POLICY IF EXISTS "Users can insert own project images" ON public.project_images;
DROP POLICY IF EXISTS "Users can delete own project images" ON public.project_images;

-- 3. Open-access policies for projects
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public insert projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Public delete projects" ON public.projects FOR DELETE USING (true);

-- 4. Open-access policies for project_images
CREATE POLICY "Public read project_images" ON public.project_images FOR SELECT USING (true);
CREATE POLICY "Public insert project_images" ON public.project_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete project_images" ON public.project_images FOR DELETE USING (true);

-- 5. Make user_id nullable
ALTER TABLE public.projects ALTER COLUMN user_id DROP NOT NULL;

-- 6. Drop foreign key constraint on user_id
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;

-- 7. Update storage policies for unauthenticated access
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

CREATE POLICY "Anyone can upload project images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Anyone can delete project images" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-images');
