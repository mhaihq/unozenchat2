/*
  # Add admin settings table

  ## Overview
  Stores app-level configuration including the admin password hash.

  ## Tables
  ### app_settings
  - `key` (text, primary key) - setting name
  - `value` (text) - setting value
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Anyone can read settings (needed to verify admin password on the client)
  - No public insert/update (managed via migration or Supabase dashboard)
*/

CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON app_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Default admin password: "admin123" (SHA-256 hex, clients compare this)
-- Course creator should change this via the admin panel
INSERT INTO app_settings (key, value)
VALUES ('admin_password_hash', encode(digest('admin123', 'sha256'), 'hex'))
ON CONFLICT (key) DO NOTHING;
