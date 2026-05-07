ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS api_call_count bigint NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_api_call_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET api_call_count = api_call_count + 1
  WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_api_call_count() TO authenticated;