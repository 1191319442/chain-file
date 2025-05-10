
CREATE OR REPLACE FUNCTION public.get_file_access_logs(file_hash_param TEXT)
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
    l.file_hash = file_hash_param
  ORDER BY
    l.timestamp DESC;
END;
$$;
