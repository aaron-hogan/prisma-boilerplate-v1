-- Create a new helper function to check if user is admin or owns the product
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

-- Grant permissions to use the function
GRANT EXECUTE ON FUNCTION public.user_is_admin_or_owns_product TO authenticated, anon;

-- Drop the existing delete policy
DROP POLICY IF EXISTS "Creators can delete their products" ON "products";

-- Create the new policy that allows admins to delete any product
CREATE POLICY "Admins can delete any product, creators can delete their own" 
ON "products" FOR DELETE
USING (user_is_admin_or_owns_product(created_by));