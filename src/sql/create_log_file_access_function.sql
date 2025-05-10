
-- Function to log file access
CREATE OR REPLACE FUNCTION public.log_file_access(
  file_hash_param TEXT,
  access_type_param TEXT,
  details_param TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.file_access_logs(
    file_hash,
    user_id,
    access_type,
    details
  ) VALUES (
    file_hash_param,
    auth.uid(),
    access_type_param,
    details_param
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to get user file access logs
CREATE OR REPLACE FUNCTION public.get_user_file_access_logs(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  file_hash TEXT,
  user_id UUID,
  access_type TEXT,
  timestamp TIMESTAMPTZ,
  details TEXT,
  username TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.file_hash,
    l.user_id,
    l.access_type,
    l.timestamp,
    l.details,
    p.username
  FROM
    public.file_access_logs l
  LEFT JOIN
    public.profiles p ON l.user_id = p.user_id
  WHERE
    l.file_hash IN (SELECT hash FROM public.files WHERE user_id = user_id_param)
  ORDER BY
    l.timestamp DESC;
END;
$$;
