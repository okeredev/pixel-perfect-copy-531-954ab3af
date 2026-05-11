-- ============================================================
-- COOU Graduate Journal — COMPLETE Database Fix
-- Run this ENTIRE script in Lovable's SQL Editor
-- ============================================================

-- ============================================================
-- FIX 1: Grant execute on private schema functions
-- The private.has_role() and private.is_staff() functions are
-- called inside RLS policies but the authenticated role 
-- doesn't have permission to execute them.
-- ============================================================

GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated;

-- ============================================================
-- FIX 2: Submission creation (infinite RLS recursion)
-- The record_status_change() trigger fires on INSERT which 
-- causes circular RLS evaluation. Fix: separate triggers.
-- ============================================================

DROP TRIGGER IF EXISTS trg_submission_status_change ON public.submissions;
CREATE TRIGGER trg_submission_status_change
  AFTER UPDATE OF status ON public.submissions
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION public.record_status_change();

CREATE OR REPLACE FUNCTION public.handle_new_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.submission_status_history(
    submission_id, changed_by, from_status, to_status
  ) VALUES (
    NEW.id, NEW.owner_id, NULL, NEW.status
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_submission_initial_status ON public.submissions;
CREATE TRIGGER trg_submission_initial_status
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_submission();

REVOKE ALL ON FUNCTION public.handle_new_submission() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "History: trigger insert" ON public.submission_status_history;
CREATE POLICY "History: trigger insert" ON public.submission_status_history
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- FIX 3: Profile loading - ensure own-select works
-- ============================================================

DROP POLICY IF EXISTS "Profiles: own select" ON public.profiles;
CREATE POLICY "Profiles: own select" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR private.is_staff(auth.uid())
  );

-- ============================================================
-- FIX 4: Grant admin role to your account
-- IMPORTANT: Replace the email below with YOUR email address
-- ============================================================

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email = 'cryptobountiesupdates@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also grant admin to the test account
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email = 'testadmin@cooujournal.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================
-- FIX 5: BREAK INFINITE RLS RECURSION
-- ============================================================

-- 1. Helper to check if a user is a reviewer for a submission 
-- This bypasses RLS to break the circular dependency
CREATE OR REPLACE FUNCTION private.check_is_reviewer(_submission_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.submission_reviewers 
    WHERE submission_id = _submission_id AND reviewer_id = _user_id
  );
$$;

-- 2. Helper to check if a user is the owner of a submission
-- This bypasses RLS to break the circular dependency
CREATE OR REPLACE FUNCTION private.check_is_owner(_submission_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.submissions 
    WHERE id = _submission_id AND owner_id = _user_id
  );
$$;

GRANT EXECUTE ON FUNCTION private.check_is_reviewer(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.check_is_owner(uuid, uuid) TO authenticated;

-- 3. Update Submissions Policy (Select)
DROP POLICY IF EXISTS "Submissions: owner select" ON public.submissions;
CREATE POLICY "Submissions: owner select" ON public.submissions
  FOR SELECT USING (
    auth.uid() = owner_id
    OR private.is_staff(auth.uid())
    OR status = 'published'::public.submission_status
    OR private.check_is_reviewer(id, auth.uid())
  );

-- 4. Update Reviewers Policy (Select)
DROP POLICY IF EXISTS "Reviewers: read own or staff" ON public.submission_reviewers;
CREATE POLICY "Reviewers: read own or staff" ON public.submission_reviewers
  FOR SELECT USING (
    reviewer_id = auth.uid()
    OR private.is_staff(auth.uid())
    OR private.check_is_owner(submission_id, auth.uid())
  );

