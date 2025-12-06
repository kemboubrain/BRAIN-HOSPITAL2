/*
  # Create email management tables

  1. New Tables
    - `email_templates` - Store email templates
      - `id` (uuid, primary key)
      - `name` (text, template name)
      - `subject` (text, email subject)
      - `body` (text, email content)
      - `category` (text, template category)
      - `variables` (jsonb, variables used in template)
      - `created_by` (uuid, user who created template)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `email_history` - Track sent/received emails
      - `id` (uuid, primary key)
      - `sender_id` (uuid, sender user)
      - `recipient_email` (text, recipient email)
      - `recipient_name` (text, recipient name)
      - `subject` (text, email subject)
      - `body` (text, email body)
      - `template_id` (uuid, template used)
      - `status` (text, pending/sent/failed)
      - `error_message` (text, error if failed)
      - `sent_at` (timestamp)
      - `created_at` (timestamp)
      - `related_entity_type` (text, e.g., appointment, patient)
      - `related_entity_id` (uuid, entity ID)

  2. Security
    - Enable RLS on both tables
    - Users can view their own email history
    - Only authenticated users can create templates
*/

CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  category text DEFAULT 'general',
  variables jsonb DEFAULT '{}',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  body text NOT NULL,
  template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  related_entity_type text,
  related_entity_id uuid
);

CREATE TABLE IF NOT EXISTS email_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_history_id uuid NOT NULL REFERENCES email_history(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'opened', 'bounced')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create templates"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates"
  ON email_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view email history"
  ON email_history FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR auth.uid() IN (SELECT auth.uid()));

CREATE POLICY "Users can create email history"
  ON email_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id OR sender_id IS NULL);

CREATE POLICY "Users can update email status"
  ON email_history FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid() OR auth.uid() IN (SELECT auth.uid()))
  WITH CHECK (sender_id = auth.uid() OR sender_id IS NULL);

CREATE POLICY "Users can view email recipients"
  ON email_recipients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create email recipients"
  ON email_recipients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update email recipients"
  ON email_recipients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS email_history_sender_idx ON email_history(sender_id);
CREATE INDEX IF NOT EXISTS email_history_status_idx ON email_history(status);
CREATE INDEX IF NOT EXISTS email_history_created_idx ON email_history(created_at);
CREATE INDEX IF NOT EXISTS email_templates_category_idx ON email_templates(category);
CREATE INDEX IF NOT EXISTS email_recipients_email_history_idx ON email_recipients(email_history_id);
