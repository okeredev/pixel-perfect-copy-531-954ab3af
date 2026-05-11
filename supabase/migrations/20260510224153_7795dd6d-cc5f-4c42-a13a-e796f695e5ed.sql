
-- Reviewer table FIRST
CREATE TABLE IF NOT EXISTS public.submission_reviewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  assigned_by UUID,
  status TEXT NOT NULL DEFAULT 'assigned',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, reviewer_id)
);
CREATE INDEX IF NOT EXISTS idx_sub_reviewers_reviewer ON public.submission_reviewers(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_sub_reviewers_submission ON public.submission_reviewers(submission_id);
ALTER TABLE public.submission_reviewers ENABLE ROW LEVEL SECURITY;

-- Private schema for helpers
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'));
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM PUBLIC, anon, authenticated;

-- Rebuild app policies
DROP POLICY IF EXISTS "Profiles: own select" ON public.profiles;
CREATE POLICY "Profiles: own select" ON public.profiles
  FOR SELECT USING ((auth.uid() = id) OR private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Roles: read own" ON public.user_roles;
CREATE POLICY "Roles: read own" ON public.user_roles
  FOR SELECT USING ((auth.uid() = user_id) OR private.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Roles: admin insert" ON public.user_roles;
CREATE POLICY "Roles: admin insert" ON public.user_roles
  FOR INSERT WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Roles: admin delete" ON public.user_roles;
CREATE POLICY "Roles: admin delete" ON public.user_roles
  FOR DELETE USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "settings: admin insert" ON public.app_settings;
CREATE POLICY "settings: admin insert" ON public.app_settings
  FOR INSERT WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "settings: admin update" ON public.app_settings;
CREATE POLICY "settings: admin update" ON public.app_settings
  FOR UPDATE USING (private.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "settings: admin delete" ON public.app_settings;
CREATE POLICY "settings: admin delete" ON public.app_settings
  FOR DELETE USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "audit: admin read" ON public.audit_logs;
CREATE POLICY "audit: admin read" ON public.audit_logs
  FOR SELECT USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Submissions: owner select" ON public.submissions;
CREATE POLICY "Submissions: owner select" ON public.submissions
  FOR SELECT USING (
    auth.uid() = owner_id
    OR private.is_staff(auth.uid())
    OR status = 'published'::public.submission_status
    OR EXISTS (SELECT 1 FROM public.submission_reviewers r
               WHERE r.submission_id = submissions.id AND r.reviewer_id = auth.uid())
  );
DROP POLICY IF EXISTS "Submissions: owner update (pre-accept)" ON public.submissions;
CREATE POLICY "Submissions: owner update (pre-accept)" ON public.submissions
  FOR UPDATE USING (
    ((auth.uid() = owner_id) AND (status = ANY (ARRAY['draft','submitted','revisions_requested','rejected']::public.submission_status[])))
    OR private.is_staff(auth.uid())
  );
DROP POLICY IF EXISTS "Submissions: staff delete" ON public.submissions;
CREATE POLICY "Submissions: staff delete" ON public.submissions
  FOR DELETE USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Authors: select" ON public.submission_authors;
CREATE POLICY "Authors: select" ON public.submission_authors
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_authors.submission_id
      AND (s.owner_id = auth.uid() OR private.is_staff(auth.uid()) OR s.status = 'published'::public.submission_status)
  ));

DROP POLICY IF EXISTS "Files: select" ON public.submission_files;
CREATE POLICY "Files: select" ON public.submission_files
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_files.submission_id
      AND (s.owner_id = auth.uid() OR private.is_staff(auth.uid())
           OR EXISTS (SELECT 1 FROM public.submission_reviewers r
                      WHERE r.submission_id = s.id AND r.reviewer_id = auth.uid()))
  ));

DROP POLICY IF EXISTS "History: select" ON public.submission_status_history;
CREATE POLICY "History: select" ON public.submission_status_history
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_status_history.submission_id
      AND (s.owner_id = auth.uid() OR private.is_staff(auth.uid()))
  ));

DROP POLICY IF EXISTS "Comments: read" ON public.submission_comments;
CREATE POLICY "Comments: read" ON public.submission_comments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_comments.submission_id
      AND (s.owner_id = auth.uid() OR private.is_staff(auth.uid())
           OR EXISTS (SELECT 1 FROM public.submission_reviewers r
                      WHERE r.submission_id = s.id AND r.reviewer_id = auth.uid()))
  ));
