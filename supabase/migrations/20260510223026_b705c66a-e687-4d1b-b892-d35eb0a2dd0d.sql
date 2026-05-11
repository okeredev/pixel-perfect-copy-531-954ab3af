
-- Payment status enum
DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'confirmed', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add payment_status to submissions
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS payment_status public.payment_status NOT NULL DEFAULT 'pending';

-- Allow owner to also edit when rejected (not just draft/submitted/revisions_requested)
DROP POLICY IF EXISTS "Submissions: owner update (pre-accept)" ON public.submissions;
CREATE POLICY "Submissions: owner update (pre-accept)" ON public.submissions
  FOR UPDATE USING (
    ((auth.uid() = owner_id) AND (status = ANY (ARRAY['draft','submitted','revisions_requested','rejected']::submission_status[])))
    OR is_staff(auth.uid())
  );

-- Same for files (owner can re-upload after rejection)
DROP POLICY IF EXISTS "Files: owner delete" ON public.submission_files;
CREATE POLICY "Files: owner delete" ON public.submission_files
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM submissions s
    WHERE s.id = submission_files.submission_id AND s.owner_id = auth.uid()
      AND s.status = ANY (ARRAY['draft','submitted','revisions_requested','rejected']::submission_status[])
  ));

DROP POLICY IF EXISTS "Authors: owner delete" ON public.submission_authors;
CREATE POLICY "Authors: owner delete" ON public.submission_authors
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM submissions s
    WHERE s.id = submission_authors.submission_id AND s.owner_id = auth.uid()
      AND s.status = ANY (ARRAY['draft','submitted','revisions_requested','rejected']::submission_status[])
  ));

DROP POLICY IF EXISTS "Authors: owner update" ON public.submission_authors;
CREATE POLICY "Authors: owner update" ON public.submission_authors
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM submissions s
    WHERE s.id = submission_authors.submission_id AND s.owner_id = auth.uid()
      AND s.status = ANY (ARRAY['draft','submitted','revisions_requested','rejected']::submission_status[])
  ));

-- Comments thread between authors and staff
CREATE TABLE IF NOT EXISTS public.submission_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  is_staff BOOLEAN NOT NULL DEFAULT false,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_comments_sub ON public.submission_comments(submission_id, created_at);

ALTER TABLE public.submission_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments: read" ON public.submission_comments;
CREATE POLICY "Comments: read" ON public.submission_comments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_comments.submission_id
      AND (s.owner_id = auth.uid() OR public.is_staff(auth.uid()))
  ));

DROP POLICY IF EXISTS "Comments: insert" ON public.submission_comments;
CREATE POLICY "Comments: insert" ON public.submission_comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = submission_comments.submission_id
        AND (s.owner_id = auth.uid() OR public.is_staff(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Comments: delete own or staff" ON public.submission_comments;
CREATE POLICY "Comments: delete own or staff" ON public.submission_comments
  FOR DELETE USING (auth.uid() = author_id OR public.is_staff(auth.uid()));
