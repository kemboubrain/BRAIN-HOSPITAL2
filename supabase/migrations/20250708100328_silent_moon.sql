/*
  # Fix rendezvous_pending table and policies

  1. New Tables
    - Ensures `rendezvous_pending` table exists
  2. Security
    - Enables RLS on `rendezvous_pending` table
    - Adds policies for authenticated and anonymous users
    - Adds indexes for better performance
*/

-- Create the rendezvous_pending table if it doesn't exist
CREATE TABLE IF NOT EXISTS rendezvous_pending (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_patient text NOT NULL,
  email text NOT NULL,
  telephone text,
  medecin_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date_heure timestamptz NOT NULL,
  statut text NOT NULL DEFAULT 'pending',
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE rendezvous_pending ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (can do everything) if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rendezvous_pending' 
    AND policyname = 'Authenticated users can manage rendezvous_pending'
  ) THEN
    CREATE POLICY "Authenticated users can manage rendezvous_pending" ON rendezvous_pending
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END
$$;

-- Create policy for anonymous users (can only insert) if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rendezvous_pending' 
    AND policyname = 'Anonymous users can insert rendezvous_pending'
  ) THEN
    CREATE POLICY "Anonymous users can insert rendezvous_pending" ON rendezvous_pending
      FOR INSERT TO anon WITH CHECK (true);
  END IF;
END
$$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_rendezvous_pending_token ON rendezvous_pending(token);
CREATE INDEX IF NOT EXISTS idx_rendezvous_pending_medecin_id ON rendezvous_pending(medecin_id);
CREATE INDEX IF NOT EXISTS idx_rendezvous_pending_statut ON rendezvous_pending(statut);