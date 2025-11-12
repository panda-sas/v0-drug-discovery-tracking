-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create experiments table
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Create scientists table
CREATE TABLE IF NOT EXISTS scientists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'scientist' CHECK (role IN ('scientist', 'admin', 'lab_manager')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create plates table
CREATE TABLE IF NOT EXISTS plates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  plate_id TEXT NOT NULL UNIQUE,
  plate_type TEXT NOT NULL CHECK (plate_type IN ('96-well', '384-well', '1536-well')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'in_use', 'completed', 'archived')),
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create plate_transactions table
CREATE TABLE IF NOT EXISTS plate_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_id UUID NOT NULL REFERENCES plates(id) ON DELETE CASCADE,
  scientist_id UUID NOT NULL REFERENCES scientists(id),
  action TEXT NOT NULL CHECK (action IN ('check_out', 'check_in')),
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  notes TEXT,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_experiments_project_id ON experiments(project_id);
CREATE INDEX IF NOT EXISTS idx_plates_experiment_id ON plates(experiment_id);
CREATE INDEX IF NOT EXISTS idx_plates_status ON plates(status);
CREATE INDEX IF NOT EXISTS idx_plate_transactions_plate_id ON plate_transactions(plate_id);
CREATE INDEX IF NOT EXISTS idx_plate_transactions_scientist_id ON plate_transactions(scientist_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_experiments_updated_at ON experiments;
CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scientists_updated_at ON scientists;
CREATE TRIGGER update_scientists_updated_at BEFORE UPDATE ON scientists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plates_updated_at ON plates;
CREATE TRIGGER update_plates_updated_at BEFORE UPDATE ON plates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
