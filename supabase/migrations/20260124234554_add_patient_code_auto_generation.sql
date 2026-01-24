/*
  # Ajouter génération automatique du code patient

  1. Modifications
    - Ajout de la colonne `patient_code` à la table `patients`
    - Création d'une séquence pour générer les codes patients
    - Création d'une fonction pour générer automatiquement le code patient
    - Création d'un trigger pour appliquer la génération à l'insertion

  2. Fonctionnement
    - Format du code: PAT-XXXXXX (6 chiffres séquentiels)
    - Le code est généré automatiquement à la création du patient
    - La colonne est unique pour éviter les doublons
*/

-- Créer une séquence pour les codes patients
CREATE SEQUENCE IF NOT EXISTS patient_code_seq START 1000 INCREMENT 1;

-- Ajouter la colonne patient_code à la table patients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'patient_code'
  ) THEN
    ALTER TABLE patients ADD COLUMN patient_code text UNIQUE NOT NULL DEFAULT '';
  END IF;
END $$;

-- Fonction pour générer le code patient
CREATE OR REPLACE FUNCTION generate_patient_code()
RETURNS text AS $$
DECLARE
  seq_value integer;
BEGIN
  seq_value := nextval('patient_code_seq');
  RETURN 'PAT-' || LPAD(seq_value::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le code patient à l'insertion
CREATE OR REPLACE FUNCTION set_patient_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.patient_code = '' OR NEW.patient_code IS NULL THEN
    NEW.patient_code := generate_patient_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger s'il n'existe pas
DROP TRIGGER IF EXISTS set_patient_code_trigger ON patients;
CREATE TRIGGER set_patient_code_trigger
  BEFORE INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION set_patient_code();

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_patients_patient_code ON patients(patient_code);
