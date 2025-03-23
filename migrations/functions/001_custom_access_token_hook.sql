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