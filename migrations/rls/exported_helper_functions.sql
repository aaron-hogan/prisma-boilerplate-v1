[
  {
    "function_creation_script": "CREATE OR REPLACE FUNCTION public.user_owns_product(product_created_by text)\n        RETURNS boolean\n        LANGUAGE sql\n        SECURITY DEFINER\n        VOLATILE\n        AS $function$\n        \n  SELECT EXISTS (\n    SELECT 1 FROM profiles\n    WHERE profiles.auth_user_id = auth.uid()::text\n    AND profiles.id::text = product_created_by::text\n  );\n\n        $function$;"
  },
  {
    "function_creation_script": "CREATE OR REPLACE FUNCTION public.user_has_role(required_roles text[])\n        RETURNS boolean\n        LANGUAGE sql\n        SECURITY DEFINER\n        VOLATILE\n        AS $function$\n        \n  SELECT EXISTS (\n    SELECT 1 FROM profiles\n    WHERE profiles.auth_user_id = auth.uid()::text\n    AND profiles.app_role::text = ANY(required_roles)\n  );\n\n        $function$;"
  },
  {
    "function_creation_script": "CREATE OR REPLACE FUNCTION public.user_has_profile(profile_id_param text)\n        RETURNS boolean\n        LANGUAGE sql\n        SECURITY DEFINER\n        VOLATILE\n        AS $function$\n        \n  SELECT EXISTS (\n    SELECT 1 FROM profiles\n    WHERE profiles.auth_user_id = auth.uid()::text\n    AND profiles.id::text = profile_id_param\n  );\n\n        $function$;"
  }
]