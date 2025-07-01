/*
  # Nouvelles tables pour Soins et Hospitalisation

  1. Nouvelles Tables
    - `care_services` - Services de soins disponibles
    - `patient_care_records` - Fiches de soins par patient
    - `care_items` - Éléments de soins avec coûts
    - `rooms` - Chambres et lits
    - `hospitalizations` - Hospitalisations
    - `hospitalization_services` - Services durant l'hospitalisation

  2. Sécurité
    - Activation RLS sur toutes les nouvelles tables
    - Politiques d'accès pour les utilisateurs authentifiés

  3. Fonctionnalités
    - Gestion intelligente des soins par patient
    - Système d'hospitalisation avec facturation automatique
    - Liaison avec le système de facturation existant
*/

-- Table des services de soins disponibles
CREATE TABLE IF NOT EXISTS care_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  unit_price integer NOT NULL DEFAULT 0,
  duration_minutes integer DEFAULT 30,
  requires_doctor boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des fiches de soins par patient
CREATE TABLE IF NOT EXISTS patient_care_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  care_date date NOT NULL,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
  total_cost integer DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des éléments de soins
CREATE TABLE IF NOT EXISTS care_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_record_id uuid NOT NULL REFERENCES patient_care_records(id) ON DELETE CASCADE,
  care_service_id uuid NOT NULL REFERENCES care_services(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  unit_price integer NOT NULL,
  total_price integer NOT NULL,
  performed_at timestamptz,
  performed_by text DEFAULT '',
  notes text DEFAULT ''
);

-- Table des chambres et lits
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number text NOT NULL UNIQUE,
  room_type text NOT NULL CHECK (room_type IN ('standard', 'private', 'vip', 'icu', 'emergency')),
  bed_count integer NOT NULL DEFAULT 1,
  daily_rate integer NOT NULL DEFAULT 0,
  amenities jsonb DEFAULT '[]',
  is_available boolean DEFAULT true,
  floor_number integer DEFAULT 1,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Table des hospitalisations
CREATE TABLE IF NOT EXISTS hospitalizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  admission_date timestamptz NOT NULL,
  discharge_date timestamptz,
  admission_reason text NOT NULL,
  discharge_summary text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'discharged', 'transferred')),
  daily_cost integer NOT NULL DEFAULT 0,
  total_cost integer DEFAULT 0,
  insurance_covered boolean DEFAULT false,
  emergency_admission boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des services durant l'hospitalisation
CREATE TABLE IF NOT EXISTS hospitalization_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospitalization_id uuid NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,
  care_service_id uuid NOT NULL REFERENCES care_services(id) ON DELETE CASCADE,
  service_date date NOT NULL,
  quantity integer DEFAULT 1,
  unit_price integer NOT NULL,
  total_price integer NOT NULL,
  performed_by text DEFAULT '',
  notes text DEFAULT ''
);

