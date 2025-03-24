-- Create a function to safely check if a product has been purchased
CREATE OR REPLACE FUNCTION public.has_product_been_purchased(product_id_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Run with definer's privileges for consistent access
AS $$
DECLARE
  purchase_count integer;
BEGIN
  -- Count purchases for this product
  SELECT COUNT(*) INTO purchase_count 
  FROM purchases 
  WHERE product_id = product_id_param;
  
  -- Return true if there are any purchases, false otherwise
  RETURN purchase_count > 0;
END;
$$;

-- Grant execution privileges to authenticated users
GRANT EXECUTE ON FUNCTION public.has_product_been_purchased(text) TO authenticated;

-- Add an additional layer of protection with a trigger
CREATE OR REPLACE FUNCTION prevent_delete_purchased_products()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the product being deleted has purchases
  IF EXISTS (SELECT 1 FROM purchases WHERE product_id = OLD.id) THEN
    RAISE EXCEPTION 'Cannot delete product that has been purchased'
      USING HINT = 'Create a new version instead of deleting existing products';
  END IF;
  
  -- Allow the deletion to proceed if no purchases exist
  RETURN OLD;
END;
$$;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'prevent_delete_purchased_products_trigger'
  ) THEN
    CREATE TRIGGER prevent_delete_purchased_products_trigger
    BEFORE DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION prevent_delete_purchased_products();
  END IF;
END
$$;