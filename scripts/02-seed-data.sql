-- Insert sample scientists
INSERT INTO scientists (name, email, role) VALUES
  ('Dr. Sarah Chen', 'sarah.chen@lab.com', 'admin'),
  ('Dr. James Wilson', 'james.wilson@lab.com', 'lab_manager'),
  ('Dr. Maria Garcia', 'maria.garcia@lab.com', 'scientist'),
  ('Dr. David Kim', 'david.kim@lab.com', 'scientist')
ON CONFLICT (email) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (name, description, status) VALUES
  ('Cancer Drug Discovery', 'Development of novel targeted therapies for cancer treatment', 'active'),
  ('Antibody Engineering', 'Engineering high-affinity antibodies for therapeutic applications', 'active'),
  ('Protein Crystallization', 'Structural studies of drug targets', 'active')
ON CONFLICT (name) DO NOTHING;

-- Insert sample experiments
INSERT INTO experiments (project_id, name, description, status, start_date) 
SELECT 
  p.id,
  'Compound Screening A',
  'Initial compound library screening',
  'in_progress',
  CURRENT_DATE - INTERVAL '7 days'
FROM projects p WHERE p.name = 'Cancer Drug Discovery'
ON CONFLICT (project_id, name) DO NOTHING;

INSERT INTO experiments (project_id, name, description, status, start_date) 
SELECT 
  p.id,
  'IC50 Determination',
  'Dose-response analysis of lead compounds',
  'planning',
  CURRENT_DATE
FROM projects p WHERE p.name = 'Cancer Drug Discovery'
ON CONFLICT (project_id, name) DO NOTHING;

INSERT INTO experiments (project_id, name, description, status, start_date) 
SELECT 
  p.id,
  'Affinity Maturation Round 1',
  'First round of antibody optimization',
  'in_progress',
  CURRENT_DATE - INTERVAL '14 days'
FROM projects p WHERE p.name = 'Antibody Engineering'
ON CONFLICT (project_id, name) DO NOTHING;

-- Insert sample plates
INSERT INTO plates (experiment_id, plate_id, plate_type, status, location)
SELECT 
  e.id,
  'PLT-001-' || LPAD(gs::TEXT, 3, '0'),
  CASE WHEN gs % 3 = 0 THEN '384-well' WHEN gs % 3 = 1 THEN '96-well' ELSE '1536-well' END,
  CASE WHEN gs % 4 = 0 THEN 'available' WHEN gs % 4 = 1 THEN 'checked_out' WHEN gs % 4 = 2 THEN 'in_use' ELSE 'completed' END,
  'Freezer ' || ((gs % 3) + 1)::TEXT
FROM experiments e
CROSS JOIN generate_series(1, 15) gs
WHERE e.name = 'Compound Screening A'
ON CONFLICT (plate_id) DO NOTHING;

-- Insert sample transactions
INSERT INTO plate_transactions (plate_id, scientist_id, action, previous_status, new_status, notes)
SELECT 
  p.id,
  s.id,
  'check_out',
  'available',
  'checked_out',
  'Starting assay preparation'
FROM plates p
CROSS JOIN scientists s
WHERE p.status = 'checked_out' 
  AND s.role = 'scientist'
LIMIT 3;
