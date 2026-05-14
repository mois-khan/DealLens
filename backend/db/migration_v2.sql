-- Run this in your Supabase SQL Editor to fix the "column does not exist" errors
-- and make the dashboard buttons functional.

-- 1. Add missing columns to 'analyses' table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='status') THEN
        ALTER TABLE analyses ADD COLUMN status text NOT NULL DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='category') THEN
        ALTER TABLE analyses ADD COLUMN category text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='short_description') THEN
        ALTER TABLE analyses ADD COLUMN short_description text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='founder_email') THEN
        ALTER TABLE analyses ADD COLUMN founder_email text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='raw_text') THEN
        ALTER TABLE analyses ADD COLUMN raw_text text;
    END IF;
END $$;

-- 2. Ensure the investor_preferences table exists
CREATE TABLE IF NOT EXISTS investor_preferences (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at               timestamptz DEFAULT now(),
  interested_categories    text[] DEFAULT '{}',
  disqualified_categories  text[] DEFAULT '{}'
);

-- 3. Insert a default preferences row if none exists
INSERT INTO investor_preferences (interested_categories, disqualified_categories)
SELECT '{}', '{}'
WHERE NOT EXISTS (SELECT 1 FROM investor_preferences);

-- 4. Update RLS policies (optional, ensures you can read/write)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read analyses" ON analyses;
CREATE POLICY "Public read analyses" ON analyses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert analyses" ON analyses;
CREATE POLICY "Public insert analyses" ON analyses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update analyses" ON analyses;
CREATE POLICY "Public update analyses" ON analyses FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read preferences" ON investor_preferences;
CREATE POLICY "Public read preferences" ON investor_preferences FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert preferences" ON investor_preferences;
CREATE POLICY "Public insert preferences" ON investor_preferences FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update preferences" ON investor_preferences;
CREATE POLICY "Public update preferences" ON investor_preferences FOR UPDATE USING (true);
