-- Function to add app_role to JWT
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
  declare
    claims jsonb;
    user_app_role text;
  begin
    -- Fetch the user role from your profiles table
    -- Note: 'user_id' is the column name in Supabase Auth
    select app_role::text into user_app_role 
    from public.profiles 
    where auth_user_id = (event->>'user_id')::uuid;
    
    claims := event->'claims';
    if user_app_role is not null then
      -- Set the claim
      claims := jsonb_set(claims, '{app_role}', to_jsonb(user_app_role));
    else
      claims := jsonb_set(claims, '{app_role}', '"USER"');
    end if;
    
    -- Update the claims object in the event
    event := jsonb_set(event, '{claims}', claims);
    return event;
  end;
$$;

-- Set appropriate permissions
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;