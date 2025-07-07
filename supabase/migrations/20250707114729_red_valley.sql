/*
  # Add rendezvous_pending table for appointment requests

  1. New Table
    - `rendezvous_pending` - Stores pending appointment requests from public users
      - `id` (uuid, primary key)
      - `nom_patient` (text)
      - `email` (text)
      - `telephone` (text)
      - `medecin_id` (uuid, foreign key to doctors)
      - `date_heure` (timestamptz)
      - `statut` (text, default 'pending')
      - `token` (uuid, unique)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on the new table
    - Add policy for authenticated users to manage the table
    - Add policy for anonymous users to insert new records

  3. Changes
    - Add foreign key constraint to doctors table
    - Add unique constraint on token
    - Add index on token for faster lookups
*/

-- Create the rendezvous_pending table
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

-- Create policy for authenticated users (can do everything)
CREATE POLICY "Authenticated users can manage rendezvous_pending" ON rendezvous_pending
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create policy for anonymous users (can only insert)
CREATE POLICY "Anonymous users can insert rendezvous_pending" ON rendezvous_pending
  FOR INSERT TO anon WITH CHECK (true);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_rendezvous_pending_token ON rendezvous_pending(token);

-- Create index on medecin_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_rendezvous_pending_medecin_id ON rendezvous_pending(medecin_id);

-- Create index on statut for filtering
CREATE INDEX IF NOT EXISTS idx_rendezvous_pending_statut ON rendezvous_pending(statut);