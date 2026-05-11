
-- app_settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings: read all" ON public.app_settings
  FOR SELECT USING (true);
CREATE POLICY "settings: admin insert" ON public.app_settings
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "settings: admin update" ON public.app_settings
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "settings: admin delete" ON public.app_settings
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit: admin read" ON public.audit_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "audit: authed insert" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions (status);
CREATE INDEX IF NOT EXISTS idx_submissions_updated_at ON public.submissions (updated_at DESC);

-- Audit role changes
CREATE OR REPLACE FUNCTION public.audit_user_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs(actor_id, action, entity, entity_id, metadata)
    VALUES (auth.uid(), 'role_granted', 'user_roles', NEW.id::text,
      jsonb_build_object('user_id', NEW.user_id, 'role', NEW.role));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs(actor_id, action, entity, entity_id, metadata)
    VALUES (auth.uid(), 'role_revoked', 'user_roles', OLD.id::text,
      jsonb_build_object('user_id', OLD.user_id, 'role', OLD.role));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_user_role_change ON public.user_roles;
CREATE TRIGGER trg_audit_user_role_change
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_user_role_change();

-- Audit settings updates
CREATE OR REPLACE FUNCTION public.audit_app_settings_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs(actor_id, action, entity, entity_id, metadata)
  VALUES (auth.uid(),
    CASE TG_OP WHEN 'INSERT' THEN 'setting_created' WHEN 'UPDATE' THEN 'setting_updated' ELSE 'setting_deleted' END,
    'app_settings',
    COALESCE(NEW.key, OLD.key),
    jsonb_build_object('value', COALESCE(NEW.value, OLD.value)));
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_app_settings ON public.app_settings;
CREATE TRIGGER trg_audit_app_settings
AFTER INSERT OR UPDATE OR DELETE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.audit_app_settings_change();

-- Audit submission status changes (on top of submission_status_history)
CREATE OR REPLACE FUNCTION public.audit_submission_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.audit_logs(actor_id, action, entity, entity_id, metadata)
    VALUES (auth.uid(), 'submission_status_changed', 'submissions', NEW.id::text,
      jsonb_build_object('from', OLD.status, 'to', NEW.status, 'title', NEW.title));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_submission_status ON public.submissions;
CREATE TRIGGER trg_audit_submission_status
AFTER UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.audit_submission_status();

-- Seed default settings
INSERT INTO public.app_settings(key, value) VALUES
  ('submission_pricing', jsonb_build_object(
    'journal_amount', 15000,
    'conference_amount', 20000,
    'currency', 'NGN',
    'note', 'Article processing charge payable on submission.'
  )),
  ('payment_account', jsonb_build_object(
    'bank_name', 'To be updated',
    'account_name', 'COOU Journal',
    'account_number', '0000000000',
    'instructions', 'Use your submission title as payment reference. Account details will be updated soon.'
  ))
ON CONFLICT (key) DO NOTHING;
