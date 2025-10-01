-- Create lead_qualification_status table
CREATE TABLE IF NOT EXISTS lead_qualification_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  status_message TEXT NOT NULL,
  qualified BOOLEAN DEFAULT FALSE,
  output TEXT,
  call_summary TEXT,
  call_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on run_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_lead_qualification_status_run_id ON lead_qualification_status(run_id);

-- Create index on updated_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_lead_qualification_status_updated_at ON lead_qualification_status(updated_at);

-- Enable Row Level Security
ALTER TABLE lead_qualification_status ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is for demo purposes)
CREATE POLICY "Allow all operations on lead_qualification_status" ON lead_qualification_status
  FOR ALL USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_lead_qualification_status_updated_at 
  BEFORE UPDATE ON lead_qualification_status 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
