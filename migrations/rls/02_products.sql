-- migrations/rls/02_products.sql
-- RLS policies for products table

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read products" ON "products";
DROP POLICY IF EXISTS "Creators can update their products" ON "products";
DROP POLICY IF EXISTS "Creators can delete their products" ON "products";
DROP POLICY IF EXISTS "Staff and admin can create products" ON "products";

-- Make sure RLS is enabled
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read products" 
ON "products" FOR SELECT 
USING (auth.uid()::text IS NOT NULL);

CREATE POLICY "Staff and admin can create products"
ON "products" FOR INSERT
WITH CHECK (user_has_role(ARRAY['ADMIN'::text, 'STAFF'::text]));

CREATE POLICY "Creators can update their products"
ON "products" FOR UPDATE
USING (user_owns_product(created_by));

CREATE POLICY "Creators can delete their products"
ON "products" FOR DELETE
USING (user_owns_product(created_by));

-- Make sure we have the index for performance
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);