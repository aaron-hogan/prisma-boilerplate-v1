-- migrations/rls/03_memberships.sql
-- RLS policies for memberships table
-- Drop existing policies
drop policy IF exists "Admin, Staff, and Members can view memberships" on "memberships";

drop policy IF exists "Any authenticated user can create a membership" on "memberships";

drop policy IF exists "Users can delete memberships they control" on "memberships";

-- Make sure RLS is enabled
alter table "memberships" ENABLE row LEVEL SECURITY;

-- Create policies
create policy "Admin, Staff, and Members can view memberships" on "memberships" for
select
  using (
    (
      select
        profiles.app_role
      from
        profiles
      where
        profiles.auth_user_id = auth.uid ()::text
    ) = any (
      array[
        'ADMIN'::"AppRole",
        'STAFF'::"AppRole",
        'MEMBER'::"AppRole"
      ]
    )
  );

create policy "Any authenticated user can create a membership" on "memberships" for INSERT
with
  check (
    profile_id in (
      select
        profiles.id
      from
        profiles
      where
        profiles.auth_user_id = auth.uid ()::text
    )
  );

create policy "Users can delete memberships they control" on "memberships" for DELETE using (
  (
    profile_id in (
      select
        profiles.id
      from
        profiles
      where
        profiles.auth_user_id = auth.uid ()::text
    )
    and (
      select
        profiles.app_role::text
      from
        profiles
      where
        profiles.auth_user_id = auth.uid ()::text
    ) = 'MEMBER'
  )
  or (
    select
      profiles.app_role::text
    from
      profiles
    where
      profiles.auth_user_id = auth.uid ()::text
  ) = any (array['ADMIN', 'STAFF'])
);