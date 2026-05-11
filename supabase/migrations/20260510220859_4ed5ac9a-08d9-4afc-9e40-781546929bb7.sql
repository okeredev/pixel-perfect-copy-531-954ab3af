-- Add supplementary file kind
ALTER TYPE public.file_kind ADD VALUE IF NOT EXISTS 'supplementary';

-- Seed default app settings (admin can edit via /admin Settings)
INSERT INTO public.app_settings (key, value) VALUES
  ('submission_pricing', '{"journal_amount": 20000, "conference_amount": 25000, "currency": "NGN", "note": "Non-refundable processing fee. Required before manuscript upload."}'::jsonb),
  ('payment_account', '{"bank_name": "Update in Admin Settings", "account_name": "COOU Graduate Journal", "account_number": "0000000000", "instructions": "After payment, upload your receipt/screenshot under the Payment section. Manuscript and supplementary files become available once payment evidence is uploaded."}'::jsonb)
ON CONFLICT (key) DO NOTHING;