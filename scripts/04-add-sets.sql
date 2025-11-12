-- Create sets table
CREATE TABLE IF NOT EXISTS sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  set_type TEXT NOT NULL CHECK (set_type IN ('vendor', 'master', 'screening', 'hit_collection')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add set_id column to plates table
ALTER TABLE plates ADD COLUMN IF NOT EXISTS set_id UUID REFERENCES sets(id) ON DELETE SET NULL;

-- Create index for set_id
CREATE INDEX IF NOT EXISTS idx_plates_set_id ON plates(set_id);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_sets_updated_at ON sets;
CREATE TRIGGER update_sets_updated_at BEFORE UPDATE ON sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed some example sets
INSERT INTO sets (name, description, set_type) VALUES
  ('Vendor Library A', 'Primary vendor compound collection', 'vendor'),
  ('Master Plate Set 001', 'Mother plates for screening campaign', 'master'),
  ('Screening Set Q1-2024', 'Daughter plates for Q1 screening', 'screening'),
  ('Hit Collection 2024', 'Validated hits from 2024 campaigns', 'hit_collection')
ON CONFLICT (name) DO NOTHING;
