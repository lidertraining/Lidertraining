-- ============================================================
-- Lead classification & WhatsApp tracking
-- ============================================================

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS category text
    CHECK (category IS NULL OR category IN ('familia', 'amigo_proximo', 'conhecido', 'profissional', 'desconhecido'));

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS temperatura text
    CHECK (temperatura IS NULL OR temperatura IN ('quente', 'morno', 'frio'));

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS whatsapp_status text
    CHECK (whatsapp_status IS NULL OR whatsapp_status IN ('ativo', 'inativo', 'desconhecido'))
    DEFAULT 'desconhecido';

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS score_icp integer
    CHECK (score_icp IS NULL OR (score_icp >= 0 AND score_icp <= 100));

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS classification_tags text[] DEFAULT ARRAY[]::text[];

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS classification_evidencias jsonb DEFAULT '[]'::jsonb;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS classification_confidence integer
    CHECK (classification_confidence IS NULL OR (classification_confidence >= 0 AND classification_confidence <= 100));

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_leads_user_category
  ON leads(user_id, category)
  WHERE category IS NOT NULL AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_leads_user_temperatura
  ON leads(user_id, temperatura)
  WHERE temperatura IS NOT NULL AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_leads_user_archived
  ON leads(user_id, archived_at)
  WHERE archived_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS lead_whatsapp_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  phone text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  result text CHECK (result IN ('opened', 'invalid', 'unknown')) DEFAULT 'unknown',
  template_used text,
  responded boolean DEFAULT false,
  responded_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_wa_attempts_user_lead
  ON lead_whatsapp_attempts(user_id, lead_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_wa_attempts_user_phone
  ON lead_whatsapp_attempts(user_id, phone);

ALTER TABLE lead_whatsapp_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users see own wa attempts" ON lead_whatsapp_attempts;
CREATE POLICY "users see own wa attempts"
  ON lead_whatsapp_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
