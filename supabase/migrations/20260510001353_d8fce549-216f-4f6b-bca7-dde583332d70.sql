
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','editor','reviewer','author');
CREATE TYPE public.submission_type AS ENUM ('journal','conference');
CREATE TYPE public.submission_status AS ENUM (
  'draft','submitted','under_review','revisions_requested',
  'accepted','rejected','withdrawn','published'
);
CREATE TYPE public.conference_stage AS ENUM ('abstract','full_paper');
CREATE TYPE public.file_kind AS ENUM (
  'manuscript','cover_letter','payment_evidence',
  'conference_abstract','conference_full_paper','revision','other'
);

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text,
  affiliation text,
  country text,
  orcid text,
  phone text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES (separate table - security critical) ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','editor')
  );
$$;

-- ============ SUBMISSIONS ============
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.submission_type NOT NULL,
  conference_stage public.conference_stage,
  title text NOT NULL,
  abstract text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  track text,
  status public.submission_status NOT NULL DEFAULT 'draft',
  decision_notes text,
  submitted_at timestamptz,
  published_at timestamptz,
  doi text,
  volume text,
  issue text,
  page_range text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_submissions_owner ON public.submissions(owner_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_type ON public.submissions(type);

-- ============ AUTHORS ============
CREATE TABLE public.submission_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 1,
  full_name text NOT NULL,
  email text NOT NULL,
  affiliation text,
  orcid text,
  is_corresponding boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.submission_authors ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_authors_submission ON public.submission_authors(submission_id);

-- ============ FILES ============
CREATE TABLE public.submission_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  kind public.file_kind NOT NULL,
  storage_path text NOT NULL,
  filename text NOT NULL,
  mime_type text,
  size_bytes bigint,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_files_submission ON public.submission_files(submission_id);

-- ============ STATUS HISTORY ============
CREATE TABLE public.submission_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  from_status public.submission_status,
  to_status public.submission_status NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.submission_status_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_history_submission ON public.submission_status_history(submission_id);

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_submissions_updated BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ Status history auto-record ============
CREATE OR REPLACE FUNCTION public.record_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.submission_status_history(submission_id, changed_by, from_status, to_status)
    VALUES (NEW.id, NEW.owner_id, NULL, NEW.status);
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.submission_status_history(submission_id, changed_by, from_status, to_status)
    VALUES (NEW.id, auth.uid(), OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_submission_status_change
  AFTER INSERT OR UPDATE OF status ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.record_status_change();

-- ============ New-user handler ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'author');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS POLICIES ============

-- profiles: users see/update their own; staff see all
CREATE POLICY "Profiles: own select" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_staff(auth.uid()));
CREATE POLICY "Profiles: own update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles: own insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- user_roles: users can read their own roles; only admins can manage
CREATE POLICY "Roles: read own" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Roles: admin insert" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Roles: admin delete" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- submissions: owner CRUD on own; staff read all; everyone reads published
CREATE POLICY "Submissions: owner select" ON public.submissions
  FOR SELECT USING (
    auth.uid() = owner_id
    OR public.is_staff(auth.uid())
    OR status = 'published'
  );
CREATE POLICY "Submissions: owner insert" ON public.submissions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Submissions: owner update (pre-accept)" ON public.submissions
  FOR UPDATE USING (
    (auth.uid() = owner_id AND status IN ('draft','submitted','revisions_requested'))
    OR public.is_staff(auth.uid())
  );
CREATE POLICY "Submissions: staff delete" ON public.submissions
  FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- submission_authors: owner & staff
CREATE POLICY "Authors: select" ON public.submission_authors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id
            AND (s.owner_id = auth.uid() OR public.is_staff(auth.uid()) OR s.status='published'))
  );
CREATE POLICY "Authors: owner insert" ON public.submission_authors
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.owner_id = auth.uid())
  );
CREATE POLICY "Authors: owner update" ON public.submission_authors
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.owner_id = auth.uid()
            AND s.status IN ('draft','submitted','revisions_requested'))
  );
CREATE POLICY "Authors: owner delete" ON public.submission_authors
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.owner_id = auth.uid()
            AND s.status IN ('draft','submitted','revisions_requested'))
  );

-- submission_files: same access pattern
CREATE POLICY "Files: select" ON public.submission_files
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id
            AND (s.owner_id = auth.uid() OR public.is_staff(auth.uid())))
  );
CREATE POLICY "Files: owner insert" ON public.submission_files
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.owner_id = auth.uid())
  );
CREATE POLICY "Files: owner delete" ON public.submission_files
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.owner_id = auth.uid()
            AND s.status IN ('draft','submitted','revisions_requested'))
  );

-- status history: owner read own, staff read all
CREATE POLICY "History: select" ON public.submission_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id
            AND (s.owner_id = auth.uid() OR public.is_staff(auth.uid())))
  );

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions','submissions', false)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-evidence','payment-evidence', false)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies: files live under {submission_id}/{filename};
-- owners can read/write within their own submission folder; staff can read all.
CREATE POLICY "Submissions storage: owner read"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('submissions','payment-evidence')
  AND (
    public.is_staff(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id::text = (storage.foldername(name))[1]
        AND s.owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Submissions storage: owner write"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('submissions','payment-evidence')
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id::text = (storage.foldername(name))[1]
      AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "Submissions storage: owner delete"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('submissions','payment-evidence')
  AND EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id::text = (storage.foldername(name))[1]
      AND s.owner_id = auth.uid()
      AND s.status IN ('draft','submitted','revisions_requested')
  )
);
