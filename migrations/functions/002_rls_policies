-- First, clear any existing policies
DROP POLICY IF EXISTS "Anyone can read products" ON "products";
DROP POLICY IF EXISTS "Authenticated users can create products" ON "products";
DROP POLICY IF EXISTS "Creators can update their products" ON "products";
DROP POLICY IF EXISTS "Creators can delete their products" ON "products";

-- Make sure RLS is enabled
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;

-- Grant necessary access for RLS to work
GRANT SELECT ON profiles TO authenticated, anon;

-- Create the security definer function to check product ownership
CREATE OR REPLACE FUNCTION public.user_owns_product(product_created_by text)
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

-- Create helper function to check user roles
CREATE OR REPLACE FUNCTION public.user_has_role(required_roles text[])
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

-- Create policy for reading products (allow anyone authenticated)
CREATE POLICY "Anyone can read products"
ON "products" FOR SELECT
USING (auth.uid()::text IS NOT NULL);

-- Create policy for creating products (only staff and admin)
CREATE POLICY "Staff and admin can create products"
ON "products" FOR INSERT
WITH CHECK (public.user_has_role(ARRAY['ADMIN', 'STAFF']));

-- Create policy for updating products (only creator can update)
CREATE POLICY "Creators can update their products"
ON "products" FOR UPDATE
USING (public.user_owns_product(created_by));

-- Create policy for deleting products (only creator can delete)
CREATE POLICY "Creators can delete their products"
ON "products" FOR DELETE
USING (public.user_owns_product(created_by));