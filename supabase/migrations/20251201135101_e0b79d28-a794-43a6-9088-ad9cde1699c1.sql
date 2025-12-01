-- Fix security warning: Set search_path for the function
CREATE OR REPLACE FUNCTION public.delete_expired_uploads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.uploads
  WHERE expires_at < now();
END;
$$;