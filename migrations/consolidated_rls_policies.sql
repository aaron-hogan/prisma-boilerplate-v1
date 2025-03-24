-- Consolidated RLS Policies Migration File
-- This file contains all current RLS policies, helper functions, and hooks

---------------------------------------------------
-- PART 1: CUSTOM ACCESS TOKEN HOOK
---------------------------------------------------

/**
 * Supabase JWT Customization Function
 * 
 * This PostgreSQL function is used as a hook by Supabase Auth to add custom
 * claims to the JWT access token. It runs whenever a new token is created
 * or refreshed.
 *
 * Purpose:
 * 1. Add application roles to JWT tokens for RBAC 
 * 2. Enable stateless authorization through JWT claims
 * 3. Integrate Supabase Auth with our application's profile system
 *
 * Security model:
 * - Only the supabase_auth_admin role can execute this function
 * - The function has read-only access to the profiles table
 * - Default to 'USER' role if no profile exists (fail-secure)
 */
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable  -- Mark as stable since it doesn't modify data
as $$
declare
  claims jsonb;         -- JWT claims object
  user_app_role text;   -- User's role from profiles table
begin
  -- Fetch the user role from the profiles table
  -- Cast both sides to text to avoid type mismatch issues with UUID
  select app_role::text into user_app_role
  from public.profiles
  where auth_user_id::text = (event->>'user_id');
  
  -- Extract existing claims from the token event
  claims := event->'claims';
  
  -- Add the app_role claim to the JWT
  if user_app_role is not null then
    -- Use proper JSON formatting with double quotes around string values
    claims := jsonb_set(claims, '{app_role}', concat('"', user_app_role, '"')::jsonb);
  else
    -- Default to USER role if no profile exists
    -- This ensures a fail-secure approach to permissions
    claims := jsonb_set(claims, '{app_role}', '"USER"'::jsonb);
  end if;
  
  -- Update the event with the modified claims
  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Security permissions
-- These permissions ensure only the Supabase Auth system can call this function

-- Grant usage on the schema to the auth admin role
grant usage on schema public to supabase_auth_admin;

-- Grant execute permission to the auth admin role
grant execute on function public.custom_access_token_hook to supabase_auth_admin;

-- Explicitly revoke execute from all other roles
-- This is a defense-in-depth measure to prevent unauthorized access
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

---------------------------------------------------
-- PART 2: HELPER FUNCTIONS AND RLS POLICIES
---------------------------------------------------

-- First, create or replace the helper functions
DO $$
BEGIN
  -- Function to check if a user has specific roles
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

  -- Function to check if user owns the product
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

  -- Function to check if user is admin or owns the product
  CREATE OR REPLACE FUNCTION public.user_is_admin_or_owns_product(product_created_by text)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  AS $$
    SELECT 
      -- Check if user is ADMIN
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_user_id = auth.uid()::text
        AND profiles.app_role::text = 'ADMIN'
      )
      OR 
      -- Check if user owns the product
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_user_id = auth.uid()::text
        AND profiles.id::text = product_created_by::text
      );
  $$;

  -- Function to check if a user has a specific profile ID
  CREATE OR REPLACE FUNCTION public.user_has_profile(profile_id_param text)
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
END
$$;

-- Grant permissions to use all helper functions
GRANT EXECUTE ON FUNCTION public.user_has_role TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.user_owns_product TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.user_is_admin_or_owns_product TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.user_has_profile TO authenticated, anon;

-- Products Table Policies
-- -----------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read products" ON "products";
DROP POLICY IF EXISTS "Creators can update their products" ON "products";
DROP POLICY IF EXISTS "Creators can delete their products" ON "products";
DROP POLICY IF EXISTS "Admins can delete any product, creators can delete their own" ON "products";
DROP POLICY IF EXISTS "Staff and admin can create products" ON "products";

-- Make sure RLS is enabled
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;

-- Add a member product visibility function
CREATE OR REPLACE FUNCTION public.user_can_see_product(product_type text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$$
  SELECT 
    -- Anyone can see oranges
    product_type = 'ORANGE'
    OR 
    -- Only members and higher can see apples
    (product_type = 'APPLE' AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.auth_user_id = auth.uid()::text
      AND profiles.app_role::text IN ('MEMBER', 'STAFF', 'ADMIN')
    ));
$$;

-- Grant permission to use this function
GRANT EXECUTE ON FUNCTION public.user_can_see_product TO authenticated, anon;

-- Create policies
CREATE POLICY "Users can read products based on their role and product type" 
ON "products" FOR SELECT 
USING (
  -- Must be authenticated
  auth.uid()::text IS NOT NULL
  AND
  -- Use the product visibility function
  user_can_see_product(type::text)
);

CREATE POLICY "Staff and admin can create products"
ON "products" FOR INSERT
WITH CHECK (user_has_role(ARRAY['ADMIN'::text, 'STAFF'::text]));

CREATE POLICY "Creators can update their products"
ON "products" FOR UPDATE
USING (user_owns_product(created_by));

-- Updated policy: Admin can delete any product, creators can delete their own
CREATE POLICY "Admins can delete any product, creators can delete their own" 
ON "products" FOR DELETE
USING (user_is_admin_or_owns_product(created_by));

