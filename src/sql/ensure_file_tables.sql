
-- Ensure file_access_logs table exists
CREATE TABLE IF NOT EXISTS public.file_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_hash TEXT NOT NULL,
  user_id UUID NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'share')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  details TEXT
);

-- Add id column to files table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'files' 
    AND column_name = 'id'
  ) THEN
    ALTER TABLE public.files ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
  END IF;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END$$;
