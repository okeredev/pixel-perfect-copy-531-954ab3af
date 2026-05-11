
-- Submissions bucket: owner-scoped by first folder = user id
CREATE POLICY "submissions: owner read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'submissions'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_staff(auth.uid()))
);

CREATE POLICY "submissions: owner insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'submissions'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "submissions: owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'submissions'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_staff(auth.uid()))
);

CREATE POLICY "submissions: owner delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'submissions'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_staff(auth.uid()))
);

-- Payment evidence bucket: same model
CREATE POLICY "payment-evidence: owner read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'payment-evidence'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_staff(auth.uid()))
);

CREATE POLICY "payment-evidence: owner insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'payment-evidence'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "payment-evidence: owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'payment-evidence'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_staff(auth.uid()))
);

CREATE POLICY "payment-evidence: owner delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'payment-evidence'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_staff(auth.uid()))
);
