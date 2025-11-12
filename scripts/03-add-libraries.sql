-- Create libraries table
CREATE TABLE IF NOT EXISTS libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  library_type TEXT NOT NULL CHECK (library_type IN ('compound', 'peptide', 'protein', 'dna', 'rna', 'other')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add library_id and scientist_id to plates table
ALTER TABLE plates ADD COLUMN IF NOT EXISTS library_id UUID REFERENCES libraries(id) ON DELETE SET NULL;
ALTER TABLE plates ADD COLUMN IF NOT EXISTS scientist_id UUID REFERENCES scientists(id) ON DELETE SET NULL;

-- Create index for library_id
CREATE INDEX IF NOT EXISTS idx_plates_library_id ON plates(library_id);
CREATE INDEX IF NOT EXISTS idx_plates_scientist_id ON plates(scientist_id);

-- Add trigger for libraries updated_at
DROP TRIGGER IF EXISTS update_libraries_updated_at ON libraries;
CREATE TRIGGER update_libraries_updated_at BEFORE UPDATE ON libraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample libraries
INSERT INTO libraries (name, description, library_type) VALUES
  ('Kinase Inhibitors', 'Collection of kinase inhibitor compounds', 'compound'),
  ('GPCR Modulators', 'G-protein coupled receptor modulators', 'compound'),
  ('Peptide Library A', 'Synthetic peptide library for screening', 'peptide')
ON CONFLICT (name) DO NOTHING;
