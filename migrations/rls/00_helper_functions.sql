-- migrations/rls/00_helper_functions.sql
-- Function to check if a user has a specific role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'user_has_role') THEN
    CREATE FUNCTION public.user_has_role(required_roles text[])
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_user_id = auth.uid()::text
        AND profiles.app_role::text = ANY(required_roles)
      );
    $$;
  END IF;

  IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'user_owns_product') THEN
    CREATE FUNCTION public.user_owns_product(product_created_by text)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_user_id = auth.uid()::text
        AND profiles.id::text = product_created_by::text
      );
    $$;
  END IF;

  IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'user_has_profile') THEN
    CREATE FUNCTION public.user_has_profile(profile_id_param text)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_user_id = auth.uid()::text
        AND profiles.id::text = profile_id_param
      );
    $$;
  END IF;
END
$$;

-- Grant permissions to use the functions
GRANT EXECUTE ON FUNCTION public.user_has_role TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.user_owns_product TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.user_has_profile TO authenticated, anon;