-- Activation RLS
ALTER TABLE care_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_care_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalization_services ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Authenticated users can manage care_services" ON care_services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage patient_care_records" ON patient_care_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage care_items" ON care_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage rooms" ON rooms
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage hospitalizations" ON hospitalizations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage hospitalization_services" ON hospitalization_services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_patient_care_records_patient_id ON patient_care_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_care_records_date ON patient_care_records(care_date);
CREATE INDEX IF NOT EXISTS idx_care_items_care_record_id ON care_items(care_record_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_patient_id ON hospitalizations(patient_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_room_id ON hospitalizations(room_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_status ON hospitalizations(status);
CREATE INDEX IF NOT EXISTS idx_hospitalization_services_hospitalization_id ON hospitalization_services(hospitalization_id);

-- Triggers pour updated_at
CREATE TRIGGER update_patient_care_records_updated_at 
  BEFORE UPDATE ON patient_care_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospitalizations_updated_at 
  BEFORE UPDATE ON hospitalizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertion des services de soins avec prix en XOF
INSERT INTO care_services (name, category, description, unit_price, duration_minutes, requires_doctor) VALUES
('Pansement simple', 'Soins infirmiers', 'Pansement pour plaie simple', 2500, 15, false),
('Pansement complexe', 'Soins infirmiers', 'Pansement pour plaie complexe ou chirurgicale', 5000, 30, false),
('Injection intramusculaire', 'Soins infirmiers', 'Administration de médicament par voie IM', 1500, 10, false),
('Injection intraveineuse', 'Soins infirmiers', 'Administration de médicament par voie IV', 2000, 15, false),
('Perfusion', 'Soins infirmiers', 'Mise en place et surveillance de perfusion', 8000, 45, false),
('Prise de tension', 'Soins de base', 'Mesure de la tension artérielle', 1000, 5, false),
('Électrocardiogramme (ECG)', 'Examens', 'Enregistrement de l''activité cardiaque', 15000, 20, true),
('Radiographie thoracique', 'Imagerie', 'Radiographie du thorax', 25000, 15, true),
('Échographie abdominale', 'Imagerie', 'Échographie de l''abdomen', 35000, 30, true),
('Suture simple', 'Chirurgie mineure', 'Suture de plaie simple', 12000, 30, true),
('Suture complexe', 'Chirurgie mineure', 'Suture de plaie complexe', 20000, 45, true),
('Retrait de points', 'Chirurgie mineure', 'Retrait de fils de suture', 5000, 15, false),
('Kinésithérapie', 'Rééducation', 'Séance de kinésithérapie', 18000, 60, false),
('Dialyse', 'Soins spécialisés', 'Séance de dialyse', 75000, 240, true),
('Chimiothérapie', 'Soins spécialisés', 'Administration de chimiothérapie', 150000, 180, true)
ON CONFLICT DO NOTHING;

-- Insertion des chambres
INSERT INTO rooms (room_number, room_type, bed_count, daily_rate, amenities, floor_number, description) VALUES
('101', 'standard', 2, 15000, '["Climatisation", "Télévision"]', 1, 'Chambre double standard'),
('102', 'standard', 2, 15000, '["Climatisation", "Télévision"]', 1, 'Chambre double standard'),
('103', 'private', 1, 25000, '["Climatisation", "Télévision", "Réfrigérateur", "Salle de bain privée"]', 1, 'Chambre privée'),
('104', 'private', 1, 25000, '["Climatisation", "Télévision", "Réfrigérateur", "Salle de bain privée"]', 1, 'Chambre privée'),
('201', 'vip', 1, 50000, '["Climatisation", "Télévision", "Réfrigérateur", "Salle de bain privée", "Canapé", "WiFi"]', 2, 'Suite VIP'),
('202', 'vip', 1, 50000, '["Climatisation", "Télévision", "Réfrigérateur", "Salle de bain privée", "Canapé", "WiFi"]', 2, 'Suite VIP'),
('301', 'icu', 1, 75000, '["Monitoring cardiaque", "Ventilateur", "Défibrillateur"]', 3, 'Unité de soins intensifs'),
('302', 'icu', 1, 75000, '["Monitoring cardiaque", "Ventilateur", "Défibrillateur"]', 3, 'Unité de soins intensifs'),
('303', 'icu', 1, 75000, '["Monitoring cardiaque", "Ventilateur", "Défibrillateur"]', 3, 'Unité de soins intensifs'),
('401', 'emergency', 4, 20000, '["Monitoring", "Oxygène", "Défibrillateur"]', 4, 'Salle d''urgence')
ON CONFLICT (room_number) DO NOTHING;

-- Insertion d'exemples d'hospitalisations
INSERT INTO hospitalizations (id, patient_id, doctor_id, room_id, admission_date, admission_reason, status, daily_cost, emergency_admission) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM rooms WHERE room_number = '103'), '2024-02-10 08:30:00', 'Surveillance post-infarctus', 'active', 25000, true),
('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM rooms WHERE room_number = '101'), '2024-02-12 14:00:00', 'Observation post-opératoire', 'active', 15000, false)
ON CONFLICT (id) DO NOTHING;

-- Insertion d'exemples de fiches de soins
INSERT INTO patient_care_records (id, patient_id, doctor_id, care_date, status, total_cost) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-02-15', 'completed', 18500),
('dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '2024-02-14', 'completed', 8500),
('dd0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', '2024-02-18', 'planned', 12000)
ON CONFLICT (id) DO NOTHING;

-- Insertion d'exemples d'éléments de soins
INSERT INTO care_items (care_record_id, care_service_id, quantity, unit_price, total_price, performed_by) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', (SELECT id FROM care_services WHERE name = 'Électrocardiogramme (ECG)'), 1, 15000, 15000, 'Infirmière Awa'),
('dd0e8400-e29b-41d4-a716-446655440001', (SELECT id FROM care_services WHERE name = 'Prise de tension'), 3, 1000, 3000, 'Infirmière Awa'),
('dd0e8400-e29b-41d4-a716-446655440001', (SELECT id FROM care_services WHERE name = 'Injection intramusculaire'), 1, 1500, 1500, 'Infirmière Fatou'),
('dd0e8400-e29b-41d4-a716-446655440002', (SELECT id FROM care_services WHERE name = 'Pansement simple'), 2, 2500, 5000, 'Infirmière Mame'),
('dd0e8400-e29b-41d4-a716-446655440002', (SELECT id FROM care_services WHERE name = 'Injection intramusculaire'), 2, 1500, 3000, 'Infirmière Mame'),
('dd0e8400-e29b-41d4-a716-446655440002', (SELECT id FROM care_services WHERE name = 'Prise de tension'), 1, 1000, 1000, 'Infirmière Khady');