DROP POLICY IF EXISTS "Comments: insert" ON public.submission_comments;
CREATE POLICY "Comments: insert" ON public.submission_comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = submission_comments.submission_id
        AND (s.owner_id = auth.uid() OR private.is_staff(auth.uid())
             OR EXISTS (SELECT 1 FROM public.submission_reviewers r
                        WHERE r.submission_id = s.id AND r.reviewer_id = auth.uid()))
    )
  );
DROP POLICY IF EXISTS "Comments: delete own or staff" ON public.submission_comments;
CREATE POLICY "Comments: delete own or staff" ON public.submission_comments
  FOR DELETE USING (auth.uid() = author_id OR private.is_staff(auth.uid()));

CREATE POLICY "Reviewers: read own or staff" ON public.submission_reviewers
  FOR SELECT USING (
    reviewer_id = auth.uid()
    OR private.is_staff(auth.uid())
    OR EXISTS (SELECT 1 FROM public.submissions s
               WHERE s.id = submission_reviewers.submission_id AND s.owner_id = auth.uid())
  );
CREATE POLICY "Reviewers: staff insert" ON public.submission_reviewers
  FOR INSERT WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Reviewers: staff or self update" ON public.submission_reviewers
  FOR UPDATE USING (private.is_staff(auth.uid()) OR reviewer_id = auth.uid());
CREATE POLICY "Reviewers: staff delete" ON public.submission_reviewers
  FOR DELETE USING (private.is_staff(auth.uid()));

-- Drop ALL existing storage policies for these two buckets, then recreate
DROP POLICY IF EXISTS "Submissions storage: owner read" ON storage.objects;
DROP POLICY IF EXISTS "Submissions storage: owner write" ON storage.objects;
DROP POLICY IF EXISTS "Submissions storage: owner delete" ON storage.objects;
DROP POLICY IF EXISTS "submissions: owner read" ON storage.objects;
DROP POLICY IF EXISTS "submissions: owner insert" ON storage.objects;
DROP POLICY IF EXISTS "submissions: owner update" ON storage.objects;
DROP POLICY IF EXISTS "submissions: owner delete" ON storage.objects;
DROP POLICY IF EXISTS "payment-evidence: owner read" ON storage.objects;
DROP POLICY IF EXISTS "payment-evidence: owner insert" ON storage.objects;
DROP POLICY IF EXISTS "payment-evidence: owner update" ON storage.objects;
DROP POLICY IF EXISTS "payment-evidence: owner delete" ON storage.objects;

CREATE POLICY "submissions: select own or staff" ON storage.objects FOR SELECT
  USING (bucket_id='submissions' AND (auth.uid()::text = (storage.foldername(name))[1] OR private.is_staff(auth.uid())));
CREATE POLICY "submissions: insert own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id='submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "submissions: update own or staff" ON storage.objects FOR UPDATE
  USING (bucket_id='submissions' AND (auth.uid()::text = (storage.foldername(name))[1] OR private.is_staff(auth.uid())));
CREATE POLICY "submissions: delete own or staff" ON storage.objects FOR DELETE
  USING (bucket_id='submissions' AND (auth.uid()::text = (storage.foldername(name))[1] OR private.is_staff(auth.uid())));

CREATE POLICY "payment-evidence: select own or staff" ON storage.objects FOR SELECT
  USING (bucket_id='payment-evidence' AND (auth.uid()::text = (storage.foldername(name))[1] OR private.is_staff(auth.uid())));
CREATE POLICY "payment-evidence: insert own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id='payment-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "payment-evidence: update own or staff" ON storage.objects FOR UPDATE
  USING (bucket_id='payment-evidence' AND (auth.uid()::text = (storage.foldername(name))[1] OR private.is_staff(auth.uid())));
CREATE POLICY "payment-evidence: delete own or staff" ON storage.objects FOR DELETE
  USING (bucket_id='payment-evidence' AND (auth.uid()::text = (storage.foldername(name))[1] OR private.is_staff(auth.uid())));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_staff(uuid);

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.audit_submission_status() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.audit_user_role_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.audit_app_settings_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_status_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