-- Make sure we have the index for performance
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);

-- Profiles Table Policies
-- -----------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON "profiles";
DROP POLICY IF EXISTS "Users can update their own profile" ON "profiles";
DROP POLICY IF EXISTS "Admin and Staff can update any profile" ON "profiles";
DROP POLICY IF EXISTS "Auth hook can access all profiles" ON "profiles";
DROP POLICY IF EXISTS "Service role can access all profiles" ON "profiles";

-- Make sure RLS is enabled
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own profile"
ON "profiles" FOR SELECT
USING (auth_user_id = auth.uid()::text);

CREATE POLICY "Users can update their own profile"
ON "profiles" FOR UPDATE
USING (auth_user_id = auth.uid()::text);

CREATE POLICY "Admin and Staff can update any profile"
ON "profiles" FOR UPDATE
USING (user_has_role(ARRAY['ADMIN'::text, 'STAFF'::text]));

CREATE POLICY "Auth hook can access all profiles"
ON "profiles" FOR SELECT
USING (true);

CREATE POLICY "Service role can access all profiles"
ON "profiles" FOR SELECT
USING (true);

-- Memberships Table Policies
-- --------------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Admin, Staff, and Members can view memberships" ON "memberships";
DROP POLICY IF EXISTS "Any authenticated user can create a membership" ON "memberships";
DROP POLICY IF EXISTS "Users can delete memberships they control" ON "memberships";

-- Make sure RLS is enabled
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin, Staff, and Members can view memberships"
ON "memberships" FOR SELECT
USING (user_has_role(ARRAY['ADMIN'::text, 'STAFF'::text, 'MEMBER'::text]));

CREATE POLICY "Any authenticated user can create a membership"
ON "memberships" FOR INSERT
WITH CHECK (profile_id IN (
  SELECT profiles.id
  FROM profiles
  WHERE profiles.auth_user_id = auth.uid()::text
));

CREATE POLICY "Users can delete memberships they control"
ON "memberships" FOR DELETE
USING (
  (profile_id IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.auth_user_id = auth.uid()::text
  ) AND user_has_role(ARRAY['MEMBER'::text])) 
  OR 
  user_has_role(ARRAY['ADMIN'::text, 'STAFF'::text])
);

-- Purchases Table Policies
-- -----------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own purchases" ON "purchases";
DROP POLICY IF EXISTS "Users can access their own purchases via function" ON "purchases";
DROP POLICY IF EXISTS "Admin and Staff can view all purchases" ON "purchases";
DROP POLICY IF EXISTS "Users can create purchases for their own profile" ON "purchases";
DROP POLICY IF EXISTS "Users can delete their own purchases" ON "purchases";
DROP POLICY IF EXISTS "Admin and Staff can delete any purchase" ON "purchases";

-- Make sure RLS is enabled
ALTER TABLE "purchases" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own purchases"
ON "purchases" FOR SELECT
USING (profile_id IN (
  SELECT profiles.id
  FROM profiles
  WHERE profiles.auth_user_id = auth.uid()::text
));

CREATE POLICY "Users can access their own purchases via function"
ON "purchases" FOR SELECT
USING (user_has_profile(profile_id));

CREATE POLICY "Admin and Staff can view all purchases"
ON "purchases" FOR SELECT
USING (user_has_role(ARRAY['ADMIN'::text, 'STAFF'::text]));

-- Function to check if user can purchase a product
CREATE OR REPLACE FUNCTION public.user_can_purchase_product(profile_id_param text, product_id_param text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$$
  SELECT EXISTS (
    -- User must own the profile
    SELECT 1 FROM profiles
    WHERE profiles.auth_user_id = auth.uid()::text
    AND profiles.id::text = profile_id_param
  ) 
  AND
  (
    -- For apples, user must be MEMBER, STAFF, or ADMIN
    (
      (SELECT type FROM products WHERE id = product_id_param) = 'APPLE'
      AND
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_user_id = auth.uid()::text
        AND profiles.app_role::text IN ('MEMBER', 'STAFF', 'ADMIN')
      )
    )
    OR
    -- For oranges, any authenticated user can purchase
    (SELECT type FROM products WHERE id = product_id_param) = 'ORANGE'
  );
$$;

-- Grant permission to use this function
GRANT EXECUTE ON FUNCTION public.user_can_purchase_product TO authenticated, anon;

CREATE POLICY "Users can create purchases based on product type and role"
ON "purchases" FOR INSERT
WITH CHECK (
  user_can_purchase_product(profile_id, product_id)
);

CREATE POLICY "Users can delete their own purchases"
ON "purchases" FOR DELETE
USING (profile_id IN (
  SELECT profiles.id
  FROM profiles
  WHERE profiles.auth_user_id = auth.uid()::text
));

CREATE POLICY "Admin and Staff can delete any purchase"
ON "purchases" FOR DELETE
USING (EXISTS (
  SELECT 1
  FROM profiles
  WHERE profiles.auth_user_id = auth.uid()::text
  AND profiles.app_role::text = ANY(ARRAY['ADMIN'::text, 'STAFF'::text])
));