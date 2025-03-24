-- migrations/rls/01_profiles.sql
-- RLS policies for profiles table

-- Drop existing policies
DROP POLICY IF EXISTS "Admin and Staff can update any profile" ON "profiles";
DROP POLICY IF EXISTS "Auth hook can access all profiles" ON "profiles";
DROP POLICY IF EXISTS "Service role can access all profiles" ON "profiles";
DROP POLICY IF EXISTS "Users can read their own profile" ON "profiles";
DROP POLICY IF EXISTS "Users can update their own profile" ON "profiles";

-- Make sure RLS is enabled
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Auth hook can access all profiles"
ON "profiles" FOR SELECT
USING (true);

CREATE POLICY "Service role can access all profiles"
ON "profiles" FOR ALL
USING (true)
TO service_role;

CREATE POLICY "Users can read their own profile"
ON "profiles" FOR SELECT
USING (auth_user_id = auth.uid()::text)
TO authenticated;

CREATE POLICY "Users can update their own profile"
ON "profiles" FOR UPDATE
USING (auth_user_id = auth.uid()::text)
TO authenticated;

CREATE POLICY "Admin and Staff can update any profile"
ON "profiles" FOR UPDATE
USING (
  (SELECT profiles_1.app_role 
   FROM profiles profiles_1
   WHERE profiles_1.auth_user_id = auth.uid()::text) = ANY (ARRAY['ADMIN'::\"AppRole\", 'STAFF'::\"AppRole\"])
)
TO authenticated;