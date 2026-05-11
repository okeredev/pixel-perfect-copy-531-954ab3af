-- ============================================================
-- COOU Graduate Journal — PUBLIC ACCESS FIX
-- Run this in Lovable's SQL Editor
-- ============================================================

-- 1. Ensure the published_at column exists
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='published_at') THEN
    ALTER TABLE public.submissions ADD COLUMN published_at TIMESTAMPTZ;
  END IF;
END $$;

-- 2. Allow public (anon) access to published submissions
DROP POLICY IF EXISTS "Submissions: public select published" ON public.submissions;
CREATE POLICY "Submissions: public select published" ON public.submissions
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

-- 3. Allow public access to authors of published submissions
DROP POLICY IF EXISTS "Authors: public select published" ON public.submission_authors;
CREATE POLICY "Authors: public select published" ON public.submission_authors
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_authors.submission_id
      AND s.status = 'published'
  ));

-- 4. Allow public access to manuscript files of published submissions
DROP POLICY IF EXISTS "Files: public select published" ON public.submission_files;
CREATE POLICY "Files: public select published" ON public.submission_files
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_files.submission_id
      AND s.status = 'published'
  ));
