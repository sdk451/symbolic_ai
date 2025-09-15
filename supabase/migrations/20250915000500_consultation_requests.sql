/*
  # Consultation Requests Table
  
  Creates the consultation_requests table for storing consultation form submissions.
  Includes proper RLS policies and indexes for performance.
*/

-- Create consultation_requests table
CREATE TABLE IF NOT EXISTS consultation_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company_name text NOT NULL,
  company_website text,
  services_of_interest text[] NOT NULL,
  project_timeline text NOT NULL,
  estimated_budget text NOT NULL,
  challenge_to_solve text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'completed', 'cancelled')),
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for consultation requests
-- Allow anyone to insert consultation requests (public form)
CREATE POLICY "Anyone can submit consultation request"
  ON consultation_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can view consultation requests (for admin purposes)
CREATE POLICY "Authenticated users can view consultation requests"
  ON consultation_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update consultation requests
CREATE POLICY "Authenticated users can update consultation requests"
  ON consultation_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_consultation_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_consultation_requests_updated_at ON consultation_requests;
CREATE TRIGGER handle_consultation_requests_updated_at
  BEFORE UPDATE ON consultation_requests
  FOR EACH ROW EXECUTE FUNCTION handle_consultation_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS consultation_requests_email_idx ON consultation_requests(email);
CREATE INDEX IF NOT EXISTS consultation_requests_submitted_at_idx ON consultation_requests(submitted_at);
CREATE INDEX IF NOT EXISTS consultation_requests_status_idx ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS consultation_requests_created_at_idx ON consultation_requests(created_at);
