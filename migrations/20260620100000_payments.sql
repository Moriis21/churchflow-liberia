-- ─────────────────────────────────────────────────────────────
-- Payments / giving via Flutterwave (Mobile Money + cards)
-- Records every transaction; written server-side after verification.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id     UUID REFERENCES public.churches(id) ON DELETE SET NULL,
  user_id       UUID,                       -- payer (nullable: anonymous giving allowed)
  purpose       TEXT NOT NULL DEFAULT 'offering',  -- offering | tithe | subscription | donation | building_fund
  amount        NUMERIC(14,2) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'LRD',       -- LRD | USD
  status        TEXT NOT NULL DEFAULT 'pending',   -- pending | successful | failed
  provider      TEXT NOT NULL DEFAULT 'flutterwave',
  tx_ref        TEXT NOT NULL UNIQUE,              -- our reference, sent to Flutterwave
  flw_tx_id     TEXT,                              -- Flutterwave's transaction id
  payer_name    TEXT,
  payer_email   TEXT,
  payer_phone   TEXT,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_church_idx ON public.payments (church_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payments_txref_idx  ON public.payments (tx_ref);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Church staff can read their own church's payments.
DROP POLICY IF EXISTS payments_church_read ON public.payments;
CREATE POLICY payments_church_read ON public.payments
  FOR SELECT TO authenticated
  USING (
    church_id IN (SELECT church_id FROM public.user_profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- No client INSERT/UPDATE: rows are written by the verify edge function
-- (service role), so a user can never fake a "successful" payment.

-- Atomic upsert used by the verify edge function (SECURITY DEFINER).
CREATE OR REPLACE FUNCTION public.record_payment(
  p_tx_ref TEXT, p_church_id UUID, p_user_id UUID, p_purpose TEXT,
  p_amount NUMERIC, p_currency TEXT, p_status TEXT, p_flw_tx_id TEXT,
  p_payer_name TEXT, p_payer_email TEXT, p_payer_phone TEXT, p_note TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.payments
    (tx_ref, church_id, user_id, purpose, amount, currency, status, flw_tx_id, payer_name, payer_email, payer_phone, note)
  VALUES
    (p_tx_ref, p_church_id, p_user_id, p_purpose, p_amount, p_currency, p_status, p_flw_tx_id, p_payer_name, p_payer_email, p_payer_phone, p_note)
  ON CONFLICT (tx_ref) DO UPDATE
    SET status = EXCLUDED.status, flw_tx_id = EXCLUDED.flw_tx_id, updated_at = now();
END; $$;
