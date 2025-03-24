[
  {
    "policy_script": "DROP POLICY IF EXISTS \"Admin, Staff, and Members can view memberships\" ON public.memberships;\nCREATE POLICY \"Admin, Staff, and Members can view memberships\" ON public.memberships\n    FOR \n    TO PUBLIC\n    USING ((( SELECT profiles.app_role\n   FROM profiles\n  WHERE (profiles.auth_user_id = (auth.uid())::text)) = ANY (ARRAY['ADMIN'::\"AppRole\", 'STAFF'::\"AppRole\", 'MEMBER'::\"AppRole\"])))\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Any authenticated user can create a membership\" ON public.memberships;\nCREATE POLICY \"Any authenticated user can create a membership\" ON public.memberships\n    FOR \n    TO PUBLIC\n    \n    WITH CHECK ((profile_id IN ( SELECT profiles.id\n   FROM profiles\n  WHERE (profiles.auth_user_id = (auth.uid())::text))));"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Users can delete memberships they control\" ON public.memberships;\nCREATE POLICY \"Users can delete memberships they control\" ON public.memberships\n    FOR \n    TO PUBLIC\n    USING ((((profile_id IN ( SELECT profiles.id\n   FROM profiles\n  WHERE (profiles.auth_user_id = (auth.uid())::text))) AND (( SELECT (profiles.app_role)::text AS app_role\n   FROM profiles\n  WHERE (profiles.auth_user_id = (auth.uid())::text)) = 'MEMBER'::text)) OR (( SELECT (profiles.app_role)::text AS app_role\n   FROM profiles\n  WHERE (profiles.auth_user_id = (auth.uid())::text)) = ANY (ARRAY['ADMIN'::text, 'STAFF'::text]))))\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Anyone can read products\" ON public.products;\nCREATE POLICY \"Anyone can read products\" ON public.products\n    FOR \n    TO PUBLIC\n    USING (((auth.uid())::text IS NOT NULL))\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Creators can delete their products\" ON public.products;\nCREATE POLICY \"Creators can delete their products\" ON public.products\n    FOR \n    TO PUBLIC\n    USING (user_owns_product(created_by))\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Creators can update their products\" ON public.products;\nCREATE POLICY \"Creators can update their products\" ON public.products\n    FOR \n    TO PUBLIC\n    USING (user_owns_product(created_by))\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Staff and admin can create products\" ON public.products;\nCREATE POLICY \"Staff and admin can create products\" ON public.products\n    FOR \n    TO PUBLIC\n    \n    WITH CHECK (user_has_role(ARRAY['ADMIN'::text, 'STAFF'::text]));"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Admin and Staff can update any profile\" ON public.profiles;\nCREATE POLICY \"Admin and Staff can update any profile\" ON public.profiles\n    FOR \n    TO PUBLIC\n    USING ((( SELECT (profiles_1.app_role)::text AS app_role\n   FROM profiles profiles_1\n  WHERE (profiles_1.auth_user_id = (auth.uid())::text)) = ANY (ARRAY['ADMIN'::text, 'STAFF'::text])))\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Auth hook can access all profiles\" ON public.profiles;\nCREATE POLICY \"Auth hook can access all profiles\" ON public.profiles\n    FOR \n    TO PUBLIC\n    USING (true)\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Service role can access all profiles\" ON public.profiles;\nCREATE POLICY \"Service role can access all profiles\" ON public.profiles\n    FOR \n    TO PUBLIC\n    USING (true)\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Users can read their own profile\" ON public.profiles;\nCREATE POLICY \"Users can read their own profile\" ON public.profiles\n    FOR \n    TO PUBLIC\n    USING ((auth_user_id = (auth.uid())::text))\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Users can update their own profile\" ON public.profiles;\nCREATE POLICY \"Users can update their own profile\" ON public.profiles\n    FOR \n    TO PUBLIC\n    USING ((auth_user_id = (auth.uid())::text))\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Admin and Staff can delete any purchase\" ON public.purchases;\nCREATE POLICY \"Admin and Staff can delete any purchase\" ON public.purchases\n    FOR \n    TO PUBLIC\n    USING ((EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.auth_user_id = (auth.uid())::text) AND ((profiles.app_role)::text = ANY (ARRAY['ADMIN'::text, 'STAFF'::text]))))))\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Admin and Staff can view all purchases\" ON public.purchases;\nCREATE POLICY \"Admin and Staff can view all purchases\" ON public.purchases\n    FOR \n    TO PUBLIC\n    USING ((( SELECT profiles.app_role\n   FROM profiles\n  WHERE (profiles.auth_user_id = (auth.uid())::text)) = ANY (ARRAY['ADMIN'::\"AppRole\", 'STAFF'::\"AppRole\"])))\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Users can access their own purchases via function\" ON public.purchases;\nCREATE POLICY \"Users can access their own purchases via function\" ON public.purchases\n    FOR \n    TO PUBLIC\n    USING (user_has_profile(profile_id))\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Users can create purchases for their own profile\" ON public.purchases;\nCREATE POLICY \"Users can create purchases for their own profile\" ON public.purchases\n    FOR \n    TO PUBLIC\n    \n    WITH CHECK ((profile_id IN ( SELECT profiles.id\n   FROM profiles\n  WHERE (profiles.auth_user_id = (auth.uid())::text))));"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Users can delete their own purchases\" ON public.purchases;\nCREATE POLICY \"Users can delete their own purchases\" ON public.purchases\n    FOR \n    TO PUBLIC\n    USING ((profile_id IN ( SELECT profiles.id\n   FROM profiles\n  WHERE (profiles.auth_user_id = (auth.uid())::text))))\n    ;"
  },
  {
    "policy_script": "DROP POLICY IF EXISTS \"Users can view their own purchases\" ON public.purchases;\nCREATE POLICY \"Users can view their own purchases\" ON public.purchases\n    FOR \n    TO PUBLIC\n    USING ((profile_id IN ( SELECT profiles.id\n   FROM profiles\n  WHERE (profiles.auth_user_id = (auth.uid())::text))))\n    ;"
  }
]