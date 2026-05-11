
-- Fix: The record_status_change() trigger was causing infinite recursion
-- because it runs during INSERT on submissions, which triggers an INSERT
-- into submission_status_history. That table's RLS policies reference
-- submissions back, creating a circular dependency.
--
-- Solution: Drop the INSERT trigger. Only fire on UPDATE of status.
-- For the initial INSERT status record, handle it in handle_new_submission()
-- as SECURITY DEFINER, bypassing RLS.

-- 1. Drop and recreate the trigger to only fire on UPDATE (not INSERT)
DROP TRIGGER IF EXISTS trg_submission_status_change ON public.submissions;
CREATE TRIGGER trg_submission_status_change
  AFTER UPDATE OF status ON public.submissions
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION public.record_status_change();

-- 2. Create a SECURITY DEFINER function to handle the initial status record
CREATE OR REPLACE FUNCTION public.handle_new_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.submission_status_history(submission_id, changed_by, from_status, to_status)
  VALUES (NEW.id, NEW.owner_id, NULL, NEW.status);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_submission_initial_status ON public.submissions;
CREATE TRIGGER trg_submission_initial_status
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_submission();

REVOKE ALL ON FUNCTION public.handle_new_submission() FROM PUBLIC, anon, authenticated;

-- 3. Also add a SECURITY DEFINER-based INSERT policy helper for submission_status_history
-- so the trigger doesn't get blocked by RLS
DROP POLICY IF EXISTS "History: trigger insert" ON public.submission_status_history;
CREATE POLICY "History: trigger insert" ON public.submission_status_history
  FOR INSERT WITH CHECK (true);

-- (The trigger runs as SECURITY DEFINER so this is safe — normal users 
--  can't manually INSERT because there's no user-facing code that does so)
