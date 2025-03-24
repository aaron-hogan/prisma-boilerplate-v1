-- migrations/rls/04_purchases.sql
-- RLS policies for purchases table

-- Drop existing policies
DROP POLICY IF EXISTS "Admin and Staff can view all purchases" ON "purchases";
DROP POLICY IF EXISTS "Users can create purchases for their own profile" ON "purchases";
DROP POLICY IF EXISTS "Users can view their own purchases" ON "purchases";
DROP POLICY IF EXISTS "Users can delete their own purchases" ON "purchases";
DROP POLICY IF EXISTS "Admin and Staff can delete any purchase" ON "purchases";

-- Make sure RLS is enabled
ALTER TABLE "purchases" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own purchases"
ON "purchases" FOR SELECT
USING (
  profile_id IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.auth_user_id = auth.uid()::text
  )
)
TO authenticated;

CREATE POLICY "Admin and Staff can view all purchases"
ON "purchases" FOR SELECT
USING (
  (SELECT profiles.app_role
   FROM profiles
   WHERE profiles.auth_user_id = auth.uid()::text) = ANY (ARRAY['ADMIN'::\"AppRole\", 'STAFF'::\"AppRole\"])
)
TO authenticated;

CREATE POLICY "Users can create purchases for their own profile"
ON "purchases" FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.auth_user_id = auth.uid()::text
  )
);

CREATE POLICY "Users can delete their own purchases"
ON "purchases" FOR DELETE
USING (
  profile_id IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.auth_user_id = auth.uid()::text
  )
);

CREATE POLICY "Admin and Staff can delete any purchase"
ON "purchases" FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.auth_user_id = auth.uid()::text
    AND profiles.app_role::text = ANY (ARRAY['ADMIN'::text, 'STAFF'::text])
  )
);

-- Make sure we have indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchases_profile_id ON purchases(profile_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);